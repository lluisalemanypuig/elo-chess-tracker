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

import { Rating } from '../rating_system/rating';
import { RatingSystem } from '../server/configuration';

/// Result of a game
export type GameResult = "white_wins" | "black_wins" | "draw";

/**
 * @brief Class to encode a chess game.
 *
 * A game is encoded as:
 * - a pair of players (white and black),
 * - the result of the game (white wins, draw, black wins),
 * - the type of game (classical, rapid, blitz, ...),
 * - when it took place.
 * 
 * The players contain the rating, number of games, ... BEFORE
 * the game is played, not after.
 */
export class Game {
	/// Identifier of the game
	public readonly id: string;
	/// White player username
	public white: string;
	/// White in the state before the game.
	public white_rating: Rating;
	/// White player username
	public black: string;
	/// White in the state before the game.
	public black_rating: Rating;
	/// Result of the game.
	public result: GameResult;
	/// Time control id (Classical, Blitz, ...)
	public time_control_id: string;
	/// Time control name (Classical (90 + 30), Blitz (5 + 3), ...)
	public time_control_name: string;
	/// Date when the game took place.
	public when: string;

	/**
	 * @brief Constructor
	 * @param white White player
	 * @param white_rating White rating before the game
	 * @param black Black player
	 * @param black_rating Black rating before the game
	 * @param result Result of the game (white_wins, draw, black_wins)
	 * @param time_control_id Time control id of the game
	 * @param time_control_name Time control name of the game
	 * @param when Date
	 */
	constructor(
		id: string,
		white: string,
		white_rating: Rating,
		black: string,
		black_rating: Rating,
		result: GameResult,
		time_control_id: string,
		time_control_name: string,
		when: string
	) {
		this.id = id;
		this.white = white;
		this.white_rating = white_rating;
		this.black = black;
		this.black_rating = black_rating;
		this.result = result;
		this.time_control_id = time_control_id;
		this.time_control_name = time_control_name;
		this.when = when;
	}

	is_user_involved(username: string): boolean {
		return this.white == username || this.black == username;
	}

	has_time(time_control_id: string): boolean {
		return this.time_control_id == time_control_id;
	}
}

/**
 * @brief Parses a JSON string or object and returns a Game.
 * @param json A string with data of a Game.
 * @returns A new Game object.
 * @pre If @e json is a string, then it cannot start with '['.
 */
export function game_from_json(json: any): Game {
	if (typeof json === "string") {
		let json_parse = JSON.parse(json);
		return game_from_json(json_parse);
	}

	const rating_system = RatingSystem.get_instance();
	return new Game(
		json["id"],
		json["white"],
		rating_system.rating_from_JSON(json["white_rating"]),
		json["black"],
		rating_system.rating_from_JSON(json["black_rating"]),
		json["result"],
		json["time_control_id"],
		json["time_control_name"],
		json["when"]
	);
}

/**
 * @brief Parses a JSON string and returns a set of Game.
 * @param json A string with data of several Game.
 * @returns An array of Game objects.
 */
export function game_set_from_json(json: any): Game[] {
	if (typeof json === "string") {
		let json_parse = JSON.parse(json);
		return game_set_from_json(json_parse);
	}

	let player_set: Game[] = [];
	for (var player in json) {
		player_set.push(game_from_json(json[player]));
	}
	return player_set;
}