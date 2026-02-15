/*
Elo rating for a Chess Club
Copyright (C) 2023 - 2026  Lluís Alemany Puig

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
import { GAMES_CREATE, GAMES_DELETE, GAMES_EDIT } from './models/user_action';
import { User } from './models/user';
import {
	game_add_new,
	game_delete,
	game_edit_result,
	game_find_by_id,
	recalculate_all_ratings
} from './managers/games';
import { GameID, GameResult } from './models/game';
import { ADMIN } from './models/user_role';
import { SessionID } from './models/session_id';
import { TimeControlID } from './models/time_control';
import { can_user_create_a_game, can_user_delete_a_game, can_user_edit_a_game } from './managers/user_relationships';
import { UsersManager } from './managers/users_manager';
import { ConfigurationManager } from './managers/configuration_manager';

export async function get_page_game_list_own(req: any, res: any) {
	debug(log_now(), 'GET /page/game/list/own...');

	const session = SessionID.from_cookie(req.cookies);
	const r = is_user_logged_in(session);

	if (!r[0]) {
		res.status(401).send(r[1]);
		return;
	}

	res.status(200);
	if (ConfigurationManager.should_cache_data()) {
		res.setHeader('Cache-Control', 'public, max-age=864000, immutable');
	}
	res.sendFile(path.join(__dirname, '../html/game/list/own.html'));
}

export async function get_page_game_list_all(req: any, res: any) {
	debug(log_now(), 'GET /game/list/all...');

	const session = SessionID.from_cookie(req.cookies);
	const r = is_user_logged_in(session);

	if (!r[0]) {
		res.status(401).send(r[1]);
		return;
	}

	res.status(200);
	if (ConfigurationManager.should_cache_data()) {
		res.setHeader('Cache-Control', 'public, max-age=864000, immutable');
	}
	res.sendFile(path.join(__dirname, '../html/game/list/all.html'));
}

export async function get_page_game_create(req: any, res: any) {
	debug(log_now(), 'GET /page/game/create...');

	const session = SessionID.from_cookie(req.cookies);
	const r = is_user_logged_in(session);

	if (!r[0]) {
		res.status(401).send(r[1]);
		return;
	}

	if (!(r[2] as User).can_do(GAMES_CREATE)) {
		debug(log_now(), `User '${session.username}' cannot create games.`);
		res.status(403).send('You cannot create games.');
		return;
	}

	res.status(200);
	if (ConfigurationManager.should_cache_data()) {
		res.setHeader('Cache-Control', 'public, max-age=864000, immutable');
	}
	res.sendFile(path.join(__dirname, '../html/game/create.html'));
}

export async function post_game_create(req: any, res: any) {
	debug(log_now(), 'POST /game/create...');

	const session = SessionID.from_cookie(req.cookies);
	const r = is_user_logged_in(session);

	if (!r[0]) {
		res.status(401).send(r[1]);
		return;
	}

	const creator = r[2] as User;
	if (!creator.can_do(GAMES_CREATE)) {
		debug(log_now(), `User '${session.username}' cannot create users.`);
		res.status(403).send('You cannot create games');
		return;
	}

	const mem = UsersManager.get_instance();

	const white_rid = req.body.w;
	const _white = mem.get_user_by_random_id(white_rid);
	if (_white == undefined) {
		debug(log_now(), `Random id '${white_rid}' for White is not valid.`);
		res.status(500).send('Invalid white user sent to the server.');
		return;
	}

	const black_rid = req.body.b;
	const _black = mem.get_user_by_random_id(black_rid);
	if (_black == undefined) {
		debug(log_now(), `Random id '${black_rid}' for Black is not valid.`);
		res.status(500).send('Invalid black user sent to the server.');
		return;
	}

	const white = _white as User;
	const black = _black as User;
	const result: GameResult = req.body.r;
	const time_control_id: TimeControlID = req.body.tc_i;
	const time_control_name = req.body.tc_n;
	const game_date: DateStringShort = req.body.d;
	const game_time: string = req.body.t; // HH:mm:ss:SSS

	if (white.get_username() == black.get_username()) {
		res.status(500).send('The players cannot be the same.');
		return;
	}

	if (game_date == '') {
		res.status(500).send('The selected date is incorrect.');
		return;
	}
	if (game_time == '') {
		res.status(500).send('The selected time is incorrect.');
		return;
	}

	if (!can_user_create_a_game(creator, white, black)) {
		debug(log_now(), `User cannot create this game.`);
		res.status(403).send('You cannot create this game.');
		return;
	}

	debug(log_now(), `    White: '${white.get_username()}'`);
	debug(log_now(), `    Black: '${black.get_username()}'`);
	debug(log_now(), `    Result: '${result}'`);
	debug(log_now(), `    Time control id: '${time_control_id}'`);
	debug(log_now(), `    Time control name: '${time_control_name}'`);
	debug(log_now(), `    Date of game: '${game_date}'`);
	debug(log_now(), `    Time of game: '${game_time}'`);

	debug(log_now(), `Adding the new game`);

	game_add_new(white, black, result, time_control_id, time_control_name, game_date, game_time);

	res.status(201).send();
}

export async function post_game_edit_result(req: any, res: any) {
	debug(log_now(), 'POST /game/edit_result...');

	const session = SessionID.from_cookie(req.cookies);
	const r = is_user_logged_in(session);

	if (!r[0]) {
		res.status(401).send(r[1]);
		return;
	}

	const user = r[2] as User;
	if (!user.can_do(GAMES_EDIT)) {
		debug(log_now(), `User '${session.username}' cannot edit games.`);
		res.status(403).send('You cannot edit games');
		return;
	}

	const game_id: GameID = req.body.game_id;
	const new_result = req.body.new_result;

	debug(log_now(), `    Game ID: '${game_id}'`);
	debug(log_now(), `    New result: '${new_result}'`);

	const game = game_find_by_id(game_id);
	if (game == undefined) {
		res.status(404).send(`Game was not found.`);
		return;
	}
	let manager = UsersManager.get_instance();

	const is_editable = can_user_edit_a_game(
		user,
		manager.get_user_by_username(game.get_white()) as User,
		manager.get_user_by_username(game.get_black()) as User
	);
	if (!is_editable) {
		res.status(403).send(`You lack permissions to edit this game.`);
		return;
	}

	debug(log_now(), `Editing game...`);

	// actually edit the game now
	game_edit_result(game_id, new_result);

	res.status(200).send();
}

export async function post_game_delete(req: any, res: any) {
	debug(log_now(), 'POST /game/delete...');

	const session = SessionID.from_cookie(req.cookies);
	const r = is_user_logged_in(session);

	if (!r[0]) {
		res.status(401).send(r[1]);
		return;
	}

	const user = r[2] as User;
	if (!user.can_do(GAMES_DELETE)) {
		debug(log_now(), `User '${session.username}' cannot delete games.`);
		res.status(403).send('You cannot delete games');
		return;
	}

	const game_id: GameID = req.body.game_id;

	debug(log_now(), `    Game ID: '${game_id}'`);

	const game = game_find_by_id(game_id);
	if (game == undefined) {
		res.status(404).send(`Game was not found.`);
		return;
	}
	let manager = UsersManager.get_instance();

	const is_deleteable = can_user_delete_a_game(
		user,
		manager.get_user_by_username(game.get_white()) as User,
		manager.get_user_by_username(game.get_black()) as User
	);
	if (!is_deleteable) {
		res.status(403).send(`You lack permissions to delete this game.`);
		return;
	}

	debug(log_now(), `Deleting game...`);

	game_delete(game_id);

	res.status(200).send();
}

export async function post_recalculate_ratings(req: any, res: any) {
	debug(log_now(), 'POST /recalculate/ratings...');

	const session = SessionID.from_cookie(req.cookies);
	const r = is_user_logged_in(session);

	if (!r[0]) {
		res.status(401).send(r[1]);
		return;
	}

	if (!(r[2] as User).is(ADMIN)) {
		debug(log_now(), `User '${session.username}' cannot recalculate ratings.`);
		res.status(403).send('You cannot recalculate ratings.');
		return;
	}

	debug(log_now(), `Recalculating ratings...`);

	// actually recalculating ratings
	recalculate_all_ratings();

	res.status(200).send();
}
