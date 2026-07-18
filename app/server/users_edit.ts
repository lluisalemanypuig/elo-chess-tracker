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
const debug = Debug('ELO_CHESS_TRACKER:server_users_edit');
import { Request, Response } from 'express';

import { log_now } from '@server/utils/time';
import { is_user_logged_in } from '@server/managers/session';
import { user_rename_and_reassign_roles } from '@server/managers/users';
import { USER_ROLE_ASSIGN_ID, USER_EDIT, get_role_action_name } from '@common/models/user_action';
import { can_user_edit } from '@server/managers/user_relationships';
import { UsersManager } from '@server/managers/users_manager';
import { ConfigurationManager } from '@server/managers/configuration_manager';
import { get_execution_directory } from '@server/managers/environment_manager';
import { isDefined } from '@common/utils/is_defined';
import { Routes } from '@common/routes';
import { InputSchemaOf } from '@common/api/schemas';
import { parse_error_message, parse_schema } from '@server/utils/schemas';
import { AuthenticationInputSchema } from '@common/schemas/authentication';

export async function get_page_user_edit(req: Request, res: Response) {
	debug(log_now(), `GET ${Routes.PAGE_USER_EDIT}...`);

	const session_parse = parse_schema(req.cookies, AuthenticationInputSchema, debug);
	if (session_parse.result !== 'Success') {
		res.status(401).send(`Failure to parse cookies ${session_parse.result}.`);
		return;
	}
	const session = session_parse.data;
	const r = is_user_logged_in(session);

	const user = r[2];
	if (!isDefined(user)) {
		res.status(401).send(r[1]);
		return;
	}

	if (!user.can_do(USER_EDIT)) {
		debug(log_now(), `    User '${session.username}' does not have sufficient permissions.`);
		res.status(403).send('You cannot edit users');
		return;
	}

	res.status(200);
	if (ConfigurationManager.should_cache_data()) {
		res.setHeader('Cache-Control', 'public, max-age=864000, immutable');
	}
	res.sendFile(`${get_execution_directory()}/html/user/edit.html`);
}

export async function post_user_edit(req: Request, res: Response) {
	debug(log_now(), `POST ${Routes.USER_EDIT}...`);

	const session_parse = parse_schema(req.cookies, AuthenticationInputSchema, debug);
	if (session_parse.result !== 'Success') {
		res.status(401).send(`Failure to parse cookies ${session_parse.result}.`);
		return;
	}
	const session = session_parse.data;
	const r = is_user_logged_in(session);

	const editor = r[2];
	if (!isDefined(editor)) {
		res.status(401).send(r[1]);
		return;
	}

	const user_parse = parse_schema(req.body, InputSchemaOf(Routes.USER_EDIT), debug);
	if (user_parse.result !== 'Success') {
		res.status(401).send(parse_error_message(user_parse.result));
		return;
	}

	const edited_rid = user_parse.data.u;
	const first_name = user_parse.data.f;
	const last_name = user_parse.data.l;
	const roles = user_parse.data.r;

	const mem = UsersManager.get_instance();

	const edited = mem.get_user_by_random_id(edited_rid);
	if (!isDefined(edited)) {
		debug(log_now(), `Random id '${edited_rid}' for user is not valid.`);
		res.status(404).send('Invalid user');
		return;
	}

	debug(log_now(), `User '${editor.username}' is trying to modify user '${edited.username}'`);

	if (!can_user_edit(editor, edited)) {
		res.status(403).send('You do not have enough permissions to edit this user.');
		return;
	}

	debug(log_now(), `    First name: '${first_name}'`);
	debug(log_now(), `    Last name: '${last_name}'`);
	debug(log_now(), `    Roles: '${roles}'`);

	for (const role of roles) {
		if (!editor.is(role)) {
			const action = get_role_action_name(USER_ROLE_ASSIGN_ID, role);
			if (!editor.can_do(action)) {
				res.status(403).send(`You do not have enough permissions to assign role '${role}'.`);
				return;
			}
		}
	}

	user_rename_and_reassign_roles(edited.username, first_name, last_name, roles);

	res.status(200).send();
}
