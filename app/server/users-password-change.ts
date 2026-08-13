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
const debug = Debug('ELO_CHESS_TRACKER:serverUsersPasswordChanges');
import { Request, Response } from 'express';

import { logNow } from '@common/utils/time';
import { isUserLoggedIn, sessionUserDeleteAll } from '@server/managers/session';
import { encryptPasswordForUser, isPasswordOfUserCorrect } from '@server/utils/encrypt';
import { userOverwrite } from '@server/managers/users';
import { ConfigurationManager } from '@server/managers/configuration-manager';
import { getExecutionDirectory } from '@server/managers/environment-manager';
import { isNotDefined } from '@common/utils/is-defined';
import { ROUTES } from '@common/api/routes';
import { inputSchemaOf } from '@common/api/schemas-endpoints';
import { safeParseRequestBody, safeParseRequestCookies } from '@server/utils/schemas';

export async function getPageUserPasswordChange(req: Request, res: Response) {
	debug(logNow(), `GET ${ROUTES.PAGE_USER_PASSWORD_CHANGE}...`);

	const sessionParse = safeParseRequestCookies(req, res, debug);
	if (sessionParse.result === 'Exit') {
		return;
	}
	const session = sessionParse.data;

	const r = isUserLoggedIn(session);
	if (isNotDefined(r[2])) {
		res.status(401).send(r[1]);
		return;
	}

	res.status(200);
	if (ConfigurationManager.shouldCacheData()) {
		res.setHeader('Cache-Control', 'public, max-age=864000, immutable');
	}
	res.sendFile(`${getExecutionDirectory()}/html/user/password-change.html`);
}

export async function postUserPasswordChange(req: Request, res: Response) {
	debug(logNow(), `POST ${ROUTES.USER_PASSWORD_CHANGE}...`);

	const sessionParse = safeParseRequestCookies(req, res, debug);
	if (sessionParse.result === 'Exit') {
		return;
	}
	const session = sessionParse.data;

	const passwordParse = safeParseRequestBody(req, inputSchemaOf(ROUTES.USER_PASSWORD_CHANGE), res, debug);
	if (passwordParse.result === 'Exit') {
		return;
	}

	const oldPassword = passwordParse.data.old;
	const newPassword = passwordParse.data.new;

	const r = isUserLoggedIn(session);
	const user = r[2];
	if (isNotDefined(user)) {
		res.status(200).send(r[1]);
		return;
	}

	// check if password is correct
	const oldPwd = user.password;
	const isPasswordCorrect = isPasswordOfUserCorrect(user.username, oldPassword, oldPwd);

	// is the password correct?
	if (!isPasswordCorrect) {
		debug(logNow(), `    Password for '${user.username}' is incorrect`);
		res.status(500).send('Old password is not correct.');
		return;
	}

	// delete all session ids of this user
	sessionUserDeleteAll(session);

	// make new password
	const pass = encryptPasswordForUser(user.username, newPassword);
	user.password = { encrypted: pass[0], iv: pass[1] };

	// overwrite user data
	userOverwrite(user);

	res.status(200).send();
}
