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

import { Player } from '../models/player';
import { time_control_rating_set_from_json } from './time_control_rating';

/**
 * @brief Parses a JSON string or object and returns a Player.
 * @param json A JSON string or object with data of a Player.
 * @returns A new Player object.
 * @pre If @e json is a string then it cannot start with '['.
 */
export function player_from_json(json: any): Player {
	if (typeof json === 'string') {
		const json_parse = JSON.parse(json);
		return player_from_json(json_parse);
	}

	return new Player(json['username'], time_control_rating_set_from_json(json['ratings']));
}

/**
 * @brief Parses a JSON string or object and returns a set of Player.
 * @param json A JSON string or object with data of several Player.
 * @returns An array of Player objects.
 */
export function player_set_from_json(json: any): Player[] {
	if (typeof json === 'string') {
		const json_parse = JSON.parse(json);
		return player_set_from_json(json_parse);
	}

	let player_set: Player[] = [];
	for (var player in json) {
		player_set.push(player_from_json(json[player]));
	}
	return player_set;
}
