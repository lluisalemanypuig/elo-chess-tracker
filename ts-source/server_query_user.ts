/*
Elo rating for a Chess Club
Copyright (C) 2023  Lluís Alemany Puig

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

Contact:
	Lluís Alemany Puig
	https://github.com/lluisalemanypuig
*/

import Debug from 'debug';
const debug = Debug('ELO_TRACKER:server_user_query');

import { log_now } from './utils/misc';
import { user_get_all_names_and_usernames, user_retrieve } from './server/users';
import { session_id_exists, is_user_logged_in } from './server/session';
import { User } from './models/user';

/// Returns the list of user full names and usernames sorted by name
export async function query_user_list_get(req: any, res: any) {
	debug(log_now(), "GET user_list_query_get...");

	const session_id = req.cookies.session_id;
	const username = req.cookies.user;
	
	let r = is_user_logged_in(session_id, username);
	if (!r[0]) {
		req.send({"r" : "0", "reason" : r[1]});
		return;
	}
	
	let list = user_get_all_names_and_usernames();
	list.sort(
		function (a: [string, string], b: [string, string]): number {
			if (a[0] < b[0]) { return -1; }
			if (a[0] == b[0]) { return 0; }
			return 1;
		}
	);

	res.send({ "data": list });
}

export async function query_user_get(req: any, res: any) {
	debug(log_now(), "GET user_query_get...");

	const session_id = req.cookies.session_id;
	const username = req.cookies.user;

	let r = is_user_logged_in(session_id, username);
	if (!r[0]) {
		res.send({ 'r' : '0', 'reason' : r[1] });
		return;
	}

	let user = r[2] as User;
	res.send({
		'r' : '1',
		'fullname' : user.get_full_name(),
		'classical' : JSON.stringify(user.get_classical_rating())
	});
}
