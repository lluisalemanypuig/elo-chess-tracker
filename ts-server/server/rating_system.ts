/*
Elo rating for a Chess Club
Copyright (C) 2023 - 2024  Lluís Alemany Puig

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

Contact:
    Lluís Alemany Puig
    https://github.com/lluisalemanypuig
*/

import { Game } from '../models/game';
import { Rating } from '../rating_framework/rating';
import { TimeControl } from '../models/time_control';
import { search_linear_by_key } from '../utils/searching';

/**
 * @brief Rating system in the web
 */
export class RatingSystem {
	/// The only instance of this class
	private static instance: RatingSystem;

	constructor() {
		if (RatingSystem.instance) {
			return RatingSystem.instance;
		}
		RatingSystem.instance = this;
	}

	/// Function to evaluate a game
	private rating_formula: Function = () => void {};
	/// Function to create a new rating
	private new_rating: Function = () => void {};

	/// Function to read a single rating JSON object
	private rating_from_JSON: Function = () => void {};
	/// All ratings used in the web
	private all_time_controls: TimeControl[] = [];
	/// All unique rating ids used in the web
	private all_unique_time_controls: string[] = [];

	/**
	 * @brief Returns the only instance of this class
	 * @returns The only instance of this class
	 * @pre Method @ref initialize must have been called before
	 */
	static get_instance(): RatingSystem {
		RatingSystem.instance = RatingSystem.instance || new RatingSystem();
		return RatingSystem.instance;
	}

	set_rating_formula(formula: Function): void {
		this.rating_formula = formula;
	}
	apply_rating_formula(game: Game): [Rating, Rating] {
		return this.rating_formula(game);
	}
	get_new_rating(): Rating {
		return this.new_rating();
	}

	set_rating_from_JSON_formula(read_rating: Function): void {
		this.rating_from_JSON = read_rating;
	}
	get_rating_from_json(json: any): Rating {
		return this.rating_from_JSON(json);
	}

	set_new_rating(new_rating: Function): void {
		this.new_rating = new_rating;
	}
	set_time_controls(all_ratings: TimeControl[]): void {
		this.all_time_controls = all_ratings;
	}
	make_unique_time_controls(): void {
		this.all_unique_time_controls = [
			...new Set(this.all_time_controls.map<string>((value: TimeControl): string => value.id))
		];
	}
	get_name_time_control(time_control_id: string): string {
		const index = search_linear_by_key(this.all_time_controls, (t: TimeControl): boolean => {
			return t.id == time_control_id;
		});
		if (index >= this.all_time_controls.length) {
			return '?';
		}
		return this.all_time_controls[index].name;
	}

	is_time_control_id_valid(id: string): boolean {
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

	get_unique_time_controls_ids(): string[] {
		return this.all_unique_time_controls;
	}
}

import { player_vs_player as Elo } from '../rating_framework/Elo/formula';
import { Elo_rating_from_json, Elo_rating_new } from '../rating_framework/Elo/rating';

/**
 * @brief Initializes the class @ref RatingSystem based on the system in @e name.
 * @param name Name of the rating system.
 * @returns True if the name is valid; false if otherwise.
 */
export function initialize_rating_functions(name: string): boolean {
	let rating_system = RatingSystem.get_instance();
	if (name == 'Elo') {
		rating_system.set_rating_formula(Elo);
		rating_system.set_rating_from_JSON_formula(Elo_rating_from_json);
		rating_system.set_new_rating(Elo_rating_new);
		return true;
	}

	return false;
}

/**
 * @brief Initialize the time controls in the @ref RatingSystem.
 * @param all_time_controls The list of time controls for the system.
 * @pre The RatingSystem must have been initialized via @ref initialize_rating_system.
 */
export function initialize_rating_time_controls(all_time_controls: TimeControl[]): void {
	let rating_system = RatingSystem.get_instance();
	rating_system.set_time_controls(all_time_controls);
	rating_system.make_unique_time_controls();
}
