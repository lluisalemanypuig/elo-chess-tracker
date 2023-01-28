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

import Debug from 'debug';
const debug = Debug('ELO_TRACKER:server_query_games');

import path from 'path';
import fs from 'fs';

import { log_now } from './utils/misc';
import { is_user_logged_in } from './server/session';
import { user_retrieve } from './server/users';
import { User } from './models/user';
import { Game, game_set_from_json } from './models/game';
import { RatingSystem } from './server/configuration';
import { ServerDirectories } from './server/configuration';
import { ADMIN, MEMBER, STUDENT, TEACHER, UserRole } from './models/user_role';
import {
	SEE_USER_GAMES, SEE_ADMIN_GAMES, SEE_MEMBER_GAMES, SEE_STUDENT_GAMES, SEE_TEACHER_GAMES,
} from './models/user_action'

function increment(g: Game): any {
	const [white_after, black_after] = RatingSystem.get_instance().formula(g);
	const white_increment = white_after.rating - g.white_rating.rating;
	const black_increment = black_after.rating - g.black_rating.rating;
	return {
		'white_increment' : Math.round(white_increment),
		'black_increment' : Math.round(black_increment)
	};
}

/**
 * @brief Returns a list of games guided by the filter functions
 * 
 * The filter functions return true when a game should be accepted.
 * @param filter_game_record Filters game record files
 * @param filter_game Filters games
 */
function filter_game_list(
	filter_game_record: Function,
	filter_game: Function

): any[]
{
	const games_dir = ServerDirectories.get_instance().games_directory;

	let data_to_return: any[] = [];
	
	// The files currently existing in the 'games_directory'
	debug(log_now(), `Reading directory '${games_dir}'...`);
	let game_record_file_list = fs.readdirSync(games_dir);
	debug(log_now(), `    Directory contents: '${game_record_file_list}'`);

	for (let i = game_record_file_list.length - 1; i >= 0; --i) {
		let game_record_file = path.join(games_dir, game_record_file_list[i]);

		if (!filter_game_record(game_record_file_list[i])) { continue; }

		// read the games from the file
		debug(log_now(), `    Reading game record '${game_record_file}'...`);
		let data = fs.readFileSync(game_record_file, 'utf8');
		debug(log_now(), `        Game record '${game_record_file}' read.`);
		let game_set = game_set_from_json(data);

		for (let j = game_set.length - 1; j >= 0; --j) {
			let g = game_set[j];

			if (!filter_game(g)) { continue; }

			const inc = increment(g);
			const time_control_name: string = RatingSystem.get_instance().get_name_time_control(g.time_control_id);

			let result: string;
			if (g.result == 'white_wins') {
				result = "1 - 0";
			}
			else if (g.result == 'black_wins') {
				result = "0 - 1";
			}
			else {
				result = "1/2 - 1/2"
			}

			data_to_return.push({
				'white': (user_retrieve(g.white) as User).get_full_name(),
				'black': (user_retrieve(g.black) as User).get_full_name(),
				'result': result,
				'time_control': time_control_name,
				'date' : g.when.replace('..', ' '),
				'white_rating': Math.round(g.white_rating.rating),
				'black_rating': Math.round(g.black_rating.rating),
				'white_increment': (inc.white_Elo_increment < 0 ? inc.white_increment : "+" + inc.white_increment),
				'black_increment': (inc.black_Elo_increment < 0 ? inc.black_increment : "+" + inc.black_increment)
			});
		}
	}

	return data_to_return;
}

export async function query_games_list_own(req: any, res: any) {
	debug(log_now(), "GET query_games_list_own...");

	const id = req.cookies.session_id;
	const username = req.cookies.user;

	let r = is_user_logged_in(id, username);
	if (!r[0]) {
		res.send(r[1]);
		return;
	}

	let u = user_retrieve(username) as User;
	let data_to_return = filter_game_list(
		(game_record_file: string): boolean => {
			return u.get_games().includes(game_record_file);
		},
		(g: Game): boolean => {
			return g.is_user_involved(username);
		}
	);

	debug(log_now(), `Found '${data_to_return.length}' games involving '${username}'`);

	res.send({
		'r' : '1',
		'games' : data_to_return
	});
}

export async function query_games_list_all(req: any, res: any) {
	debug(log_now(), "GET query_games_list_all...");

	const id = req.cookies.session_id;
	const username = req.cookies.user;

	let r = is_user_logged_in(id, username);
	if (!r[0]) {
		res.send(r[1]);
		return;
	}
	let u = user_retrieve(username) as User;

	if (!u.can_do(SEE_USER_GAMES)) {
		res.send('403 - Forbidden');
		return;
	}

	const game_contains = function(g: Game, r: UserRole): boolean {
		const white = user_retrieve(g.white) as User;
		const black = user_retrieve(g.black) as User;
		return white.is(r) || black.is(r);
	}

	let data_to_return = filter_game_list(
		(_: string): boolean => { return true; },
		(g: Game): boolean => {
			if (u.can_do(SEE_ADMIN_GAMES) && game_contains(g, ADMIN)) { return true; }
			if (u.can_do(SEE_TEACHER_GAMES) && game_contains(g, TEACHER)) { return true; }
			if (u.can_do(SEE_STUDENT_GAMES) && game_contains(g, STUDENT)) { return true; }
			if (u.can_do(SEE_MEMBER_GAMES) && game_contains(g, MEMBER)) { return true; }
			return false;
		}
	);

	debug(log_now(), `Found '${data_to_return.length}' games involving '${username}'`);

	res.send({
		'r' : '1',
		'games' : data_to_return
	});
}