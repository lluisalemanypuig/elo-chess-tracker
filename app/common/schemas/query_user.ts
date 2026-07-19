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
import { UserThinSchema } from '@common/models/user_thin';
import { UserRoleArraySchema } from '@common/models/user_role';
import { UserActionArraySchema } from '@common/models/user_action';
import { RatingSchema } from '@common/models/rating_framework/rating';

export const QueryUserEditInputSchema = z.object({
	u: z.number().gte(0)
});

export type QueryUserEditInput = z.infer<typeof QueryUserEditInputSchema>;

// ----------

export const QueryUserRankingInputSchema = z.object({
	tc_i: z.string()
});

export type QueryUserRankingInput = z.infer<typeof QueryUserRankingInputSchema>;

// ----------

export const QueryUserListOutputSchema = UserThinSchema;

export type QueryUserListOutput = z.infer<typeof QueryUserListOutputSchema>;

// ----------

export const TimeControlAndRatingSchema = z.object({
	time_control_name: z.string(),
	rating: RatingSchema
});

export type TimeControlAndRating = z.infer<typeof TimeControlAndRatingSchema>;

export const QueryUserHomeOutputSchema = z.object({
	fullname: z.string(),
	roles: UserRoleArraySchema,
	actions: UserActionArraySchema,
	ratings: z.array(TimeControlAndRatingSchema)
});

export type QueryUserHomeOutput = z.infer<typeof QueryUserHomeOutputSchema>;

// ----------

export const QueryUserEditOutputSchema = z.object({
	first_name: z.string(),
	last_name: z.string(),
	roles: UserRoleArraySchema
});

export type QueryUserEditOutput = z.infer<typeof QueryUserEditOutputSchema>;

// ----------

export const UserWithGamesSchema = z.object({
	name: z.string(),
	rating: z.number(),
	total_games: z.number(),
	won: z.number(),
	drawn: z.number(),
	lost: z.number()
});

export type UserWithGames = z.infer<typeof UserWithGamesSchema>;

export const UserWithoutGamesSchema = z.object({
	name: z.string(),
	rating: z.number()
});

export type UserWithoutGames = z.infer<typeof UserWithoutGamesSchema>;

export const QueryUserRankingOutputSchema = z.object({
	with_games: z.array(UserWithGamesSchema),
	without_games: z.array(UserWithoutGamesSchema)
});

export type QueryUserRankingOutput = z.infer<typeof QueryUserRankingOutputSchema>;
