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
const debug = Debug('ELO_TRACKER:server_login');

import { log_now } from './utils/time';
import { is_password_of_user_correct } from './utils/encrypt';
import { user_retrieve } from './managers/users';
import { make_cookie_string } from './utils/cookies';
import { session_id_add, session_id_delete } from './managers/session';
import { SessionIDManager } from './managers/session_id_manager';
import { SessionID } from './models/session_id';
import { User } from './models/user';

/**
 * @brief Can a user log into the webpage? Are the username and password input correct?
 * @param req Request
 * @param res Result
 * @returns Data
 * @post Creates a new session id for the user.
 */
export async function post_user_log_in(req: any, res: any) {
	debug(log_now(), `POST user_log_in`);

	const username = req.body.u;
	const password_plain_text = req.body.p;

	debug(log_now(), `    Username '${username}'`);

	const _user_data = user_retrieve(username);

	// nonexistent user
	if (_user_data == undefined) {
		debug(log_now(), `    User ${username} does not exist`);
		res.status(404).send({ r: '0' });
		return;
	}

	// user exists
	const pwd = (_user_data as User).get_password();

	// check if password is correct
	const is_password_correct = is_password_of_user_correct(pwd.encrypted, username, password_plain_text, pwd.iv);

	// correct password
	if (!is_password_correct) {
		debug(log_now(), `    Password for '${username}' is incorrect`);
		res.status(404).send({ r: '0' });
		return;
	}

	debug(log_now(), `    Password for '${username}' is correct`);

	const token = session_id_add(username);

	// send response
	res.status(200).send({
		r: '1', // result of trying to log in
		cookies: [
			make_cookie_string({
				name: 'token',
				value: token,
				days: 1
			}),
			make_cookie_string({
				name: 'user',
				value: username,
				days: 1
			})
		]
	});
}

/**
 * @brief Logs a user out of the website.
 * @param req
 * @param res
 * @post Deletes the user's session id.
 */
export async function post_user_log_out(req: any, res: any) {
	debug(log_now(), `POST user_log_out`);

	const session = new SessionID(req.cookies.token, req.cookies.user);

	debug(log_now(), `    Cookie:`);
	debug(log_now(), `        Username:   '${session.username}'`);
	debug(log_now(), `        Session ID: '${session.token}'`);

	// in order to log out a user, the must have been logged in with the given
	// session id token
	const mem = SessionIDManager.get_instance();
	if (!mem.has_session_id(session)) {
		debug(log_now(), `    User '${session.username}' was never logged in with this session id.`);
		res.status(200).send('error');
	} else {
		debug(log_now(), `    User '${session.username}' was logged in.`);
		debug(log_now(), `    Deleting session id of user '${session.username}'...`);
		session_id_delete(session);
		debug(log_now(), `        Deleted.`);
		// send response
		res.status(200).send('success');
	}

	return;
}
