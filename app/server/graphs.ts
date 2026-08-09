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
const debug = Debug('ELO_CHESS_TRACKER:server_graphs');
import { Request, Response } from 'express';

import { logNow } from '@common/utils/time';
import { is_user_logged_in } from '@server/managers/session';
import { GRAPHS_SEE_USER } from '@app/common/models/user-action';
import { ADMIN } from '@app/common/models/user-role';
import { recalculate_all_graphs } from '@server/managers/graphs';
import { ConfigurationManager } from '@app/server/managers/configuration-manager';
import { get_execution_directory } from '@app/server/managers/environment-manager';
import { isNotDefined } from '@app/common/utils/is-defined';
import { Routes } from '@common/routes';
import { safe_parse_request_cookies } from '@server/utils/schemas';
import { AuthenticationInputSchema } from '@common/schemas/authentication';

export async function get_page_graph_own(req: Request, res: Response) {
	debug(logNow(), `GET ${Routes.PAGE_GRAPH_OWN}...`);

	const session_parse = safe_parse_request_cookies(req, AuthenticationInputSchema, res, debug);
	if (session_parse.result === 'Exit') {
		return;
	}
	const session = session_parse.data;
	const r = is_user_logged_in(session);

	if (isNotDefined(r[2])) {
		res.status(401).send(r[1]);
		return;
	}

	res.status(200);
	if (ConfigurationManager.should_cache_data()) {
		res.setHeader('Cache-Control', 'public, max-age=864000, immutable');
	}
	res.sendFile(`${get_execution_directory()}/html/graph/own.html`);
}

export async function get_page_graph_full(req: Request, res: Response) {
	debug(logNow(), `GET ${Routes.PAGE_GRAPH_FULL}...`);

	const session_parse = safe_parse_request_cookies(req, AuthenticationInputSchema, res, debug);
	if (session_parse.result === 'Exit') {
		return;
	}
	const session = session_parse.data;
	const r = is_user_logged_in(session);

	const user = r[2];
	if (isNotDefined(user)) {
		res.status(401).send(r[1]);
		return;
	}

	if (!user.can_do(GRAPHS_SEE_USER)) {
		debug(logNow(), `User '${session.username}' cannot see the whole graph.`);
		res.status(403).send('You cannot see the whole graph.');
		return;
	}

	res.status(200);
	if (ConfigurationManager.should_cache_data()) {
		res.setHeader('Cache-Control', 'public, max-age=864000, immutable');
	}
	res.sendFile(`${get_execution_directory()}/html/graph/full.html`);
}

export async function post_recalculate_graphs(req: Request, res: Response) {
	debug(logNow(), `POST ${Routes.RECALCULATE_GRAPHS}...`);

	const session_parse = safe_parse_request_cookies(req, AuthenticationInputSchema, res, debug);
	if (session_parse.result === 'Exit') {
		return;
	}
	const session = session_parse.data;
	const r = is_user_logged_in(session);

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
	recalculate_all_graphs();

	res.status(200).send();
}
