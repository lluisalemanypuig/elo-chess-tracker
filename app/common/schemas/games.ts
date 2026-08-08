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
import { GameIdSchema, GameResultSchema } from '@common/models/game';
import { PlayerPublicIdSchema } from '@common/models/player';
import { TimeControlIdSchema, TimeControlNameSchema } from '@common/models/time_control';
import { DateYYYYMMDDSchema, DateHHmmssSSSSchema } from '@server/utils/time';

// Routes.GAME_CREATE

export const GameCreateInputSchema = z.object({
	white: PlayerPublicIdSchema,
	black: PlayerPublicIdSchema,
	title: z.string(),
	result: GameResultSchema,
	time_control_id: TimeControlIdSchema,
	time_control_name: TimeControlNameSchema,
	whenCreated: DateYYYYMMDDSchema,
	timeCreated: DateHHmmssSSSSchema
});

export type GameCreateInput = z.infer<typeof GameCreateInputSchema>;

// Routes.GAME_EDIT_RESULT

export const GameEditResultInputSchema = z.object({
	id: GameIdSchema,
	new_result: GameResultSchema
});

export type GameEditResultInput = z.infer<typeof GameEditResultInputSchema>;

// Routes.GAME_EDIT_TITLE

export const GameEditTitleInputSchema = z.object({
	id: GameIdSchema,
	title: z.string()
});

export type GameEditTitleInput = z.infer<typeof GameEditTitleInputSchema>;

// Routes.GAME_DELETE

export const GameDeleteInputSchema = z.object({
	id: GameIdSchema
});

export type GameDeleteInput = z.infer<typeof GameDeleteInputSchema>;
