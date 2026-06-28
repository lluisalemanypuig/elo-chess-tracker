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
const debug = Debug('ELO_CHESS_TRACKER:server_users_ranking');
import { Request, Response } from 'express';

import { log_now } from '@server/utils/time';
import { is_user_logged_in } from '@server/managers/session';
import { ConfigurationManager } from '@server/managers/configuration_manager';
import { get_execution_directory } from '@server/managers/environment_manager';
import { AuthenticationSchema } from '@common/schemas/authentication';

export async function get_page_user_ranking(req: Request, res: Response) {
	debug(log_now(), 'GET /user/ranking...');

	const session_parse = AuthenticationSchema.safeParse(req.cookies);
	if (!session_parse.success) {
		debug(log_now(), 'Failed to parse AuthenticationSchema');
		debug(log_now(), `Error: '${session_parse.error}'`);
		res.status(401).send('Internal error');
		return;
	}
	const session = session_parse.data;

	const r = is_user_logged_in(session);

	if (!r[0]) {
		res.status(401).send(r[1]);
		return;
	}

	res.status(200);
	if (ConfigurationManager.should_cache_data()) {
		res.setHeader('Cache-Control', 'public, max-age=864000, immutable');
	}
	res.sendFile(`${get_execution_directory()}/html/user/ranking.html`);
}
