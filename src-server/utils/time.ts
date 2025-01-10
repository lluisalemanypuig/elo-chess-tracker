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

/// YYYY-MM-DD..HH:mm:ss:SSS
export type DateStringLongMillis = string;

/// YYYY-MM-DD..HH:mm:ss
export type DateStringLong = string;

/// YYYY-MM-DD
export type DateStringShort = string;

import moment from 'moment';

/**
 * @brief Formats a date into a string YYYY-MM-DD..HH:mm:ss:SSS
 *
 * 'SSS' are milliseconds
 * @param date A Date object.
 * @returns A string.
 */
export function date_to_string_long_millis(date: Date): DateStringLongMillis {
	return moment.utc(date).local().format('YYYY-MM-DD..HH:mm:ss:SSS');
}

/**
 * @brief Formats a date into a string YYYY-MM-DD..HH:mm:ss
 * @param date A Date object.
 * @returns A string.
 */
export function date_to_string_long(date: Date): DateStringLong {
	return moment.utc(date).local().format('YYYY-MM-DD..HH:mm:ss');
}

/**
 * @brief Converts a YYYY-MM-DD..* string into a YYYY-MM-DD string.
 * @param date A string object containing a date formatted with YYYY-MM-DD..*.
 * The part * can be anything.
 * @returns A string object containing a date formatted with YYYY-MM-DD.
 */
export function long_date_to_short_date(date: DateStringLong | DateStringLongMillis): DateStringShort {
	return date.split('..')[0];
}

/// Returns the current date in string format "YYYY-MM-DD..HH:mm:ss"
export function log_now(): DateStringLong {
	return date_to_string_long(new Date());
}

/// Returns the current date in string format "YYYY-MM-DD..HH:mm:ss:SSS"
export function log_now_millis(): DateStringLongMillis {
	return date_to_string_long_millis(new Date());
}
