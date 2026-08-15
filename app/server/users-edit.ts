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
const debug = Debug('ELO_CHESS_TRACKER:serverUsersEdit');
import { Request, Response } from 'express';

import { logNow } from '@common/utils/time';
import { isUserLoggedIn } from '@server/managers/session';
import { userEdit } from '@server/managers/users';
import { UsersManager } from '@server/managers/users-manager';
import { ConfigurationManager } from '@server/managers/configuration-manager';
import { getExecutionDirectory } from '@server/managers/environment-manager';
import { isNotDefined } from '@common/utils/is-defined';
import { ROUTES } from '@common/api/routes';
import { inputSchemaOf } from '@common/api/schemas-endpoints';
import { safeParseRequestBody, safeParseRequestCookies } from '@server/utils/schemas';

export async function getPageUserEdit(req: Request, res: Response) {
	debug(logNow(), `GET ${ROUTES.PAGE_USER_EDIT}...`);

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

	if (!user.canDo('EDIT_USER')) {
		debug(logNow(), `    User '${user.username}' does not have sufficient permissions.`);
		res.status(403).send('You cannot edit users');
		return;
	}

	res.status(200);
	if (ConfigurationManager.shouldCacheData()) {
		res.setHeader('Cache-Control', 'public, max-age=864000, immutable');
	}
	res.sendFile(`${getExecutionDirectory()}/html/user/edit.html`);
}

export async function postUserEdit(req: Request, res: Response) {
	debug(logNow(), `POST ${ROUTES.USER_EDIT}...`);

	const sessionParse = safeParseRequestCookies(req, res, debug);
	if (sessionParse.result === 'Exit') {
		return;
	}
	const session = sessionParse.data;
	const r = isUserLoggedIn(session);

	const editor = r[2];
	if (isNotDefined(editor)) {
		res.status(401).send(r[1]);
		return;
	}

	const userParse = safeParseRequestBody(req, inputSchemaOf(ROUTES.USER_EDIT), res, debug);
	if (userParse.result === 'Exit') {
		return;
	}

	const editedPublicId = userParse.data.u;
	const firstName = userParse.data.f;
	const lastName = userParse.data.l;
	const roles = userParse.data.r;

	const mem = UsersManager.getInstance();

	const edited = mem.getAllUserDataByPublicId(editedPublicId);
	if (isNotDefined(edited)) {
		debug(logNow(), `Public id '${editedPublicId}' for user is not valid.`);
		res.status(404).send('Invalid user');
		return;
	}

	try {
		userEdit(editor, edited.user, { firstName, lastName, roles });
	} catch (e) {
		res.status(403).send((e as Error).message);
		return;
	}

	res.status(200).send();
}
