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

import { dateFullToMajor, dateFullToMinor, dateSplitMajorMinor, toDateFull } from '@common/utils/time';
import { numberToString } from '@server/utils/misc';

describe('Number to string', () => {
	test('1 digit', () => {
		expect(numberToString(0, 10)).toBe('0000000000');
		expect(numberToString(1, 10)).toBe('0000000001');
		expect(numberToString(2, 10)).toBe('0000000002');
		expect(numberToString(3, 10)).toBe('0000000003');
		expect(numberToString(4, 10)).toBe('0000000004');
		expect(numberToString(5, 10)).toBe('0000000005');
		expect(numberToString(6, 10)).toBe('0000000006');
		expect(numberToString(7, 10)).toBe('0000000007');
		expect(numberToString(8, 10)).toBe('0000000008');
		expect(numberToString(9, 10)).toBe('0000000009');
	});

	test('2 digits', () => {
		expect(numberToString(10, 10)).toBe('0000000010');
		expect(numberToString(11, 10)).toBe('0000000011');
		expect(numberToString(12, 10)).toBe('0000000012');
		expect(numberToString(13, 10)).toBe('0000000013');
		expect(numberToString(14, 10)).toBe('0000000014');
		expect(numberToString(15, 10)).toBe('0000000015');
		expect(numberToString(16, 10)).toBe('0000000016');
		expect(numberToString(17, 10)).toBe('0000000017');
		expect(numberToString(18, 10)).toBe('0000000018');
		expect(numberToString(19, 10)).toBe('0000000019');
		expect(numberToString(20, 10)).toBe('0000000020');
		expect(numberToString(50, 10)).toBe('0000000050');
		expect(numberToString(60, 10)).toBe('0000000060');
	});

	test('3 digits', () => {
		expect(numberToString(100, 10)).toBe('0000000100');
		expect(numberToString(101, 10)).toBe('0000000101');
		expect(numberToString(120, 10)).toBe('0000000120');
		expect(numberToString(213, 10)).toBe('0000000213');
		expect(numberToString(414, 10)).toBe('0000000414');
		expect(numberToString(515, 10)).toBe('0000000515');
		expect(numberToString(146, 10)).toBe('0000000146');
		expect(numberToString(147, 10)).toBe('0000000147');
		expect(numberToString(186, 10)).toBe('0000000186');
		expect(numberToString(179, 10)).toBe('0000000179');
		expect(numberToString(290, 10)).toBe('0000000290');
		expect(numberToString(510, 10)).toBe('0000000510');
		expect(numberToString(960, 10)).toBe('0000000960');
	});

	test('4 digits', () => {
		expect(numberToString(1000, 10)).toBe('0000001000');
		expect(numberToString(1234, 10)).toBe('0000001234');
		expect(numberToString(5678, 10)).toBe('0000005678');
	});

	test('5 digits', () => {
		expect(numberToString(10000, 10)).toBe('0000010000');
		expect(numberToString(12034, 10)).toBe('0000012034');
		expect(numberToString(56078, 10)).toBe('0000056078');
	});

	test('6 digits', () => {
		expect(numberToString(100000, 10)).toBe('0000100000');
		expect(numberToString(120034, 10)).toBe('0000120034');
		expect(numberToString(956078, 10)).toBe('0000956078');
	});

	test('7 digits', () => {
		expect(numberToString(1000000, 10)).toBe('0001000000');
		expect(numberToString(1207034, 10)).toBe('0001207034');
		expect(numberToString(1956078, 10)).toBe('0001956078');
	});

	test('8 digits', () => {
		expect(numberToString(10000000, 10)).toBe('0010000000');
		expect(numberToString(12097034, 10)).toBe('0012097034');
		expect(numberToString(19546078, 10)).toBe('0019546078');
	});

	test('9 digits', () => {
		expect(numberToString(100000010, 10)).toBe('0100000010');
		expect(numberToString(120970340, 10)).toBe('0120970340');
		expect(numberToString(195460789, 10)).toBe('0195460789');
	});

	test('10 digits', () => {
		expect(numberToString(2100000010, 10)).toBe('2100000010');
		expect(numberToString(2120970340, 10)).toBe('2120970340');
		expect(numberToString(2147483647, 10)).toBe('2147483647');
	});
});

describe('date-to-string conversions', () => {
	test('long date to short date', () => {
		expect(dateFullToMajor(toDateFull('2022-10-01..01:01:01'))).toBe('2022-10-01');
		expect(dateFullToMajor(toDateFull('2022-10-01..01:01:10'))).toBe('2022-10-01');
		expect(dateFullToMajor(toDateFull('2022-10-21..10:01:10'))).toBe('2022-10-21');
	});

	test('long date to tiny date', () => {
		expect(dateFullToMinor(toDateFull('2022-10-01..01:01:01'))).toBe('01:01:01');
		expect(dateFullToMinor(toDateFull('2022-10-01..01:01:10'))).toBe('01:01:10');
		expect(dateFullToMinor(toDateFull('2022-10-21..10:01:10'))).toBe('10:01:10');

		expect(dateFullToMinor(toDateFull('2022-10-01..01:01:01:111'))).toBe('01:01:01:111');
		expect(dateFullToMinor(toDateFull('2022-10-01..01:01:10:222'))).toBe('01:01:10:222');
		expect(dateFullToMinor(toDateFull('2022-10-21..10:01:10:333'))).toBe('10:01:10:333');
	});

	test('long date to short and tiny date', () => {
		expect(dateSplitMajorMinor(toDateFull('2022-10-01..01:01:01'))).toEqual(['2022-10-01', '01:01:01']);
		expect(dateSplitMajorMinor(toDateFull('2022-10-01..01:01:10'))).toEqual(['2022-10-01', '01:01:10']);
		expect(dateSplitMajorMinor(toDateFull('2022-10-21..10:01:10'))).toEqual(['2022-10-21', '10:01:10']);

		expect(dateSplitMajorMinor(toDateFull('2022-10-01..01:01:01:111'))).toEqual(['2022-10-01', '01:01:01:111']);
		expect(dateSplitMajorMinor(toDateFull('2022-10-01..01:01:10:222'))).toEqual(['2022-10-01', '01:01:10:222']);
		expect(dateSplitMajorMinor(toDateFull('2022-10-21..10:01:10:333'))).toEqual(['2022-10-21', '10:01:10:333']);
	});
});
