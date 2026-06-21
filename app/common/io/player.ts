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

import { Player, PlayerKeys } from '@common/models/player';
import { read_json_array_string, read_json_object_string } from '@common/io/generic';
import { RatingSystemManager } from '@server/managers/rating_system_manager';
import { TimeControlRating } from '@common/models/time_control_rating';

/**
 * @brief Creates a Player object from a plain json object.
 * @param json A plain JSON object.
 * @returns A new Player object.
 */
export function player_from_json(json: any): Player {
	const manager = RatingSystemManager.get_instance();
	let ratings: TimeControlRating[] = [];
	for (const r of json.ratings) {
		const rating = new TimeControlRating(r.time_control, manager.get_rating_from_json(r.rating));
		ratings.push(rating);
	}

	return new Player(json.username, ratings);
}

/**
 * @brief Parses a JSON string and returns a Player.
 * @param str A JSON string with data of a Player.
 * @returns A new Player object.
 * @pre The value @e str cannot start with '['.
 */
export function player_from_string(str: string): Player | null {
	return read_json_object_string(str, PlayerKeys, player_from_json);
}

/**
 * @brief Parses a JSON string and returns an array of Player.
 * @param str A JSON string with data of several Player.
 * @returns An array of Player objects.
 */
export function player_array_from_json(str: string): Player[] | null {
	return read_json_array_string(str, PlayerKeys, player_from_json);
}
