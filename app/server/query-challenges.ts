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
const debug = Debug('ELO_CHESS_TRACKER:serverQueryChallenges');
import { Request, Response } from 'express';

import { logNow } from '@common/utils/time';
import { isUserLoggedIn } from '@server/managers/session';
import { UserGivenName, User } from '@common/models/user';
import { getChallengesBy } from '@server/managers/challenges';
import { Challenge } from '@common/models/challenge';
import { UsersManager } from '@server/managers/users-manager';
import { canUserDeclineChallenge } from '@server/managers/user-relationships';
import { isDefined, isNotDefined } from '@common/utils/is-defined';
import { ROUTES } from '@common/routes';
import { safeParseRequestCookies } from '@server/utils/schemas';
import { AuthenticationInputSchema } from '@common/schemas/authentication';
import {
	QueryChallengesConfirmResultOtherOutput,
	QueryChallengesConfirmResultSelfOutput,
	QueryChallengesPendingResultOutput,
	QueryChallengesReceivedOutput,
	QueryChallengesSentOutput
} from '@common/schemas/query-challenges';

/// Query the server for challenges received sento to me by other users
export async function getQueryChallengeReceived(req: Request, res: Response) {
	debug(logNow(), `GET ${ROUTES.QUERY_CHALLENGE_RECEIVED}...`);

	const sessionParse = safeParseRequestCookies(req, AuthenticationInputSchema, res, debug);
	if (sessionParse.result === 'Exit') {
		return;
	}
	const session = sessionParse.data;
	const r = isUserLoggedIn(session);

	const sentTo = r[2];
	if (isNotDefined(sentTo)) {
		res.status(401).send(r[1]);
		return;
	}

	// challenges to be returned
	const toReturn = getChallengesBy((c: Challenge): boolean => {
		if (c.sentTo !== session.username) {
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
		const sentBy = manager.getUserByUsername(c.sentBy);
		if (isNotDefined(sentBy)) {
			debug(logNow(), `User '${c.sentBy}' does not exist.`);
			res.status(500).send();
			return;
		}
		const name = sentBy.getFullName();

		// return only basic information
		allChallengesReceived.push({
			id: c.id,
			title: c.title,
			sentBy: name,
			sentWhen: c.whenChallengeSent,
			timeControlName: c.timeControlName,
			canBeDeclined: canUserDeclineChallenge(sentTo, sentBy, c.timeControlId)
		});
	}

	debug(logNow(), `Found '${allChallengesReceived.length}' challenges`);

	res.status(200).send(allChallengesReceived);
}

/// Query the server for challenges sent to other users by me
export async function getQueryChallengeSent(req: Request, res: Response) {
	debug(logNow(), `GET ${ROUTES.QUERY_CHALLENGE_SENT}...`);

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

	// challenges to be returned
	const toReturn = getChallengesBy((c: Challenge): boolean => {
		if (c.sentBy !== session.username) {
			return false;
		}
		if (isDefined(c.whenChallengeAccepted)) {
			return false;
		}
		return true;
	});

	let manager = UsersManager.getInstance();
	const sentBy = manager.getUserByUsername(session.username);
	if (isNotDefined(sentBy)) {
		debug(logNow(), `User '${session.username}' does not exist.`);
		res.status(500).send();
		return;
	}

	let allChallenges: QueryChallengesSentOutput = [];
	for (const c of toReturn) {
		const sentTo = manager.getUserByUsername(c.sentTo);
		if (isNotDefined(sentTo)) {
			debug(logNow(), `User '${c.sentTo}' does not exist.`);
			res.status(500).send();
			return;
		}

		// return only basic information
		allChallenges.push({
			id: c.id,
			title: c.title,
			sentTo: sentTo.getFullName(),
			sentWhen: c.whenChallengeSent,
			timeControlName: c.timeControlName,
			canBeDeclined: canUserDeclineChallenge(sentTo, sentBy, c.timeControlId)
		});
	}

	debug(logNow(), `Found '${allChallenges.length}' challenges`);

	res.status(200).send(allChallenges);
}

/// Query the server for accepted challenges whose result has not been set yet.
export async function getQueryChallengePendingResult(req: Request, res: Response) {
	debug(logNow(), `GET ${ROUTES.QUERY_CHALLENGE_PENDING_RESULT}...`);

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

	// challenges to be returned
	const toReturn = getChallengesBy((c: Challenge): boolean => {
		// this user must be involved in the challenge
		if (c.sentBy !== session.username && c.sentTo !== session.username) {
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
		const userSentTo = manager.getUserByUsername(c.sentTo);
		if (isNotDefined(userSentTo)) {
			debug(logNow(), `User '${c.sentTo}' does not exist.`);
			res.status(500).send();
			return;
		}

		const userSentBy = manager.getUserByUsername(c.sentBy);
		if (isNotDefined(userSentBy)) {
			debug(logNow(), `User '${c.sentBy}' does not exist.`);
			res.status(500).send();
			return;
		}

		const opponent = ((): UserGivenName => {
			if (userSentBy.username === session.username) {
				return userSentTo.getFullName();
			}
			return userSentBy.getFullName();
		})();

		// return only basic information
		allChallenges.push({
			id: c.id,
			title: c.title,
			sentByName: userSentBy.getFullName(),
			sentByUsername: userSentBy.username,
			sentToName: userSentTo.getFullName(),
			sentToUsername: userSentTo.username,
			opponent: opponent,
			sentWhen: c.whenChallengeSent,
			timeControlName: c.timeControlName
		});
	}

	debug(logNow(), `Found '${allChallenges.length}' challenges`);

	res.status(200).send(allChallenges);
}

/// Query the server for accepted challenges whose result has been set by me
export async function getQueryChallengeConfirmResultOther(req: Request, res: Response) {
	debug(logNow(), `GET ${ROUTES.QUERY_CHALLENGE_CONFIRM_RESULT_OTHER}...`);

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

	// challenges to be returned
	const toReturn = getChallengesBy((c: Challenge): boolean => {
		// this user must be involved in the challenge
		if (c.sentBy !== session.username && c.sentTo !== session.username) {
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
		if (c.resultSetBy !== session.username) {
			return false;
		}
		return true;
	});

	let manager = UsersManager.getInstance();

	let allChallenges: QueryChallengesConfirmResultOtherOutput = [];
	for (const c of toReturn) {
		const userSentTo = manager.getUserByUsername(c.sentTo);
		if (isNotDefined(userSentTo)) {
			debug(logNow(), `User '${c.sentTo}' does not exist.`);
			res.status(500).send();
			return;
		}

		const userSentBy = manager.getUserByUsername(c.sentBy);
		if (isNotDefined(userSentBy)) {
			debug(logNow(), `User '${c.sentBy}' does not exist.`);
			res.status(500).send();
			return;
		}

		if (isNotDefined(c.white) || isNotDefined(c.black)) {
			debug(logNow(), `White or Black player is not set in challenge.`);
			res.status(500).send();
			return;
		}

		const opponent = ((): UserGivenName => {
			if (userSentBy.username === session.username) {
				return userSentTo.getFullName();
			}
			return userSentBy.getFullName();
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
			white: (manager.getUserByUsername(c.white) as User).getFullName(),
			black: (manager.getUserByUsername(c.black) as User).getFullName(),
			result: niceResult,
			timeControlName: c.timeControlName
		});
	}

	debug(logNow(), `Found '${allChallenges.length}' challenges`);

	res.status(200).send(allChallenges);
}

/// Query the server for accepted challenges whose result has been set by my opponent
export async function getQueryChallengeConfirmResultSelf(req: Request, res: Response) {
	debug(logNow(), `GET ${ROUTES.QUERY_CHALLENGE_CONFIRM_RESULT_SELF}...`);

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

	// challenges to be returned
	const toReturn = getChallengesBy((c: Challenge): boolean => {
		// this user must be involved in the challenge
		if (c.sentBy !== session.username && c.sentTo !== session.username) {
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
		if (c.resultSetBy === session.username) {
			return false;
		}
		return true;
	});

	let manager = UsersManager.getInstance();

	let allChallenges: QueryChallengesConfirmResultSelfOutput = [];
	for (const c of toReturn) {
		const userSentTo = manager.getUserByUsername(c.sentTo);
		if (isNotDefined(userSentTo)) {
			debug(logNow(), `User '${c.sentTo}' does not exist.`);
			res.status(500).send();
			return;
		}

		const userSentBy = manager.getUserByUsername(c.sentBy);
		if (isNotDefined(userSentBy)) {
			debug(logNow(), `User '${c.sentBy}' does not exist.`);
			res.status(500).send();
			return;
		}

		if (isNotDefined(c.white) || isNotDefined(c.black)) {
			debug(logNow(), `White or Black player is not set in challenge.`);
			res.status(500).send();
			return;
		}

		const opponent = ((): UserGivenName => {
			if (userSentBy.username === session.username) {
				return userSentTo.getFullName();
			}
			return userSentBy.getFullName();
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
			white: (manager.getUserByUsername(c.white) as User).getFullName(),
			black: (manager.getUserByUsername(c.black) as User).getFullName(),
			result: niceResult,
			timeControlName: c.timeControlName
		});
	}

	debug(logNow(), `Found '${allChallenges.length}' challenges`);

	res.status(200).send(allChallenges);
}
