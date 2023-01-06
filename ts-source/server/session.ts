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
import { User } from '../models/user';
import { log_now } from '../utils/misc';
const debug = Debug('ELO_TRACKER:server_session');

import { ServerMemory, SessionID } from "./configuration";
import { user_retrieve } from './users';

/// Add a new session id
export function session_id_add(id: string, username: string): void {
    let ids = ServerMemory.get_instance().session_ids;
    ids.push( new SessionID(id, username) );
    debug(log_now(), `Currently, '${ids.length}' sessions`);
}

/// Get position of session id
export function session_id_get_index(id: string, username: string): number {
    if (id == undefined || username == undefined) { return -1; }
    
    let ids = ServerMemory.get_instance().session_ids;
    for (let i = 0; i < ids.length; ++i) {
        if (ids[i].id == id && ids[i].username == username) {
            return i;
        }
    }
    return -1;
}

/// Returns whether or not the string 'id' was registered before.
export function session_id_exists(id: string, username: string): boolean {
    return session_id_get_index(id, username) != -1;
}

/// Deletes a session id.
export function session_id_delete(id: string, username: string): void {
    let ids = ServerMemory.get_instance().session_ids;

    debug(log_now(), `Before deleting, '${ids.length}' sessions`);
    let idx = session_id_get_index(id, username);
    if (idx != -1) {
        debug(log_now(), `    Session of user '${username}' was found. Deleting...`);
        ids.splice(idx, 1);
    }
    else {
        debug(log_now(), `    Session of user '${username}' was not found.`);
    }

    debug(log_now(), `Currently, '${ids.length}' sessions`);
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
    if (!session_id_exists(session_id, username)) {
		debug(log_now(), `Session does not exist for user '${username}'.`);
		return [false, "403 - Forbidden", null];
	}
	let _user = user_retrieve(username);
	if (_user == null) {
		debug(log_now(), `User '${username}' does not exist.`);
		return [false, "403 - Forbidden", null];
	}
    return [true, "", _user as User];
}
