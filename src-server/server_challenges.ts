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

import { log_now } from './utils/time';
import { is_user_logged_in } from './managers/session';
import {
	challenge_accept,
	challenge_decline,
	challenge_send_new,
	challenge_set_result,
	challenge_unset_result,
	challenge_agree_result
} from './managers/challenges';
import { Challenge, ChallengeID } from './models/challenge';
import { User } from './models/user';
import { USER_CHALLENGE } from './models/user_action';
import { SessionID } from './models/session_id';
import { can_user_send_challenge } from './managers/user_relationships';
import { ChallengesManager } from './managers/challenges_manager';
import { GameResult } from './models/game';
import { UsersManager } from './managers/users_manager';
import { ConfigurationManager } from './managers/configuration_manager';
import { RatingSystemManager } from './managers/rating_system_manager';

export async function get_page_challenge(req: any, res: any) {
	debug(log_now(), 'GET /page/challenge...');

	const session = SessionID.from_cookie(req.cookies);

	const r = is_user_logged_in(session);
	if (!r[0]) {
		res.status(401).send(r[1]);
		return;
	}

	res.status(200);
	if (ConfigurationManager.should_cache_data()) {
		res.setHeader('Cache-Control', 'public, max-age=864000, immutable');
	}
	res.sendFile(path.join(__dirname, '../html/challenges.html'));
}

export async function post_challenge_send(req: any, res: any) {
	debug(log_now(), 'POST /challenge/send...');

	const session = SessionID.from_cookie(req.cookies);
	const to_random_id = req.body.to;
	const time_control_id = req.body.time_control_id;
	const time_control_name = req.body.time_control_name;

	const r = is_user_logged_in(session);
	if (!r[0]) {
		res.status(401).send(r[1]);
		return;
	}

	const sender = r[2] as User;
	if (!sender.can_do(USER_CHALLENGE)) {
		debug(log_now(), `User '${session.username}' cannot challenge other users.`);
		res.status(403).send('You cannot challenge other users');
		return;
	}

	debug(log_now(), `Trying to send challenge from '${session.username}' to '${to_random_id}'.`);

	const _receiver = UsersManager.get_instance().get_user_by_random_id(to_random_id);

	if (_receiver == undefined) {
		debug(log_now(), `User receiver of the challenge '${to_random_id}' does not exist.`);
		res.status(404).send('User receiver of the challenge does not exist');
		return;
	}

	const receiver = _receiver as User;
	if (receiver.get_username() == sender.get_username()) {
		debug(log_now(), `A challenge cannot be sent to oneself.`);
		res.status(403).send('You cannot challenge yourself.');
		return;
	}

	if (!can_user_send_challenge(sender, receiver)) {
		debug(log_now(), `Sender '${sender.get_username()}' cannot challenge user '${receiver.get_username()}'.`);
		res.status(403).send('You cannot challenge this user.');
		return;
	}

	const ratsys = RatingSystemManager.get_instance();
	if (!ratsys.is_time_control_id_valid(time_control_id)) {
		debug(log_now(), `Time control id ${time_control_id} is not valid.`);
		res.status(500).send('The chosen time control id is not valid.');
		return;
	}
	let match: boolean = false;
	const time_controls = ratsys.get_time_controls();
	for (let t of time_controls) {
		if (t.id == time_control_id && t.name == time_control_name) {
			match = true;
		}
	}
	if (!match) {
		debug(log_now(), `Time control id ${time_control_id} is not valid.`);
		res.status(500).send('The chosen time control name does not correspond to the given time control id.');
		return;
	}

	debug(log_now(), `Send challenge from '${sender.get_username()}' to '${receiver.get_username()}'`);
	challenge_send_new(sender.get_username(), receiver.get_username(), time_control_id, time_control_name, log_now());

	res.status(200).send();
}

export async function post_challenge_accept(req: any, res: any) {
	debug(log_now(), 'POST /challenge/accept...');

	const session = SessionID.from_cookie(req.cookies);

	const r = is_user_logged_in(session);
	if (!r[0]) {
		res.status(401).send(r[1]);
		return;
	}

	const challenge_id: ChallengeID = req.body.challenge_id;

	debug(log_now(), `User '${session.username}' wants to accept challenge '${challenge_id}'`);

	const _c = ChallengesManager.get_instance().get_challenge_by_id(challenge_id);
	if (_c == undefined) {
		res.status(404).send('Challenge does not exist');
		return;
	}
	const c = _c as Challenge;

	debug(log_now(), `Challenge '${challenge_id}' involves players '${c.get_sent_by()}' and '${c.get_sent_to()}'`);

	if (session.username != c.get_sent_to()) {
		res.status(403).send('You cannot accept this challenge');
		return;
	}

	challenge_accept(c);
	res.status(200).send();
}

export async function post_challenge_decline(req: any, res: any) {
	debug(log_now(), 'POST /challenge/decline...');

	const session = SessionID.from_cookie(req.cookies);

	const r = is_user_logged_in(session);
	if (!r[0]) {
		res.status(401).send(r[1]);
		return;
	}

	const challenge_id: ChallengeID = req.body.challenge_id;

	debug(log_now(), `User '${session.username}' wants to decline challenge '${challenge_id}'`);

	const _c = ChallengesManager.get_instance().get_challenge_by_id(challenge_id);
	if (_c == undefined) {
		res.status(404).send('Challenge does not exist');
		return;
	}
	const c = _c as Challenge;

	debug(log_now(), `Challenge '${challenge_id}' involves players '${c.get_sent_by()}' and '${c.get_sent_to()}'`);

	if (session.username != c.get_sent_to()) {
		res.status(403).send('You cannot decline this challenge');
		return;
	}

	challenge_decline(c);
	res.status(200).send();
}

export async function post_challenge_set_result(req: any, res: any) {
	debug(log_now(), 'POST /challenge/set_result...');

	const session = SessionID.from_cookie(req.cookies);
	const r = is_user_logged_in(session);
	if (!r[0]) {
		res.status(401).send(r[1]);
		return;
	}

	const setter_user = session.username;
	const challenge_id: ChallengeID = req.body.challenge_id;
	const white_username = req.body.white;
	const black_username = req.body.black;
	const result: GameResult = req.body.result;

	debug(log_now(), `User '${setter_user}' is trying to set the result of a challenge`);
	debug(log_now(), `    Challenge id: '${challenge_id}'`);
	debug(log_now(), `    White: '${white_username}'`);
	debug(log_now(), `    Black: '${black_username}'`);
	debug(log_now(), `    Result: '${result}'`);

	if (white_username == black_username) {
		res.status(500).send('White and Black cannot be the same players.');
		return;
	}

	const manager = UsersManager.get_instance();
	if (!manager.exists(white_username)) {
		res.status(404).send(`White user does not exist.`);
		return;
	}
	if (!manager.exists(black_username)) {
		res.status(404).send(`Black user does not exist.`);
		return;
	}

	let _c = ChallengesManager.get_instance().get_challenge_by_id(challenge_id);
	if (_c == undefined) {
		res.status(404).send(`Challenge does not exist.`);
		return;
	}
	let c = _c as Challenge;

	{
		const original_setter = c.get_result_set_by();
		if (original_setter != undefined && original_setter != setter_user) {
			debug(
				log_now(),
				`User '${setter_user}' is trying to override the result of
			challenge '${challenge_id}' which was set by '${original_setter}'
			on '${c.get_when_result_set()}'`
			);
			res.status(403).send(
				'The result of this challenge has to be set by the original setter, which you are not.'
			);
			return;
		}
	}

	if (white_username != c.get_sent_by() && white_username != c.get_sent_to()) {
		debug(log_now(), `White '${white_username}' is not part of challenge '${challenge_id}'.`);
		res.status(403).send(`White user sent is not part of this challenge.`);
		return;
	}
	if (black_username != c.get_sent_by() && black_username != c.get_sent_to()) {
		debug(log_now(), `Black '${black_username}' is not part of challenge '${challenge_id}'.`);
		res.status(403).send(`Black user sent is not part of this challenge.`);
		return;
	}

	challenge_set_result(c, setter_user, log_now(), white_username, black_username, result);

	res.status(200).send();
}

export async function post_challenge_agree(req: any, res: any) {
	debug(log_now(), 'POST /challenge/agree...');

	const session = SessionID.from_cookie(req.cookies);
	const r = is_user_logged_in(session);

	if (!r[0]) {
		res.status(401).send(r[1]);
		return;
	}

	const challenge_id: ChallengeID = req.body.challenge_id;
	let _c = ChallengesManager.get_instance().get_challenge_by_id(challenge_id);
	if (_c == undefined) {
		res.status(404).send('Challenge does not exist');
		return;
	}

	challenge_agree_result(_c as Challenge);
	res.status(200).send();
}

export async function post_challenge_disagree(req: any, res: any) {
	debug(log_now(), 'POST /challenge/disagree...');

	const session = SessionID.from_cookie(req.cookies);
	const r = is_user_logged_in(session);

	if (!r[0]) {
		res.status(401).send(r[1]);
		return;
	}

	const challenge_id: ChallengeID = req.body.challenge_id;
	let _c = ChallengesManager.get_instance().get_challenge_by_id(challenge_id);
	if (_c == undefined) {
		res.status(404).send('Challenge does not exist');
		return;
	}

	challenge_unset_result(_c as Challenge);
	res.status(200).send();
}
