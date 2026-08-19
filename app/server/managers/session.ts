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
import { User } from '@server/models/user';
const debug = Debug('ELO_CHESS_TRACKER:managers/session');

import { SessionIDManager } from '@server/managers/session-id-manager';
import { SessionId } from '@common/models/session-id';
import { shuffleArray } from '@common/utils/shuffle-random';
import { UsersManager } from '@server/managers/users-manager';
import { isNotDefined } from '@common/utils/is-defined';
import { InternalError } from '@server/models/error-types/internal-error';
import { PlayerPrivateId } from '@common/models/player-id';

// In case of accidental overwrite, use:
// '$ALLOWED-SYMBOLS-COOKIES'
// (replace the dashes '-' with underscores '_')

// This string is randomized by the build script which the administrator must
// use in order to configure the webpage in their machine.
const characterSamples: string = '$ALLOWED_SYMBOLS_COOKIES';

// Makes a random session token from a starting string.
function randomSessionToken(str: string): string {
	const cryptoObj = globalThis.crypto;

	let stringArray: string[] = [];
	for (const char of str) {
		stringArray.push(char);
	}

	const rand = new Uint32Array(128 - stringArray.length);
	cryptoObj.getRandomValues(rand);
	const currentLength = stringArray.length;
	for (let i = currentLength; i < 128; ++i) {
		const randIdx = rand[i - currentLength] % characterSamples.length;
		stringArray.push(characterSamples.charAt(randIdx));
	}

	shuffleArray(stringArray);
	return stringArray.join('');
}

/**
 * Adds a new user session.
 * @param username Username.
 * @returns The authentication token.
 */
export function sessionIdAdd(username: PlayerPrivateId) {
	const u = UsersManager.getInstance().getAllUserDataByPrivateId(username);
	if (isNotDefined(u)) {
		debug(logNow(), `User '${username}' does not exist.`);
		throw new InternalError(`Incorrect username ${username}.`);
	}
	const token = randomSessionToken(username);
	const sessionId: SessionId = { token: token, publicId: u.publicId };
	SessionIDManager.getInstance().addSessionId(sessionId);
	return sessionId;
}

// Deletes a session id.
export function sessionIdDelete(session: SessionId) {
	let mem = SessionIDManager.getInstance();

	debug(logNow(), `Before deleting, '${mem.numSessionIds()}' sessions`);
	const idx = mem.indexSessionId(session);
	if (idx !== -1) {
		debug(logNow(), `    Session of user '${session.publicId}' was found. Deleting...`);
		mem.removeSessionId(idx);
	} else {
		debug(logNow(), `    Session of user '${session.publicId}' was not found.`);
	}

	debug(logNow(), `Currently, '${mem.numSessionIds()}' sessions`);
}

// Deletes a session id.
export function sessionUserDeleteAll(session: SessionId) {
	let mem = SessionIDManager.getInstance();

	debug(logNow(), `Before deleting, '${mem.numSessionIds()}' sessions`);

	mem.removeUserSessions(session.publicId);

	debug(logNow(), `Currently, '${mem.numSessionIds()}' sessions`);
}

/**
 * @brief Is a user logged in?
 *
 * Checks that a user logged in or not using the cookies.
 */
export function isUserLoggedIn(session: SessionId): [boolean, string, User | undefined] {
	const user = UsersManager.getInstance().getAllUserDataByPublicId(session.publicId);
	if (isNotDefined(user)) {
		debug(logNow(), `User '${session.publicId}' does not exist.`);
		return [false, 'Forbidden access. <a href="/">Go home</a>.', undefined];
	}

	debug(logNow(), `User '${session.publicId}' exists and is trying to access the page.`);
	debug(logNow(), `Checking now if the user has a valid session ID.`);

	// at this point, the user exists --> check if the session id received exists
	if (!SessionIDManager.getInstance().hasSessionId(session)) {
		debug(logNow(), `    The session ID received for user '${session.publicId}' does not exist.`);
		debug(logNow(), '    This means that the user is not logged into the web in');
		debug(logNow(), '    the device they are trying to access the web from.');
		return [false, 'Forbidden access. <a href="/">Go home</a>.', undefined];
	} else {
		debug(logNow(), `    Valid session ID received for user '${session.publicId}'.`);
	}
	return [true, '', user.user];
}
