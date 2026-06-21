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

import { Game } from '@common/models/game';
import { EloRating } from '@common/models/rating_framework/Elo/rating';

describe('Setters and Getters -- Elo', () => {
	test('Gets', () => {
		const rW = new EloRating(1500, 0, 0, 0, 0, 40, false);
		const rB = new EloRating(1500, 0, 0, 0, 0, 40, false);
		const g = new Game(
			'1',
			'asdf',
			'W',
			rW,
			'B',
			rB,
			'white_wins',
			'blitz',
			'Blitz (5 + 3)',
			'2024-12-29..11:15:00'
		);

		expect(g.id).toEqual('1');
		expect(g.white).toEqual('W');
		expect(g.black).toEqual('B');
		expect(g.result).toEqual('white_wins');
		expect(g.time_control_id).toEqual('blitz');
		expect(g.time_control_name).toEqual('Blitz (5 + 3)');
		expect(g.when).toEqual('2024-12-29..11:15:00');
		expect(g.is_user_involved('W')).toBe(true);
		expect(g.is_user_involved('B')).toBe(true);
		expect(g.is_user_involved('q')).toBe(false);
	});

	test('Sets', () => {
		let rW = new EloRating(1500, 0, 0, 0, 0, 40, false);
		let rB = new EloRating(1500, 0, 0, 0, 0, 40, false);
		const g = {
			id: '1',
			title: 'asdf',
			white: 'W',
			white_rating: rW,
			black: 'B',
			black_rating: rB,
			result: 'white_wins',
			time_control_id: 'blitz',
			time_control_name: 'Blitz (5 + 3)',
			when: '2024-12-29..11:15:00'
		};

		expect(g.result).toEqual('white_wins');
		g.result = 'black_wins';
		expect(g.result).toEqual('black_wins');

		expect(g.white_rating).toEqual(rW);
		rW.rating = 2000;
		g.white_rating = rW;
		expect(g.white_rating).toEqual(rW);

		expect(g.black_rating).toEqual(rB);
		rB.rating = 1900;
		g.black_rating = rB;
		expect(g.black_rating).toEqual(rB);
	});
});
