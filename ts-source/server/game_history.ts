/*
Elo rating for a Chess Club
Copyright (C) 2023  Lluís Alemany Puig

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
import { Game, GameResult, GameType, game_set_from_json } from '../models/game';
import { User } from '../models/user';
import { log_now, where_should_be_inserted, long_date_to_short_date, number_to_string } from '../utils/misc';
import { RatingFormula, ServerDirectories, ServerMemory } from './configuration';
import { user_retrieve, user_update_from_players_data } from './users';

/// Returns g1 < g2 using dates
function game_compare_dates(g1: Game, g2: Game): number {
	if (g1.when < g2.when) { return -1; }
	if (g1.when == g2.when) { return 0; }
	return 1;
}

/// Creates a new game with no players using the parameters given
export function game_new(
	white: string, black: string,
	result: GameResult,
	type: GameType,
	when: string

): Game
{
	let id = ServerMemory.get_instance().num_games + 1;

	let id_str = number_to_string(id);

	let white_to_assign: Player;
	let black_to_assign: Player;

	{
	// get white's next game in the history
	let next = game_next_of_player(white, when);
	if (next != null) {
		if (next.white.get_username() == white) {
			// white in this game is also white in the next game
			white_to_assign = next.white.clone();
		}
		else {
			// white in this game is black in the next game
			white_to_assign = next.black.clone();
		}
	}
	else {
		// there is no next game for white
		white_to_assign = (user_retrieve(white) as User).as_player().clone();
	}
	}

	{
	// get black's next game in the history
	let next = game_next_of_player(black, when);
	if (next != null) {
		if (next.white.get_username() == black) {
			// white in this game is white in the next game
			black_to_assign = next.white.clone();
		}
		else {
			// black in this game is also black in the next game
			black_to_assign = next.black.clone();
		}
	}
	else {
		black_to_assign = (user_retrieve(black) as User).as_player().clone();
	}
	}

	// increment number of games
	ServerMemory.get_instance().num_games += 1;
	return new Game(
		id_str,
		white_to_assign, black_to_assign,
		result, type, when
	);
}

export function game_add(g: Game, when: string): void {
	debug(log_now(), `Add game into the list of games played by both users...`);
	
	(user_retrieve(g.white.get_username() as string) as User).add_game(when);
	(user_retrieve(g.black.get_username() as string) as User).add_game(when);
	
	debug(log_now(), `Inserting the game into the history...`);
	game_insert_in_history(g);
}

/// Return the game where player 'username' is involved with
/// date after later than date 'when'.
export function game_next_of_player(
	username: string,
	when: string

): Game | null {

	debug(log_now(), `Find the game of user '${username}' right after date '${when}'`);

	let games_dir = ServerDirectories.get_instance().games_directory;

	// The file into which we have to add the new game.
	let game_record_string = long_date_to_short_date(when);
	debug(log_now(), `    Date: '${game_record_string}'`);
	let game_record_file: string = path.join(games_dir, game_record_string);
	debug(log_now(), `    File: '${game_record_file}'`);

	// The files currently existing in the 'games_directory'
	debug(log_now(), `Reading directory '${games_dir}'...`);
	let all_record_strings = fs.readdirSync(games_dir);
	debug(log_now(), `    Directory contents: '${all_record_strings}'`);

	// There are no game records. There is no next game
	if (all_record_strings.length == 0) { return null; }

	// Does the record corresponding to the game exist?
	let [record_index_in_list, record_exists] =
		where_should_be_inserted(all_record_strings, game_record_string);

	// there is no next game
	if (record_index_in_list == all_record_strings.length) { return null; }

	if (record_exists) {
		// Insert the current game in an existing record and update
		// the games ahead of this game

		debug(log_now(), `Inspecting existing record '${game_record_file}'...`);

		debug(log_now(), `    Read game record file '${game_record_file}'...`);
		let data = fs.readFileSync(game_record_file, 'utf8');
		debug(log_now(), `        Game record '${game_record_file}' read.`);

		// convert data into an array
		let game_set = game_set_from_json(data);
		debug(log_now(), `    Record contains: '${game_set.map(function(elem): string { return elem.when; })}'`);
		debug(log_now(), `    Look for a game with date '${when}'`);

		// where should the current game be inserted
		let [game_idx, game_exists] = where_should_be_inserted(
			// convert each game into a string
			game_set.map(function(elem): string { return elem.when; }), when
		);

		debug(log_now(), `    Game exists? '${game_exists}'. At '${game_idx}'`);

		assert(!game_exists);

		// try to find the game in the game set
		for (let i = game_idx; i < game_set.length; ++i) {
			if (game_set[i].is_user_involved(username)) {
				return game_set[i];
			}
		}
		
		// if the record already exists then 'record_index_in_list' points
		// to the current game record, but we should update starting at the
		// next record!
		++record_index_in_list;
	}

	debug(log_now(), "Inspecting the rest of the records...");
	for (let idx = record_index_in_list; idx < all_record_strings.length; ++idx) {
		let record_string = all_record_strings[idx];

		// files already contain the '.json' extension
		let record_file = path.join(games_dir, record_string);

		// read and parse the next file
		debug(log_now(), `    Reading game record '${record_file}'...`);
		let data = fs.readFileSync(record_file, 'utf8');
		debug(log_now(), `        Game record '${record_file}' read.`);
		let game_set = game_set_from_json(data);

		for (let i = 0; i < game_set.length; ++i) {
			if (game_set[i].is_user_involved(username)) {
				return game_set[i];
			}
		}
	}

	// no 'next' game was found
	return null;
}

/// Updates the given game record
function update_game_record(
	game_set: Game[],
	start_at: number,
	updated_players: Player[],
	player_to_index: Map<string, number>

): void
{
	const was_updated =
		(username: string): boolean => { return player_to_index.has(username); };

	for (let i = start_at; i < game_set.length; ++i) {
		debug(log_now(), `    Updating game '${i}'`);

		let white = game_set[i].white;
		let black = game_set[i].black;

		let white_username = white.get_username();
		let black_username = black.get_username();

		// were White or Black updated in previous iterations?
		const white_was_updated = was_updated(white_username);
		const black_was_updated = was_updated(black_username);

		let white_idx = player_to_index.get(white_username);
		let black_idx = player_to_index.get(black_username);

		// set the player information in the game to the most updated version
		if (white_was_updated) {
			debug(log_now(), `    White in the game: ${JSON.stringify(white)}`);
			debug(log_now(), `        White updated: ${JSON.stringify(updated_players[white_idx as number])}`);
			game_set[i].white = updated_players[white_idx as number].clone();
			debug(log_now(), `        White in the game: ${JSON.stringify(game_set[i].white)}`);
		}
		if (black_was_updated) {
			debug(log_now(), `    Black in the game: ${JSON.stringify(black)}`);
			debug(log_now(), `        Black updated: ${JSON.stringify(updated_players[black_idx as number])}`);
			game_set[i].black = updated_players[black_idx as number].clone();
			debug(log_now(), `        Black in the game: ${JSON.stringify(game_set[i].black)}`);
		}

		if (white_was_updated || black_was_updated) {
			// calculate result of game
			let formula = RatingFormula.get_instance().formula;
			let [white_after, black_after] = formula(game_set[i]);

			if (!white_was_updated) {
				debug(log_now(), `    White has been updated for the first time: ${JSON.stringify(white_after)}`);

				// White has been updated in this game for the first time:
				// - should be updated in future games
				// - should be inserted into the 'updated_players' set
				updated_players.push(white_after.clone());
				player_to_index.set(white_username, updated_players.length - 1);
			}
			else {
				updated_players[white_idx as number] = white_after.clone();
			}

			if (!black_was_updated) {
				debug(log_now(), `    Black has been updated for the first time: ${JSON.stringify(black_after)}`);

				// Black has been updated in this game for the first time:
				// - should be updated in future games
				// - should be inserted into the 'updated_players' set
				updated_players.push(black_after.clone());
				player_to_index.set(black_username, updated_players.length - 1);
			}
			else {
				updated_players[black_idx as number] = black_after.clone();
			}
		}
	}
}

/**
 * @brief Inserts a game into the entire history
 * @param game Game to be inserted
 * @post Users in the server are update (both memory and user files)
 */
export function game_insert_in_history(game: Game): void
{
	// some games will change and will have to be updated
	let updated_players: Player[] = [];

	// apply Elo or other rating formula
	{
	let [white_after, black_after] = RatingFormula.get_instance().formula(game);
	updated_players.push(white_after);
	updated_players.push(black_after);
	}

	let games_dir = ServerDirectories.get_instance().games_directory;

	debug(log_now(), "Adding game into the history...");
	debug(log_now(), `    Game '${JSON.stringify(game)}'`);

	// The file into which we have to add the new game.
	let game_record_string = long_date_to_short_date(game.when);
	debug(log_now(), `    Date: '${game_record_string}'`);
	let game_record_file: string = path.join(games_dir, game_record_string);
	debug(log_now(), `    File: '${game_record_file}'`);

	// The files currently existing in the 'games_directory'
	debug(log_now(), `Reading directory '${games_dir}'...`);
	let all_record_strings = fs.readdirSync(games_dir);
	debug(log_now(), `    Directory contents: '${all_record_strings}'`);

	// There are no game records. Create the file and dump the game into it.
	if (all_record_strings.length == 0) {
		debug(log_now(), "There are no game records.");
		debug(log_now(), `Simply write into file '${game_record_file}'`);
		fs.writeFileSync(game_record_file, JSON.stringify([game], null, 4), { flag: 'w' });

		// update the players in the server memory
		user_update_from_players_data(updated_players);
		return;
	}

	debug(log_now(), `Find '${game_record_string}' in '${all_record_strings}'`);
	// Does the record corresponding to the game exist?
	let [record_index_in_list, record_exists] =
		where_should_be_inserted(all_record_strings, game_record_string);

	if (!record_exists) {
		debug(log_now(), `    There is no record with date '${game_record_string}'`);
		debug(log_now(), `    The new record should be placed at '${record_index_in_list}'`);
	}
	else {
		debug(log_now(), `    There is a record with date '${game_record_string}'`);
		debug(log_now(), `    The new record is at '${record_index_in_list}'`);
	}

	if (!record_exists) {
		debug(log_now(), `Writing game into game record file '${game_record_file}'...`);

		// The file does not exist. Create the file and dump the game into it.
		fs.writeFileSync(game_record_file, JSON.stringify([game], null, 4), { flag: 'w' });
	}

	// The record file did not exist => no games on that day
	// The record file is the last => no games ahead of this one
	// ==> Update user in their files and server memory
	if (!record_exists && record_index_in_list == all_record_strings.length) {
		debug(log_now(), "The game has been inserted into the last game record file");
		// update the players in the server memory
		user_update_from_players_data(updated_players);
		return;
	}

	let player_to_index: Map<string, number> = new Map();
	player_to_index.set(game.white.get_username(), 0);
	player_to_index.set(game.black.get_username(), 1);

	if (record_exists) {
		// Insert the current game in an existing record and update
		// the games ahead of this game

		debug(log_now(), `Update existing record '${game_record_file}'...`);

		debug(log_now(), `    Read game record file '${game_record_file}'...`);
		let data = fs.readFileSync(game_record_file, 'utf8');
		debug(log_now(), `        Game record '${game_record_file}' read.`);

		// convert data into an array
		let game_set = game_set_from_json(data);

		// where should the current game be inserted
		let [game_idx, game_exists] = where_should_be_inserted(game_set, game, game_compare_dates);

		// The game should not exist in its record.
		// This assumes that different games will never
		// have the exact same 'when'.
		assert(!game_exists);

		// insert game into array
		game_set.splice(game_idx, 0, game);

		debug(log_now(), `    Update game record '${game_record_string}'`);

		// update record of the current game
		update_game_record(game_set, game_idx + 1, updated_players, player_to_index);

		debug(log_now(), `    Writing game record '${game_record_file}'...`);
		fs.writeFileSync(game_record_file, JSON.stringify(game_set, null, 4), { flag: 'w' });
		debug(log_now(), `        Game record '${game_record_file}' written.`);

		// if the record already exists then 'record_index_in_list' points
		// to the current game record, but we should update starting at the
		// next record!
		++record_index_in_list;
	}

	debug(log_now(), "Update the rest of the records...");
	for (let idx = record_index_in_list; idx < all_record_strings.length; ++idx) {
		let record_string = all_record_strings[idx];

		// files already contain the '.json' extension
		let record_file = path.join(games_dir, record_string);

		// read and parse the next file
		debug(log_now(), `    Reading game record '${record_file}'...`);
		let data = fs.readFileSync(record_file, 'utf8');
		debug(log_now(), `        Game record '${record_file}' read.`);
		let game_set = game_set_from_json(data);

		// update the current record
		debug(log_now(), `    Updating game record '${record_file}'...`);
		update_game_record(game_set, 0, updated_players, player_to_index);
		debug(log_now(), `        Amount of updated players: '${updated_players.length}'...`);
		for (let j = 0; j < updated_players.length; ++j) {
		debug(log_now(), `        Player: '${JSON.stringify(updated_players[j])}'...`);
		}

		// update the record file
		debug(log_now(), `    Writing game record '${record_file}'...`);
		fs.writeFileSync(record_file, JSON.stringify(game_set, null, 4), { flag: 'w' });
		debug(log_now(), `        Game record '${record_file}' written.`);
	}

	user_update_from_players_data(updated_players);
}
