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
const debug = Debug('ELO_CHESS_TRACKER:serverLoginLogout');
import { Request, Response } from 'express';

import { logNow } from '@common/utils/time';
import { isPasswordOfUserCorrect } from '@server/utils/encrypt';
import { emptySessionIdCookie, makeSessionIdCookie } from '@server/utils/cookies';
import { sessionIdAdd, sessionIdDelete } from '@server/managers/session';
import { SessionIDManager } from '@server/managers/session-id-manager';
import { SessionIdPublicIdFieldName, SessionIdTokenFieldName } from '@common/models/session-id';
import { UsersManager } from '@server/managers/users-manager';
import { isNotDefined } from '@common/utils/is-defined';
import { UserLoginInputSchema } from '@common/api/schemas/login-logout';
import { ROUTES } from '@common/api/routes';
import { safeParseRequestBody } from '@server/utils/schemas';
import { UserSession } from '@server/models/user';
import { Empty } from '@common/api/schemas-endpoints';

export async function postUserLogin(req: Request, res: Response) {
	debug(logNow(), `POST ${ROUTES.USER_LOGIN}`);

	const loginParse = safeParseRequestBody(req, UserLoginInputSchema, debug);
	if (loginParse.result === 'bad') {
		res.status(400).send('Could not parse input data from client.');
		return;
	}

	const username = loginParse.data.u;
	const passwordPlainText = loginParse.data.p;

	debug(logNow(), `    Username '${username}'`);

	const userData = UsersManager.getInstance().getAllUserDataByPrivateId(username);

	// nonexistent user
	if (isNotDefined(userData)) {
		debug(logNow(), `    User ${username} does not exist`);
		res.status(404).send('Incorrect user or password.');
		return;
	}

	// user exists
	const pwd = userData.user.password;

	// check if password is correct
	const isPasswordCorrect = isPasswordOfUserCorrect(username, passwordPlainText, pwd);

	// correct password
	if (!isPasswordCorrect) {
		debug(logNow(), `    Password for '${username}' is incorrect`);
		res.status(404).send('Incorrect username or password.');
		return;
	}

	debug(logNow(), `    Password for '${username}' is correct`);

	const session = sessionIdAdd(username);

	// send response
	res.status(200).send({
		cookies: [
			makeSessionIdCookie(SessionIdTokenFieldName, session.token, 1),
			makeSessionIdCookie(SessionIdPublicIdFieldName, `${session.publicId}`, 1)
		]
	});
}

export async function postUserLogout({ user: _u, session }: UserSession, _i: Empty) {
	debug(logNow(), 'function postUserLogout...');

	debug(logNow(), `    Cookie:`);
	debug(logNow(), `        Public Id:   '${session.publicId}'`);

	// in order to log out a user, the must have been logged in with the given
	// session id token
	if (!SessionIDManager.getInstance().hasSessionId(session)) {
		debug(
			logNow(),
			`    User '${session.publicId}' was never logged in with this session id but it is fine, since they are logging out.`
		);
	} else {
		debug(logNow(), `    Deleting session id of user '${session.publicId}'...`);
		sessionIdDelete(session);
		debug(logNow(), `        Deleted.`);
	}
	return {
		cookies: [emptySessionIdCookie(SessionIdTokenFieldName), emptySessionIdCookie(SessionIdPublicIdFieldName)]
	};
}
