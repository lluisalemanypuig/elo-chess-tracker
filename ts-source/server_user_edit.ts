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
const debug = Debug('ELO_TRACKER:server_user_edit');

import path from 'path';

import { log_now } from './utils/misc';
import { session_id_exists } from './server/session';
import { user_retrieve } from './server/users';
import { User } from './models/user';

function user_can_edit(id: string, username: string): boolean {
	if (!session_id_exists(id, username)) {
		debug(log_now(), `    User '${username}' is not logged in.`);
		return false;
	}
	let _user = user_retrieve(username);
	if (_user == null) {
		debug(log_now(), `    User '${username}' does not exist.`);
		return false;
	}
	let user = _user as User;
	if (!user.can_do('edit_existing_user')) {
		debug(log_now(), `    User '${username}' does not have sufficient permissions.`);
		return false;
	}
	return true;
}

export async function user_edit_existing_get(req: any, res: any) {
	debug(log_now(), "GET edit_existing_user page...");
	if (!user_can_edit(req.cookies.session_id, req.cookies.user)) {
		res.send("403 - Forbidden");
		return;
	}

	res.sendFile(path.join(__dirname, "../html/user_edit.html"));
}

export async function user_edit_existing_post(req: any, res: any) {
	
}
