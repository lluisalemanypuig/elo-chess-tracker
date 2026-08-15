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

export const GameResultSchema = z.enum(['white_wins', 'black_wins', 'draw']);
export type GameResult = z.infer<typeof GameResultSchema>;

export function oppositeResult(res: GameResult): GameResult {
	if (res === 'draw') {
		return 'draw';
	}
	if (res === 'white_wins') {
		return 'black_wins';
	}
	// res === "black_wins"
	return 'white_wins';
}

export function resultFromTextToValue(text: string): GameResult | undefined {
	if (text === '1 - 0') {
		return 'white_wins';
	}
	if (text === '1/2 - 1/2') {
		return 'draw';
	}
	if (text === '0 - 1') {
		return 'black_wins';
	}
	return undefined;
}
