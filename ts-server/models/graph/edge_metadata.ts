/*
Elo rating for a Chess Club
Copyright (C) 2023 - 2025  Lluís Alemany Puig

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

import { GameResult } from '../game';

/**
 * @brief Metadata of an edge.
 *
 * Recall that an edge from a player A to another player B is an abstraction
 * in which A plays as White against B who plays as Black.
 */
export class EdgeMetadata {
	/// The number of games in which A beats B.
	public num_games_won: number = 0;
	/// The number of games in which A draws against B.
	public num_games_drawn: number = 0;
	/// The number of games in which B beats A.
	public num_games_lost: number = 0;

	constructor(num_games_won: number, num_games_drawn: number, num_games_lost: number) {
		this.num_games_won = num_games_won;
		this.num_games_drawn = num_games_drawn;
		this.num_games_lost = num_games_lost;
	}

	merge(other: EdgeMetadata): void {
		this.num_games_won += other.num_games_won;
		this.num_games_drawn += other.num_games_drawn;
		this.num_games_lost += other.num_games_lost;
	}

	static from_result(result: GameResult): EdgeMetadata {
		return new EdgeMetadata(
			result == 'white_wins' ? 1 : 0,
			result == 'draw' ? 1 : 0,
			result == 'black_wins' ? 1 : 0
		);
	}

	static empty(): EdgeMetadata {
		return new EdgeMetadata(0, 0, 0);
	}
}

/**
 * @brief Parses a JSON string or object and returns an Edge.
 * @param json A string with data of an Edge.
 * @returns A new Edge object.
 * @pre If @e json is a string, then it cannot start with '['.
 */
export function edge_metadata_from_json(json: any): EdgeMetadata {
	if (typeof json === 'string') {
		const json_parse = JSON.parse(json);
		return edge_metadata_from_json(json_parse);
	}

	return new EdgeMetadata(json['num_games_won'], json['num_games_drawn'], json['num_games_lost']);
}
