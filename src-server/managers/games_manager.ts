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
	/// Map from game ID to game record (file)
	private game_id_to_record_date: Map<string, string> = new Map();
	/// Map from game ID to time control id.
	private game_id_to_time_control: Map<string, string> = new Map();

	clear(): void {
		this.max_game_id = 0;
		this.game_id_to_record_date.clear();
		this.game_id_to_time_control.clear();
	}

	/// Current maximum game ID
	get_max_game_id(): number {
		return this.max_game_id;
	}
	/// Sets the maximum game ID
	set_max_game_id(id: number): void {
		this.max_game_id = id;
	}
	/// Increase current maximum game ID
	increase_max_game_id(): number {
		this.max_game_id += 1;
		return this.max_game_id;
	}

	/// Returns the date record file in which we find the game ID passed as parameter.
	get_game_id_record_date(game_id: string): string | undefined {
		return this.game_id_to_record_date.get(game_id);
	}
	// Sets the date record file 'when' in which we find the game ID passed as parameter.
	set_game_id_record_date(game_id: string, when: string): void {
		this.game_id_to_record_date.set(game_id, when);
	}

	/// Returns the time control id of the game
	get_game_id_time_control(game_id: string): string | undefined {
		return this.game_id_to_time_control.get(game_id);
	}
	// Sets the time control id of the game
	set_game_id_time_control(game_id: string, time_control_id: string): void {
		this.game_id_to_time_control.set(game_id, time_control_id);
	}
}
