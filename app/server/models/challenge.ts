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

import { z } from 'zod';
import { DateStringLongMillis } from '@server/utils/time';
import { GameResult, GameResultSchema } from './game';
import { TimeControlID } from './time_control';

export type ChallengeID = string;

export const ChallengeSchema = z
	.object({
		id: z.string() as z.ZodType<ChallengeID>,
		/// Name of the game that will result from this challenge
		title: z.string(),
		/// The user sending the challenge
		sent_by: z.string(),
		/// The user receiving the challenge
		sent_to: z.string(),
		/// Time control of the challenge
		time_control_id: z.string() as z.ZodType<TimeControlID>,
		/// Time control of the challenge
		time_control_name: z.string(),
		/// Date when the challenge was sent
		when_challenge_sent: z.string() as z.ZodType<DateStringLongMillis>,
		/// Date when the challenge was accepted
		when_challenge_accepted: z.string().optional() as z.ZodType<DateStringLongMillis | undefined>,

		/// Has the result been set at some point?
		result_was_set: z.boolean().default(false),
		/// Date when the result of the game was last modified
		when_result_set: z.string().optional() as z.ZodType<DateStringLongMillis | undefined>,
		/// Player who set the result
		result_set_by: z.string().optional(),

		/// Date when the result of the game was accepted.
		when_result_accepted: z.string().optional() as z.ZodType<DateStringLongMillis | undefined>,
		/// User that accepted the result
		result_accepted_by: z.string().optional(),

		/// The resulting game of the challenge
		white: z.string().optional(),
		black: z.string().optional(),
		result: GameResultSchema.optional()
	})
	.strict();

/**
 * @brief Class enconding a challenge
 *
 * A user can challenge another user.
 */
export type Challenge = z.infer<typeof ChallengeSchema>;

export const ChallengeArraySchema = z.array(ChallengeSchema);

export type ChallengeArray = z.infer<typeof ChallengeArraySchema>;

export function new_challenge(
	id: string,
	title: string,
	sent_by: string,
	sent_to: string,
	time_control_id: TimeControlID,
	time_control_name: string,
	when_challenge_sent: DateStringLongMillis
): Challenge {
	return {
		id: id,
		title: title,
		sent_by: sent_by,
		sent_to: sent_to,
		time_control_id: time_control_id,
		time_control_name: time_control_name,
		when_challenge_sent: when_challenge_sent,
		when_challenge_accepted: undefined,
		result_was_set: false,
		when_result_set: undefined,
		result_set_by: undefined,
		when_result_accepted: undefined,
		result_accepted_by: undefined,
		white: undefined,
		black: undefined,
		result: undefined
	};
}

interface Result {
	by: string;
	when: DateStringLongMillis;
	white: string;
	black: string;
	result: GameResult;
}

/// Set the result of a challenge. Checks integrity of input parameters.s
export function set_result(c: Challenge, { by, when, white, black, result }: Result): void {
	if (!(by === white || by === black)) {
		throw new Error(`The setter (${by}) must be either white (${white}) or black (${black}).`);
	}
	if (!(white === c.sent_by || white === c.sent_to)) {
		throw new Error(`White (${white}) must be either the sender (${c.sent_by}) or the receiver (${c.sent_to}).`);
	}
	if (!(black === c.sent_by || black === c.sent_to)) {
		throw new Error(`Black (${black}) must be either the sender (${c.sent_by}) or the receiver (${c.sent_to}).`);
	}

	c.result_was_set = true;
	c.result_set_by = by;
	c.when_result_set = when;
	c.white = white;
	c.black = black;
	c.result = result;
}

/// Unset the previous result
export function unset_result(c: Challenge): void {
	c.result_was_set = false;
	c.result_set_by = undefined;
	c.when_result_set = undefined;
	c.white = undefined;
	c.black = undefined;
	c.result = undefined;
}

/// Accepts the result
export function set_result_accepted(c: Challenge, by: string, d: string) {
	if (!c.result_was_set) {
		throw new Error('Result must have been set previously');
	}
	if (by != undefined && by == c.result_set_by) {
		throw new Error('The accepter of the result cannot be the same person who set the result');
	}

	c.result_accepted_by = by;
	c.when_result_accepted = d;
}
