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
import { is_user_logged_in, session_id_delete } from './server/session';
import { encrypt_password_for_user, is_password_of_user_correct } from './utils/encrypt';
import { User } from './models/user';
import { Password } from './models/password';
import { user_overwrite } from './server/users';
import { SessionID } from './models/session_id';

export async function get_users_password_change_page(req: any, res: any) {
	debug(log_now(), 'GET users_password_change_page...');

	const session = new SessionID(req.cookies.session_id, req.cookies.user);

	let r = is_user_logged_in(session);
	if (!r[0]) {
		res.send(r[1]);
		return;
	}

	res.sendFile(path.join(__dirname, '../html/users_password_change.html'));
}

export async function post_users_password_change(req: any, res: any) {
	debug(log_now(), 'POST users_password_change...');

	const session = new SessionID(req.cookies.session_id, req.cookies.user);
	const old_password = req.body.old;
	const new_password = req.body.new;

	const r = is_user_logged_in(session);
	if (!r[0]) {
		res.send(r[1]);
		return;
	}
	let user = r[2] as User;

	// check if password is correct
	const old_pwd = user.get_password();
	const is_password_correct = is_password_of_user_correct(
		old_pwd.encrypted,
		session.username,
		old_password,
		old_pwd.iv
	);

	// is the password correct?
	if (!is_password_correct) {
		debug(log_now(), `    Password for '${session.username}' is incorrect`);
		res.status(404).send({
			r: '0',
			reason: 'Old password is not correct.'
		});
		return;
	}

	// delete all session ids of this user
	session_id_delete(session);

	// make new password
	const _pass = encrypt_password_for_user(session.username, new_password);
	user.set_password(new Password(_pass[0], _pass[1]));

	// overwrite user data
	user_overwrite(user);

	res.send({ r: '1' });
}
