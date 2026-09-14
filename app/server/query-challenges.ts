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

import { GameResult } from '@app/common/models/game-result';
import {
	QueryChallengesConfirmResultOtherOutput,
	QueryChallengesConfirmResultSelfOutput,
	QueryChallengesPendingAcceptRefereeOutput,
	QueryChallengesPendingResultAgreeRefereeOutput,
	QueryChallengesPendingResultOutput,
	QueryChallengesPendingResultSetRefereeOutput,
	QueryChallengesReceivedOutput,
	QueryChallengesSentOutput,
} from '@common/api/schemas/query-challenges';
import { UserGivenName } from '@common/models/user-given-name';
import { isDefined, isNotDefined } from '@common/utils/is-defined';
import { logNow } from '@common/utils/time';
import {
	getBlack,
	getChallengesBy,
	getResultSetBy,
	getSentBy,
	getSentTo,
	getWhite,
} from '@server/managers/challenges';
import {
	canUserDeclineChallenge,
	canUserForceAcceptChallenge,
	canUserForceAgreeResultChallenge,
	canUserForceSetResultChallenge,
} from '@server/managers/user-relationships';
import { Challenge, isPartOfChallenge } from '@server/models/challenge';
import { InternalError } from '@server/models/error-types/internal-error';
import { UserSession } from '@server/models/user';
import Debug from 'debug';
import { ChallengesManager } from './managers/challenges-manager';
import { PublicError } from './models/error-types/public-error';

const debug = Debug('ELO_CHESS_TRACKER:serverQueryChallenges');

function niceResult(r: GameResult): string {
	if (r === 'white_wins') {
		return 'White wins';
	}
	if (r === 'black_wins') {
		return 'Black wins';
	}
	return 'Draw';
}

//

export async function getQueryChallengeReceived({ user }: UserSession) {
	debug(logNow(), 'function getQueryChallengeReceived...');

	// challenges to be returned
	const toFormat = getChallengesBy((c: Challenge): boolean => {
		if (c.state !== 'PENDING_ACCEPT') {
			return false;
		}
		if (c.sentTo !== user.username) {
			return false;
		}
		return true;
	});

	const toReturn: QueryChallengesReceivedOutput = [];
	for (const c of toFormat) {
		const sentBy = getSentBy(c);

		// return only basic information
		toReturn.push({
			id: c.id,
			title: c.title,
			sentBy: sentBy.user.getFullName(),
			sentWhen: c.whenChallengeSent,
			timeControlName: c.timeControlName,
			canBeDeclined: canUserDeclineChallenge(
				user,
				sentBy.user,
				c.timeControlId,
			),
		});
	}

	debug(logNow(), `Found '${toReturn.length}' challenges`);

	return toReturn;
}

export async function getQueryChallengeSent({ user }: UserSession) {
	debug(logNow(), 'function getQueryChallengeSent...');

	// challenges to be returned
	const toFormat = getChallengesBy((c: Challenge): boolean => {
		if (c.state !== 'PENDING_ACCEPT') {
			return false;
		}
		if (c.sentBy !== user.username) {
			return false;
		}
		return true;
	});

	const toReturn: QueryChallengesSentOutput = [];
	for (const c of toFormat) {
		const sentTo = getSentTo(c);

		// return only basic information
		toReturn.push({
			id: c.id,
			title: c.title,
			sentTo: sentTo.user.getFullName(),
			sentWhen: c.whenChallengeSent,
			timeControlName: c.timeControlName,
			canBeDeclined: canUserDeclineChallenge(
				sentTo.user,
				user,
				c.timeControlId,
			),
		});
	}

	debug(logNow(), `Found '${toReturn.length}' challenges`);

	return toReturn;
}

export async function getQueryChallengePendingResultSet({ user }: UserSession) {
	debug(logNow(), 'function getQueryChallengePendingResult...');

	// challenges to be returned
	const toFormat = getChallengesBy((c: Challenge): boolean => {
		if (c.state !== 'PENDING_RESULT') {
			return false;
		}
		if (!isPartOfChallenge(c, user)) {
			return false;
		}
		return true;
	});

	const toReturn: QueryChallengesPendingResultOutput = [];
	for (const c of toFormat) {
		const sentTo = getSentTo(c);
		const sentBy = getSentBy(c);

		const opponent = ((): UserGivenName => {
			if (sentBy.user.username === user.username) {
				return sentTo.user.getFullName();
			}
			return sentBy.user.getFullName();
		})();

		// return only basic information
		toReturn.push({
			id: c.id,
			title: c.title,
			sentBy: {
				name: sentBy.user.getFullName(),
				publicId: sentBy.publicId,
			},
			sentTo: {
				name: sentTo.user.getFullName(),
				publicId: sentTo.publicId,
			},
			opponent: opponent,
			sentWhen: c.whenChallengeSent,
			timeControlName: c.timeControlName,
		});
	}

	debug(logNow(), `Found '${toReturn.length}' challenges`);

	return toReturn;
}

export async function getQueryChallengePendingResultAgreeOther({
	user,
}: UserSession) {
	debug(logNow(), 'function getQueryChallengeConfirmResultOther...');

	// challenges to be returned
	const toFormat = getChallengesBy((c: Challenge): boolean => {
		if (c.state !== 'PENDING_RESULT_AGREE') {
			return false;
		}
		if (!isPartOfChallenge(c, user)) {
			return false;
		}
		if (c.resultSetBy !== user.username) {
			return false;
		}
		return true;
	});

	const toReturn: QueryChallengesConfirmResultOtherOutput = [];
	for (const c of toFormat) {
		const sentTo = getSentTo(c);
		const sentBy = getSentBy(c);

		if (isNotDefined(c.white) || isNotDefined(c.black)) {
			throw new InternalError(
				`Challenge ${c.id} is malformed. White undefined? ${isDefined(c.white)}. Black undefined? ${isDefined(c.black)}.`,
			);
		}
		if (isNotDefined(c.result)) {
			throw new InternalError(
				`Challenge ${c.id} is malformed. Result is undefined.`,
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

		// return only basic information
		toReturn.push({
			id: c.id,
			title: c.title,
			opponent: opponent,
			sentWhen: c.whenChallengeSent,
			white: whiteFullName,
			black: blackFullName,
			result: niceResult(c.result),
			timeControlName: c.timeControlName,
		});
	}

	debug(logNow(), `Found '${toReturn.length}' challenges`);

	return toReturn;
}

export async function getQueryChallengePendingResultAgreeSelf({
	user,
}: UserSession) {
	debug(logNow(), 'function getQueryChallengeConfirmResultSelf...');

	// challenges to be returned
	const toFormat = getChallengesBy((c: Challenge): boolean => {
		if (c.state !== 'PENDING_RESULT_AGREE') {
			return false;
		}
		if (!isPartOfChallenge(c, user)) {
			return false;
		}
		if (c.resultSetBy === user.username) {
			return false;
		}
		return true;
	});

	const toReturn: QueryChallengesConfirmResultSelfOutput = [];
	for (const c of toFormat) {
		const sentTo = getSentTo(c);
		const sentBy = getSentBy(c);
		const white = getWhite(c);
		const black = getBlack(c);
		const resultSetBy = getResultSetBy(c);

		if (isNotDefined(c.result)) {
			throw new InternalError(
				`Challenge ${c.id} is malformed. Result is undefined.`,
			);
		}

		const opponent = ((): UserGivenName => {
			if (sentBy.user.username === user.username) {
				return sentTo.user.getFullName();
			}
			return sentBy.user.getFullName();
		})();

		// return only basic information
		toReturn.push({
			id: c.id,
			title: c.title,
			opponent: opponent,
			sentWhen: c.whenChallengeSent,
			white: white.user.getFullName(),
			black: black.user.getFullName(),
			result: niceResult(c.result),
			timeControlName: c.timeControlName,
			canDisagree: !resultSetBy.user.is('REFEREE'),
		});
	}

	debug(logNow(), `Found '${toReturn.length}' challenges`);

	return toReturn;
}

//

export async function getQueryChallengesPendingAcceptReferee({
	user,
}: UserSession) {
	debug(logNow(), 'function getQueryChallengesPendingAcceptReferee...');

	if (!user.is('REFEREE')) {
		throw new PublicError(`You cannot see the challenges pending of accept.`);
	}

	const toReturn: QueryChallengesPendingAcceptRefereeOutput = [];
	const challenges = ChallengesManager.getInstance().getChallenges();
	for (const c of challenges) {
		if (c.state !== 'PENDING_ACCEPT') {
			continue;
		}

		const sentTo = getSentTo(c);
		const sentBy = getSentBy(c);

		if (
			!isPartOfChallenge(c, user) &&
			canUserForceAcceptChallenge(sentTo.user, sentBy.user, user)
		) {
			toReturn.push({
				id: c.id,
				title: c.title,
				sentTo: sentTo.user.getFullName(),
				sentBy: sentBy.user.getFullName(),
				sentWhen: c.whenChallengeSent,
				timeControlName: c.timeControlName,
			});
		}
	}
	return toReturn;
}

export async function getQueryChallengesPendingResultSetReferee({
	user,
}: UserSession) {
	debug(logNow(), 'function getQueryChallengesPendingAcceptReferee...');

	if (!user.is('REFEREE')) {
		throw new PublicError(`You cannot see the challenges pending of accept.`);
	}

	const toReturn: QueryChallengesPendingResultSetRefereeOutput = [];
	const challenges = ChallengesManager.getInstance().getChallenges();
	for (const c of challenges) {
		if (c.state !== 'PENDING_RESULT') {
			continue;
		}

		const sentTo = getSentTo(c);
		const sentBy = getSentBy(c);

		if (
			!isPartOfChallenge(c, user) &&
			canUserForceSetResultChallenge(sentTo.user, sentBy.user, user)
		) {
			toReturn.push({
				id: c.id,
				title: c.title,
				sentTo: {
					name: sentTo.user.getFullName(),
					publicId: sentTo.publicId,
				},
				sentBy: {
					name: sentBy.user.getFullName(),
					publicId: sentBy.publicId,
				},
				sentWhen: c.whenChallengeSent,
				timeControlName: c.timeControlName,
			});
		}
	}
	return toReturn;
}

export async function getQueryChallengesPendingResultAgreeReferee({
	user,
}: UserSession) {
	debug(logNow(), 'function getQueryChallengesPendingResultAgreeReferee...');

	if (!user.is('REFEREE')) {
		throw new PublicError(`You cannot see the challenges pending of accept.`);
	}

	const toReturn: QueryChallengesPendingResultAgreeRefereeOutput = [];
	const challenges = ChallengesManager.getInstance().getChallenges();
	for (const c of challenges) {
		if (c.state !== 'PENDING_RESULT_AGREE') {
			continue;
		}

		if (isNotDefined(c.result)) {
			throw new InternalError(
				`Malformed challenge ${c.id}. Result is not defined.`,
			);
		}

		const sentTo = getSentTo(c);
		const sentBy = getSentBy(c);
		const resultSetBy = getResultSetBy(c);
		const white = getWhite(c);
		const black = getBlack(c);

		if (
			!isPartOfChallenge(c, user) &&
			canUserForceAgreeResultChallenge(sentTo.user, sentBy.user, user)
		) {
			toReturn.push({
				id: c.id,
				title: c.title,
				sentTo: sentTo.user.getFullName(),
				sentBy: sentBy.user.getFullName(),
				sentWhen: c.whenChallengeSent,
				white: white.user.getFullName(),
				black: black.user.getFullName(),
				result: niceResult(c.result),
				resultSetByReferee: resultSetBy.user.is('REFEREE'),
				timeControlName: c.timeControlName,
			});
		}
	}
	return toReturn;
}
