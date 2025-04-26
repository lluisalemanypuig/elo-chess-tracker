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
const debug = Debug('ELO_TRACKER:server_users_password_changes');

import path from 'path';

import { log_now } from './utils/time';
import { is_user_logged_in, session_user_delete_all } from './managers/session';
import { encrypt_password_for_user, is_password_of_user_correct } from './utils/encrypt';
import { User } from './models/user';
import { Password } from './models/password';
import { user_overwrite } from './managers/users';
import { SessionID } from './models/session_id';
import { ConfigurationManager } from './managers/configuration_manager';

export async function get_page_user_password_change(req: any, res: any) {
	debug(log_now(), 'GET /page/user/password_change_page...');

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
	res.sendFile(path.join(__dirname, '../html/user/password_change.html'));
}

export async function post_user_password_change(req: any, res: any) {
	debug(log_now(), 'POST /user/password_change...');

	const session = SessionID.from_cookie(req.cookies);
	const old_password = req.body.old;
	const new_password = req.body.new;

	const r = is_user_logged_in(session);
	if (!r[0]) {
		res.status(200).send(r[1]);
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
		res.status(500).send('Old password is not correct.');
		return;
	}

	// delete all session ids of this user
	session_user_delete_all(session.username);

	// make new password
	const _pass = encrypt_password_for_user(session.username, new_password);
	user.set_password(new Password(_pass[0], _pass[1]));

	// overwrite user data
	user_overwrite(user);

	res.status(200).send();
}
