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
const debug = Debug('ELO_TRACKER:server_login');

import { interleave_strings, log_now } from './utils/misc';
import { is_password_of_user_correct } from './utils/encrypt';
import { user_retrieve } from './server/users';
import { User } from './models/user';
import { make_cookie_string } from './utils/cookies';
import { shuffle } from './utils/shuffle_random';
import { session_id_delete } from './server/session';
import { ServerMemory } from './server/memory';
import { SessionID } from './models/session_id';

const character_samples =
	"abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789+-*/ª!·$%&/()=?¿¡'º|@#~€¬^{},;.:_";

/// Makes a random session id from a starting string.
function random_session_id(str: string): string {
	// convert string to an array
	let string_array: string[] = [];
	for (let i = 0; i < str.length; ++i) {
		string_array.push(str[i]);
	}
	// put more characters until the array is at least 128 characters
	while (string_array.length < 128) {
		const rand_idx = Math.floor(Math.random() * character_samples.length);
		string_array.push(character_samples[rand_idx]);
	}

	shuffle(string_array);
	return string_array.join('');
}

/**
 * @brief Can a user log into the webpage? Are the username and password input correct?
 * @param req Request
 * @param res Result
 * @returns Data
 * @post Creates a new session id for the user.
 */
export async function post_user_log_in(req: any, res: any) {
	debug(log_now(), `POST /log_in`);

	const username = req.body.u;
	const password = req.body.p;

	debug(log_now(), `    Username '${username}'`);

	// user data, which might be null
	const _user_data = user_retrieve(username);

	// nonexistent user
	if (_user_data == null) {
		debug(log_now(), `    User ${username} does not exist`);
		res.status(404).send({ r: '0' });
		return;
	}

	// user exists
	const user = _user_data as User;
	const pwd = user.get_password();

	// check if password is correct
	const is_password_correct = is_password_of_user_correct(pwd.encrypted, username, password, pwd.iv);

	// correct password
	if (!is_password_correct) {
		debug(log_now(), `    Password for '${username}' is incorrect`);
		res.status(404).send({ r: '0' });
		return;
	}

	debug(log_now(), `    Password for '${username}' is correct`);

	// generate "random" "session id"
	const token = random_session_id(interleave_strings(pwd.encrypted, pwd.iv));

	// store session id
	let mem = ServerMemory.get_instance();
	if (!mem.has_session_id(token, user.get_username())) {
		mem.add_session_id(new SessionID(token, user.get_username()));
	}

	// send response
	res.status(200).send({
		r: '1', // result of trying to log in
		cookies: [
			make_cookie_string({
				name: 'session_id',
				value: token,
				days: 28
			}),
			make_cookie_string({
				name: 'user',
				value: user.get_username(),
				days: 28
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
	debug(log_now(), `POST /logout`);

	const username = req.cookies.user;
	const session_id = req.cookies.session_id;

	debug(log_now(), `    Cookie:`);
	debug(log_now(), `        Username:   '${username}'`);
	debug(log_now(), `        Session ID: '${session_id}'`);

	// in order to log out a user, the must have been logged in with the given
	// session id token
	const mem = ServerMemory.get_instance();
	if (!mem.has_session_id(session_id, username)) {
		debug(log_now(), `    User '${username}' was never logged in with this session id.`);
		res.status(200).send('error');
	} else {
		debug(log_now(), `    User '${username}' was logged in.`);
		debug(log_now(), `    Deleting session id of user '${username}'...`);
		session_id_delete(session_id, username);
		debug(log_now(), `        Deleted.`);
		// send response
		res.status(200).send('success');
	}

	return;
}
