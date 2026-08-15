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
import { DateMajorSchema, DateMinorSchema } from '@common/utils/time';
import { PlayerPublicIdSchema } from '@common/models/player-id';
import { GameResultSchema } from '@common/models/game-result';
import { GameIdSchema } from '@common/models/game-id';

// ROUTES.GAME_CREATE

export const GameCreateInputSchema = z
	.object({
		white: PlayerPublicIdSchema,
		black: PlayerPublicIdSchema,
		title: z.string(),
		result: GameResultSchema,
		timeControlId: TimeControlIdSchema,
		timeControlName: TimeControlNameSchema,
		whenCreated: DateMajorSchema,
		timeCreated: DateMinorSchema
	})
	.strict();

export type GameCreateInput = z.infer<typeof GameCreateInputSchema>;

// ROUTES.gameEditResult

export const GameEditResultInputSchema = z
	.object({
		id: GameIdSchema,
		newResult: GameResultSchema
	})
	.strict();

export type GameEditResultInput = z.infer<typeof GameEditResultInputSchema>;

// ROUTES.GAME_EDIT_TITLE

export const GameEditTitleInputSchema = z
	.object({
		id: GameIdSchema,
		title: z.string()
	})
	.strict();

export type GameEditTitleInput = z.infer<typeof GameEditTitleInputSchema>;

// ROUTES.GAME_DELETE

export const GameDeleteInputSchema = z
	.object({
		id: GameIdSchema
	})
	.strict();

export type GameDeleteInput = z.infer<typeof GameDeleteInputSchema>;
