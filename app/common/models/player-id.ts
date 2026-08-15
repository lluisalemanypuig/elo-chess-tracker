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

declare const PlayerPublicIdBrand: unique symbol;
export type PlayerPublicIdLocal = number & {
	readonly [PlayerPublicIdBrand]: 'PlayerPublicId';
};
export const PlayerPublicIdSchema = z.number().gte(0).brand<'PlayerPublicIdLocal'>();
export type PlayerPublicId = z.infer<typeof PlayerPublicIdSchema>;

export function toPlayerPublicId(n: number): PlayerPublicId {
	return n as PlayerPublicId;
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
