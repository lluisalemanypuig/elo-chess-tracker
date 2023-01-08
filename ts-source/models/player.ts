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

import { Rating, rating_from_json } from './rating';

/**
 * @brief Simple class to encode a Player
 */
export class Player {
	/// The user name of the the player
	protected readonly username: string;

	/// Classical info of the player
	protected classical: Rating;

	/**
	 * @brief Constructor
	 * @param username User name of the player.
	 * @param classical Information about classical games.
	 */
	constructor(
		username: string,
		classical: Rating
	) {
		this.username = username;
		this.classical = classical;
	}

	/// Returns the username of this player
	get_username(): string { return this.username; }

	/// Returns the classical rating of the player
	get_classical_rating(): Rating { return this.classical; }

	/// Sets the classical rating of the player
	set_classical_rating(rating: Rating): void {
		this.classical = rating;
	}

	/// Creates a copy of this player.
	clone(): Player {
		return new Player(
			this.username,
			this.classical.clone()
		);
	}
}

/**
 * @brief Parses a JSON string or object and returns a Player.
 * @param json A JSON string or object with data of a Player.
 * @returns A new Player object.
 * @pre If @e json is a string then it cannot start with '['.
 */
export function player_from_json(json: any): Player {
	if (typeof json == "string") {
		let json_parse = JSON.parse(json);
		return player_from_json(json_parse);
	}

	return new Player(
		json["username"],
		rating_from_json(json["classical"])
	);
}

/**
 * @brief Parses a JSON string or object and returns a set of Player.
 * @param json A JSON string or object with data of several Player.
 * @returns An array of Player objects.
 */
export function player_set_from_json(json: any): Player[] {
	if (typeof json == "string") {
		let json_parse = JSON.parse(json);
		return player_set_from_json(json_parse);
	}

	let player_set: Player[] = [];
	for (var player in json) {
		player_set.push(player_from_json(json[player]));
	}
	return player_set;
}
