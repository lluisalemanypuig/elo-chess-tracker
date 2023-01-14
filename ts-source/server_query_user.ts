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
const debug = Debug('ELO_TRACKER:server_query_users');

import { log_now } from './utils/misc';
import { user_get_all_names_and_usernames, user_retrieve } from './server/users';
import { is_user_logged_in } from './server/session';
import { User } from './models/user';
import { ServerMemory } from './server/configuration';

/// Returns the list of user full names and usernames sorted by name
export async function query_user_list(req: any, res: any) {
	debug(log_now(), "GET query_user_list...");

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

export async function query_user_main(req: any, res: any) {
	debug(log_now(), "GET query_user_main...");

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
		'classical' : user.get_classical_rating(),
		'roles' : user.get_roles(),
		'actions' : user.get_actions()
	});
}

/**
 * @brief Serves the query to the server that retrieves user info for modification purposes
 * @param req 
 * @param res 
 * @returns 
 */
export async function query_user_modify(req: any, res: any) {
	debug(log_now(), "POST query_user_modify...");

	const session_id = req.cookies.session_id;
	const username = req.cookies.user;

	let r = is_user_logged_in(session_id, username);
	if (!r[0]) {
		res.send({ 'r' : '0', 'reason' : r[1] });
		return;
	}

	let modified = user_retrieve(req.body.u);
	if (modified == null) {
		res.send({ 'r' : '0', 'reason' : `User '${req.body.u}' to be modified does not exist.` });
		return;
	}

	res.send({
		'r' : '1',
		'first_name' : modified.get_first_name(),
		'last_name' : modified.get_last_name(),
		'roles' : modified.get_roles()
	});
}

export async function query_ranking_users(req: any, res: any) {
	debug(log_now(), "GET query_ranking_users...");

	const session_id = req.cookies.session_id;
	const username = req.cookies.user;

	let r = is_user_logged_in(session_id, username);
	if (!r[0]) {
		res.send({ 'r' : '0', 'reason' : r[1] });
		return;
	}

	let users: any[] = [];

	{
	let users_array = ServerMemory.get_instance().users;
	for (let i = 0; i < users_array.length; ++i) {
		users.push({
			'name' : users_array[i].get_full_name(),
			'elo' : users_array[i].get_classical_rating().rating,
			'total_games' : users_array[i].get_classical_rating().num_games,
			'won' : users_array[i].get_classical_rating().won,
			'drawn' : users_array[i].get_classical_rating().drawn,
			'lost' : users_array[i].get_classical_rating().lost
		});
	}
	}
	users.sort(
		(u1: any, u2: any): number => {
			if (u1.elo < u2.elo) { return 1; }
			if (u1.elo == u2.elo) { return 0; }
			return -1;
		}
	);

	res.send({ 'r' : '1', 'users' : users });
}