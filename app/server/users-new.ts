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
const debug = Debug('ELO_CHESS_TRACKER:serverUsersNew');
import { Request, Response } from 'express';

import { logNow } from '@common/utils/time';
import { isUserLoggedIn } from '@server/managers/session';
import { userAddNew } from '@server/managers/users';
import { isRoleStringCorrect } from '@common/models/user-role';
import { getRoleActionName } from '@common/models/user-action';
import { UsersManager } from '@server/managers/users-manager';
import { ConfigurationManager } from '@server/managers/configuration-manager';
import { getExecutionDirectory } from '@server/managers/environment-manager';
import { isNotDefined } from '@common/utils/is-defined';
import { ROUTES } from '@common/api/routes';
import { inputSchemaOf } from '@common/api/schemas-endpoints';
import { safeParseRequestBody, safeParseRequestCookies } from '@server/utils/schemas';

export async function getPageUserCreate(req: Request, res: Response) {
	debug(logNow(), `GET ${ROUTES.PAGE_USER_CREATE}...`);

	const sessionParse = safeParseRequestCookies(req, res, debug);
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

	if (!user.canDo('CREATE_USER')) {
		debug(logNow(), `User '${user.username}' cannot create users.`);
		res.status(403).send('You cannot create users.');
		return;
	}
	if (!user.canDo('ASSIGN_ROLE')) {
		debug(logNow(), `User '${user.username}' cannot assign roles to users.`);
		res.status(403).send(`You cannot assign roles and thus cannot create users.`);
		return;
	}

	res.status(200);
	if (ConfigurationManager.shouldCacheData()) {
		res.setHeader('Cache-Control', 'public, max-age=864000, immutable');
	}
	res.sendFile(`${getExecutionDirectory()}/html/user/new.html`);
}

export async function postUserCreate(req: Request, res: Response) {
	debug(logNow(), `POST ${ROUTES.USER_CREATE}`);

	const sessionParse = safeParseRequestCookies(req, res, debug);
	if (sessionParse.result === 'Exit') {
		return;
	}
	const session = sessionParse.data;
	const r = isUserLoggedIn(session);
	const registerer = r[2];
	if (isNotDefined(registerer)) {
		res.status(401).send(r[1]);
		return;
	}

	if (!registerer.canDo('CREATE_USER')) {
		debug(logNow(), `User '${registerer.username}' cannot create users.`);
		res.status(403).send('You cannot create users.');
		return;
	}
	if (!registerer.canDo('ASSIGN_ROLE')) {
		debug(logNow(), `User '${registerer.username}' cannot assign roles to users.`);
		res.status(403).send(`You cannot assign roles and thus cannot create users.`);
		return;
	}

	const userParse = safeParseRequestBody(req, inputSchemaOf(ROUTES.USER_CREATE), res, debug);
	if (userParse.result === 'Exit') {
		return;
	}

	const username = userParse.data.u;
	const firstname = userParse.data.fn;
	const lastname = userParse.data.ln;
	const password = userParse.data.password;
	const roles = userParse.data.r;

	debug(logNow(), `User '${registerer.username}' is trying to create a new user:`);
	debug(logNow(), `    Username: '${username}'`);
	debug(logNow(), `    First name: '${firstname}'`);
	debug(logNow(), `    Last name: '${lastname}'`);
	debug(logNow(), `    Roles: '${roles}'`);

	if (UsersManager.getInstance().exists(username)) {
		res.status(500).send(`This user already exists`);
		return;
	}

	for (const r of roles) {
		if (!isRoleStringCorrect(r)) {
			res.status(500).send(`Role string '${r}' is not correct.`);
			return;
		}

		const action = getRoleActionName('ASSIGN_ROLE_USERS', r);
		if (!registerer.canDo(action)) {
			res.status(403).send(`You cannot do ${action}.`);
			return;
		}
	}

	userAddNew(username, firstname, lastname, password, roles);
	res.status(201).send();
}
