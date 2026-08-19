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
const debug = Debug('ELO_CHESS_TRACKER:serverHome');
import { Request, Response } from 'express';

import { logNow } from '@common/utils/time';
import { isUserLoggedIn } from '@server/managers/session';
import { ConfigurationManager } from '@server/managers/configuration-manager';
import { getExecutionDirectory } from '@server/managers/environment-manager';
import { isDefined } from '@common/utils/is-defined';
import { ROUTES } from '@common/api/routes';
import { parseSchema } from '@server/utils/schemas';
import { AuthenticationInputSchema, authenticationInputSchemaToSessionId } from '@common/api/schemas/authentication';
import { UserSession } from './models/user';

export async function getPageLogin(req: Request, res: Response) {
	let sendHome: boolean;
	debug(logNow(), `GET ${ROUTES.ROOT}`);

	const sessionParse = parseSchema(req.cookies, AuthenticationInputSchema, debug);
	if (sessionParse.result === 'Error') {
		debug(logNow(), req.cookies);
		return;
	}

	if (isDefined(sessionParse.data)) {
		const session = authenticationInputSchemaToSessionId(sessionParse.data);

		debug(logNow(), 'There is a username key in the cookies received.');
		debug(logNow(), `    Value: ${session.publicId}`);

		const r = isUserLoggedIn(session);
		sendHome = r[0];

		if (sendHome) {
			debug(logNow(), `    Session id for user '${session.publicId}' exists. Please, come in.`);
		}
	} else {
		debug(logNow(), 'There is no user key in the cookies received.');
		sendHome = false;
	}

	res.status(200);
	if (ConfigurationManager.shouldCacheData()) {
		res.setHeader('Cache-Control', 'public, max-age=864000, immutable');
	}
	if (sendHome) {
		debug(logNow(), 'send /home since the user is logged in');
		res.sendFile(`${getExecutionDirectory()}/html/home.html`);
	} else {
		debug(logNow(), 'send /login-screen since the user is not logged in');
		res.sendFile(`${getExecutionDirectory()}/html/login-screen.html`);
	}
}

export async function getPageHome(_u: UserSession) {
	debug(logNow(), `GET ${ROUTES.HOME}`);
	return 'html/home.html';
}
