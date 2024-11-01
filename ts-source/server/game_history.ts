/*
Elo rating for a Chess Club
Copyright (C) 2023 - 2024  Lluís Alemany Puig

This program is free software: you can redistribute it and/or modify
it under the terms of the GNU Affero General Public License as published
by the Free Software Foundation, either version 3 of the License, or
(at your option) any later version.

This program is distributed in the hope that it will be useful,
but WITHOUT ANY WARRANTY; without even the implied warranty of
MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
GNU Affero General Public License for more details.

You should have received a copy of the GNU Affero General Public License
along with this program.  If not, see <https://www.gnu.org/licenses/>.

Contact:
	Lluís Alemany Puig
	https://github.com/lluisalemanypuig
*/

import { assert } from 'console';
import path from 'path';
import fs from 'fs';
import Debug from 'debug';
const debug = Debug('ELO_TRACKER:server_game_history');

import { Player } from '../models/player';
import { Game, GameResult, game_set_from_json } from '../models/game';
import { User } from '../models/user';
import { log_now, search, where_should_be_inserted, long_date_to_short_date, number_to_string, linear_find } from '../utils/misc';
import { RatingSystem, ServerEnvironment, ServerMemory } from './configuration';
import { user_retrieve, user_update_from_players_data } from './users';
import { Rating } from '../rating_system/rating';
import { TimeControlRating } from '../models/time_control_rating';

/// Returns g1 < g2 using dates
function game_compare_dates(g1: Game, g2: Game): number {
	if (g1.get_date() < g2.get_date()) { return -1; }
	if (g1.get_date() == g2.get_date()) { return 0; }
	return 1;
}

function make_game_date_record_name_str(when: string): string {
	return long_date_to_short_date(when);
}

function make_game_date_record_name(g: Game): string {
	return make_game_date_record_name_str(g.get_date());
}

function read_game_date_record(game_record_name: string): Game[] {
	debug(log_now(), `Read game record file '${game_record_name}'...`);
	const data = fs.readFileSync(game_record_name, 'utf8');
	debug(log_now(), `    Game record '${game_record_name}' read.`);
	return game_set_from_json(data);
}

/// Creates a new game with no players using the parameters given
export function game_new(
	white: string, black: string,
	result: GameResult,
	time_control_id: string, time_control_name: string,
	when: string

): Game
{
	// retrieve next id and increment maximum id
	const id_number = ServerMemory.get_instance().new_max_game_id();
	const id_str = number_to_string(id_number);
	debug(log_now(), `ID for new game: ${id_str}`);
	
	let white_to_assign: Rating;
	let black_to_assign: Rating;

	{
	// get white's next game in the history
	let next = game_next_of_player(white, time_control_id, when);
	if (next != null) {
		if (next.get_white() == white) {
			// white in this game is also white in the next game
			white_to_assign = next.get_white_rating().clone();
		}
		else {
			// white in this game is black in the next game
			white_to_assign = next.get_black_rating().clone();
		}
	}
	else {
		// there is no next game for white
		white_to_assign =
			(user_retrieve(white) as User).get_rating(time_control_id).clone();
	}
	}

	{
	// get black's next game in the history
	let next = game_next_of_player(black, time_control_id, when);
	if (next != null) {
		if (next.get_white() == black) {
			// white in this game is white in the next game
			black_to_assign = next.get_white_rating().clone();
		}
		else {
			// black in this game is also black in the next game
			black_to_assign = next.get_black_rating().clone();
		}
	}
	else {
		black_to_assign =
			(user_retrieve(black) as User).get_rating(time_control_id).clone();
	}
	}

	return new Game(
		id_str,
		white, white_to_assign,
		black, black_to_assign,
		result,
		time_control_id, time_control_name,
		when
	);
}

/// Return the game where player 'username' is involved with
/// date after later than date 'when'.
function game_next_of_player(
	username: string,
	time_control_id: string,
	when: string

): Game | null {

	debug(log_now(), `Find the game of user '${username}' right after date '${when}'`);

	const games_dir = ServerEnvironment.get_instance().games_directory;

	// The file into which we have to add the new game.
	const date_record_str = make_game_date_record_name_str(when);
	debug(log_now(), `    Date: '${date_record_str}'`);
	
	// The files currently existing in the 'games_directory'
	debug(log_now(), `Reading directory '${games_dir}'...`);
	const all_date_record_strs = fs.readdirSync(games_dir);
	debug(log_now(), `    Directory contents: '${all_date_record_strs}'`);

	// There are no game records. There is no next game
	if (all_date_record_strs.length == 0) { return null; }

	// Does the record corresponding to the game exist?
	let [idx_in_date_record_list, record_exists] =
		where_should_be_inserted(all_date_record_strs, date_record_str);

	// there is no next game
	if (idx_in_date_record_list == all_date_record_strs.length) { return null; }

	if (record_exists) {
		// Insert the current game in an existing record and update
		// the games ahead of this game

		const date_record_file: string = path.join(games_dir, date_record_str);
		debug(log_now(), `Inspecting existing record '${date_record_file}'...`);
		let game_set = read_game_date_record(date_record_file);

		debug(log_now(), `    Record contains: '${game_set.map(function(elem): string { return elem.get_date(); })}'`);
		debug(log_now(), `    Look for a game with date '${when}'`);

		// where should the current game be inserted
		let [game_idx, game_exists] = where_should_be_inserted(
			// convert each game into a string
			game_set.map(function(elem): string { return elem.get_date(); }), when
		);

		debug(log_now(), `    Game exists? '${game_exists}'. At '${game_idx}'`);

		assert(!game_exists);

		// try to find the game in the game set
		for (let i = game_idx; i < game_set.length; ++i) {
			if (game_set[i].is_user_involved(username) && game_set[i].get_time_control() == time_control_id) {
				return game_set[i];
			}
		}
		
		// if the record already exists then 'record_index_in_list' points
		// to the current game record, but we should update starting at the
		// next record!
		++idx_in_date_record_list;
	}

	debug(log_now(), "Inspecting the rest of the records...");
	for (let idx = idx_in_date_record_list; idx < all_date_record_strs.length; ++idx) {
		const date_record_str = all_date_record_strs[idx];

		// files already contain the '.json' extension
		const date_record_file = path.join(games_dir, date_record_str);

		// read and parse the next file
		let game_set = read_game_date_record(date_record_file);

		for (let i = 0; i < game_set.length; ++i) {
			if (game_set[i].is_user_involved(username) &&
				game_set[i].get_time_control() == time_control_id
			)
			{
				return game_set[i];
			}
		}
	}

	// no 'next' game was found
	return null;
}

function updated_player(time_control_id: string, player: string, rating: Rating): Player {
	let p = (user_retrieve(player) as User).clone();
	p.set_rating(time_control_id, rating);
	return p;
}

/// Updates the given game record
function update_game_record(
	game_set: Game[],
	start_at: number,
	time_control_id: string,
	updated_players: Player[],
	player_to_index: Map<string, number>

): void
{
	const was_updated =
		(username: string): boolean => { return player_to_index.has(username); };

	for (let i = start_at; i < game_set.length; ++i) {
		if (game_set[i].get_time_control() != time_control_id) { continue; }

		debug(log_now(), `    Updating game '${i}'`);

		const white = game_set[i].get_white();
		const black = game_set[i].get_black();

		const white_rating = game_set[i].get_white_rating();
		const black_rating = game_set[i].get_black_rating();

		// were White or Black updated in previous iterations?
		const white_was_updated = was_updated(white);
		const black_was_updated = was_updated(black);

		const white_idx = player_to_index.get(white);
		const black_idx = player_to_index.get(black);

		// set the player information in the game to the most updated version
		if (white_was_updated) {
			debug(log_now(), `    White rating in the game: ${JSON.stringify(white_rating)}`);
			debug(log_now(), `        White updated: ${JSON.stringify(updated_players[white_idx as number])}`);
			game_set[i].set_white_rating( updated_players[white_idx as number].get_rating(time_control_id).clone() );
			debug(log_now(), `        White in the game: ${JSON.stringify(game_set[i].get_white_rating())}`);
		}
		if (black_was_updated) {
			debug(log_now(), `    Black in the game: ${JSON.stringify(black_rating)}`);
			debug(log_now(), `        Black updated: ${JSON.stringify(updated_players[black_idx as number])}`);
			game_set[i].set_black_rating( updated_players[black_idx as number].get_rating(time_control_id).clone() );
			debug(log_now(), `        Black in the game: ${JSON.stringify(game_set[i].get_black_rating())}`);
		}

		if (white_was_updated || black_was_updated) {
			// calculate result of game
			const [white_after, black_after] = RatingSystem.get_instance().apply_rating_formula(game_set[i]);

			if (!white_was_updated) {
				debug(log_now(), `    White has been updated for the first time: ${JSON.stringify(white_after)}`);

				// White has been updated in this game for the first time:
				// - should be updated in future games
				// - should be inserted into the 'updated_players' set
				updated_players.push(updated_player(time_control_id, white, white_after));
				player_to_index.set(white, updated_players.length - 1);
			}
			else {
				updated_players[white_idx as number] = updated_player(time_control_id, white, white_after);
			}

			if (!black_was_updated) {
				debug(log_now(), `    Black has been updated for the first time: ${JSON.stringify(black_after)}`);

				// Black has been updated in this game for the first time:
				// - should be updated in future games
				// - should be inserted into the 'updated_players' set
				updated_players.push(updated_player(time_control_id, black, black_after));
				player_to_index.set(black, updated_players.length - 1);
			}
			else {
				updated_players[black_idx as number] = updated_player(time_control_id, black, black_after);
			}
		}
	}
}

/**
 * @brief Inserts a game into the entire history
 * @param game Game to be inserted
 * @param date_record_str The file into which we have to add the new game
 * @post Users in the server are update (both memory and user files)
 */
function game_insert_in_history(game: Game, date_record_str: string): void
{
	// some player's rating will change and will have to be updated
	let updated_players: Player[] = [];

	// apply rating formula
	{
	let [white_after, black_after] = RatingSystem.get_instance().apply_rating_formula(game);
	updated_players.push(updated_player(game.get_time_control_id(), game.get_white(), white_after));
	updated_players.push(updated_player(game.get_time_control_id(), game.get_black(), black_after));
	}

	const games_dir = ServerEnvironment.get_instance().games_directory;

	debug(log_now(), "Adding game into the history...");
	debug(log_now(), `    Game '${JSON.stringify(game)}'`);

	debug(log_now(), `    Game record string: '${date_record_str}'`);
	const date_record_file: string = path.join(games_dir, date_record_str);
	debug(log_now(), `    File: '${date_record_file}'`);

	// The files currently existing in the 'games_directory'
	debug(log_now(), `Reading directory '${games_dir}'...`);
	const all_date_record_strs = fs.readdirSync(games_dir);
	debug(log_now(), `    Directory contents: '${all_date_record_strs}'`);

	// There are no game records. Create the file and dump the game into it.
	if (all_date_record_strs.length == 0) {
		debug(log_now(), "There are no game records.");
		debug(log_now(), `Simply write into file '${date_record_file}'`);
		fs.writeFileSync(date_record_file, JSON.stringify([game], null, 4), { flag: 'w' });

		// update the players in the server memory
		user_update_from_players_data(updated_players);
		return;
	}

	debug(log_now(), `Find '${date_record_str}' in '${all_date_record_strs}'`);
	// Does the record corresponding to the game exist?
	let [idx_in_record_list, record_exists] =
		where_should_be_inserted(all_date_record_strs, date_record_str);

	if (!record_exists) {
		debug(log_now(), `    There is no record with date '${date_record_str}'`);
		debug(log_now(), `    The new record should be placed at '${idx_in_record_list}'`);
	}
	else {
		debug(log_now(), `    There is a record with date '${date_record_str}'`);
		debug(log_now(), `    The new record is at '${idx_in_record_list}'`);
	}

	if (!record_exists) {
		debug(log_now(), `Writing game into game record file '${date_record_file}'...`);

		// The file does not exist. Create the file and dump the game into it.
		fs.writeFileSync(date_record_file, JSON.stringify([game], null, 4), { flag: 'w' });
	}

	// The record file did not exist => no games on that day
	// The record file is the last => no games ahead of this one
	// ==> Update user in their files and server memory
	if (!record_exists && idx_in_record_list == all_date_record_strs.length) {
		debug(log_now(), "The game has been inserted into the last game record file");
		// update the players in the server memory
		user_update_from_players_data(updated_players);
		return;
	}

	let player_to_index: Map<string, number> = new Map();
	player_to_index.set(game.get_white(), 0);
	player_to_index.set(game.get_black(), 1);

	if (record_exists) {
		// Insert the current game in an existing record and update
		// the games ahead of this game

		debug(log_now(), `Update existing record '${date_record_file}'...`);

		let game_set = read_game_date_record(date_record_file);

		// where should the current game be inserted
		const [game_idx, game_exists] = where_should_be_inserted(game_set, game, game_compare_dates);

		// The game should not exist in its record.
		// This assumes that different games will never
		// have the exact same 'when'.
		assert(!game_exists);

		// insert game into array
		game_set.splice(game_idx, 0, game);

		debug(log_now(), `    Update game record '${date_record_str}'`);

		// update record of the current game
		update_game_record(game_set, game_idx + 1, game.get_time_control_id(), updated_players, player_to_index);

		debug(log_now(), `    Writing game record '${date_record_file}'...`);
		fs.writeFileSync(date_record_file, JSON.stringify(game_set, null, 4), { flag: 'w' });
		debug(log_now(), `        Game record '${date_record_file}' written.`);

		// if the record already exists then 'record_index_in_list' points
		// to the current game record, but we should update starting at the
		// next record!
		++idx_in_record_list;
	}

	debug(log_now(), "Update the rest of the records...");
	for (let idx = idx_in_record_list; idx < all_date_record_strs.length; ++idx) {
		const record_string = all_date_record_strs[idx];

		// files already contain the '.json' extension
		const date_record_file = path.join(games_dir, record_string);

		// read and parse the next file
		let game_set = read_game_date_record(date_record_file);

		// update the current record
		debug(log_now(), `    Updating game record '${date_record_file}'...`);
		update_game_record(game_set, 0, game.get_time_control_id(), updated_players, player_to_index);
		debug(log_now(), `        Number of updated players: '${updated_players.length}'...`);
		for (let j = 0; j < updated_players.length; ++j) {
		debug(log_now(), `        Player: '${JSON.stringify(updated_players[j])}'...`);
		}

		// update the record file
		debug(log_now(), `    Writing game record '${date_record_file}'...`);
		fs.writeFileSync(date_record_file, JSON.stringify(game_set, null, 4), { flag: 'w' });
		debug(log_now(), `        Game record '${date_record_file}' written.`);
	}

	user_update_from_players_data(updated_players);
}

/**
 * @brief Add a game to the server
 * @param g Game
 */
export function game_add(g: Game): void {
	debug(log_now(), `Add game into the list of games played by both users...`);
	
	const when = make_game_date_record_name(g);
	(user_retrieve(g.get_white()) as User).add_game(when);
	(user_retrieve(g.get_black()) as User).add_game(when);
	
	debug(log_now(), `Inserting the game into the history...`);
	game_insert_in_history(g, when);
	debug(log_now(), `Updating the hash table (game id -> game record)`);
	ServerMemory.get_instance().set_game_id_record_date(g.get_id(), when);
}

export function game_find_by_id(game_id: string): [string[], string, Game[], number, number] | null {
	const __date_record_str = ServerMemory.get_instance().get_game_id_record_date(game_id);
	// game_id does not exist
	if (__date_record_str == null) {
		return null;
	}
	const date_record_str = __date_record_str as string;

	const games_dir = ServerEnvironment.get_instance().games_directory;
	const date_record_filename: string = path.join(games_dir, date_record_str);
	debug(log_now(), `    File: '${date_record_filename}'`);

	// The files currently existing in the 'games_directory'
	debug(log_now(), `Reading directory '${games_dir}'...`);
	const all_date_records = fs.readdirSync(games_dir);
	debug(log_now(), `    Directory contents: '${all_date_records}'`);

	// Ensure there are game records
	assert(all_date_records.length != 0);

	// check that the file actually exists
	debug(log_now(), `Searching '${date_record_str}' in '${all_date_records}'.`);
	const idx_in_record_list = search(all_date_records, date_record_str);
	assert(idx_in_record_list != -1);

	// read games in record
	const game_set = read_game_date_record(date_record_filename);

	// find the game 'game_id' in the array 'game_set' and check that it exists
	const game_idx_in_game_set = linear_find(game_set, (g: Game): boolean => { return g.get_id() == game_id });
	assert(game_idx_in_game_set < game_set.length);

	const game = game_set[game_idx_in_game_set];
	assert(game.get_id() == game_id);

	return [all_date_records, date_record_filename, game_set, idx_in_record_list, game_idx_in_game_set];
}

/**
 * @brief Edit a game
 * @param game_id The ID of the game to edit
 * @param new_result The (new) result of the game
 */
export function game_edit_result(game_id: string, new_result: GameResult): void {
	const games_dir = ServerEnvironment.get_instance().games_directory;

	debug(log_now(), `Editing game '${game_id}'`);

	const r = game_find_by_id(game_id);
	if (r == null) { return; }
	let [record_name_list, game_record_filename, game_set, idx_in_record_list, idx_in_game_set]
		= r as [string[], string, Game[], number, number];

	let game = game_set[idx_in_game_set];

	// ---------------------------------------------------------
	// actually apply changes

	game.set_result(new_result);

	// some games will change and users will have to be updated
	let updated_players: Player[] = [];

	// apply rating formula
	{
	let [white_after, black_after] = RatingSystem.get_instance().apply_rating_formula(game);
	updated_players.push(updated_player(game.get_time_control_id(), game.get_white(), white_after));
	updated_players.push(updated_player(game.get_time_control_id(), game.get_black(), black_after));
	}

	let player_to_index: Map<string, number> = new Map();
	player_to_index.set(game.get_white(), 0);
	player_to_index.set(game.get_black(), 1);

	// update record of the current game
	update_game_record(game_set, idx_in_game_set + 1, game.get_time_control_id(), updated_players, player_to_index);
	debug(log_now(), `    Writing game record '${game_record_filename}'...`);
	fs.writeFileSync(game_record_filename, JSON.stringify(game_set, null, 4), { flag: 'w' });
	debug(log_now(), `        Game record '${game_record_filename}' written.`);

	debug(log_now(), "Update the rest of the records...");
	for (let idx = idx_in_record_list + 1; idx < record_name_list.length; ++idx) {
		const record_name = record_name_list[idx];

		// files already contain the '.json' extension
		const game_record_filename = path.join(games_dir, record_name);

		// read and parse the next file
		const game_set = read_game_date_record(game_record_filename);

		// update the current record
		debug(log_now(), `    Updating game record '${game_record_filename}'...`);
		update_game_record(game_set, 0, game.get_time_control_id(), updated_players, player_to_index);
		debug(log_now(), `        Number of updated players: '${updated_players.length}'...`);
		for (let j = 0; j < updated_players.length; ++j) {
		debug(log_now(), `        Player: '${JSON.stringify(updated_players[j])}'...`);
		}

		// update the record file
		debug(log_now(), `    Writing game record '${game_record_filename}'...`);
		fs.writeFileSync(game_record_filename, JSON.stringify(game_set, null, 4), { flag: 'w' });
		debug(log_now(), `        Game record '${game_record_filename}' written.`);
	}

	user_update_from_players_data(updated_players);
}

export function recalculate_Elo_ratings() {
	const games_dir = ServerEnvironment.get_instance().games_directory;
	const all_time_controls = RatingSystem.get_instance().get_time_controls();

	// initialize all players to a freshly created player
	let updated_players: Player[] = [];
	let player_to_index: Map<string, number> = new Map();
	{
	let mem = ServerMemory.get_instance();
	for (let i = 0; i < mem.num_users(); ++i) {
		const username = mem.get_user(i).get_username();

		let ratings: TimeControlRating[] = [];
		// update the current record for all time controls
		for (let k = 0; k < all_time_controls.length; ++k) {
			let tcr = new TimeControlRating(
				all_time_controls[k].id,
				RatingSystem.get_instance().get_new_rating()
			);
			ratings.push(tcr);
		}

		updated_players.push(new Player(username, ratings));
		player_to_index.set(username, i);
	}
	}

	// The files currently existing in the 'games_directory'
	debug(log_now(), `Reading directory '${games_dir}'...`);
	const record_name_list = fs.readdirSync(games_dir);
	debug(log_now(), `    Directory contents: '${record_name_list}'`);

	for (let i = 0; i < record_name_list.length; ++i) {
		const record_name = record_name_list[i];

		// files already contain the '.json' extension
		const game_record_filename = path.join(games_dir, record_name);

		// read and parse the next file
		const game_set = read_game_date_record(game_record_filename);

		
		// update the current record for all time controls
		for (let k = 0; k < all_time_controls.length; ++k) {
			const time_control = all_time_controls[k];

			debug(log_now(), `    Updating game record '${game_record_filename}'...`);
			update_game_record(game_set, 0, time_control.id, updated_players, player_to_index);
			debug(log_now(), `        Number of updated players: '${updated_players.length}'...`);
				for (let j = 0; j < updated_players.length; ++j) {
				debug(log_now(), `        Player: '${JSON.stringify(updated_players[j])}'...`);
			}
		}

		// update the record file
		debug(log_now(), `    Writing game record '${game_record_filename}'...`);
		fs.writeFileSync(game_record_filename, JSON.stringify(game_set, null, 4), { flag: 'w' });
		debug(log_now(), `        Game record '${game_record_filename}' written.`);
	}

	user_update_from_players_data(updated_players);
}
