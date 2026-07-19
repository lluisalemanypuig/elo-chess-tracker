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
const debug = Debug('ELO_CHESS_TRACKER:server_query_users');
import { Request, Response } from 'express';

import { log_now } from '@server/utils/time';
import { user_get_all_name_randid } from '@server/managers/users';
import { is_user_logged_in } from '@server/managers/session';
import { User } from '@common/models/user';
import { UsersManager } from '@server/managers/users_manager';
import { TimeControlRating } from '@common/models/time_control_rating';
import { isDefined } from '@common/utils/is_defined';
import { Routes } from '@common/routes';
import { InputSchemaOf } from '@common/api/schemas';
import { safe_parse_request_body, safe_parse_request_cookies } from '@server/utils/schemas';
import { AuthenticationInputSchema } from '@common/schemas/authentication';

/// Returns the list of user full names and usernames sorted by name
export async function get_query_user_list(req: Request, res: Response) {
	debug(log_now(), `GET ${Routes.QUERY_USER_LIST}...`);

	const session_parse = safe_parse_request_cookies(req, AuthenticationInputSchema, res, debug);
	if (session_parse.result === 'Exit') {
		return;
	}
	const session = session_parse.data;
	const r = is_user_logged_in(session);

	if (!isDefined(r[2])) {
		res.status(401).send(r[1]);
		return;
	}

	let list = user_get_all_name_randid();
	list.sort(function (a: [string, number], b: [string, number]): number {
		return a[0].localeCompare(b[0]);
	});

	res.status(200).send(list);
}

export async function get_query_html_user_list(req: Request, res: Response) {
	debug(log_now(), `GET ${Routes.QUERY_HTML_USER_LIST}...`);

	const session_parse = safe_parse_request_cookies(req, AuthenticationInputSchema, res, debug);
	if (session_parse.result === 'Exit') {
		return;
	}
	const session = session_parse.data;
	const r = is_user_logged_in(session);

	if (!isDefined(r[2])) {
		res.status(401).send(r[1]);
		return;
	}

	let list = user_get_all_name_randid();
	list.sort(function (a: [string, number], b: [string, number]): number {
		return a[0].localeCompare(b[0]);
	});

	let data: string = '';
	for (const [name, rand_id] of list) {
		data += `<option value="${name}" id="${rand_id}">`;
	}
	res.status(200).send(data);
}

export async function get_query_user_home(req: Request, res: Response) {
	debug(log_now(), `GET ${Routes.QUERY_USER_HOME}...`);

	const session_parse = safe_parse_request_cookies(req, AuthenticationInputSchema, res, debug);
	if (session_parse.result === 'Exit') {
		return;
	}
	const session = session_parse.data;
	const r = is_user_logged_in(session);

	const user = r[2];
	if (!isDefined(user)) {
		res.status(401).send(r[1]);
		return;
	}

	const ratings_user = user.ratings.map((value: TimeControlRating) => {
		let R = value.rating.clone();
		R.rating = Math.round(R.rating);
		return { id: value.time_control, v: R };
	});

	res.status(200).send({
		fullname: user.get_full_name(),
		roles: user.roles,
		actions: user.get_actions(),
		ratings: ratings_user
	});
}

export async function post_query_user_edit(req: Request, res: Response) {
	debug(log_now(), `POST ${Routes.QUERY_USER_EDIT}...`);

	const session_parse = safe_parse_request_cookies(req, AuthenticationInputSchema, res, debug);
	if (session_parse.result === 'Exit') {
		return;
	}
	const session = session_parse.data;
	const r = is_user_logged_in(session);

	if (!isDefined(r[2])) {
		res.status(401).send(r[1]);
		return;
	}

	const user_query = safe_parse_request_body(req, InputSchemaOf(Routes.QUERY_USER_EDIT), res, debug);
	if (user_query.result === 'Exit') {
		return;
	}

	const to_edit_rid = user_query.data.u;

	const mem = UsersManager.get_instance();

	const to_edit = mem.get_user_by_random_id(to_edit_rid);
	if (!isDefined(to_edit)) {
		debug(log_now(), `Random id '${to_edit_rid}' for edited user is not valid.`);
		res.status(404).send('Invalid user');
		return;
	}

	res.status(200).send({
		first_name: to_edit.first_name,
		last_name: to_edit.last_name,
		roles: to_edit.roles
	});
}

export async function post_query_user_ranking(req: Request, res: Response) {
	debug(log_now(), `POST ${Routes.QUERY_USER_RANKING}...`);

	const session_parse = safe_parse_request_cookies(req, AuthenticationInputSchema, res, debug);
	if (session_parse.result === 'Exit') {
		return;
	}
	const session = session_parse.data;
	const r = is_user_logged_in(session);

	if (!isDefined(r[2])) {
		res.status(401).send(r[1]);
		return;
	}

	const user_query = safe_parse_request_body(req, InputSchemaOf(Routes.QUERY_USER_RANKING), res, debug);
	if (user_query.result === 'Exit') {
		return;
	}

	const time_control_id = user_query.data.tc_i;

	let users_without_games: any[] = [];
	let users_with_games: any[] = [];
	{
		const mem = UsersManager.get_instance();
		for (let i = 0; i < mem.num_users(); ++i) {
			const user = mem.get_user_at(i) as User;
			if (user.get_rating(time_control_id).num_games > 0) {
				users_with_games.push({
					name: user.get_full_name(),
					rating: Math.round(user.get_rating(time_control_id).rating),
					total_games: user.get_rating(time_control_id).num_games,
					won: user.get_rating(time_control_id).won,
					drawn: user.get_rating(time_control_id).drawn,
					lost: user.get_rating(time_control_id).lost
				});
			} else {
				users_without_games.push({
					name: user.get_full_name(),
					rating: Math.round(user.get_rating(time_control_id).rating)
				});
			}
		}
	}

	users_with_games.sort((u1: any, u2: any): number => {
		if (u1.rating < u2.rating) {
			return 1;
		}
		if (u1.rating == u2.rating) {
			return 0;
		}
		return -1;
	});

	debug(log_now(), `    Found ${users_with_games.length} users with games.`);
	debug(log_now(), `    Found ${users_without_games.length} users without games.`);

	res.status(200).send({ with_games: users_with_games, without_games: users_without_games });
}
