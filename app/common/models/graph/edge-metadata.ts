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
import { GameResult } from '@common/models/game';

export const EdgeMetadataSchema = z
	.object({
		numGamesWon: z.number().gte(0),
		numGamesDrawn: z.number().gte(0),
		numGamesLost: z.number().gte(0)
	})
	.strict();

/**
 * @brief Metadata of an edge.
 *
 * Recall that an edge from a player A to another player B is an abstraction
 * in which A plays as White against B who plays as Black.
 */
export class EdgeMetadata {
	/// The number of games in which A beats B.
	public numGamesWon: number = 0;
	/// The number of games in which A draws against B.
	public numGamesDrawn: number = 0;
	/// The number of games in which B beats A.
	public numGamesLost: number = 0;

	constructor(numGamesWon: number, numGamesDrawn: number, numGamesLost: number) {
		this.numGamesWon = numGamesWon;
		this.numGamesDrawn = numGamesDrawn;
		this.numGamesLost = numGamesLost;
	}

	merge(other: EdgeMetadata) {
		this.numGamesWon += other.numGamesWon;
		this.numGamesDrawn += other.numGamesDrawn;
		this.numGamesLost += other.numGamesLost;
	}

	toString(): string {
		return `${this.numGamesWon}/${this.numGamesDrawn}/${this.numGamesLost}`;
	}

	static fromResult(result: GameResult): EdgeMetadata {
		return new EdgeMetadata(
			result === 'white_wins' ? 1 : 0,
			result === 'draw' ? 1 : 0,
			result === 'black_wins' ? 1 : 0
		);
	}

	reverse(): EdgeMetadata {
		const w = this.numGamesWon;
		this.numGamesWon = this.numGamesLost;
		this.numGamesLost = w;
		return this;
	}

	clone(): EdgeMetadata {
		return new EdgeMetadata(this.numGamesWon, this.numGamesDrawn, this.numGamesLost);
	}

	decrease(res: GameResult) {
		if (res === 'white_wins') {
			this.numGamesWon -= 1;
		} else if (res === 'draw') {
			this.numGamesDrawn -= 1;
		} else {
			this.numGamesLost -= 1;
		}
	}

	allZero(): boolean {
		return this.numGamesDrawn === 0 && this.numGamesLost === 0 && this.numGamesWon === 0;
	}

	static empty(): EdgeMetadata {
		return new EdgeMetadata(0, 0, 0);
	}
}
