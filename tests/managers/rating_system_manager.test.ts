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

import { RatingSystemManager } from '../../ts-server/managers/rating_system_manager';
import { TimeControl } from '../../ts-server/models/time_control';

describe('Rating System Manager', () => {
	test('Basic tests', () => {
		let rating = RatingSystemManager.get_instance();
		expect(rating.get_time_controls().length).toBe(0);
		expect(rating.get_unique_time_controls_ids().length).toBe(0);

		rating.set_time_controls([
			new TimeControl('rapid', 'Rapid (15 + 10)'),
			new TimeControl('rapid', 'Rapid (12 + 5)'),
			new TimeControl('rapid', 'Rapid (12 + 0)'),
			new TimeControl('blitz', 'Blitz (5 + 3)'),
			new TimeControl('blitz', 'Blitz (5 + 0)'),
			new TimeControl('blitz', 'Blitz (3 + 2)')
		]);

		expect(rating.get_time_controls().length).toBe(6);
		expect(rating.get_unique_time_controls_ids().length).toBe(2);
		expect(rating.is_time_control_id_valid('rapid')).toBe(true);
		expect(rating.is_time_control_id_valid('blitz')).toBe(true);

		const unique_ids = rating.get_unique_time_controls_ids();
		expect(
			unique_ids.find((val: string): boolean => {
				return val == 'rapid';
			})
		).toEqual('rapid');

		expect(
			unique_ids.find((val: string): boolean => {
				return val == 'blitz';
			})
		).toEqual('blitz');
	});
});
