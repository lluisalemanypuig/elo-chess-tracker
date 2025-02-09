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

import { EloRating } from '../../src-server/rating_framework/Elo/rating';
import { initialize_rating_functions } from '../../src-server/managers/rating_system';
import { game_from_json } from '../../src-server/io/game';

describe('From JSON -- Elo', () => {
	initialize_rating_functions('Elo');

	test('string', () => {
		const g = game_from_json(
			'{ "id": "0001", "white": "W", "white_rating": {"rating": 1500.43, "num_games": 100, "won": 50, "drawn": 20, "lost": 30, "K": 40, "surpassed_2400": true}, "black": "B", "black_rating" : {"rating": 1500.43, "num_games": 100, "won": 50, "drawn": 20, "lost": 30, "K": 40, "surpassed_2400": false}, "result": "black_wins", "time_control_id": "blitz", "time_control_name": "Blitz (5 + 3)", "when": "2024-12-29..12:24:00"}'
		);
		expect(g.get_id()).toEqual('0001');
		expect(g.get_white()).toEqual('W');
		expect(g.get_white_rating()).toEqual(new EloRating(1500.43, 100, 50, 20, 30, 40, true));
		expect(g.get_black()).toEqual('B');
		expect(g.get_black_rating()).toEqual(new EloRating(1500.43, 100, 50, 20, 30, 40, false));
		expect(g.get_result()).toEqual('black_wins');
		expect(g.get_time_control_id()).toEqual('blitz');
		expect(g.get_time_control_name()).toEqual('Blitz (5 + 3)');
		expect(g.get_date()).toEqual('2024-12-29..12:24:00');
	});

	test('JSON', () => {
		const g = game_from_json({
			id: '0001',
			white: 'W',
			white_rating: {
				rating: 1500.43,
				num_games: 100,
				won: 50,
				drawn: 20,
				lost: 30,
				K: 40,
				surpassed_2400: true
			},
			black: 'B',
			black_rating: {
				rating: 1500.43,
				num_games: 100,
				won: 50,
				drawn: 20,
				lost: 30,
				K: 40,
				surpassed_2400: false
			},
			result: 'black_wins',
			time_control_id: 'blitz',
			time_control_name: 'Blitz (5 + 3)',
			when: '2024-12-29..12:24:00'
		});
		expect(g.get_id()).toEqual('0001');
		expect(g.get_white()).toEqual('W');
		expect(g.get_white_rating()).toEqual(new EloRating(1500.43, 100, 50, 20, 30, 40, true));
		expect(g.get_black()).toEqual('B');
		expect(g.get_black_rating()).toEqual(new EloRating(1500.43, 100, 50, 20, 30, 40, false));
		expect(g.get_result()).toEqual('black_wins');
		expect(g.get_time_control_id()).toEqual('blitz');
		expect(g.get_time_control_name()).toEqual('Blitz (5 + 3)');
		expect(g.get_date()).toEqual('2024-12-29..12:24:00');
	});
});
