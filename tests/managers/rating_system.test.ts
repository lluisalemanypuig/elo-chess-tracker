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

import { RatingSystemManager } from '../../src-server/managers/rating_system_manager';
import { initialize_rating_functions, initialize_rating_time_controls } from '../../src-server/managers/rating_system';
import { TimeControl } from '../../src-server/models/time_control';

import { Elo_player_vs_player } from '../../src-server/rating_framework/Elo/formula';
import { Elo_rating_from_json, Elo_new_rating } from '../../src-server/rating_framework/Elo/rating';

describe('Rating System Manager', () => {
	test('Initialization of functions (Elo)', () => {
		let rating = RatingSystemManager.get_instance();
		rating.clear();

		initialize_rating_functions('Elo');

		expect(rating.get_rating_function()).toBe(Elo_player_vs_player);
		expect(rating.get_rating_from_JSON_function()).toBe(Elo_rating_from_json);
		expect(rating.get_new_rating_function()).toBe(Elo_new_rating);
	});

	test('Initialization of time controls', () => {
		let rating = RatingSystemManager.get_instance();
		rating.clear();

		initialize_rating_time_controls([
			new TimeControl('classical', 'Classical (90 + 30)'),
			new TimeControl('rapid', 'Rapid (15 + 10)'),
			new TimeControl('rapid', 'Rapid (12 + 5)'),
			new TimeControl('rapid', 'Rapid (12 + 0)'),
			new TimeControl('blitz', 'Blitz (5 + 3)'),
			new TimeControl('blitz', 'Blitz (5 + 0)'),
			new TimeControl('blitz', 'Blitz (3 + 2)')
		]);

		expect(rating.get_time_controls().length).toBe(7);
		expect(rating.get_unique_time_controls_ids().length).toBe(3);
		expect(rating.is_time_control_id_valid('classical')).toBe(true);
		expect(rating.is_time_control_id_valid('rapid')).toBe(true);
		expect(rating.is_time_control_id_valid('blitz')).toBe(true);

		const unique_ids = rating.get_unique_time_controls_ids();
		expect(
			unique_ids.findIndex((val: string): boolean => {
				return val == 'classical';
			})
		).not.toEqual(-1);
		expect(
			unique_ids.findIndex((val: string): boolean => {
				return val == 'rapid';
			})
		).not.toEqual(-1);
		expect(
			unique_ids.findIndex((val: string): boolean => {
				return val == 'blitz';
			})
		).not.toEqual(-1);
	});
});
