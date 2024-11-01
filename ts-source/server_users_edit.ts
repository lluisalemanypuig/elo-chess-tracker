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
const debug = Debug('ELO_TRACKER:server_user_edit');

import path from 'path';

import { log_now } from './utils/misc';
import { is_user_logged_in, session_id_exists } from './server/session';
import { user_retrieve, user_rename_reassign_roles } from './server/users';
import { User } from './models/user';
import { ADMIN, MEMBER, STUDENT, TEACHER } from './models/user_role';
import { EDIT_ADMIN, EDIT_MEMBER, EDIT_STUDENT, EDIT_TEACHER } from './models/user_action';

export async function get_users_edit_page(req: any, res: any) {
	debug(log_now(), "GET users_edit_page...");

	const id = req.cookies.session_id;
	const username = req.cookies.user;
	if (!session_id_exists(id, username)) {
		debug(log_now(), `    User '${username}' is not logged in.`);
		res.send("403 - Forbidden");
		return;
	}

	let _user = user_retrieve(username);
	if (_user == null) {
		debug(log_now(), `    User '${username}' does not exist.`);
		res.send("403 - Forbidden");
		return;
	}

	let user = _user as User;
	if (!user.can_do(EDIT_MEMBER) && !user.can_do(EDIT_STUDENT)) {
		debug(log_now(), `    User '${username}' does not have sufficient permissions.`);
		res.send("403 - Forbidden");
		return;
	}

	res.sendFile(path.join(__dirname, "../html/users_edit.html"));
}

export async function post_users_edit(req: any, res: any) {
	debug(log_now(), "POST users_edit...");

	const session_id = req.cookies.session_id;
	const username = req.cookies.user;

	let r = is_user_logged_in(session_id, username);
	if (!r[0]) {
		res.send({ 'r' : '0', 'reason' : r[1] });
		return;
	}
	let modifier = r[2] as User;

	let _modified = user_retrieve(req.body.u);
	if (_modified == null) {
		res.send({ 'r' : '0', 'reason' : `User '${req.body.u}' to be modified does not exist.` });
		return;
	}
	let modified = _modified as User;

	debug(log_now(), `User '${modifier.get_username()}' is trying to modify user '${modified.get_username()}'`);

	let enough_permissions: boolean = true;
	if (modified.get_roles().includes(ADMIN) && !modifier.can_do(EDIT_ADMIN)) {
		enough_permissions = false;
	}
	if (modified.get_roles().includes(TEACHER) && !modifier.can_do(EDIT_TEACHER)) {
		enough_permissions = false;
	}
	if (modified.get_roles().includes(MEMBER) && !modifier.can_do(EDIT_MEMBER)) {
		enough_permissions = false;
	}
	if (modified.get_roles().includes(STUDENT) && !modifier.can_do(EDIT_STUDENT)) {
		enough_permissions = false;
	}

	if (!enough_permissions) {
		res.send({ 'r' : '0', 'reason' : "You do not have enough permissions to edit this user." });
		return;
	}

	debug(log_now(), `    First name: '${req.body.f}'`);
	debug(log_now(), `    Last name: '${req.body.l}'`);
	debug(log_now(), `    Roles: '${req.body.r}'`);

	user_rename_reassign_roles(
		modified.get_username(),
		req.body.f, req.body.l,
		req.body.r
	);

	res.send({ 'r' : '1' });
}
