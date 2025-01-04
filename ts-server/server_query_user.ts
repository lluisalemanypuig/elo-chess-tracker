/*
Elo rating for a Chess Club
Copyright (C) 2023 - 2025  Lluís Alemany Puig

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
import { ServerMemory } from './server/memory';
import { TimeControlRating } from './models/time_control_rating';
import { SessionID } from './models/session_id';

/// Returns the list of user full names and usernames sorted by name
export async function get_query_users_list(req: any, res: any) {
	debug(log_now(), 'GET query_users_list...');

	const session = new SessionID(req.cookies.session_id, req.cookies.user);
	const r = is_user_logged_in(session);

	if (!r[0]) {
		req.send({ r: '0', reason: r[1] });
		return;
	}

	let list = user_get_all_names_and_usernames();
	list.sort(function (a: [string, string], b: [string, string]): number {
		if (a[0] < b[0]) {
			return -1;
		}
		if (a[0] == b[0]) {
			return 0;
		}
		return 1;
	});

	res.send({ data: list });
}

export async function get_query_users_home(req: any, res: any) {
	debug(log_now(), 'GET query_users_home...');

	const session = new SessionID(req.cookies.session_id, req.cookies.user);
	const r = is_user_logged_in(session);

	if (!r[0]) {
		res.send({ r: '0', reason: r[1] });
		return;
	}

	const user = r[2] as User;

	let ratings_user: any[] = [];
	const all_ratings = user.get_all_ratings();

	all_ratings.forEach((value: TimeControlRating) => {
		let R = value.rating.clone();
		R.rating = Math.round(R.rating);
		ratings_user.push({ id: value.time_control, v: R });
	});

	res.send({
		r: '1',
		fullname: user.get_full_name(),
		roles: user.get_roles(),
		actions: user.get_actions(),
		ratings: ratings_user
	});
}

/**
 * @brief Serves the query to the server that retrieves user info for modification purposes
 * @param req
 * @param res
 * @returns
 */
export async function post_query_users_edit(req: any, res: any) {
	debug(log_now(), 'POST query_users_edit...');

	const session = new SessionID(req.cookies.session_id, req.cookies.user);
	const r = is_user_logged_in(session);

	if (!r[0]) {
		res.send({ r: '0', reason: r[1] });
		return;
	}

	let modified = user_retrieve(req.body.u);
	if (modified == null) {
		res.send({
			r: '0',
			reason: `User '${req.body.u}' to be modified does not exist.`
		});
		return;
	}

	res.send({
		r: '1',
		first_name: modified.get_first_name(),
		last_name: modified.get_last_name(),
		roles: modified.get_roles()
	});
}

export async function post_query_users_ranking(req: any, res: any) {
	debug(log_now(), 'POST query_users_ranking...');

	const session = new SessionID(req.cookies.session_id, req.cookies.user);
	const r = is_user_logged_in(session);

	if (!r[0]) {
		res.send({ r: '0', reason: r[1] });
		return;
	}

	const time_control_id = req.body.tc_i;

	let users: any[] = [];

	{
		let mem = ServerMemory.get_instance();
		for (let i = 0; i < mem.num_users(); ++i) {
			const user = mem.get_user(i);
			users.push({
				name: user.get_full_name(),
				rating: Math.round(user.get_rating(time_control_id).rating),
				total_games: user.get_rating(time_control_id).num_games,
				won: user.get_rating(time_control_id).won,
				drawn: user.get_rating(time_control_id).drawn,
				lost: user.get_rating(time_control_id).lost
			});
		}
	}
	users.sort((u1: any, u2: any): number => {
		if (u1.rating < u2.rating) {
			return 1;
		}
		if (u1.rating == u2.rating) {
			return 0;
		}
		return -1;
	});

	res.send({ r: '1', users: users });
}
