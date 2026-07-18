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

import { log_now } from '@server/utils/time';
import { is_password_of_user_correct } from '@server/utils/encrypt';
import { empty_session_id_cookie, make_session_id_cookie } from '@server/utils/cookies';
import { ROUTE_USER_LOGIN, ROUTE_USER_LOGOUT } from '@common/routes';
import { session_id_add, session_id_delete } from '@server/managers/session';
import { SessionIDManager } from '@server/managers/session_id_manager';
import { SessionIDTokenFieldName, SessionIDUsernameFieldName } from '@common/models/session_id';
import { User } from '@common/models/user';
import { UsersManager } from '@server/managers/users_manager';
import { AuthenticationInputSchema } from '@common/schemas/authentication';
import { isDefined } from '@common/utils/is_defined';
import { UserLoginInputSchema } from '@common/schemas/login_logout';

export async function post_user_login(req: Request, res: Response) {
	debug(log_now(), `POST ${ROUTE_USER_LOGIN}`);

	const login_parse = UserLoginInputSchema.safeParse(req.body);
	if (!login_parse.success) {
		debug(log_now(), 'Failed to parse schema');
		debug(log_now(), `Error: '${login_parse.error}'`);
		res.status(401).send('Internal error');
		return;
	}

	const username = login_parse.data.u;
	const password_plain_text = login_parse.data.p;

	debug(log_now(), `    Username '${username}'`);

	const user_data = UsersManager.get_instance().get_user_by_username(username);

	// nonexistent user
	if (!isDefined(user_data)) {
		debug(log_now(), `    User ${username} does not exist`);
		res.status(404).send('Incorrect user or password.');
		return;
	}

	// user exists
	const pwd = (user_data as User).password;

	// check if password is correct
	const is_password_correct = is_password_of_user_correct(username, password_plain_text, pwd.encrypted, pwd.iv);

	// correct password
	if (!is_password_correct) {
		debug(log_now(), `    Password for '${username}' is incorrect`);
		res.status(404).send('Incorrect user or password.');
		return;
	}

	debug(log_now(), `    Password for '${username}' is correct`);

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
	debug(log_now(), `POST ${ROUTE_USER_LOGOUT}`);

	const session_parse = AuthenticationInputSchema.safeParse(req.cookies);
	if (!session_parse.success) {
		debug(log_now(), 'Failed to parse schema');
		debug(log_now(), `Error: '${session_parse.error}'`);
		res.status(401).send('Internal error');
		return;
	}
	const session = session_parse.data;

	debug(log_now(), `    Cookie:`);
	debug(log_now(), `        Username:   '${session.username}'`);
	// debug(log_now(), `        Session ID: '${session.token}'`);

	// in order to log out a user, the must have been logged in with the given
	// session id token
	if (!SessionIDManager.get_instance().has_session_id(session)) {
		debug(
			log_now(),
			`    User '${session.username}' was never logged in with this session id but it is fine, since they are logging out.`
		);
	} else {
		debug(log_now(), `    User '${session.username}' was logged in.`);
		debug(log_now(), `    Deleting session id of user '${session.username}'...`);
		session_id_delete(session);
		debug(log_now(), `        Deleted.`);
	}
	res.status(200).send({
		cookies: [empty_session_id_cookie(SessionIDTokenFieldName), empty_session_id_cookie(SessionIDUsernameFieldName)]
	});
}
