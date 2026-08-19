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

import { Request, Response } from 'express';

import Debug from 'debug';
const debug = Debug('ELO_CHESS_TRACKER:entry-point');
import { logNow } from '@common/utils/time';

import { Route } from '@common/api/routes';
import { EmptySchema, inputSchemaOf, methodTypeOf, outputSchemaOf } from '@common/api/schemas-endpoints';
import { safeParseRequestBody, safeParseRequestCookies } from '@server/utils/schemas';
import { isUserLoggedIn } from '@server/managers/session';
import { isNotDefined } from '@common/utils/is-defined';
import { User } from '@server/models/user';
import { handleError } from '@server/utils/error-handling';
import { InputTypeOf, OutputTypeOf } from '@common/api/types';
import { ConfigurationManager } from '@server/managers/configuration-manager';
import { getExecutionDirectory } from '@server/managers/environment-manager';

export async function entryPointPage<R extends Route>(
	route: R,
	action: (u: User) => Promise<string>,
	req: Request,
	res: Response
) {
	debug(logNow(), `${methodTypeOf(route)} ${route}...`);

	const sessionParse = safeParseRequestCookies(req, debug);
	if (sessionParse.result === 'Exit') {
		res.status(401).send(`Failure to parse cookies.`);
		return;
	}

	const session = sessionParse.data;
	const r = isUserLoggedIn(session);
	const user = r[2];
	if (isNotDefined(user)) {
		res.status(401).send(r[1]);
		return;
	}

	try {
		const file = await action(user);
		res.status(200);
		if (ConfigurationManager.shouldCacheData()) {
			res.setHeader('Cache-Control', 'public, max-age=864000, immutable');
		}
		res.sendFile(`${getExecutionDirectory()}/${file}`);
	} catch (e) {
		handleError(e as Error, res);
	}
}

export async function entryPointHTMX<R extends Route>(
	route: R,
	action: (u: User) => Promise<string>,
	req: Request,
	res: Response
) {
	debug(logNow(), `${methodTypeOf(route)} ${route}...`);

	const sessionParse = safeParseRequestCookies(req, debug);
	if (sessionParse.result === 'Exit') {
		res.status(401).send(`Failure to parse cookies.`);
		return;
	}

	const session = sessionParse.data;
	const r = isUserLoggedIn(session);
	const user = r[2];
	if (isNotDefined(user)) {
		res.status(401).send(r[1]);
		return;
	}

	try {
		const html = await action(user);
		res.status(200).send(html);
	} catch (e) {
		handleError(e as Error, res);
	}
}

export async function entryPointAction<R extends Route>(
	route: R,
	action: (u: User, data: InputTypeOf<R>) => Promise<OutputTypeOf<R>>,
	req: Request,
	res: Response
) {
	debug(logNow(), `${methodTypeOf(route)} ${route}...`);

	const sessionParse = safeParseRequestCookies(req, debug);
	if (sessionParse.result === 'Exit') {
		res.status(401).send(`Failure to parse cookies.`);
		return;
	}

	const session = sessionParse.data;
	const r = isUserLoggedIn(session);
	const user = r[2];
	if (isNotDefined(user)) {
		res.status(401).send(r[1]);
		return;
	}

	const inputParse = safeParseRequestBody(req, inputSchemaOf(route), debug);
	if (inputParse.result === 'Exit') {
		debug(logNow(), 'Data sent by client:');
		console.log(JSON.stringify(req.body, null, 2));
		res.status(401).send('Request input data (body) sent from client is malformed');
		return;
	}

	// TODO: eventually remove type assertion
	const input = inputParse.data as InputTypeOf<R>;

	try {
		const actionResult = await action(user, input);
		if (outputSchemaOf(route) === EmptySchema) {
			res.status(204).send();
		} else {
			res.status(200).send(actionResult);
		}
	} catch (e) {
		handleError(e as Error, res);
	}
}
