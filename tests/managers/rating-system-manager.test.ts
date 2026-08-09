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

import { toTimeControlId, toTimeControlName } from '@app/common/models/time-control';
import { RatingSystemManager } from '@app/server/managers/rating-system-manager';

const Classical = toTimeControlId('Classical');
const Classical90p30 = toTimeControlName('Classical (90 + 30)');

const Rapid = toTimeControlId('Rapid');
const Rapid15p10 = toTimeControlName('Rapid (15 + 10)');
const Rapid12p5 = toTimeControlName('Rapid (12 + 5)');
const Rapid10p0 = toTimeControlName('Rapid (10 + 0)');

const Blitz = toTimeControlId('Blitz');
const Blitz5p3 = toTimeControlName('Blitz (5 + 3)');
const Blitz5p0 = toTimeControlName('Blitz (5 + 0)');
const Blitz3p2 = toTimeControlName('Blitz (3 + 2)');

describe('Rating System Manager', () => {
	test('Basic tests', () => {
		let rating = RatingSystemManager.get_instance();
		expect(rating.get_time_controls().length).toBe(0);
		expect(rating.get_unique_time_controls_ids().length).toBe(0);

		rating.set_time_controls([
			{ id: Classical, name: Classical90p30 },
			{ id: Rapid, name: Rapid15p10 },
			{ id: Rapid, name: Rapid12p5 },
			{ id: Rapid, name: Rapid10p0 },
			{ id: Blitz, name: Blitz5p3 },
			{ id: Blitz, name: Blitz5p0 },
			{ id: Blitz, name: Blitz3p2 }
		]);

		expect(rating.get_time_controls().length).toBe(7);
		expect(rating.get_unique_time_controls_ids().length).toBe(3);
		expect(rating.is_time_control_id_valid(Classical)).toBe(true);
		expect(rating.is_time_control_id_valid(Rapid)).toBe(true);
		expect(rating.is_time_control_id_valid(Blitz)).toBe(true);

		const unique_ids = rating.get_unique_time_controls_ids();
		expect(
			unique_ids.findIndex((val: string): boolean => {
				return val == Classical;
			})
		).not.toEqual(-1);
		expect(
			unique_ids.findIndex((val: string): boolean => {
				return val == Rapid;
			})
		).not.toEqual(-1);
		expect(
			unique_ids.findIndex((val: string): boolean => {
				return val == Blitz;
			})
		).not.toEqual(-1);
	});
});
