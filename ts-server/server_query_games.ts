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

import { log_now } from './utils/misc';
import { is_user_logged_in } from './server/session';
import { user_retrieve } from './server/users';
import { User } from './models/user';
import { Game, game_set_from_json } from './models/game';
import { RatingSystem } from './server/rating_system';
import { ServerEnvironment } from './server/environment';
import { SEE_USER_GAMES } from './models/user_action';
import { SessionID } from './models/session_id';
import { can_user_edit_a_game, can_user_see_a_game } from './utils/user_relationships';

function increment(g: Game): any {
	const [white_after, black_after] = RatingSystem.get_instance().apply_rating_formula(g);
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
	const games_dir = ServerEnvironment.get_instance().get_dir_games();

	let data_to_return: any[] = [];

	// The files currently existing in the 'games_directory'
	debug(log_now(), `Reading directory '${games_dir}'...`);
	let game_record_file_list = fs.readdirSync(games_dir);
	debug(log_now(), `    Directory contents: '${game_record_file_list}'`);

	for (let i = game_record_file_list.length - 1; i >= 0; --i) {
		let game_record_file = path.join(games_dir, game_record_file_list[i]);

		if (!filter_game_record(game_record_file_list[i])) {
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
			const time_control_name: string = RatingSystem.get_instance().get_name_time_control(
				g.get_time_control_id()
			);

			let result: string;
			if (g.get_result() == 'white_wins') {
				result = '1 - 0';
			} else if (g.get_result() == 'black_wins') {
				result = '0 - 1';
			} else {
				result = '1/2 - 1/2';
			}

			const white = user_retrieve(g.get_white()) as User;
			const black = user_retrieve(g.get_black()) as User;
			const is_editable: boolean = can_user_edit_a_game(user, white, black);

			data_to_return.push({
				id: g.get_id(),
				white: white.get_full_name(),
				black: black.get_full_name(),
				result: result,
				time_control: time_control_name,
				date: g.get_date().replace('..', ' '),
				white_rating: Math.round(g.get_white_rating().rating),
				black_rating: Math.round(g.get_black_rating().rating),
				white_increment: inc.white_increment < 0 ? inc.white_increment : '+' + inc.white_increment,
				black_increment: inc.black_increment < 0 ? inc.black_increment : '+' + inc.black_increment,
				editable: is_editable ? 'yes' : 'no'
			});
		}
	}

	return data_to_return;
}

export async function get_query_games_list_own(req: any, res: any) {
	debug(log_now(), 'GET query_games_list_own...');

	const session = new SessionID(req.cookies.session_id, req.cookies.user);
	const r = is_user_logged_in(session);

	if (!r[0]) {
		res.send({ r: '0', reason: r[1] });
		return;
	}

	const user = user_retrieve(session.username) as User;

	const data_to_return = filter_game_list(
		(game_record_file: string): boolean => {
			return user.get_games().includes(game_record_file);
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

	const session = new SessionID(req.cookies.session_id, req.cookies.user);
	const r = is_user_logged_in(session);

	if (!r[0]) {
		res.send({ r: '0', reason: r[1] });
		return;
	}
	const user = user_retrieve(session.username) as User;

	if (!user.can_do(SEE_USER_GAMES)) {
		res.send('403 - Forbidden');
		return;
	}

	const data_to_return = filter_game_list(
		(_: string): boolean => {
			return true;
		},
		(g: Game): boolean => {
			const white = user_retrieve(g.get_white()) as User;
			const black = user_retrieve(g.get_black()) as User;
			return can_user_see_a_game(user, white, black);
		},
		user
	);

	res.send({
		r: '1',
		games: data_to_return,
		actions: user.get_actions()
	});
}
