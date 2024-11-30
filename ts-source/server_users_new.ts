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
const debug = Debug('ELO_TRACKER:server_user_new');

import path from 'path';

import { log_now } from './utils/misc';
import { is_user_logged_in } from './server/session';
import { user_add_new, user_exists } from './server/users';
import { User } from './models/user';
import { is_role_string_correct, STUDENT, MEMBER, TEACHER, ADMIN } from './models/user_role';
import {
	ASSIGN_ROLE_ADMIN,
	ASSIGN_ROLE_TEACHER,
	ASSIGN_ROLE_MEMBER,
	ASSIGN_ROLE_STUDENT,
	CREATE_USER
} from './models/user_action';
import { encrypt_password_for_user } from './utils/encrypt';
import { Password } from './models/password';
import { TimeControlRating } from './models/time_control_rating';
import { RatingSystem } from './server/rating_system';

export async function get_users_create_page(req: any, res: any) {
	debug(log_now(), 'GET users_create_page...');

	const username = req.cookies.user;
	const r = is_user_logged_in(req.cookies.session_id, username);
	if (!r[0]) {
		res.send(r[1]);
		return;
	}

	if (!(r[2] as User).can_do(CREATE_USER)) {
		debug(log_now(), `User '${username}' cannot create users.`);
		res.send('403 - Forbidden');
		return;
	}

	res.sendFile(path.join(__dirname, '../html/users_new.html'));
}

export async function post_users_create(req: any, res: any) {
	debug(log_now(), 'POST users_create');

	const username = req.cookies.user;
	const r = is_user_logged_in(req.cookies.session_id, username);
	if (!r[0]) {
		res.send(r[1]);
		return;
	}

	const registerer = r[2] as User;
	if (!registerer.can_do(CREATE_USER)) {
		debug(log_now(), `User '${username}' cannot create users.`);
		res.send('403 - Forbidden');
		return;
	}

	const new_username = req.body.u;
	const new_firstname = req.body.fn;
	const new_lastname = req.body.ln;
	const new_roles = req.body.r;
	const new_password = req.body.p;

	debug(log_now(), `User '${req.cookies.user}' is trying to create a new user:`);
	debug(log_now(), `    Username: '${new_username}'`);
	debug(log_now(), `    First name: '${new_firstname}'`);
	debug(log_now(), `    Last name: '${new_lastname}'`);
	debug(log_now(), `    Roles: '${new_roles}'`);

	if (user_exists(new_username)) {
		res.send({
			r: '0',
			reason: `User '${new_username}' already exists`
		});
		return;
	}

	for (let i = 0; i < new_roles.length; ++i) {
		if (!is_role_string_correct(new_roles[i])) {
			res.send({
				r: '0',
				reason: `Role string '${new_roles[i]}' is not correct.`
			});
			return;
		}
	}

	let can_create: boolean = true;
	if (new_roles.includes(ADMIN)) {
		can_create = can_create && registerer.can_do(ASSIGN_ROLE_ADMIN);
		if (!registerer.can_do(ASSIGN_ROLE_ADMIN)) {
			debug(log_now(), `User '${username}' cannot create admins.`);
		}
	}
	if (new_roles.includes(TEACHER)) {
		can_create = can_create && registerer.can_do(ASSIGN_ROLE_TEACHER);
		if (!registerer.can_do(ASSIGN_ROLE_TEACHER)) {
			debug(log_now(), `User '${username}' cannot create teachers.`);
		}
	}
	if (new_roles.includes(MEMBER)) {
		can_create = can_create && registerer.can_do(ASSIGN_ROLE_MEMBER);
		if (!registerer.can_do(ASSIGN_ROLE_MEMBER)) {
			debug(log_now(), `User '${username}' cannot create members.`);
		}
	}
	if (new_roles.includes(STUDENT)) {
		can_create = can_create && registerer.can_do(ASSIGN_ROLE_STUDENT);
		if (!registerer.can_do(ASSIGN_ROLE_STUDENT)) {
			debug(log_now(), `User '${username}' cannot create students.`);
		}
	}

	if (!can_create) {
		res.send({
			r: '0',
			reason: `You do not have enough permissions to create a user with the selected roles.`
		});
		return;
	}

	// encrypt password
	let _pass = encrypt_password_for_user(new_username, new_password);

	let ratings: TimeControlRating[] = [];
	const rating_system = RatingSystem.get_instance();

	debug(rating_system.get_unique_time_controls_ids());
	rating_system.get_unique_time_controls_ids().forEach((id: string) => {
		ratings.push(new TimeControlRating(id, rating_system.get_new_rating()));
	});

	let u = new User(
		new_username,
		new_firstname,
		new_lastname,
		new Password(_pass[0], _pass[1]),
		new_roles,
		[], // empty set of games
		ratings
	);

	user_add_new(u);
	res.send({ r: '1' });
}
