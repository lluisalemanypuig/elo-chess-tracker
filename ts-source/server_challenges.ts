/*
Elo rating for a Chess Club
Copyright (C) 2023  Lluís Alemany Puig

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

Contact:
	Lluís Alemany Puig
	https://github.com/lluisalemanypuig
*/

import Debug from 'debug';
const debug = Debug('ELO_TRACKER:server_challenges');

import path from 'path';

import { log_now } from './utils/misc';
import { is_user_logged_in } from './server/session';
import {
	challenge_retrieve,
	challenge_accept,
	challenge_decline,
	challenge_send_new,
	challenge_set_result,
	challenge_unset_result,
	challenge_agree_result,
	challenge_can_user_send
} from './server/challenges';
import { user_exists } from './server/users';
import { Challenge } from './models/challenge';
import { User } from './models/user';
import { CHALLENGE_USER } from './models/user_action';
import { assert } from 'console';

export async function get_challenges_page(req: any, res: any) {
	debug(log_now(), "GET challenges_page...");

	const id = req.cookies.session_id;
	const username = req.cookies.user;

	let r = is_user_logged_in(id, username);
	if (!r[0]) {
		res.send(r[1]);
		return;
	}

	res.sendFile(path.join(__dirname, "../html/challenges.html"));
}

export async function post_challenge_send(req: any, res: any) {
	debug(log_now(), "POST challenge_send...");

	const id = req.cookies.session_id;
	const username = req.cookies.user;
	const to_user = req.body.to;

	debug(log_now(), `Trying to send challenge from '${username}' to '${to_user}'.`);

	let r = is_user_logged_in(id, username);
	if (!r[0]) {
		debug(log_now(), `User '${username}' is not logged in or does not exist.`);
		res.send({
			'r' : '0',
			'reason' : r[1]
		});
		return;
	}

	if (!user_exists(to_user)) {
		debug(log_now(), `User receiver of the challenge '${to_user}' does not exist.`);
		res.send({
			'r' : '0',
			'reason' : 'User does not exist'
		});
		return;
	}

	if (to_user == username) {
		debug(log_now(), `A challenge cannot be sent to oneself.`);
		res.send({
			'r' : '0',
			'reason' : 'Self challenges are not allowed'
		});
		return;
	}

	assert(r[2] != null);

	{
	let sender = r[2] as User;
	if (!sender.can_do(CHALLENGE_USER) ) {
		debug(log_now(), `User '${username}' cannot challenge other users.`);
		res.send({
			'r' : '0',
			'reason' : 'You cannot challenge other users'
		});
		return;
	}
	}

	if (!challenge_can_user_send(username, req.body.to)) {
		debug(log_now(), `Sender '${username}' cannot challenge user '${req.body.to}'.`);
		res.send({
			'r' : '0',
			'reason' : 'You cannot challenge this user'
		});
		return;
	}

	debug(log_now(), `Send challenge from '${username}' to '${to_user}'`);
	challenge_send_new(username, req.body.to);

	res.send({'r' : '1'});
	return;
}

export async function post_challenge_accept(req: any, res: any) {
	debug(log_now(), "POST challenge_accept...");

	const id = req.cookies.session_id;
	const username = req.cookies.user;

	let r = is_user_logged_in(id, username);
	if (!r[0]) {
		res.send(r[1]);
		return;
	}

	const challenge_id = req.body.challenge_id;

	debug(log_now(), `User '${username}' wants to accept challenge '${challenge_id}'`);

	let c = challenge_retrieve(challenge_id) as Challenge;

	debug(log_now(), `Challenge '${challenge_id}' involves players '${c.get_sent_by()}' and '${c.get_sent_to()}'`);

	if (username != c.get_sent_to()) {
		// nothing else to do
		res.send({ 'r' : '0', 'reason' : 'This user cannot accept this challenge' });
		return;
	}

	challenge_accept(c);
	res.send({ 'r' : '1' });
}

export async function post_challenge_decline(req: any, res: any) {
	debug(log_now(), "POST challenge_decline...");

	const id = req.cookies.session_id;
	const username = req.cookies.user;

	let r = is_user_logged_in(id, username);
	if (!r[0]) {
		res.send(r[1]);
		return;
	}

	const challenge_id = req.body.challenge_id;

	debug(log_now(), `User '${username}' wants to decline challenge '${challenge_id}'`);

	let c = challenge_retrieve(challenge_id) as Challenge;

	debug(log_now(), `Challenge '${challenge_id}' involves players '${c.get_sent_by()}' and '${c.get_sent_to()}'`);

	if (username != c.get_sent_to()) {
		// nothing else to do
		res.send({ 'r' : '0', 'reason' : 'This user cannot decline this challenge' });
		return;
	}

	challenge_decline(c);
	res.send({ 'r' : '1' });
}

export async function post_challenge_set_result(req: any, res: any) {
	debug(log_now(), "POST challenge_set_result...");

	const id = req.cookies.session_id;
	const this_username = req.cookies.user;

	let r = is_user_logged_in(id, this_username);
	if (!r[0]) {
		res.send(r[1]);
		return;
	}

	const challenge_id = req.body.challenge_id;
	const white_username = req.body.white;
	const black_username = req.body.black;
	const time_control_id = req.body.time_control_id;
	const time_control_name = req.body.time_control_name;
	const result = req.body.result;

	debug(log_now(), `User '${this_username}' is trying to set the result of a challenge`);
	debug(log_now(), `    Challenge id: '${challenge_id}'`);
	debug(log_now(), `    White: '${white_username}'`);
	debug(log_now(), `    Black: '${black_username}'`);
	debug(log_now(), `    Time control id: '${time_control_id}'`);
	debug(log_now(), `    Time control name: '${time_control_name}'`);
	debug(log_now(), `    Result: '${result}'`);

	if (white_username == black_username) {
		res.send({
			'r' : '0',
			'reason' : 'White and Black cannot be the same players.'
		});
		return;
	}

	let _c = challenge_retrieve(challenge_id);
	if (_c == null) {
		res.send({
			'r' : '0',
			'reason' : 'Challenge does not exist'
		});
		return;
	}

	debug(log_now(), "Challenge exists");
	
	if (!user_exists(white_username)) {
		res.send({
			'r' : '0',
			'reason' : `White '${white_username}' does not exist.`
		});
		return;
	}
	if (!user_exists(black_username)) {
		res.send({
			'r' : '0',
			'reason' : `White '${black_username}' does not exist.`
		});
		return;
	}

	if (white_username != this_username && black_username != this_username) {
		debug(log_now(), `User '${this_username}' is trying to set the result of a challenge where he/she is not involved`);
		res.send({
			'r' : '0',
			'reason' : "You cannot set the result of this challenge"
		});
		return;
	}

	let c = _c as Challenge;

	if (c.get_result_set_by() != null) {
		debug(log_now(), `User '${this_username}' is trying to override the result of a challenge`);
		res.send({
			'r' : '0',
			'reason' : "The result of this challenge is already set."
		});
		return;
	}
	
	if (c.was_result_set()) {
		// result was set for the first time before
		challenge_set_result(
			c,
			this_username,
			c.get_when_result_set() as string,
			white_username,
			black_username,
			result,
			time_control_id,
			time_control_name
		);
	}
	else {
		// result is about to be set for the first time
		challenge_set_result(
			c,
			this_username,
			log_now(),
			white_username,
			black_username,
			result,
			time_control_id,
			time_control_name
		);
	}

	res.send({ 'r' : '1' });
}

export async function post_challenge_agree_result(req: any, res: any) {
	debug(log_now(), "POST challenge_agree_result...");

	const id = req.cookies.session_id;
	const this_username = req.cookies.user;

	let r = is_user_logged_in(id, this_username);
	if (!r[0]) {
		res.send(r[1]);
		return;
	}

	const challenge_id = req.body.challenge_id;
	let _c = challenge_retrieve(challenge_id);
	if (_c == null) {
		res.send({
			'r' : '0',
			'reason' : 'Challenge does not exist'
		});
		return;
	}

	challenge_agree_result(_c as Challenge);
	res.send({ 'r' : '1' });
}

export async function post_challenge_disagree_result(req: any, res: any) {
	debug(log_now(), "POST challenge_disagree_result...");

	const id = req.cookies.session_id;
	const this_username = req.cookies.user;

	let r = is_user_logged_in(id, this_username);
	if (!r[0]) {
		res.send(r[1]);
		return;
	}

	const challenge_id = req.body.challenge_id;
	let _c = challenge_retrieve(challenge_id);
	if (_c == null) {
		res.send({
			'r' : '0',
			'reason' : 'Challenge does not exist'
		});
		return;
	}

	challenge_unset_result(_c as Challenge);
	res.send({ 'r' : '1' });
}
