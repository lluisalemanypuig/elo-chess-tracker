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
const debug = Debug('ELO_CHESS_TRACKER:serverQueryGames');
import { Request, Response } from 'express';

import path from 'path';
import fs from 'fs';

import { DateMajor, logNow } from '@common/utils/time';
import { isUserLoggedIn } from '@server/managers/session';
import { GameNumber, User } from '@server/models/user';
import { Game } from '@server/models/game';
import { RatingSystemManager } from '@server/managers/rating-system-manager';
import { EnvironmentManager } from '@server/managers/environment-manager';
import { canUserDeleteGame, canUserEditGame, canUserSeeGame } from '@server/managers/user-relationships';
import { gameArrayFromString } from '@server/io/game';
import { UsersManager } from '@server/managers/users-manager';
import { searchByKey } from '@server/utils/searching';
import { readDirectory } from '@server/utils/read-directory';
import { isNotDefined } from '@common/utils/is-defined';
import { ROUTES } from '@common/api/routes';
import { inputSchemaOf } from '@common/api/schemas-endpoints';
import { safeParseRequestBody, safeParseRequestCookies } from '@server/utils/schemas';
import {
	QueryGamesListAllInput,
	QueryGamesListOutput,
	QueryGamesListOutputSingle,
	QueryGamesListOwnInput
} from '@common/api/schemas/query-games';
import { TimeControlId } from '@common/models/time-control';
import { InternalError } from './models/error-types/internal-error';
import { PublicError } from './models/error-types/public-error';

function increment(g: Game) {
	const [whiteAfter, blackAfter] = RatingSystemManager.getInstance().applyRatingFunction(g);
	return {
		whiteIncrement: Math.round(whiteAfter.rating - g.whiteRating.rating),
		blackIncrement: Math.round(blackAfter.rating - g.blackRating.rating)
	};
}

function filterGameList(
	user: User,
	timeControlId: TimeControlId,
	filterGameRecord: Function,
	filterGame: Function
): QueryGamesListOutputSingle[] {
	let dataToReturn: QueryGamesListOutputSingle[] = [];

	const gamesIdDir = EnvironmentManager.getInstance().getDirGamesTimeControl(timeControlId);

	// The files currently existing in the 'gamesDirectory'
	debug(logNow(), `Reading directory '${gamesIdDir}'...`);
	const gameRecordFileList = readDirectory(gamesIdDir);

	debug(logNow(), `    Directory contents: '${gameRecordFileList}'`);

	let manager = UsersManager.getInstance();

	for (let i = gameRecordFileList.length - 1; i >= 0; --i) {
		const gameRecordFile = path.join(gamesIdDir, gameRecordFileList[i]);

		if (!filterGameRecord(gameRecordFileList[i])) {
			continue;
		}

		// read the games from the file
		debug(logNow(), `    Reading game record '${gameRecordFile}'...`);
		const data = fs.readFileSync(gameRecordFile, 'utf8');
		debug(logNow(), `        Game record '${gameRecordFile}' read.`);
		const gameSet = gameArrayFromString(data);
		if (isNotDefined(gameSet)) {
			debug(logNow(), `        Game record '${gameRecordFile}' could not be parsed.`);
			throw new InternalError(`Game record '${gameRecordFile}' could not be parsed.`);
		}

		for (let j = gameSet.length - 1; j >= 0; --j) {
			const g = gameSet[j];

			if (!filterGame(g)) {
				continue;
			}

			const inc = increment(g);

			const result = ((): string => {
				if (g.result === 'white_wins') {
					return '1 - 0';
				}
				if (g.result === 'black_wins') {
					return '0 - 1';
				}
				return '1/2 - 1/2';
			})();

			const white = manager.getAllUserDataByPrivateId(g.white);
			if (isNotDefined(white)) {
				debug(logNow(), `User with username '${g.white}' could not be found.`);
				throw new InternalError(`User with username '${g.white}' could not be found.`);
			}
			const black = manager.getAllUserDataByPrivateId(g.black);
			if (isNotDefined(black)) {
				debug(logNow(), `User with username '${g.black}' could not be found.`);
				throw new InternalError(`User with username '${g.black}' could not be found.`);
			}

			const isEditable: boolean = canUserEditGame(user, white.user, black.user);
			const isDeleteable: boolean = canUserDeleteGame(user, white.user, black.user);

			dataToReturn.push({
				id: g.id,
				title: g.title,
				white: white.user.getFullName(),
				black: black.user.getFullName(),
				result: result,
				timeControlName: g.timeControlName,
				date: g.when,
				whiteRating: Math.round(g.whiteRating.rating),
				blackRating: Math.round(g.blackRating.rating),
				whiteIncrement: inc.whiteIncrement,
				blackIncrement: inc.blackIncrement,
				editable: isEditable,
				deleteable: isDeleteable
			});
		}
	}

	return dataToReturn;
}

export async function postQueryGameListOwn(user: User, input: QueryGamesListOwnInput) {
	debug(logNow(), 'function postQueryGameListOwn...');

	const timeControlId = input.timeControlId;

	const filterGameFunction = (g: Game): boolean => {
		return g.isUserInvolved(user.username);
	};

	let dataToReturn: QueryGamesListOutput = [];
	if (timeControlId !== '') {
		dataToReturn = filterGameList(
			user,
			timeControlId,
			(recordId: DateMajor): boolean => {
				const gameRecordList = user.getGames(timeControlId);
				return (
					searchByKey(gameRecordList, (r: GameNumber): number => {
						return recordId.localeCompare(r.record);
					}) !== -1
				);
			},
			filterGameFunction
		);
	} else {
		const ratings = RatingSystemManager.getInstance();
		for (const tid of ratings.getUniqueTimeControlsIds()) {
			const data = filterGameList(
				user,
				tid,
				(recordId: DateMajor): boolean => {
					const gameRecordList = user.getGames(tid);
					return (
						searchByKey(gameRecordList, (r: GameNumber): number => {
							return recordId.localeCompare(r.record);
						}) !== -1
					);
				},
				filterGameFunction
			);
			dataToReturn = dataToReturn.concat(data);
		}
	}

	debug(logNow(), `Found '${dataToReturn.length}' games involving '${user.username}'`);

	return dataToReturn;
}

function mergeByDate(v1: QueryGamesListOutputSingle[], v2: QueryGamesListOutputSingle[]): QueryGamesListOutputSingle[] {
	let v3: QueryGamesListOutputSingle[] = [];
	let i: number = 0;
	let j: number = 0;
	while (i < v1.length && j < v2.length) {
		const comp = v1[i].date.localeCompare(v2[j].date);
		if (comp < 0) {
			v3.push(v2[j]);
			++j;
		} else if (comp > 0) {
			v3.push(v1[i]);
			++i;
		} else {
			v3.push(v1[i]);
			v3.push(v2[j]);
			++i;
			++j;
		}
	}
	while (i < v1.length) {
		v3.push(v1[i]);
		++i;
	}
	while (j < v2.length) {
		v3.push(v2[j]);
		++j;
	}
	return v3;
}

export async function postQueryGameListAll(user: User, input: QueryGamesListAllInput) {
	debug(logNow(), 'function postQueryGameListAll...');

	if (!user.canDo('SEE_GAMES')) {
		throw new PublicError('You cannot see the entire list of games in the web.');
	}

	const timeControlId = input.timeControlId;

	let manager = UsersManager.getInstance();

	if (timeControlId !== '') {
		return filterGameList(
			user,
			timeControlId,
			(_: DateMajor): boolean => {
				return true;
			},
			(g: Game): boolean => {
				const white = manager.getAllUserDataByPrivateId(g.white);
				if (isNotDefined(white)) {
					debug(logNow(), `User with username '${g.white}' could not be found.`);
					throw new InternalError(`User with username '${g.white}' could not be found.`);
				}
				const black = manager.getAllUserDataByPrivateId(g.black);
				if (isNotDefined(black)) {
					debug(logNow(), `User with username '${g.black}' could not be found.`);
					throw new InternalError(`User with username '${g.black}' could not be found.`);
				}
				return canUserSeeGame(user, white.user, black.user);
			}
		);
	}

	let dataToReturn: QueryGamesListOutputSingle[] = [];
	const ratings = RatingSystemManager.getInstance();
	for (const tid of ratings.getUniqueTimeControlsIds()) {
		const data = filterGameList(
			user,
			tid,
			(_: DateMajor): boolean => {
				return true;
			},
			(g: Game): boolean => {
				const white = manager.getAllUserDataByPrivateId(g.white);
				if (isNotDefined(white)) {
					debug(logNow(), `User with username '${g.white}' could not be found.`);
					throw new InternalError(`User with username '${g.white}' could not be found.`);
				}
				const black = manager.getAllUserDataByPrivateId(g.black);
				if (isNotDefined(black)) {
					debug(logNow(), `User with username '${g.black}' could not be found.`);
					throw new InternalError(`User with username '${g.black}' could not be found.`);
				}
				return canUserSeeGame(user, white.user, black.user);
			}
		);
		dataToReturn = mergeByDate(dataToReturn, data);
	}

	return dataToReturn;
}
