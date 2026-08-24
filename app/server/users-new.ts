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

import { Empty } from '@common/api/schemas-endpoints';
import { UserCreateInput } from '@common/api/schemas/user';
import { isRoleStringCorrect } from '@common/models/user-role';
import { logNow } from '@common/utils/time';
import { userAddNew } from '@server/managers/users';
import { PublicError } from '@server/models/error-types/public-error';
import { UserSession } from '@server/models/user';
import Debug from 'debug';

const debug = Debug('ELO_CHESS_TRACKER:users-new');

export async function getPageUserCreate({
	user,
	session: _session,
}: UserSession) {
	debug(logNow(), 'function getPageUserCreate...');

	if (!user.canDo('CREATE_USER')) {
		debug(logNow(), `User '${user.username}' cannot create users.`);
		throw new PublicError('You cannot create users.');
	}
	if (!user.canDo('ASSIGN_ROLE')) {
		debug(logNow(), `User '${user.username}' cannot assign roles to users.`);
		throw new PublicError(
			`You cannot assign roles and thus cannot create users.`,
		);
	}

	return 'html/user/new.html';
}

export async function postUserCreate(
	{ user: registerer, session: _session }: UserSession,
	input: UserCreateInput,
): Promise<Empty> {
	debug(logNow(), 'function postUserCreate...');

	debug(
		logNow(),
		`User '${registerer.username}' is trying to create a new user:`,
	);
	debug(logNow(), `    Username: '${input.username}'`);
	debug(logNow(), `    First name: '${input.firstName}'`);
	debug(logNow(), `    Last name: '${input.lastName}'`);
	debug(logNow(), `    Roles: '${input.roles}'`);

	for (const r of input.roles) {
		if (!isRoleStringCorrect(r)) {
			throw new PublicError(`Role string '${r}' is not correct.`);
		}
	}

	userAddNew(registerer, input);

	return {};
}
