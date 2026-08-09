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

import { GameId, toGameId } from '@common/models/game';
import { TimeControlId } from '@common/models/time-control';
import { DateMajor } from '@common/utils/time';
import { numberToString } from '@server/utils/misc';

export const GAMEIDLENGTH = 10;

/**
 * @brief The minimal summary of a game.
 */
export class GameInfo {
	public gameRecord: DateMajor;
	public timeControlId: TimeControlId;

	constructor(when: DateMajor, timeId: TimeControlId) {
		this.gameRecord = when;
		this.timeControlId = timeId;
	}
}

/**
 * @brief Games Manager singleton class.
 *
 * This class does not store the whole set of games in memory since the number of
 * games is expected to be large. Instead, it only stores partial information about
 * the games (@ref gameInfo).
 */
export class GamesManager {
	/// The only instance of this class
	private static instance: GamesManager;

	constructor() {
		if (GamesManager.instance) {
			return GamesManager.instance;
		}
		GamesManager.instance = this;
	}

	static getInstance(): GamesManager {
		GamesManager.instance = GamesManager.instance || new GamesManager();
		return GamesManager.instance;
	}

	/// Number of games in the system
	private maxGameId: number = 0;
	/// Map from game ID to game information
	private gameInfo: Map<GameId, GameInfo> = new Map();

	clear(): void {
		this.maxGameId = 0;
		this.gameInfo.clear();
	}

	/// Does a game exist?
	gameExists(gameId: GameId): boolean {
		return this.gameInfo.has(gameId);
	}
	numGames(): number {
		return this.gameInfo.size;
	}

	/**
	 * @brief Current maximum game ID, over all existing games.
	 * @returns The largest existing ID. When there are no games, returns the
	 * all-zero ID.
	 */
	getMaxGameId(): GameId {
		const strId = numberToString(this.maxGameId, GAMEIDLENGTH);
		return toGameId(strId);
	}
	/// Sets the maximum game ID
	setMaxGameId(id: number): void {
		this.maxGameId = id;
	}
	/// Increase current maximum game ID
	newGameId(): GameId {
		this.maxGameId += 1;
		const strId = numberToString(this.maxGameId, GAMEIDLENGTH);
		return toGameId(strId);
	}

	/**
	 * @brief Adds a game to the manager.
	 * @param gameId ID of the game to be added.
	 * @param when The timestamp of the when the game occurred.
	 * @param timeId The time control id of the game (recall, could be 'blitz',
	 * 'classical', ...)
	 */
	addGame(gameId: GameId, when: DateMajor, timeId: TimeControlId): void {
		this.gameInfo.set(gameId, new GameInfo(when, timeId));
	}

	/// Returns the information associated to game @e gameId.
	getGameInfo(gameId: GameId): GameInfo | undefined {
		return this.gameInfo.get(gameId);
	}

	/// Delete a game ID from the manager
	deleteGameId(id: GameId): void {
		this.gameInfo.delete(id);
	}
}
