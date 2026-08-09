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
import { UserGivenNameSchema } from '@common/models/user';
import { TimeControlIdSchema, TimeControlNameSchema } from '@common/models/time_control';
import { GameIdSchema } from '@common/models/game';
import { DateFullSchema } from '@common/utils/time';

// Routes.QUERY_GAME_LIST_OWN

export const QueryGamesListOwnInputSchema = z.object({
	time_control_id: TimeControlIdSchema
});

export type QueryGamesListOwnInput = z.infer<typeof QueryGamesListOwnInputSchema>;

// Routes.QUERY_GAME_LIST_ALL

export const QueryGamesListAllInputSchema = z.object({
	time_control_id: TimeControlIdSchema
});

export type QueryGamesListAllInput = z.infer<typeof QueryGamesListAllInputSchema>;

// Routes.QUERY_GAME_LIST_OWN + Routes.QUERY_GAME_LIST_ALL

export const QueryGamesListOutputSingleSchema = z.object({
	id: GameIdSchema,
	title: z.string(),
	white: UserGivenNameSchema,
	black: UserGivenNameSchema,
	result: z.string(),
	time_control_name: TimeControlNameSchema,
	date: DateFullSchema,
	white_rating: z.string(),
	black_rating: z.string(),
	white_increment: z.string(),
	black_increment: z.string(),
	editable: z.boolean(),
	deleteable: z.boolean()
});

export type QueryGamesListOutputSingle = z.infer<typeof QueryGamesListOutputSingleSchema>;

export const QueryGamesListOutputSchema = z.array(QueryGamesListOutputSingleSchema);

export type QueryGamesListOutput = z.infer<typeof QueryGamesListOutputSchema>;
