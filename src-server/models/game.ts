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

import { Rating } from '../rating_framework/rating';
import { TimeControlID } from './time_control';
import { DateStringLongMillis } from '../utils/time';

/// Result of a game
export type GameResult = 'white_wins' | 'black_wins' | 'draw';

/// A type for game IDs.
export type GameID = string;

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
	private readonly id: GameID;
	/// White player username
	private white: string;
	/// White in the state before the game
	private white_rating: Rating;
	/// White player username
	private black: string;
	/// White in the state before the game
	private black_rating: Rating;
	/// Result of the game
	private result: GameResult;
	/// Time control id
	private time_control_id: TimeControlID;
	/// Time control name (Classical (90 + 30), Blitz (5 + 3), ...)
	private time_control_name: string;
	/// Date when the game took place
	private when: DateStringLongMillis;

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
		id: GameID,
		white: string,
		white_rating: Rating,
		black: string,
		black_rating: Rating,
		result: GameResult,
		time_control_id: TimeControlID,
		time_control_name: string,
		when: DateStringLongMillis
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

	/// Return white's username
	get_white(): string {
		return this.white;
	}
	/// Return white's rating
	get_white_rating(): Rating {
		return this.white_rating;
	}
	/// Set white's rating
	set_white_rating(r: Rating) {
		this.white_rating = r;
	}

	/// Return black's username
	get_black(): string {
		return this.black;
	}
	/// Return black's rating
	get_black_rating(): Rating {
		return this.black_rating;
	}
	/// Set black's rating
	set_black_rating(r: Rating) {
		this.black_rating = r;
	}

	/// Return this game's time control id.
	get_time_control_id(): TimeControlID {
		return this.time_control_id;
	}
	/// Return this game's time control name.
	get_time_control_name(): string {
		return this.time_control_name;
	}

	/// Sets the game's result
	set_result(result: GameResult): void {
		this.result = result;
	}
	/// Returns game's result
	get_result(): GameResult {
		return this.result;
	}

	/// Return game's date
	get_date(): DateStringLongMillis {
		return this.when;
	}

	/// Is user 'username' in this game?
	is_user_involved(username: string): boolean {
		return this.white == username || this.black == username;
	}

	/// Returns the game's ID
	get_id(): GameID {
		return this.id;
	}
}
