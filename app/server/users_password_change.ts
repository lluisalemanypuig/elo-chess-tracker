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
const debug = Debug('ELO_CHESS_TRACKER:server_users_password_changes');
import { Request, Response } from 'express';

import { log_now } from '@server/utils/time';
import { is_user_logged_in, session_user_delete_all } from '@server/managers/session';
import { encrypt_password_for_user, is_password_of_user_correct } from '@server/utils/encrypt';
import { user_overwrite } from '@server/managers/users';
import { ConfigurationManager } from '@server/managers/configuration_manager';
import { get_execution_directory } from '@server/managers/environment_manager';
import { isDefined } from '@common/utils/is_defined';
import { Routes } from '@common/routes';
import { InputSchemaOf } from '@common/api/schemas';
import { parse_schema } from '@server/utils/schemas';
import { AuthenticationInputSchema } from '@common/schemas/authentication';

export async function get_page_user_password_change(req: Request, res: Response) {
	debug(log_now(), `GET ${Routes.PAGE_USER_PASSWORD_CHANGE}...`);

	const session_parse = parse_schema(req, AuthenticationInputSchema, debug);
	if (session_parse.result !== 'Success') {
		res.status(401).send(`Failure to parse cookies ${session_parse.result}.`);
		return;
	}
	const session = session_parse.data;

	const r = is_user_logged_in(session);
	if (!isDefined(r[2])) {
		res.status(401).send(r[1]);
		return;
	}

	res.status(200);
	if (ConfigurationManager.should_cache_data()) {
		res.setHeader('Cache-Control', 'public, max-age=864000, immutable');
	}
	res.sendFile(`${get_execution_directory()}/html/user/password_change.html`);
}

export async function post_user_password_change(req: Request, res: Response) {
	debug(log_now(), `POST ${Routes.USER_PASSWORD_CHANGE}...`);

	const session_parse = parse_schema(req, AuthenticationInputSchema, debug);
	if (session_parse.result !== 'Success') {
		res.status(401).send(`Failure to parse cookies ${session_parse.result}.`);
		return;
	}
	const session = session_parse.data;

	const password_parse = InputSchemaOf(Routes.USER_PASSWORD_CHANGE).safeParse(req.body);
	if (!password_parse.success) {
		debug(log_now(), 'Failed to parse schema');
		debug(log_now(), `Error: '${password_parse.error}'`);
		res.status(401).send('Internal error');
		return;
	}

	const old_password = password_parse.data.old;
	const new_password = password_parse.data.new;

	const r = is_user_logged_in(session);
	const user = r[2];

	if (!isDefined(user)) {
		res.status(200).send(r[1]);
		return;
	}

	// check if password is correct
	const old_pwd = user.password;
	const is_password_correct = is_password_of_user_correct(
		old_pwd.encrypted,
		session.username,
		old_password,
		old_pwd.iv
	);

	// is the password correct?
	if (!is_password_correct) {
		debug(log_now(), `    Password for '${session.username}' is incorrect`);
		res.status(500).send('Old password is not correct.');
		return;
	}

	// delete all session ids of this user
	session_user_delete_all(session.username);

	// make new password
	const pass = encrypt_password_for_user(session.username, new_password);
	user.password = { encrypted: pass[0], iv: pass[1] };

	// overwrite user data
	user_overwrite(user);

	res.status(200).send();
}
