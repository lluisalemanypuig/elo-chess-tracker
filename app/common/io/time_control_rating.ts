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

import { RatingSystemManager } from '@server/managers/rating_system_manager';
import { TimeControlRating, TimeControlRatingKeys } from '@common/models/time_control_rating';
import { read_json_array_string, read_json_object_string } from '@common/io/generic';

/**
 * @brief Parses a JSON string and returns a TimeControlRating object.
 * @param str A JSON string with data of a TimeControlRating object.
 * @returns A TimeControlRating object.
 */
function time_control_rating_from_json(json: any) {
	const rating = RatingSystemManager.get_instance().get_rating_from_json(json.rating);
	return new TimeControlRating(json.time_control, rating);
}

/**
 * @brief Parses a JSON string and returns a TimeControlRating object.
 * @param str A JSON string with data of a TimeControlRating object.
 * @returns A TimeControlRating object.
 */
export function time_control_rating_from_string(str: string): TimeControlRating | null {
	return read_json_object_string(str, TimeControlRatingKeys, time_control_rating_from_json);
}

/**
 * @brief Parses a JSON string and returns an array of TimeControlRating.
 * @param str A JSON string with data of several TimeControlRating.
 * @returns An array of TimeControlRating objects.
 */
export function time_control_rating_array_from_string(str: string): TimeControlRating[] | null {
	return read_json_array_string(str, TimeControlRatingKeys, time_control_rating_from_json);
}
