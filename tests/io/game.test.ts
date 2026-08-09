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

import { initializeRatingFunctions } from '@server/managers/rating-system';
import { gameFromString } from '@common/io/game';
import { isNotDefined } from '@common/utils/is-defined';

describe('IO conversion -- Elo', () => {
	initializeRatingFunctions('Elo');

	test('string', () => {
		const g = gameFromString(
			'{ "id": "0001", "title": "asdf", "white": "W", "whiteRating": {"rating": 1500.43, "numGames": 100, "won": 50, "drawn": 20, "lost": 30, "K": 40, "surpassed2400": true}, "black": "B", "blackRating" : {"rating": 1500.43, "numGames": 100, "won": 50, "drawn": 20, "lost": 30, "K": 40, "surpassed2400": false}, "result": "black_wins", "timeControlId": "blitz", "timeControlName": "Blitz (5 + 3)", "when": "2024-12-29..12:24:00"}'
		);
		expect(g).not.toBeNull();
		if (isNotDefined(g)) {
			return;
		}
		expect(g.id).toEqual('0001');
		expect(g.title).toEqual('asdf');
		expect(g.white).toEqual('W');
		expect(g.whiteRating).toEqual({
			rating: 1500.43,
			numGames: 100,
			won: 50,
			drawn: 20,
			lost: 30,
			K: 40,
			surpassed2400: true
		});
		expect(g.black).toEqual('B');
		expect(g.blackRating).toEqual({
			rating: 1500.43,
			numGames: 100,
			won: 50,
			drawn: 20,
			lost: 30,
			K: 40,
			surpassed2400: false
		});
		expect(g.result).toEqual('black_wins');
		expect(g.timeControlId).toEqual('blitz');
		expect(g.timeControlName).toEqual('Blitz (5 + 3)');
		expect(g.when).toEqual('2024-12-29..12:24:00');
	});
});
