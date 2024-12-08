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

import Debug from 'debug';
const debug = Debug('ELO_TRACKER:server_games');

import path from 'path';

import { log_now } from './utils/misc';
import { is_user_logged_in } from './server/session';
import {
	CREATE_GAME,
	EDIT_ADMIN_GAMES,
	EDIT_MEMBER_GAMES,
	EDIT_STUDENT_GAMES,
	EDIT_TEACHER_GAMES,
	EDIT_USER_GAMES
} from './models/user_action';
import { User } from './models/user';
import { game_add, game_edit_result, game_find_by_id, game_new, recalculate_Elo_ratings } from './server/game_history';
import { Game, GameResult } from './models/game';
import { user_retrieve } from './server/users';
import { ADMIN, MEMBER, STUDENT, TEACHER } from './models/user_role';
import { SessionID } from './models/session_id';

export async function get_games_own_page(req: any, res: any) {
	debug(log_now(), 'GET games_own_page...');

	const session = new SessionID(req.cookies.session_id, req.cookies.user);
	const r = is_user_logged_in(session);

	if (!r[0]) {
		res.send(r[1]);
		return;
	}

	res.sendFile(path.join(__dirname, '../html/games_own.html'));
}

export async function get_games_all_page(req: any, res: any) {
	debug(log_now(), 'GET games_all_page...');

	const session = new SessionID(req.cookies.session_id, req.cookies.user);
	const r = is_user_logged_in(session);

	if (!r[0]) {
		res.send(r[1]);
		return;
	}

	res.sendFile(path.join(__dirname, '../html/games_all.html'));
}

export async function get_games_create_page(req: any, res: any) {
	debug(log_now(), 'GET games_create_page...');

	const session = new SessionID(req.cookies.session_id, req.cookies.user);
	const r = is_user_logged_in(session);

	if (!r[0]) {
		res.send(r[1]);
		return;
	}

	if (!(r[2] as User).can_do(CREATE_GAME)) {
		debug(log_now(), `User '${session.username}' cannot create users.`);
		res.send('403 - Forbidden');
		return;
	}

	res.sendFile(path.join(__dirname, '../html/games_create.html'));
}

export async function post_games_create(req: any, res: any) {
	debug(log_now(), 'POST games_create...');

	const session = new SessionID(req.cookies.session_id, req.cookies.user);
	const r = is_user_logged_in(session);

	if (!r[0]) {
		res.send(r[1]);
		return;
	}

	if (!(r[2] as User).can_do(CREATE_GAME)) {
		debug(log_now(), `User '${session.username}' cannot create users.`);
		res.send('403 - Forbidden');
		return;
	}

	const white = req.body.w;
	const black = req.body.b;
	const result = req.body.r;
	const time_control_id = req.body.tc_i;
	const time_control_name = req.body.tc_n;
	const game_date = req.body.d;
	const game_time = req.body.t;

	debug(log_now(), `    White: '${white}'`);
	debug(log_now(), `    Black: '${black}'`);
	debug(log_now(), `    Result: '${result}'`);
	debug(log_now(), `    Time control id: '${time_control_id}'`);
	debug(log_now(), `    Time control name: '${time_control_name}'`);
	debug(log_now(), `    Date of game: '${game_date}'`);
	debug(log_now(), `    Time of game: '${game_time}'`);

	if (white == black) {
		res.send({ r: '0', reason: 'The players cannot be the same' });
		return;
	}

	if (game_date == '') {
		res.send({ r: '0', reason: 'The selected date is incorrect' });
		return;
	}
	if (game_time == '') {
		res.send({ r: '0', reason: 'The selected time is incorrect' });
		return;
	}

	debug(log_now(), `Adding the new game`);

	let g = game_new(
		white,
		black,
		result as GameResult,
		time_control_id,
		time_control_name,
		game_date + '..' + game_time
	);

	debug(log_now(), `    Adding game...`);

	game_add(g);

	res.send({ r: '1' });
	return;
}

export async function post_games_edit_result(req: any, res: any) {
	debug(log_now(), 'POST games_edit_result...');

	const session = new SessionID(req.cookies.session_id, req.cookies.user);
	const r = is_user_logged_in(session);

	if (!r[0]) {
		res.send(r[1]);
		return;
	}

	const user = r[2] as User;
	if (!user.can_do(EDIT_USER_GAMES)) {
		debug(log_now(), `User '${session.username}' cannot create users.`);
		res.send('403 - Forbidden');
		return;
	}

	const game_id = req.body.game_id;
	const new_result = req.body.new_result;

	debug(log_now(), `    Game ID: '${game_id}'`);
	debug(log_now(), `    New result: '${new_result}'`);

	const search_result = game_find_by_id(game_id);
	if (search_result == null) {
		res.send({ r: '0', reason: `Game with ID ${game_id} not found.` });
		return;
	}
	const [_, __, game_set, ___, game_idx] = search_result as [string[], string, Game[], number, number];
	const game = game_set[game_idx];
	const white = user_retrieve(game.get_white()) as User;
	const black = user_retrieve(game.get_black()) as User;

	const white_or_black_is = function (role: string) {
		if (white.get_roles().includes(role)) {
			return true;
		}
		if (black.get_roles().includes(role)) {
			return true;
		}
		return false;
	};

	let is_editable: boolean = false;
	if (user.can_do(EDIT_USER_GAMES)) {
		if (user.can_do(EDIT_ADMIN_GAMES) && white_or_black_is(ADMIN)) {
			is_editable = true;
		}
		if (user.can_do(EDIT_MEMBER_GAMES) && white_or_black_is(MEMBER)) {
			is_editable = true;
		}
		if (user.can_do(EDIT_TEACHER_GAMES) && white_or_black_is(TEACHER)) {
			is_editable = true;
		}
		if (user.can_do(EDIT_STUDENT_GAMES) && white_or_black_is(STUDENT)) {
			is_editable = true;
		}
	}
	if (!is_editable) {
		res.send({
			r: '0',
			reason: `You lack permissions to edit game with ID ${game_id}.`
		});
		return;
	}

	debug(log_now(), `Editing game...`);

	// actually edit the game now
	game_edit_result(game_id, new_result);

	res.send({ r: '1' });
	return;
}

export async function post_recalculate_Elo_ratings(req: any, res: any) {
	debug(log_now(), 'POST recalculate_Elo_ratings...');

	const session = new SessionID(req.cookies.session_id, req.cookies.user);
	const r = is_user_logged_in(session);

	if (!r[0]) {
		res.send(r[1]);
		return;
	}

	const user = r[2] as User;
	if (!user.is(ADMIN)) {
		debug(log_now(), `User '${session.username}' cannot recalculate Elo ratings.`);
		res.send('403 - Forbidden');
		return;
	}

	debug(log_now(), `Recalculating Elo ratings...`);

	// actually recalculating Elo ratings
	recalculate_Elo_ratings();

	res.send({ r: '1' });
	return;
}
