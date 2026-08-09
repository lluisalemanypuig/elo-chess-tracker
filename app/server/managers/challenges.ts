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

import fs from 'fs';
import path from 'path';
import Debug from 'debug';
const debug = Debug('ELO_CHESS_TRACKER:managers/challenges');

import { DateFull, logNow, dateSplitMajorMinor, toDateMinor } from '@common/utils/time';
import { ChallengesManager } from '@server/managers/challenges-manager';
import { EnvironmentManager } from '@server/managers/environment-manager';
import {
	Challenge,
	newChallenge,
	setResult,
	disagreeResult as disagreeResult,
	ChallengeAccept,
	accept,
	ChallengeDecline,
	ChallengeSetResult,
	ChallengeAgreeResult,
	agreeResult,
	ChallengeDisagreeResult,
	isPartOfChallenge
} from '@common/models/challenge';
import { gameAddNew } from '@server/managers/games';
import { TimeControlId, TimeControlName } from '@common/models/time-control';
import { UsersManager } from '@server/managers/users-manager';
import { User } from '@common/models/user';
import { isNotDefined } from '@common/utils/is-defined';
import { PlayerPrivateId } from '@common/models/player';

/**
 * @brief Filters the set of challenges that are accepted by the filter function @e by.
 * @param by Function to filter. Returns true if a challenge is to be returned.
 * @returns an array of challenges according to function @e by.
 */
export function getChallengesBy(by: Function = (_c: Challenge): boolean => true): Challenge[] {
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
	sender: PlayerPrivateId,
	receiver: PlayerPrivateId,
	timeControlId: TimeControlId,
	timeControlName: TimeControlName,
	when: DateFull
): Challenge {
	debug(logNow(), 'Adding a new challenge...');

	if (receiver === sender) {
		debug(logNow(), `A challenge cannot be sent to oneself.`);
		throw new Error('You cannot challenge yourself.');
	}

	let mem = ChallengesManager.getInstance();
	const newId = mem.newChallengeId();

	const c = newChallenge(newId, title, sender, receiver, timeControlId, timeControlName, when);

	mem.addChallenge(c);

	const challengeDir = EnvironmentManager.getInstance().getDirChallenges();
	const challengeFile = path.join(challengeDir, newId);
	debug(logNow(), `    writing challenge into file '${challengeFile}'`);
	fs.writeFileSync(challengeFile, JSON.stringify(c, null, 4));

	return c;
}

/**
 * @brief Somebody accepts a challenge
 * @param c Challenge object
 * @pre The accepter must be either a priviledged user or the receiver
 * of the challenge.
 */
export function challengeAccept(c: Challenge, { by, when }: ChallengeAccept): void {
	debug(logNow(), `Accepting challenge '${c.id}'`);

	if (c.state !== 'PENDING_ACCEPT') {
		throw new Error(`The challenge cannot be accepted since its state is ${c.state}.`);
	}
	if (!isPartOfChallenge(c, by)) {
		debug(logNow(), `Player '${by}' is not part of this challenge.`);
		throw new Error(`You cannot disagree to this result.`);
	}
	if (by != c.sentTo) {
		throw new Error('You cannot accept this challenge');
	}

	accept(c, { by, when });

	const challengeDir = EnvironmentManager.getInstance().getDirChallenges();
	const challengeFile = path.join(challengeDir, c.id);
	debug(logNow(), `    Writing challenge into file '${challengeFile}'`);
	fs.writeFileSync(challengeFile, JSON.stringify(c, null, 4));
}

/**
 * @brief Declines the challenge passed as parameter
 * @param c Challenge object
 * @pre The 'decliner' must be either a priviledged user or the receiver
 * of the challenge.
 */
export function challengeDecline(c: Challenge, { by }: ChallengeDecline): void {
	debug(logNow(), `Declining challenge '${c.id}'`);

	if (c.state !== 'PENDING_ACCEPT') {
		throw new Error(`This challenge cannot be declined because its state is ${c.state}`);
	}
	if (!isPartOfChallenge(c, by)) {
		debug(logNow(), `Player '${by}' is not part of this challenge.`);
		throw new Error(`You cannot disagree to this result.`);
	}
	if (by != c.sentTo) {
		throw new Error('You cannot decline this challenge');
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
export function challengeSetResult(c: Challenge, { by, when, white, black, result }: ChallengeSetResult): void {
	debug(logNow(), `Set the result of the challenge '${c.id}'`);

	if (c.state !== 'PENDING_RESULT') {
		throw new Error(`The result to the challenge cannot be set since its state is ${c.state}.`);
	}
	if (!isPartOfChallenge(c, by)) {
		debug(logNow(), `Player '${by}' is not part of this challenge.`);
		throw new Error(`You cannot disagree to this result.`);
	}
	const originalSetter = c.resultSetBy;
	if (originalSetter != undefined && originalSetter != by) {
		debug(
			logNow(),
			`User '${by}' is trying to override the result of challenge '${c.id}' which was set by '${originalSetter} on '${c.whenResultSet}'`
		);
		throw new Error('The result of this challenge has to be set by the original setter, which you are not.');
	}

	if (white === black) {
		debug(logNow(), `White '${white}' and Black '${black}' cannot be the same player.`);
		throw new Error('White and Black cannot be the same players.');
	}
	if (white != c.sentBy && white != c.sentTo) {
		debug(logNow(), `White '${white}' is not part of challenge '${c.id}'.`);
		throw new Error(`Wrong player data.`);
	}
	if (black != c.sentBy && black != c.sentTo) {
		debug(logNow(), `Black '${black}' is not part of challenge '${c.id}'.`);
		throw new Error(`Wrong player data.`);
	}

	setResult(c, { by, when, white, black, result });

	const challengeDir = EnvironmentManager.getInstance().getDirChallenges();
	const challengeFile = path.join(challengeDir, c.id);
	debug(logNow(), `    Writing challenge into file '${challengeFile}'`);
	fs.writeFileSync(challengeFile, JSON.stringify(c, null, 4));
}

/**
 * @brief Somebody accepts the result of the game
 * @param id Identifier string
 * @pre The accepter must be the receiver of the challenge.
 */
export function challengeAgreeResult(c: Challenge, { by, when }: ChallengeAgreeResult): void {
	debug(logNow(), `Agree to result of challenge '${c.id}'...`);

	if (c.state !== 'PENDING_RESULT_AGREE') {
		throw new Error(`The result to the challenge cannot be agreed to since its state is ${c.state}.`);
	}
	if (!isPartOfChallenge(c, by)) {
		debug(logNow(), `Player '${by}' is not part of this challenge.`);
		throw new Error(`You cannot disagree to this result.`);
	}
	if (isNotDefined(c.whenResultSet)) {
		debug(logNow(), `Date 'whenResultSet' is not defined`);
		return;
	}
	if (isNotDefined(c.white) || isNotDefined(c.black)) {
		debug(logNow(), `Player 'white' or 'black' is not defined.`);
		debug(logNow(), `    White: '${c.white}'.`);
		debug(logNow(), `    Black: '${c.black}'.`);
		return;
	}
	if (isNotDefined(c.result)) {
		debug(logNow(), `Result is not set.`);
		return;
	}
	if (isNotDefined(c.result)) {
		debug(logNow(), `Result is not set.`);
		return;
	}
	if (by === c.resultSetBy) {
		throw new Error('The accepter of the result cannot be the same person who set the result');
	}

	agreeResult(c, { by, when });

	{
		const challengeDir = EnvironmentManager.getInstance().getDirChallenges();
		const challengeFile = path.join(challengeDir, c.id);
		debug(logNow(), `    Removing challenge file '${challengeFile}'`);
		fs.unlinkSync(challengeFile);
	}

	debug(logNow(), `Adding game...`);
	const split = dateSplitMajorMinor(c.whenResultSet);

	const mem = UsersManager.getInstance();
	const white = mem.getUserByUsername(c.white) as User;
	const black = mem.getUserByUsername(c.black) as User;

	const randMilli = `${Math.floor(Math.random() * 999)}`;
	const date = toDateMinor(
		split[1] + ':' + (randMilli.length == 1 ? '00' : randMilli.length == 2 ? '0' : '') + randMilli
	);
	gameAddNew(c.title, white, black, c.result, c.timeControlId, c.timeControlName, split[0], date);

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
export function challengeDisagreeResult(c: Challenge, { by }: ChallengeDisagreeResult): void {
	debug(logNow(), `Disagree to the result of the challenge '${c.id}'`);

	if (c.state !== 'PENDING_RESULT_AGREE') {
		throw new Error(`Challenge's result cannot be disagreed to since its state is ${c.state}`);
	}
	if (!isPartOfChallenge(c, by)) {
		debug(logNow(), `Player '${by}' is not part of this challenge.`);
		throw new Error(`You cannot disagree to this result.`);
	}
	if (c.resultSetBy === by) {
		debug(logNow(), `Player '${by}' set the result of the challenge and cannot disagree to it.`);
		throw new Error(`You cannot disagree to this result.`);
	}

	disagreeResult(c);

	const challengeDir = EnvironmentManager.getInstance().getDirChallenges();
	const challengeFile = path.join(challengeDir, c.id);
	debug(logNow(), `    Writing challenge into file '${challengeFile}'`);
	fs.writeFileSync(challengeFile, JSON.stringify(c, null, 4));
}
