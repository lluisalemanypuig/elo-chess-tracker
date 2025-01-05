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
import { User } from '../models/user';
import { log_now } from '../utils/misc';
const debug = Debug('ELO_TRACKER:server_session');

import { ServerSessionID } from './memory';
import { user_retrieve } from './users';
import { SessionID } from '../models/session_id';

/// Deletes a session id.
export function session_id_delete(session: SessionID): void {
	let mem = ServerSessionID.get_instance();

	debug(log_now(), `Before deleting, '${mem.num_session_ids()}' sessions`);
	const idx = mem.index_session_id(session);
	if (idx != -1) {
		debug(log_now(), `    Session of user '${session.username}' was found. Deleting...`);
		mem.remove_session_id(idx);
	} else {
		debug(log_now(), `    Session of user '${session.username}' was not found.`);
	}

	debug(log_now(), `Currently, '${mem.num_session_ids()}' sessions`);
}

/// Deletes a session id.
export function session_user_delete_all(session: SessionID): void {
	let mem = ServerSessionID.get_instance();

	debug(log_now(), `Before deleting, '${mem.num_session_ids()}' sessions`);

	mem.remove_user_sessions(session.username);

	debug(log_now(), `Currently, '${mem.num_session_ids()}' sessions`);
}

/**
 * @brief Is a user logged in?
 *
 * Checks that a user logged in or not using the cookies.
 */
export function is_user_logged_in(session: SessionID): [boolean, string, User | null] {
	if (!ServerSessionID.get_instance().has_session_id(session)) {
		debug(log_now(), `Session does not exist for user '${session.username}'.`);
		return [false, '403 - Forbidden', null];
	}
	const user = user_retrieve(session.username);
	if (user == null) {
		debug(log_now(), `User '${session.username}' does not exist.`);
		return [false, '403 - Forbidden', null];
	}
	return [true, '', user as User];
}
