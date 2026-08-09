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
import { Rating } from '@common/models/rating-framework/rating';
import { TimeControlId, TimeControlName } from '@common/models/time-control';
import { DateFull } from '@common/utils/time';
import { PlayerPrivateId } from '@common/models/player';

/// Result of a game
export const GameResultSchema = z.enum(['white_wins', 'black_wins', 'draw']);
export type GameResult = z.infer<typeof GameResultSchema>;

export function oppositeResult(res: GameResult): GameResult {
	if (res == 'draw') {
		return 'draw';
	}
	if (res == 'white_wins') {
		return 'black_wins';
	}
	// res == "black_wins"
	return 'white_wins';
}

export function resultFromTextToValue(text: string): GameResult | undefined {
	if (text == '1 - 0') {
		return 'white_wins';
	}
	if (text == '1/2 - 1/2') {
		return 'draw';
	}
	if (text == '0 - 1') {
		return 'black_wins';
	}
	return undefined;
}

/// A type for game IDs.

declare const GameIdBrand: unique symbol;
export type GameIdLocal = string & {
	readonly [GameIdBrand]: 'GameIdLocal';
};
export const GameIdSchema = z.string().brand<'GameIdLocal'>();
export type GameId = z.infer<typeof GameIdSchema>;

export function toGameId(s: string): GameId {
	return s as GameId;
}

export const GameKeys = [
	'id',
	'title',
	'white',
	'whiteRating',
	'black',
	'blackRating',
	'result',
	'timeControlId',
	'timeControlName',
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
	public readonly id: GameId;
	/// Name of the game
	public title: string;
	/// White player username
	public readonly white: PlayerPrivateId;
	/// White in the state before the game
	public whiteRating: Rating;
	/// White player username
	public readonly black: PlayerPrivateId;
	/// White in the state before the game
	public blackRating: Rating;
	/// Result of the game
	public result: GameResult;
	/// Time control id
	public timeControlId: TimeControlId;
	/// Time control name (Classical (90 + 30), Blitz (5 + 3), ...)
	public timeControlName: TimeControlName;
	/// Date when the game took place
	public when: DateFull;

	/**
	 * @brief Constructor
	 * @param title Name of the game
	 * @param white White player
	 * @param whiteRating White rating before the game
	 * @param black Black player
	 * @param blackRating Black rating before the game
	 * @param result Result of the game (white_wins, draw, black_wins)
	 * @param timeControlId Time control id of the game
	 * @param timeControlName Time control name of the game
	 * @param when Date
	 */
	constructor(
		id: GameId,
		title: string,
		white: PlayerPrivateId,
		whiteRating: Rating,
		black: PlayerPrivateId,
		blackRating: Rating,
		result: GameResult,
		timeControlId: TimeControlId,
		timeControlName: TimeControlName,
		when: DateFull
	) {
		this.id = id;
		this.title = title;
		this.white = white;
		this.whiteRating = whiteRating;
		this.black = black;
		this.blackRating = blackRating;
		this.result = result;
		this.timeControlId = timeControlId;
		this.timeControlName = timeControlName;
		this.when = when;
	}

	/// Is user 'username' in this game?
	isUserInvolved(username: PlayerPrivateId): boolean {
		return this.white == username || this.black == username;
	}
}
