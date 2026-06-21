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

import { DateStringLong, log_now, long_date_to_short_and_tiny_date } from '@server/utils/time';
import { ChallengesManager } from '@server/managers/challenges_manager';
import { EnvironmentManager } from '@server/managers/environment_manager';
import { Challenge, new_challenge, set_result, unset_result } from '@common/models/challenge';
import { GameResult } from '@common/models/game';
import { game_add_new } from '@server/managers/games';
import { TimeControlID } from '@common/models/time_control';
import { UsersManager } from '@server/managers/users_manager';
import { User } from '@common/models/user';
import { isDefined } from '@common/utils/is_defined';

/**
 * @brief Filters the set of challenges that are accepted by the filter function @e by.
 * @param by Function to filter. Returns true if a challenge is to be returned.
 * @returns an array of challenges according to function @e by.
 */
export function challenge_set_retrieve(
	by: Function = (_c: Challenge): boolean => {
		return true;
	}
): Challenge[] {
	let res: Challenge[] = [];
	const mem = ChallengesManager.get_instance();
	for (let i = 0; i < mem.num_challenges(); ++i) {
		const c = mem.get_challenge_at(i) as Challenge;
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
export function challenge_send_new(
	title: string,
	sender: string,
	receiver: string,
	time_control_id: TimeControlID,
	time_control_name: string,
	when: DateStringLong
): Challenge {
	debug(log_now(), 'Adding a new challenge...');

	let mem = ChallengesManager.get_instance();
	const new_id: string = mem.new_challenge_id();

	const c = new_challenge(new_id, title, sender, receiver, time_control_id, time_control_name, when);

	mem.add_challenge(c);

	const challenge_dir = EnvironmentManager.get_instance().get_dir_challenges();
	const challenge_file = path.join(challenge_dir, new_id);
	debug(log_now(), `    writing challenge into file '${challenge_file}'`);
	fs.writeFileSync(challenge_file, JSON.stringify(c, null, 4));

	return c;
}

/**
 * @brief Somebody accepts a challenge
 * @param c Challenge object
 * @pre The accepter must be either a priviledged user or the receiver
 * of the challenge.
 */
export function challenge_accept(c: Challenge): void {
	debug(log_now(), `Accepting challenge '${c.id}'`);

	c.when_challenge_accepted = log_now();

	const challenge_dir = EnvironmentManager.get_instance().get_dir_challenges();
	const challenge_file = path.join(challenge_dir, c.id);
	debug(log_now(), `    Writing challenge into file '${challenge_file}'`);
	fs.writeFileSync(challenge_file, JSON.stringify(c, null, 4));
}

/**
 * @brief Declines the challenge passed as parameter
 * @param c Challenge object
 * @pre The 'decliner' must be either a priviledged user or the receiver
 * of the challenge.
 */
export function challenge_decline(c: Challenge): void {
	debug(log_now(), `Declining challenge '${c.id}'`);

	ChallengesManager.get_instance().remove_challenge(c);

	const challenge_dir = EnvironmentManager.get_instance().get_dir_challenges();
	const challenge_file = path.join(challenge_dir, c.id);
	debug(log_now(), `    Deleting file '${challenge_file}'`);
	fs.unlinkSync(challenge_file);
}

/**
 * @brief Set the result of the challenge
 * @param c Challenge object
 * @param g The game encoding the result of the game. The players in the game contain
 * their rating as specified in the system at the conclusion of the game.
 */
export function challenge_set_result(
	c: Challenge,
	by: string,
	when: DateStringLong,
	white: string,
	black: string,
	result: GameResult
): void {
	debug(log_now(), `Set the result of the challenge '${c.id}'`);

	set_result(c, { by, when, white, black, result });

	const challenge_dir = EnvironmentManager.get_instance().get_dir_challenges();
	const challenge_file = path.join(challenge_dir, c.id);
	debug(log_now(), `    Writing challenge into file '${challenge_file}'`);
	fs.writeFileSync(challenge_file, JSON.stringify(c, null, 4));
}

/**
 * @brief Somebody accepts the result of the game
 * @param id Identifier string
 * @pre The accepter must be the receiver of the challenge.
 */
export function challenge_agree_result(c: Challenge): void {
	debug(log_now(), `Agree to result of challenge '${c.id}'...`);

	if (!isDefined(c.when_result_set)) {
		debug(log_now(), `Date 'when_result_set' is not defined`);
		return;
	}
	if (!isDefined(c.white) || !isDefined(c.black)) {
		debug(log_now(), `Player 'white' or 'black' is not defined.`);
		debug(log_now(), `    White: '${c.white}'.`);
		debug(log_now(), `    Black: '${c.black}'.`);
		return;
	}
	if (!isDefined(c.result) || !c.result_was_set) {
		debug(log_now(), `Result is not set.`);
		return;
	}
	if (!isDefined(c.result) || !c.result_was_set) {
		debug(log_now(), `Result is not set.`);
		return;
	}

	{
		const challenge_dir = EnvironmentManager.get_instance().get_dir_challenges();
		const challenge_file = path.join(challenge_dir, c.id);
		debug(log_now(), `    Removing challenge file '${challenge_file}'`);
		fs.unlinkSync(challenge_file);
	}

	debug(log_now(), `Adding game...`);
	const split = long_date_to_short_and_tiny_date(c.when_result_set);

	const mem = UsersManager.get_instance();
	const white = mem.get_user_by_username(c.white) as User;
	const black = mem.get_user_by_username(c.black) as User;

	const rand_milli = `${Math.floor(Math.random() * 999)}`;
	game_add_new(
		c.title,
		white,
		black,
		c.result,
		c.time_control_id,
		c.time_control_name,
		split[0],
		split[1] + ':' + (rand_milli.length == 1 ? '00' : rand_milli.length == 2 ? '0' : '') + rand_milli
	);

	{
		debug(log_now(), `    Deleting the challenge from the memory...`);
		ChallengesManager.get_instance().remove_challenge(c);
	}
}

/**
 * @brief Unsets the result of the challenge
 * @param c Challenge object
 * @param g The game encoding the result of the game. The players in the game
 * contain their rating as specified in the system at the conclusion of the game.
 */
export function challenge_unset_result(c: Challenge): void {
	debug(log_now(), `Disagree to the result of the challenge '${c.id}'`);

	unset_result(c);

	const challenge_dir = EnvironmentManager.get_instance().get_dir_challenges();
	const challenge_file = path.join(challenge_dir, c.id);
	debug(log_now(), `    Writing challenge into file '${challenge_file}'`);
	fs.writeFileSync(challenge_file, JSON.stringify(c, null, 4));
}
