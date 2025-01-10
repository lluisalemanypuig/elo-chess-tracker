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

import moment from 'moment';

/**
 * @brief Formats a date into a string YYYY-MM-DD..HH:mm:ss
 * @param date A Date object.
 * @returns A string.
 */
export function date_to_string(date: Date): string {
	return moment.utc(date).local().format('YYYY-MM-DD..HH:mm:ss');
}

/**
 * @brief Formats a date into a string YYYY-MM-DD..HH:mm:ss:SSS
 *
 * 'SSS' are milliseconds
 * @param date A Date object.
 * @returns A string.
 */
export function date_to_string_millis(date: Date): string {
	return moment.utc(date).local().format('YYYY-MM-DD..HH:mm:ss:SSS');
}

/**
 * @brief Formats a date into a string YYYY-MM-DD
 * @param date A Date object.
 * @returns A string.
 */
export function short_date_to_string(date: Date): string {
	return moment.utc(date).local().format('YYYY-MM-DD');
}

/**
 * @brief Parses a string containing a date with the format YYYY-MM-DD..HH:mm:ss.
 * @param date A string object.
 * @returns A Date object.
 */
export function string_to_date(date: string): Date {
	const info = date.split('..');

	const YYYY_MM_DD = info[0].split('-');
	const year = parseInt(YYYY_MM_DD[0]);
	const month = parseInt(YYYY_MM_DD[1]);
	const day = parseInt(YYYY_MM_DD[2]);

	const HH_MM_SS = info[1].split(':');
	const hours = parseInt(HH_MM_SS[0]);
	const minutes = parseInt(HH_MM_SS[1]);
	const seconds = parseInt(HH_MM_SS[2]);

	return new Date(year, month - 1, day, hours, minutes, seconds);
}

/**
 * @brief Parses a string containing a date with the format YYYY-MM-DD.
 * @param date A string object.
 * @returns A Date object.
 */
export function string_to_short_date(date: string): Date {
	const YYYY_MM_DD: string[] = (function (): string[] {
		if (date.includes('..')) {
			return date.split('..')[0].split('-');
		}
		return date.split('-');
	})();

	const year = parseInt(YYYY_MM_DD[0]);
	const month = parseInt(YYYY_MM_DD[1]);
	const day = parseInt(YYYY_MM_DD[2]);
	return new Date(year, month - 1, day);
}

/**
 * @brief Converts a YYYY-MM-DD..HH:mm:ss string into a YYYY-MM-DD string.
 * @param date A string object containing a date formatted with YYYY-MM-DD..HH:mm:ss.
 * @returns A string object containing a date formatted with YYYY-MM-DD.
 */
export function long_date_to_short_date(date: string): string {
	return date.split('..')[0];
}

/// Returns the current date in string format "YYYY-MM-DD..HH:mm:ss"
export function log_now(): string {
	return date_to_string(new Date());
}

/// Returns the current date in string format "YYYY-MM-DD..HH:mm:ss:SSS"
export function log_now_millis(): string {
	return date_to_string_millis(new Date());
}
