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

import { logNow } from '@common/utils/time';
import { User } from '@common/models/user';
const debug = Debug('ELOCHESSTRACKER:managers/session');

import { SessionIDManager } from '@app/server/managers/session-id-manager';
import { SessionId } from '@common/models/session-id';
import { shuffle } from '@app/server/utils/shuffle-random';
import { UsersManager } from '@app/server/managers/users-manager';
import { isNotDefined } from '@common/utils/is-defined';
import { PlayerPrivateId } from '@common/models/player';

// The original string was
// "abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789+-*/ª!·$%&/()=?¿¡'º|@#~€¬^{},;.:_";

// In case of accidental overwrite, use:
// '$ALLOWED-SYMBOLS-COOKIES'.normalize('NFC');
// (replace the dashes '-' with underscores '_')

// This string is randomized by the build script which the administrator must
// use in order to configure the webpage in their machine.
const characterSamples: string = '$ALLOWEDSYMBOLSCOOKIES';

/// Makes a random session id from a starting string.
function randomSessionId(str: string): string {
	// convert string to an array
	let stringArray: string[] = [];
	for (const char of str) {
		stringArray.push(char);
	}
	// put more characters until the array is at least 128 characters
	while (stringArray.length < 128) {
		const randIdx = Math.floor(Math.random() * characterSamples.length);
		stringArray.push(characterSamples.charAt(randIdx));
	}

	shuffle(stringArray);
	return stringArray.join('');
}

/**
 * Adds a new user session.
 * @param username Username.
 * @returns The authentication token.
 */
export function sessionIdAdd(username: PlayerPrivateId): string {
	const token = randomSessionId(username);
	const sessionId: SessionId = { token: token, username: username };
	SessionIDManager.getInstance().addSessionId(sessionId);
	return token;
}

/// Deletes a session id.
export function sessionIdDelete(session: SessionId): void {
	let mem = SessionIDManager.getInstance();

	debug(logNow(), `Before deleting, '${mem.numSessionIds()}' sessions`);
	const idx = mem.indexSessionId(session);
	if (idx != -1) {
		debug(logNow(), `    Session of user '${session.username}' was found. Deleting...`);
		mem.removeSessionId(idx);
	} else {
		debug(logNow(), `    Session of user '${session.username}' was not found.`);
	}

	debug(logNow(), `Currently, '${mem.numSessionIds()}' sessions`);
}

/// Deletes a session id.
export function sessionUserDeleteAll(username: PlayerPrivateId): void {
	let mem = SessionIDManager.getInstance();

	debug(logNow(), `Before deleting, '${mem.numSessionIds()}' sessions`);

	mem.removeUserSessions(username);

	debug(logNow(), `Currently, '${mem.numSessionIds()}' sessions`);
}

/**
 * @brief Is a user logged in?
 *
 * Checks that a user logged in or not using the cookies.
 */
export function isUserLoggedIn(session: SessionId): [boolean, string, User | undefined] {
	const user = UsersManager.getInstance().getUserByUsername(session.username);
	if (isNotDefined(user)) {
		debug(logNow(), `User '${session.username}' does not exist.`);
		return [false, 'Forbidden access. <a href="/">Go home</a>.', undefined];
	}

	debug(logNow(), `User '${session.username}' exists and is trying to access the page.`);
	debug(logNow(), `Checking now if the user has a valid session ID.`);

	// at this point, the user exists --> check if the session id received exists
	if (!SessionIDManager.getInstance().hasSessionId(session)) {
		debug(logNow(), `    The session ID received for user '${session.username}' does not exist.`);
		debug(logNow(), '    This means that the user is not logged into the web in');
		debug(logNow(), '    the device they are trying to access the web from.');
		return [false, 'Forbidden access. <a href="/">Go home</a>.', undefined];
	} else {
		debug(logNow(), `    Valid session ID received for user '${session.username}'.`);
	}
	return [true, '', user as User];
}
