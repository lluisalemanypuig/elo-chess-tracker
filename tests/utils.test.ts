/*
Elo rating for a Chess Club
Copyright (C) 2023  Lluís Alemany Puig

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

import { search, where_should_be_inserted } from '../ts-server/utils/misc';

describe('Searching in an array of numbers -- locate a number', () => {
	test('Dense (existent)', () => {
		const arr = [1, 2, 3, 5, 6, 7];
		const search_ = [1, 2, 3, 5, 6, 7];
		for (let i = 0; i < search_.length; ++i) {
			expect(search(arr, search_[i])).toBe(i);
		}
	});

	test('Dense (non-existent)', () => {
		const arr = [1, 2, 3, 5, 6, 7];
		for (let i = -10; i <= 0; ++i) {
			expect(search(arr, i)).toBe(-1);
		}
		expect(search(arr, 4)).toBe(-1);
		for (let i = 8; i <= 20; ++i) {
			expect(search(arr, i)).toBe(-1);
		}
	});

	test('Sparse (existent)', () => {
		const arr = [10, 30, 50, 70, 90];
		const search_ = [10, 30, 50, 70, 90];
		for (let i = 0; i < search_.length; ++i) {
			expect(search(arr, search_[i])).toBe(i);
		}
	});

	test('Sparse (non-existent)', () => {
		const arr = [10, 30, 50, 70, 90];
		for (let i = -20; i <= 9; ++i) {
			expect(search(arr, i)).toBe(-1);
		}
		for (let i = 11; i <= 29; ++i) {
			expect(search(arr, i)).toBe(-1);
		}
		for (let i = 31; i <= 49; ++i) {
			expect(search(arr, i)).toBe(-1);
		}
		for (let i = 51; i <= 69; ++i) {
			expect(search(arr, i)).toBe(-1);
		}
		for (let i = 71; i <= 89; ++i) {
			expect(search(arr, i)).toBe(-1);
		}
		for (let i = 91; i <= 120; ++i) {
			expect(search(arr, i)).toBe(-1);
		}
	});
});

describe('Searching in an array of numbers -- where to insert a number', () => {
	test('Dense 1 (existent)', () => {
		const arr = [1, 2, 3, 5, 6, 7];
		const search_ = [1, 2, 3, 5, 6, 7];
		for (let i = 0; i < search_.length; ++i) {
			expect(where_should_be_inserted(arr, search_[i])).toEqual([i, true]);
		}
	});

	test('Dense 1 (non-existent)', () => {
		const arr = [1, 2, 3, 5, 6, 7];

		for (let i = -10; i <= 0; ++i) {
			expect(where_should_be_inserted(arr, i)).toEqual([0, false]);
		}
		expect(where_should_be_inserted(arr, 4)).toEqual([3, false]);
		for (let i = 8; i <= 15; ++i) {
			expect(where_should_be_inserted(arr, i)).toEqual([6, false]);
		}
	});

	test('Dense 2 (existent)', () => {
		const arr = [2, 4, 6, 8];
		const search_ = [2, 4, 6, 8];
		for (let i = 0; i < search_.length; ++i) {
			expect(where_should_be_inserted(arr, search_[i])).toEqual([i, true]);
		}
	});

	test('Dense 2 (non-existent)', () => {
		const arr = [2, 4, 6, 8];

		for (let i = -10; i <= 1; ++i) {
			expect(where_should_be_inserted(arr, i)).toEqual([0, false]);
		}
		expect(where_should_be_inserted(arr, 3)).toEqual([1, false]);
		expect(where_should_be_inserted(arr, 5)).toEqual([2, false]);
		expect(where_should_be_inserted(arr, 7)).toEqual([3, false]);
		for (let i = 9; i <= 15; ++i) {
			expect(where_should_be_inserted(arr, i)).toEqual([4, false]);
		}
	});

	test('Sparse (existent)', () => {
		const arr = [10, 30, 50, 70, 90];
		const search_ = [10, 30, 50, 70, 90];
		for (let i = 0; i < search_.length; ++i) {
			expect(where_should_be_inserted(arr, search_[i])).toEqual([i, true]);
		}
	});

	test('Sparse (non-existent)', () => {
		const arr = [10, 30, 50, 70, 90];
		for (let i = -20; i <= 9; ++i) {
			expect(where_should_be_inserted(arr, i)).toEqual([0, false]);
		}
		for (let i = 11; i <= 29; ++i) {
			expect(where_should_be_inserted(arr, i)).toEqual([1, false]);
		}
		for (let i = 31; i <= 49; ++i) {
			expect(where_should_be_inserted(arr, i)).toEqual([2, false]);
		}
		for (let i = 51; i <= 69; ++i) {
			expect(where_should_be_inserted(arr, i)).toEqual([3, false]);
		}
		for (let i = 71; i <= 89; ++i) {
			expect(where_should_be_inserted(arr, i)).toEqual([4, false]);
		}
		for (let i = 91; i <= 120; ++i) {
			expect(where_should_be_inserted(arr, i)).toEqual([5, false]);
		}
	});
});
