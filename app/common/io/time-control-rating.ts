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

import { RatingSystemManager } from '@server/managers/rating-system-manager';
import { TimeControlRating, TimeControlRatingKeys } from '@common/models/time-control-rating';
import { readJsonArrayString, readJsonObjectString } from '@common/io/generic';

/**
 * @brief Parses a JSON string and returns a TimeControlRating object.
 * @param str A JSON string with data of a TimeControlRating object.
 * @returns A TimeControlRating object.
 */
function timeControlRatingFromJson(json: any) {
	const rating = RatingSystemManager.getInstance().getRatingFromJson(json.rating);
	return new TimeControlRating(json.timeControl, rating);
}

/**
 * @brief Parses a JSON string and returns a TimeControlRating object.
 * @param str A JSON string with data of a TimeControlRating object.
 * @returns A TimeControlRating object.
 */
export function timeControlRatingFromString(str: string): TimeControlRating | null {
	return readJsonObjectString(str, TimeControlRatingKeys, timeControlRatingFromJson);
}

/**
 * @brief Parses a JSON string and returns an array of TimeControlRating.
 * @param str A JSON string with data of several TimeControlRating.
 * @returns An array of TimeControlRating objects.
 */
export function timeControlRatingArrayFromString(str: string): TimeControlRating[] | null {
	return readJsonArrayString(str, TimeControlRatingKeys, timeControlRatingFromJson);
}
