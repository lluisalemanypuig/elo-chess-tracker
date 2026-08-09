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

import Debug from 'debug';
const debug = Debug('ELO_CHESS_TRACKER:managers/challenges');

import path from 'path';
import fs from 'fs';

import { Game, GameId } from '@common/models/game';
import { DateFull, DateMajor, logNow, toDateMajor } from '@common/utils/time';
import { gameArrayFromString } from '@common/io/game';
import { searchByKey, whereShouldBeInsertedByKey } from '@server/utils/searching';
import { readDirectory } from '@server/utils/read-directory';
import { isNotDefined } from '@common/utils/is-defined';

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
	private recordFilesList: DateMajor[] = [];
	private recordIdx: number = 0;

	private gameSet: Game[] = [];
	private gameIdx: number = 0;

	private loadCurrentRecord(): void {
		const filename = path.join(this.directory, this.recordFilesList[this.recordIdx]);
		const array = gameArrayFromString(fs.readFileSync(filename, 'utf8'));
		if (isNotDefined(array)) {
			debug(logNow(), `File '${filename}' does not contain a valid game array.`);
			return;
		}
		this.gameSet = array;
		this.gameIdx = 0;
	}

	private invalidate(): void {
		this.recordFilesList = [];
		this.recordIdx = 0;
		this.gameSet = [];
		this.gameIdx = 0;
	}

	constructor(directory: string) {
		this.directory = directory;
		this.recordFilesList = readDirectory(this.directory).map(toDateMajor);
		this.recordIdx = 0;
		if (!this.endRecordList()) {
			this.loadCurrentRecord();
		}
	}

	getNumberOfRecords(): number {
		return this.recordFilesList.length;
	}
	getAllRecords(): DateMajor[] {
		return this.recordFilesList;
	}
	getCurrentRecordName(): DateMajor {
		return this.recordFilesList[this.recordIdx];
	}
	getCurrentRecordIndex(): number {
		return this.recordIdx;
	}
	/// Returns a reference to the whole game set in current record.
	getCurrentGameArray(): Game[] {
		return this.gameSet;
	}
	/// Returns a reference to the current game in the iteration.
	getCurrentGame(): Game {
		return this.gameSet[this.gameIdx];
	}
	getCurrentGameIndex(): number {
		return this.gameIdx;
	}

	deleteCurrentGame(): void {
		this.gameSet.splice(this.gameIdx, 1);
	}

	/**
	 * @brief Returns true if the iteration reached its end.
	 *
	 * This corresponds to the end of the record file list.
	 * @returns True on end.
	 */
	endRecordList(): boolean {
		return this.recordIdx >= this.recordFilesList.length;
	}
	/**
	 * @brief Returns true if the iteration reached its end of the current record.
	 *
	 * This corresponds to the end of the iteration over the set of games in the
	 * current game record.
	 * @returns True on end.
	 */
	endRecordSingle(): boolean {
		return this.gameIdx >= this.gameSet.length;
	}

	/**
	 * @brief Advances one record in the iteration.
	 * @post Iterator to the game set is set to 0.
	 */
	nextRecord(): void {
		++this.recordIdx;
		this.gameIdx = 0;
		if (this.recordIdx < this.recordFilesList.length) {
			this.loadCurrentRecord();
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
	nextGame(): void {
		++this.gameIdx;
		if (this.gameIdx === this.gameSet.length) {
			this.gameIdx = 0;
			++this.recordIdx;
			if (this.recordIdx < this.recordFilesList.length) {
				this.loadCurrentRecord();
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
	nextGameRecord(): void {
		++this.gameIdx;
	}

	/// Moves the iterator to the specific location of the iteration
	/// over the set of games.
	setToGame(idx: number): void {
		this.gameIdx = idx;
	}

	/// Locate the record named 'record'
	locateRecord(record: DateMajor): boolean {
		const [idx, exists] = whereShouldBeInsertedByKey(this.recordFilesList, (s: DateMajor): number => {
			return record.localeCompare(s);
		});
		this.recordIdx = idx;
		this.gameIdx = 0;
		if (this.recordIdx < this.recordFilesList.length) {
			this.loadCurrentRecord();
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
	locateFirstGameAfter(record: DateMajor, when: DateFull): boolean {
		const [recordIdx, recordExists] = whereShouldBeInsertedByKey(this.recordFilesList, (s: DateMajor): number => {
			return record.localeCompare(s);
		});
		if (!recordExists) {
			this.recordIdx = recordIdx;
			this.gameIdx = 0;
			return true;
		}
		this.recordIdx = recordIdx;
		this.loadCurrentRecord();
		let found: boolean = false;
		while (!found && !this.endRecordSingle()) {
			if (this.getCurrentGame().when > when) {
				found = true;
			} else {
				this.nextGame();
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
	locateGame(record: DateMajor, id: GameId): boolean {
		this.recordIdx = searchByKey(this.recordFilesList, (s: DateMajor): number => {
			return record.localeCompare(s);
		});
		if (this.recordIdx === -1) {
			this.recordIdx = this.recordFilesList.length;
			return false;
		}
		this.loadCurrentRecord();
		let found: boolean = false;
		while (!found && !this.endRecordSingle()) {
			if (this.getCurrentGame().id === id) {
				found = true;
			} else {
				this.nextGame();
			}
		}
		return found;
	}
}
