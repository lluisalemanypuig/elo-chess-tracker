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

import { any, interleaveStrings } from '@server/utils/misc';

describe('Interleave strings', () => {
	test('Empty strings', () => {
		expect(interleaveStrings('', '')).toBe('');
	});

	test('length(A) >= length(B)', () => {
		expect(interleaveStrings('asdf', 'qwer')).toBe('aqswdefr');
		expect(interleaveStrings('asdf', 'qwe')).toBe('aqswdef');
		expect(interleaveStrings('asdf', 'qw')).toBe('aqswdf');
		expect(interleaveStrings('asdf', 'q')).toBe('aqsdf');
		expect(interleaveStrings('asdf', '')).toBe('asdf');

		expect(interleaveStrings('admin', '星')).toBe('a星dmin');
		expect(interleaveStrings('admin', '山田')).toBe('a山d田min');
		expect(interleaveStrings('私は一番有名な人です', '山田')).toBe('私山は田一番有名な人です');
	});

	test('length(A) <= length(B)', () => {
		expect(interleaveStrings('qwer', 'asdf')).toBe('qawsedrf');
		expect(interleaveStrings('qwe', 'asdf')).toBe('qawsedf');
		expect(interleaveStrings('qw', 'asdf')).toBe('qawsdf');
		expect(interleaveStrings('q', 'asdf')).toBe('qasdf');
		expect(interleaveStrings('', 'asdf')).toBe('asdf');

		expect(interleaveStrings('星', 'admin')).toBe('星admin');
		expect(interleaveStrings('山田', 'admin')).toBe('山a田dmin');
		expect(interleaveStrings('山田', '私は一番有名な人です')).toBe('山私田は一番有名な人です');
	});
});

describe('Any function tests', () => {
	test('Empty array', () => {
		const array: number[] = [];
		expect(
			any(array, (i: number): boolean => {
				return i % 2 == 0;
			})
		).toBe(false);
	});

	test('Always false', () => {
		const array: number[] = [1, 3, 5, 7, 9];
		expect(
			any(array, (i: number): boolean => {
				return i % 2 == 0;
			})
		).toBe(false);
		expect(
			any(array, (i: number): boolean => {
				return i >= 10;
			})
		).toBe(false);
	});

	test('Always true', () => {
		const array: number[] = [1, 3, 5, 7, 9];
		expect(
			any(array, (i: number): boolean => {
				return i % 2 == 1;
			})
		).toBe(true);
		expect(
			any(array, (i: number): boolean => {
				return i < 10;
			})
		).toBe(true);
	});
});
