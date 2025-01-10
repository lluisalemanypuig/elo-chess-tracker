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

import { TimeControl } from '../models/time_control';
import { Elo_player_vs_player } from '../rating_framework/Elo/formula';
import { Elo_rating_from_json, Elo_new_rating } from '../rating_framework/Elo/rating';
import { RatingSystemManager } from './rating_system_manager';

/**
 * @brief Initializes the class @ref RatingSystem based on the system in @e name.
 * @param name Name of the rating system.
 * @returns True if the name is valid; false if otherwise.
 */
export function initialize_rating_functions(name: string): boolean {
	let rating_system = RatingSystemManager.get_instance();
	if (name == 'Elo') {
		rating_system.set_rating_function(Elo_player_vs_player);
		rating_system.set_rating_from_JSON_function(Elo_rating_from_json);
		rating_system.set_new_rating_function(Elo_new_rating);
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
	let rating_system = RatingSystemManager.get_instance();
	rating_system.set_time_controls(all_time_controls);
}
