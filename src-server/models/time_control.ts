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

/**
 * @brief A time control ID.
 *
 * A time control ID is a unique name that can represent multiple time controls.
 * For example, a time control ID can be 'blitz' and can represent the time usual
 * controls 5+3, 5+0, 3+2.
 */
export type TimeControlID = string;

/**
 * @brief Time control as a tuple.
 *
 * Examples:
 * - id: "blitz_5_p_3", name: "Blitz (5 + 3)"
 * - id: "blitz_5_p_0", name: "Blitz (5 + 0)"
 *
 * Also:
 * - id: "blitz", name: "Blitz (5 + 3)"
 * - id: "blitz", name: "Blitz (5 + 0)"
 */
export class TimeControl {
	public id: TimeControlID;
	public name: string;

	constructor(id: TimeControlID, name: string) {
		this.id = id;
		this.name = name;
	}
}

/**
 * @brief Parses a JSON string or object and returns a TimeControl.
 * @param json A string with data of a TimeControl.
 * @returns A new TimeControl object.
 * @pre If @e json is a string, then it cannot start with '['.
 */
export function time_control_from_json(json: any): TimeControl {
	if (typeof json === 'string') {
		const json_parse = JSON.parse(json);
		return time_control_from_json(json_parse);
	}

	return new TimeControl(json['id'], json['name']);
}

/**
 * @brief Parses a JSON string and returns a set of TimeControl.
 * @param json A string with data of several TimeControl.
 * @returns An array of TimeControl objects.
 */
export function time_control_set_from_json(json: any): TimeControl[] {
	if (typeof json === 'string') {
		const json_parse = JSON.parse(json);
		return time_control_set_from_json(json_parse);
	}

	let time_control_set: TimeControl[] = [];
	for (var game_type in json) {
		time_control_set.push(time_control_from_json(json[game_type]));
	}
	return time_control_set;
}
