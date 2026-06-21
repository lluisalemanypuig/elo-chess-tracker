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

import { read_json_array_string, read_json_object_string } from '@common/io/generic';
import { EloRating, EloRatingKeys } from '@common/models/rating_framework/Elo/rating';

/**
 * @brief Parses a JSON string and returns a TimeControlRating object.
 * @param str A JSON string with data of a TimeControlRating object.
 * @returns A TimeControlRating object.
 */
export function rating_from_json_Elo(json: any): EloRating {
	return new EloRating(json.rating, json.num_games, json.won, json.drawn, json.lost, json.K, json.surpassed_2400);
}

/**
 * @brief Parses a JSON string and returns a Player.
 * @param str A JSON string with data of a Player.
 * @returns A new Player object.
 * @pre Value @str cannot start with '['.
 */
export function rating_from_string_Elo(str: string): EloRating | null {
	return read_json_object_string(str, EloRatingKeys, rating_from_json_Elo);
}

/**
 * @brief Parses a JSON string and returns an array of Player.
 * @param str A JSON string with data of several Player.
 * @returns An array of Player objects.
 */
export function rating_array_from_string_Elo(str: string): EloRating[] | null {
	return read_json_array_string(str, EloRatingKeys, rating_from_json_Elo);
}
