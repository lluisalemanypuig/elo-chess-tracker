/*
Elo rating for a Chess Club
Copyright (C) 2023  Lluís Alemany Puig

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

Contact:
	Lluís Alemany Puig
	https://github.com/lluisalemanypuig
*/

/**
 * @brief Simple class to encode a rating.
 */
export class Rating {
	/// Actual rating 
	public rating: number;
	/// Number of games
	public num_games: number;
	/// Number of won games
	public won: number;
	/// Number of drawn games
	public drawn: number;
	/// Number of lost games
	public lost: number;

	/// Constant
	public K: number;

	/**
	 * @brief Constructor
	 * @param rating Actual rating points
	 * @param num_games Number of games
	 * @param won Number of won games
	 * @param drawn Number of drawn games
	 * @param lost Number of lost games
	 * @param K Constant
	 */
	constructor(
		rating: number,
		num_games: number,
		won: number,
		drawn: number,
		lost: number,
		K: number
	) {
		this.rating = rating;
		this.num_games = num_games;
		this.won = won;
		this.drawn = drawn;
		this.lost = lost;
		this.K = K;
	}

	/// Clones the object.
	clone(): Rating {
		return new Rating(
			this.rating,
			this.num_games, this.won, this.drawn, this.lost,
			this.K
		);
	}
}

/**
 * @brief Parses a JSON string or object and returns a Player.
 * @param json A JSON string or object with data of a Player.
 * @returns A new Player object.
 * @pre If @e json is a string then it cannot start with '['.
 */
export function rating_from_json(json: any): Rating {
	if (typeof json == "string") {
		let json_parse = JSON.parse(json);
		return rating_from_json(json_parse);
	}

	return new Rating(
		json["rating"],
		json["num_games"], json["won"], json["drawn"], json["lost"],
		json["K"]
	);
}

/**
 * @brief Parses a JSON string or object and returns a set of Rating.
 * @param json A JSON string or object with data of several Rating.
 * @returns An array of Rating objects.
 */
export function rating_set_from_json(json: any): Rating[] {
	if (typeof json == "string") {
		let json_parse = JSON.parse(json);
		return rating_set_from_json(json_parse);
	}

	let rating_set: Rating[] = [];
	for (var rating in json) {
		rating_set.push(rating_from_json(json[rating]));
	}
	return rating_set;
}
