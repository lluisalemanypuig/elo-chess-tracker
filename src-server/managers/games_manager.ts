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

import { GameID } from '../models/game';
import { TimeControlID } from '../models/time_control';
import { DateStringShort } from '../utils/time';
import { number_to_string } from '../utils/misc';

export class GameInfo {
	game_record: DateStringShort;
	time_control_id: TimeControlID;

	constructor(_when: DateStringShort, _time_id: TimeControlID) {
		this.game_record = _when;
		this.time_control_id = _time_id;
	}
}

export class GamesManager {
	/// The only instance of this class
	private static instance: GamesManager;

	constructor() {
		if (GamesManager.instance) {
			return GamesManager.instance;
		}
		GamesManager.instance = this;
	}

	static get_instance(): GamesManager {
		GamesManager.instance = GamesManager.instance || new GamesManager();
		return GamesManager.instance;
	}

	/// Number of games in the system
	private max_game_id: number = 0;
	/// Map from game ID to game information
	private game_info: Map<GameID, GameInfo> = new Map();

	clear(): void {
		this.max_game_id = 0;
		this.game_info.clear();
	}

	/// Does a game exist?
	game_exists(game_id: GameID): boolean {
		return this.game_info.has(game_id);
	}
	num_games(): number {
		return this.game_info.size;
	}

	/**
	 * @brief Current maximum game ID, over all existing games.
	 * @returns The largest existing ID. When there are no games, returns the
	 * all-zero ID.
	 */
	get_max_game_id(): string {
		return number_to_string(this.max_game_id);
	}
	/// Sets the maximum game ID
	set_max_game_id(id: number): void {
		this.max_game_id = id;
	}
	/// Increase current maximum game ID
	new_game_id(): GameID {
		this.max_game_id += 1;
		return number_to_string(this.max_game_id);
	}

	/**
	 * @brief Adds a game to the manager.
	 * @param game_id ID of the game to be added.
	 * @param when The timestamp of the when the game occurred.
	 * @param time_id The time control id of the game (recall, could be 'blitz',
	 * 'classical', ...)
	 */
	add_game(game_id: GameID, when: DateStringShort, time_id: TimeControlID): void {
		this.game_info.set(game_id, new GameInfo(when, time_id));
	}

	/// Returns the information associated to game @e game_id.
	get_game_info(game_id: GameID): GameInfo | undefined {
		return this.game_info.get(game_id);
	}
}
