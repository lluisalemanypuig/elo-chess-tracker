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

import { Game } from '@common/models/game';
import { Rating } from '@common/models/rating-framework/rating';
import { TimeControl, TimeControlId } from '@common/models/time-control';

/**
 * @brief Rating System Manager singleton class
 *
 * This class manages the functions used to calculate ratings according to the
 * configuration of the server.
 */
export class RatingSystemManager {
	/// The only instance of this class
	private static instance: RatingSystemManager;

	constructor() {
		if (RatingSystemManager.instance) {
			return RatingSystemManager.instance;
		}
		RatingSystemManager.instance = this;
	}

	/**
	 * @brief Returns the only instance of this class
	 * @returns The only instance of this class
	 * @pre Method @ref initialize must have been called before
	 */
	static getInstance(): RatingSystemManager {
		RatingSystemManager.instance = RatingSystemManager.instance || new RatingSystemManager();
		return RatingSystemManager.instance;
	}

	/// Function to evaluate a game
	private ratingFormulaFunc: Function = () => void {};

	getRatingFunction(): Function {
		return this.ratingFormulaFunc;
	}
	applyRatingFunction(game: Game): [Rating, Rating] {
		return this.ratingFormulaFunc(game);
	}

	/// Function to create a new rating
	private newRatingFunc: Function = () => void {};

	getNewRatingFunction(): Function {
		return this.newRatingFunc;
	}
	getNewRating(): Rating {
		return this.newRatingFunc();
	}

	/// Function to read a single rating JSON string
	private ratingFromStringFunc: Function = () => void {};

	getRatingFromStringFunction(): Function {
		return this.ratingFromStringFunc;
	}
	getRatingFromString(str: string) {
		return this.ratingFromStringFunc(str);
	}

	/// Function to read a single rating JSON string
	private ratingFromJsonFunc: Function = () => void {};

	getRatingFromJsonFunction(): Function {
		return this.ratingFromJsonFunc;
	}
	getRatingFromJson(json: any) {
		return this.ratingFromJsonFunc(json);
	}

	/// All ratings used in the server
	private allTimeControls: TimeControl[] = [];
	/// All unique rating ids used in the server
	private allUniqueTimeControls: TimeControlId[] = [];

	setFunctions(formula: Function, newRating: Function, fromString: Function, fromJson: Function) {
		this.ratingFormulaFunc = formula;
		this.newRatingFunc = newRating;
		this.ratingFromStringFunc = fromString;
		this.ratingFromJsonFunc = fromJson;
	}

	clearFunctions() {
		this.ratingFormulaFunc = () => {
			throw new Error('Missing formula function for this rating system.');
		};
		this.newRatingFunc = () => {
			throw new Error('Missing function to create a new rating.');
		};
		this.ratingFromStringFunc = () => {
			throw new Error('Missing JSON string conversion function.');
		};
		this.ratingFromJsonFunc = () => {
			throw new Error('Missing JSON object conversion function.');
		};
	}
	clearTimeControls() {
		this.allTimeControls = [];
		this.allUniqueTimeControls = [];
	}
	clear() {
		this.clearFunctions();
		this.clearTimeControls();
	}

	setTimeControls(allRatings: TimeControl[]) {
		this.allTimeControls = allRatings;

		this.allUniqueTimeControls = [
			...new Set(this.allTimeControls.map((value: TimeControl): TimeControlId => value.id))
		];
	}

	isTimeControlIdValid(id: TimeControlId): boolean {
		for (const tc of this.allTimeControls) {
			if (tc.id === id) {
				return true;
			}
		}
		return false;
	}

	getTimeControls(): TimeControl[] {
		return this.allTimeControls;
	}

	getUniqueTimeControlsIds(): TimeControlId[] {
		return this.allUniqueTimeControls;
	}
}
