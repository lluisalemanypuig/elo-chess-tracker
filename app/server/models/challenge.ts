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
import {
	TimeControlId,
	TimeControlIdSchema,
	TimeControlName,
	TimeControlNameSchema
} from '@common/models/time-control';
import { ChallengeId, ChallengeIdSchema } from '@common/models/challenge-id';
import { PlayerPrivateId, PlayerPrivateIdSchema } from '@common/models/player-id';
import { GameResult, GameResultSchema } from '@common/models/game-result';

// Challenge state

export const CHALLENGE_STATE = ['PENDING_ACCEPT', 'PENDING_RESULT', 'PENDING_RESULT_AGREE', 'COMPLETED'] as const;

export const ChallengeStateSchema = z.enum(CHALLENGE_STATE);
export type ChallengeState = z.infer<typeof ChallengeStateSchema>;

export const ChallengeSchema = z
	.object({
		id: ChallengeIdSchema,
		// Name of the game that will result from this challenge
		title: z.string(),
		// Time control of the challenge
		timeControlId: TimeControlIdSchema,
		// Time control of the challenge
		timeControlName: TimeControlNameSchema,

		// The user sending the challenge
		sentBy: PlayerPrivateIdSchema,
		// The user receiving the challenge
		sentTo: PlayerPrivateIdSchema,
		// Date when the challenge was sent
		whenChallengeSent: DateFullSchema,

		// Date when the challenge was accepted
		whenChallengeAccepted: DateFullSchema.optional(),

		// Date when the result of the game was last modified
		whenResultSet: DateFullSchema.optional(),
		// Player who set the result
		resultSetBy: PlayerPrivateIdSchema.optional(),

		// Date when the result of the game was accepted.
		whenResultAccepted: DateFullSchema.optional(),
		// User that accepted the result
		resultAcceptedBy: PlayerPrivateIdSchema.optional(),

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
		timeControlId: timeControlId,
		timeControlName: timeControlName,
		sentBy: sentBy,
		sentTo: sentTo,
		whenChallengeSent: whenChallengeSent,
		whenChallengeAccepted: undefined,
		whenResultSet: undefined,
		resultSetBy: undefined,
		whenResultAccepted: undefined,
		resultAcceptedBy: undefined,
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
	c.whenChallengeAccepted = when;
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
export function setResult(c: Challenge, { by, when, white, black, result }: ChallengeSetResult) {
	c.resultSetBy = by;
	c.whenResultSet = when;
	c.white = white;
	c.black = black;
	c.result = result;
	c.state = 'PENDING_RESULT_AGREE';
}

export interface ChallengeDisagreeResult {
	by: PlayerPrivateId;
}

// Unset the previous result
export function disagreeResult(c: Challenge) {
	c.resultSetBy = undefined;
	c.whenResultSet = undefined;
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
	c.resultAcceptedBy = by;
	c.whenResultAccepted = when;
	c.state = 'COMPLETED';
}

export function isPartOfChallenge(c: Challenge, by: PlayerPrivateId): boolean {
	return by === c.sentBy || by === c.sentTo;
}
