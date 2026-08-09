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

import { logNow } from '@common/utils/time';
import { is_user_logged_in } from '@server/managers/session';
import { ConfigurationManager } from '@app/server/managers/configuration-manager';
import { get_execution_directory } from '@app/server/managers/environment-manager';
import { isDefined, isNotDefined } from '@app/common/utils/is-defined';
import { Routes } from '@common/routes';
import { safe_parse_request_cookies, parse_schema } from '@server/utils/schemas';
import { AuthenticationInputSchema } from '@common/schemas/authentication';

export async function get_page_login(req: Request, res: Response) {
	let send_home: boolean;
	debug(logNow(), `GET ${Routes.ROOT}`);

	const session_parse = parse_schema(req.cookies, AuthenticationInputSchema, debug);
	if (session_parse.result === 'Error') {
		console.log('asdf');
		return;
	}
	const session = session_parse.data;

	if (isDefined(session)) {
		debug(logNow(), 'There is a username key in the cookies received.');
		debug(logNow(), `    Value: ${session.username}`);

		const r = is_user_logged_in(session);
		send_home = r[0];

		if (send_home) {
			debug(logNow(), `    Session id for user '${session.username}' exists. Please, come in.`);
		}
	} else {
		debug(logNow(), 'There is no user key in the cookies received.');
		send_home = false;
	}

	res.status(200);
	if (ConfigurationManager.should_cache_data()) {
		res.setHeader('Cache-Control', 'public, max-age=864000, immutable');
	}
	if (send_home) {
		debug(logNow(), 'send /home since the user is logged in');
		res.sendFile(`${get_execution_directory()}/html/home.html`);
	} else {
		debug(logNow(), 'send /login_screen since the user is not logged in');
		res.sendFile(`${get_execution_directory()}/html/login-screen.html`);
	}
}

export async function get_page_home(req: Request, res: Response) {
	debug(logNow(), `GET ${Routes.HOME}`);

	const session_parse = safe_parse_request_cookies(req, AuthenticationInputSchema, res, debug);
	if (session_parse.result === 'Exit') {
		return;
	}
	const session = session_parse.data;
	const r = is_user_logged_in(session);
	if (isNotDefined(r[2])) {
		debug(logNow(), `    User ${session.username} is not logged in.`);
		res.status(401).send(r[1]);
		return;
	}

	debug(logNow(), `    User ${session.username} is logged in. Access granted.`);
	res.status(200);
	if (ConfigurationManager.should_cache_data()) {
		res.setHeader('Cache-Control', 'public, max-age=864000, immutable');
	}
	res.sendFile(`${get_execution_directory()}/html/home.html`);
}
