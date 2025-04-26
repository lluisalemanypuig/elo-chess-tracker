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

import { log_now } from '../utils/time';
import { User } from '../models/user';
const debug = Debug('ELO_TRACKER:managers/session');

import { SessionIDManager } from './session_id_manager';
import { SessionID } from '../models/session_id';
import { shuffle } from '../utils/shuffle_random';
import { UsersManager } from './users_manager';

const character_samples =
	"abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789+-*/ª!·$%&/()=?¿¡'º|@#~€¬^{},;.:_";

/// Makes a random session id from a starting string.
function random_session_id(str: string): string {
	// convert string to an array
	let string_array: string[] = [];
	for (let i = 0; i < str.length; ++i) {
		string_array.push(str.charAt(i));
	}
	// put more characters until the array is at least 128 characters
	while (string_array.length < 128) {
		const rand_idx = Math.floor(Math.random() * character_samples.length);
		string_array.push(character_samples.charAt(rand_idx));
	}

	shuffle(string_array);
	return string_array.join('');
}

/**
 * Adds a new user session.
 * @param username Username.
 * @returns The authentication token.
 */
export function session_id_add(username: string): string {
	const token = random_session_id(username);
	const session_id = new SessionID(token, username);
	SessionIDManager.get_instance().add_session_id(session_id);
	return token;
}

/// Deletes a session id.
export function session_id_delete(session: SessionID): void {
	let mem = SessionIDManager.get_instance();

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
export function session_user_delete_all(username: string): void {
	let mem = SessionIDManager.get_instance();

	debug(log_now(), `Before deleting, '${mem.num_session_ids()}' sessions`);

	mem.remove_user_sessions(username);

	debug(log_now(), `Currently, '${mem.num_session_ids()}' sessions`);
}

/**
 * @brief Is a user logged in?
 *
 * Checks that a user logged in or not using the cookies.
 */
export function is_user_logged_in(session: SessionID): [boolean, string, User | undefined] {
	const user = UsersManager.get_instance().get_user_by_username(session.username);
	if (user == undefined) {
		debug(log_now(), `User '${session.username}' does not exist.`);
		return [false, 'Forbidden access', undefined];
	}

	debug(log_now(), `User '${session.username}' exists and is trying to access the page.`);
	debug(log_now(), `Checking now if the user has a valid session ID.`);

	// at this point, the user exists --> check if the session id received exists
	if (!SessionIDManager.get_instance().has_session_id(session)) {
		debug(log_now(), `    The session ID received for user '${session.username}' does not exist.`);
		debug(log_now(), '    This means that the user is not logged into the web in');
		debug(log_now(), '    the device they are trying to access the web from.');
		return [false, 'Forbidden access', undefined];
	} else {
		debug(log_now(), `    Valid session ID received for user '${session.username}'.`);
	}
	return [true, '', user as User];
}
