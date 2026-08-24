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
import {
	QueryUserEditInput,
	QueryUserEditOutput,
	QueryUserHomeOutput,
	QueryUserRankingInput,
	QueryUserRankingOutput,
	TimeControlAndRating,
	UserWithGames,
	UserWithoutGames,
} from '@common/api/schemas/query-user';
import { UserThin } from '@common/models/user-thin';
import { isNotDefined } from '@common/utils/is-defined';
import { logNow } from '@common/utils/time';
import { canUserEditUser } from '@server/managers/user-relationships';
import { userGetAllNamePublicId } from '@server/managers/users';
import { UsersManager } from '@server/managers/users-manager';
import { PublicError } from '@server/models/error-types/public-error';
import { TimeControlRating } from '@server/models/time-control-rating';
import { UserSession } from '@server/models/user';
import Debug from 'debug';

const debug = Debug('ELO_CHESS_TRACKER:serverQueryUsers');

// Returns the list of user full names and usernames sorted by name
export async function getQueryUserList(_u: UserSession, _i: Empty) {
	debug(logNow(), 'function getQueryUserList...');

	let list = userGetAllNamePublicId();
	list.sort(function (a: UserThin, b: UserThin): number {
		return a.name.localeCompare(b.name);
	});

	return list;
}

export async function getQueryHtmlUserList(_u: UserSession) {
	debug(logNow(), 'function getQueryHtmlUserList...');

	let list = userGetAllNamePublicId();
	list.sort(function (a: UserThin, b: UserThin): number {
		return a.name.localeCompare(b.name);
	});

	let data: string = '';
	for (const u of list) {
		data += `<option value="${u.name}" id="${u.id}">`;
	}
	return data;
}

export async function getQueryUserHome({ user, session: _session }: UserSession, _i: Empty) {
	debug(logNow(), 'function getQueryUserHome...');

	const ratingsUser = user.ratings.map((value: TimeControlRating): TimeControlAndRating => {
		return {
			timeControlId: value.timeControl,
			rating: {
				rating: Math.round(value.rating.rating),
				numGames: value.rating.numGames,
				won: value.rating.won,
				drawn: value.rating.drawn,
				lost: value.rating.lost,
			},
		};
	});

	const output: QueryUserHomeOutput = {
		fullname: user.getFullName(),
		roles: user.roles,
		actions: user.getActions(),
		ratings: ratingsUser,
	};
	return output;
}

export async function postQueryUserEdit({ user, session: _session }: UserSession, input: QueryUserEditInput) {
	debug(logNow(), 'function postQueryUserEdit...');

	if (!user.canDo('EDIT_USER')) {
		throw new PublicError(`You do not have enough permissions to edit users.`);
	}

	const toEditPublicId = input.u;

	const toEdit = UsersManager.getInstance().getAllUserDataByPublicId(toEditPublicId);
	if (isNotDefined(toEdit)) {
		debug(logNow(), `Public id '${toEditPublicId}' for edited user is not valid.`);
		throw new PublicError('Cannot edit invalid user.');
	}

	if (!canUserEditUser(user, toEdit.user)) {
		debug(logNow(), `User '${user.username}' is querying information of user '${toEdit.user.username}' to edit it.`);
		throw new PublicError('You cannot edit this user.');
	}

	const output: QueryUserEditOutput = {
		firstName: toEdit.user.firstName,
		lastName: toEdit.user.lastName,
		roles: toEdit.user.roles,
	};
	return output;
}

export async function postQueryUserRanking(_u: UserSession, input: QueryUserRankingInput) {
	debug(logNow(), 'function postQueryUserRanking...');

	const timeControlId = input.timeControlId;

	let usersWithoutGames: UserWithoutGames[] = [];
	let usersWithGames: UserWithGames[] = [];
	{
		const mem = UsersManager.getInstance();
		for (let i = 0; i < mem.numUsers(); ++i) {
			const user = mem.getAllUserDataAtSafeIdx(i).user;

			if (user.getRating(timeControlId).numGames > 0) {
				usersWithGames.push({
					name: user.getFullName(),
					rating: Math.round(user.getRating(timeControlId).rating),
					totalGames: user.getRating(timeControlId).numGames,
					won: user.getRating(timeControlId).won,
					drawn: user.getRating(timeControlId).drawn,
					lost: user.getRating(timeControlId).lost,
				});
			} else {
				usersWithoutGames.push({
					name: user.getFullName(),
					rating: Math.round(user.getRating(timeControlId).rating),
				});
			}
		}
	}

	usersWithGames.sort((u1: UserWithGames, u2: UserWithGames): number => {
		if (u1.rating < u2.rating) {
			return 1;
		}
		if (u1.rating === u2.rating) {
			return 0;
		}
		return -1;
	});

	debug(logNow(), `    Found ${usersWithGames.length} users with games.`);
	debug(logNow(), `    Found ${usersWithoutGames.length} users without games.`);

	const output: QueryUserRankingOutput = { withGames: usersWithGames, withoutGames: usersWithoutGames };
	return output;
}
