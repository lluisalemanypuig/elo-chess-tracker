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

import Debug from 'debug';
const debug = Debug('ELO_TRACKER:server_query_games');

import path from 'path';
import fs from 'fs';

import { DateStringShort, log_now } from './utils/time';
import { is_user_logged_in } from './managers/session';
import { user_retrieve } from './managers/users';
import { User } from './models/user';
import { Game } from './models/game';
import { RatingSystemManager } from './managers/rating_system_manager';
import { EnvironmentManager } from './managers/environment_manager';
import { SEE_GAMES_USER } from './models/user_action';
import { SessionID } from './models/session_id';
import { can_user_edit_a_game, can_user_see_a_game } from './models/user_relationships';
import { TimeControlID } from './models/time_control';
import { game_set_from_json } from './io/game';

function increment(g: Game): any {
	const [white_after, black_after] = RatingSystemManager.get_instance().apply_rating_function(g);
	return {
		white_increment: Math.round(white_after.rating - g.get_white_rating().rating),
		black_increment: Math.round(black_after.rating - g.get_black_rating().rating)
	};
}

/**
 * @brief Returns a list of games guided by the filter functions
 *
 * The filter functions return true when a game should be accepted.
 * @param filter_game_record Filters game record files
 * @param filter_game Filters games
 */
function filter_game_list(filter_game_record: Function, filter_game: Function, user: User): any[] {
	let data_to_return: any[] = [];

	const rating_system_manager = RatingSystemManager.get_instance();

	/**
	 * TODO: sort list of games by date. They are currently sorted by time control
	 * id and then by date:
	 *
	 * 	Classical -- Newest
	 * 	...
	 * 	Classical -- Oldest
	 * 	Blitz -- Newest
	 * 	...
	 * 	Blitz -- Oldest
	 *
	 * The order of the time control ids is unspecified. A linear time algorithm
	 * is possible!
	 */

	for (const id of rating_system_manager.get_unique_time_controls_ids()) {
		const games_id_dir = EnvironmentManager.get_instance().get_dir_games_time_control(id);

		// The files currently existing in the 'games_directory'
		debug(log_now(), `Reading directory '${games_id_dir}'...`);
		const game_record_file_list = fs.readdirSync(games_id_dir);
		debug(log_now(), `    Directory contents: '${game_record_file_list}'`);

		for (let i = game_record_file_list.length - 1; i >= 0; --i) {
			const game_record_file = path.join(games_id_dir, game_record_file_list[i]);

			if (!filter_game_record(id, game_record_file_list[i])) {
				continue;
			}

			// read the games from the file
			debug(log_now(), `    Reading game record '${game_record_file}'...`);
			const data = fs.readFileSync(game_record_file, 'utf8');
			debug(log_now(), `        Game record '${game_record_file}' read.`);
			const game_set = game_set_from_json(data);

			for (let j = game_set.length - 1; j >= 0; --j) {
				const g = game_set[j];

				if (!filter_game(g)) {
					continue;
				}

				const inc = increment(g);

				const result = ((): string => {
					if (g.get_result() == 'white_wins') {
						return '1 - 0';
					}
					if (g.get_result() == 'black_wins') {
						return '0 - 1';
					}
					return '1/2 - 1/2';
				})();

				const white = user_retrieve(g.get_white()) as User;
				const black = user_retrieve(g.get_black()) as User;
				const is_editable: boolean = can_user_edit_a_game(user, white, black);

				data_to_return.push({
					id: g.get_id(),
					white: white.get_full_name(),
					black: black.get_full_name(),
					result: result,
					time_control: g.get_time_control_name(),
					date: g.get_date().replace('..', ' '),
					white_rating: Math.round(g.get_white_rating().rating),
					black_rating: Math.round(g.get_black_rating().rating),
					white_increment: inc.white_increment < 0 ? inc.white_increment : '+' + inc.white_increment,
					black_increment: inc.black_increment < 0 ? inc.black_increment : '+' + inc.black_increment,
					editable: is_editable ? 'y' : 'n'
				});
			}
		}
	}

	return data_to_return;
}

export async function get_query_games_list_own(req: any, res: any) {
	debug(log_now(), 'GET query_games_list_own...');

	const session = SessionID.from_cookie(req.cookies);
	const r = is_user_logged_in(session);

	if (!r[0]) {
		res.send({ r: '0', reason: r[1] });
		return;
	}

	const user = user_retrieve(session.username) as User;

	const data_to_return = filter_game_list(
		(time_id: TimeControlID, record_id: DateStringShort): boolean => {
			const array = user.get_games(time_id) as DateStringShort[];
			return array.includes(record_id);
		},
		(g: Game): boolean => {
			return g.is_user_involved(session.username);
		},
		user
	);

	debug(log_now(), `Found '${data_to_return.length}' games involving '${session.username}'`);

	res.send({
		r: '1',
		games: data_to_return
	});
}

export async function get_query_games_list_all(req: any, res: any) {
	debug(log_now(), 'GET query_games_list_all...');

	const session = SessionID.from_cookie(req.cookies);
	const r = is_user_logged_in(session);

	if (!r[0]) {
		res.send({ r: '0', reason: r[1] });
		return;
	}
	const user = user_retrieve(session.username) as User;

	if (!user.can_do(SEE_GAMES_USER)) {
		res.send('403 - Forbidden');
		return;
	}

	const data_to_return = filter_game_list(
		(_: DateStringShort): boolean => {
			return true;
		},
		(g: Game): boolean => {
			return can_user_see_a_game(
				user,
				user_retrieve(g.get_white()) as User,
				user_retrieve(g.get_black()) as User
			);
		},
		user
	);

	res.send({
		r: '1',
		games: data_to_return,
		actions: user.get_actions()
	});
}
