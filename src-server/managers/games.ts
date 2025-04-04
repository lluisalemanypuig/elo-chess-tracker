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
const debug = Debug('ELO_TRACKER:managers/games');

import { DateStringLongMillis, DateStringShort, log_now, long_date_to_short_date } from '../utils/time';
import { Player } from '../models/player';
import { Game, GameID, GameResult } from '../models/game';
import { User } from '../models/user';
import { where_should_be_inserted_by_key } from '../utils/searching';
import { GamesManager } from './games_manager';
import { UsersManager } from './users_manager';
import { RatingSystemManager } from './rating_system_manager';
import { EnvironmentManager } from './environment_manager';
import { user_update_from_player_data } from './users';
import { Rating } from '../rating_framework/rating';
import { TimeControlID } from '../models/time_control';
import { graph_delete_edge, graph_modify_edge, graph_update } from './graphs';
import { GamesIterator } from './games_iterator';
import { TimeControlRating } from '../models/time_control_rating';

/// Returns g1 < g2 using dates
function game_compare_dates(g: Game): Function {
	return (g2: Game): number => {
		if (g.get_date() < g2.get_date()) {
			return -1;
		}
		if (g.get_date() == g2.get_date()) {
			return 0;
		}
		return 1;
	};
}

/// Return the game where player 'username' is involved with
/// date after later than date 'when'.
function game_next_of_player(
	username: string,
	time_control_id: TimeControlID,
	when: DateStringLongMillis
): Game | undefined {
	const games_dir = EnvironmentManager.get_instance().get_dir_games_time_control(time_control_id);

	// The file into which we have to add the new game.
	const record_str = long_date_to_short_date(when);

	let games_iter = new GamesIterator(games_dir);
	let found = games_iter.locate_first_game_after(record_str, when);
	if (!found) {
		return undefined;
	}

	// TODO: optimize this function to only iterate over record files present in
	// the user's data.
	while (!games_iter.end_record_list()) {
		const g = games_iter.get_current_game();
		if (g.is_user_involved(username)) {
			return g;
		}
		games_iter.next_game();
	}
	return undefined;
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
			const white_user = UsersManager.get_instance().get_user_by_username(white);
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
			const black_user = UsersManager.get_instance().get_user_by_username(black);
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

function rating_into_player(time_control_id: TimeControlID, player: string, rating: Rating): Player {
	return new Player(player, [new TimeControlRating(time_control_id, rating)]);
}

/// Updates the given game record
function update_game_record(
	games_iter: GamesIterator,
	time_control_id: TimeControlID,
	updated_players: Player[],
	player_to_index: Map<string, number>
): void {
	debug(log_now(), `    Updating '${games_iter.get_current_record_name()}'...`);
	debug(log_now(), `    Before update:`);
	for (const player of updated_players) {
		debug(log_now(), `        ${player.get_username()}.`);
		debug(log_now(), `            ${player.get_rating(time_control_id).num_games}.`);
		debug(log_now(), `            ${player.get_rating(time_control_id).won}.`);
		debug(log_now(), `            ${player.get_rating(time_control_id).drawn}.`);
		debug(log_now(), `            ${player.get_rating(time_control_id).lost}.`);
	}

	let i: number = 0;
	while (!games_iter.end_record_single()) {
		debug(log_now(), `        Updating game ${i}/${games_iter.get_current_game_set().length}.`);

		let g = games_iter.get_current_game();

		const white = g.get_white();
		const black = g.get_black();

		const white_idx = player_to_index.get(white);
		const black_idx = player_to_index.get(black);

		const white_was_updated = white_idx != undefined;
		const black_was_updated = black_idx != undefined;

		if (white_was_updated || black_was_updated) {
			// set the player information in the game to the most updated version
			if (white_was_updated) {
				g.set_white_rating(updated_players[white_idx as number].get_rating(time_control_id).clone());
			}
			if (black_was_updated) {
				g.set_black_rating(updated_players[black_idx as number].get_rating(time_control_id).clone());
			}

			// calculate result of game
			const [rating_white_after, rating_black_after] =
				RatingSystemManager.get_instance().apply_rating_function(g);

			if (white_was_updated) {
				updated_players[white_idx as number].set_rating(time_control_id, rating_white_after);
			} else {
				updated_players.push(rating_into_player(time_control_id, white, rating_white_after));
				player_to_index.set(white, updated_players.length - 1);
			}

			if (black_was_updated) {
				updated_players[black_idx as number].set_rating(time_control_id, rating_black_after);
			} else {
				updated_players.push(rating_into_player(time_control_id, black, rating_black_after));
				player_to_index.set(black, updated_players.length - 1);
			}
		}

		games_iter.next_game_record();
		++i;
	}

	debug(log_now(), `    Updating '${games_iter.get_current_record_name()}'...`);
	debug(log_now(), `    Before update:`);
	for (const player of updated_players) {
		debug(log_now(), `        ${player.get_username()}.`);
		debug(log_now(), `            ${player.get_rating(time_control_id).num_games}.`);
		debug(log_now(), `            ${player.get_rating(time_control_id).won}.`);
		debug(log_now(), `            ${player.get_rating(time_control_id).drawn}.`);
		debug(log_now(), `            ${player.get_rating(time_control_id).lost}.`);
	}
}

/**
 * @brief Inserts a game into the entire history
 * @param g Game to be inserted
 * @param record_id Game record id, the file into which we have to add the new game
 * @post Users in the server are update (both memory and user files)
 */
function game_insert_in_history(g: Game, record_id: DateStringShort): void {
	let updated_players: Player[] = [];

	const white_username = g.get_white();
	const black_username = g.get_black();
	const time_control_id = g.get_time_control_id();

	{
		let [white_rating_after, black_rating_after] = RatingSystemManager.get_instance().apply_rating_function(g);
		updated_players.push(rating_into_player(time_control_id, white_username, white_rating_after));
		updated_players.push(rating_into_player(time_control_id, black_username, black_rating_after));
	}

	const games_dir = EnvironmentManager.get_instance().get_dir_games_time_control(time_control_id);
	const game_record_file = path.join(games_dir, record_id);

	let games_iter = new GamesIterator(games_dir);

	// the directory is completely empty
	if (games_iter.get_all_records().length == 0) {
		debug(log_now(), `There are no game record files for time control '${time_control_id}'.`);

		fs.writeFileSync(game_record_file, JSON.stringify([g], null, 4));
		user_update_from_player_data(updated_players);
		return;
	}

	// there are some files in the directory
	const record_exists = games_iter.locate_record(record_id);
	if (!record_exists) {
		debug(log_now(), `The game record for game '${g.get_id()}' does not exist.`);

		fs.writeFileSync(game_record_file, JSON.stringify([g], null, 4));
		if (games_iter.end_record_list()) {
			debug(log_now(), `The new game record file is beyond every other game record.`);

			user_update_from_player_data(updated_players);
			return;
		}
	}

	debug(log_now(), `There is some game record file beyond the current game record -- those have to be updated.`);

	let player_to_index: Map<string, number> = new Map();
	player_to_index.set(white_username, 0);
	player_to_index.set(black_username, 1);

	if (record_exists) {
		debug(log_now(), `The game record for game '${g.get_id()}' exists.`);

		let game_set = games_iter.get_current_game_set();

		const [game_idx, game_exists] = where_should_be_inserted_by_key(game_set, game_compare_dates(g));
		if (game_exists) {
			throw new Error(`Game of the exact same date field '${g.get_date()}' already exists`);
		}

		game_set.splice(game_idx, 0, g);

		games_iter.set_to_game(game_idx + 1);
		update_game_record(games_iter, time_control_id, updated_players, player_to_index);
		fs.writeFileSync(game_record_file, JSON.stringify(game_set, null, 4));

		games_iter.next_record();
	}

	debug(log_now(), `The game record for game '${g.get_id()}' has been created/updated.`);
	debug(log_now(), `Going to update the next game records.`);

	while (!games_iter.end_record_list()) {
		update_game_record(games_iter, time_control_id, updated_players, player_to_index);

		fs.writeFileSync(
			path.join(games_dir, games_iter.get_current_record_name()),
			JSON.stringify(games_iter.get_current_game_set(), null, 4)
		);

		games_iter.next_record();
	}

	user_update_from_player_data(updated_players);
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

	white.add_game(time_control_id, game_record);
	black.add_game(time_control_id, game_record);

	game_insert_in_history(g, game_record);

	GamesManager.get_instance().add_game(g.get_id(), game_record, time_control_id);
	graph_update(white_username, black_username, result, time_control_id);
}

/**
 * @brief Looks for the game of identifier @e game_id.
 * @param game_id The game G to be returned.
 * @returns The game object that has identifier equal to @e game_id.
 */
export function game_find_by_id(game_id: GameID): Game | undefined {
	const __info = GamesManager.get_instance().get_game_info(game_id);

	// game_id does not exist
	if (__info == undefined) {
		return undefined;
	}

	const time_control_id = __info.time_control_id;
	const game_record = __info.game_record;
	const games_dir = EnvironmentManager.get_instance().get_dir_games_time_control(time_control_id);

	let games_iter = new GamesIterator(games_dir);
	if (games_iter.get_number_of_records() == 0) {
		throw new Error(`There are no game records in database for time control ${time_control_id}.`);
	}

	const res = games_iter.locate_record(game_record);
	if (!res) {
		throw new Error(
			`There is no game record '${game_record}' in the database for time control ${time_control_id}.`
		);
	}

	while (!games_iter.end_record_single() && games_iter.get_current_game().get_id() != game_id) {
		games_iter.next_game_record();
	}
	if (games_iter.end_record_single()) {
		return undefined;
	}
	return games_iter.get_current_game();
}

/**
 * @brief Edit a game
 * @param game_id The ID of the game to edit
 * @param new_result The (new) result of the game
 */
export function game_edit_result(game_id: GameID, new_result: GameResult): void {
	const __info = GamesManager.get_instance().get_game_info(game_id);

	// game_id does not exist
	if (__info == undefined) {
		throw new Error(`Game id '${game_id}' does not exist in the Games Manager`);
	}

	const time_control_id = __info.time_control_id;
	const game_record = __info.game_record;
	const games_dir = EnvironmentManager.get_instance().get_dir_games_time_control(time_control_id);

	let games_iter = new GamesIterator(games_dir);
	const found = games_iter.locate_game(game_record, game_id);
	if (!found) {
		throw new Error(`Could not find game '${game_id}'.`);
	}

	let game = games_iter.get_current_game();
	const old_result = game.get_result();

	// avoid unnecessary work
	if (old_result == new_result) {
		return;
	}

	const white = game.get_white();
	const black = game.get_black();

	/* Update the graphs */

	graph_modify_edge(white, black, old_result, new_result, time_control_id);

	/* Update the game files */

	game.set_result(new_result);

	let updated_players: Player[] = [];
	{
		let [white_after, black_after] = RatingSystemManager.get_instance().apply_rating_function(game);
		updated_players.push(rating_into_player(time_control_id, white, white_after));
		updated_players.push(rating_into_player(time_control_id, black, black_after));
	}

	let player_to_index: Map<string, number> = new Map();
	player_to_index.set(white, 0);
	player_to_index.set(black, 1);

	// update record of the current game
	games_iter.next_game_record();

	while (!games_iter.end_record_list()) {
		update_game_record(games_iter, time_control_id, updated_players, player_to_index);

		fs.writeFileSync(
			path.join(games_dir, games_iter.get_current_record_name()),
			JSON.stringify(games_iter.get_current_game_set(), null, 4)
		);

		games_iter.next_record();
	}

	user_update_from_player_data(updated_players);
}

export function game_delete(game_id: GameID): void {
	let games_manager = GamesManager.get_instance();
	const __info = games_manager.get_game_info(game_id);

	// game_id does not exist
	if (__info == undefined) {
		throw new Error(`Game id '${game_id}' does not exist in the Games Manager`);
	}

	const time_control_id = __info.time_control_id;
	const game_record = __info.game_record;
	const games_dir = EnvironmentManager.get_instance().get_dir_games_time_control(time_control_id);

	let games_iter = new GamesIterator(games_dir);
	const found = games_iter.locate_game(game_record, game_id);
	if (!found) {
		throw new Error(`Could not find game '${game_id}'.`);
	}

	let game = games_iter.get_current_game();

	const result = game.get_result();
	const white = game.get_white();
	const black = game.get_black();

	/* Update the graphs */

	graph_delete_edge(white, black, result, time_control_id);

	/* Update the game files */

	let updated_players: Player[] = [];
	{
		const white_before = game.get_white_rating();
		const black_before = game.get_black_rating();
		updated_players.push(rating_into_player(time_control_id, white, white_before));
		updated_players.push(rating_into_player(time_control_id, black, black_before));
	}

	let player_to_index: Map<string, number> = new Map();
	player_to_index.set(white, 0);
	player_to_index.set(black, 1);

	// delete the current game in the record
	games_iter.delete_current_game();
	const record_is_empty = games_iter.get_current_game_set().length == 0;

	while (!games_iter.end_record_list()) {
		update_game_record(games_iter, time_control_id, updated_players, player_to_index);

		fs.writeFileSync(
			path.join(games_dir, games_iter.get_current_record_name()),
			JSON.stringify(games_iter.get_current_game_set(), null, 4)
		);

		games_iter.next_record();
	}

	if (record_is_empty) {
		const filename = path.join(games_dir, game_record);
		fs.rmSync(filename);
	}

	/* Update games manager */

	games_manager.delete_game_id(game_id);

	/* Update all user instances */

	let users_manager = UsersManager.get_instance();

	let w = users_manager.get_user_by_username(white) as User;
	w.delete_game(time_control_id, game_record);

	let b = users_manager.get_user_by_username(black) as User;
	b.delete_game(time_control_id, game_record);

	user_update_from_player_data(updated_players);
}

export function recalculate_all_ratings() {
	const rating_system = RatingSystemManager.get_instance();
	const all_time_controls = rating_system.get_unique_time_controls_ids();

	let mem = UsersManager.get_instance();

	// initialize all players to a freshly created player
	let updated_players: Player[] = [];
	let player_to_index: Map<string, number> = new Map();

	for (let i = 0; i < mem.num_users(); ++i) {
		const username = (mem.get_user_at(i) as User).get_username();

		let p = new Player(username, []);
		for (let k = 0; k < all_time_controls.length; ++k) {
			p.add_rating(all_time_controls[k], rating_system.get_new_rating());
		}

		updated_players.push(p);
		player_to_index.set(username, i);
	}

	for (let k = 0; k < all_time_controls.length; ++k) {
		const time_control = all_time_controls[k];
		const games_dir = EnvironmentManager.get_instance().get_dir_games_time_control(time_control);

		let games_iter = new GamesIterator(games_dir);
		while (!games_iter.end_record_list()) {
			update_game_record(games_iter, time_control, updated_players, player_to_index);

			fs.writeFileSync(
				path.join(games_dir, games_iter.get_current_record_name()),
				JSON.stringify(games_iter.get_current_game_set(), null, 4)
			);
			games_iter.next_record();
		}
	}

	user_update_from_player_data(updated_players);
}
