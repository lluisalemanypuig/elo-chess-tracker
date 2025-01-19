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

import { Rating } from '../rating';

/**
 * @brief Simple class to encode a rating.
 */
export class EloRating extends Rating {
	/// Constant
	public K: number;
	// Ever surpassed 2400
	public surpassed_2400: boolean;

	/**
	 * @brief Constructor
	 * @param rating Actual rating points
	 * @param num_games Number of games
	 * @param won Number of won games
	 * @param drawn Number of drawn games
	 * @param lost Number of lost games
	 * @param K Constant
	 * @param surpassed_2400 Has the 2400 threshold rating ever been surpassed?
	 */
	constructor(
		rating: number,
		num_games: number,
		won: number,
		drawn: number,
		lost: number,
		K: number,
		surpassed_2400: boolean
	) {
		super(rating, num_games, won, drawn, lost);

		this.K = K;
		this.surpassed_2400 = surpassed_2400;
	}

	/// Clones the object.
	override clone(): EloRating {
		return new EloRating(this.rating, this.num_games, this.won, this.drawn, this.lost, this.K, this.surpassed_2400);
	}
}

export function Elo_new_rating(): EloRating {
	return new EloRating(1500, 0, 0, 0, 0, 40, false);
}

/**
 * @brief Parses a JSON string or object and returns a Player.
 * @param json A JSON string or object with data of a Player.
 * @returns A new Player object.
 * @pre If @e json is a string then it cannot start with '['.
 */
export function Elo_rating_from_json(json: any): EloRating {
	if (typeof json === 'string') {
		const json_parse = JSON.parse(json);
		return Elo_rating_from_json(json_parse);
	}

	return new EloRating(
		json['rating'],
		json['num_games'],
		json['won'],
		json['drawn'],
		json['lost'],
		json['K'],
		json['surpassed_2400']
	);
}
