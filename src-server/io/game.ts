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

import { Game } from '../models/game';
import { RatingSystemManager } from '../managers/rating_system_manager';

/**
 * @brief Parses a JSON string or object and returns a Game.
 * @param json A string with data of a Game.
 * @returns A new Game object.
 * @pre If @e json is a string, then it cannot start with '['.
 */
export function game_from_json(json: any): Game {
	if (typeof json === 'string') {
		const json_parse = JSON.parse(json);
		return game_from_json(json_parse);
	}

	const rating_system = RatingSystemManager.get_instance();
	return new Game(
		json['id'],
		json['white'],
		rating_system.get_rating_from_json(json['white_rating']),
		json['black'],
		rating_system.get_rating_from_json(json['black_rating']),
		json['result'],
		json['time_control_id'],
		json['time_control_name'],
		json['when']
	);
}

/**
 * @brief Parses a JSON string and returns a set of Game.
 * @param json A string with data of several Game.
 * @returns An array of Game objects.
 */
export function game_set_from_json(json: any): Game[] {
	if (typeof json === 'string') {
		const json_parse = JSON.parse(json);
		return game_set_from_json(json_parse);
	}

	let game_set: Game[] = [];
	for (var game in json) {
		game_set.push(game_from_json(json[game]));
	}
	return game_set;
}
