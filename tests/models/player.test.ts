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
import { toTimeControlId } from '@common/models/time-control';
import { Player } from '@server/models/player';
import { EloRating } from '@server/models/rating-framework/Elo/rating';
import { TimeControlRating } from '@server/models/time-control-rating';

const Classical = toTimeControlId('Classical');
const Rapid = toTimeControlId('Rapid');
const Blitz = toTimeControlId('Blitz');
const Bullet = toTimeControlId('Bullet');

describe('construct', () => {
	const bullet = new EloRating(1400, 0, 0, 0, 0, 40, false);

	const blitz = new EloRating(1500, 0, 0, 0, 0, 40, false);
	const blitz_equal = new EloRating(1500, 0, 0, 0, 0, 40, false);
	const blitz_higher = new EloRating(1520, 1, 1, 0, 0, 40, false);

	const rapid = new EloRating(1600, 0, 0, 0, 0, 40, false);
	const classical = new EloRating(1700, 0, 0, 0, 0, 40, false);

	test('Setters and getters', () => {
		let p = new Player(toPlayerPrivateId('user.name'), [
			new TimeControlRating(Blitz, blitz),
			new TimeControlRating(Rapid, rapid),
			new TimeControlRating(Classical, classical),
		]);

		expect(p.username).toEqual('user.name');
		expect(p.hasRating(Blitz)).toBe(true);
		expect(p.hasRating(toTimeControlId('blitzy'))).toBe(false);
		expect(p.hasRating(Rapid)).toBe(true);
		expect(p.hasRating(toTimeControlId('rapido'))).toBe(false);
		expect(p.hasRating(Classical)).toBe(true);
		expect(p.hasRating(toTimeControlId('classico'))).toBe(false);

		expect(p.ratings.length).toBe(3);

		expect(p.hasRating(Bullet)).toBe(false);
		p.addRating(Bullet, bullet);
		expect(p.hasRating(Bullet)).toBe(true);

		expect(p.ratings.length).toBe(4);

		expect(p.indexTimeControlId(Blitz)).toBe(0);
		expect(p.indexTimeControlId(Rapid)).toBe(1);
		expect(p.indexTimeControlId(Classical)).toBe(2);
		expect(p.indexTimeControlId(Bullet)).toBe(3);

		expect(p.getRating(Bullet)).toEqual(bullet);
		expect(p.getRating(Blitz)).toEqual(blitz);
		expect(p.getRating(Rapid)).toEqual(rapid);
		expect(p.getRating(Classical)).toEqual(classical);

		expect(p.getRating(Bullet)).toBe(bullet);
		expect(p.getRating(Blitz)).toBe(blitz);
		expect(p.getRating(Rapid)).toBe(rapid);
		expect(p.getRating(Classical)).toBe(classical);

		p.setRating(Blitz, blitz_higher);
		expect(p.getRating(Blitz)).toBe(blitz_higher);
		expect(p.getRating(Blitz)).toEqual(blitz_higher);
		expect(p.getRating(Blitz)).not.toBe(blitz);

		p.setRating(Blitz, blitz_equal);
		expect(p.getRating(Blitz)).toBe(blitz_equal);
		expect(p.getRating(Blitz)).toEqual(blitz_equal);
		expect(p.getRating(Blitz)).not.toBe(blitz);

		p.setRating(Blitz, blitz);
		expect(p.getRating(Blitz)).toBe(blitz);
		expect(p.getRating(Blitz)).toEqual(blitz);
		expect(p.getRating(Blitz)).not.toBe(blitz_equal);
	});

	test('Clone', () => {
		let p = new Player(toPlayerPrivateId('user.name'), [
			new TimeControlRating(Blitz, blitz),
			new TimeControlRating(Rapid, rapid),
			new TimeControlRating(Classical, classical),
		]);
		let pc = p.clone();

		expect(pc.getRating(Blitz)).toEqual(blitz);
		expect(pc.getRating(Rapid)).toEqual(rapid);
		expect(pc.getRating(Classical)).toEqual(classical);

		expect(pc.getRating(Blitz)).not.toBe(blitz);
		expect(pc.getRating(Rapid)).not.toBe(rapid);
		expect(pc.getRating(Classical)).not.toBe(classical);

		p.setRating(Blitz, blitz_higher);
		expect(pc.getRating(Blitz)).not.toBe(blitz_higher);
		expect(pc.getRating(Blitz)).not.toEqual(blitz_higher);

		p.setRating(Blitz, blitz_equal);
		expect(pc.getRating(Blitz)).not.toBe(blitz);
		expect(pc.getRating(Blitz)).toEqual(blitz);
	});
});
