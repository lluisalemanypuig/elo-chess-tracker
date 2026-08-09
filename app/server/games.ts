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
const debug = Debug('ELO_CHESS_TRACKER:server_games');
import { Request, Response } from 'express';

import { logNow } from '@common/utils/time';
import { is_user_logged_in } from '@server/managers/session';
import { GAMES_CREATE, GAMES_DELETE, GAMES_EDIT } from '@app/common/models/user-action';
import {
	game_add_new,
	game_delete,
	game_edit_result,
	game_edit_title,
	game_find_by_id,
	recalculate_all_ratings
} from '@server/managers/games';
import { ADMIN } from '@app/common/models/user-role';
import {
	can_user_create_a_game,
	can_user_delete_a_game,
	can_user_edit_a_game
} from '@app/server/managers/user-relationships';
import { UsersManager } from '@app/server/managers/users-manager';
import { ConfigurationManager } from '@app/server/managers/configuration-manager';
import { get_execution_directory } from '@app/server/managers/environment-manager';
import { isNotDefined } from '@app/common/utils/is-defined';
import { Routes } from '@common/routes';
import { InputSchemaOf } from '@common/api/schemas';
import { safe_parse_request_cookies, safe_parse_request_body } from '@server/utils/schemas';
import { AuthenticationInputSchema } from '@common/schemas/authentication';

export async function get_page_game_list_own(req: Request, res: Response) {
	debug(logNow(), `GET ${Routes.PAGE_GAME_LIST_OWN}...`);

	const session_parse = safe_parse_request_cookies(req, AuthenticationInputSchema, res, debug);
	if (session_parse.result === 'Exit') {
		return;
	}
	const session = session_parse.data;
	const r = is_user_logged_in(session);

	const user = r[2];
	if (isNotDefined(user)) {
		res.status(401).send(r[1]);
		return;
	}

	res.status(200);
	if (ConfigurationManager.should_cache_data()) {
		res.setHeader('Cache-Control', 'public, max-age=864000, immutable');
	}
	res.sendFile(`${get_execution_directory()}/html/game/list/own.html`);
}

export async function get_page_game_list_all(req: Request, res: Response) {
	debug(logNow(), `GET ${Routes.PAGE_GAME_LIST_ALL}...`);

	const session_parse = safe_parse_request_cookies(req, AuthenticationInputSchema, res, debug);
	if (session_parse.result === 'Exit') {
		return;
	}
	const session = session_parse.data;
	const r = is_user_logged_in(session);

	const user = r[2];
	if (isNotDefined(user)) {
		res.status(401).send(r[1]);
		return;
	}

	res.status(200);
	if (ConfigurationManager.should_cache_data()) {
		res.setHeader('Cache-Control', 'public, max-age=864000, immutable');
	}
	res.sendFile(`${get_execution_directory()}/html/game/list/all.html`);
}

export async function get_page_game_create(req: Request, res: Response) {
	debug(logNow(), `GET ${Routes.PAGE_GAME_CREATE}...`);

	const session_parse = safe_parse_request_cookies(req, AuthenticationInputSchema, res, debug);
	if (session_parse.result === 'Exit') {
		return;
	}
	const session = session_parse.data;
	const r = is_user_logged_in(session);

	const user = r[2];
	if (isNotDefined(user)) {
		res.status(401).send(r[1]);
		return;
	}

	if (!user.can_do(GAMES_CREATE)) {
		debug(logNow(), `User '${session.username}' cannot create games.`);
		res.status(403).send('You cannot create games.');
		return;
	}

	res.status(200);
	if (ConfigurationManager.should_cache_data()) {
		res.setHeader('Cache-Control', 'public, max-age=864000, immutable');
	}
	res.sendFile(`${get_execution_directory()}/html/game/create.html`);
}

export async function post_game_create(req: Request, res: Response) {
	debug(logNow(), `POST ${Routes.GAME_CREATE}...`);

	const session_parse = safe_parse_request_cookies(req, AuthenticationInputSchema, res, debug);
	if (session_parse.result === 'Exit') {
		return;
	}
	const session = session_parse.data;
	const r = is_user_logged_in(session);

	const creator = r[2];
	if (isNotDefined(creator)) {
		res.status(401).send(r[1]);
		return;
	}

	if (!creator.can_do(GAMES_CREATE)) {
		debug(logNow(), `User '${session.username}' cannot create users.`);
		res.status(403).send('You cannot create games');
		return;
	}

	const game_parse = safe_parse_request_body(req.body, InputSchemaOf(Routes.GAME_CREATE), res, debug);
	if (game_parse.result === 'Exit') {
		return;
	}

	const white_rid = game_parse.data.white;
	const black_rid = game_parse.data.black;
	const game_title = game_parse.data.title;
	const result = game_parse.data.result;
	const time_control_id = game_parse.data.time_control_id;
	const time_control_name = game_parse.data.time_control_name;
	const game_date = game_parse.data.whenCreated;
	const game_time = game_parse.data.timeCreated;

	const mem = UsersManager.get_instance();

	const white = mem.get_user_by_public_id(white_rid);
	if (isNotDefined(white)) {
		debug(logNow(), `Random id '${white_rid}' for White is not valid.`);
		res.status(500).send('Invalid white user sent to the server.');
		return;
	}

	const black = mem.get_user_by_public_id(black_rid);
	if (isNotDefined(black)) {
		debug(logNow(), `Random id '${black_rid}' for Black is not valid.`);
		res.status(500).send('Invalid black user sent to the server.');
		return;
	}

	if (white.username == black.username) {
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
		debug(logNow(), `User cannot create this game.`);
		res.status(403).send('You cannot create this game.');
		return;
	}

	debug(logNow(), `    Title: '${game_title}'`);
	debug(logNow(), `    White: '${white.username}'`);
	debug(logNow(), `    Black: '${black.username}'`);
	debug(logNow(), `    Result: '${result}'`);
	debug(logNow(), `    Time control id: '${time_control_id}'`);
	debug(logNow(), `    Time control name: '${time_control_name}'`);
	debug(logNow(), `    Date of game: '${game_date}'`);
	debug(logNow(), `    Time of game: '${game_time}'`);

	debug(logNow(), `Adding the new game`);

	game_add_new(game_title, white, black, result, time_control_id, time_control_name, game_date, game_time);

	res.status(201).send();
}

export async function post_game_edit_result(req: Request, res: Response) {
	debug(logNow(), `POST ${Routes.GAME_EDIT_RESULT}...`);

	const session_parse = safe_parse_request_cookies(req, AuthenticationInputSchema, res, debug);
	if (session_parse.result === 'Exit') {
		return;
	}
	const session = session_parse.data;
	const r = is_user_logged_in(session);

	const user = r[2];
	if (isNotDefined(user)) {
		res.status(401).send(r[1]);
		return;
	}

	if (!user.can_do(GAMES_EDIT)) {
		debug(logNow(), `User '${session.username}' cannot edit games.`);
		res.status(403).send('You cannot edit games');
		return;
	}

	const game_parse = safe_parse_request_body(req.body, InputSchemaOf(Routes.GAME_EDIT_RESULT), res, debug);
	if (game_parse.result === 'Exit') {
		return;
	}

	const game_id = game_parse.data.id;
	const new_result = game_parse.data.new_result;

	debug(logNow(), `    Game ID: '${game_id}'`);
	debug(logNow(), `    New result: '${new_result}'`);

	const game = game_find_by_id(game_id);
	if (isNotDefined(game)) {
		res.status(404).send(`Game was not found.`);
		return;
	}

	const manager = UsersManager.get_instance();

	const white = manager.get_user_by_username(game.white);
	if (isNotDefined(white)) {
		debug(logNow(), `Random id '${white}' for White is not valid.`);
		res.status(500).send('Invalid white user sent to the server.');
		return;
	}

	const black = manager.get_user_by_username(game.black);
	if (isNotDefined(black)) {
		debug(logNow(), `Random id '${black}' for Black is not valid.`);
		res.status(500).send('Invalid black user sent to the server.');
		return;
	}

	const is_editable = can_user_edit_a_game(user, white, black);
	if (!is_editable) {
		res.status(403).send(`You lack permissions to edit this game.`);
		return;
	}

	debug(logNow(), `Editing game...`);

	// actually edit the game now
	game_edit_result(game_id, new_result);

	res.status(200).send();
}

export async function post_game_edit_title(req: Request, res: Response) {
	debug(logNow(), `POST ${Routes.GAME_EDIT_TITLE}...`);

	const session_parse = safe_parse_request_cookies(req, AuthenticationInputSchema, res, debug);
	if (session_parse.result === 'Exit') {
		return;
	}
	const session = session_parse.data;
	const r = is_user_logged_in(session);

	const user = r[2];
	if (isNotDefined(user)) {
		res.status(401).send(r[1]);
		return;
	}

	if (!user.can_do(GAMES_EDIT)) {
		debug(logNow(), `User '${session.username}' cannot edit games.`);
		res.status(403).send('You cannot edit games');
		return;
	}

	const game_parse = safe_parse_request_body(req.body, InputSchemaOf(Routes.GAME_EDIT_TITLE), res, debug);
	if (game_parse.result === 'Exit') {
		return;
	}

	const game_id = game_parse.data.id;
	const title = game_parse.data.title;

	debug(logNow(), `    Game ID: '${game_id}'`);
	debug(logNow(), `    New title: '${title}'`);

	const game = game_find_by_id(game_id);
	if (isNotDefined(game)) {
		res.status(404).send(`Game was not found.`);
		return;
	}

	const manager = UsersManager.get_instance();

	const white = manager.get_user_by_username(game.white);
	if (isNotDefined(white)) {
		debug(logNow(), `Random id '${white}' for White is not valid.`);
		res.status(500).send('Invalid white user sent to the server.');
		return;
	}

	const black = manager.get_user_by_username(game.black);
	if (isNotDefined(black)) {
		debug(logNow(), `Random id '${black}' for Black is not valid.`);
		res.status(500).send('Invalid black user sent to the server.');
		return;
	}

	const is_editable = can_user_edit_a_game(user, white, black);
	if (!is_editable) {
		res.status(403).send(`You lack permissions to edit this game.`);
		return;
	}

	debug(logNow(), `Editing game...`);

	// actually edit the game now
	game_edit_title(game_id, title);

	res.status(200).send();
}

export async function post_game_delete(req: Request, res: Response) {
	debug(logNow(), `POST ${Routes.GAME_DELETE}...`);

	const session_parse = safe_parse_request_cookies(req, AuthenticationInputSchema, res, debug);
	if (session_parse.result === 'Exit') {
		return;
	}
	const session = session_parse.data;
	const r = is_user_logged_in(session);

	const user = r[2];
	if (isNotDefined(user)) {
		res.status(401).send(r[1]);
		return;
	}

	if (!user.can_do(GAMES_DELETE)) {
		debug(logNow(), `User '${session.username}' cannot delete games.`);
		res.status(403).send('You cannot delete games');
		return;
	}

	const game_parse = safe_parse_request_body(req.body, InputSchemaOf(Routes.GAME_DELETE), res, debug);
	if (game_parse.result === 'Exit') {
		return;
	}

	const game_id = game_parse.data.id;

	debug(logNow(), `    Game ID: '${game_id}'`);

	const game = game_find_by_id(game_id);
	if (isNotDefined(game)) {
		res.status(404).send(`Game was not found.`);
		return;
	}

	const manager = UsersManager.get_instance();

	const white = manager.get_user_by_username(game.white);
	if (isNotDefined(white)) {
		debug(logNow(), `Random id '${white}' for White is not valid.`);
		res.status(500).send('Invalid white user sent to the server.');
		return;
	}

	const black = manager.get_user_by_username(game.black);
	if (isNotDefined(black)) {
		debug(logNow(), `Random id '${black}' for Black is not valid.`);
		res.status(500).send('Invalid black user sent to the server.');
		return;
	}

	const is_deleteable = can_user_delete_a_game(user, white, black);
	if (!is_deleteable) {
		res.status(403).send(`You lack permissions to delete this game.`);
		return;
	}

	debug(logNow(), `Deleting game...`);

	game_delete(game_id);

	res.status(200).send();
}

export async function post_recalculate_ratings(req: Request, res: Response) {
	debug(logNow(), `POST ${Routes.RECALCULATE_RATINGS}...`);

	const session_parse = safe_parse_request_cookies(req, AuthenticationInputSchema, res, debug);
	if (session_parse.result === 'Exit') {
		return;
	}
	const session = session_parse.data;
	const r = is_user_logged_in(session);

	const user = r[2];
	if (isNotDefined(user)) {
		res.status(401).send(r[1]);
		return;
	}

	if (!user.is(ADMIN)) {
		debug(logNow(), `User '${session.username}' cannot recalculate ratings.`);
		res.status(403).send('You cannot recalculate ratings.');
		return;
	}

	debug(logNow(), `Recalculating ratings...`);

	// actually recalculating ratings
	recalculate_all_ratings();

	res.status(200).send();
}
