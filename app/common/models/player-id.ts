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

// Player public ID

export const PLAYER_PUBLIC_ID_LENGTH = 256;

declare const PlayerPublicIdBrand: unique symbol;
export type PlayerPublicIdLocal = string & {
	readonly [PlayerPublicIdBrand]: 'PlayerPublicId';
};
export const PlayerPublicIdSchema = z
	.string()
	.min(PLAYER_PUBLIC_ID_LENGTH)
	.max(PLAYER_PUBLIC_ID_LENGTH)
	.brand<'PlayerPublicIdLocal'>();
export type PlayerPublicId = z.infer<typeof PlayerPublicIdSchema>;

export function toPlayerPublicId(s: string): PlayerPublicId {
	return s as PlayerPublicId;
}

// Player private ID

declare const PlayerPrivateIdBrand: unique symbol;
export type PlayerPrivateIdLocal = string & {
	readonly [PlayerPrivateIdBrand]: 'PlayerPrivateId';
};
export const PlayerPrivateIdSchema = z.string().brand<'PlayerPrivateIdLocal'>();
export type PlayerPrivateId = z.infer<typeof PlayerPrivateIdSchema>;

export function toPlayerPrivateId(s: string): PlayerPrivateId {
	return s as PlayerPrivateId;
}
