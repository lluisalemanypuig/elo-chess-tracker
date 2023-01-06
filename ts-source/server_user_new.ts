/*
Elo rating for a Chess Club
Copyright (C) 2023  Lluís Alemany Puig

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
const debug = Debug('ELO_TRACKER:server_user_new');

import path from 'path';

import { log_now } from './utils/misc';
import { is_user_logged_in } from './server/session';
import { user_add_new, user_exists } from './server/users';
import { User } from './models/user';
import { is_role_string_correct } from './models/user_role';
import { encrypt_password_for_user } from './utils/encrypt';
import { Password } from './models/password';
import { Rating } from './models/rating';

function can_user_create(session_id: string, username: string): boolean {
	let r = is_user_logged_in(session_id, username);
	if (!r[0]) { return false; }

	let user = r[2] as User;
	if (!user.can_do('create_new_user')) {
		debug(log_now(), `    User '${username}' does not have sufficient permissions.`);
		return false;
	}
	return true;
}

export async function user_create_new_get(req: any, res: any) {
	debug(log_now(), "GET create_new_user page...");
	if (!can_user_create(req.cookies.session_id, req.cookies.user)) {
		res.send("403 - Forbidden");
		return;
	}

	res.sendFile(path.join(__dirname, "../html/user_new.html"));
}

export async function user_create_new_post(req: any, res: any) {
	debug(log_now(), "POST create_new_user");

	if (! can_user_create(req.cookies.session_id, req.cookies.user)) {
		res.send("403 - Forbidden");
		return;
	}

	const new_username = req.body.u;
	const new_firstname = req.body.fn;
	const new_lastname = req.body.ln;
	const new_roles = req.body.r;
	const new_password = req.body.p;
	const new_classical_rating = req.body.cr;

	debug(log_now(), `    Username: '${new_username}'`);
	debug(log_now(), `    First name: '${new_firstname}'`);
	debug(log_now(), `    Last name: '${new_lastname}'`);
	debug(log_now(), `    Roles: '${new_roles}'`);
	debug(log_now(), `    Classical rating: '${new_classical_rating}'`);

	if (user_exists(new_username)) {
		res.send({
			"r": "fail",
			"reason": "User already exists"
		});
		return;
	}

	for (let i = 0; i < new_roles.length; ++i) {
		if (!is_role_string_correct(new_roles[i])) {
			res.send({
				"r": "fail",
				"reason": `Role string '${new_roles[i]}' is not correct.`
			});
			return;
		}
	}

	// encrypt password
	let _pass = encrypt_password_for_user(new_username, new_password);

	let u = new User(
		new_username,
		new_firstname, new_lastname,
		new Password(_pass[0], _pass[1]),
		new_roles,
		[], // empty set of games
		new Rating(new_classical_rating, 0, 40)
	);

	user_add_new(u);
	res.send({ "r": "success" });
}
