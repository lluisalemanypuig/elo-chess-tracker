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

import { Game } from '../../../ts-server/models/game';
import { EloRating } from '../../../ts-server/rating_framework/Elo/rating';
import { player_vs_player } from '../../../ts-server/rating_framework/Elo/formula';

describe('Simple games', () => {
	test('white_wins', () => {
		const bW = new EloRating(1500, 0, 0, 0, 0, 40, false);
		const bB = new EloRating(1500, 0, 0, 0, 0, 40, false);
		const game = new Game('01', 'W', bW, 'B', bB, 'white_wins', 'blitz', 'Blitz (5+3)', '2024-12-28..16:41:00');

		const [aW, aB] = player_vs_player(game);

		expect(aW.rating).toEqual(1520);
		expect(aW.num_games).toEqual(bW.num_games + 1);
		expect(aW.won).toEqual(bW.won + 1);
		expect(aW.drawn).toEqual(bW.drawn);
		expect(aW.lost).toEqual(bW.lost);
		expect(aW.K).toEqual(bW.K);

		expect(aB.rating).toEqual(1480);
		expect(aB.num_games).toEqual(bB.num_games + 1);
		expect(aB.won).toEqual(bB.won);
		expect(aB.drawn).toEqual(bB.drawn);
		expect(aB.lost).toEqual(bB.lost + 1);
		expect(aB.K).toEqual(bB.K);
	});

	test('draw', () => {
		const bW = new EloRating(1500, 0, 0, 0, 0, 40, false);
		const bB = new EloRating(1500, 0, 0, 0, 0, 40, false);
		const game = new Game('01', 'W', bW, 'B', bB, 'draw', 'blitz', 'Blitz (5+3)', '2024-12-28..16:41:00');

		const [aW, aB] = player_vs_player(game);

		expect(aW.rating).toEqual(bW.rating);
		expect(aW.num_games).toEqual(bW.num_games + 1);
		expect(aW.won).toEqual(bW.won);
		expect(aW.drawn).toEqual(bW.drawn + 1);
		expect(aW.lost).toEqual(bW.lost);

		expect(aB.rating).toEqual(bB.rating);
		expect(aB.num_games).toEqual(bB.num_games + 1);
		expect(aB.won).toEqual(bB.won);
		expect(aB.drawn).toEqual(bB.drawn + 1);
		expect(aB.lost).toEqual(bB.lost);
	});

	test('black_wins', () => {
		const bW = new EloRating(1500, 0, 0, 0, 0, 40, false);
		const bB = new EloRating(1500, 0, 0, 0, 0, 40, false);
		const game = new Game('01', 'W', bW, 'B', bB, 'black_wins', 'blitz', 'Blitz (5+3)', '2024-12-28..16:41:00');

		const [aW, aB] = player_vs_player(game);

		expect(aW.rating).toEqual(1480);
		expect(aW.num_games).toEqual(bW.num_games + 1);
		expect(aW.won).toEqual(bW.won);
		expect(aW.drawn).toEqual(bW.drawn);
		expect(aW.lost).toEqual(bW.lost + 1);
		expect(aW.K).toEqual(bW.K);

		expect(aB.rating).toEqual(1520);
		expect(aB.num_games).toEqual(bB.num_games + 1);
		expect(aB.won).toEqual(bB.won + 1);
		expect(aB.drawn).toEqual(bB.drawn);
		expect(aB.lost).toEqual(bB.lost);
		expect(aB.K).toEqual(bB.K);
	});
});

describe('Series of games', () => {
	test('Constant :: 40 -> 20', () => {
		let W = new EloRating(1500, 0, 0, 0, 0, 40, false);
		let B = new EloRating(1500, 0, 0, 0, 0, 40, false);

		while (W.num_games < 29) {
			const game = new Game('01', 'W', W, 'B', B, 'white_wins', 'blitz', 'Blitz (5+3)', '2024-12-28..16:41:00');
			[W, B] = player_vs_player(game);
		}
		expect(W.K).toBe(40);

		const game = new Game('01', 'W', W, 'B', B, 'white_wins', 'blitz', 'Blitz (5+3)', '2024-12-28..16:41:00');
		[W, B] = player_vs_player(game);

		expect(W.K).toBe(20);
	});

	test('Constant :: 40 -> 10', () => {
		let W = new EloRating(1500, 0, 0, 0, 0, 40, false);
		let B = new EloRating(2000, 0, 0, 0, 0, 40, false);

		while (W.num_games < 30) {
			const game = new Game('01', 'W', W, 'B', B, 'white_wins', 'blitz', 'Blitz (5+3)', '2024-12-28..16:41:00');
			[W, B] = player_vs_player(game);
			B.rating = 2000;
		}

		expect(W.K).toBe(20);
		expect(W.num_games).toBeGreaterThanOrEqual(30);

		while (W.rating < 2400) {
			const game = new Game('01', 'W', W, 'B', B, 'white_wins', 'blitz', 'Blitz (5+3)', '2024-12-28..16:41:00');
			[W, B] = player_vs_player(game);
			B.rating = 2000;
		}

		expect(W.rating).toBeGreaterThanOrEqual(2400);
		expect(W.surpassed_2400).toBe(true);
		expect(W.K).toBe(10);
		expect(W.num_games).toBeGreaterThanOrEqual(30);

		while (W.rating > 2200) {
			const game = new Game('01', 'W', W, 'B', B, 'black_wins', 'blitz', 'Blitz (5+3)', '2024-12-28..16:41:00');
			[W, B] = player_vs_player(game);
			B.rating = 2000;
		}
	});

	test('Constant :: stays 10 forever', () => {
		let W = new EloRating(1500, 0, 0, 0, 0, 40, false);
		let B = new EloRating(2000, 0, 0, 0, 0, 40, false);

		while (W.K != 10) {
			const game = new Game('01', 'W', W, 'B', B, 'white_wins', 'blitz', 'Blitz (5+3)', '2024-12-28..16:41:00');
			[W, B] = player_vs_player(game);
			B.rating = 2000;
		}

		expect(W.surpassed_2400).toBe(true);
		expect(W.K).toBe(10);

		while (W.rating > 2200) {
			const game = new Game('01', 'W', W, 'B', B, 'black_wins', 'blitz', 'Blitz (5+3)', '2024-12-28..16:41:00');
			[W, B] = player_vs_player(game);
			B.rating = 2000;
		}

		expect(W.surpassed_2400).toBe(true);
		expect(W.rating).toBeLessThan(2400);
		expect(W.K).toBe(10);
	});
});
