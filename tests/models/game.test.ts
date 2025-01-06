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

import { Game, game_from_json } from '../../ts-server/models/game';
import { EloRating } from '../../ts-server/rating_framework/Elo/rating';
import { initialize_rating_functions } from '../../ts-server/managers/rating_system';

describe('Setters and Getters -- Elo', () => {
	test('Gets', () => {
		const rW = new EloRating(1500, 0, 0, 0, 0, 40, false);
		const rB = new EloRating(1500, 0, 0, 0, 0, 40, false);
		const g = new Game('1', 'W', rW, 'B', rB, 'white_wins', 'blitz', 'Blitz (5 + 3)', '2024-12-29..11:15:00');

		expect(g.get_id()).toEqual('1');
		expect(g.get_white()).toEqual('W');
		expect(g.get_black()).toEqual('B');
		expect(g.get_result()).toEqual('white_wins');
		expect(g.get_time_control_id()).toEqual('blitz');
		expect(g.get_time_control_name()).toEqual('Blitz (5 + 3)');
		expect(g.get_date()).toEqual('2024-12-29..11:15:00');
		expect(g.is_user_involved('W')).toBe(true);
		expect(g.is_user_involved('B')).toBe(true);
		expect(g.is_user_involved('q')).toBe(false);
	});

	test('Sets', () => {
		let rW = new EloRating(1500, 0, 0, 0, 0, 40, false);
		let rB = new EloRating(1500, 0, 0, 0, 0, 40, false);
		const g = new Game('1', 'W', rW, 'B', rB, 'white_wins', 'blitz', 'Blitz (5 + 3)', '2024-12-29..11:15:00');

		expect(g.get_result()).toEqual('white_wins');
		g.set_result('black_wins');
		expect(g.get_result()).toEqual('black_wins');

		expect(g.get_white_rating()).toEqual(rW);
		rW.rating = 2000;
		g.set_white_rating(rW);
		expect(g.get_white_rating()).toEqual(rW);

		expect(g.get_black_rating()).toEqual(rB);
		rB.rating = 1900;
		g.set_black_rating(rB);
		expect(g.get_black_rating()).toEqual(rB);
	});
});

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
