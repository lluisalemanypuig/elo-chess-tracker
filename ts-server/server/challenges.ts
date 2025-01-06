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

import fs from 'fs';
import path from 'path';
import Debug from 'debug';
const debug = Debug('ELO_TRACKER:server_challenges');

import { log_now, number_to_string } from '../utils/misc';
import { ServerChallenges } from './memory';
import { ServerEnvironment } from './environment';
import { Challenge } from '../models/challenge';
import { GameResult } from '../models/game';
import { game_new, game_add } from './game_history';

export function challenge_get_index(id: string): number {
	const mem = ServerChallenges.get_instance();
	for (let i = mem.num_challenges() - 1; i >= 0; --i) {
		if (mem.get_challenge(i).get_id() == id) {
			return i;
		}
	}
	return -1;
}

/// Return challenge with identifier 'id'
export function challenge_retrieve(id: string): Challenge | null {
	const idx = challenge_get_index(id);
	return idx != -1 ? ServerChallenges.get_instance().get_challenge(idx) : null;
}

/**
 * @brief Filters the set of challenges that are accepted by the filter function @e by.
 * @param by Function to filter. Returns true if a challenge is to be returned.
 * @returns A set of challenges according to function @e by.
 */
export function challenge_set_retrieve(
	by: Function = (_c: Challenge): boolean => {
		return true;
	}
): Challenge[] {
	let res: Challenge[] = [];
	const mem = ServerChallenges.get_instance();
	for (let i = 0; i < mem.num_challenges(); ++i) {
		const c = mem.get_challenge(i);
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
 * @returns The id of the challenge
 */
export function challenge_send_new(sender: string, receiver: string): Challenge {
	debug(log_now(), 'Adding a new challenge...');

	let mem = ServerChallenges.get_instance();
	const new_id: string = number_to_string(mem.new_challenge_id());

	const c = new Challenge(new_id, sender, receiver, log_now());

	mem.add_challenge(c);

	const challenge_dir = ServerEnvironment.get_instance().get_dir_challenges();
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
	debug(log_now(), `Accepting challenge '${c.get_id()}'`);

	c.set_challenge_accepted(log_now());

	const challenge_dir = ServerEnvironment.get_instance().get_dir_challenges();
	const challenge_file = path.join(challenge_dir, c.get_id());
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
	debug(log_now(), `Declining challenge '${c.get_id()}'`);

	const idx = challenge_get_index(c.get_id());
	ServerChallenges.get_instance().remove_challenge(idx);

	const challenge_dir = ServerEnvironment.get_instance().get_dir_challenges();
	const challenge_file = path.join(challenge_dir, c.get_id());
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
	when: string,
	white: string,
	black: string,
	result: GameResult,
	time_control_id: string,
	time_control_name: string
): void {
	debug(log_now(), `Set the result of the challenge '${c.get_id()}'`);

	c.set_result(by, when, white, black, result, time_control_id, time_control_name);

	const challenge_dir = ServerEnvironment.get_instance().get_dir_challenges();
	const challenge_file = path.join(challenge_dir, c.get_id());
	debug(log_now(), `    Writing challenge into file '${challenge_file}'`);
	fs.writeFileSync(challenge_file, JSON.stringify(c, null, 4));
}

/**
 * @brief Somebody accepts the result of the game
 * @param id Identifier string
 * @pre The accepter must be either a priviledged user or the receiver
 * of the challenge.
 */
export function challenge_agree_result(c: Challenge): void {
	debug(log_now(), `Agree to result of challenge '${c.get_id()}'...`);

	{
		const challenge_dir = ServerEnvironment.get_instance().get_dir_challenges();
		const challenge_file = path.join(challenge_dir, c.get_id());
		debug(log_now(), `    Removing challenge file '${challenge_file}'`);
		fs.unlinkSync(challenge_file);
	}

	const g = game_new(
		c.get_white() as string,
		c.get_black() as string,
		c.get_result() as GameResult,
		c.get_time_control_id() as string,
		c.get_time_control_name() as string,
		c.get_when_result_set() as string
	);

	debug(log_now(), `    Adding game...`);
	game_add(g);

	{
		debug(log_now(), `    Deleting the challenge from the memory...`);
		const index = challenge_get_index(c.get_id());
		ServerChallenges.get_instance().remove_challenge(index);
	}
}

/**
 * @brief Unsets the result of the challenge
 * @param c Challenge object
 * @param g The game encoding the result of the game. The players in the game contain
 * their rating as specified in the system at the conclusion of the game.
 */
export function challenge_unset_result(c: Challenge): void {
	debug(log_now(), `Disagree to the result of the challenge '${c.get_id()}'`);

	c.unset_result();

	const challenge_dir = ServerEnvironment.get_instance().get_dir_challenges();
	const challenge_file = path.join(challenge_dir, c.get_id());
	debug(log_now(), `    Writing challenge into file '${challenge_file}'`);
	fs.writeFileSync(challenge_file, JSON.stringify(c, null, 4));
}
