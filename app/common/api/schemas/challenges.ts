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
import { TimeControlIdSchema, TimeControlNameSchema } from '@common/models/time-control';
import { ChallengeIdSchema } from '@common/models/challenge-id';
import { PlayerPublicIdSchema } from '@common/models/player-id';
import { GameResultSchema } from '@common/models/game-result';

// ROUTES.CHALLENGE_SEND

export const ChallengeSendInputSchema = z
	.object({
		to: PlayerPublicIdSchema,
		timeControlId: TimeControlIdSchema,
		timeControlName: TimeControlNameSchema,
		title: z.string()
	})
	.strict();

export type ChallengeSendInput = z.infer<typeof ChallengeSendInputSchema>;

// ROUTES.CHALLENGE_ACCEPT

export const ChallengeAcceptInputSchema = z
	.object({
		id: ChallengeIdSchema
	})
	.strict();

export type ChallengeAcceptInput = z.infer<typeof ChallengeAcceptInputSchema>;

// ROUTES.CHALLENGE_DECLINE

export const ChallengeDeclineInputSchema = z
	.object({
		id: ChallengeIdSchema
	})
	.strict();

export type ChallengeDeclineInput = z.infer<typeof ChallengeDeclineInputSchema>;

// ROUTES.CHALLENGE_SET_RESULT

export const ChallengeSetResultInputSchema = z
	.object({
		id: ChallengeIdSchema,
		white: PlayerPublicIdSchema,
		black: PlayerPublicIdSchema,
		result: GameResultSchema
	})
	.strict();

export type ChallengeSetResultInput = z.infer<typeof ChallengeSetResultInputSchema>;

// ROUTES.CHALLENGE_AGREE

export const ChallengeAgreeResultInputSchema = z
	.object({
		id: ChallengeIdSchema
	})
	.strict();

export type ChallengeAgreeResultInput = z.infer<typeof ChallengeAgreeResultInputSchema>;

// ROUTES.CHALLENGE_DISAGREE

export const ChallengeDisagreeResultInputSchema = z
	.object({
		id: ChallengeIdSchema
	})
	.strict();

export type ChallengeDisagreeResultInput = z.infer<typeof ChallengeDisagreeResultInputSchema>;
