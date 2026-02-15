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
const debug = Debug('ELO_TRACKER:server_graphs');

import path from 'path';

import { log_now } from './utils/time';
import { is_user_logged_in } from './managers/session';
import { GRAPHS_SEE_USER } from './models/user_action';
import { User } from './models/user';
import { SessionID } from './models/session_id';
import { ADMIN } from './models/user_role';
import { recalculate_all_graphs } from './managers/graphs';
import { ConfigurationManager } from './managers/configuration_manager';

export async function get_page_graph_own(req: any, res: any) {
	debug(log_now(), 'GET /graph/own...');

	const session = SessionID.from_cookie(req.cookies);
	const r = is_user_logged_in(session);

	if (!r[0]) {
		res.status(401).send(r[1]);
		return;
	}

	res.status(200);
	if (ConfigurationManager.should_cache_data()) {
		res.setHeader('Cache-Control', 'public, max-age=864000, immutable');
	}
	res.sendFile(path.join(__dirname, '../html/graph/own.html'));
}

export async function get_page_graph_full(req: any, res: any) {
	debug(log_now(), 'GET /graph/full...');

	const session = SessionID.from_cookie(req.cookies);
	const r = is_user_logged_in(session);

	if (!r[0]) {
		res.status(401).send(r[1]);
		return;
	}

	if (!(r[2] as User).can_do(GRAPHS_SEE_USER)) {
		debug(log_now(), `User '${session.username}' cannot see the whole graph.`);
		res.status(403).send('You cannot see the whole graph.');
		return;
	}

	res.status(200);
	if (ConfigurationManager.should_cache_data()) {
		res.setHeader('Cache-Control', 'public, max-age=864000, immutable');
	}
	res.sendFile(path.join(__dirname, '../html/graph/full.html'));
}

export async function post_recalculate_graphs(req: any, res: any) {
	debug(log_now(), 'POST /recalculate/graphs...');

	const session = SessionID.from_cookie(req.cookies);
	const r = is_user_logged_in(session);

	if (!r[0]) {
		res.status(401).send(r[1]);
		return;
	}

	if (!(r[2] as User).is(ADMIN)) {
		debug(log_now(), `User '${session.username}' cannot recalculate graphs.`);
		res.status(403).send('You cannot recalculate the graphs.');
		return;
	}

	debug(log_now(), `Recalculating ratings...`);

	// actually recalculating ratings
	recalculate_all_graphs();

	res.status(200).send({ r: '1' });
}
