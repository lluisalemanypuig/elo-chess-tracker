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

import { DateFull, log_now, dateSplitMajorMinor, toDateMinor } from '@common/utils/time';
import { ChallengesManager } from '@server/managers/challenges_manager';
import { EnvironmentManager } from '@server/managers/environment_manager';
import {
	Challenge,
	newChallenge,
	setResult,
	disagreeResult as disagreeResult,
	ChallengeAccept,
	accept,
	ChallengeDecline,
	ChallengeSetResult,
	ChallengeAgreeResult,
	agreeResult,
	ChallengeDisagreeResult,
	isPartOfChallenge
} from '@common/models/challenge';
import { game_add_new } from '@server/managers/games';
import { TimeControlId, TimeControlName } from '@common/models/time_control';
import { UsersManager } from '@server/managers/users_manager';
import { User } from '@common/models/user';
import { isNotDefined } from '@common/utils/is_defined';
import { PlayerPrivateId } from '@common/models/player';

/**
 * @brief Filters the set of challenges that are accepted by the filter function @e by.
 * @param by Function to filter. Returns true if a challenge is to be returned.
 * @returns an array of challenges according to function @e by.
 */
export function getChallengesBy(
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
export function challengeSendNew(
	title: string,
	sender: PlayerPrivateId,
	receiver: PlayerPrivateId,
	timeControlId: TimeControlId,
	timeControlName: TimeControlName,
	when: DateFull
): Challenge {
	debug(log_now(), 'Adding a new challenge...');

	if (receiver === sender) {
		debug(log_now(), `A challenge cannot be sent to oneself.`);
		throw new Error('You cannot challenge yourself.');
	}

	let mem = ChallengesManager.get_instance();
	const new_id = mem.new_challenge_id();

	const c = newChallenge(new_id, title, sender, receiver, timeControlId, timeControlName, when);

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
export function challengeAccept(c: Challenge, { by, when }: ChallengeAccept): void {
	debug(log_now(), `Accepting challenge '${c.id}'`);

	if (c.state !== 'PENDING_ACCEPT') {
		throw new Error(`The challenge cannot be accepted since its state is ${c.state}.`);
	}
	if (!isPartOfChallenge(c, by)) {
		debug(log_now(), `Player '${by}' is not part of this challenge.`);
		throw new Error(`You cannot disagree to this result.`);
	}
	if (by != c.sent_to) {
		throw new Error('You cannot accept this challenge');
	}

	accept(c, { by, when });

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
export function challengeDecline(c: Challenge, { by }: ChallengeDecline): void {
	debug(log_now(), `Declining challenge '${c.id}'`);

	if (c.state !== 'PENDING_ACCEPT') {
		throw new Error(`This challenge cannot be declined because its state is ${c.state}`);
	}
	if (!isPartOfChallenge(c, by)) {
		debug(log_now(), `Player '${by}' is not part of this challenge.`);
		throw new Error(`You cannot disagree to this result.`);
	}
	if (by != c.sent_to) {
		throw new Error('You cannot decline this challenge');
	}

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
export function challengeSetResult(c: Challenge, { by, when, white, black, result }: ChallengeSetResult): void {
	debug(log_now(), `Set the result of the challenge '${c.id}'`);

	if (c.state !== 'PENDING_RESULT') {
		throw new Error(`The result to the challenge cannot be set since its state is ${c.state}.`);
	}
	if (!isPartOfChallenge(c, by)) {
		debug(log_now(), `Player '${by}' is not part of this challenge.`);
		throw new Error(`You cannot disagree to this result.`);
	}
	const original_setter = c.result_set_by;
	if (original_setter != undefined && original_setter != by) {
		debug(
			log_now(),
			`User '${by}' is trying to override the result of challenge '${c.id}' which was set by '${original_setter} on '${c.when_result_set}'`
		);
		throw new Error('The result of this challenge has to be set by the original setter, which you are not.');
	}

	if (white === black) {
		debug(log_now(), `White '${white}' and Black '${black}' cannot be the same player.`);
		throw new Error('White and Black cannot be the same players.');
	}
	if (white != c.sent_by && white != c.sent_to) {
		debug(log_now(), `White '${white}' is not part of challenge '${c.id}'.`);
		throw new Error(`Wrong player data.`);
	}
	if (black != c.sent_by && black != c.sent_to) {
		debug(log_now(), `Black '${black}' is not part of challenge '${c.id}'.`);
		throw new Error(`Wrong player data.`);
	}

	setResult(c, { by, when, white, black, result });

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
export function challengeAgreeResult(c: Challenge, { by, when }: ChallengeAgreeResult): void {
	debug(log_now(), `Agree to result of challenge '${c.id}'...`);

	if (c.state !== 'PENDING_RESULT_AGREE') {
		throw new Error(`The result to the challenge cannot be agreed to since its state is ${c.state}.`);
	}
	if (!isPartOfChallenge(c, by)) {
		debug(log_now(), `Player '${by}' is not part of this challenge.`);
		throw new Error(`You cannot disagree to this result.`);
	}
	if (isNotDefined(c.when_result_set)) {
		debug(log_now(), `Date 'when_result_set' is not defined`);
		return;
	}
	if (isNotDefined(c.white) || isNotDefined(c.black)) {
		debug(log_now(), `Player 'white' or 'black' is not defined.`);
		debug(log_now(), `    White: '${c.white}'.`);
		debug(log_now(), `    Black: '${c.black}'.`);
		return;
	}
	if (isNotDefined(c.result)) {
		debug(log_now(), `Result is not set.`);
		return;
	}
	if (isNotDefined(c.result)) {
		debug(log_now(), `Result is not set.`);
		return;
	}
	if (by === c.result_set_by) {
		throw new Error('The accepter of the result cannot be the same person who set the result');
	}

	agreeResult(c, { by, when });

	{
		const challenge_dir = EnvironmentManager.get_instance().get_dir_challenges();
		const challenge_file = path.join(challenge_dir, c.id);
		debug(log_now(), `    Removing challenge file '${challenge_file}'`);
		fs.unlinkSync(challenge_file);
	}

	debug(log_now(), `Adding game...`);
	const split = dateSplitMajorMinor(c.when_result_set);

	const mem = UsersManager.get_instance();
	const white = mem.get_user_by_username(c.white) as User;
	const black = mem.get_user_by_username(c.black) as User;

	const rand_milli = `${Math.floor(Math.random() * 999)}`;
	const date = toDateMinor(
		split[1] + ':' + (rand_milli.length == 1 ? '00' : rand_milli.length == 2 ? '0' : '') + rand_milli
	);
	game_add_new(c.title, white, black, c.result, c.time_control_id, c.time_control_name, split[0], date);

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
export function challengeDisagreeResult(c: Challenge, { by }: ChallengeDisagreeResult): void {
	debug(log_now(), `Disagree to the result of the challenge '${c.id}'`);

	if (c.state !== 'PENDING_RESULT_AGREE') {
		throw new Error(`Challenge's result cannot be disagreed to since its state is ${c.state}`);
	}
	if (!isPartOfChallenge(c, by)) {
		debug(log_now(), `Player '${by}' is not part of this challenge.`);
		throw new Error(`You cannot disagree to this result.`);
	}
	if (c.result_set_by === by) {
		debug(log_now(), `Player '${by}' set the result of the challenge and cannot disagree to it.`);
		throw new Error(`You cannot disagree to this result.`);
	}

	disagreeResult(c);

	const challenge_dir = EnvironmentManager.get_instance().get_dir_challenges();
	const challenge_file = path.join(challenge_dir, c.id);
	debug(log_now(), `    Writing challenge into file '${challenge_file}'`);
	fs.writeFileSync(challenge_file, JSON.stringify(c, null, 4));
}
