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
import { UserEditInput } from '@common/api/schemas/user';
import { isNotDefined } from '@common/utils/is-defined';
import { logNow } from '@common/utils/time';
import { userEdit } from '@server/managers/users';
import { UsersManager } from '@server/managers/users-manager';
import { PublicError } from '@server/models/error-types/public-error';
import { UserSession } from '@server/models/user';
import Debug from 'debug';

const debug = Debug('ELO_CHESS_TRACKER:users-edit');

export async function getPageUserEdit({
	user,
	session: _session,
}: UserSession) {
	debug(logNow(), 'function getPageUserEdit...');

	if (!user.canDo('EDIT_USER')) {
		debug(
			logNow(),
			`    User '${user.username}' does not have sufficient permissions.`,
		);
		throw new PublicError('You cannot edit users');
	}

	return 'html/user/edit.html';
}

export async function postUserEdit(
	{ user: editor, session: _session }: UserSession,
	input: UserEditInput,
): Promise<Empty> {
	debug(logNow(), 'function postUserEdit...');

	const mem = UsersManager.getInstance();

	const edited = mem.getAllUserDataByPublicId(input.publicId);
	if (isNotDefined(edited)) {
		debug(logNow(), `Public id '${input.publicId}' for user is not valid.`);
		throw new PublicError('Invalid user');
	}

	userEdit(editor, edited.user, {
		firstName: input.firstName,
		lastName: input.lastName,
		roles: input.roles,
	});

	return {};
}
