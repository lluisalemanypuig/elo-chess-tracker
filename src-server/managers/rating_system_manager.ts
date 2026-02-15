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

import { Game } from '../models/game';
import { Rating } from '../rating_framework/rating';
import { TimeControl, TimeControlID } from '../models/time_control';

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
	static get_instance(): RatingSystemManager {
		RatingSystemManager.instance = RatingSystemManager.instance || new RatingSystemManager();
		return RatingSystemManager.instance;
	}

	/// Function to evaluate a game
	private rating_func: Function = () => void {};
	/// Function to create a new rating
	private new_rating_func: Function = () => void {};
	/// Function to read a single rating JSON object
	private rating_from_JSON_func: Function = () => void {};

	/// All ratings used in the server
	private all_time_controls: TimeControl[] = [];
	/// All unique rating ids used in the server
	private all_unique_time_controls: TimeControlID[] = [];

	clear_functions(): void {
		this.rating_func = () => {
			throw new Error('Missing function to calculate a new rating from a game.');
		};
		this.new_rating_func = () => {
			throw new Error('Missing function to create a new rating.');
		};
		this.rating_from_JSON_func = () => {
			throw new Error('Missing rating from JSON conversion function.');
		};
	}
	clear_time_controls(): void {
		this.all_time_controls = [];
		this.all_unique_time_controls = [];
	}
	clear(): void {
		this.clear_functions();
		this.clear_time_controls();
	}

	set_rating_function(func: Function): void {
		this.rating_func = func;
	}
	get_rating_function(): Function {
		return this.rating_func;
	}
	set_rating_from_JSON_function(func: Function): void {
		this.rating_from_JSON_func = func;
	}
	get_rating_from_JSON_function(): Function {
		return this.rating_from_JSON_func;
	}
	set_new_rating_function(func: Function): void {
		this.new_rating_func = func;
	}
	get_new_rating_function(): Function {
		return this.new_rating_func;
	}

	apply_rating_function(game: Game): [Rating, Rating] {
		return this.rating_func(game);
	}
	get_new_rating(): Rating {
		return this.new_rating_func();
	}
	get_rating_from_json(json: any): Rating {
		return this.rating_from_JSON_func(json);
	}

	set_time_controls(all_ratings: TimeControl[]): void {
		this.all_time_controls = all_ratings;

		this.all_unique_time_controls = [
			...new Set(this.all_time_controls.map<string>((value: TimeControl): string => value.id))
		];
	}

	is_time_control_id_valid(id: TimeControlID): boolean {
		for (let i = 0; i < this.all_time_controls.length; ++i) {
			if (this.all_time_controls[i].id == id) {
				return true;
			}
		}
		return false;
	}

	get_time_controls(): TimeControl[] {
		return this.all_time_controls;
	}

	get_unique_time_controls_ids(): TimeControlID[] {
		return this.all_unique_time_controls;
	}
}
