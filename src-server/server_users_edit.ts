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
const debug = Debug('ELO_TRACKER:server_user_edit');

import path from 'path';

import { log_now } from './utils/time';
import { is_user_logged_in } from './managers/session';
import { user_retrieve, user_rename_and_reassign_roles } from './managers/users';
import { User } from './models/user';
import { EDIT_USER } from './models/user_action';

import { SessionIDManager } from './managers/session_id_manager';
import { SessionID } from './models/session_id';
import { can_user_edit } from './models/user_relationships';
import { UsersManager } from './managers/users_manager';

export async function get_page_user_edit(req: any, res: any) {
	debug(log_now(), 'GET /user/edit...');

	const session = SessionID.from_cookie(req.cookies);

	if (!SessionIDManager.get_instance().has_session_id(session)) {
		debug(log_now(), `    User '${session.username}' is not logged in.`);
		res.send('403 - Forbidden');
		return;
	}

	const _user = user_retrieve(session.username);
	if (_user == undefined) {
		debug(log_now(), `    User '${session.username}' does not exist.`);
		res.send('403 - Forbidden');
		return;
	}

	const user = _user as User;
	if (!user.can_do(EDIT_USER)) {
		debug(log_now(), `    User '${session.username}' does not have sufficient permissions.`);
		res.send('403 - Forbidden');
		return;
	}

	res.sendFile(path.join(__dirname, '../html/user/edit.html'));
}

export async function post_user_edit(req: any, res: any) {
	debug(log_now(), 'POST /user/edit...');

	const session = SessionID.from_cookie(req.cookies);
	const r = is_user_logged_in(session);

	if (!r[0]) {
		res.send({ r: '0', reason: r[1] });
		return;
	}
	const editor = r[2] as User;

	const mem = UsersManager.get_instance();

	const edited_rid = req.body.u;
	const _edited = mem.get_user_by_random_id(edited_rid);
	if (_edited == undefined) {
		debug(log_now(), `Random id '${edited_rid}' for user is not valid.`);
		res.send({ r: '0', reason: 'Invalid user' });
		return;
	}

	const edited = _edited as User;

	debug(log_now(), `User '${editor.get_username()}' is trying to modify user '${edited.get_username()}'`);

	if (!can_user_edit(editor, edited)) {
		res.send({
			r: '0',
			reason: 'You do not have enough permissions to edit this user.'
		});
		return;
	}

	debug(log_now(), `    First name: '${req.body.f}'`);
	debug(log_now(), `    Last name: '${req.body.l}'`);
	debug(log_now(), `    Roles: '${req.body.r}'`);

	user_rename_and_reassign_roles(edited.get_username(), req.body.f, req.body.l, req.body.r);

	res.send({ r: '1' });
}
