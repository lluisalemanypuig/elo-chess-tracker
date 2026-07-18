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
const debug = Debug('ELO_CHESS_TRACKER:server_home');
import { Request, Response } from 'express';

import { log_now } from '@server/utils/time';
import { is_user_logged_in } from '@server/managers/session';
import { ConfigurationManager } from '@server/managers/configuration_manager';
import { ROUTE_HOME } from '@common/routes';
import { get_execution_directory } from '@server/managers/environment_manager';
import { AuthenticationInputSchema } from '@common/schemas/authentication';
import { isDefined } from '@common/utils/is_defined';

export async function get_page_login(req: Request, res: Response) {
	let send_home: boolean;
	debug(log_now(), `GET ${ROUTE_HOME}`);

	const session_parse = AuthenticationInputSchema.safeParse(req.cookies);
	if (!session_parse.success) {
		debug(log_now(), 'Failed to parse schema');
		debug(log_now(), `Error: '${session_parse.error}'`);
		res.status(401).send('Internal error');
		return;
	}
	const session = session_parse.data;

	if (isDefined(session)) {
		debug(log_now(), 'There is a username key in the cookies received.');
		debug(log_now(), `    Value: ${session.username}`);

		const r = is_user_logged_in(session);
		send_home = r[0];

		if (send_home) {
			debug(log_now(), `    Session id for user '${session.username}' exists. Please, come in.`);
		}
	} else {
		debug(log_now(), 'There is no user key in the cookies received.');
		send_home = false;
	}

	res.status(200);
	if (ConfigurationManager.should_cache_data()) {
		res.setHeader('Cache-Control', 'public, max-age=864000, immutable');
	}
	if (send_home) {
		debug(log_now(), 'send /home since the user is logged in');
		res.sendFile(`${get_execution_directory()}/html/home.html`);
	} else {
		debug(log_now(), 'send /login_screen since the user is not logged in');
		res.sendFile(`${get_execution_directory()}/html/login_screen.html`);
	}
}

export async function get_page_home(req: Request, res: Response) {
	debug(log_now(), `GET ${ROUTE_HOME}`);

	const session_parse = AuthenticationInputSchema.safeParse(req.cookies);
	if (!session_parse.success) {
		debug(log_now(), 'Failed to parse schema');
		debug(log_now(), `Error: '${session_parse.error}'`);
		res.status(401).send('Internal error');
		return;
	}
	const session = session_parse.data;
	const r = is_user_logged_in(session);
	if (!isDefined(r[2])) {
		debug(log_now(), `    User ${session.username} is not logged in.`);
		res.status(401).send(r[1]);
		return;
	}

	debug(log_now(), `    User ${session.username} is logged in. Access granted.`);
	res.status(200);
	if (ConfigurationManager.should_cache_data()) {
		res.setHeader('Cache-Control', 'public, max-age=864000, immutable');
	}
	res.sendFile(`${get_execution_directory()}/html/home.html`);
}
