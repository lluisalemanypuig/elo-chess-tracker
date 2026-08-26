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
	QueryChallengesConfirmResultOtherOutput,
	QueryChallengesConfirmResultSelfOutput,
	QueryChallengesPendingResultOutput,
	QueryChallengesReceivedOutput,
	QueryChallengesSentOutput,
} from '@common/api/schemas/query-challenges';
import { UserGivenName } from '@common/models/user-given-name';
import { isDefined, isNotDefined } from '@common/utils/is-defined';
import { logNow } from '@common/utils/time';
import { getChallengesBy } from '@server/managers/challenges';
import { canUserDeclineChallenge } from '@server/managers/user-relationships';
import { UsersManager } from '@server/managers/users-manager';
import { Challenge } from '@server/models/challenge';
import { InternalError } from '@server/models/error-types/internal-error';
import { UserSession } from '@server/models/user';
import Debug from 'debug';

const debug = Debug('ELO_CHESS_TRACKER:serverQueryChallenges');

// Query the server for challenges received sento to me by other users
export async function getQueryChallengeReceived(
	{ user: sentTo }: UserSession,
	_i: Empty,
) {
	debug(logNow(), 'function getQueryChallengeReceived...');

	// challenges to be returned
	const toReturn = getChallengesBy((c: Challenge): boolean => {
		if (c.sentTo !== sentTo.username) {
			return false;
		}
		if (isDefined(c.whenChallengeAccepted)) {
			return false;
		}
		return true;
	});

	let manager = UsersManager.getInstance();

	let allChallengesReceived: QueryChallengesReceivedOutput = [];
	for (const c of toReturn) {
		const sentBy = manager.getAllUserDataByPrivateId(c.sentBy);
		if (isNotDefined(sentBy)) {
			debug(logNow(), `User '${c.sentBy}' does not exist.`);
			throw new InternalError(
				`User '${c.sentBy}' from challenge does not exist`,
			);
		}

		// return only basic information
		allChallengesReceived.push({
			id: c.id,
			title: c.title,
			sentBy: sentBy.user.getFullName(),
			sentWhen: c.whenChallengeSent,
			timeControlName: c.timeControlName,
			canBeDeclined: canUserDeclineChallenge(
				sentTo,
				sentBy.user,
				c.timeControlId,
			),
		});
	}

	debug(logNow(), `Found '${allChallengesReceived.length}' challenges`);

	return allChallengesReceived;
}

// Query the server for challenges sent to other users by me
export async function getQueryChallengeSent(
	{ user: sentBy }: UserSession,
	_i: Empty,
) {
	debug(logNow(), 'function getQueryChallengeSent...');

	// challenges to be returned
	const toReturn = getChallengesBy((c: Challenge): boolean => {
		if (c.sentBy !== sentBy.username) {
			return false;
		}
		if (isDefined(c.whenChallengeAccepted)) {
			return false;
		}
		return true;
	});

	let manager = UsersManager.getInstance();

	let allChallenges: QueryChallengesSentOutput = [];
	for (const c of toReturn) {
		const sentTo = manager.getAllUserDataByPrivateId(c.sentTo);
		if (isNotDefined(sentTo)) {
			debug(logNow(), `User '${c.sentTo}' does not exist.`);
			throw new InternalError(
				`User '${c.sentTo}' from challenge does not exist`,
			);
		}

		// return only basic information
		allChallenges.push({
			id: c.id,
			title: c.title,
			sentTo: sentTo.user.getFullName(),
			sentWhen: c.whenChallengeSent,
			timeControlName: c.timeControlName,
			canBeDeclined: canUserDeclineChallenge(
				sentTo.user,
				sentBy,
				c.timeControlId,
			),
		});
	}

	debug(logNow(), `Found '${allChallenges.length}' challenges`);

	return allChallenges;
}

// Query the server for accepted challenges whose result has not been set yet.
export async function getQueryChallengePendingResult(
	{ user }: UserSession,
	_i: Empty,
) {
	debug(logNow(), 'function getQueryChallengePendingResult...');

	// challenges to be returned
	const toReturn = getChallengesBy((c: Challenge): boolean => {
		// this user must be involved in the challenge
		if (c.sentBy !== user.username && c.sentTo !== user.username) {
			return false;
		}
		// must have been accepted
		if (isNotDefined(c.whenChallengeAccepted)) {
			return false;
		}
		// result can't have been set
		if (isDefined(c.resultSetBy)) {
			return false;
		}
		return true;
	});

	let manager = UsersManager.getInstance();

	let allChallenges: QueryChallengesPendingResultOutput = [];
	for (const c of toReturn) {
		const userSentTo = manager.getAllUserDataByPrivateId(c.sentTo);
		if (isNotDefined(userSentTo)) {
			debug(logNow(), `User '${c.sentTo}' does not exist.`);
			throw new InternalError(
				`User '${c.sentTo}' from challenge does not exist.`,
			);
		}

		const userSentBy = manager.getAllUserDataByPrivateId(c.sentBy);
		if (isNotDefined(userSentBy)) {
			debug(logNow(), `User '${c.sentBy}' does not exist.`);
			throw new InternalError(
				`User '${c.sentBy}' from challenge does not exist.`,
			);
		}

		const opponent = ((): UserGivenName => {
			if (userSentBy.user.username === user.username) {
				return userSentTo.user.getFullName();
			}
			return userSentBy.user.getFullName();
		})();

		// return only basic information
		allChallenges.push({
			id: c.id,
			title: c.title,
			sentBy: {
				name: userSentBy.user.getFullName(),
				publicId: userSentBy.publicId,
			},
			sentTo: {
				name: userSentTo.user.getFullName(),
				publicId: userSentTo.publicId,
			},
			opponent: opponent,
			sentWhen: c.whenChallengeSent,
			timeControlName: c.timeControlName,
		});
	}

	debug(logNow(), `Found '${allChallenges.length}' challenges`);

	return allChallenges;
}

// Query the server for accepted challenges whose result has been set by me
export async function getQueryChallengeConfirmResultOther(
	{ user }: UserSession,
	_i: Empty,
) {
	debug(logNow(), 'function getQueryChallengeConfirmResultOther...');

	// challenges to be returned
	const toReturn = getChallengesBy((c: Challenge): boolean => {
		// this user must be involved in the challenge
		if (c.sentBy !== user.username && c.sentTo !== user.username) {
			return false;
		}
		// must have been accepted
		if (isNotDefined(c.whenChallengeAccepted)) {
			return false;
		}
		// result already set
		if (isNotDefined(c.resultSetBy)) {
			return false;
		}
		// result should have been set by this user
		if (c.resultSetBy !== user.username) {
			return false;
		}
		return true;
	});

	let manager = UsersManager.getInstance();

	let allChallenges: QueryChallengesConfirmResultOtherOutput = [];
	for (const c of toReturn) {
		const sentTo = manager.getAllUserDataByPrivateId(c.sentTo);
		if (isNotDefined(sentTo)) {
			debug(logNow(), `User '${c.sentTo}' does not exist.`);
			throw new InternalError(
				`User '${c.sentTo}' from challenge does not exist.`,
			);
		}

		const sentBy = manager.getAllUserDataByPrivateId(c.sentBy);
		if (isNotDefined(sentBy)) {
			debug(logNow(), `User '${c.sentBy}' does not exist.`);
			throw new InternalError(
				`User '${c.sentBy}' from challenge does not exist.`,
			);
		}

		if (isNotDefined(c.white) || isNotDefined(c.black)) {
			debug(logNow(), `White or Black player is not set in challenge.`);
			throw new InternalError(
				`White ${isNotDefined(c.white)}. Black: ${isNotDefined(c.black)}.`,
			);
		}

		const [whiteFullName, blackFullName] = (() => {
			if (sentTo.user.username === c.white) {
				return [sentTo.user.getFullName(), sentBy.user.getFullName()];
			}
			return [sentBy.user.getFullName(), sentTo.user.getFullName()];
		})();

		const opponent = ((): UserGivenName => {
			if (sentBy.user.username === user.username) {
				return sentTo.user.getFullName();
			}
			return sentBy.user.getFullName();
		})();

		const niceResult: string = ((): string => {
			if (c.result === 'white_wins') {
				return 'White wins';
			}
			if (c.result === 'black_wins') {
				return 'Black wins';
			}
			return 'Draw';
		})();

		// return only basic information
		allChallenges.push({
			id: c.id,
			title: c.title,
			opponent: opponent,
			sentWhen: c.whenChallengeSent,
			white: whiteFullName,
			black: blackFullName,
			result: niceResult,
			timeControlName: c.timeControlName,
		});
	}

	debug(logNow(), `Found '${allChallenges.length}' challenges`);

	return allChallenges;
}

// Query the server for accepted challenges whose result has been set by my opponent
export async function getQueryChallengeConfirmResultSelf(
	{ user }: UserSession,
	_i: Empty,
) {
	debug(logNow(), 'function getQueryChallengeConfirmResultSelf...');

	// challenges to be returned
	const toReturn = getChallengesBy((c: Challenge): boolean => {
		// this user must be involved in the challenge
		if (c.sentBy !== user.username && c.sentTo !== user.username) {
			return false;
		}
		// must have been accepted
		if (isNotDefined(c.whenChallengeAccepted)) {
			return false;
		}
		// result already set by somebody
		if (isNotDefined(c.resultSetBy)) {
			return false;
		}
		// result should NOT have been set by this user
		if (c.resultSetBy === user.username) {
			return false;
		}
		return true;
	});

	let manager = UsersManager.getInstance();

	let allChallenges: QueryChallengesConfirmResultSelfOutput = [];
	for (const c of toReturn) {
		const sentTo = manager.getAllUserDataByPrivateId(c.sentTo);
		if (isNotDefined(sentTo)) {
			debug(logNow(), `User '${c.sentTo}' does not exist.`);
			throw new InternalError(
				`User '${c.sentTo}' from challenge does not exist.`,
			);
		}

		const sentBy = manager.getAllUserDataByPrivateId(c.sentBy);
		if (isNotDefined(sentBy)) {
			debug(logNow(), `User '${c.sentBy}' does not exist.`);
			throw new InternalError(
				`User '${c.sentBy}' from challenge does not exist.`,
			);
		}

		if (isNotDefined(c.white) || isNotDefined(c.black)) {
			debug(logNow(), `White or Black player is not set in challenge.`);
			throw new InternalError(
				`White ${isNotDefined(c.white)}. Black: ${isNotDefined(c.black)}.`,
			);
		}

		const [whiteFullName, blackFullName] = (() => {
			if (sentTo.user.username === c.white) {
				return [sentTo.user.getFullName(), sentBy.user.getFullName()];
			}
			return [sentBy.user.getFullName(), sentTo.user.getFullName()];
		})();

		const opponent = ((): UserGivenName => {
			if (sentBy.user.username === user.username) {
				return sentTo.user.getFullName();
			}
			return sentBy.user.getFullName();
		})();

		const niceResult: string = ((): string => {
			if (c.result === 'white_wins') {
				return 'White wins';
			}
			if (c.result === 'black_wins') {
				return 'Black wins';
			}
			return 'Draw';
		})();

		// return only basic information
		allChallenges.push({
			id: c.id,
			title: c.title,
			opponent: opponent,
			sentWhen: c.whenChallengeSent,
			white: whiteFullName,
			black: blackFullName,
			result: niceResult,
			timeControlName: c.timeControlName,
		});
	}

	debug(logNow(), `Found '${allChallenges.length}' challenges`);

	return allChallenges;
}
