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

import { Challenge } from '../models/challenge';

/**
 * @brief Parses a JSON string or object and returns a Challenge.
 * @param json A JSON string or object with data of a Challenge.
 * @returns A new Challenge object.
 * @pre If @e json is a string then it cannot start with '['.
 */
export function challenge_from_json(json: any): Challenge {
	if (typeof json === 'string') {
		const json_parse = JSON.parse(json);
		return challenge_from_json(json_parse);
	}

	let c = new Challenge(json['id'], json['sent_by'], json['sent_to'], json['when_challenge_sent']);

	const when_challenge_accepted = json['when_challenge_accepted'];
	if (when_challenge_accepted != undefined) {
		c.set_challenge_accepted(when_challenge_accepted);
	}

	const result_set_by = json['result_set_by'];
	const when_result_set = json['when_result_set'];
	const white = json['white'];
	const black = json['black'];
	const result = json['result'];
	const time_control_id = json['time_control_id'];
	const time_control_name = json['time_control_name'];
	if (
		result_set_by != undefined &&
		when_result_set != undefined &&
		white != undefined &&
		black != undefined &&
		result != undefined &&
		time_control_id != undefined &&
		time_control_name != undefined
	) {
		c.set_result(result_set_by, when_result_set, white, black, result, time_control_id, time_control_name);
	}

	const result_accepted_by = json['result_accepted_by'];
	const when_result_accepted = json['when_result_accepted'];
	if (result_accepted_by != undefined && when_result_accepted != undefined) {
		c.set_result_accepted(result_accepted_by, when_result_accepted);
	}
	return c;
}

/**
 * @brief Parses a JSON string or object and returns a set of Challenge.
 * @param json A JSON string or object with data of several Challenge.
 * @returns An array of Challenge objects.
 */
export function challenge_set_from_json(json: any): Challenge[] {
	if (typeof json === 'string') {
		const json_parse = JSON.parse(json);
		return challenge_set_from_json(json_parse);
	}

	let player_set: Challenge[] = [];
	for (var player in json) {
		player_set.push(challenge_from_json(json[player]));
	}
	return player_set;
}
