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
const debug = Debug('ELO_CHESS_TRACKER:server_login_logout');
import { Request, Response } from 'express';

import { logNow } from '@common/utils/time';
import { is_password_of_user_correct } from '@server/utils/encrypt';
import { empty_session_id_cookie, make_session_id_cookie } from '@server/utils/cookies';
import { session_id_add, session_id_delete } from '@server/managers/session';
import { SessionIDManager } from '@app/server/managers/session-id-manager';
import { SessionIDTokenFieldName, SessionIDUsernameFieldName } from '@app/common/models/session-id';
import { UsersManager } from '@app/server/managers/users-manager';
import { isNotDefined } from '@app/common/utils/is-defined';
import { UserLoginInputSchema } from '@app/common/schemas/login-logout';
import { Routes } from '@common/routes';
import { safe_parse_request_body, safe_parse_request_cookies } from '@server/utils/schemas';
import { AuthenticationInputSchema } from '@common/schemas/authentication';

export async function post_user_login(req: Request, res: Response) {
	debug(logNow(), `POST ${Routes.USER_LOGIN}`);

	const login_parse = safe_parse_request_body(req, UserLoginInputSchema, res, debug);
	if (login_parse.result === 'Exit') {
		return;
	}

	const username = login_parse.data.u;
	const password_plain_text = login_parse.data.p;

	debug(logNow(), `    Username '${username}'`);

	const user_data = UsersManager.get_instance().get_user_by_username(username);

	// nonexistent user
	if (isNotDefined(user_data)) {
		debug(logNow(), `    User ${username} does not exist`);
		res.status(404).send('Incorrect user or password.');
		return;
	}

	// user exists
	const pwd = user_data.password;

	// check if password is correct
	const is_password_correct = is_password_of_user_correct(username, password_plain_text, pwd);

	// correct password
	if (!is_password_correct) {
		debug(logNow(), `    Password for '${username}' is incorrect`);
		res.status(404).send('Incorrect user or password.');
		return;
	}

	debug(logNow(), `    Password for '${username}' is correct`);

	const token = session_id_add(username);

	// send response
	res.status(200).send({
		cookies: [
			make_session_id_cookie(SessionIDTokenFieldName, token, 1),
			make_session_id_cookie(SessionIDUsernameFieldName, username, 1)
		]
	});
}

export async function post_user_logout(req: Request, res: Response) {
	debug(logNow(), `POST ${Routes.USER_LOGOUT}`);

	const session_parse = safe_parse_request_cookies(req, AuthenticationInputSchema, res, debug);
	if (session_parse.result === 'Exit') {
		return;
	}
	const session = session_parse.data;

	debug(logNow(), `    Cookie:`);
	debug(logNow(), `        Username:   '${session.username}'`);
	// debug(log_now(), `        Session ID: '${session.token}'`);

	// in order to log out a user, the must have been logged in with the given
	// session id token
	if (!SessionIDManager.get_instance().has_session_id(session)) {
		debug(
			logNow(),
			`    User '${session.username}' was never logged in with this session id but it is fine, since they are logging out.`
		);
	} else {
		debug(logNow(), `    User '${session.username}' was logged in.`);
		debug(logNow(), `    Deleting session id of user '${session.username}'...`);
		session_id_delete(session);
		debug(logNow(), `        Deleted.`);
	}
	res.status(200).send({
		cookies: [empty_session_id_cookie(SessionIDTokenFieldName), empty_session_id_cookie(SessionIDUsernameFieldName)]
	});
}
