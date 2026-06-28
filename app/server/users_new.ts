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
const debug = Debug('ELO_CHESS_TRACKER:server_users_new');
import { Request, Response } from 'express';

import { log_now } from '@server/utils/time';
import { is_user_logged_in } from '@server/managers/session';
import { user_add_new } from '@server/managers/users';
import { is_role_string_correct } from '@common/models/user_role';
import { CREATE_USER, USER_ROLE_ASSIGN, get_role_action_name, USER_ROLE_ASSIGN_ID } from '@common/models/user_action';
import { UsersManager } from '@server/managers/users_manager';
import { ConfigurationManager } from '@server/managers/configuration_manager';
import { get_execution_directory } from '@server/managers/environment_manager';
import { AuthenticationSchema } from '@common/schemas/authentication';
import { isDefined } from '@common/utils/is_defined';
import { UserCreateSchema } from '@app/common/schemas/user';

export async function get_page_user_create(req: Request, res: Response) {
	debug(log_now(), 'GET /page/user/create...');

	const session_parse = AuthenticationSchema.safeParse(req.cookies);
	if (!session_parse.success) {
		debug(log_now(), 'Failed to parse schema');
		debug(log_now(), `Error: '${session_parse.error}'`);
		res.status(401).send('Internal error');
		return;
	}
	const session = session_parse.data;
	const r = is_user_logged_in(session);

	const user = r[2];
	if (!isDefined(user)) {
		res.status(401).send(r[1]);
		return;
	}

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
	if (ConfigurationManager.should_cache_data()) {
		res.setHeader('Cache-Control', 'public, max-age=864000, immutable');
	}
	res.sendFile(`${get_execution_directory()}/html/user/new.html`);
}

export async function post_user_create(req: Request, res: Response) {
	debug(log_now(), 'POST /user/create');

	const session_parse = AuthenticationSchema.safeParse(req.cookies);
	if (!session_parse.success) {
		debug(log_now(), 'Failed to parse schema');
		debug(log_now(), `Error: '${session_parse.error}'`);
		res.status(401).send('Internal error');
		return;
	}
	const session = session_parse.data;
	const r = is_user_logged_in(session);

	const registerer = r[2];
	if (!isDefined(registerer)) {
		res.status(401).send(r[1]);
		return;
	}

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

	const user_parse = UserCreateSchema.safeParse(req.cookies);
	if (!user_parse.success) {
		debug(log_now(), 'Failed to parse schema');
		debug(log_now(), `Error: '${user_parse.error}'`);
		res.status(401).send('Internal error');
		return;
	}

	const username = user_parse.data.u;
	const firstname = user_parse.data.fn;
	const lastname = user_parse.data.ln;
	const password = user_parse.data.p;
	const roles = user_parse.data.r;

	debug(log_now(), `User '${session.username}' is trying to create a new user:`);
	debug(log_now(), `    Username: '${username}'`);
	debug(log_now(), `    First name: '${firstname}'`);
	debug(log_now(), `    Last name: '${lastname}'`);
	debug(log_now(), `    Roles: '${roles}'`);

	if (UsersManager.get_instance().exists(username)) {
		res.status(500).send(`This user already exists`);
		return;
	}

	for (const r of roles) {
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
