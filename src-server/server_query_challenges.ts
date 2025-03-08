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
const debug = Debug('ELO_TRACKER:server_query_challenges');

import { log_now } from './utils/time';
import { is_user_logged_in } from './managers/session';
import { user_retrieve } from './managers/users';
import { User } from './models/user';
import { challenge_set_retrieve } from './managers/challenges';
import { Challenge } from './models/challenge';
import { SessionID } from './models/session_id';

/// Query the server for challenges received sento to me by other users
export async function get_query_challenge_received(req: any, res: any) {
	debug(log_now(), 'GET /query/challenge/received...');

	const session = SessionID.from_cookie(req.cookies);
	const r = is_user_logged_in(session);

	if (!r[0]) {
		res.send({ r: '0', reason: r[1] });
		return;
	}

	// challenges to be returned
	const to_return = challenge_set_retrieve((c: Challenge): boolean => {
		if (c.get_sent_to() != session.username) {
			return false;
		}
		if (c.get_when_challenge_accepted() != undefined) {
			return false;
		}
		return true;
	});

	let all_challenges_received: any[] = [];
	for (let i = 0; i < to_return.length; ++i) {
		const c = to_return[i];
		const sent_by = (user_retrieve(c.get_sent_by() as string) as User).get_full_name();

		// return only basic information
		all_challenges_received.push({
			id: c.get_id(),
			sent_by: sent_by,
			sent_when: c.get_when_challenge_sent()
		});
	}

	debug(log_now(), `Found '${all_challenges_received.length}' challenges`);

	res.send({ r: '1', c: all_challenges_received });
}

/// Query the server for challenges sent to other users by me
export async function get_query_challenge_sent(req: any, res: any) {
	debug(log_now(), 'GET /query/challenge/sent...');

	const session = SessionID.from_cookie(req.cookies);
	const r = is_user_logged_in(session);

	if (!r[0]) {
		res.send({ r: '0', reason: r[1] });
		return;
	}

	// challenges to be returned
	const to_return = challenge_set_retrieve((c: Challenge): boolean => {
		if (c.get_sent_by() != session.username) {
			return false;
		}
		if (c.get_when_challenge_accepted() != undefined) {
			return false;
		}
		return true;
	});

	let all_challenges: any[] = [];
	for (let i = 0; i < to_return.length; ++i) {
		const c = to_return[i];

		// return only basic information
		all_challenges.push({
			id: c.get_id(),
			sent_to: (user_retrieve(c.get_sent_to() as string) as User).get_full_name(),
			sent_when: c.get_when_challenge_sent()
		});
	}

	debug(log_now(), `Found '${all_challenges.length}' challenges`);

	res.send({ r: '1', c: all_challenges });
}

/// Query the server for accepted challenges whose result has not been set yet.
export async function get_query_challenge_pending_result(req: any, res: any) {
	debug(log_now(), 'GET /query/challenge/pending_result...');

	const session = SessionID.from_cookie(req.cookies);
	const r = is_user_logged_in(session);

	if (!r[0]) {
		res.send({ r: '0', reason: r[1] });
		return;
	}

	// challenges to be returned
	const to_return = challenge_set_retrieve((c: Challenge): boolean => {
		// this user must be involved in the challenge
		if (c.get_sent_by() != session.username && c.get_sent_to() != session.username) {
			return false;
		}
		// must have been accepted
		if (c.get_when_challenge_accepted() == undefined) {
			return false;
		}
		// result can't have been set
		if (c.get_result_set_by() != undefined) {
			return false;
		}
		return true;
	});

	let all_challenges: any[] = [];
	for (let i = 0; i < to_return.length; ++i) {
		const c = to_return[i];
		const user_sent_to = user_retrieve(c.get_sent_to()) as User;
		const user_sent_by = user_retrieve(c.get_sent_by()) as User;

		const opponent: string = ((): string => {
			if (user_sent_by.get_username() == session.username) {
				return user_sent_to.get_full_name();
			}
			return user_sent_by.get_full_name();
		})();

		// return only basic information
		all_challenges.push({
			id: c.get_id(),
			sent_by_name: user_sent_by.get_full_name(),
			sent_by_username: user_sent_by.get_username(),
			sent_to_name: user_sent_to.get_full_name(),
			sent_to_username: user_sent_to.get_username(),
			opponent: opponent,
			sent_when: c.get_when_challenge_sent()
		});
	}

	debug(log_now(), `Found '${all_challenges.length}' challenges`);

	res.send({ r: '1', c: all_challenges });
}

/// Query the server for accepted challenges whose result has been set by me
export async function get_query_challenge_confirm_result_other(req: any, res: any) {
	debug(log_now(), 'GET /query/challenge/confirm_result/other...');

	const session = SessionID.from_cookie(req.cookies);
	const r = is_user_logged_in(session);

	if (!r[0]) {
		res.send({ r: '0', reason: r[1] });
		return;
	}

	// challenges to be returned
	const to_return = challenge_set_retrieve((c: Challenge): boolean => {
		// this user must be involved in the challenge
		if (c.get_sent_by() != session.username && c.get_sent_to() != session.username) {
			return false;
		}
		// must have been accepted
		if (c.get_when_challenge_accepted() == undefined) {
			return false;
		}
		// result already set
		if (c.get_result_set_by() == undefined) {
			return false;
		}
		// result should have been set by this user
		if (c.get_result_set_by() != session.username) {
			return false;
		}
		return true;
	});

	let all_challenges: any[] = [];
	for (let i = 0; i < to_return.length; ++i) {
		const c = to_return[i];
		const user_sent_to = user_retrieve(c.get_sent_to()) as User;
		const user_sent_by = user_retrieve(c.get_sent_by()) as User;

		const opponent: string = ((): string => {
			if (user_sent_by.get_username() == session.username) {
				return user_sent_to.get_full_name();
			}
			return user_sent_by.get_full_name();
		})();

		const nice_result: string = ((): string => {
			if (c.get_result() == 'white_wins') {
				return 'White wins';
			}
			if (c.get_result() == 'black_wins') {
				return 'Black wins';
			}
			return 'Draw';
		})();

		// return only basic information
		all_challenges.push({
			id: c.get_id(),
			opponent: opponent,
			sent_when: c.get_when_challenge_sent(),
			white: (user_retrieve(c.get_white() as string) as User).get_full_name(),
			black: (user_retrieve(c.get_black() as string) as User).get_full_name(),
			result: nice_result,
			time_control: c.get_time_control_name()
		});
	}

	debug(log_now(), `Found '${all_challenges.length}' challenges`);

	res.send({ r: '1', c: all_challenges });
}

/// Query the server for accepted challenges whose result has been set by my opponent
export async function get_query_challenge_confirm_result_self(req: any, res: any) {
	debug(log_now(), 'GET /query/challenge/confirm_result/self...');

	const session = SessionID.from_cookie(req.cookies);
	const r = is_user_logged_in(session);

	if (!r[0]) {
		res.send({ r: '0', reason: r[1] });
		return;
	}

	// challenges to be returned
	const to_return = challenge_set_retrieve((c: Challenge): boolean => {
		// this user must be involved in the challenge
		if (c.get_sent_by() != session.username && c.get_sent_to() != session.username) {
			return false;
		}
		// must have been accepted
		if (c.get_when_challenge_accepted() == undefined) {
			return false;
		}
		// result already set by somebody
		if (c.get_result_set_by() == undefined) {
			return false;
		}
		// result should NOT have been set by this user
		if (c.get_result_set_by() == session.username) {
			return false;
		}
		return true;
	});

	let all_challenges: any[] = [];
	for (let i = 0; i < to_return.length; ++i) {
		const c = to_return[i];
		const user_sent_to = user_retrieve(c.get_sent_to()) as User;
		const user_sent_by = user_retrieve(c.get_sent_by()) as User;

		const opponent: string = ((): string => {
			if (user_sent_by.get_username() == session.username) {
				return user_sent_to.get_full_name();
			}
			return user_sent_by.get_full_name();
		})();

		const nice_result: string = ((): string => {
			if (c.get_result() == 'white_wins') {
				return 'White wins';
			}
			if (c.get_result() == 'black_wins') {
				return 'Black wins';
			}
			return 'Draw';
		})();

		// return only basic information
		all_challenges.push({
			id: c.get_id(),
			opponent: opponent,
			sent_when: c.get_when_challenge_sent(),
			white: (user_retrieve(c.get_white() as string) as User).get_full_name(),
			black: (user_retrieve(c.get_black() as string) as User).get_full_name(),
			result: nice_result,
			time_control: c.get_time_control_name()
		});
	}

	debug(log_now(), `Found '${all_challenges.length}' challenges`);

	res.send({ r: '1', c: all_challenges });
}
