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

/// DateLongMillis: YYYY-MM-DD..HH:mm:ss:SSS

declare const DateLongMillisBrand: unique symbol;
export type DateLongMillisLocal = number & {
	readonly [DateLongMillisBrand]: 'DateLongMillis';
};
export const DateLongMillisSchema = z.string().brand<'DateLongMillisLocal'>();
export type DateLongMillis = z.infer<typeof DateLongMillisSchema>;

export function toDateLongMillis(s: string): DateLongMillis {
	return s as DateLongMillis;
}

/// DateLong: YYYY-MM-DD..HH:mm:ss

declare const DateLongBrand: unique symbol;
export type DateLongLocal = number & {
	readonly [DateLongBrand]: 'DateLong';
};
export const DateLongSchema = z.string().brand<'DateLongLocal'>();
export type DateLong = z.infer<typeof DateLongSchema>;

export function toDateLong(s: string): DateLong {
	return s as DateLong;
}

/// DateShort: YYYY-MM-DD

declare const DateShortBrand: unique symbol;
export type DateShortLocal = number & {
	readonly [DateShortBrand]: 'DateShort';
};
export const DateShortSchema = z.string().brand<'DateShortLocal'>();
export type DateShort = z.infer<typeof DateShortSchema>;

export function toDateShort(s: string): DateShort {
	return s as DateShort;
}

/// HH:mm:ss:SSS

declare const DateTinyBrand: unique symbol;
export type DateTinyLocal = number & {
	readonly [DateTinyBrand]: 'DateTiny';
};
export const DateTinySchema = z.string().brand<'DateTinyLocal'>();
export type DateTiny = z.infer<typeof DateTinySchema>;

export function toDateTiny(s: string): DateTiny {
	return s as DateTiny;
}

/**
 * @brief Formats a date into a string YYYY-MM-DD..HH:mm:ss:SSS
 *
 * 'SSS' are milliseconds
 * @param date A Date object.
 * @returns A string.
 */
export function date_to_string_long_millis(date: Date): DateLongMillis {
	return toDateLongMillis(moment.utc(date).local().format('YYYY-MM-DD..HH:mm:ss:SSS'));
}

/**
 * @brief Formats a date into a string YYYY-MM-DD..HH:mm:ss
 * @param date A Date object.
 * @returns A string.
 */
export function date_to_string_long(date: Date): DateLong {
	return toDateLong(moment.utc(date).local().format('YYYY-MM-DD..HH:mm:ss'));
}

/**
 * @brief Converts a YYYY-MM-DD..* string into a YYYY-MM-DD string.
 * @param date A string object containing a date formatted with YYYY-MM-DD..*.
 * The part * can be anything.
 * @returns A string object containing a date formatted with YYYY-MM-DD.
 */
export function long_date_to_short_date(date: DateLong | DateLongMillis): DateShort {
	return toDateShort(date.split('..')[0]);
}

/**
 * @brief Converts a YYYY-MM-DD..HH:mm:ss* string into a HH:mm:ss* string.
 * @param date A string object containing a date formatted with YYYY-MM-DD..HH:mm:ss*.
 * The part * can be anything.
 * @returns A string object containing a date formatted with HH:mm:ss*.
 */
export function long_date_to_tiny_date(date: DateLongMillis): DateTiny {
	return toDateTiny(date.split('..')[1]);
}

/**
 * @brief Converts a YYYY-MM-DD..HH:mm:ss* string into a HH:mm:ss* string.
 * @param date A string object containing a date formatted with YYYY-MM-DD..HH:mm:ss*.
 * The part * can be anything.
 * @returns A string object containing a date formatted with HH:mm:ss*.
 */
export function long_date_to_short_and_tiny_date(date: DateLongMillis): [DateShort, DateTiny] {
	const s = date.split('..');
	return [toDateShort(s[0]), toDateTiny(s[1])];
}

/// Returns the current date in string format "YYYY-MM-DD..HH:mm:ss"
export function log_now(): DateLong {
	return date_to_string_long(new Date());
}

/// Returns the current date in string format "YYYY-MM-DD..HH:mm:ss:SSS"
export function log_now_millis(): DateLongMillis {
	return date_to_string_long_millis(new Date());
}
