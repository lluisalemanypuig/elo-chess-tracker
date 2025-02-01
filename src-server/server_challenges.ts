/*
Elo rating for a Chess Club
Copyright (C) 2023 - 2025  Lluís Alemany Puig

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
const debug = Debug('ELO_TRACKER:server_challenges');

import path from 'path';

import { log_now, log_now_millis } from './utils/time';
import { is_user_logged_in } from './managers/session';
import {
	challenge_accept,
	challenge_decline,
	challenge_send_new,
	challenge_set_result,
	challenge_unset_result,
	challenge_agree_result
} from './managers/challenges';
import { user_exists, user_retrieve } from './managers/users';
import { Challenge, ChallengeID } from './models/challenge';
import { User } from './models/user';
import { CHALLENGE_USER } from './models/user_action';
import { SessionID } from './models/session_id';
import { challenge_can_user_send } from './utils/user_relationships';
import { ChallengesManager } from './managers/challenges_manager';
import { TimeControlID } from './models/time_control';
import { GameResult } from './models/game';

export async function get_challenges_page(req: any, res: any) {
	debug(log_now(), 'GET challenges_page...');

	const session = SessionID.from_cookie(req.cookies);

	const r = is_user_logged_in(session);
	if (!r[0]) {
		res.send(r[1]);
		return;
	}

	res.sendFile(path.join(__dirname, '../html/challenges.html'));
}

export async function post_challenge_send(req: any, res: any) {
	debug(log_now(), 'POST challenge_send...');

	const session = SessionID.from_cookie(req.cookies);
	const to_user = req.body.to;

	debug(log_now(), `Trying to send challenge from '${session.username}' to '${to_user}'.`);

	const r = is_user_logged_in(session);
	if (!r[0]) {
		debug(log_now(), `User '${session.username}' is not logged in or does not exist.`);
		res.send({
			r: '0',
			reason: r[1]
		});
		return;
	}

	const sender = r[2] as User;
	if (!sender.can_do(CHALLENGE_USER)) {
		debug(log_now(), `User '${session.username}' cannot challenge other users.`);
		res.send({
			r: '0',
			reason: 'You cannot challenge other users'
		});
		return;
	}

	const _receiver = user_retrieve(to_user);
	if (_receiver == undefined) {
		debug(log_now(), `User receiver of the challenge '${to_user}' does not exist.`);
		res.send({
			r: '0',
			reason: 'User does not exist'
		});
		return;
	}

	if (to_user == sender.get_username()) {
		debug(log_now(), `A challenge cannot be sent to oneself.`);
		res.send({
			r: '0',
			reason: 'Self challenges are not allowed'
		});
		return;
	}

	const receiver = _receiver as User;
	if (!challenge_can_user_send(sender, receiver)) {
		debug(log_now(), `Sender '${sender.get_username()}' cannot challenge user '${receiver.get_username()}'.`);
		res.send({
			r: '0',
			reason: 'You cannot challenge this user'
		});
		return;
	}

	debug(log_now(), `Send challenge from '${sender.get_username()}' to '${to_user}'`);
	challenge_send_new(sender.get_username(), receiver.get_username(), log_now_millis());

	res.send({ r: '1' });
	return;
}

export async function post_challenge_accept(req: any, res: any) {
	debug(log_now(), 'POST challenge_accept...');

	const session = SessionID.from_cookie(req.cookies);

	const r = is_user_logged_in(session);
	if (!r[0]) {
		res.send(r[1]);
		return;
	}

	const challenge_id: ChallengeID = req.body.challenge_id;

	debug(log_now(), `User '${session.username}' wants to accept challenge '${challenge_id}'`);

	const _c = ChallengesManager.get_instance().get_challenge_by_id(challenge_id);
	if (_c == undefined) {
		res.send({
			r: '0',
			reason: 'Challenge does not exist'
		});
		return;
	}
	const c = _c as Challenge;

	debug(log_now(), `Challenge '${challenge_id}' involves players '${c.get_sent_by()}' and '${c.get_sent_to()}'`);

	if (session.username != c.get_sent_to()) {
		res.send({
			r: '0',
			reason: 'You cannot accept this challenge'
		});
		return;
	}

	challenge_accept(c);
	res.send({ r: '1' });
}

export async function post_challenge_decline(req: any, res: any) {
	debug(log_now(), 'POST challenge_decline...');

	const session = SessionID.from_cookie(req.cookies);

	const r = is_user_logged_in(session);
	if (!r[0]) {
		res.send(r[1]);
		return;
	}

	const challenge_id: ChallengeID = req.body.challenge_id;

	debug(log_now(), `User '${session.username}' wants to decline challenge '${challenge_id}'`);

	const _c = ChallengesManager.get_instance().get_challenge_by_id(challenge_id);
	if (_c == undefined) {
		res.send({
			r: '0',
			reason: 'Challenge does not exist'
		});
		return;
	}
	const c = _c as Challenge;

	debug(log_now(), `Challenge '${challenge_id}' involves players '${c.get_sent_by()}' and '${c.get_sent_to()}'`);

	if (session.username != c.get_sent_to()) {
		res.send({
			r: '0',
			reason: 'You cannot decline this challenge'
		});
		return;
	}

	challenge_decline(c);
	res.send({ r: '1' });
}

export async function post_challenge_set_result(req: any, res: any) {
	debug(log_now(), 'POST challenge_set_result...');

	const session = SessionID.from_cookie(req.cookies);
	const r = is_user_logged_in(session);
	if (!r[0]) {
		res.send(r[1]);
		return;
	}

	const setter_user = session.username;
	const challenge_id: ChallengeID = req.body.challenge_id;
	const white_username = req.body.white;
	const black_username = req.body.black;
	const time_control_id: TimeControlID = req.body.time_control_id;
	const time_control_name = req.body.time_control_name;
	const result: GameResult = req.body.result;

	debug(log_now(), `User '${setter_user}' is trying to set the result of a challenge`);
	debug(log_now(), `    Challenge id: '${challenge_id}'`);
	debug(log_now(), `    White: '${white_username}'`);
	debug(log_now(), `    Black: '${black_username}'`);
	debug(log_now(), `    Time control id: '${time_control_id}'`);
	debug(log_now(), `    Time control name: '${time_control_name}'`);
	debug(log_now(), `    Result: '${result}'`);

	if (white_username == black_username) {
		res.send({
			r: '0',
			reason: 'White and Black cannot be the same players.'
		});
		return;
	}
	if (!user_exists(white_username)) {
		res.send({
			r: '0',
			reason: `White user does not exist.`
		});
		return;
	}
	if (!user_exists(black_username)) {
		res.send({
			r: '0',
			reason: `Black user does not exist.`
		});
		return;
	}

	if (setter_user != white_username && setter_user != black_username) {
		debug(
			log_now(),
			`User '${setter_user}' is trying to set the result of a challenge where he/she is not involved`
		);
		res.send({
			r: '0',
			reason: 'You are not part of this challenge.'
		});
		return;
	}

	let _c = ChallengesManager.get_instance().get_challenge_by_id(challenge_id);
	if (_c == undefined) {
		res.send({
			r: '0',
			reason: `Challenge '${challenge_id}' does not exist.`
		});
		return;
	}
	let c = _c as Challenge;

	{
		const original_setter = c.get_result_set_by();
		if (c.get_result_set_by() != undefined) {
			debug(
				log_now(),
				`User '${setter_user}' is trying to override the result of
			challenge '${challenge_id}' which was set by '${original_setter}'
			on '${c.get_when_result_set()}'`
			);
			res.send({
				r: '0',
				reason: 'The result of this challenge has to be set by the original setter, which you are not.'
			});
			return;
		}
	}

	if (white_username != c.get_sent_by() && white_username != c.get_sent_to()) {
		debug(log_now(), `White '${white_username}' is not part of challenge '${challenge_id}'.`);
		res.send({
			r: '0',
			reason: `White user sent is not part of this challenge.`
		});
		return;
	}
	if (black_username != c.get_sent_by() && black_username != c.get_sent_to()) {
		debug(log_now(), `Black '${black_username}' is not part of challenge '${challenge_id}'.`);
		res.send({
			r: '0',
			reason: `Black user sent is not part of this challenge.`
		});
		return;
	}

	challenge_set_result(
		c,
		setter_user,
		log_now_millis(),
		white_username,
		black_username,
		result,
		time_control_id,
		time_control_name
	);

	res.send({ r: '1' });
}

export async function post_challenge_agree_result(req: any, res: any) {
	debug(log_now(), 'POST challenge_agree_result...');

	const session = SessionID.from_cookie(req.cookies);
	const r = is_user_logged_in(session);

	if (!r[0]) {
		res.send(r[1]);
		return;
	}

	const challenge_id: ChallengeID = req.body.challenge_id;
	let _c = ChallengesManager.get_instance().get_challenge_by_id(challenge_id);
	if (_c == undefined) {
		res.send({
			r: '0',
			reason: 'Challenge does not exist'
		});
		return;
	}

	challenge_agree_result(_c as Challenge);
	res.send({ r: '1' });
}

export async function post_challenge_disagree_result(req: any, res: any) {
	debug(log_now(), 'POST challenge_disagree_result...');

	const session = SessionID.from_cookie(req.cookies);
	const r = is_user_logged_in(session);

	if (!r[0]) {
		res.send(r[1]);
		return;
	}

	const challenge_id: ChallengeID = req.body.challenge_id;
	let _c = ChallengesManager.get_instance().get_challenge_by_id(challenge_id);
	if (_c == undefined) {
		res.send({
			r: '0',
			reason: 'Challenge does not exist'
		});
		return;
	}

	challenge_unset_result(_c as Challenge);
	res.send({ r: '1' });
}
