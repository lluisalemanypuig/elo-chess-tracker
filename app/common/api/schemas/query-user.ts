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
import { UserThinSchema } from '@common/models/user-thin';
import { UserRoleArraySchema } from '@common/models/user-role';
import { UserActionArraySchema } from '@common/models/user-action';
import { TimeControlIdSchema } from '@common/models/time-control';
import { PlayerPublicIdSchema } from '@common/models/player-id';
import { RatingSchema } from '@server/models/rating-framework/rating';
import { UserGivenNameSchema } from '@common/models/user-given-name';

// ROUTES.QUERY_USER_LIST

export const QueryUserListOutputSchema = UserThinSchema;

export type QueryUserListOutput = z.infer<typeof QueryUserListOutputSchema>;

// ROUTES.QUERY_USER_LIST

export const QueryUserEditInputSchema = z
	.object({
		u: PlayerPublicIdSchema
	})
	.strict();

export type QueryUserEditInput = z.infer<typeof QueryUserEditInputSchema>;

// ROUTES.QUERY_USER_RANKING

export const QueryUserRankingInputSchema = z
	.object({
		timeControlId: TimeControlIdSchema
	})
	.strict();

export type QueryUserRankingInput = z.infer<typeof QueryUserRankingInputSchema>;

// ROUTES.QUERY_USER_HOME

export const TimeControlAndRatingSchema = z
	.object({
		timeControlId: TimeControlIdSchema,
		rating: RatingSchema
	})
	.strict();

export type TimeControlAndRating = z.infer<typeof TimeControlAndRatingSchema>;

export const QueryUserHomeOutputSchema = z
	.object({
		fullname: UserGivenNameSchema,
		roles: UserRoleArraySchema,
		actions: UserActionArraySchema,
		ratings: z.array(TimeControlAndRatingSchema)
	})
	.strict();

export type QueryUserHomeOutput = z.infer<typeof QueryUserHomeOutputSchema>;

// ROUTES.QUERY_USER_EDIT

export const QueryUserEditOutputSchema = z
	.object({
		firstName: UserGivenNameSchema,
		lastName: UserGivenNameSchema,
		roles: UserRoleArraySchema
	})
	.strict();

export type QueryUserEditOutput = z.infer<typeof QueryUserEditOutputSchema>;

// ROUTES.QUERY_USER_RANKING

export const UserWithGamesSchema = z
	.object({
		name: UserGivenNameSchema,
		rating: z.number(),
		totalGames: z.number(),
		won: z.number(),
		drawn: z.number(),
		lost: z.number()
	})
	.strict();

export type UserWithGames = z.infer<typeof UserWithGamesSchema>;

export const UserWithoutGamesSchema = z
	.object({
		name: UserGivenNameSchema,
		rating: z.number()
	})
	.strict();

export type UserWithoutGames = z.infer<typeof UserWithoutGamesSchema>;

export const QueryUserRankingOutputSchema = z
	.object({
		withGames: z.array(UserWithGamesSchema),
		withoutGames: z.array(UserWithoutGamesSchema)
	})
	.strict();

export type QueryUserRankingOutput = z.infer<typeof QueryUserRankingOutputSchema>;
