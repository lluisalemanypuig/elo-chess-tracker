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
import { PlayerPublicIdSchema } from '@common/models/player';
import { UserGivenNameSchema } from '@common/models/user';
import { ChallengeIdSchema } from '@common/models/challenge';
import { TimeControlNameSchema } from '@common/models/time-control';
import { DateFullSchema } from '@common/utils/time';

// ROUTES.QUERY_CHALLENGE_RECEIVED

export const QueryChallengesReceivedOutputSingleSchema = z
	.object({
		id: ChallengeIdSchema,
		title: z.string(),
		sentBy: UserGivenNameSchema,
		sentWhen: DateFullSchema,
		timeControlName: TimeControlNameSchema,
		canBeDeclined: z.boolean()
	})
	.strict();

export type QueryChallengesReceivedOutputSingle = z.infer<typeof QueryChallengesReceivedOutputSingleSchema>;

export const QueryChallengesReceivedOutputSchema = z.array(QueryChallengesReceivedOutputSingleSchema);

export type QueryChallengesReceivedOutput = z.infer<typeof QueryChallengesReceivedOutputSchema>;

// ROUTES.QUERY_CHALLENGE_SENT

export const QueryChallengesSentOutputSingleSchema = z
	.object({
		id: ChallengeIdSchema,
		title: z.string(),
		sentTo: UserGivenNameSchema,
		sentWhen: DateFullSchema,
		timeControlName: TimeControlNameSchema,
		canBeDeclined: z.boolean()
	})
	.strict();

export type QueryChallengesSentOutputSingle = z.infer<typeof QueryChallengesSentOutputSingleSchema>;

export const QueryChallengesSentOutputSchema = z.array(QueryChallengesSentOutputSingleSchema);

export type QueryChallengesSentOutput = z.infer<typeof QueryChallengesSentOutputSchema>;

// ROUTES.QUERY_CHALLENGE_PENDING_RESULT

export const QueryChallengesPendingResultOutputSingleSchema = z
	.object({
		id: ChallengeIdSchema,
		title: z.string(),
		sentBy: z.object({
			name: UserGivenNameSchema,
			publicId: PlayerPublicIdSchema
		}),
		sentTo: z.object({
			name: UserGivenNameSchema,
			publicId: PlayerPublicIdSchema
		}),
		opponent: UserGivenNameSchema,
		sentWhen: DateFullSchema,
		timeControlName: TimeControlNameSchema
	})
	.strict();

export type QueryChallengesPendingResultOutputSingle = z.infer<typeof QueryChallengesPendingResultOutputSingleSchema>;

export const QueryChallengesPendingResultOutputSchema = z.array(QueryChallengesPendingResultOutputSingleSchema);

export type QueryChallengesPendingResultOutput = z.infer<typeof QueryChallengesPendingResultOutputSchema>;

// ROUTES.QUERY_CHALLENGE_CONFIRM_RESULT_OTHER

export const QueryChallengesConfirmResultOtherOutputSingleSchema = z
	.object({
		id: ChallengeIdSchema,
		title: z.string(),
		opponent: UserGivenNameSchema,
		sentWhen: DateFullSchema,
		white: UserGivenNameSchema,
		black: UserGivenNameSchema,
		result: z.string(),
		timeControlName: TimeControlNameSchema
	})
	.strict();

export type QueryChallengesConfirmResultOtherOutputSingle = z.infer<
	typeof QueryChallengesConfirmResultOtherOutputSingleSchema
>;

export const QueryChallengesConfirmResultOtherOutputSchema = z.array(
	QueryChallengesConfirmResultOtherOutputSingleSchema
);

export type QueryChallengesConfirmResultOtherOutput = z.infer<typeof QueryChallengesConfirmResultOtherOutputSchema>;

// ROUTES.QUERY_CHALLENGE_CONFIRM_RESULT_SELF

export const QueryChallengesConfirmResultSelfOutputSingleSchema = z
	.object({
		id: ChallengeIdSchema,
		title: z.string(),
		opponent: UserGivenNameSchema,
		sentWhen: DateFullSchema,
		white: UserGivenNameSchema,
		black: UserGivenNameSchema,
		result: z.string(),
		timeControlName: TimeControlNameSchema
	})
	.strict();

export type QueryChallengesConfirmResultSelfOutputSingle = z.infer<
	typeof QueryChallengesConfirmResultSelfOutputSingleSchema
>;

export const QueryChallengesConfirmResultSelfOutputSchema = z.array(QueryChallengesConfirmResultSelfOutputSingleSchema);

export type QueryChallengesConfirmResultSelfOutput = z.infer<typeof QueryChallengesConfirmResultSelfOutputSchema>;
