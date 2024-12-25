/*
Elo rating for a Chess Club
Copyright (C) 2023 - 2024  Lluís Alemany Puig

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

Contact:
	Lluís Alemany Puig
	https://github.com/lluisalemanypuig
*/

import moment from 'moment';

/// Convert a number to a string of 8 digits
export function number_to_string(n: number): string {
	let str = Number(n).toString();
	if (n < 10) {
		return '0000000' + str;
	}
	if (n < 100) {
		return '000000' + str;
	}
	if (n < 1000) {
		return '00000' + str;
	}
	if (n < 10000) {
		return '0000' + str;
	}
	if (n < 100000) {
		return '000' + str;
	}
	if (n < 1000000) {
		return '00' + str;
	}
	if (n < 10000000) {
		return '0' + str;
	}
	return str;
}

/**
 * @brief Formats a date into a string YYYY-MM-DD..HH:mm:ss
 * @param date A Date object.
 * @returns A string.
 */
export function date_to_string(date: Date): string {
	return moment.utc(date).local().format('YYYY-MM-DD..HH:mm:ss');
}

/// Returns the current date in string format "YYYY-MM-DD..HH:mm:ss"
export function log_now(): string {
	return date_to_string(new Date());
}

/**
 * @brief Formats a date into a string YYYY-MM-DD
 * @param date A Date object.
 * @returns A string.
 */
export function short_date_to_string(date: string): string {
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
 * @brief Converts a YYYY-MM-DD..HH:mm:ss string into a YYYY-MM-DD string.
 * @param date A string object containing a date formatted with YYYY-MM-DD..HH:mm:ss.
 * @returns A string object containing a date formatted with YYYY-MM-DD.
 */
export function long_date_to_short_date(date: string): string {
	return date.split('..')[0];
}

/**
 * @brief Parses a string containing a date with the format YYYY-MM-DD.
 * @param date A string object.
 * @returns A Date object.
 */
export function string_to_short_date(date: string): Date {
	let YYYY_MM_DD = date.split('-');
	let year = Number(YYYY_MM_DD[0]);
	let month = Number(YYYY_MM_DD[1]);
	let day = Number(YYYY_MM_DD[2]);
	return new Date(year, month - 1, day);
}

/**
 * @brief Deep-copy an array
 * @param array Input array
 * @returns A copy of an array and all of its elements.
 */
export function copyarray<T>(array: T[]): T[] {
	return array.map((k: T) => {
		return k;
	});
}

/**
 * @brief Finds the first element for which F evaluates to true
 * @param arr Input array
 * @param F Boolean function
 */
export function linear_find<T>(arr: T[], F: Function): number {
	for (let i = 0; i < arr.length; ++i) {
		if (F(arr[i])) {
			return i;
		}
	}
	return arr.length;
}

/**
 * @brief Checks if function F is evaluated to true in any
 * element of the array
 * @param arr Input array
 * @param F Boolean function (e: T) => boolean
 * @returns True if F evaluates to true in any element of the array.
 * Returns false if otherwise.
 */
export function any<T>(arr: T[], F: Function): boolean {
	for (let i = 0; i < arr.length; ++i) {
		if (F(arr[i])) {
			return true;
		}
	}
	return false;
}

/**
 * @brief Returns whether @e x is in @e arr or not.
 * @tparam T Type of elements in the array.
 * @param arr Array.
 * @param x Element of type @e T.
 * @param Comparison Takes two elements of type @e T, F(e1,e2), and returns:
 * - a value < 0 if "e1 < e2",
 * - a value = 0 if "e1 == e2",
 * - a value > 0 if "e1 > e2".
 * @returns The index of the element if it is in the array. Returns -1 if it is not.
 * @pre Elements in @e arr are sorted by @e F.
 */
export function search<T>(
	arr: T[],
	x: T,
	Comparison: Function = (e1: T, e2: T): number => {
		if (e1 < e2) {
			return -1;
		}
		if (e1 == e2) {
			return 0;
		}
		return 1;
	}
): number {
	return search_by_key(arr, x, Comparison, function (e1: T) {
		return e1;
	});
}

/**
 * @brief Returns whether @e x is in @e arr or not.
 * @tparam T Type of elements in the array.
 * @param arr Array.
 * @param x Element of type @e T.
 * @param Comparison Takes two elements of type @e T, F(e1,e2), and returns:
 * - a value < 0 if "e1 < e2",
 * - a value = 0 if "e1 == e2",
 * - a value > 0 if "e1 > e2".
 * @returns The index of the element if it is in the array. Returns -1 if it is not.
 * @pre Elements in @e arr are sorted by @e F.
 */
export function search_by_key<T, U>(
	arr: T[],
	x: U,
	Comparison: Function = (e1: U, e2: U): number => {
		if (e1 < e2) {
			return -1;
		}
		if (e1 == e2) {
			return 0;
		}
		return 1;
	},
	M: (input: T) => U
): number {
	let i: number = 0;
	let j: number = arr.length - 1;
	while (i < j) {
		const m: number = Math.floor((i + j) / 2);

		const comp = Comparison(x, M(arr[m]));
		const is_equal = comp == 0;
		const is_less_than = comp == -1;

		if (is_equal) {
			return m;
		}
		if (is_less_than) {
			j = m - 1;
		} else {
			i = m + 1;
		}
	}
	if (i == j && Comparison(x, M(arr[i])) == 0) {
		return i;
	}
	return -1;
}

/**
 * @brief Returns the index within @e arr where @e x should be inserted in.
 * @tparam T Type of elements in the array.
 * @param arr Array.
 * @param x Element not in @e arr.
 * @param Comparison Takes two elements of type @e T, F(e1,e2), and returns:
 * - a value < 0 if "e1 < e2",
 * - a value = 0 if "e1 == e2",
 * - a value > 0 if "e1 > e2".
 * @returns A pair of values [index,true] where 'index' is the position of @e x
 * within @e arr. A pair of values [index,false] where 'index' is where @e x should
 * be placed at in @e arr.
 * @pre Elements in @e arr are sorted by @e F.
 * @pre Element @e x does not exist in @e arr, that is, function
 * 'search(arr, x, F)' returns false.
 */
export function where_should_be_inserted<T>(
	arr: T[],
	x: T,
	Comparison: Function = (e1: T, e2: T): number => {
		if (e1 < e2) {
			return -1;
		}
		if (e1 == e2) {
			return 0;
		}
		return 1;
	}
): [number, boolean] {
	let i: number = 0;
	let j: number = arr.length - 1;
	while (i < j) {
		const m: number = Math.floor((i + j) / 2);

		const comp = Comparison(x, arr[m]);
		const is_equal = comp == 0;
		const is_less_than = comp == -1;

		if (is_equal) {
			return [m, true];
		}
		if (is_less_than) {
			j = m - 1;
		} else {
			i = m + 1;
		}
	}

	const comp = Comparison(x, arr[i]);
	const is_equal = comp == 0;
	const is_less_than = comp == -1;

	if (is_equal) {
		return [i, true];
	}
	if (is_less_than) {
		return [i, false];
	}
	return [i + 1, false];
}

/**
 * @brief Combines two strings.
 *
 * A = "abcdefg"
 * B = "hijklmnopqrst"
 * ===================
 * C = "ahbicjdkelfmgnopqrst"
 *
 * @param s1 First string
 * @param s2 Second string
 * @returns A string containing @e s1 and @e s2 but interleaved.
 */
export function interleave_strings(s1: string, s2: string): string {
	let r: string = '';
	let i = 0;
	while (i < s1.length && i < s2.length) {
		r += s1[i];
		r += s2[i];
		++i;
	}
	for (let j = i; j < s1.length; ++j) {
		r += s1[j];
	}
	for (let j = i; j < s2.length; ++j) {
		r += s2[j];
	}
	return r;
}
