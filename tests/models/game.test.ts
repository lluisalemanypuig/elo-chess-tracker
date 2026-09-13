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

import { toPlayerPrivateId } from '@common/models/player-id';
import {
	toTimeControlId,
	toTimeControlName,
} from '@common/models/time-control';
import { EloRating } from '@server/models/rating-framework/Elo/rating';
import { makeGame } from '@tests/test-utils';

const Blitz = toTimeControlId('Blitz');
const Blitz5p3 = toTimeControlName('Blitz (5 + 3)');

describe('Setters and Getters -- Elo', () => {
	test('Gets', () => {
		const rW = new EloRating(1500, 0, 0, 0, 0, 40, false);
		const rB = new EloRating(1500, 0, 0, 0, 0, 40, false);
		const g = makeGame({
			id: '1',
			title: 'asdf',
			white: 'W',
			whiteRating: rW,
			black: 'B',
			blackRating: rB,
			createdBy: 'a',
			whenCreated: '2020-02-17..00:00:00:000',
			result: 'white_wins',
			timeControlId: 'Blitz',
			timeControlName: 'Blitz (5 + 3)',
			whenPlayed: '2024-12-29..11:15:00',
		});

		expect(g.id).toEqual('1');
		expect(g.white).toEqual('W');
		expect(g.black).toEqual('B');
		expect(g.result).toEqual('white_wins');
		expect(g.timeControlId).toEqual(Blitz);
		expect(g.timeControlName).toEqual(Blitz5p3);
		expect(g.whenPlayed).toEqual('2024-12-29..11:15:00');
		expect(g.isUserInvolved(toPlayerPrivateId('W'))).toBe(true);
		expect(g.isUserInvolved(toPlayerPrivateId('B'))).toBe(true);
		expect(g.isUserInvolved(toPlayerPrivateId('q'))).toBe(false);
	});

	test('Sets', () => {
		let rW = new EloRating(1500, 0, 0, 0, 0, 40, false);
		let rB = new EloRating(1500, 0, 0, 0, 0, 40, false);
		const g = makeGame({
			id: '1',
			title: 'asdf',
			white: 'W',
			whiteRating: rW,
			black: 'B',
			blackRating: rB,
			createdBy: 'a',
			whenCreated: '2020-02-17..00:00:00:000',
			result: 'white_wins',
			timeControlId: 'Blitz',
			timeControlName: 'Blitz (5 + 3)',
			whenPlayed: '2024-12-29..11:15:00',
		});

		expect(g.result).toEqual('white_wins');
		g.result = 'black_wins';
		expect(g.result).toEqual('black_wins');

		expect(g.whiteRating).toEqual(rW);
		rW.rating = 2000;
		g.whiteRating = rW;
		expect(g.whiteRating).toEqual(rW);

		expect(g.blackRating).toEqual(rB);
		rB.rating = 1900;
		g.blackRating = rB;
		expect(g.blackRating).toEqual(rB);
	});
});
