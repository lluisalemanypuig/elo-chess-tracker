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
const debug = Debug('ELO_CHESS_TRACKER:server_query_challenges');
import { Request, Response } from 'express';

import { log_now } from '@server/utils/time';
import { is_user_logged_in } from '@server/managers/session';
import { User } from '@common/models/user';
import { challenge_set_retrieve } from '@server/managers/challenges';
import { Challenge } from '@common/models/challenge';
import { UsersManager } from '@server/managers/users_manager';
import { can_user_decline_challenge } from '@server/managers/user_relationships';
import { AuthenticationSchema } from '@common/schemas/authentication';
import { isDefined } from '@common/utils/is_defined';

/// Query the server for challenges received sento to me by other users
export async function get_query_challenge_received(req: Request, res: Response) {
	debug(log_now(), 'GET /query/challenge/received...');

	const session_parse = AuthenticationSchema.safeParse(req.cookies);
	if (!session_parse.success) {
		debug(log_now(), 'Failed to parse schema');
		debug(log_now(), `Error: '${session_parse.error}'`);
		res.status(401).send('Internal error');
		return;
	}
	const session = session_parse.data;
	const r = is_user_logged_in(session);

	const sent_to = r[2];
	if (!isDefined(sent_to)) {
		res.status(401).send(r[1]);
		return;
	}

	// challenges to be returned
	const to_return = challenge_set_retrieve((c: Challenge): boolean => {
		if (c.sent_to != session.username) {
			return false;
		}
		if (isDefined(c.when_challenge_accepted)) {
			return false;
		}
		return true;
	});

	let manager = UsersManager.get_instance();

	let all_challenges_received: any[] = [];
	for (const c of to_return) {
		const sent_by = manager.get_user_by_username(c.sent_by);
		if (!isDefined(sent_by)) {
			debug(log_now(), `User '${c.sent_by}' does not exist.`);
			res.status(500).send();
			return;
		}
		const name = sent_by.get_full_name();

		// return only basic information
		all_challenges_received.push({
			id: c.id,
			title: c.title,
			sent_by: name,
			sent_when: c.when_challenge_sent,
			time_control_name: c.time_control_name,
			can_be_declined: can_user_decline_challenge(sent_to, sent_by, c.time_control_id)
		});
	}

	debug(log_now(), `Found '${all_challenges_received.length}' challenges`);

	res.status(200).send(all_challenges_received);
}

/// Query the server for challenges sent to other users by me
export async function get_query_challenge_sent(req: Request, res: Response) {
	debug(log_now(), 'GET /query/challenge/sent...');

	const session_parse = AuthenticationSchema.safeParse(req.cookies);
	if (!session_parse.success) {
		debug(log_now(), 'Failed to parse schema');
		debug(log_now(), `Error: '${session_parse.error}'`);
		res.status(401).send('Internal error');
		return;
	}
	const session = session_parse.data;
	const r = is_user_logged_in(session);

	if (!isDefined(r[2])) {
		res.status(401).send(r[1]);
		return;
	}

	// challenges to be returned
	const to_return = challenge_set_retrieve((c: Challenge): boolean => {
		if (c.sent_by != session.username) {
			return false;
		}
		if (isDefined(c.when_challenge_accepted)) {
			return false;
		}
		return true;
	});

	let manager = UsersManager.get_instance();
	const sent_by = manager.get_user_by_username(session.username);
	if (!isDefined(sent_by)) {
		debug(log_now(), `User '${session.username}' does not exist.`);
		res.status(500).send();
		return;
	}

	let all_challenges: any[] = [];
	for (const c of to_return) {
		const sent_to = manager.get_user_by_username(c.sent_to);
		if (!isDefined(sent_to)) {
			debug(log_now(), `User '${c.sent_to}' does not exist.`);
			res.status(500).send();
			return;
		}

		// return only basic information
		all_challenges.push({
			id: c.id,
			title: c.title,
			sent_to: sent_to.get_full_name(),
			sent_when: c.when_challenge_sent,
			time_control_name: c.time_control_name,
			can_be_declined: can_user_decline_challenge(sent_to, sent_by, c.time_control_id)
		});
	}

	debug(log_now(), `Found '${all_challenges.length}' challenges`);

	res.status(200).send(all_challenges);
}

/// Query the server for accepted challenges whose result has not been set yet.
export async function get_query_challenge_pending_result(req: Request, res: Response) {
	debug(log_now(), 'GET /query/challenge/pending_result...');

	const session_parse = AuthenticationSchema.safeParse(req.cookies);
	if (!session_parse.success) {
		debug(log_now(), 'Failed to parse schema');
		debug(log_now(), `Error: '${session_parse.error}'`);
		res.status(401).send('Internal error');
		return;
	}
	const session = session_parse.data;
	const r = is_user_logged_in(session);

	if (!isDefined(r[2])) {
		res.status(401).send(r[1]);
		return;
	}

	// challenges to be returned
	const to_return = challenge_set_retrieve((c: Challenge): boolean => {
		// this user must be involved in the challenge
		if (c.sent_by != session.username && c.sent_to != session.username) {
			return false;
		}
		// must have been accepted
		if (!isDefined(c.when_challenge_accepted)) {
			return false;
		}
		// result can't have been set
		if (isDefined(c.result_set_by)) {
			return false;
		}
		return true;
	});

	let manager = UsersManager.get_instance();

	let all_challenges: any[] = [];
	for (const c of to_return) {
		const user_sent_to = manager.get_user_by_username(c.sent_to);
		if (!isDefined(user_sent_to)) {
			debug(log_now(), `User '${c.sent_to}' does not exist.`);
			res.status(500).send();
			return;
		}

		const user_sent_by = manager.get_user_by_username(c.sent_by);
		if (!isDefined(user_sent_by)) {
			debug(log_now(), `User '${c.sent_by}' does not exist.`);
			res.status(500).send();
			return;
		}

		const opponent: string = ((): string => {
			if (user_sent_by.username == session.username) {
				return user_sent_to.get_full_name();
			}
			return user_sent_by.get_full_name();
		})();

		// return only basic information
		all_challenges.push({
			id: c.id,
			title: c.title,
			sent_by_name: user_sent_by.get_full_name(),
			sent_by_username: user_sent_by.username,
			sent_to_name: user_sent_to.get_full_name(),
			sent_to_username: user_sent_to.username,
			opponent: opponent,
			sent_when: c.when_challenge_sent,
			time_control_name: c.time_control_name
		});
	}

	debug(log_now(), `Found '${all_challenges.length}' challenges`);

	res.status(200).send(all_challenges);
}

/// Query the server for accepted challenges whose result has been set by me
export async function get_query_challenge_confirm_result_other(req: Request, res: Response) {
	debug(log_now(), 'GET /query/challenge/confirm_result/other...');

	const session_parse = AuthenticationSchema.safeParse(req.cookies);
	if (!session_parse.success) {
		debug(log_now(), 'Failed to parse schema');
		debug(log_now(), `Error: '${session_parse.error}'`);
		res.status(401).send('Internal error');
		return;
	}
	const session = session_parse.data;
	const r = is_user_logged_in(session);

	if (!isDefined(r[2])) {
		res.status(401).send(r[1]);
		return;
	}

	// challenges to be returned
	const to_return = challenge_set_retrieve((c: Challenge): boolean => {
		// this user must be involved in the challenge
		if (c.sent_by != session.username && c.sent_to != session.username) {
			return false;
		}
		// must have been accepted
		if (!isDefined(c.when_challenge_accepted)) {
			return false;
		}
		// result already set
		if (!isDefined(c.result_set_by)) {
			return false;
		}
		// result should have been set by this user
		if (c.result_set_by != session.username) {
			return false;
		}
		return true;
	});

	let manager = UsersManager.get_instance();

	let all_challenges: any[] = [];
	for (const c of to_return) {
		const user_sent_to = manager.get_user_by_username(c.sent_to);
		if (!isDefined(user_sent_to)) {
			debug(log_now(), `User '${c.sent_to}' does not exist.`);
			res.status(500).send();
			return;
		}

		const user_sent_by = manager.get_user_by_username(c.sent_by);
		if (!isDefined(user_sent_by)) {
			debug(log_now(), `User '${c.sent_by}' does not exist.`);
			res.status(500).send();
			return;
		}

		const opponent: string = ((): string => {
			if (user_sent_by.username == session.username) {
				return user_sent_to.get_full_name();
			}
			return user_sent_by.get_full_name();
		})();

		const nice_result: string = ((): string => {
			if (c.result == 'white_wins') {
				return 'White wins';
			}
			if (c.result == 'black_wins') {
				return 'Black wins';
			}
			return 'Draw';
		})();

		// return only basic information
		all_challenges.push({
			id: c.id,
			title: c.title,
			opponent: opponent,
			sent_when: c.when_challenge_sent,
			white: (manager.get_user_by_username(c.white as string) as User).get_full_name(),
			black: (manager.get_user_by_username(c.black as string) as User).get_full_name(),
			result: nice_result,
			time_control: c.time_control_name
		});
	}

	debug(log_now(), `Found '${all_challenges.length}' challenges`);

	res.status(200).send(all_challenges);
}

/// Query the server for accepted challenges whose result has been set by my opponent
export async function get_query_challenge_confirm_result_self(req: Request, res: Response) {
	debug(log_now(), 'GET /query/challenge/confirm_result/self...');

	const session_parse = AuthenticationSchema.safeParse(req.cookies);
	if (!session_parse.success) {
		debug(log_now(), 'Failed to parse schema');
		debug(log_now(), `Error: '${session_parse.error}'`);
		res.status(401).send('Internal error');
		return;
	}
	const session = session_parse.data;
	const r = is_user_logged_in(session);

	if (!isDefined(r[2])) {
		res.status(401).send(r[1]);
		return;
	}

	// challenges to be returned
	const to_return = challenge_set_retrieve((c: Challenge): boolean => {
		// this user must be involved in the challenge
		if (c.sent_by != session.username && c.sent_to != session.username) {
			return false;
		}
		// must have been accepted
		if (!isDefined(c.when_challenge_accepted)) {
			return false;
		}
		// result already set by somebody
		if (!isDefined(c.result_set_by)) {
			return false;
		}
		// result should NOT have been set by this user
		if (c.result_set_by == session.username) {
			return false;
		}
		return true;
	});

	let manager = UsersManager.get_instance();

	let all_challenges: any[] = [];
	for (const c of to_return) {
		const user_sent_to = manager.get_user_by_username(c.sent_to);
		if (!isDefined(user_sent_to)) {
			debug(log_now(), `User '${c.sent_to}' does not exist.`);
			res.status(500).send();
			return;
		}

		const user_sent_by = manager.get_user_by_username(c.sent_by);
		if (!isDefined(user_sent_by)) {
			debug(log_now(), `User '${c.sent_by}' does not exist.`);
			res.status(500).send();
			return;
		}

		const opponent: string = ((): string => {
			if (user_sent_by.username == session.username) {
				return user_sent_to.get_full_name();
			}
			return user_sent_by.get_full_name();
		})();

		const nice_result: string = ((): string => {
			if (c.result == 'white_wins') {
				return 'White wins';
			}
			if (c.result == 'black_wins') {
				return 'Black wins';
			}
			return 'Draw';
		})();

		// return only basic information
		all_challenges.push({
			id: c.id,
			title: c.title,
			opponent: opponent,
			sent_when: c.when_challenge_sent,
			white: (manager.get_user_by_username(c.white as string) as User).get_full_name(),
			black: (manager.get_user_by_username(c.black as string) as User).get_full_name(),
			result: nice_result,
			time_control: c.time_control_name
		});
	}

	debug(log_now(), `Found '${all_challenges.length}' challenges`);

	res.status(200).send(all_challenges);
}
