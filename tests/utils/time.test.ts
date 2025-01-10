/*
Elo rating for a Chess Club
Copyright (C) 2023 - 2025  Lluís Alemany Puig

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

import { number_to_string } from '../../src-server/utils/misc';
import { long_date_to_short_date } from '../../src-server/utils/time';

describe('Number to string', () => {
	test('1 digit', () => {
		expect(number_to_string(0)).toBe('0000000000');
		expect(number_to_string(1)).toBe('0000000001');
		expect(number_to_string(2)).toBe('0000000002');
		expect(number_to_string(3)).toBe('0000000003');
		expect(number_to_string(4)).toBe('0000000004');
		expect(number_to_string(5)).toBe('0000000005');
		expect(number_to_string(6)).toBe('0000000006');
		expect(number_to_string(7)).toBe('0000000007');
		expect(number_to_string(8)).toBe('0000000008');
		expect(number_to_string(9)).toBe('0000000009');
	});

	test('2 digits', () => {
		expect(number_to_string(10)).toBe('0000000010');
		expect(number_to_string(11)).toBe('0000000011');
		expect(number_to_string(12)).toBe('0000000012');
		expect(number_to_string(13)).toBe('0000000013');
		expect(number_to_string(14)).toBe('0000000014');
		expect(number_to_string(15)).toBe('0000000015');
		expect(number_to_string(16)).toBe('0000000016');
		expect(number_to_string(17)).toBe('0000000017');
		expect(number_to_string(18)).toBe('0000000018');
		expect(number_to_string(19)).toBe('0000000019');
		expect(number_to_string(20)).toBe('0000000020');
		expect(number_to_string(50)).toBe('0000000050');
		expect(number_to_string(60)).toBe('0000000060');
	});

	test('3 digits', () => {
		expect(number_to_string(100)).toBe('0000000100');
		expect(number_to_string(101)).toBe('0000000101');
		expect(number_to_string(120)).toBe('0000000120');
		expect(number_to_string(213)).toBe('0000000213');
		expect(number_to_string(414)).toBe('0000000414');
		expect(number_to_string(515)).toBe('0000000515');
		expect(number_to_string(146)).toBe('0000000146');
		expect(number_to_string(147)).toBe('0000000147');
		expect(number_to_string(186)).toBe('0000000186');
		expect(number_to_string(179)).toBe('0000000179');
		expect(number_to_string(290)).toBe('0000000290');
		expect(number_to_string(510)).toBe('0000000510');
		expect(number_to_string(960)).toBe('0000000960');
	});

	test('4 digits', () => {
		expect(number_to_string(1000)).toBe('0000001000');
		expect(number_to_string(1234)).toBe('0000001234');
		expect(number_to_string(5678)).toBe('0000005678');
	});

	test('5 digits', () => {
		expect(number_to_string(10000)).toBe('0000010000');
		expect(number_to_string(12034)).toBe('0000012034');
		expect(number_to_string(56078)).toBe('0000056078');
	});

	test('6 digits', () => {
		expect(number_to_string(100000)).toBe('0000100000');
		expect(number_to_string(120034)).toBe('0000120034');
		expect(number_to_string(956078)).toBe('0000956078');
	});

	test('7 digits', () => {
		expect(number_to_string(1000000)).toBe('0001000000');
		expect(number_to_string(1207034)).toBe('0001207034');
		expect(number_to_string(1956078)).toBe('0001956078');
	});

	test('8 digits', () => {
		expect(number_to_string(10000000)).toBe('0010000000');
		expect(number_to_string(12097034)).toBe('0012097034');
		expect(number_to_string(19546078)).toBe('0019546078');
	});

	test('9 digits', () => {
		expect(number_to_string(100000010)).toBe('0100000010');
		expect(number_to_string(120970340)).toBe('0120970340');
		expect(number_to_string(195460789)).toBe('0195460789');
	});

	test('10 digits', () => {
		expect(number_to_string(2100000010)).toBe('2100000010');
		expect(number_to_string(2120970340)).toBe('2120970340');
		expect(number_to_string(2147483647)).toBe('2147483647');
	});
});

describe('date-to-string conversions', () => {
	test('long date to short date', () => {
		expect(long_date_to_short_date('2022-10-01..01:01:01')).toBe('2022-10-01');
		expect(long_date_to_short_date('2022-10-01..01:01:10')).toBe('2022-10-01');
		expect(long_date_to_short_date('2022-10-21..10:01:10')).toBe('2022-10-21');
	});
});
