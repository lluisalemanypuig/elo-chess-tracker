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

import { DateStringLongMillis } from '../utils/time';
import { GameResult } from './game';
import { TimeControlID } from './time_control';

export type ChallengeID = string;

/**
 * @brief Class enconding a challenge
 *
 * A Challenge (from_Challenge) can challenge another Challenge (to_Challenge).
 */
export class Challenge {
	/// Identifier of this challenge
	private readonly id: ChallengeID;

	/// The Challenge sending the challenge
	private readonly sent_by: string;
	/// The Challenge receiving the challenge
	private readonly sent_to: string;
	/// Date when the challenge was sent
	private readonly when_challenge_sent: DateStringLongMillis;
	/// Time control of the challenge
	private readonly time_control_id: TimeControlID;
	/// Time control of the challenge
	private readonly time_control_name: string;

	/// Date when the challenge was accepted
	private when_challenge_accepted: DateStringLongMillis | undefined = undefined;

	/// Has the result been set at some point?
	private result_was_set: boolean = false;
	/// Date when the result of the game was last modified
	private when_result_set: DateStringLongMillis | undefined = undefined;
	/// Player who set the result
	private result_set_by: string | undefined = undefined;

	/// Date when the result of the game was accepted.
	private when_result_accepted: DateStringLongMillis | undefined = undefined;
	/// User that accepted the result
	private result_accepted_by: string | undefined = undefined;

	/// The resulting game of the challenge
	private white: string | undefined = undefined;
	private black: string | undefined = undefined;
	private result: GameResult | undefined = undefined;

	/**
	 * @brief Constructor
	 * @param id Challenge string id
	 * @param sent_by User issuing the challenge
	 * @param sent_to User receiving the challenge
	 * @param time_control_id Time control id of the game
	 * @param time_control_name Time control name of the game
	 * @param when_challenge_sent Date when the challenge was sent
	 */
	constructor(
		id: ChallengeID,
		sent_by: string,
		sent_to: string,
		time_control_id: TimeControlID,
		time_control_name: string,
		when_challenge_sent: DateStringLongMillis
	) {
		this.id = id;
		this.sent_by = sent_by;
		this.sent_to = sent_to;
		this.time_control_id = time_control_id;
		this.time_control_name = time_control_name;
		this.when_challenge_sent = when_challenge_sent;
	}

	/// Returns the id of the challenge
	get_id(): ChallengeID {
		return this.id;
	}

	/// Returns the username this challenge was sent by
	get_sent_by(): string {
		return this.sent_by;
	}
	/// Returns the username this challenge was sent to
	get_sent_to(): string {
		return this.sent_to;
	}

	/// Return the time when the challenge was sent
	get_when_challenge_sent(): string {
		return this.when_challenge_sent;
	}
	/// Return the time when the challenge was accepted
	get_when_challenge_accepted(): string | undefined {
		return this.when_challenge_accepted;
	}

	/// Return the time when the challenge was sent
	get_when_result_set(): DateStringLongMillis | undefined {
		return this.when_result_set;
	}
	/// Returns the username of the player who set the result
	get_result_set_by(): string | undefined {
		return this.result_set_by;
	}

	/// Return the time when the challenge was accepted
	get_when_result_accepted(): DateStringLongMillis | undefined {
		return this.when_result_accepted;
	}
	/// Returns the username of the player who set the result
	get_result_accepted_by(): string | undefined {
		return this.result_accepted_by;
	}

	/// White player
	get_white(): string | undefined {
		return this.white;
	}
	/// Black player
	get_black(): string | undefined {
		return this.black;
	}
	/// Result of the game
	get_result(): GameResult | undefined {
		return this.result;
	}
	/// Time control id of the game
	get_time_control_id(): TimeControlID {
		return this.time_control_id;
	}
	/// Time control name of the game
	get_time_control_name(): string | undefined {
		return this.time_control_name;
	}
	/// Sets the date when the challenge was accepted
	set_challenge_accepted(d: string): void {
		this.when_challenge_accepted = d;
	}

	/**
	 * @brief Sets the result of the challenge
	 * @pre 'by' is not undefined
	 */
	set_result(by: string, when: DateStringLongMillis, white: string, black: string, result: GameResult): void {
		if (!(by == white || by == black)) {
			throw new Error(`The setter (${by}) must be either white (${white}) or black (${black}).`);
		}
		if (!(white == this.sent_by || white == this.sent_to)) {
			throw new Error(
				`White (${white}) must be either the sender (${this.sent_by}) or the receiver (${this.sent_to}).`
			);
		}
		if (!(black == this.sent_by || black == this.sent_to)) {
			throw new Error(
				`Black (${black}) must be either the sender (${this.sent_by}) or the receiver (${this.sent_to}).`
			);
		}

		this.result_was_set = true;
		this.result_set_by = by;
		this.when_result_set = when;
		this.white = white;
		this.black = black;
		this.result = result;
	}

	/// Unset the previous result
	unset_result(): void {
		this.result_was_set = false;
		this.result_set_by = undefined;
		this.when_result_set = undefined;
		this.white = undefined;
		this.black = undefined;
		this.result = undefined;
	}

	/// Was the result set at some point?
	was_result_set(): boolean {
		return this.result_was_set;
	}

	/// Accepts the result
	set_result_accepted(by: string, d: string) {
		if (!this.was_result_set()) {
			throw new Error('Result must have been set previously');
		}
		if (by != undefined && by == this.result_set_by) {
			throw new Error('The accepter of the result cannot be the same person who set the result');
		}

		this.result_accepted_by = by;
		this.when_result_accepted = d;
	}
}
