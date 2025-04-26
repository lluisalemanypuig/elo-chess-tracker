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
const debug = Debug('ELO_TRACKER:server_users_new');

import path from 'path';

import { log_now } from './utils/time';
import { is_user_logged_in } from './managers/session';
import { user_add_new } from './managers/users';
import { User } from './models/user';
import { is_role_string_correct } from './models/user_role';
import { CREATE_USER, USER_ROLE_ASSIGN, get_role_action_name, USER_ROLE_ASSIGN_ID } from './models/user_action';
import { SessionID } from './models/session_id';
import { UsersManager } from './managers/users_manager';
import { ConfigurationManager } from './managers/configuration_manager';

export async function get_page_user_create(req: any, res: any) {
	debug(log_now(), 'GET /page/user/create...');

	const session = SessionID.from_cookie(req.cookies);
	const r = is_user_logged_in(session);

	if (!r[0]) {
		res.status(401).send(r[1]);
		return;
	}

	const user = r[2] as User;
	if (!user.can_do(CREATE_USER)) {
		debug(log_now(), `User '${session.username}' cannot create users.`);
		res.status(403).send('You cannot create users.');
		return;
	}
	if (!user.can_do(USER_ROLE_ASSIGN)) {
		debug(log_now(), `User '${session.username}' cannot assign roles to users.`);
		res.status(403).send(`You cannot assign roles and thus cannot create users.`);
		return;
	}

	res.status(200);
	if (ConfigurationManager.is_production()) {
		res.setHeader('Cache-Control', 'public, max-age=864000, immutable');
	}
	res.sendFile(path.join(__dirname, '../html/user/new.html'));
}

export async function post_user_create(req: any, res: any) {
	debug(log_now(), 'POST /user/create');

	const session = SessionID.from_cookie(req.cookies);
	const r = is_user_logged_in(session);

	if (!r[0]) {
		res.status(401).send(r[1]);
		return;
	}

	const registerer = r[2] as User;
	if (!registerer.can_do(CREATE_USER)) {
		debug(log_now(), `User '${session.username}' cannot create users.`);
		res.status(403).send('You cannot create users.');
		return;
	}
	if (!registerer.can_do(USER_ROLE_ASSIGN)) {
		debug(log_now(), `User '${session.username}' cannot assign roles to users.`);
		res.status(403).send(`You cannot assign roles and thus cannot create users.`);
		return;
	}

	const username = req.body.u;
	const firstname = req.body.fn;
	const lastname = req.body.ln;
	const password = req.body.p;
	const roles = req.body.r;

	debug(log_now(), `User '${req.cookies.user}' is trying to create a new user:`);
	debug(log_now(), `    Username: '${username}'`);
	debug(log_now(), `    First name: '${firstname}'`);
	debug(log_now(), `    Last name: '${lastname}'`);
	debug(log_now(), `    Roles: '${roles}'`);

	if (UsersManager.get_instance().exists(username)) {
		res.status(500).send(`This user already exists`);
		return;
	}

	for (let i = 0; i < roles.length; ++i) {
		const r = roles[i];
		if (!is_role_string_correct(r)) {
			res.status(500).send(`Role string '${r}' is not correct.`);
			return;
		}

		const action = get_role_action_name(USER_ROLE_ASSIGN_ID, r);
		if (!registerer.can_do(action)) {
			res.status(403).send(`You cannot do ${action}.`);
			return;
		}
	}

	user_add_new(username, firstname, lastname, password, roles);
	res.status(201).send();
}
