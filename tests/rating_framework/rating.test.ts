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

import { Rating } from '../../src-server/rating_framework/rating';

describe('clone', () => {
	test('1', () => {
		const r = new Rating(1500.0, 100, 50, 30, 20);
		const rc = r.clone();

		expect(rc.rating).toBe(r.rating);
		expect(rc.num_games).toBe(r.num_games);
		expect(rc.won).toBe(r.won);
		expect(rc.drawn).toBe(r.drawn);
		expect(rc.lost).toBe(r.lost);

		expect(rc.num_won_drawn_lost()).toEqual([rc.num_games, rc.won, rc.drawn, rc.lost]);
	});
});
