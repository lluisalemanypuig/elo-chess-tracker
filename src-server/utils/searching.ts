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

/**
 * @brief Finds the first element for which F evaluates to true
 * @param arr Input array
 * @param F Boolean function
 */
export function search_linear<T>(arr: T[], x: T): number {
	return search_linear_by_key(arr, (y: T): boolean => {
		return x == y;
	});
}

/**
 * @brief Finds the first element for which F evaluates to true
 * @param arr Input array
 * @param F Boolean function
 */
export function search_linear_by_key<T>(arr: T[], F: Function): number {
	for (let i = 0; i < arr.length; ++i) {
		if (F(arr[i])) {
			return i;
		}
	}
	return -1;
}

/**
 * @brief Returns whether @e x is in @e arr or not.
 * @tparam T Type of elements in the array.
 * @param arr Array.
 * @param x Element of type @e T.
 * @returns The index of the element if it is in the array. Returns -1 if it is not.
 * @pre Elements in @e arr are sorted by @e F.
 */
export function search<T>(arr: T[], x: T): number {
	return search_by_key(arr, (e: T): number => {
		if (x < e) {
			return -1;
		}
		if (x == e) {
			return 0;
		}
		return 1;
	});
}

/**
 * @brief Returns whether @e x is in @e arr or not.
 * @tparam T Type of elements in the array.
 * @param arr Array.
 * @param x Element of type @e U.
 * @param F Takes an element @e e of type @e T, F(e), and returns a number,
 * - -1 if the element searched is less than @e e,
 * -  0 if the element searched is equal to @e e,
 * - +1 if the element searched is greater than @e e.
 * @returns The index of the element if it is in the array. Returns -1 if it is not.
 * @pre Elements in @e arr are sorted by @e F.
 */
export function search_by_key<T>(arr: T[], F: Function): number {
	let i: number = 0;
	let j: number = arr.length - 1;
	while (i < j) {
		const m: number = Math.floor((i + j) / 2);

		const comp = F(arr[m]);
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
	if (i == j && F(arr[i]) == 0) {
		return i;
	}
	return -1;
}

/**
 * @brief Returns the index within @e arr where @e x should be inserted in.
 * @tparam T Type of elements in the array.
 * @param arr Array.
 * @param x Element to be searched, probably in @e arr.
 * @returns A pair of values [index,true] where 'index' is the position of @e x
 * within @e arr. A pair of values [index,false] where 'index' is where @e x should
 * be placed at in @e arr.
 * @pre Elements in @e arr are sorted by @e F.
 * @pre Element @e x does not exist in @e arr, that is, function
 * 'search(arr, x, F)' returns false.
 */
export function where_should_be_inserted<T>(arr: T[], x: T): [number, boolean] {
	return where_should_be_inserted_by_key(arr, (e: T): number => {
		if (x < e) {
			return -1;
		}
		if (x == e) {
			return 0;
		}
		return 1;
	});
}

/**
 * @brief Returns the index within @e arr where @e x should be inserted in.
 * @tparam T Type of elements in the array.
 * @param arr Array.
 * @param F Takes an element @e e of type @e T, F(e), and returns a number,
 * - -1 if the element searched is less than @e e,
 * -  0 if the element searched is equal to @e e,
 * - +1 if the element searched is greater than @e e.
 * @returns A pair of values [index,true] where 'index' is the position of @e x
 * within @e arr. A pair of values [index,false] where 'index' is where @e x should
 * be placed at in @e arr.
 * @pre Elements in @e arr are sorted by @e F.
 * @pre Element @e x does not exist in @e arr, that is, function
 * 'search(arr, x, F)' returns false.
 */
export function where_should_be_inserted_by_key<T>(arr: T[], F: Function): [number, boolean] {
	if (arr.length == 0) {
		return [1, false];
	}

	let i: number = 0;
	let j: number = arr.length - 1;
	while (i < j) {
		const m: number = Math.floor((i + j) / 2);

		const comp = F(arr[m]);
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

	const comp = F(arr[i]);
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
