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

/// Convert a number to a string of 10 digits
export function number_to_string(n: number): string {
	const str = Number(n).toString();
	return '0'.repeat(10 - str.length) + str;
}

/**
 * @brief Deep-copy an array using clone function c
 * @param array Input array
 * @returns A copy of an array and all of its elements.
 */
export function copyarray<T>(array: T[], clone: (t: T) => T): T[] {
	return array.map((k: T) => {
		return clone(k);
	});
}

/**
 * @brief Checks if function F is evaluated to true in any
 * element of the array
 * @param arr Input array
 * @param F Boolean function (e: T) => boolean
 * @returns True if F evaluates to true in any element of the array.
 * Returns false if otherwise.
 */
export function any<T>(arr: T[], F: (e1: T) => boolean): boolean {
	for (let i = 0; i < arr.length; ++i) {
		if (F(arr[i])) {
			return true;
		}
	}
	return false;
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
		r += s1.charAt(i);
		r += s2.charAt(i);
		++i;
	}
	for (let j = i; j < s1.length; ++j) {
		r += s1.charAt(j);
	}
	for (let j = i; j < s2.length; ++j) {
		r += s2.charAt(j);
	}
	return r;
}
