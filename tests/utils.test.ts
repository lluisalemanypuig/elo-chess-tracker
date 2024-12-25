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

import {
	search,
	search_by_key,
	search_linear,
	search_linear_by_key,
	where_should_be_inserted
} from '../ts-server/utils/misc';

describe('Searching in an array of numbers -- locate a number', () => {
	test('Empty', () => {
		const arr: number[] = [];
		for (let i = -10; i <= 10; ++i) {
			expect(search(arr, i)).toBe(-1);
			expect(search_linear(arr, i)).toBe(-1);
		}
	});

	test('Dense (existent)', () => {
		const arr = [1, 2, 3, 5, 6, 7];
		for (let i = 0; i < arr.length; ++i) {
			expect(search(arr, arr[i])).toBe(i);
			expect(search_linear(arr, arr[i])).toBe(i);
		}
	});

	test('Dense (non-existent)', () => {
		const arr = [1, 2, 3, 5, 6, 7];
		for (let i = -10; i <= 0; ++i) {
			expect(search(arr, i)).toBe(-1);
			expect(search_linear(arr, i)).toBe(-1);
		}
		expect(search(arr, 4)).toBe(-1);
		for (let i = 8; i <= 20; ++i) {
			expect(search(arr, i)).toBe(-1);
			expect(search_linear(arr, i)).toBe(-1);
		}
	});

	test('Sparse (existent)', () => {
		const arr = [10, 30, 50, 70, 90];
		for (let i = 0; i < arr.length; ++i) {
			expect(search(arr, arr[i])).toBe(i);
			expect(search_linear(arr, arr[i])).toBe(i);
		}
	});

	test('Sparse (non-existent)', () => {
		const arr = [10, 30, 50, 70, 90];
		for (let i = -20; i <= 9; ++i) {
			expect(search(arr, i)).toBe(-1);
			expect(search_linear(arr, i)).toBe(-1);
		}
		for (let i = 11; i <= 29; ++i) {
			expect(search(arr, i)).toBe(-1);
			expect(search_linear(arr, i)).toBe(-1);
		}
		for (let i = 31; i <= 49; ++i) {
			expect(search(arr, i)).toBe(-1);
			expect(search_linear(arr, i)).toBe(-1);
		}
		for (let i = 51; i <= 69; ++i) {
			expect(search(arr, i)).toBe(-1);
			expect(search_linear(arr, i)).toBe(-1);
		}
		for (let i = 71; i <= 89; ++i) {
			expect(search(arr, i)).toBe(-1);
			expect(search_linear(arr, i)).toBe(-1);
		}
		for (let i = 91; i <= 120; ++i) {
			expect(search(arr, i)).toBe(-1);
			expect(search_linear(arr, i)).toBe(-1);
		}
	});
});

describe('Searching in an array of structs -- locate an element', () => {
	class pair {
		name: string;
		size: number;
		constructor(n: string, s: number) {
			this.name = n;
			this.size = s;
		}
	}

	test('Empty', () => {
		const arr: pair[] = [];
		const search_func = (p: pair, q: pair) => {
			if (p.name < q.name) {
				return -1;
			}
			if (p.name == q.name) {
				return 0;
			}
			return 1;
		};

		expect(search(arr, new pair('A', 3), search_func)).toBe(-1);
		expect(search(arr, new pair('A', 10), search_func)).toBe(-1);
		expect(search(arr, new pair('B', 3), search_func)).toBe(-1);
		expect(search(arr, new pair('B', 50), search_func)).toBe(-1);
		expect(search(arr, new pair('C', 1), search_func)).toBe(-1);
		expect(search(arr, new pair('C', 10), search_func)).toBe(-1);
		expect(search(arr, new pair('D', 0), search_func)).toBe(-1);
		expect(search(arr, new pair('D', 20), search_func)).toBe(-1);
		expect(search(arr, new pair('M', 0), search_func)).toBe(-1);
		expect(search(arr, new pair('M', 100), search_func)).toBe(-1);
		expect(search(arr, new pair('Z', -9), search_func)).toBe(-1);
		expect(search(arr, new pair('Z', 10), search_func)).toBe(-1);
	});

	test('Empty (key)', () => {
		const arr: pair[] = [];
		const search_func = (p: pair, q: pair) => {
			if (p.name < q.name) {
				return -1;
			}
			if (p.name == q.name) {
				return 0;
			}
			return 1;
		};
		const key_func = function (p: pair) {
			return p.name;
		};

		expect(search_by_key(arr, 'A', search_func, key_func)).toBe(-1);
		expect(search_by_key(arr, 'B', search_func, key_func)).toBe(-1);
		expect(search_by_key(arr, 'C', search_func, key_func)).toBe(-1);
		expect(search_by_key(arr, 'D', search_func, key_func)).toBe(-1);
		expect(search_by_key(arr, 'M', search_func, key_func)).toBe(-1);
		expect(search_by_key(arr, 'Z', search_func, key_func)).toBe(-1);

		expect(
			search_linear_by_key(arr, (p: pair): boolean => {
				return p.name == 'A';
			})
		).toBe(-1);
		expect(
			search_linear_by_key(arr, (p: pair): boolean => {
				return p.name == 'B';
			})
		).toBe(-1);
		expect(
			search_linear_by_key(arr, (p: pair): boolean => {
				return p.name == 'C';
			})
		).toBe(-1);
	});

	test('Sorted by name', () => {
		const arr = [
			new pair('A', 3),
			new pair('B', 50),
			new pair('C', 1),
			new pair('D', 0),
			new pair('M', 100),
			new pair('Z', -9)
		];
		const search_func = (p: pair, q: pair) => {
			if (p.name < q.name) {
				return -1;
			}
			if (p.name == q.name) {
				return 0;
			}
			return 1;
		};

		expect(search(arr, new pair('A', 3), search_func)).toBe(0);
		expect(search(arr, new pair('A', 10), search_func)).toBe(0);
		expect(search(arr, new pair('B', 3), search_func)).toBe(1);
		expect(search(arr, new pair('B', 50), search_func)).toBe(1);
		expect(search(arr, new pair('C', 1), search_func)).toBe(2);
		expect(search(arr, new pair('C', 10), search_func)).toBe(2);
		expect(search(arr, new pair('D', 0), search_func)).toBe(3);
		expect(search(arr, new pair('D', 20), search_func)).toBe(3);
		expect(search(arr, new pair('M', 0), search_func)).toBe(4);
		expect(search(arr, new pair('M', 100), search_func)).toBe(4);
		expect(search(arr, new pair('Z', -9), search_func)).toBe(5);
		expect(search(arr, new pair('Z', 10), search_func)).toBe(5);

		expect(search(arr, new pair('a', 0), search_func)).toBe(-1);
		expect(search(arr, new pair('E', 0), search_func)).toBe(-1);
		expect(search(arr, new pair('F', 0), search_func)).toBe(-1);
		expect(search(arr, new pair('G', 0), search_func)).toBe(-1);
		expect(search(arr, new pair('H', 0), search_func)).toBe(-1);
		expect(search(arr, new pair('Q', 0), search_func)).toBe(-1);
		expect(search(arr, new pair('z', 0), search_func)).toBe(-1);

		// 'search_linear' cannot be tested here since the equality operator '=='
		// is funny in typescript/javascript. 'search_linear_by_key' is needed
		// and is tested below
	});

	test('Sorted by (key) name', () => {
		const arr = [
			new pair('A', 3),
			new pair('B', 50),
			new pair('C', 1),
			new pair('D', 0),
			new pair('M', 100),
			new pair('Z', -9)
		];
		const search_func = function (p: string, q: string) {
			if (p < q) {
				return -1;
			}
			if (p == q) {
				return 0;
			}
			return 1;
		};
		const key_func = function (p: pair) {
			return p.name;
		};

		expect(search_by_key(arr, 'A', search_func, key_func)).toBe(0);
		expect(search_by_key(arr, 'B', search_func, key_func)).toBe(1);
		expect(search_by_key(arr, 'C', search_func, key_func)).toBe(2);
		expect(search_by_key(arr, 'D', search_func, key_func)).toBe(3);
		expect(search_by_key(arr, 'M', search_func, key_func)).toBe(4);
		expect(search_by_key(arr, 'Z', search_func, key_func)).toBe(5);

		expect(search_by_key(arr, 'a', search_func, key_func)).toBe(-1);
		expect(search_by_key(arr, 'E', search_func, key_func)).toBe(-1);
		expect(search_by_key(arr, 'F', search_func, key_func)).toBe(-1);
		expect(search_by_key(arr, 'G', search_func, key_func)).toBe(-1);
		expect(search_by_key(arr, 'H', search_func, key_func)).toBe(-1);
		expect(search_by_key(arr, 'Q', search_func, key_func)).toBe(-1);
		expect(search_by_key(arr, 'z', search_func, key_func)).toBe(-1);

		expect(
			search_linear_by_key(arr, (p: pair): boolean => {
				return p.name == 'A';
			})
		).toBe(0);
		expect(
			search_linear_by_key(arr, (p: pair): boolean => {
				return p.name == 'B';
			})
		).toBe(1);
		expect(
			search_linear_by_key(arr, (p: pair): boolean => {
				return p.name == 'C';
			})
		).toBe(2);
		expect(
			search_linear_by_key(arr, (p: pair): boolean => {
				return p.name == 'D';
			})
		).toBe(3);
		expect(
			search_linear_by_key(arr, (p: pair): boolean => {
				return p.name == 'M';
			})
		).toBe(4);
		expect(
			search_linear_by_key(arr, (p: pair): boolean => {
				return p.name == 'Z';
			})
		).toBe(5);

		expect(
			search_linear_by_key(arr, (p: pair): boolean => {
				return p.name == 'a';
			})
		).toBe(-1);
		expect(
			search_linear_by_key(arr, (p: pair): boolean => {
				return p.name == 'E';
			})
		).toBe(-1);
		expect(
			search_linear_by_key(arr, (p: pair): boolean => {
				return p.name == 'F';
			})
		).toBe(-1);
		expect(
			search_linear_by_key(arr, (p: pair): boolean => {
				return p.name == 'G';
			})
		).toBe(-1);
		expect(
			search_linear_by_key(arr, (p: pair): boolean => {
				return p.name == 'H';
			})
		).toBe(-1);
		expect(
			search_linear_by_key(arr, (p: pair): boolean => {
				return p.name == 'Q';
			})
		).toBe(-1);
		expect(
			search_linear_by_key(arr, (p: pair): boolean => {
				return p.name == 'z';
			})
		).toBe(-1);
	});
});

describe('Searching in an array of numbers -- where to insert a number', () => {
	test('Empty', () => {
		const arr: number[] = [];
		for (let i = -10; i <= 10; ++i) {
			expect(where_should_be_inserted(arr, i)).toEqual([1, false]);
		}
	});

	test('Dense 1 (existent)', () => {
		const arr = [1, 2, 3, 5, 6, 7];
		for (let i = 0; i < arr.length; ++i) {
			expect(where_should_be_inserted(arr, arr[i])).toEqual([i, true]);
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
		for (let i = 0; i < arr.length; ++i) {
			expect(where_should_be_inserted(arr, arr[i])).toEqual([i, true]);
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
		for (let i = 0; i < arr.length; ++i) {
			expect(where_should_be_inserted(arr, arr[i])).toEqual([i, true]);
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
