/*
Elo rating for a Chess Club
Copyright (C) 2023 - 2025  Lluís Alemany Puig

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

Full source code of elo-chess-tracker:
	https://github.com/lluisalemanypuig/elo-chess-tracker

Contact:
	Lluís Alemany Puig
	https://github.com/lluisalemanypuig
*/

import path from 'path';
import fs from 'fs';
import Debug from 'debug';
const debug = Debug('ELO_TRACKER:server_game_history');

import { DateStringLongMillis, DateStringShort, log_now, long_date_to_short_date } from '../utils/time';
import { Player } from '../models/player';
import { Game, GameID, GameResult, game_set_from_json } from '../models/game';
import { User } from '../models/user';
import {
	search,
	where_should_be_inserted,
	search_linear_by_key,
	where_should_be_inserted_by_key
} from '../utils/searching';
import { GamesManager } from './games_manager';
import { UsersManager } from './users_manager';
import { RatingSystemManager } from './rating_system_manager';
import { EnvironmentManager } from './environment_manager';
import { user_retrieve, user_update_from_players_data } from './users';
import { Rating } from '../rating_framework/rating';
import { TimeControlRating } from '../models/time_control_rating';
import { TimeControlID } from '../models/time_control';
import { graph_update } from './graphs';

/// Returns g1 < g2 using dates
function game_compare_dates(g1: Game, g2: Game): number {
	if (g1.get_date() < g2.get_date()) {
		return -1;
	}
	if (g1.get_date() == g2.get_date()) {
		return 0;
	}
	return 1;
}

function read_game_date_record(game_record_id: DateStringShort): Game[] {
	debug(log_now(), `Read game record file '${game_record_id}'...`);
	const data = fs.readFileSync(game_record_id, 'utf8');
	debug(log_now(), `    Game record '${game_record_id}' read.`);
	return game_set_from_json(data);
}

/// Creates a new game with no players using the parameters given
function game_new(
	white: string,
	black: string,
	result: GameResult,
	time_control_id: TimeControlID,
	time_control_name: string,
	when: DateStringLongMillis
): Game {
	// retrieve next id and increment maximum id
	const id_str: GameID = GamesManager.get_instance().new_game_id();
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
			} else {
				// white in this game is black in the next game
				white_to_assign = next.get_black_rating().clone();
			}
		} else {
			// there is no next game for white
			const white_user = user_retrieve(white);
			if (white_user == undefined) {
				throw new Error(`White user '${white}' is not in the users database`);
			}
			white_to_assign = (white_user as User).get_rating(time_control_id).clone();
		}
	}

	{
		// get black's next game in the history
		let next = game_next_of_player(black, time_control_id, when);
		if (next != null) {
			if (next.get_white() == black) {
				// white in this game is white in the next game
				black_to_assign = next.get_white_rating().clone();
			} else {
				// black in this game is also black in the next game
				black_to_assign = next.get_black_rating().clone();
			}
		} else {
			const black_user = user_retrieve(black);
			if (black_user == undefined) {
				throw new Error(`Black user '${black}' is not in the users database`);
			}
			black_to_assign = (black_user as User).get_rating(time_control_id).clone();
		}
	}

	return new Game(
		id_str,
		white,
		white_to_assign,
		black,
		black_to_assign,
		result,
		time_control_id,
		time_control_name,
		when
	);
}

/// Return the game where player 'username' is involved with
/// date after later than date 'when'.
function game_next_of_player(
	username: string,
	time_control_id: TimeControlID,
	when: DateStringLongMillis
): Game | null {
	debug(log_now(), `Find the game of user '${username}' right after date '${when}'`);

	const games_dir = EnvironmentManager.get_instance().get_dir_games_time_control(time_control_id);

	// The file into which we have to add the new game.
	const date_record_str = long_date_to_short_date(when);
	debug(log_now(), `    Date: '${date_record_str}'`);

	// The files currently existing in the 'games_directory'
	debug(log_now(), `Reading directory '${games_dir}'...`);
	const all_date_record_strs = fs.readdirSync(games_dir);
	debug(log_now(), `    Directory contents: '${all_date_record_strs}'`);

	// There are no game records. There is no next game
	if (all_date_record_strs.length == 0) {
		return null;
	}

	// Does the record corresponding to the game exist?
	let [idx_in_date_record_list, record_exists] = where_should_be_inserted(all_date_record_strs, date_record_str);

	// there is no next game
	if (idx_in_date_record_list == all_date_record_strs.length) {
		return null;
	}

	if (record_exists) {
		// Insert the current game in an existing record and update
		// the games ahead of this game

		const date_record_file: string = path.join(games_dir, date_record_str);
		debug(log_now(), `Inspecting existing record '${date_record_file}'...`);
		const game_set = read_game_date_record(date_record_file);

		debug(
			log_now(),
			`    Record contains: '${game_set.map(function (elem): string {
				return elem.get_date();
			})}'`
		);
		debug(log_now(), `    Look for a game with date '${when}'`);

		// where should the current game be inserted
		const [game_idx, game_exists] = where_should_be_inserted_by_key(
			// convert each game into a string
			game_set,
			when,
			(g: Game): string => {
				return g.get_date();
			},
			(when1: string, when2: string): number => {
				return when1.localeCompare(when2);
			}
		);

		debug(log_now(), `    Game exists? '${game_exists}'. At '${game_idx}'`);
		if (game_exists) {
			throw new Error(`Game already exists with date '${when}' at index ${game_idx}`);
		}

		// try to find the game in the game set
		for (let i = game_idx; i < game_set.length; ++i) {
			if (game_set[i].is_user_involved(username) && game_set[i].get_time_control_id() == time_control_id) {
				return game_set[i];
			}
		}

		// if the record already exists then 'record_index_in_list' points
		// to the current game record, but we should update starting at the
		// next record!
		++idx_in_date_record_list;
	}

	debug(log_now(), 'Inspecting the rest of the records...');
	for (let idx = idx_in_date_record_list; idx < all_date_record_strs.length; ++idx) {
		const date_record_str = all_date_record_strs[idx];

		// files already contain the '.json' extension
		const date_record_file = path.join(games_dir, date_record_str);

		// read and parse the next file
		const game_set = read_game_date_record(date_record_file);

		for (let i = 0; i < game_set.length; ++i) {
			if (game_set[i].is_user_involved(username) && game_set[i].get_time_control_id() == time_control_id) {
				return game_set[i];
			}
		}
	}

	// no 'next' game was found
	return null;
}

function updated_player(time_control_id: TimeControlID, player: string, rating: Rating): Player {
	let p = (user_retrieve(player) as User).clone();
	p.set_rating(time_control_id, rating);
	return p;
}

/// Updates the given game record
function update_game_record(
	game_set: Game[],
	start_at: number,
	time_control_id: TimeControlID,
	updated_players: Player[],
	player_to_index: Map<string, number>
): void {
	const was_updated = (username: string): boolean => {
		return player_to_index.has(username);
	};

	for (let i = start_at; i < game_set.length; ++i) {
		if (game_set[i].get_time_control_id() != time_control_id) {
			continue;
		}

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
			game_set[i].set_white_rating(updated_players[white_idx as number].get_rating(time_control_id).clone());
			debug(log_now(), `        White in the game: ${JSON.stringify(game_set[i].get_white_rating())}`);
		}
		if (black_was_updated) {
			debug(log_now(), `    Black in the game: ${JSON.stringify(black_rating)}`);
			debug(log_now(), `        Black updated: ${JSON.stringify(updated_players[black_idx as number])}`);
			game_set[i].set_black_rating(updated_players[black_idx as number].get_rating(time_control_id).clone());
			debug(log_now(), `        Black in the game: ${JSON.stringify(game_set[i].get_black_rating())}`);
		}

		if (white_was_updated || black_was_updated) {
			// calculate result of game
			const [white_after, black_after] = RatingSystemManager.get_instance().apply_rating_function(game_set[i]);

			if (!white_was_updated) {
				debug(log_now(), `    White has been updated for the first time: ${JSON.stringify(white_after)}`);

				// White has been updated in this game for the first time:
				// - should be updated in future games
				// - should be inserted into the 'updated_players' set
				updated_players.push(updated_player(time_control_id, white, white_after));
				player_to_index.set(white, updated_players.length - 1);
			} else {
				updated_players[white_idx as number] = updated_player(time_control_id, white, white_after);
			}

			if (!black_was_updated) {
				debug(log_now(), `    Black has been updated for the first time: ${JSON.stringify(black_after)}`);

				// Black has been updated in this game for the first time:
				// - should be updated in future games
				// - should be inserted into the 'updated_players' set
				updated_players.push(updated_player(time_control_id, black, black_after));
				player_to_index.set(black, updated_players.length - 1);
			} else {
				updated_players[black_idx as number] = updated_player(time_control_id, black, black_after);
			}
		}
	}
}

/**
 * @brief Inserts a game into the entire history
 * @param g Game to be inserted
 * @param record_id Game record id, the file into which we have to add the new game
 * @post Users in the server are update (both memory and user files)
 */
function game_insert_in_history(g: Game, record_id: DateStringShort): void {
	// some player's rating will change and will have to be updated
	let updated_players: Player[] = [];

	// apply rating formula
	{
		let [white_after, black_after] = RatingSystemManager.get_instance().apply_rating_function(g);
		updated_players.push(updated_player(g.get_time_control_id(), g.get_white(), white_after));
		updated_players.push(updated_player(g.get_time_control_id(), g.get_black(), black_after));
	}

	const games_dir = EnvironmentManager.get_instance().get_dir_games_time_control(g.get_time_control_id());

	debug(log_now(), 'Adding game into the history...');
	debug(log_now(), `    Game '${JSON.stringify(g)}'`);

	debug(log_now(), `    Game record string: '${record_id}'`);
	const date_record_file: string = path.join(games_dir, record_id);
	debug(log_now(), `    File: '${date_record_file}'`);

	// The files currently existing in the 'games_directory'
	debug(log_now(), `Reading directory '${games_dir}'...`);
	const all_date_record_strs = fs.readdirSync(games_dir);
	debug(log_now(), `    Directory contents: '${all_date_record_strs}'`);

	// There are no game records. Create the file and dump the game into it.
	if (all_date_record_strs.length == 0) {
		debug(log_now(), 'There are no game records.');
		debug(log_now(), `Simply write into file '${date_record_file}'`);
		fs.writeFileSync(date_record_file, JSON.stringify([g], null, 4));

		// update the players in the server memory
		user_update_from_players_data(updated_players);
		return;
	}

	debug(log_now(), `Find '${record_id}' in '${all_date_record_strs}'`);
	// Does the record corresponding to the game exist?
	let [idx_in_record_list, record_exists] = where_should_be_inserted(all_date_record_strs, record_id);

	if (!record_exists) {
		debug(log_now(), `    There is no record with date '${record_id}'`);
		debug(log_now(), `    The new record should be placed at '${idx_in_record_list}'`);
	} else {
		debug(log_now(), `    There is a record with date '${record_id}'`);
		debug(log_now(), `    The new record is at '${idx_in_record_list}'`);
	}

	if (!record_exists) {
		debug(log_now(), `Writing game into game record file '${date_record_file}'...`);

		// The file does not exist. Create the file and dump the game into it.
		fs.writeFileSync(date_record_file, JSON.stringify([g], null, 4));
	}

	// The record file did not exist => no games on that day
	// The record file is the last => no games ahead of this one
	// ==> Update user in their files and server memory
	if (!record_exists && idx_in_record_list == all_date_record_strs.length) {
		debug(log_now(), 'The game has been inserted into the last game record file');
		// update the players in the server memory
		user_update_from_players_data(updated_players);
		return;
	}

	let player_to_index: Map<string, number> = new Map();
	player_to_index.set(g.get_white(), 0);
	player_to_index.set(g.get_black(), 1);

	if (record_exists) {
		// Insert the current game in an existing record and update
		// the games ahead of this game

		debug(log_now(), `Update existing record '${date_record_file}'...`);

		let game_set = read_game_date_record(date_record_file);

		// where should the current game be inserted
		const [game_idx, game_exists] = where_should_be_inserted(game_set, g, game_compare_dates);

		// The game should not exist in its record.
		// This assumes that different games will never have the exact same 'when'.
		if (game_exists) {
			throw new Error(`Game of the exact same when field '${g.get_date()}' already exists`);
		}

		// insert game into array
		game_set.splice(game_idx, 0, g);

		debug(log_now(), `    Update game record '${record_id}'`);

		// update record of the current game
		update_game_record(game_set, game_idx + 1, g.get_time_control_id(), updated_players, player_to_index);

		debug(log_now(), `    Writing game record '${date_record_file}'...`);
		fs.writeFileSync(date_record_file, JSON.stringify(game_set, null, 4));
		debug(log_now(), `        Game record '${date_record_file}' written.`);

		// if the record already exists then 'record_index_in_list' points
		// to the current game record, but we should update starting at the
		// next record!
		++idx_in_record_list;
	}

	debug(log_now(), 'Update the rest of the records...');
	for (let idx = idx_in_record_list; idx < all_date_record_strs.length; ++idx) {
		const date_record_str = all_date_record_strs[idx];

		// files already contain the '.json' extension
		const date_record_file = path.join(games_dir, date_record_str);

		// read and parse the next file
		let game_set = read_game_date_record(date_record_file);

		// update the current record
		debug(log_now(), `    Updating game record '${date_record_file}'...`);
		update_game_record(game_set, 0, g.get_time_control_id(), updated_players, player_to_index);
		debug(log_now(), `        Number of updated players: '${updated_players.length}'...`);
		for (let j = 0; j < updated_players.length; ++j) {
			debug(log_now(), `        Player: '${JSON.stringify(updated_players[j])}'...`);
		}

		// update the record file
		debug(log_now(), `    Writing game record '${date_record_file}'...`);
		fs.writeFileSync(date_record_file, JSON.stringify(game_set, null, 4));
		debug(log_now(), `        Game record '${date_record_file}' written.`);
	}

	user_update_from_players_data(updated_players);
}

/**
 * @brief Add a game to the server
 * @param g Game
 */
export function game_add_new(
	white: User,
	black: User,
	result: GameResult,
	time_control_id: TimeControlID,
	time_control_name: string,
	game_record: DateStringShort,
	hhmmss: string
): void {
	const when = game_record + '..' + hhmmss;
	const white_username = white.get_username();
	const black_username = black.get_username();
	const g = game_new(white_username, black_username, result, time_control_id, time_control_name, when);

	debug(log_now(), `Add game into the list of games played by both users...`);

	white.add_game(time_control_id, game_record);
	black.add_game(time_control_id, game_record);

	debug(log_now(), `Inserting the game into the history...`);
	game_insert_in_history(g, game_record);
	debug(log_now(), `Updating the hash table (game id -> game record)`);

	GamesManager.get_instance().add_game(g.get_id(), game_record, time_control_id);
	graph_update(white_username, black_username, result, time_control_id);
}

/**
 * @brief Looks for the game of identifier @e game_id.
 * @param game_id The game G to be returned.
 * @returns A tuple with the following values:
 * 1. game_record_set: All the game record ids in the games directory that
 *    corresponds to the time control of G.
 * 2. game_file_path: The path to the file that contains G.
 * 3. game_set: All the games within (2), including G.
 * 4. game_record_set_idx: The index within (1) of the file that contains G.
 * 5. game_set_idx: The index of G within (3).
 */
export function game_find_by_id(game_id: GameID): [DateStringShort[], string, Game[], number, number] {
	const __info = GamesManager.get_instance().get_game_info(game_id);

	// game_id does not exist
	if (__info == undefined) {
		throw new Error(`Game id '${game_id}' does not exist in the Games Manager`);
	}

	const game_record_id = __info.game_record;
	const time_control_id = __info.time_control_id;

	const games_dir = EnvironmentManager.get_instance().get_dir_games_time_control(time_control_id);
	const game_file_path: string = path.join(games_dir, game_record_id);
	debug(log_now(), `    File: '${game_file_path}'`);

	// The files currently existing in the 'games_directory'
	debug(log_now(), `Reading directory '${games_dir}'...`);
	const game_record_set = fs.readdirSync(games_dir);
	debug(log_now(), `    Directory contents: '${game_record_set}'`);

	// Ensure there are game records
	if (game_record_set.length == 0) {
		throw new Error(`There are no game records in database for time control ${time_control_id}.`);
	}

	// check that the file actually exists
	debug(log_now(), `Searching for '${game_record_id}' in '${game_record_set}'.`);
	const game_record_set_idx = search(game_record_set, game_record_id);
	if (game_record_set_idx == -1) {
		throw new Error(
			`There is no game record '${game_record_id}' in the database for time control ${time_control_id}.`
		);
	}

	// read games in record
	const game_set = read_game_date_record(game_file_path);

	// find the game 'game_id' in the array 'game_set' and check that it exists
	const game_set_idx = search_linear_by_key(game_set, (g: Game): boolean => {
		return g.get_id() == game_id;
	});
	if (game_set_idx == -1) {
		throw new Error(`There is no game with id '${game_id}' in game record '${game_record_id}'`);
	}

	const game = game_set[game_set_idx];
	if (game.get_id() != game_id) {
		throw new Error(`The game found has a different id. Searching for '${game_id}'. Found '${game.get_id()}'`);
	}

	return [game_record_set, game_file_path, game_set, game_record_set_idx, game_set_idx];
}

/**
 * @brief Edit a game
 * @param game_id The ID of the game to edit
 * @param new_result The (new) result of the game
 */
export function game_edit_result(game_id: GameID, new_result: GameResult): void {
	debug(log_now(), `Editing game '${game_id}'`);

	let [all_game_records, game_record_file, game_set, idx_in_record_list, idx_in_game_set] = game_find_by_id(
		game_id
	) as [DateStringShort[], DateStringShort, Game[], number, number];

	let game = game_set[idx_in_game_set];

	const old_result = game.get_result();

	// avoid unnecessary work
	if (old_result == new_result) {
		return;
	}

	const white = game.get_white();
	const black = game.get_black();
	const time_control_id = game.get_time_control_id();
	const games_dir = EnvironmentManager.get_instance().get_dir_games_time_control(time_control_id);

	// ---------------------------------------------------------
	// actually apply changes

	game.set_result(new_result);

	// some games will change and users will have to be updated
	let updated_players: Player[] = [];

	// apply rating formula
	{
		let [white_after, black_after] = RatingSystemManager.get_instance().apply_rating_function(game);
		updated_players.push(updated_player(time_control_id, white, white_after));
		updated_players.push(updated_player(time_control_id, black, black_after));
	}

	let player_to_index: Map<string, number> = new Map();
	player_to_index.set(white, 0);
	player_to_index.set(black, 1);

	// update record of the current game
	update_game_record(game_set, idx_in_game_set + 1, game.get_time_control_id(), updated_players, player_to_index);
	debug(log_now(), `    Writing game record '${game_record_file}'...`);
	fs.writeFileSync(game_record_file, JSON.stringify(game_set, null, 4));
	debug(log_now(), `        Game record '${game_record_file}' written.`);

	debug(log_now(), 'Update the rest of the records...');
	for (let idx = idx_in_record_list + 1; idx < all_game_records.length; ++idx) {
		const date_record_str = all_game_records[idx];

		// files already contain the '.json' extension
		const date_record_filename = path.join(games_dir, date_record_str);

		// read and parse the next file
		const game_set = read_game_date_record(date_record_filename);

		// update the current record
		debug(log_now(), `    Updating game record '${date_record_filename}'...`);
		update_game_record(game_set, 0, game.get_time_control_id(), updated_players, player_to_index);
		debug(log_now(), `        Number of updated players: '${updated_players.length}'...`);
		for (let j = 0; j < updated_players.length; ++j) {
			debug(log_now(), `        Player: '${JSON.stringify(updated_players[j])}'...`);
		}

		// update the record file
		debug(log_now(), `    Writing game record '${date_record_filename}'...`);
		fs.writeFileSync(date_record_filename, JSON.stringify(game_set, null, 4));
		debug(log_now(), `        Game record '${date_record_filename}' written.`);
	}

	user_update_from_players_data(updated_players);
}

export function recalculate_all_ratings() {
	const all_time_controls = RatingSystemManager.get_instance().get_time_controls();

	let mem = UsersManager.get_instance();

	// initialize all players to a freshly created player
	let updated_players: Player[] = [];
	let player_to_index: Map<string, number> = new Map();

	for (let i = 0; i < mem.num_users(); ++i) {
		const username = (mem.get_user_at(i) as User).get_username();

		let ratings: TimeControlRating[] = [];
		// update the current record for all time controls
		for (let k = 0; k < all_time_controls.length; ++k) {
			let tcr = new TimeControlRating(
				all_time_controls[k].id,
				RatingSystemManager.get_instance().get_new_rating()
			);
			ratings.push(tcr);
		}

		updated_players.push(new Player(username, ratings));
		player_to_index.set(username, i);
	}

	for (let k = 0; k < all_time_controls.length; ++k) {
		const games_dir = EnvironmentManager.get_instance().get_dir_games_time_control(all_time_controls[k].id);

		// The files currently existing in the 'games_directory'
		debug(log_now(), `Reading directory '${games_dir}'...`);
		const all_date_records = fs.readdirSync(games_dir);
		debug(log_now(), `    Directory contents: '${all_date_records}'`);

		for (let i = 0; i < all_date_records.length; ++i) {
			const date_record_str = all_date_records[i];

			// files already contain the '.json' extension
			const date_record_filename = path.join(games_dir, date_record_str);

			// read and parse the next file
			const game_set = read_game_date_record(date_record_filename);

			// update the current record for all time controls
			for (let k = 0; k < all_time_controls.length; ++k) {
				const time_control = all_time_controls[k];

				debug(log_now(), `    Updating game record '${date_record_filename}'...`);
				update_game_record(game_set, 0, time_control.id, updated_players, player_to_index);
				debug(log_now(), `        Number of updated players: '${updated_players.length}'...`);
				for (let j = 0; j < updated_players.length; ++j) {
					debug(log_now(), `        Player: '${JSON.stringify(updated_players[j])}'...`);
				}
			}

			// update the record file
			debug(log_now(), `    Writing game record '${date_record_filename}'...`);
			fs.writeFileSync(date_record_filename, JSON.stringify(game_set, null, 4));
			debug(log_now(), `        Game record '${date_record_filename}' written.`);
		}
	}

	user_update_from_players_data(updated_players);
}
