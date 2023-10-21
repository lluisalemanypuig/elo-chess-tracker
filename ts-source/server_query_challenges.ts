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
const debug = Debug('ELO_TRACKER:server_query_challenges');

import { log_now } from './utils/misc';
import { is_user_logged_in } from './server/session';
import { user_retrieve } from './server/users';
import { User } from './models/user';
import { challenge_set_retrieve } from './server/challenges';
import { Challenge } from './models/challenge';

/// Query the server for challenges sent by me
export async function get_challenges_received(req: any, res: any) {
	debug(log_now(), "GET query_challenges_received...");

	const session_id = req.cookies.session_id;
	const username = req.cookies.user;

	let r = is_user_logged_in(session_id, username);
	if (!r[0]) {
		res.send({ 'r': '0', 'reason': r[1] });
		return;
	}

	// challenges to be returned
	const to_return = challenge_set_retrieve(
		(c: Challenge): boolean => {
			if (c.get_sent_to() != username) { return false; }
			if (c.get_when_challenge_accepted() != null) { return false; }
			return true;
		}
	);

	let all_challenges_received: any[] = [];
	for (let i = 0; i < to_return.length; ++i) {
		let c = to_return[i];
		let sent_by = (user_retrieve(c.get_sent_by() as string) as User).get_full_name();

		// return only basic information
		all_challenges_received.push({
			'id' : c.id,
			'sent_by' : sent_by,
			'sent_when' : c.get_when_challenge_sent()
		});
	}

	debug(log_now(), `Found '${all_challenges_received.length}' challenges`);

	res.send({'r': '1', 'c': all_challenges_received});
}

/// Query the server for challenges sent to me
export async function get_challenges_sent(req: any, res: any) {
	debug(log_now(), "GET query_challenges_sent...");

	const session_id = req.cookies.session_id;
	const username = req.cookies.user;

	let r = is_user_logged_in(session_id, username);
	if (!r[0]) {
		res.send({ 'r': '0', 'reason': r[1] });
		return;
	}

	// challenges to be returned
	const to_return = challenge_set_retrieve(
		(c: Challenge): boolean => {
			if (c.get_sent_by() != username) { return false; }
			if (c.get_when_challenge_accepted() != null) { return false; }
			return true;
		}
	);

	let all_challenges: any[] = [];
	for (let i = 0; i < to_return.length; ++i) {
		let c = to_return[i];
		let sent_to = (user_retrieve(c.get_sent_to() as string) as User).get_full_name();

		// return only basic information
		all_challenges.push({
			'id' : c.id,
			'sent_to' : sent_to,
			'sent_when' : c.get_when_challenge_sent()
		});
	}

	debug(log_now(), `Found '${all_challenges.length}' challenges`);

	res.send({'r': '1', 'c': all_challenges});
}

/// Query the server for accepted challenges whose result has not been set yet.
export async function get_challenges_pending_set_result(req: any, res: any) {
	debug(log_now(), "GET query_challenges_pending_set_result...");

	const session_id = req.cookies.session_id;
	const username = req.cookies.user;

	let r = is_user_logged_in(session_id, username);
	if (!r[0]) {
		res.send({ 'r': '0', 'reason': r[1] });
		return;
	}

	// challenges to be returned
	const to_return = challenge_set_retrieve(
		(c: Challenge): boolean => {
			// this user must be involved in the challenge
			if (c.get_sent_by() != username && c.get_sent_to() != username) { return false; }
			// must have been accepted
			if (c.get_when_challenge_accepted() == null) { return false; }
			// result can't have been set
			if (c.get_result_set_by() != null) { return false; }
			return true;
		}
	);

	let all_challenges: any[] = [];
	for (let i = 0; i < to_return.length; ++i) {
		let c = to_return[i];
		let user_sent_to = user_retrieve(c.get_sent_to()) as User;
		let user_sent_by = user_retrieve(c.get_sent_by()) as User;
		
		let opponent: string;
		if (user_sent_by.get_username() == username) {
			opponent = user_sent_to.get_full_name();
		}
		else {
			opponent = user_sent_by.get_full_name();
		}

		// return only basic information
		all_challenges.push({
			'id' : c.id,
			'sent_by_name' : user_sent_by.get_full_name(),
			'sent_by_username' : user_sent_by.get_username(),
			'sent_to_name' : user_sent_to.get_full_name(),
			'sent_to_username' : user_sent_to.get_username(),
			'opponent' : opponent,
			'sent_when' : c.get_when_challenge_sent()
		});
	}

	debug(log_now(), `Found '${all_challenges.length}' challenges`);

	res.send({'r': '1', 'c': all_challenges});
}

/// Query the server for accepted challenges whose result has been set by me
export async function get_challenges_result_set_by_me(req: any, res: any) {
	debug(log_now(), "GET query_challenges_result_set_by_me...");

	const session_id = req.cookies.session_id;
	const username = req.cookies.user;

	let r = is_user_logged_in(session_id, username);
	if (!r[0]) {
		res.send({ 'r': '0', 'reason': r[1] });
		return;
	}

	// challenges to be returned
	const to_return = challenge_set_retrieve(
		(c: Challenge): boolean => {
			// this user must be involved in the challenge
			if (c.get_sent_by() != username && c.get_sent_to() != username) { return false; }
			// must have been accepted
			if (c.get_when_challenge_accepted() == null) { return false; }
			// result already set
			if (c.get_result_set_by() == null) { return false; }
			// result should have been set by this user
			if (c.get_result_set_by() != username) { return false; }
			return true;
		}
	);

	let all_challenges: any[] = [];
	for (let i = 0; i < to_return.length; ++i) {
		let c = to_return[i];
		let user_sent_to = user_retrieve(c.get_sent_to()) as User;
		let user_sent_by = user_retrieve(c.get_sent_by()) as User;
		
		let opponent: string;
		if (user_sent_by.get_username() == username) {
			opponent = user_sent_to.get_full_name();
		}
		else {
			opponent = user_sent_by.get_full_name();
		}

		let nice_result: string;
		if (c.get_result() == "white_wins") { nice_result = "White wins"; }
		else if (c.get_result() == "black_wins") { nice_result = "Black wins"; }
		else { nice_result = "Draw"; }

		// return only basic information
		all_challenges.push({
			'id' : c.id,
			'opponent' : opponent,
			'sent_when' : c.get_when_challenge_sent(),
			'white' : (user_retrieve(c.get_white() as string) as User).get_full_name(),
			'black' : (user_retrieve(c.get_black() as string) as User).get_full_name(),
			'result' : nice_result,
			'time_control' : c.get_time_control_name()
		});
	}

	debug(log_now(), `Found '${all_challenges.length}' challenges`);

	res.send({'r': '1', 'c': all_challenges});
}

/// Query the server for accepted challenges whose result has been set by my opponent
export async function get_challenges_result_set_by_opponent(req: any, res: any) {
	debug(log_now(), "GET query_challenges_result_set_by_opponent...");

	const session_id = req.cookies.session_id;
	const username = req.cookies.user;

	let r = is_user_logged_in(session_id, username);
	if (!r[0]) {
		res.send({ 'r': '0', 'reason': r[1] });
		return;
	}

	// challenges to be returned
	const to_return = challenge_set_retrieve(
		(c: Challenge): boolean => {
			// this user must be involved in the challenge
			if (c.get_sent_by() != username && c.get_sent_to() != username) { return false; }
			// must have been accepted
			if (c.get_when_challenge_accepted() == null) { return false; }
			// result already set by somebody
			if (c.get_result_set_by() == null) { return false; }
			// result should NOT have been set by this user
			if (c.get_result_set_by() == username) { return false; }
			return true;
		}
	);

	let all_challenges: any[] = [];
	for (let i = 0; i < to_return.length; ++i) {
		let c = to_return[i];
		let user_sent_to = user_retrieve(c.get_sent_to()) as User;
		let user_sent_by = user_retrieve(c.get_sent_by()) as User;
		
		let opponent: string;
		if (user_sent_by.get_username() == username) {
			opponent = user_sent_to.get_full_name();
		}
		else {
			opponent = user_sent_by.get_full_name();
		}

		let nice_result: string;
		if (c.get_result() == "white_wins") { nice_result = "White wins"; }
		else if (c.get_result() == "black_wins") { nice_result = "Black wins"; }
		else { nice_result = "Draw"; }

		// return only basic information
		all_challenges.push({
			'id' : c.id,
			'opponent' : opponent,
			'sent_when' : c.get_when_challenge_sent(),
			'white' : (user_retrieve(c.get_white() as string) as User).get_full_name(),
			'black' : (user_retrieve(c.get_black() as string) as User).get_full_name(),
			'result' : nice_result,
			'time_control' : c.get_time_control_name()
		});
	}

	debug(log_now(), `Found '${all_challenges.length}' challenges`);

	res.send({'r': '1', 'c': all_challenges});
}
