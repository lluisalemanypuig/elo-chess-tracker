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
import { recalculateAllGraphs } from '@server/managers/graphs';
import { ConfigurationManager } from '@server/managers/configuration-manager';
import { getExecutionDirectory } from '@server/managers/environment-manager';
import { isNotDefined } from '@common/utils/is-defined';
import { ROUTES } from '@common/api/routes';
import { safeParseRequestCookies } from '@server/utils/schemas';
import { handleError } from '@server/utils/error-handling';

export async function getPageGraphOwn(req: Request, res: Response) {
	debug(logNow(), `GET ${ROUTES.PAGE_GRAPH_OWN}...`);

	const sessionParse = safeParseRequestCookies(req, res, debug);
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

	res.status(200);
	if (ConfigurationManager.shouldCacheData()) {
		res.setHeader('Cache-Control', 'public, max-age=864000, immutable');
	}
	res.sendFile(`${getExecutionDirectory()}/html/graph/own.html`);
}

export async function getPageGraphFull(req: Request, res: Response) {
	debug(logNow(), `GET ${ROUTES.PAGE_GRAPH_FULL}...`);

	const sessionParse = safeParseRequestCookies(req, res, debug);
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

	if (!user.canDo('SEE_GRAPHS')) {
		debug(logNow(), `User '${user.username}' cannot see the whole graph.`);
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

	const sessionParse = safeParseRequestCookies(req, res, debug);
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

	debug(logNow(), `Recalculating ratings...`);

	try {
		recalculateAllGraphs(user);
	} catch (e) {
		handleError(e as Error, res);
		return;
	}

	res.status(200).send();
}
