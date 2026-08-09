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

import { toPlayerPrivateId } from '@common/models/player';
import { toTimeControlId, toTimeControlName } from '@common/models/time-control';
import { Game, toGameId } from '@common/models/game';
import { EloRating } from '@common/models/rating-framework/Elo/rating';
import { EloPlayerVsPlayer } from '@server/rating-framework/Elo/formula';
import { toDateFull } from '@common/utils/time';

const Blitz = toTimeControlId('Blitz');
const Blitz5p3 = toTimeControlName('Blitz (5 + 3)');

describe('Simple games', () => {
	test('white_wins', () => {
		const bW = new EloRating(1500, 0, 0, 0, 0, 40, false);
		const bB = new EloRating(1500, 0, 0, 0, 0, 40, false);
		const game = new Game(
			toGameId('01'),
			'sample',
			toPlayerPrivateId('W'),
			bW,
			toPlayerPrivateId('B'),
			bB,
			'white_wins',
			Blitz,
			Blitz5p3,
			toDateFull('2024-12-28..16:41:00')
		);

		const [aW, aB] = EloPlayerVsPlayer(game);

		expect(aW.rating).toEqual(1520);
		expect(aW.numGames).toEqual(bW.numGames + 1);
		expect(aW.won).toEqual(bW.won + 1);
		expect(aW.drawn).toEqual(bW.drawn);
		expect(aW.lost).toEqual(bW.lost);
		expect(aW.K).toEqual(bW.K);

		expect(aB.rating).toEqual(1480);
		expect(aB.numGames).toEqual(bB.numGames + 1);
		expect(aB.won).toEqual(bB.won);
		expect(aB.drawn).toEqual(bB.drawn);
		expect(aB.lost).toEqual(bB.lost + 1);
		expect(aB.K).toEqual(bB.K);
	});

	test('draw', () => {
		const bW = new EloRating(1500, 0, 0, 0, 0, 40, false);
		const bB = new EloRating(1500, 0, 0, 0, 0, 40, false);
		const game = new Game(
			toGameId('01'),
			'sample',
			toPlayerPrivateId('W'),
			bW,
			toPlayerPrivateId('B'),
			bB,
			'draw',
			Blitz,
			Blitz5p3,
			toDateFull('2024-12-28..16:41:00')
		);

		const [aW, aB] = EloPlayerVsPlayer(game);

		expect(aW.rating).toEqual(bW.rating);
		expect(aW.numGames).toEqual(bW.numGames + 1);
		expect(aW.won).toEqual(bW.won);
		expect(aW.drawn).toEqual(bW.drawn + 1);
		expect(aW.lost).toEqual(bW.lost);

		expect(aB.rating).toEqual(bB.rating);
		expect(aB.numGames).toEqual(bB.numGames + 1);
		expect(aB.won).toEqual(bB.won);
		expect(aB.drawn).toEqual(bB.drawn + 1);
		expect(aB.lost).toEqual(bB.lost);
	});

	test('black_wins', () => {
		const bW = new EloRating(1500, 0, 0, 0, 0, 40, false);
		const bB = new EloRating(1500, 0, 0, 0, 0, 40, false);
		const game = new Game(
			toGameId('01'),
			'sample',
			toPlayerPrivateId('W'),
			bW,
			toPlayerPrivateId('B'),
			bB,
			'black_wins',
			Blitz,
			Blitz5p3,
			toDateFull('2024-12-28..16:41:00')
		);

		const [aW, aB] = EloPlayerVsPlayer(game);

		expect(aW.rating).toEqual(1480);
		expect(aW.numGames).toEqual(bW.numGames + 1);
		expect(aW.won).toEqual(bW.won);
		expect(aW.drawn).toEqual(bW.drawn);
		expect(aW.lost).toEqual(bW.lost + 1);
		expect(aW.K).toEqual(bW.K);

		expect(aB.rating).toEqual(1520);
		expect(aB.numGames).toEqual(bB.numGames + 1);
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

		while (W.numGames < 29) {
			const game = new Game(
				toGameId('01'),
				'sample',
				toPlayerPrivateId('W'),
				W,
				toPlayerPrivateId('B'),
				B,
				'white_wins',
				Blitz,
				Blitz5p3,
				toDateFull('2024-12-28..16:41:00')
			);
			[W, B] = EloPlayerVsPlayer(game);
		}
		expect(W.K).toBe(40);

		const game = new Game(
			toGameId('01'),
			'sample',
			toPlayerPrivateId('W'),
			W,
			toPlayerPrivateId('B'),
			B,
			'white_wins',
			Blitz,
			Blitz5p3,
			toDateFull('2024-12-28..16:41:00')
		);
		[W, B] = EloPlayerVsPlayer(game);

		expect(W.K).toBe(20);
	});

	test('Constant :: 40 -> 10', () => {
		let W = new EloRating(1500, 0, 0, 0, 0, 40, false);
		let B = new EloRating(2000, 0, 0, 0, 0, 40, false);

		while (W.numGames < 30) {
			const game = new Game(
				toGameId('01'),
				'sample',
				toPlayerPrivateId('W'),
				W,
				toPlayerPrivateId('B'),
				B,
				'white_wins',
				Blitz,
				Blitz5p3,
				toDateFull('2024-12-28..16:41:00')
			);
			[W, B] = EloPlayerVsPlayer(game);
			B.rating = 2000;
		}

		expect(W.K).toBe(20);
		expect(W.numGames).toBeGreaterThanOrEqual(30);

		while (W.rating < 2400) {
			const game = new Game(
				toGameId('01'),
				'sample',
				toPlayerPrivateId('W'),
				W,
				toPlayerPrivateId('B'),
				B,
				'white_wins',
				Blitz,
				Blitz5p3,
				toDateFull('2024-12-28..16:41:00')
			);
			[W, B] = EloPlayerVsPlayer(game);
			B.rating = 2000;
		}

		expect(W.rating).toBeGreaterThanOrEqual(2400);
		expect(W.surpassed2400).toBe(true);
		expect(W.K).toBe(10);
		expect(W.numGames).toBeGreaterThanOrEqual(30);

		while (W.rating > 2200) {
			const game = new Game(
				toGameId('01'),
				'sample',
				toPlayerPrivateId('W'),
				W,
				toPlayerPrivateId('B'),
				B,
				'black_wins',
				Blitz,
				Blitz5p3,
				toDateFull('2024-12-28..16:41:00')
			);
			[W, B] = EloPlayerVsPlayer(game);
			B.rating = 2000;
		}
	});

	test('Constant :: stays 10 forever', () => {
		let W = new EloRating(1500, 0, 0, 0, 0, 40, false);
		let B = new EloRating(2000, 0, 0, 0, 0, 40, false);

		while (W.K != 10) {
			const game = new Game(
				toGameId('01'),
				'sample',
				toPlayerPrivateId('W'),
				W,
				toPlayerPrivateId('B'),
				B,
				'white_wins',
				Blitz,
				Blitz5p3,
				toDateFull('2024-12-28..16:41:00')
			);
			[W, B] = EloPlayerVsPlayer(game);
			B.rating = 2000;
		}

		expect(W.surpassed2400).toBe(true);
		expect(W.K).toBe(10);

		while (W.rating > 2200) {
			const game = new Game(
				toGameId('01'),
				'sample',
				toPlayerPrivateId('W'),
				W,
				toPlayerPrivateId('B'),
				B,
				'black_wins',
				Blitz,
				Blitz5p3,
				toDateFull('2024-12-28..16:41:00')
			);
			[W, B] = EloPlayerVsPlayer(game);
			B.rating = 2000;
		}

		expect(W.surpassed2400).toBe(true);
		expect(W.rating).toBeLessThan(2400);
		expect(W.K).toBe(10);
	});
});
