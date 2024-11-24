/*
Elo rating for a Chess Club
Copyright (C) 2023 - 2024  Lluís Alemany Puig

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

import fs from 'fs';
import path from 'path';
import Debug from 'debug';
const debug = Debug('ELO_TRACKER:server_challenges');

import { log_now, number_to_string } from '../utils/misc';
import { ServerMemory } from './memory';
import { ServerEnvironment } from './environment';
import { Challenge } from '../models/challenge';
import { GameResult } from '../models/game';
import { game_new, game_add } from './game_history';
import { user_retrieve } from './users';
import { User } from '../models/user';
import { ADMIN, MEMBER, STUDENT, TEACHER } from '../models/user_role';
import { CHALLENGE_ADMIN, CHALLENGE_MEMBER, CHALLENGE_STUDENT, CHALLENGE_TEACHER } from '../models/user_action';

function challenge_get_index(id: string): number {
    let mem = ServerMemory.get_instance();
    for (let i = mem.num_challenges() - 1; i >= 0; --i) {
        if (mem.get_challenge(i).id == id) {
            return i;
        }
    }
    return -1;
}

export function challenge_can_user_send(_sender: string, _receiver: string): boolean {
    // retrieve both users
    const sender = user_retrieve(_sender) as User;
    const receiver = user_retrieve(_receiver) as User;

    if (receiver.is(ADMIN)) {
        return sender.can_do(CHALLENGE_ADMIN);
    }
    if (receiver.is(MEMBER)) {
        return sender.can_do(CHALLENGE_MEMBER);
    }
    if (receiver.is(STUDENT)) {
        return sender.can_do(CHALLENGE_STUDENT);
    }
    if (receiver.is(TEACHER)) {
        return sender.can_do(CHALLENGE_TEACHER);
    }

    debug(log_now(), `Receiver of challenge '${receiver}' does not seem to have a role...`);
    return false;
}

/// Return challenge with identifier 'id'
export function challenge_retrieve(id: string): Challenge | null {
    let mem = ServerMemory.get_instance();
    let idx = challenge_get_index(id);
    if (idx == -1) {
        return null;
    }
    return mem.get_challenge(idx);
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
    let mem = ServerMemory.get_instance();
    for (let i = 0; i < mem.num_challenges(); ++i) {
        let c = mem.get_challenge(i);
        if (by(c)) {
            res.push(c);
        }
    }
    return res;
}

/**
 * @brief Send a challenge from a user to another
 * @param u1 Username of sender
 * @param u2 Username of receiver
 * @returns The id of the challenge
 */
export function challenge_send_new(u1: string, u2: string): string {
    debug(log_now(), 'Adding a new challenge...');

    let mem = ServerMemory.get_instance();
    let new_id: string = '';
    if (mem.num_challenges() == 0) {
        new_id = number_to_string(1);
    } else {
        let last_id = mem.last_challenge().id;
        new_id = number_to_string(parseInt(last_id, 10) + 1);
    }

    let c = new Challenge(new_id, u1, u2, log_now());

    mem.add_challenge(c);

    let challenge_dir = ServerEnvironment.get_instance().get_dir_challenges();
    let challenge_file = path.join(challenge_dir, new_id);
    debug(log_now(), `    writing challenge into file '${challenge_file}'`);
    fs.writeFileSync(challenge_file, JSON.stringify(c, null, 4));

    return new_id;
}

/**
 * @brief Somebody accepts a challenge
 * @param c Challenge object
 * @pre The accepter must be either a priviledged user or the receiver
 * of the challenge.
 */
export function challenge_accept(c: Challenge): void {
    debug(log_now(), `Accepting challenge '${c.id}'`);

    c.set_challenge_accepted(log_now());

    let challenge_dir = ServerEnvironment.get_instance().get_dir_challenges();
    let challenge_file = path.join(challenge_dir, c.id);
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

    let idx = challenge_get_index(c.id);
    ServerMemory.get_instance().remove_challenge(idx);

    let challenge_dir = ServerEnvironment.get_instance().get_dir_challenges();
    let challenge_file = path.join(challenge_dir, c.id);
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
    debug(log_now(), `Set the result of the challenge '${c.id}'`);

    c.set_result(by, when, white, black, result, time_control_id, time_control_name);

    let challenge_dir = ServerEnvironment.get_instance().get_dir_challenges();
    let challenge_file = path.join(challenge_dir, c.id);
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
    debug(log_now(), `Agree to result of challenge '${c.id}'...`);

    {
        const challenge_dir = ServerEnvironment.get_instance().get_dir_challenges();
        const challenge_file = path.join(challenge_dir, c.id);
        debug(log_now(), `    Removing challenge file '${challenge_file}'`);
        fs.unlinkSync(challenge_file);
    }

    let g = game_new(
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
        const index = challenge_get_index(c.id);
        ServerMemory.get_instance().remove_challenge(index);
    }
}

/**
 * @brief Unsets the result of the challenge
 * @param c Challenge object
 * @param g The game encoding the result of the game. The players in the game contain
 * their rating as specified in the system at the conclusion of the game.
 */
export function challenge_unset_result(c: Challenge): void {
    debug(log_now(), `Disagree to the result of the challenge '${c.id}'`);

    c.unset_result();

    const challenge_dir = ServerEnvironment.get_instance().get_dir_challenges();
    const challenge_file = path.join(challenge_dir, c.id);
    debug(log_now(), `    Writing challenge into file '${challenge_file}'`);
    fs.writeFileSync(challenge_file, JSON.stringify(c, null, 4));
}
