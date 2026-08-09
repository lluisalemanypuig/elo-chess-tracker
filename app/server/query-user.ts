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
const debug = Debug('ELO_CHESS_TRACKER:serverQueryUsers');
import { Request, Response } from 'express';

import { logNow } from '@common/utils/time';
import { userGetAllNamePublicId } from '@server/managers/users';
import { isUserLoggedIn } from '@server/managers/session';
import { User } from '@common/models/user';
import { UsersManager } from '@server/managers/users-manager';
import { TimeControlRating } from '@common/models/time-control-rating';
import { isNotDefined } from '@common/utils/is-defined';
import { ROUTES } from '@common/routes';
import { inputSchemaOf } from '@common/api/schemas';
import { safeParseRequestBody, safeParseRequestCookies } from '@server/utils/schemas';
import { AuthenticationInputSchema } from '@common/schemas/authentication';
import { UserThin } from '@common/models/user-thin';
import {
	QueryUserEditOutput,
	QueryUserHomeOutput,
	QueryUserRankingOutput,
	TimeControlAndRating,
	UserWithGames,
	UserWithoutGames
} from '@common/schemas/query-user';

/// Returns the list of user full names and usernames sorted by name
export async function getQueryUserList(req: Request, res: Response) {
	debug(logNow(), `GET ${ROUTES.QUERY_USER_LIST}...`);

	const sessionParse = safeParseRequestCookies(req, AuthenticationInputSchema, res, debug);
	if (sessionParse.result === 'Exit') {
		return;
	}
	const session = sessionParse.data;
	const r = isUserLoggedIn(session);

	if (isNotDefined(r[2])) {
		res.status(401).send(r[1]);
		return;
	}

	let list = userGetAllNamePublicId();
	list.sort(function (a: UserThin, b: UserThin): number {
		return a.name.localeCompare(b.name);
	});

	res.status(200).send(list);
}

export async function getQueryHtmlUserList(req: Request, res: Response) {
	debug(logNow(), `GET ${ROUTES.QUERY_HTML_USER_LIST}...`);

	const sessionParse = safeParseRequestCookies(req, AuthenticationInputSchema, res, debug);
	if (sessionParse.result === 'Exit') {
		return;
	}
	const session = sessionParse.data;
	const r = isUserLoggedIn(session);

	if (isNotDefined(r[2])) {
		res.status(401).send(r[1]);
		return;
	}

	let list = userGetAllNamePublicId();
	list.sort(function (a: UserThin, b: UserThin): number {
		return a.name.localeCompare(b.name);
	});

	let data: string = '';
	for (const u of list) {
		data += `<option value="${u.name}" id="${u.id}">`;
	}
	res.status(200).send(data);
}

export async function getQueryUserHome(req: Request, res: Response) {
	debug(logNow(), `GET ${ROUTES.QUERY_USER_HOME}...`);

	const sessionParse = safeParseRequestCookies(req, AuthenticationInputSchema, res, debug);
	if (sessionParse.result === 'Exit') {
		return;
	}
	const session = sessionParse.data;
	const r = isUserLoggedIn(session);

	const user = r[2];
	if (isNotDefined(user)) {
		res.status(401).send(r[1]);
		return;
	}

	const ratingsUser = user.ratings.map((value: TimeControlRating): TimeControlAndRating => {
		let R = value.rating.clone();
		R.rating = Math.round(R.rating);
		return { timeControlId: value.timeControl, rating: R };
	});

	const output: QueryUserHomeOutput = {
		fullname: user.getFullName(),
		roles: user.roles,
		actions: user.getActions(),
		ratings: ratingsUser
	};
	res.status(200).send(output);
}

export async function postQueryUserEdit(req: Request, res: Response) {
	debug(logNow(), `POST ${ROUTES.QUERY_USER_EDIT}...`);

	const sessionParse = safeParseRequestCookies(req, AuthenticationInputSchema, res, debug);
	if (sessionParse.result === 'Exit') {
		return;
	}
	const session = sessionParse.data;
	const r = isUserLoggedIn(session);

	if (isNotDefined(r[2])) {
		res.status(401).send(r[1]);
		return;
	}

	const userQuery = safeParseRequestBody(req, inputSchemaOf(ROUTES.QUERY_USER_EDIT), res, debug);
	if (userQuery.result === 'Exit') {
		return;
	}

	const toEditRid = userQuery.data.u;

	const mem = UsersManager.getInstance();

	const toEdit = mem.getUserByPublicId(toEditRid);
	if (isNotDefined(toEdit)) {
		debug(logNow(), `Random id '${toEditRid}' for edited user is not valid.`);
		res.status(404).send('Invalid user');
		return;
	}

	const output: QueryUserEditOutput = {
		firstName: toEdit.firstName,
		lastName: toEdit.lastName,
		roles: toEdit.roles
	};
	res.status(200).send(output);
}

export async function postQueryUserRanking(req: Request, res: Response) {
	debug(logNow(), `POST ${ROUTES.QUERY_USER_RANKING}...`);

	const sessionParse = safeParseRequestCookies(req, AuthenticationInputSchema, res, debug);
	if (sessionParse.result === 'Exit') {
		return;
	}
	const session = sessionParse.data;
	const r = isUserLoggedIn(session);

	if (isNotDefined(r[2])) {
		res.status(401).send(r[1]);
		return;
	}

	const userQuery = safeParseRequestBody(req, inputSchemaOf(ROUTES.QUERY_USER_RANKING), res, debug);
	if (userQuery.result === 'Exit') {
		return;
	}

	const timeControlId = userQuery.data.timeControlId;

	let usersWithoutGames: UserWithoutGames[] = [];
	let usersWithGames: UserWithGames[] = [];
	{
		const mem = UsersManager.getInstance();
		for (let i = 0; i < mem.numUsers(); ++i) {
			const user = mem.getUserAt(i) as User;
			if (user.getRating(timeControlId).numGames > 0) {
				usersWithGames.push({
					name: user.getFullName(),
					rating: Math.round(user.getRating(timeControlId).rating),
					totalGames: user.getRating(timeControlId).numGames,
					won: user.getRating(timeControlId).won,
					drawn: user.getRating(timeControlId).drawn,
					lost: user.getRating(timeControlId).lost
				});
			} else {
				usersWithoutGames.push({
					name: user.getFullName(),
					rating: Math.round(user.getRating(timeControlId).rating)
				});
			}
		}
	}

	usersWithGames.sort((u1: UserWithGames, u2: UserWithGames): number => {
		if (u1.rating < u2.rating) {
			return 1;
		}
		if (u1.rating == u2.rating) {
			return 0;
		}
		return -1;
	});

	debug(logNow(), `    Found ${usersWithGames.length} users with games.`);
	debug(logNow(), `    Found ${usersWithoutGames.length} users without games.`);

	const output: QueryUserRankingOutput = { withGames: usersWithGames, withoutGames: usersWithoutGames };
	res.status(200).send(output);
}
