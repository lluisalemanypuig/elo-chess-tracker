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
import { Rating } from '@server/rating_framework/rating';
import { TimeControlID } from './time_control';
import { DateStringLongMillis } from '@server/utils/time';

/// Result of a game
export const GameResultSchema = z.enum(['white_wins', 'black_wins', 'draw']);
export type GameResult = z.infer<typeof GameResultSchema>;

export function opposite_result(res: GameResult): GameResult {
	if (res == 'draw') {
		return 'draw';
	}
	if (res == 'white_wins') {
		return 'black_wins';
	}
	// res == "black_wins"
	return 'white_wins';
}

/// A type for game IDs.
export type GameID = string;

export const GameKeys = [
	'id',
	'title',
	'white',
	'white_rating',
	'black',
	'black_rating',
	'result',
	'time_control_id',
	'time_control_name',
	'when'
];

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
	public readonly id: GameID;
	/// Name of the game
	public title: string;
	/// White player username
	public readonly white: string;
	/// White in the state before the game
	public white_rating: Rating;
	/// White player username
	public readonly black: string;
	/// White in the state before the game
	public black_rating: Rating;
	/// Result of the game
	public result: GameResult;
	/// Time control id
	public time_control_id: TimeControlID;
	/// Time control name (Classical (90 + 30), Blitz (5 + 3), ...)
	public time_control_name: string;
	/// Date when the game took place
	public when: DateStringLongMillis;

	/**
	 * @brief Constructor
	 * @param title Name of the game
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
		title: string,
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
		this.title = title;
		this.white = white;
		this.white_rating = white_rating;
		this.black = black;
		this.black_rating = black_rating;
		this.result = result;
		this.time_control_id = time_control_id;
		this.time_control_name = time_control_name;
		this.when = when;
	}

	/// Is user 'username' in this game?
	is_user_involved(username: string): boolean {
		return this.white == username || this.black == username;
	}
}
