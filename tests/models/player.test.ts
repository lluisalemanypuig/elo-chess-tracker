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

import { Player, toPlayerPrivateId } from '@common/models/player';
import { TimeControlRating } from '@common/models/time_control_rating';
import { EloRating } from '@common/models/rating_framework/Elo/rating';
import { toTimeControlId } from '@common/models/time_control';

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
			new TimeControlRating(Classical, classical)
		]);

		expect(p.username).toEqual('user.name');
		expect(p.has_rating(Blitz)).toBe(true);
		expect(p.has_rating(toTimeControlId('blitzy'))).toBe(false);
		expect(p.has_rating(Rapid)).toBe(true);
		expect(p.has_rating(toTimeControlId('rapido'))).toBe(false);
		expect(p.has_rating(Classical)).toBe(true);
		expect(p.has_rating(toTimeControlId('classico'))).toBe(false);

		expect(p.ratings.length).toBe(3);

		expect(p.has_rating(Bullet)).toBe(false);
		p.add_rating(Bullet, bullet);
		expect(p.has_rating(Bullet)).toBe(true);

		expect(p.ratings.length).toBe(4);

		expect(p.index_time_control_id(Blitz)).toBe(0);
		expect(p.index_time_control_id(Rapid)).toBe(1);
		expect(p.index_time_control_id(Classical)).toBe(2);
		expect(p.index_time_control_id(Bullet)).toBe(3);

		expect(p.get_rating(Bullet)).toEqual(bullet);
		expect(p.get_rating(Blitz)).toEqual(blitz);
		expect(p.get_rating(Rapid)).toEqual(rapid);
		expect(p.get_rating(Classical)).toEqual(classical);

		expect(p.get_rating(Bullet)).toBe(bullet);
		expect(p.get_rating(Blitz)).toBe(blitz);
		expect(p.get_rating(Rapid)).toBe(rapid);
		expect(p.get_rating(Classical)).toBe(classical);

		p.set_rating(Blitz, blitz_higher);
		expect(p.get_rating(Blitz)).toBe(blitz_higher);
		expect(p.get_rating(Blitz)).toEqual(blitz_higher);
		expect(p.get_rating(Blitz)).not.toBe(blitz);

		p.set_rating(Blitz, blitz_equal);
		expect(p.get_rating(Blitz)).toBe(blitz_equal);
		expect(p.get_rating(Blitz)).toEqual(blitz_equal);
		expect(p.get_rating(Blitz)).not.toBe(blitz);

		p.set_rating(Blitz, blitz);
		expect(p.get_rating(Blitz)).toBe(blitz);
		expect(p.get_rating(Blitz)).toEqual(blitz);
		expect(p.get_rating(Blitz)).not.toBe(blitz_equal);
	});

	test('Clone', () => {
		let p = new Player(toPlayerPrivateId('user.name'), [
			new TimeControlRating(Blitz, blitz),
			new TimeControlRating(Rapid, rapid),
			new TimeControlRating(Classical, classical)
		]);
		let pc = p.clone();

		expect(pc.get_rating(Blitz)).toEqual(blitz);
		expect(pc.get_rating(Rapid)).toEqual(rapid);
		expect(pc.get_rating(Classical)).toEqual(classical);

		expect(pc.get_rating(Blitz)).not.toBe(blitz);
		expect(pc.get_rating(Rapid)).not.toBe(rapid);
		expect(pc.get_rating(Classical)).not.toBe(classical);

		p.set_rating(Blitz, blitz_higher);
		expect(pc.get_rating(Blitz)).not.toBe(blitz_higher);
		expect(pc.get_rating(Blitz)).not.toEqual(blitz_higher);

		p.set_rating(Blitz, blitz_equal);
		expect(pc.get_rating(Blitz)).not.toBe(blitz);
		expect(pc.get_rating(Blitz)).toEqual(blitz);
	});
});
