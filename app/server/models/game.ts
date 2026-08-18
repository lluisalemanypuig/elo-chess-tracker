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

import { TimeControlId, TimeControlName } from '@common/models/time-control';
import { DateFull } from '@common/utils/time';
import { PlayerPrivateId } from '@common/models/player-id';
import { GameId } from '@common/models/game-id';
import { GameResult } from '@common/models/game-result';
import { Rating } from '@server/models/rating-framework/rating';
import { GameEditLog } from '@app/common/models/game-edit-history';

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
	'when',
	'history'
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
	public readonly id: GameId;
	public title: string;
	public readonly white: PlayerPrivateId;
	public whiteRating: Rating;
	public readonly black: PlayerPrivateId;
	public blackRating: Rating;
	public result: GameResult;
	public timeControlId: TimeControlId;
	public timeControlName: TimeControlName;
	public when: DateFull;
	public history: GameEditLog[];

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
		when: DateFull,
		history: GameEditLog[]
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
		this.history = history;
	}

	// Is user 'username' in this game?
	isUserInvolved(username: PlayerPrivateId): boolean {
		return this.white === username || this.black === username;
	}
}
