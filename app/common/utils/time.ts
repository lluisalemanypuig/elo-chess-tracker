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

/// DateYYYYMMDDHHmmssSSS: YYYY-MM-DD..HH:mm:ss:SSS

declare const DateYYYYMMDDHHmmssSSSBrand: unique symbol;
export type DateYYYYMMDDHHmmssSSSLocal = number & {
	readonly [DateYYYYMMDDHHmmssSSSBrand]: 'DateYYYYMMDDHHmmssSSS';
};
export const DateYYYYMMDDHHmmssSSSSchema = z.string().brand<'DateYYYYMMDDHHmmssSSSLocal'>();
export type DateYYYYMMDDHHmmssSSS = z.infer<typeof DateYYYYMMDDHHmmssSSSSchema>;

export function toDateYYYYMMDDHHmmssSSS(s: string): DateYYYYMMDDHHmmssSSS {
	return s as DateYYYYMMDDHHmmssSSS;
}

/// DateYYYYMMDDHHmmss: YYYY-MM-DD..HH:mm:ss

declare const DateYYYYMMDDHHmmssBrand: unique symbol;
export type DateYYYYMMDDHHmmssLocal = number & {
	readonly [DateYYYYMMDDHHmmssBrand]: 'DateYYYYMMDDHHmmss';
};
export const DateYYYYMMDDHHmmssSchema = z.string().brand<'DateYYYYMMDDHHmmssLocal'>();
export type DateYYYYMMDDHHmmss = z.infer<typeof DateYYYYMMDDHHmmssSchema>;

export function toDateYYYYMMDDHHmmss(s: string): DateYYYYMMDDHHmmss {
	return s as DateYYYYMMDDHHmmss;
}

/// DateYYYYMMDD: YYYY-MM-DD

declare const DateYYYYMMDDBrand: unique symbol;
export type DateYYYYMMDDLocal = number & {
	readonly [DateYYYYMMDDBrand]: 'DateYYYYMMDD';
};
export const DateYYYYMMDDSchema = z.string().brand<'DateYYYYMMDDLocal'>();
export type DateYYYYMMDD = z.infer<typeof DateYYYYMMDDSchema>;

export function toDateYYYYMMDD(s: string): DateYYYYMMDD {
	return s as DateYYYYMMDD;
}

/// HH:mm:ss:SSS

declare const DateHHmmssSSSBrand: unique symbol;
export type DateHHmmssSSSLocal = number & {
	readonly [DateHHmmssSSSBrand]: 'DateHHmmssSSS';
};
export const DateHHmmssSSSSchema = z.string().brand<'DateHHmmssSSSLocal'>();
export type DateHHmmssSSS = z.infer<typeof DateHHmmssSSSSchema>;

export function toDateHHmmssSSS(s: string): DateHHmmssSSS {
	return s as DateHHmmssSSS;
}

/**
 * @brief Formats a date into a string YYYY-MM-DD..HH:mm:ss:SSS
 *
 * 'SSS' are milliseconds
 * @param date A Date object.
 * @returns A string.
 */
export function date_to_string_long_millis(date: Date): DateYYYYMMDDHHmmssSSS {
	return toDateYYYYMMDDHHmmssSSS(moment.utc(date).local().format('YYYY-MM-DD..HH:mm:ss:SSS'));
}

/**
 * @brief Formats a date into a string YYYY-MM-DD..HH:mm:ss
 * @param date A Date object.
 * @returns A string.
 */
export function date_to_string_long(date: Date): DateYYYYMMDDHHmmss {
	return toDateYYYYMMDDHHmmss(moment.utc(date).local().format('YYYY-MM-DD..HH:mm:ss'));
}

/**
 * @brief Converts a YYYY-MM-DD..* string into a YYYY-MM-DD string.
 * @param date A string object containing a date formatted with YYYY-MM-DD..*.
 * The part * can be anything.
 * @returns A string object containing a date formatted with YYYY-MM-DD.
 */
export function long_date_to_short_date(date: DateYYYYMMDDHHmmss | DateYYYYMMDDHHmmssSSS): DateYYYYMMDD {
	return toDateYYYYMMDD(date.split('..')[0]);
}

/**
 * @brief Converts a YYYY-MM-DD..HH:mm:ss* string into a HH:mm:ss* string.
 * @param date A string object containing a date formatted with YYYY-MM-DD..HH:mm:ss*.
 * The part * can be anything.
 * @returns A string object containing a date formatted with HH:mm:ss*.
 */
export function long_date_to_tiny_date(date: DateYYYYMMDDHHmmssSSS): DateHHmmssSSS {
	return toDateHHmmssSSS(date.split('..')[1]);
}

/**
 * @brief Converts a YYYY-MM-DD..HH:mm:ss* string into a HH:mm:ss* string.
 * @param date A string object containing a date formatted with YYYY-MM-DD..HH:mm:ss*.
 * The part * can be anything.
 * @returns A string object containing a date formatted with HH:mm:ss*.
 */
export function long_date_to_short_and_tiny_date(date: DateYYYYMMDDHHmmssSSS): [DateYYYYMMDD, DateHHmmssSSS] {
	const s = date.split('..');
	return [toDateYYYYMMDD(s[0]), toDateHHmmssSSS(s[1])];
}

/// Returns the current date in string format "YYYY-MM-DD..HH:mm:ss"
export function log_now(): DateYYYYMMDDHHmmss {
	return date_to_string_long(new Date());
}

/// Returns the current date in string format "YYYY-MM-DD..HH:mm:ss:SSS"
export function log_now_millis(): DateYYYYMMDDHHmmssSSS {
	return date_to_string_long_millis(new Date());
}
