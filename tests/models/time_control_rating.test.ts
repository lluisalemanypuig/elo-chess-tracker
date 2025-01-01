/*
Elo rating for a Chess Club
Copyright (C) 2023 - 2024  Lluís Alemany Puig

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
	time_control_rating_from_json,
	time_control_rating_set_from_json,
	TimeControlRating
} from '../../ts-server/models/time_control_rating';
import { EloRating } from '../../ts-server/rating_framework/Elo/rating';
import { initialize_rating_functions } from '../../ts-server/server/rating_system';

describe('clone', () => {
	test('', () => {
		const tcr = new TimeControlRating('blitz', new EloRating(1500.43, 100, 50, 20, 30, 40, true));
		const tcrc = tcr.clone();

		expect(tcr).not.toBe(tcrc);
		expect(tcr.time_control).toEqual(tcrc.time_control);
		expect(tcr.rating).not.toBe(tcrc.rating);
		expect(tcr.rating).toEqual(tcrc.rating);
	});
});

describe('From JSON -- Elo', () => {
	initialize_rating_functions('Elo');

	test('string', () => {
		const tcr = time_control_rating_from_json(
			'{ "time_control": "blitz", "rating": { "rating": 1500.43, "num_games": 100, "won": 50, "drawn": 20, "lost": 30, "K": 40, "surpassed_2400": true } }'
		);
		expect(tcr.rating).toEqual(new EloRating(1500.43, 100, 50, 20, 30, 40, true));
		expect(tcr.time_control).toEqual('blitz');
	});

	test('string -- set', () => {
		const tcr = time_control_rating_set_from_json(
			'[{ "time_control": "blitz", "rating": { "rating": 1500.43, "num_games": 100, "won": 50, "drawn": 20, "lost": 30, "K": 40, "surpassed_2400": true } }]'
		);
		expect(tcr[0].rating).toEqual(new EloRating(1500.43, 100, 50, 20, 30, 40, true));
		expect(tcr[0].time_control).toEqual('blitz');
	});

	test('JSON', () => {
		const tcr = time_control_rating_from_json({
			time_control: 'blitz',
			rating: {
				rating: 1500.43,
				num_games: 100,
				won: 50,
				drawn: 20,
				lost: 30,
				K: 40,
				surpassed_2400: true
			}
		});
		expect(tcr.rating).toEqual(new EloRating(1500.43, 100, 50, 20, 30, 40, true));
		expect(tcr.time_control).toEqual('blitz');
	});

	test('JSON -- set', () => {
		const tcr = time_control_rating_set_from_json([
			{
				time_control: 'blitz',
				rating: {
					rating: 1500.43,
					num_games: 100,
					won: 50,
					drawn: 20,
					lost: 30,
					K: 40,
					surpassed_2400: true
				}
			}
		]);
		expect(tcr[0].rating).toEqual(new EloRating(1500.43, 100, 50, 20, 30, 40, true));
		expect(tcr[0].time_control).toEqual('blitz');
	});
});
