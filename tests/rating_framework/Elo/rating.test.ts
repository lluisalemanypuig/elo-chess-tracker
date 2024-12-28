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

import { Elo_rating_from_json, Elo_rating_new, EloRating } from '../../../ts-server/rating_framework/Elo/rating';

describe('JSON conversion', () => {
	test('from string to rating', () => {
		const elo = Elo_rating_from_json(
			'{"rating": 1500.43, "num_games": 100, "won": 50, "drawn": 20, "lost": 30, "K": 40}'
		);
		expect(elo).toEqual(new EloRating(1500.43, 100, 50, 20, 30, 40));
	});

	test('from JSON to rating', () => {
		const elo = Elo_rating_from_json({
			rating: 1500.43,
			num_games: 100,
			won: 50,
			drawn: 20,
			lost: 30,
			K: 40
		});
		expect(elo).toEqual(new EloRating(1500.43, 100, 50, 20, 30, 40));
	});
});

describe('Initial rating', () => {
	test('1', () => {
		const elo = Elo_rating_new();
		expect(elo.rating).toBe(1500);
		expect(elo.num_games).toBe(0);
		expect(elo.won).toBe(0);
		expect(elo.drawn).toBe(0);
		expect(elo.lost).toBe(0);
		expect(elo.K).toBe(40);
	});
});

describe('Clone', () => {
	test('1', () => {
		const r = new EloRating(1500.0, 100, 50, 30, 20, 40);
		const rc = r.clone();

		expect(rc.rating).toBe(r.rating);
		expect(rc.num_games).toBe(r.num_games);
		expect(rc.won).toBe(r.won);
		expect(rc.drawn).toBe(r.drawn);
		expect(rc.lost).toBe(r.lost);
		expect(rc.K).toBe(r.K);
	});
});
