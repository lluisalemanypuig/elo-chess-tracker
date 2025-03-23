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
const debug = Debug('ELO_TRACKER:server_users_edit');

import path from 'path';

import { log_now } from './utils/time';
import { is_user_logged_in } from './managers/session';
import { user_rename_and_reassign_roles } from './managers/users';
import { User } from './models/user';
import { ASSIGN_ROLE_ID, EDIT_USER, get_role_action_name } from './models/user_action';
import { SessionID } from './models/session_id';
import { can_user_edit } from './models/user_relationships';
import { UsersManager } from './managers/users_manager';

export async function get_page_user_edit(req: any, res: any) {
	debug(log_now(), 'GET /user/edit...');

	const session = SessionID.from_cookie(req.cookies);
	const r = is_user_logged_in(session);

	if (!r[0]) {
		res.status(401).send(r[1]);
		return;
	}

	const user = r[2] as User;
	if (!user.can_do(EDIT_USER)) {
		debug(log_now(), `    User '${session.username}' does not have sufficient permissions.`);
		res.status(403).send('You cannot edit users');
		return;
	}

	res.status(200)
		.setHeader('Cache-Control', 'public, max-age=864000, immutable')
		.sendFile(path.join(__dirname, '../html/user/edit.html'));
}

export async function post_user_edit(req: any, res: any) {
	debug(log_now(), 'POST /user/edit...');

	const session = SessionID.from_cookie(req.cookies);
	const r = is_user_logged_in(session);

	if (!r[0]) {
		res.status(401).send(r[1]);
		return;
	}
	const editor = r[2] as User;

	const mem = UsersManager.get_instance();

	const edited_rid = req.body.u;
	const _edited = mem.get_user_by_random_id(edited_rid);
	if (_edited == undefined) {
		debug(log_now(), `Random id '${edited_rid}' for user is not valid.`);
		res.status(404).send('Invalid user');
		return;
	}

	const edited = _edited as User;

	debug(log_now(), `User '${editor.get_username()}' is trying to modify user '${edited.get_username()}'`);

	if (!can_user_edit(editor, edited)) {
		res.status(403).send('You do not have enough permissions to edit this user.');
		return;
	}

	const first_name = req.body.f;
	const last_name = req.body.l;
	const roles = req.body.r;

	debug(log_now(), `    First name: '${first_name}'`);
	debug(log_now(), `    Last name: '${last_name}'`);
	debug(log_now(), `    Roles: '${roles}'`);

	for (const role of roles) {
		if (!editor.is(role)) {
			const action = get_role_action_name(ASSIGN_ROLE_ID, role);
			if (!editor.can_do(action)) {
				res.status(403).send(`You do not have enough permissions to assign role '${role}'.`);
				return;
			}
		}
	}

	user_rename_and_reassign_roles(edited.get_username(), first_name, last_name, roles);

	res.status(200).send();
}
