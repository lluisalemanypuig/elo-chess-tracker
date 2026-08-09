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
import { GameNumber, User } from '@common/models/user';
import { Game } from '@common/models/game';
import { RatingSystemManager } from '@server/managers/rating-system-manager';
import { EnvironmentManager } from '@server/managers/environment-manager';
import { GAMES_SEE } from '@common/models/user-action';
import { canUserDeleteGame, canUserEditGame, canUserSeeGame } from '@server/managers/user-relationships';
import { TimeControlId } from '@common/models/time-control';
import { gameArrayFromString } from '@common/io/game';
import { UsersManager } from '@server/managers/users-manager';
import { searchByKey } from '@server/utils/searching';
import { readDirectory } from '@server/utils/read-directory';
import { isNotDefined } from '@common/utils/is-defined';
import { ROUTES } from '@common/routes';
import { inputSchemaOf } from '@common/api/schemas';
import { safeParseRequestBody, safeParseRequestCookies } from '@server/utils/schemas';
import { AuthenticationInputSchema } from '@common/schemas/authentication';
import { QueryGamesListOutput, QueryGamesListOutputSingle } from '@common/schemas/query-games';

function increment(g: Game): any {
	const [whiteAfter, blackAfter] = RatingSystemManager.getInstance().applyRatingFunction(g);
	return {
		whiteIncrement: Math.round(whiteAfter.rating - g.whiteRating.rating),
		blackIncrement: Math.round(blackAfter.rating - g.blackRating.rating)
	};
}

/**
 * @brief Returns a list of games guided by the filter functions
 *
 * The filter functions return true when a game should be accepted.
 * @param filterGameRecord Filters game record files
 * @param filterGame Filters games
 */
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
			continue;
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

			const white = manager.getUserByUsername(g.white);
			if (isNotDefined(white)) {
				debug(logNow(), `User with username '${g.white}' could not be found.`);
				return [];
			}
			const black = manager.getUserByUsername(g.black);
			if (isNotDefined(black)) {
				debug(logNow(), `User with username '${g.black}' could not be found.`);
				return [];
			}

			const isEditable: boolean = canUserEditGame(user, white, black);
			const isDeleteable: boolean = canUserDeleteGame(user, white, black);

			dataToReturn.push({
				id: g.id,
				title: g.title,
				white: white.getFullName(),
				black: black.getFullName(),
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

export async function postQueryGameListOwn(req: Request, res: Response) {
	debug(logNow(), `POST ${ROUTES.QUERY_GAME_LIST_OWN}...`);

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

	const gameParse = safeParseRequestBody(req, inputSchemaOf(ROUTES.QUERY_GAME_LIST_OWN), res, debug);
	if (gameParse.result === 'Exit') {
		return;
	}
	const timeControlId = gameParse.data.timeControlId;

	const filterGameFunction = (g: Game): boolean => {
		return g.isUserInvolved(session.username);
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

	debug(logNow(), `Found '${dataToReturn.length}' games involving '${session.username}'`);

	res.status(200).send(dataToReturn);
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

export async function postQueryGameListAll(req: Request, res: Response) {
	debug(logNow(), `POST ${ROUTES.QUERY_GAME_LIST_ALL}...`);

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

	if (!user.canDo(GAMES_SEE)) {
		res.status(403).send('You cannot see the entire list of games in the web.');
		return;
	}

	const gameParse = safeParseRequestBody(req, inputSchemaOf(ROUTES.QUERY_GAME_LIST_ALL), res, debug);
	if (gameParse.result === 'Exit') {
		return;
	}
	const timeControlId = gameParse.data.timeControlId;

	let manager = UsersManager.getInstance();
	let dataToReturn: QueryGamesListOutput = [];
	if (timeControlId !== '') {
		dataToReturn = filterGameList(
			user,
			timeControlId,
			(_: DateMajor): boolean => {
				return true;
			},
			(g: Game): boolean => {
				const white = manager.getUserByUsername(g.white);
				if (isNotDefined(white)) {
					debug(logNow(), `User with username '${g.white}' could not be found.`);
					res.status(500).send('Invalid white user sent to the server.');
					return false;
				}
				const black = manager.getUserByUsername(g.black);
				if (isNotDefined(black)) {
					debug(logNow(), `User with username '${g.black}' could not be found.`);
					res.status(500).send('Invalid black user sent to the server.');
					return false;
				}
				return canUserSeeGame(user, white, black);
			}
		);
	} else {
		const ratings = RatingSystemManager.getInstance();
		for (const tid of ratings.getUniqueTimeControlsIds()) {
			const data = filterGameList(
				user,
				tid,
				(_: DateMajor): boolean => {
					return true;
				},
				(g: Game): boolean => {
					const white = manager.getUserByUsername(g.white);
					if (isNotDefined(white)) {
						debug(logNow(), `User with username '${g.white}' could not be found.`);
						return false;
					}
					const black = manager.getUserByUsername(g.black);
					if (isNotDefined(black)) {
						debug(logNow(), `User with username '${g.black}' could not be found.`);
						return false;
					}
					return canUserSeeGame(user, white, black);
				}
			);
			dataToReturn = mergeByDate(dataToReturn, data);
		}
	}

	res.status(200).send(dataToReturn);
}
