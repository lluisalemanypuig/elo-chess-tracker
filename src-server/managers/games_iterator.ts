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

import path from 'path';
import fs from 'fs';

import { Game, GameID } from '../models/game';
import { DateStringLongMillis, DateStringShort } from '../utils/time';
import { game_set_from_json } from '../io/game';
import { search_by_key, where_should_be_inserted_by_key } from '../utils/searching';

/* TODO: add a function that iterates only through those game records
 * where a player has games in.
 */

/**
 * @brief Game database iterator
 *
 * This is a helper class to iterate over the set of games in the database of
 * a specific time control. It consists of:
 * - an index to the list of record files,
 * - an index to the list of games in a specific record file.
 */
export class GamesIterator {
	private directory: string = '';
	private record_files_list: DateStringShort[] = [];
	private record_idx: number = 0;

	private game_set: Game[] = [];
	private game_idx: number = 0;

	private load_current_record(): void {
		const filename = path.join(this.directory, this.record_files_list[this.record_idx]);
		this.game_set = game_set_from_json(fs.readFileSync(filename, 'utf8'));
		this.game_idx = 0;
	}

	private invalidate(): void {
		this.record_files_list = [];
		this.record_idx = 0;
		this.game_set = [];
		this.game_idx = 0;
	}

	constructor(directory: string) {
		this.directory = directory;
		this.record_files_list = fs.readdirSync(this.directory);
		this.record_idx = 0;
		if (!this.end_record_list()) {
			this.load_current_record();
		}
	}

	get_number_of_records(): number {
		return this.record_files_list.length;
	}
	get_all_records(): DateStringShort[] {
		return this.record_files_list;
	}
	get_current_record_name(): DateStringShort {
		return this.record_files_list[this.record_idx];
	}
	get_current_record_index(): number {
		return this.record_idx;
	}
	/// Returns a reference to the whole game set in current record.
	get_current_game_set(): Game[] {
		return this.game_set;
	}
	/// Returns a reference to the current game in the iteration.
	get_current_game(): Game {
		return this.game_set[this.game_idx];
	}
	get_current_game_index(): number {
		return this.game_idx;
	}

	delete_current_game(): void {
		this.game_set.splice(this.game_idx, 1);
	}

	/**
	 * @brief Returns true if the iteration reached its end.
	 *
	 * This corresponds to the end of the record file list.
	 * @returns True on end.
	 */
	end_record_list(): boolean {
		return this.record_idx >= this.record_files_list.length;
	}
	/**
	 * @brief Returns true if the iteration reached its end of the current record.
	 *
	 * This corresponds to the end of the iteration over the set of games in the
	 * current game record.
	 * @returns True on end.
	 */
	end_record_single(): boolean {
		return this.game_idx >= this.game_set.length;
	}

	/**
	 * @brief Advances one record in the iteration.
	 * @post Iterator to the game set is set to 0.
	 */
	next_record(): void {
		++this.record_idx;
		this.game_idx = 0;
		if (this.record_idx < this.record_files_list.length) {
			this.load_current_record();
		} else {
			this.invalidate();
		}
	}
	/**
	 * @brief Advances one game in the iteration.
	 *
	 * If the current record is consumed, the iteration continues to the next
	 * record.
	 */
	next_game(): void {
		++this.game_idx;
		if (this.game_idx == this.game_set.length) {
			this.game_idx = 0;
			++this.record_idx;
			if (this.record_idx < this.record_files_list.length) {
				this.load_current_record();
			} else {
				this.invalidate();
			}
		}
	}
	/**
	 * @brief Advances one game in the iteration.
	 *
	 * The iteration stops at the current record.
	 */
	next_game_record(): void {
		++this.game_idx;
	}

	/// Moves the iterator to the specific location of the iteration
	/// over the set of games.
	set_to_game(idx: number): void {
		this.game_idx = idx;
	}

	/// Locate the record named 'record'
	locate_record(record: DateStringShort): boolean {
		const [idx, exists] = where_should_be_inserted_by_key(this.record_files_list, (s: DateStringShort): number => {
			return record.localeCompare(s);
		});
		this.record_idx = idx;
		this.game_idx = 0;
		if (this.record_idx < this.record_files_list.length) {
			this.load_current_record();
		} else {
			this.invalidate();
		}
		return exists;
	}

	/**
	 * @brief Locate the iterator at the first game after a date.
	 *
	 * Locate the iterator at the first game that happened strictly after the
	 * given date 'when'.
	 * @param record The record file of games.
	 * @param when The date when the game happened.
	 * @returns True if such 'first after' game exists.
	 * @pre The iterator must have been initialized.
	 * @pre The iterator can be in any state prior to calling this function.
	 * @post The iterator is left in an invalid state in case of failure.
	 */
	locate_first_game_after(record: DateStringShort, when: DateStringLongMillis): boolean {
		const [record_idx, record_exists] = where_should_be_inserted_by_key(
			this.record_files_list,
			(s: DateStringShort): number => {
				return record.localeCompare(s);
			}
		);
		if (!record_exists) {
			this.record_idx = record_idx;
			this.game_idx = 0;
			return true;
		}
		this.record_idx = record_idx;
		this.load_current_record();
		let found: boolean = false;
		while (!found && !this.end_record_single()) {
			if (this.get_current_game().get_date() > when) {
				found = true;
			} else {
				this.next_game();
			}
		}
		return found;
	}

	/**
	 * @brief Locate the iterator at the game with ID equal to @e id.
	 * @param record The record file of games.
	 * @param id The identifier of the game.
	 * @returns True if such 'first after' game exists.
	 * @pre The iterator must have been initialized.
	 * @pre The iterator can be in any state prior to calling this function.
	 * @post The iterator is left in an invalid state in case of failure.
	 */
	locate_game(record: DateStringShort, id: GameID): boolean {
		this.record_idx = search_by_key(this.record_files_list, (s: DateStringShort): number => {
			return record.localeCompare(s);
		});
		if (this.record_idx == -1) {
			this.record_idx = this.record_files_list.length;
			return false;
		}
		this.load_current_record();
		let found: boolean = false;
		while (!found && !this.end_record_single()) {
			if (this.get_current_game().get_id() == id) {
				found = true;
			} else {
				this.next_game();
			}
		}
		return found;
	}
}
