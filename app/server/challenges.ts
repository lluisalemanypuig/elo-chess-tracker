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
import { Request, Response } from 'express';

import { logNow } from '@common/utils/time';
import { isUserLoggedIn } from '@server/managers/session';
import {
	challengeAccept,
	challengeDecline,
	challengeSendNew,
	challengeSetResult,
	challengeDisagreeResult,
	challengeAgreeResult
} from '@server/managers/challenges';

import { ChallengeId } from '@common/models/challenge';
import { USER_CHALLENGE } from '@common/models/user-action';
import { canUserSendChallenge } from '@server/managers/user-relationships';
import { ChallengesManager } from '@server/managers/challenges-manager';
import { GameResult } from '@common/models/game';
import { UsersManager } from '@server/managers/users-manager';
import { ConfigurationManager } from '@server/managers/configuration-manager';
import { RatingSystemManager } from '@server/managers/rating-system-manager';
import { getExecutionDirectory } from '@server/managers/environment-manager';
import { isNotDefined } from '@common/utils/is-defined';
import { ROUTES } from '@common/routes';
import { inputSchemaOf } from '@common/api/schemas';
import { safeParseRequestBody, safeParseRequestCookies } from '@server/utils/schemas';
import { AuthenticationInputSchema } from '@common/schemas/authentication';

export async function getPageChallenge(req: Request, res: Response) {
	debug(logNow(), `GET ${ROUTES.PAGE_CHALLENGE}...`);

	const sessionParse = safeParseRequestCookies(req, res, debug);
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

	res.status(200);
	if (ConfigurationManager.shouldCacheData()) {
		res.setHeader('Cache-Control', 'public, max-age=864000, immutable');
	}
	res.sendFile(`${getExecutionDirectory()}/html/challenges.html`);
}

export async function postChallengeSend(req: Request, res: Response) {
	debug(logNow(), `POST ${ROUTES.CHALLENGE_SEND}...`);

	const sessionParse = safeParseRequestCookies(req, res, debug);
	if (sessionParse.result === 'Exit') {
		return;
	}
	const session = sessionParse.data;

	const challengeParse = safeParseRequestBody(req.body, inputSchemaOf(ROUTES.CHALLENGE_SEND), res, debug);
	if (challengeParse.result === 'Exit') {
		return;
	}
	const receiverPublicId = challengeParse.data.to;
	const timeControlId = challengeParse.data.timeControlId;
	const timeControlName = challengeParse.data.timeControlName;
	const title = challengeParse.data.title;
	const r = isUserLoggedIn(session);
	const sender = r[2];
	if (isNotDefined(sender)) {
		res.status(401).send(r[1]);
		return;
	}

	if (!sender.canDo(USER_CHALLENGE)) {
		debug(logNow(), `User '${sender.username}' cannot challenge other users.`);
		res.status(403).send('You cannot challenge other users');
		return;
	}

	debug(logNow(), `Trying to send challenge from '${sender.username}' to '${receiverPublicId}'.`);

	const receiver = UsersManager.getInstance().getAllUserDataByPublicId(receiverPublicId);

	if (isNotDefined(receiver)) {
		debug(logNow(), `User receiver of the challenge '${receiverPublicId}' does not exist.`);
		res.status(404).send('User receiver of the challenge does not exist');
		return;
	}

	if (!canUserSendChallenge(sender, receiver.user)) {
		debug(logNow(), `Sender '${sender.username}' cannot challenge user '${receiver.user.username}'.`);
		res.status(403).send('You cannot challenge this user.');
		return;
	}

	const ratsys = RatingSystemManager.getInstance();
	if (!ratsys.isTimeControlIdValid(timeControlId)) {
		debug(logNow(), `Time control id ${timeControlId} is not valid.`);
		res.status(500).send('The chosen time control id is not valid.');
		return;
	}
	let match: boolean = false;
	const timeControls = ratsys.getTimeControls();
	for (let t of timeControls) {
		if (t.id === timeControlId && t.name === timeControlName) {
			match = true;
			break;
		}
	}
	if (!match) {
		debug(logNow(), `Time control id ${timeControlId} is not valid.`);
		res.status(500).send('The chosen time control name does not correspond to the given time control id.');
		return;
	}

	debug(logNow(), `Send challenge from '${sender.username}' to '${receiver.user.username}'`);

	try {
		challengeSendNew(title, sender.username, receiver.user.username, timeControlId, timeControlName, logNow());
	} catch (e: unknown) {
		res.status(403).send((e as Error).message);
		return;
	}

	res.status(200).send();
}

export async function postChallengeAccept(req: Request, res: Response) {
	debug(logNow(), `POST ${ROUTES.CHALLENGE_ACCEPT}...`);

	const sessionParse = safeParseRequestCookies(req, res, debug);
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

	const challengeParse = safeParseRequestBody(req.body, inputSchemaOf(ROUTES.CHALLENGE_ACCEPT), res, debug);
	if (challengeParse.result === 'Exit') {
		return;
	}
	const challengeId = challengeParse.data.id;

	debug(logNow(), `User '${session.publicId}' wants to accept challenge '${challengeParse}'`);

	const c = ChallengesManager.getInstance().getChallengeById(challengeId);
	if (isNotDefined(c)) {
		res.status(404).send('Challenge does not exist');
		return;
	}

	debug(logNow(), `Challenge '${challengeId}' involves players '${c.sentBy}' and '${c.sentTo}'`);

	try {
		challengeAccept(c, { by: user.username, when: logNow() });
	} catch (e: unknown) {
		res.status(403).send((e as Error).message);
		return;
	}

	res.status(200).send();
}

export async function postChallengeDecline(req: Request, res: Response) {
	debug(logNow(), `POST ${ROUTES.CHALLENGE_DECLINE}...`);

	const sessionParse = safeParseRequestCookies(req, res, debug);
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

	const challengeParse = safeParseRequestBody(req.body, inputSchemaOf(ROUTES.CHALLENGE_DECLINE), res, debug);
	if (challengeParse.result === 'Exit') {
		return;
	}
	const challengeId = challengeParse.data.id;

	debug(logNow(), `User '${session.publicId}' wants to decline challenge '${challengeId}'`);

	const c = ChallengesManager.getInstance().getChallengeById(challengeId);
	if (isNotDefined(c)) {
		res.status(404).send('Challenge does not exist');
		return;
	}

	debug(logNow(), `Challenge '${challengeId}' involves players '${c.sentBy}' and '${c.sentTo}'`);

	try {
		challengeDecline(c, { by: user.username });
	} catch (e: unknown) {
		res.status(403).send((e as Error).message);
		return;
	}

	res.status(200).send();
}

export async function postChallengeSetResult(req: Request, res: Response) {
	debug(logNow(), `POST ${ROUTES.CHALLENGE_SET_RESULT}...`);

	const sessionParse = safeParseRequestCookies(req, res, debug);
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

	const setterUser = user.username;
	const challengeParse = safeParseRequestBody(req.body, inputSchemaOf(ROUTES.CHALLENGE_SET_RESULT), res, debug);
	if (challengeParse.result === 'Exit') {
		return;
	}

	const challengeId: ChallengeId = challengeParse.data.id;
	const whiteUsername = challengeParse.data.white;
	const blackUsername = challengeParse.data.black;
	const result: GameResult = challengeParse.data.result;

	debug(logNow(), `User '${setterUser}' is trying to set the result of a challenge`);
	debug(logNow(), `    Challenge id: '${challengeId}'`);
	debug(logNow(), `    White: '${whiteUsername}'`);
	debug(logNow(), `    Black: '${blackUsername}'`);
	debug(logNow(), `    Result: '${result}'`);

	const manager = UsersManager.getInstance();
	if (!manager.exists(whiteUsername)) {
		res.status(404).send(`White user does not exist.`);
		return;
	}
	if (!manager.exists(blackUsername)) {
		res.status(404).send(`Black user does not exist.`);
		return;
	}

	let c = ChallengesManager.getInstance().getChallengeById(challengeId);
	if (isNotDefined(c)) {
		res.status(404).send(`Challenge does not exist.`);
		return;
	}

	try {
		challengeSetResult(c, {
			by: setterUser,
			when: logNow(),
			white: whiteUsername,
			black: blackUsername,
			result
		});
	} catch (e: unknown) {
		res.status(403).send((e as Error).message);
		return;
	}

	res.status(200).send();
}

export async function postChallengeAgree(req: Request, res: Response) {
	debug(logNow(), `POST ${ROUTES.CHALLENGE_AGREE}...`);

	const sessionParse = safeParseRequestCookies(req, res, debug);
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

	const challengeParse = safeParseRequestBody(req.body, inputSchemaOf(ROUTES.CHALLENGE_AGREE), res, debug);
	if (challengeParse.result === 'Exit') {
		return;
	}
	const challengeId = challengeParse.data.id;

	let c = ChallengesManager.getInstance().getChallengeById(challengeId);
	if (isNotDefined(c)) {
		res.status(404).send('Challenge does not exist');
		return;
	}

	try {
		challengeAgreeResult(c, { by: user.username, when: logNow() });
	} catch (e: unknown) {
		res.status(403).send((e as Error).message);
		return;
	}

	res.status(200).send();
}

export async function postChallengeDisagree(req: Request, res: Response) {
	debug(logNow(), `POST ${ROUTES.CHALLENGE_DISAGREE}...`);

	const sessionParse = safeParseRequestCookies(req, res, debug);
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

	const challengeParse = safeParseRequestBody(req.body, inputSchemaOf(ROUTES.CHALLENGE_DISAGREE), res, debug);
	if (challengeParse.result === 'Exit') {
		return;
	}
	const challengeId = challengeParse.data.id;

	let c = ChallengesManager.getInstance().getChallengeById(challengeId);
	if (isNotDefined(c)) {
		res.status(404).send('Challenge does not exist');
		return;
	}

	try {
		challengeDisagreeResult(c, { by: user.username });
	} catch (e: unknown) {
		res.status(403).send((e as Error).message);
		return;
	}

	res.status(200).send();
}
