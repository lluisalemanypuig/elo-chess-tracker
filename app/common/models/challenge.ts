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
import { DateFull, DateFullSchema } from '@common/utils/time';
import { GameResult, GameResultSchema } from '@common/models/game';
import {
	TimeControlId,
	TimeControlIdSchema,
	TimeControlName,
	TimeControlNameSchema
} from '@common/models/time_control';
import { Player, PlayerPrivateId, PlayerPrivateIdSchema } from '@common/models/player';

// Challenge state

export const CHALLENGE_STATE = ['PENDING_ACCEPT', 'PENDING_RESULT', 'PENDING_RESULT_AGREE', 'COMPLETED'] as const;

export const ChallengeStateSchema = z.enum(CHALLENGE_STATE);
export type ChallengeState = z.infer<typeof ChallengeStateSchema>;

// A type for challenge IDs.

declare const ChallengeIdBrand: unique symbol;
export type ChallengeIdLocal = string & {
	readonly [ChallengeIdBrand]: 'ChallengeIdLocal';
};
export const ChallengeIdSchema = z.string().brand<'ChallengeIdLocal'>();
export type ChallengeId = z.infer<typeof ChallengeIdSchema>;

export function toChallengeId(s: string): ChallengeId {
	return s as ChallengeId;
}

export const ChallengeSchema = z
	.object({
		id: ChallengeIdSchema,
		// Name of the game that will result from this challenge
		title: z.string(),
		// Time control of the challenge
		time_control_id: TimeControlIdSchema,
		// Time control of the challenge
		time_control_name: TimeControlNameSchema,

		// The user sending the challenge
		sent_by: PlayerPrivateIdSchema,
		// The user receiving the challenge
		sent_to: PlayerPrivateIdSchema,
		// Date when the challenge was sent
		when_challenge_sent: DateFullSchema,

		// Date when the challenge was accepted
		when_challenge_accepted: DateFullSchema.optional(),

		// Date when the result of the game was last modified
		when_result_set: DateFullSchema.optional(),
		// Player who set the result
		result_set_by: PlayerPrivateIdSchema.optional(),

		// Date when the result of the game was accepted.
		when_result_accepted: DateFullSchema.optional(),
		// User that accepted the result
		result_accepted_by: PlayerPrivateIdSchema.optional(),

		// The resulting game of the challenge
		white: PlayerPrivateIdSchema.optional(),
		black: PlayerPrivateIdSchema.optional(),
		result: GameResultSchema.optional(),

		// the state of the challenge
		state: ChallengeStateSchema
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

export function newChallenge(
	id: ChallengeId,
	title: string,
	sentBy: PlayerPrivateId,
	sentTo: PlayerPrivateId,
	timeControlId: TimeControlId,
	timeControlName: TimeControlName,
	whenChallengeSent: DateFull
): Challenge {
	return {
		id: id,
		title: title,
		time_control_id: timeControlId,
		time_control_name: timeControlName,
		sent_by: sentBy,
		sent_to: sentTo,
		when_challenge_sent: whenChallengeSent,
		when_challenge_accepted: undefined,
		when_result_set: undefined,
		result_set_by: undefined,
		when_result_accepted: undefined,
		result_accepted_by: undefined,
		white: undefined,
		black: undefined,
		result: undefined,
		state: 'PENDING_ACCEPT'
	};
}

export interface ChallengeAccept {
	by: PlayerPrivateId;
	when: DateFull;
}

export function accept(c: Challenge, { by: _by, when }: ChallengeAccept) {
	c.when_challenge_accepted = when;
	c.state = 'PENDING_RESULT';
}

export interface ChallengeDecline {
	by: PlayerPrivateId;
}

export interface ChallengeSetResult {
	by: PlayerPrivateId;
	when: DateFull;
	white: PlayerPrivateId;
	black: PlayerPrivateId;
	result: GameResult;
}

// Set the result of a challenge. Checks integrity of input parameters.s
export function setResult(c: Challenge, { by, when, white, black, result }: ChallengeSetResult): void {
	c.result_set_by = by;
	c.when_result_set = when;
	c.white = white;
	c.black = black;
	c.result = result;
	c.state = 'PENDING_RESULT_AGREE';
}

export interface ChallengeDisagreeResult {
	by: PlayerPrivateId;
}

// Unset the previous result
export function disagreeResult(c: Challenge): void {
	c.result_set_by = undefined;
	c.when_result_set = undefined;
	c.white = undefined;
	c.black = undefined;
	c.result = undefined;
	c.state = 'PENDING_RESULT';
}

export interface ChallengeAgreeResult {
	by: PlayerPrivateId;
	when: DateFull;
}

// Accepts the result
export function agreeResult(c: Challenge, { by, when }: ChallengeAgreeResult) {
	c.result_accepted_by = by;
	c.when_result_accepted = when;
	c.state = 'COMPLETED';
}

export function isPartOfChallenge(c: Challenge, by: PlayerPrivateId): boolean {
	return by === c.sent_by || by === c.sent_to;
}
