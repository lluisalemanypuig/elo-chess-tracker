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

import { TimeControl, TimeControlArraySchema, TimeControlSchema } from '@common/models/time_control';
import { read_schema } from '@common/io/generic';

/**
 * @brief Parses a JSON string and returns a TimeControl.
 * @param str A string with data of a TimeControl.
 * @returns A new TimeControl object.
 */
export function time_control_from_string(str: string): TimeControl | null {
	return read_schema(TimeControlSchema, str);
}

/**
 * @brief Parses a JSON string and returns an array of TimeControl.
 * @param str A string with data of several TimeControl.
 * @returns An array of TimeControl objects.
 */
export function time_control_array_from_string(str: string): TimeControl[] | null {
	return read_schema(TimeControlArraySchema, str);
}
