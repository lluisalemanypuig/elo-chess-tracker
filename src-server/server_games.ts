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
const debug = Debug('ELO_TRACKER:server_games');

import path from 'path';

import { DateStringShort, log_now } from './utils/time';
import { is_user_logged_in } from './managers/session';
import { CREATE_GAMES, EDIT_GAMES_USER } from './models/user_action';
import { User } from './models/user';
import { game_add_new, game_edit_result, game_find_by_id, recalculate_all_ratings } from './managers/games';
import { GameID, GameResult } from './models/game';
import { user_retrieve } from './managers/users';
import { ADMIN } from './models/user_role';
import { SessionID } from './models/session_id';
import { TimeControlID } from './models/time_control';
import { GamesManager } from './managers/games_manager';
import { can_user_create_a_game, can_user_edit_a_game } from './utils/user_relationships';
import { UsersManager } from './managers/users_manager';

export async function get_games_list_own_page(req: any, res: any) {
	debug(log_now(), 'GET games_list_own_page...');

	const session = SessionID.from_cookie(req.cookies);
	const r = is_user_logged_in(session);

	if (!r[0]) {
		res.send(r[1]);
		return;
	}

	res.sendFile(path.join(__dirname, '../html/games_list_own.html'));
}

export async function get_games_list_all_page(req: any, res: any) {
	debug(log_now(), 'GET games_list_all_page...');

	const session = SessionID.from_cookie(req.cookies);
	const r = is_user_logged_in(session);

	if (!r[0]) {
		res.send(r[1]);
		return;
	}

	res.sendFile(path.join(__dirname, '../html/games_list_all.html'));
}

export async function get_games_create_page(req: any, res: any) {
	debug(log_now(), 'GET games_create_page...');

	const session = SessionID.from_cookie(req.cookies);
	const r = is_user_logged_in(session);

	if (!r[0]) {
		res.send(r[1]);
		return;
	}

	if (!(r[2] as User).can_do(CREATE_GAMES)) {
		debug(log_now(), `User '${session.username}' cannot create users.`);
		res.send('403 - Forbidden');
		return;
	}

	res.sendFile(path.join(__dirname, '../html/games_create.html'));
}

export async function post_games_create(req: any, res: any) {
	debug(log_now(), 'POST games_create...');

	const session = SessionID.from_cookie(req.cookies);
	const r = is_user_logged_in(session);

	if (!r[0]) {
		res.send(r[1]);
		return;
	}

	const creator = r[2] as User;
	if (!creator.can_do(CREATE_GAMES)) {
		debug(log_now(), `User '${session.username}' cannot create users.`);
		res.send('403 - Forbidden');
		return;
	}

	const mem = UsersManager.get_instance();

	const white_rid = req.body.w;
	const _white = mem.get_user_by_random_id(white_rid);
	if (_white == undefined) {
		debug(log_now(), `Random id '${white_rid}' for White is not valid.`);
		res.send({ r: '0', reason: 'Invalid values' });
		return;
	}

	const black_rid = req.body.b;
	const _black = mem.get_user_by_random_id(black_rid);
	if (_black == undefined) {
		debug(log_now(), `Random id '${black_rid}' for Black is not valid.`);
		res.send({ r: '0', reason: 'Invalid values' });
		return;
	}

	const white = _white as User;
	const black = _black as User;
	const result: GameResult = req.body.r;
	const time_control_id: TimeControlID = req.body.tc_i;
	const time_control_name = req.body.tc_n;
	const game_date: DateStringShort = req.body.d;
	const game_time: string = req.body.t; // HH:mm:ss:SSS

	if (!can_user_create_a_game(creator, white, black)) {
		debug(log_now(), `User cannot create this game.`);
		res.send({ r: '0', reason: 'You do not have enough permissions to create this game' });
		return;
	}

	debug(log_now(), `    White: '${white.get_username()}'`);
	debug(log_now(), `    Black: '${black.get_username()}'`);
	debug(log_now(), `    Result: '${result}'`);
	debug(log_now(), `    Time control id: '${time_control_id}'`);
	debug(log_now(), `    Time control name: '${time_control_name}'`);
	debug(log_now(), `    Date of game: '${game_date}'`);
	debug(log_now(), `    Time of game: '${game_time}'`);

	if (white.get_username() == black.get_username()) {
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

	game_add_new(white, black, result, time_control_id, time_control_name, game_date, game_time);

	res.send({ r: '1' });
	return;
}

export async function post_games_edit_result(req: any, res: any) {
	debug(log_now(), 'POST games_edit_result...');

	const session = SessionID.from_cookie(req.cookies);
	const r = is_user_logged_in(session);

	if (!r[0]) {
		res.send(r[1]);
		return;
	}

	const user = r[2] as User;
	if (!user.can_do(EDIT_GAMES_USER)) {
		debug(log_now(), `User '${session.username}' cannot create users.`);
		res.send('403 - Forbidden');
		return;
	}

	const game_id: GameID = req.body.game_id;
	const new_result = req.body.new_result;

	debug(log_now(), `    Game ID: '${game_id}'`);
	debug(log_now(), `    New result: '${new_result}'`);

	if (!GamesManager.get_instance().game_exists(game_id)) {
		res.send({ r: '0', reason: `Game with ID ${game_id} was not found (1).` });
		return;
	}

	const game = game_find_by_id(game_id);
	if (game == undefined) {
		res.send({ r: '0', reason: `Game with ID ${game_id} was not found (2).` });
		return;
	}

	const is_editable = can_user_edit_a_game(
		user,
		user_retrieve(game.get_white()) as User,
		user_retrieve(game.get_black()) as User
	);
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

	const session = SessionID.from_cookie(req.cookies);
	const r = is_user_logged_in(session);

	if (!r[0]) {
		res.send(r[1]);
		return;
	}

	if (!(r[2] as User).is(ADMIN)) {
		debug(log_now(), `User '${session.username}' cannot recalculate Elo ratings.`);
		res.send('403 - Forbidden');
		return;
	}

	debug(log_now(), `Recalculating Elo ratings...`);

	// actually recalculating Elo ratings
	recalculate_all_ratings();

	res.send({ r: '1' });
	return;
}
