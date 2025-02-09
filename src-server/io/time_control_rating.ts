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

import { RatingSystemManager } from '../managers/rating_system_manager';
import { TimeControlRating } from '../models/time_control_rating';

/**
 * @brief Parses a JSON string or object and returns a set of TimeControlRating.
 * @param json A JSON string or object with data of several TimeControlRating.
 * @returns An array of TimeControlRating objects.
 */
export function time_control_rating_from_json(json: any): TimeControlRating {
	if (typeof json === 'string') {
		const json_parse = JSON.parse(json);
		return time_control_rating_from_json(json_parse);
	}

	return new TimeControlRating(
		json['time_control'],
		RatingSystemManager.get_instance().get_rating_from_json(json['rating'])
	);
}

/**
 * @brief Parses a JSON string or object and returns a set of TimeControlRating.
 * @param json A JSON string or object with data of several TimeControlRating.
 * @returns An array of TimeControlRating objects.
 */
export function time_control_rating_set_from_json(json: any): TimeControlRating[] {
	if (typeof json === 'string') {
		const json_parse = JSON.parse(json);
		return time_control_rating_set_from_json(json_parse);
	}

	let time_control_rating: TimeControlRating[] = [];
	for (var player in json) {
		time_control_rating.push(time_control_rating_from_json(json[player]));
	}
	return time_control_rating;
}
