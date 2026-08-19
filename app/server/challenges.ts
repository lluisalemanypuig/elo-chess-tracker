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
const debug = Debug('ELO_CHESS_TRACKER:serverChallenges');

import { logNow } from '@common/utils/time';
import {
	challengeAccept,
	challengeDecline,
	challengeSendNew,
	challengeSetResult,
	challengeDisagreeResult,
	challengeAgreeResult
} from '@server/managers/challenges';

import { ChallengesManager } from '@server/managers/challenges-manager';
import { UsersManager } from '@server/managers/users-manager';
import { RatingSystemManager } from '@server/managers/rating-system-manager';
import { isNotDefined } from '@common/utils/is-defined';
import { Empty } from '@common/api/schemas-endpoints';
import { User } from '@server/models/user';
import {
	ChallengeAcceptInput,
	ChallengeAgreeResultInput,
	ChallengeDeclineInput,
	ChallengeDisagreeResultInput,
	ChallengeSendInput,
	ChallengeSetResultInput
} from '@app/common/api/schemas/challenges';
import { PublicError } from './models/error-types/public-error';

export async function getPageChallenge(_u: User) {
	debug(logNow(), 'function getPageChallenge...');

	return 'html/challenges.html';
}

export async function postChallengeSend(sender: User, input: ChallengeSendInput): Promise<Empty> {
	debug(logNow(), 'function postChallengeSend...');

	const receiverPublicId = input.to;
	const timeControlId = input.timeControlId;
	const timeControlName = input.timeControlName;
	const title = input.title;

	debug(logNow(), `Trying to send challenge from '${sender.username}' to '${receiverPublicId}'.`);

	const receiver = UsersManager.getInstance().getAllUserDataByPublicId(receiverPublicId);

	if (isNotDefined(receiver)) {
		debug(logNow(), `User receiver of the challenge '${receiverPublicId}' does not exist.`);
		throw new PublicError('User receiver of the challenge does not exist');
	}

	const ratsys = RatingSystemManager.getInstance();
	if (!ratsys.isTimeControlIdValid(timeControlId)) {
		debug(logNow(), `Time control id ${timeControlId} is not valid.`);
		throw new PublicError('The chosen time control id is not valid.');
	}

	let match: boolean = false;
	const timeControls = ratsys.getTimeControls();
	for (const t of timeControls) {
		if (t.id === timeControlId && t.name === timeControlName) {
			match = true;
			break;
		}
	}
	if (!match) {
		debug(logNow(), `Time control id ${timeControlId} is not valid.`);
		throw new PublicError('The chosen time control name does not correspond to the given time control id.');
	}

	debug(logNow(), `Send challenge from '${sender.username}' to '${receiver.user.username}'`);

	challengeSendNew(title, sender, receiver.user, timeControlId, timeControlName, logNow());

	return {};
}

export async function postChallengeAccept(user: User, input: ChallengeAcceptInput): Promise<Empty> {
	debug(logNow(), 'function postChallengeAccept...');

	const challengeId = input.id;

	debug(logNow(), `User '${user.username}' wants to accept challenge '${challengeId}'`);

	const c = ChallengesManager.getInstance().getChallengeById(challengeId);
	if (isNotDefined(c)) {
		throw new PublicError('Challenge does not exist');
	}

	debug(logNow(), `Challenge '${challengeId}' involves players '${c.sentBy}' and '${c.sentTo}'`);

	challengeAccept(c, { by: user.username, when: logNow() });

	return {};
}

export async function postChallengeDecline(user: User, input: ChallengeDeclineInput): Promise<Empty> {
	debug(logNow(), 'function postChallengeDecline...');

	const challengeId = input.id;

	debug(logNow(), `User '${user.username}' wants to decline challenge '${challengeId}'`);

	const c = ChallengesManager.getInstance().getChallengeById(challengeId);
	if (isNotDefined(c)) {
		throw new PublicError('Challenge does not exist');
	}

	debug(logNow(), `Challenge '${challengeId}' involves players '${c.sentBy}' and '${c.sentTo}'`);

	challengeDecline(c, { by: user.username });

	return {};
}

export async function postChallengeSetResult(user: User, input: ChallengeSetResultInput): Promise<Empty> {
	debug(logNow(), 'function postChallengeSetResult...');

	const setterUser = user.username;

	const challengeId = input.id;
	const whitePublicId = input.white;
	const blackPublicId = input.black;
	const gameResult = input.result;

	debug(logNow(), `User '${setterUser}' is trying to set the result of a challenge`);
	debug(logNow(), `    Challenge id: '${challengeId}'`);
	debug(logNow(), `    White: '${whitePublicId}'`);
	debug(logNow(), `    Black: '${blackPublicId}'`);
	debug(logNow(), `    Result: '${gameResult}'`);

	const manager = UsersManager.getInstance();
	const white = manager.getAllUserDataByPublicId(whitePublicId);
	const black = manager.getAllUserDataByPublicId(blackPublicId);

	if (isNotDefined(white)) {
		throw new PublicError(`White user does not exist.`);
	}
	if (isNotDefined(black)) {
		throw new PublicError(`Black user does not exist.`);
	}

	let c = ChallengesManager.getInstance().getChallengeById(challengeId);
	if (isNotDefined(c)) {
		throw new PublicError(`Challenge does not exist.`);
	}

	challengeSetResult(c, {
		by: setterUser,
		when: logNow(),
		white: white.user.username,
		black: black.user.username,
		result: gameResult
	});

	return {};
}

export async function postChallengeAgree(user: User, input: ChallengeAgreeResultInput): Promise<Empty> {
	debug(logNow(), 'function postChallengeAgree...');

	const challengeId = input.id;

	let c = ChallengesManager.getInstance().getChallengeById(challengeId);
	if (isNotDefined(c)) {
		throw new PublicError('Challenge does not exist');
	}

	challengeAgreeResult(c, { by: user.username, when: logNow() });

	return {};
}

export async function postChallengeDisagree(user: User, input: ChallengeDisagreeResultInput): Promise<Empty> {
	debug(logNow(), 'function postChallengeDisagree...');

	const challengeId = input.id;

	let c = ChallengesManager.getInstance().getChallengeById(challengeId);
	if (isNotDefined(c)) {
		throw new PublicError('Challenge does not exist');
	}

	challengeDisagreeResult(c, { by: user.username });

	return {};
}
