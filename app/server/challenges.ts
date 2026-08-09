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
const debug = Debug('ELO_CHESS_TRACKER:server_challenges');
import { Request, Response } from 'express';

import { log_now } from '@common/utils/time';
import { is_user_logged_in } from '@server/managers/session';
import {
	challengeAccept,
	challengeDecline,
	challengeSendNew,
	challengeSetResult,
	challengeDisagreeResult,
	challengeAgreeResult
} from '@server/managers/challenges';

import { ChallengeId } from '@common/models/challenge';
import { USER_CHALLENGE } from '@common/models/user_action';
import { can_user_send_challenge } from '@server/managers/user_relationships';
import { ChallengesManager } from '@server/managers/challenges_manager';
import { GameResult } from '@common/models/game';
import { UsersManager } from '@server/managers/users_manager';
import { ConfigurationManager } from '@server/managers/configuration_manager';
import { RatingSystemManager } from '@server/managers/rating_system_manager';
import { get_execution_directory } from '@server/managers/environment_manager';
import { isNotDefined } from '@common/utils/is_defined';
import { Routes } from '@common/routes';
import { InputSchemaOf } from '@common/api/schemas';
import { safe_parse_request_body, safe_parse_request_cookies } from '@server/utils/schemas';
import { AuthenticationInputSchema } from '@common/schemas/authentication';

export async function get_page_challenge(req: Request, res: Response) {
	debug(log_now(), `GET ${Routes.PAGE_CHALLENGE}...`);

	const session_parse = safe_parse_request_cookies(req, AuthenticationInputSchema, res, debug);
	if (session_parse.result === 'Exit') {
		return;
	}
	const session = session_parse.data;

	const r = is_user_logged_in(session);
	if (isNotDefined(r[2])) {
		res.status(401).send(r[1]);
		return;
	}

	res.status(200);
	if (ConfigurationManager.should_cache_data()) {
		res.setHeader('Cache-Control', 'public, max-age=864000, immutable');
	}
	res.sendFile(`${get_execution_directory()}/html/challenges.html`);
}

export async function post_challenge_send(req: Request, res: Response) {
	debug(log_now(), `POST ${Routes.CHALLENGE_SEND}...`);

	const session_parse = safe_parse_request_cookies(req, AuthenticationInputSchema, res, debug);
	if (session_parse.result === 'Exit') {
		return;
	}
	const session = session_parse.data;

	const challenge_parse = safe_parse_request_body(req.body, InputSchemaOf(Routes.CHALLENGE_SEND), res, debug);
	if (challenge_parse.result === 'Exit') {
		return;
	}
	const receiverPublicId = challenge_parse.data.to;
	const timeControlId = challenge_parse.data.time_control_id;
	const timeControlName = challenge_parse.data.time_control_name;
	const title = challenge_parse.data.title;

	const r = is_user_logged_in(session);
	const sender = r[2];
	if (isNotDefined(sender)) {
		res.status(401).send(r[1]);
		return;
	}

	if (!sender.can_do(USER_CHALLENGE)) {
		debug(log_now(), `User '${session.username}' cannot challenge other users.`);
		res.status(403).send('You cannot challenge other users');
		return;
	}

	debug(log_now(), `Trying to send challenge from '${session.username}' to '${receiverPublicId}'.`);

	const receiver = UsersManager.get_instance().get_user_by_public_id(receiverPublicId);

	if (isNotDefined(receiver)) {
		debug(log_now(), `User receiver of the challenge '${receiverPublicId}' does not exist.`);
		res.status(404).send('User receiver of the challenge does not exist');
		return;
	}

	if (!can_user_send_challenge(sender, receiver)) {
		debug(log_now(), `Sender '${sender.username}' cannot challenge user '${receiver.username}'.`);
		res.status(403).send('You cannot challenge this user.');
		return;
	}

	const ratsys = RatingSystemManager.get_instance();
	if (!ratsys.is_time_control_id_valid(timeControlId)) {
		debug(log_now(), `Time control id ${timeControlId} is not valid.`);
		res.status(500).send('The chosen time control id is not valid.');
		return;
	}
	let match: boolean = false;
	const time_controls = ratsys.get_time_controls();
	for (let t of time_controls) {
		if (t.id == timeControlId && t.name == timeControlName) {
			match = true;
			break;
		}
	}
	if (!match) {
		debug(log_now(), `Time control id ${timeControlId} is not valid.`);
		res.status(500).send('The chosen time control name does not correspond to the given time control id.');
		return;
	}

	debug(log_now(), `Send challenge from '${sender.username}' to '${receiver.username}'`);

	try {
		challengeSendNew(title, sender.username, receiver.username, timeControlId, timeControlName, log_now());
	} catch (e: unknown) {
		res.status(403).send((e as Error).message);
		return;
	}

	res.status(200).send();
}

export async function post_challenge_accept(req: Request, res: Response) {
	debug(log_now(), `POST ${Routes.CHALLENGE_ACCEPT}...`);

	const session_parse = safe_parse_request_cookies(req, AuthenticationInputSchema, res, debug);
	if (session_parse.result === 'Exit') {
		return;
	}
	const session = session_parse.data;

	const r = is_user_logged_in(session);
	if (isNotDefined(r[2])) {
		res.status(401).send(r[1]);
		return;
	}

	const challenge_parse = safe_parse_request_body(req.body, InputSchemaOf(Routes.CHALLENGE_ACCEPT), res, debug);
	if (challenge_parse.result === 'Exit') {
		return;
	}
	const challenge_id = challenge_parse.data.id;

	debug(log_now(), `User '${session.username}' wants to accept challenge '${challenge_parse}'`);

	const c = ChallengesManager.get_instance().get_challenge_by_id(challenge_id);
	if (isNotDefined(c)) {
		res.status(404).send('Challenge does not exist');
		return;
	}

	debug(log_now(), `Challenge '${challenge_id}' involves players '${c.sent_by}' and '${c.sent_to}'`);

	try {
		challengeAccept(c, { by: session.username, when: log_now() });
	} catch (e: unknown) {
		res.status(403).send((e as Error).message);
		return;
	}

	res.status(200).send();
}

export async function post_challenge_decline(req: Request, res: Response) {
	debug(log_now(), `POST ${Routes.CHALLENGE_DECLINE}...`);

	const session_parse = safe_parse_request_cookies(req, AuthenticationInputSchema, res, debug);
	if (session_parse.result === 'Exit') {
		return;
	}
	const session = session_parse.data;

	const r = is_user_logged_in(session);
	if (isNotDefined(r[2])) {
		res.status(401).send(r[1]);
		return;
	}

	const challenge_parse = safe_parse_request_body(req.body, InputSchemaOf(Routes.CHALLENGE_DECLINE), res, debug);
	if (challenge_parse.result === 'Exit') {
		return;
	}
	const challenge_id = challenge_parse.data.id;

	debug(log_now(), `User '${session.username}' wants to decline challenge '${challenge_id}'`);

	const c = ChallengesManager.get_instance().get_challenge_by_id(challenge_id);
	if (isNotDefined(c)) {
		res.status(404).send('Challenge does not exist');
		return;
	}

	debug(log_now(), `Challenge '${challenge_id}' involves players '${c.sent_by}' and '${c.sent_to}'`);

	try {
		challengeDecline(c, { by: session.username });
	} catch (e: unknown) {
		res.status(403).send((e as Error).message);
		return;
	}

	res.status(200).send();
}

export async function post_challenge_set_result(req: Request, res: Response) {
	debug(log_now(), `POST ${Routes.CHALLENGE_SET_RESULT}...`);

	const session_parse = safe_parse_request_cookies(req, AuthenticationInputSchema, res, debug);
	if (session_parse.result === 'Exit') {
		return;
	}
	const session = session_parse.data;
	const r = is_user_logged_in(session);
	if (isNotDefined(r[2])) {
		res.status(401).send(r[1]);
		return;
	}

	const setter_user = session.username;
	const challenge_parse = safe_parse_request_body(req.body, InputSchemaOf(Routes.CHALLENGE_SET_RESULT), res, debug);
	if (challenge_parse.result === 'Exit') {
		return;
	}

	const challenge_id: ChallengeId = challenge_parse.data.id;
	const white_username = challenge_parse.data.white;
	const black_username = challenge_parse.data.black;
	const result: GameResult = challenge_parse.data.result;

	debug(log_now(), `User '${setter_user}' is trying to set the result of a challenge`);
	debug(log_now(), `    Challenge id: '${challenge_id}'`);
	debug(log_now(), `    White: '${white_username}'`);
	debug(log_now(), `    Black: '${black_username}'`);
	debug(log_now(), `    Result: '${result}'`);

	const manager = UsersManager.get_instance();
	if (!manager.exists(white_username)) {
		res.status(404).send(`White user does not exist.`);
		return;
	}
	if (!manager.exists(black_username)) {
		res.status(404).send(`Black user does not exist.`);
		return;
	}

	let c = ChallengesManager.get_instance().get_challenge_by_id(challenge_id);
	if (isNotDefined(c)) {
		res.status(404).send(`Challenge does not exist.`);
		return;
	}

	try {
		challengeSetResult(c, {
			by: setter_user,
			when: log_now(),
			white: white_username,
			black: black_username,
			result
		});
	} catch (e: unknown) {
		res.status(403).send((e as Error).message);
		return;
	}

	res.status(200).send();
}

export async function post_challenge_agree(req: Request, res: Response) {
	debug(log_now(), `POST ${Routes.CHALLENGE_AGREE}...`);

	const session_parse = safe_parse_request_cookies(req, AuthenticationInputSchema, res, debug);
	if (session_parse.result === 'Exit') {
		return;
	}
	const session = session_parse.data;
	const r = is_user_logged_in(session);

	if (isNotDefined(r[2])) {
		res.status(401).send(r[1]);
		return;
	}

	const challenge_parse = safe_parse_request_body(req.body, InputSchemaOf(Routes.CHALLENGE_AGREE), res, debug);
	if (challenge_parse.result === 'Exit') {
		return;
	}
	const challenge_id = challenge_parse.data.id;

	let c = ChallengesManager.get_instance().get_challenge_by_id(challenge_id);
	if (isNotDefined(c)) {
		res.status(404).send('Challenge does not exist');
		return;
	}

	try {
		challengeAgreeResult(c, { by: session.username, when: log_now() });
	} catch (e: unknown) {
		res.status(403).send((e as Error).message);
		return;
	}

	res.status(200).send();
}

export async function post_challenge_disagree(req: Request, res: Response) {
	debug(log_now(), `POST ${Routes.CHALLENGE_DISAGREE}...`);

	const session_parse = safe_parse_request_cookies(req, AuthenticationInputSchema, res, debug);
	if (session_parse.result === 'Exit') {
		return;
	}
	const session = session_parse.data;
	const r = is_user_logged_in(session);

	if (isNotDefined(r[2])) {
		res.status(401).send(r[1]);
		return;
	}

	const challenge_parse = safe_parse_request_body(req.body, InputSchemaOf(Routes.CHALLENGE_DISAGREE), res, debug);
	if (challenge_parse.result === 'Exit') {
		return;
	}
	const challenge_id = challenge_parse.data.id;

	let c = ChallengesManager.get_instance().get_challenge_by_id(challenge_id);
	if (isNotDefined(c)) {
		res.status(404).send('Challenge does not exist');
		return;
	}

	try {
		challengeDisagreeResult(c, { by: session.username });
	} catch (e: unknown) {
		res.status(403).send((e as Error).message);
		return;
	}

	res.status(200).send();
}
