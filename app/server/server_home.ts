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

import { log_now } from '@server/utils/time';
import { SessionID, SessionIDUsernameFieldName } from '@common/models/session_id';
import { is_user_logged_in } from '@server/managers/session';
import { ConfigurationManager } from '@server/managers/configuration_manager';
import { get_execution_directory } from './managers/environment_manager';

export async function get_page_login(req: any, res: any) {
	let send_home: boolean;
	console.log('GET page_login');

	if (SessionIDUsernameFieldName in req.cookies) {
		debug(log_now(), 'There is a username key in the cookies received.');
		debug(log_now(), `    Value: ${req.cookies.username}`);

		const session: SessionID = { token: req.cookies.token, username: req.cookies.username };
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

export async function get_page_home(req: any, res: any) {
	debug(log_now(), 'GET /home');

	const session: SessionID = { token: req.cookies.token, username: req.cookies.username };
	const r = is_user_logged_in(session);
	if (!r[0]) {
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
