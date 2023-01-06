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

import { Player, player_from_json } from './player';

/// Result of a game
export type GameResult = "white_wins" | "black_wins" | "draw";

// Type of games
export type GameType = "classical";

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
	/// White in the state before the game.
	public white: Player;
	/// Black in the state before the game.
	public black: Player;
	/// Result of the game.
	public result: GameResult;
	/// Type of the game (classical, ...)
	public game_type: GameType;
	/// Date when the game took place.
	public when: string;

	/**
	 * @brief Constructor
	 * @param white White player
	 * @param black Black player
	 * @param result Result of the game (white_wins, draw, black_wins)
	 * @param game_type Type of the game (classical, rapid, blitz, ...)
	 * @param when Date
	 */
	constructor(
		id: string,
		white: Player,
		black: Player,
		result: GameResult,
		game_type: GameType,
		when: string
	) {
		this.id = id;
		this.white = white;
		this.black = black;
		this.result = result;
		this.game_type = game_type;
		this.when = when;
	}

	is_user_involved(username: string): boolean {
		return this.white.get_username() == username || this.black.get_username() == username;
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

	return new Game(
		json["id"],
		player_from_json(json["white"]),
		player_from_json(json["black"]),
		json["result"],
		json["game_type"],
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
