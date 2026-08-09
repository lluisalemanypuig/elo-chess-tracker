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

import moment from 'moment';
import { z } from 'zod';

/// DateFull: YYYY-MM-DD..HH:mm:ss:SSS

declare const DateFullBrand: unique symbol;
export type DateFullLocal = number & {
	readonly [DateFullBrand]: 'DateFull';
};
export const DateFullSchema = z.string().brand<'DateFullLocal'>();
export type DateFull = z.infer<typeof DateFullSchema>;

export function toDateFull(s: string): DateFull {
	return s as DateFull;
}

/// DateMajor: YYYY-MM-DD

declare const DateMajorBrand: unique symbol;
export type DateMajorLocal = number & {
	readonly [DateMajorBrand]: 'DateMajor';
};
export const DateMajorSchema = z.string().brand<'DateMajorLocal'>();
export type DateMajor = z.infer<typeof DateMajorSchema>;

export function toDateMajor(s: string): DateMajor {
	return s as DateMajor;
}

/// HH:mm:ss:SSS

declare const DateMinorBrand: unique symbol;
export type DateMinorLocal = number & {
	readonly [DateMinorBrand]: 'DateMinor';
};
export const DateMinorSchema = z.string().brand<'DateMinorLocal'>();
export type DateMinor = z.infer<typeof DateMinorSchema>;

export function toDateMinor(s: string): DateMinor {
	return s as DateMinor;
}

/**
 * @brief Formats a date into a string YYYY-MM-DD..HH:mm:ss:SSS
 *
 * 'SSS' are milliseconds
 * @param date A Date object.
 * @returns A string.
 */
export function dateToStringFull(date: Date): DateFull {
	return toDateFull(moment.utc(date).local().format('YYYY-MM-DD..HH:mm:ss:SSS'));
}

/**
 * @brief Converts a YYYY-MM-DD..* string into a YYYY-MM-DD string.
 * @param date A string object containing a date formatted with YYYY-MM-DD..*.
 * The part * can be anything.
 * @returns A string object containing a date formatted with YYYY-MM-DD.
 */
export function dateFullToMajor(date: DateFull): DateMajor {
	return toDateMajor(date.split('..')[0]);
}

/**
 * @brief Converts a YYYY-MM-DD..HH:mm:ss* string into a HH:mm:ss* string.
 * @param date A string object containing a date formatted with YYYY-MM-DD..HH:mm:ss*.
 * The part * can be anything.
 * @returns A string object containing a date formatted with HH:mm:ss*.
 */
export function dateFullToMinor(date: DateFull): DateMinor {
	return toDateMinor(date.split('..')[1]);
}

/**
 * @brief Converts a YYYY-MM-DD..HH:mm:ss* string into a HH:mm:ss* string.
 * @param date A string object containing a date formatted with YYYY-MM-DD..HH:mm:ss*.
 * The part * can be anything.
 * @returns A string object containing a date formatted with HH:mm:ss*.
 */
export function dateSplitMajorMinor(date: DateFull): [DateMajor, DateMinor] {
	const s = date.split('..');
	return [toDateMajor(s[0]), toDateMinor(s[1])];
}

/// Returns the current date in string format "YYYY-MM-DD..HH:mm:ss:SSS"
export function logNow(): DateFull {
	return dateToStringFull(new Date());
}
