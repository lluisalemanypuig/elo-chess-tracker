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
import { User } from '../models/user';
import { log_now } from '../utils/misc';
const debug = Debug('ELO_TRACKER:server_session');

import { ServerMemory } from "./memory";
import { SessionID } from './session_id';
import { user_retrieve } from './users';

/// Add a new session id
export function session_id_add(id: string, username: string): void {
	let mem = ServerMemory.get_instance();
	mem.add_session_id( new SessionID(id, username) );
	debug(log_now(), `Currently, '${mem.num_session_ids()}' sessions`);
}

/// Deletes a session id.
export function session_id_delete(id: string, username: string): void {
	let mem = ServerMemory.get_instance();

	debug(log_now(), `Before deleting, '${mem.num_session_ids()}' sessions`);
	let idx = mem.index_session_id(id, username);
	if (idx != -1) {
		debug(log_now(), `    Session of user '${username}' was found. Deleting...`);
		mem.remove_session_id(idx);
	}
	else {
		debug(log_now(), `    Session of user '${username}' was not found.`);
	}

	debug(log_now(), `Currently, '${mem.num_session_ids()}' sessions`);
}

/**
 * @brief Is a user logged in?
 * 
 * Checks that a user logged in or not using the cookies.
 * @param session_id Session id string.
 * @param username Username string.
 * @returns 
 */
export function is_user_logged_in(session_id: string, username: string): [boolean,string,User|null] {
	if (!ServerMemory.get_instance() .has_session_id(session_id, username)) {
		debug(log_now(), `Session does not exist for user '${username}'.`);
		return [false, "403 - Forbidden", null];
	}
	let user = user_retrieve(username);
	if (user == null) {
		debug(log_now(), `User '${username}' does not exist.`);
		return [false, "403 - Forbidden", null];
	}
    return [true, "", user as User];
}
