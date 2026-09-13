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

import { TimeControlId, TimeControlName } from '@common/models/time-control';
import { isNotDefined } from '@common/utils/is-defined';
import { DateFull, logNow } from '@common/utils/time';
import { ChallengesManager } from '@server/managers/challenges-manager';
import { EnvironmentManager } from '@server/managers/environment-manager';
import { gameAddNew } from '@server/managers/games';
import {
	canUserDeclineChallenge,
	canUserForceAcceptChallenge,
	canUserForceAcceptResultChallenge,
	canUserForceSetResultChallenge,
	canUserSendChallenge,
} from '@server/managers/user-relationships';
import { UsersManager } from '@server/managers/users-manager';
import {
	accept,
	agreeResult,
	Challenge,
	ChallengeAccept,
	ChallengeAgreeResult,
	ChallengeDecline,
	ChallengeDisagreeResult,
	ChallengeSetResult,
	disagreeResult,
	isPartOfChallenge,
	newChallenge,
	setResult,
} from '@server/models/challenge';
import { PublicError } from '@server/models/error-types/public-error';
import { User } from '@server/models/user';
import Debug from 'debug';
import fs from 'fs';
import path from 'path';
import { InternalError } from '../models/error-types/internal-error';

const debug = Debug('ELO_CHESS_TRACKER:managers/challenges');

export function writeChallengeToFile(filename: string, c: Challenge) {
	fs.writeFileSync(filename, JSON.stringify(c, null, 4));
}

/**
 * @brief Filters the set of challenges that are accepted by the filter function @e by.
 * @param by Function to filter. Returns true if a challenge is to be returned.
 * @returns an array of challenges according to function @e by.
 */
export function getChallengesBy(
	by: Function = (_c: Challenge): boolean => true,
): Challenge[] {
	let res: Challenge[] = [];
	const mem = ChallengesManager.getInstance();
	for (let i = 0; i < mem.numChallenges(); ++i) {
		const c = mem.getChallengeAt(i) as Challenge;
		if (by(c)) {
			res.push(c);
		}
	}
	return res;
}

/**
 * @brief Send a challenge from a user to another
 * @param sender Username of sender
 * @param receiver Username of receiver
 * @param when Timestamp
 * @returns The id of the challenge
 */
export function challengeSendNew(
	title: string,
	sender: User,
	receiver: User,
	timeControlId: TimeControlId,
	timeControlName: TimeControlName,
	when: DateFull,
): Challenge {
	debug(logNow(), 'Adding a new challenge...');

	if (!sender.canDo('CHALLENGE_USER')) {
		debug(logNow(), `User '${sender.username}' cannot challenge other users.`);
		throw new PublicError('You cannot challenge other users');
	}
	if (!canUserSendChallenge(sender, receiver)) {
		debug(
			logNow(),
			`Sender '${sender.username}' cannot challenge user '${receiver.username}'.`,
		);
		throw new PublicError('You cannot challenge this user.');
	}
	if (receiver === sender) {
		debug(logNow(), `A challenge cannot be sent to oneself.`);
		throw new PublicError('You cannot challenge yourself.');
	}

	const mem = ChallengesManager.getInstance();
	const newId = mem.newChallengeId();

	const c = newChallenge(
		newId,
		title,
		sender.username,
		receiver.username,
		timeControlId,
		timeControlName,
		when,
	);

	mem.addChallenge(c);

	const challengeDir = EnvironmentManager.getInstance().getDirChallenges();
	const challengeFile = path.join(challengeDir, newId);
	debug(logNow(), `    writing challenge into file '${challengeFile}'`);
	writeChallengeToFile(challengeFile, c);

	return c;
}

/**
 * @brief Somebody accepts a challenge
 * @param c Challenge object
 * @pre The accepter must be either a priviledged user or the receiver
 * of the challenge.
 */
export function challengeAccept(c: Challenge, { by, when }: ChallengeAccept) {
	debug(logNow(), `Accepting challenge '${c.id}'`);

	if (isNotDefined(c.white) || isNotDefined(c.black)) {
		debug(logNow(), `Player 'white' or 'black' is not defined.`);
		debug(logNow(), `    White: '${c.white}'.`);
		debug(logNow(), `    Black: '${c.black}'.`);
		throw new InternalError(
			`Challenge ${c.id} is malformed. Either white or black undefined.`,
		);
	}

	if (c.state !== 'PENDING_ACCEPT') {
		throw new PublicError(
			`The challenge cannot be accepted since its state is ${c.state}.`,
		);
	}

	// check permissions
	let cont: boolean = false;
	if (by.is('REFEREE')) {
		const mem = UsersManager.getInstance();
		const white = mem.getAllUserDataByPrivateId(c.white);
		const black = mem.getAllUserDataByPrivateId(c.black);
		if (isNotDefined(white) || isNotDefined(black)) {
			throw new InternalError(
				`Could not find white or black user from challenge ${c.id}.`,
			);
		}

		if (canUserForceAcceptChallenge(white.user, black.user, by)) {
			cont = true;
		}
	}
	if (!cont && isPartOfChallenge(c, by)) {
		if (by.username === c.sentTo) {
			cont = true;
		}
	}
	if (!cont) {
		debug(logNow(), `Player '${by}' cannot accept this challenge.`);
		throw new PublicError(`You cannot accept this challenge.`);
	}

	accept(c, { by, when });

	const challengeDir = EnvironmentManager.getInstance().getDirChallenges();
	const challengeFile = path.join(challengeDir, c.id);
	debug(logNow(), `    Writing challenge into file '${challengeFile}'`);
	writeChallengeToFile(challengeFile, c);
}

/**
 * @brief Declines the challenge passed as parameter
 * @param c Challenge object
 * @pre The 'decliner' must be either a priviledged user or the receiver
 * of the challenge.
 */
export function challengeDecline(c: Challenge, { by }: ChallengeDecline) {
	debug(logNow(), `Declining challenge '${c.id}'`);

	if (c.state !== 'PENDING_ACCEPT') {
		throw new PublicError(
			`This challenge cannot be declined because its state is ${c.state}`,
		);
	}
	if (!isPartOfChallenge(c, by)) {
		debug(logNow(), `Player '${by}' is not part of this challenge.`);
		throw new PublicError(`You cannot decline this challenge.`);
	}
	if (by.username !== c.sentTo) {
		throw new PublicError('You cannot decline this challenge');
	}

	const mem = UsersManager.getInstance();
	const sentTo = mem.getAllUserDataByPrivateId(c.sentTo);
	const sentBy = mem.getAllUserDataByPrivateId(c.sentBy);
	if (isNotDefined(sentTo) || isNotDefined(sentBy)) {
		throw new PublicError(
			'In challenge, either the white or black player do not exist.',
		);
	}

	if (!canUserDeclineChallenge(sentTo.user, sentBy.user, c.timeControlId)) {
		debug(
			logNow(),
			`User ${sentTo.user.username} is trying to decline challenge sent by ${sentBy.user.username}`,
		);
		throw new PublicError(`You cannot decline this challenge`);
	}

	ChallengesManager.getInstance().removeChallenge(c);

	const challengeDir = EnvironmentManager.getInstance().getDirChallenges();
	const challengeFile = path.join(challengeDir, c.id);
	debug(logNow(), `    Deleting file '${challengeFile}'`);
	fs.unlinkSync(challengeFile);
}

/**
 * @brief Set the result of the challenge
 * @param c Challenge object
 * @param g The game encoding the result of the game. The players in the game contain
 * their rating as specified in the system at the conclusion of the game.
 */
export function challengeSetResult(
	c: Challenge,
	{ by, when, white, black, result }: ChallengeSetResult,
) {
	debug(logNow(), `Set the result of the challenge '${c.id}'`);

	if (isNotDefined(c.white) || isNotDefined(c.black)) {
		debug(logNow(), `Player 'white' or 'black' is not defined.`);
		debug(logNow(), `    White: '${c.white}'.`);
		debug(logNow(), `    Black: '${c.black}'.`);
		throw new InternalError(
			`Challenge ${c.id} is malformed. Either white or black undefined.`,
		);
	}

	if (c.state !== 'PENDING_RESULT') {
		throw new PublicError(
			`The result to the challenge cannot be set since its state is ${c.state}.`,
		);
	}

	// check permissions
	let cont: boolean = false;
	if (by.is('REFEREE')) {
		const mem = UsersManager.getInstance();
		const white = mem.getAllUserDataByPrivateId(c.white);
		const black = mem.getAllUserDataByPrivateId(c.black);
		if (isNotDefined(white) || isNotDefined(black)) {
			throw new InternalError(
				`Could not find white or black user from challenge ${c.id}.`,
			);
		}

		if (canUserForceSetResultChallenge(white.user, black.user, by)) {
			cont = true;
		}
	}
	if (!cont && isPartOfChallenge(c, by)) {
		if (by.username === c.sentTo) {
			cont = true;
		}
	}
	if (!cont) {
		debug(logNow(), `Player '${by}' cannot accept this challenge.`);
		throw new PublicError(`You cannot set the result of this result.`);
	}

	// sanitize input values
	if (white === black) {
		debug(
			logNow(),
			`White '${white}' and Black '${black}' cannot be the same player.`,
		);
		throw new PublicError('White and Black cannot be the same players.');
	}
	if (white !== c.sentBy && white !== c.sentTo) {
		debug(logNow(), `White '${white}' is not part of challenge '${c.id}'.`);
		throw new PublicError(`Wrong player data.`);
	}
	if (black !== c.sentBy && black !== c.sentTo) {
		debug(logNow(), `Black '${black}' is not part of challenge '${c.id}'.`);
		throw new PublicError(`Wrong player data.`);
	}

	// set the result
	setResult(c, { by, when, white, black, result });

	const challengeDir = EnvironmentManager.getInstance().getDirChallenges();
	const challengeFile = path.join(challengeDir, c.id);
	debug(logNow(), `    Writing challenge into file '${challengeFile}'`);
	writeChallengeToFile(challengeFile, c);
}

/**
 * @brief Somebody accepts the result of the game
 * @param id Identifier string
 * @pre The accepter must be the receiver of the challenge.
 */
export function challengeAgreeResult(
	c: Challenge,
	{ by, when }: ChallengeAgreeResult,
) {
	debug(logNow(), `Agree to result of challenge '${c.id}'...`);

	if (isNotDefined(c.white) || isNotDefined(c.black)) {
		debug(logNow(), `Player 'white' or 'black' is not defined.`);
		debug(logNow(), `    White: '${c.white}'.`);
		debug(logNow(), `    Black: '${c.black}'.`);
		throw new InternalError(
			`Challenge ${c.id} is malformed. Either white or black undefined.`,
		);
	}

	if (c.state !== 'PENDING_RESULT_AGREE') {
		throw new PublicError(
			`The result to the challenge cannot be agreed to since its state is ${c.state}.`,
		);
	}

	if (!isPartOfChallenge(c, by)) {
		debug(logNow(), `Player '${by.username}' is not part of this challenge.`);
		throw new PublicError(`You cannot agree to this result.`);
	}

	// check permissions
	let cont: boolean = false;
	if (by.is('REFEREE')) {
		const mem = UsersManager.getInstance();
		const white = mem.getAllUserDataByPrivateId(c.white);
		const black = mem.getAllUserDataByPrivateId(c.black);
		if (isNotDefined(white) || isNotDefined(black)) {
			throw new InternalError(
				`Could not find white or black user from challenge ${c.id}.`,
			);
		}

		if (canUserForceAcceptResultChallenge(white.user, black.user, by)) {
			cont = true;
		}
	}
	if (!cont && isPartOfChallenge(c, by)) {
		if (by.username === c.sentTo) {
			cont = true;
		}
	}
	if (!cont) {
		debug(logNow(), `Player '${by}' cannot accept this challenge.`);
		throw new PublicError(`You cannot set the result of this result.`);
	}

	// sanitize input values
	if (isNotDefined(c.whenResultSet)) {
		debug(logNow(), `Date 'whenResultSet' is not defined`);
		throw new PublicError(`Invalid date when the challenge was set.`);
	}
	if (isNotDefined(c.result)) {
		debug(logNow(), `Result is not set.`);
		throw new PublicError(`Result is not set.`);
	}
	if (by.username === c.resultSetBy) {
		throw new PublicError(
			'The accepter of the result cannot be the same person who set the result',
		);
	}

	agreeResult(c, { by, when });

	{
		const challengeDir = EnvironmentManager.getInstance().getDirChallenges();
		const challengeFile = path.join(challengeDir, c.id);
		debug(logNow(), `    Removing challenge file '${challengeFile}'`);
		fs.unlinkSync(challengeFile);
	}

	debug(logNow(), `Adding game...`);

	const mem = UsersManager.getInstance();
	const white = mem.getAllUserDataByPrivateId(c.white);
	const black = mem.getAllUserDataByPrivateId(c.black);
	if (isNotDefined(white) || isNotDefined(black)) {
		throw new PublicError(
			'In challenge, either the white or black player do not exist.',
		);
	}

	const now = logNow();
	gameAddNew(
		c.title,
		white.user,
		black.user,
		by.username,
		now,
		c.result,
		c.timeControlId,
		c.timeControlName,
		c.whenResultSet,
	);

	{
		debug(logNow(), `    Deleting the challenge from the memory...`);
		ChallengesManager.getInstance().removeChallenge(c);
	}
}

/**
 * @brief Unsets the result of the challenge
 * @param c Challenge object
 * @param g The game encoding the result of the game. The players in the game
 * contain their rating as specified in the system at the conclusion of the game.
 */
export function challengeDisagreeResult(
	c: Challenge,
	{ by }: ChallengeDisagreeResult,
) {
	debug(logNow(), `Disagree to the result of the challenge '${c.id}'`);

	if (c.state !== 'PENDING_RESULT_AGREE') {
		throw new PublicError(
			`Challenge's result cannot be disagreed to since its state is ${c.state}`,
		);
	}
	if (!isPartOfChallenge(c, by)) {
		debug(logNow(), `Player '${by}' is not part of this challenge.`);
		throw new PublicError(`You cannot disagree to this result.`);
	}
	if (c.resultSetBy !== by.username) {
		debug(logNow(), `Only player '${by}' can disagree to this result.`);
		throw new PublicError(`You cannot disagree to this result.`);
	}

	disagreeResult(c);

	const challengeDir = EnvironmentManager.getInstance().getDirChallenges();
	const challengeFile = path.join(challengeDir, c.id);
	debug(logNow(), `    Writing challenge into file '${challengeFile}'`);
	writeChallengeToFile(challengeFile, c);
}
