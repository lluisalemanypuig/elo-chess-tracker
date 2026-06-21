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

import { isDefined } from '@common/utils/is_defined';
import { time_control_rating_array_from_string, time_control_rating_from_string } from '@common/io/time_control_rating';
import { initialize_rating_functions } from '@server/managers/rating_system';

describe('IO conversion -- Elo', () => {
	initialize_rating_functions('Elo');

	test('string', () => {
		const tcr = time_control_rating_from_string(
			'{ "time_control": "blitz", "rating": { "rating": 1500.43, "num_games": 100, "won": 50, "drawn": 20, "lost": 30, "K": 40, "surpassed_2400": true } }'
		);
		expect(tcr).not.toBeNull();
		if (!isDefined(tcr)) {
			return;
		}
		expect(tcr.rating).toEqual({
			rating: 1500.43,
			num_games: 100,
			won: 50,
			drawn: 20,
			lost: 30,
			K: 40,
			surpassed_2400: true
		});
		expect(tcr.time_control).toEqual('blitz');
	});

	test('string -- set', () => {
		const tcr = time_control_rating_array_from_string(
			'[{ "time_control": "blitz", "rating": { "rating": 1500.43, "num_games": 100, "won": 50, "drawn": 20, "lost": 30, "K": 40, "surpassed_2400": true } }]'
		);
		expect(tcr).not.toBeNull();
		if (!isDefined(tcr)) {
			return;
		}
		expect(tcr[0].rating).toEqual({
			rating: 1500.43,
			num_games: 100,
			won: 50,
			drawn: 20,
			lost: 30,
			K: 40,
			surpassed_2400: true
		});
		expect(tcr[0].time_control).toEqual('blitz');
	});
});
