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
const debug = Debug('ELO_CHESS_TRACKER:serverGraphs');
import { Request, Response } from 'express';

import { logNow } from '@common/utils/time';
import { isUserLoggedIn } from '@server/managers/session';
import { GRAPHS_SEE_USER } from '@common/models/user-action';
import { ADMIN } from '@common/models/user-role';
import { recalculateAllGraphs } from '@server/managers/graphs';
import { ConfigurationManager } from '@server/managers/configuration-manager';
import { getExecutionDirectory } from '@server/managers/environment-manager';
import { isNotDefined } from '@common/utils/is-defined';
import { ROUTES } from '@common/routes';
import { safeParseRequestCookies } from '@server/utils/schemas';
import { AuthenticationInputSchema } from '@common/schemas/authentication';

export async function getPageGraphOwn(req: Request, res: Response) {
	debug(logNow(), `GET ${ROUTES.PAGE_GRAPH_OWN}...`);

	const sessionParse = safeParseRequestCookies(req, AuthenticationInputSchema, res, debug);
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
	res.sendFile(`${getExecutionDirectory()}/html/graph/own.html`);
}

export async function getPageGraphFull(req: Request, res: Response) {
	debug(logNow(), `GET ${ROUTES.PAGE_GRAPH_FULL}...`);

	const sessionParse = safeParseRequestCookies(req, AuthenticationInputSchema, res, debug);
	if (sessionParse.result === 'Exit') {
		return;
	}
	const session = sessionParse.data;
	const r = isUserLoggedIn(session);

	const user = r[2];
	if (isNotDefined(user)) {
		res.status(401).send(r[1]);
		return;
	}

	if (!user.canDo(GRAPHS_SEE_USER)) {
		debug(logNow(), `User '${session.username}' cannot see the whole graph.`);
		res.status(403).send('You cannot see the whole graph.');
		return;
	}

	res.status(200);
	if (ConfigurationManager.shouldCacheData()) {
		res.setHeader('Cache-Control', 'public, max-age=864000, immutable');
	}
	res.sendFile(`${getExecutionDirectory()}/html/graph/full.html`);
}

export async function postRecalculateGraphs(req: Request, res: Response) {
	debug(logNow(), `POST ${ROUTES.RECALCULATE_GRAPHS}...`);

	const sessionParse = safeParseRequestCookies(req, AuthenticationInputSchema, res, debug);
	if (sessionParse.result === 'Exit') {
		return;
	}
	const session = sessionParse.data;
	const r = isUserLoggedIn(session);

	const user = r[2];
	if (isNotDefined(user)) {
		res.status(401).send(r[1]);
		return;
	}

	if (!user.is(ADMIN)) {
		debug(logNow(), `User '${session.username}' cannot recalculate graphs.`);
		res.status(403).send('You cannot recalculate the graphs.');
		return;
	}

	debug(logNow(), `Recalculating ratings...`);

	// actually recalculating ratings
	recalculateAllGraphs();

	res.status(200).send();
}
