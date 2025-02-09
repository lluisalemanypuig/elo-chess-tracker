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

import { Player } from '../../src-server/models/player';
import { TimeControlRating } from '../../src-server/models/time_control_rating';
import { initialize_rating_functions } from '../../src-server/managers/rating_system';
import { EloRating } from '../../src-server/rating_framework/Elo/rating';
import { player_from_json } from '../../src-server/io/player';

describe('construct', () => {
	const bullet = new EloRating(1400, 0, 0, 0, 0, 40, false);

	const blitz = new EloRating(1500, 0, 0, 0, 0, 40, false);
	const blitz_equal = new EloRating(1500, 0, 0, 0, 0, 40, false);
	const blitz_higher = new EloRating(1520, 1, 1, 0, 0, 40, false);

	const rapid = new EloRating(1600, 0, 0, 0, 0, 40, false);
	const classical = new EloRating(1700, 0, 0, 0, 0, 40, false);

	test('Setters and getters', () => {
		let p = new Player('user.name', [
			new TimeControlRating('blitz', blitz),
			new TimeControlRating('rapid', rapid),
			new TimeControlRating('classical', classical)
		]);

		expect(p.get_username()).toEqual('user.name');
		expect(p.has_rating('blitz')).toBe(true);
		expect(p.has_rating('blitzy')).toBe(false);
		expect(p.has_rating('rapid')).toBe(true);
		expect(p.has_rating('rapido')).toBe(false);
		expect(p.has_rating('classical')).toBe(true);
		expect(p.has_rating('classico')).toBe(false);

		expect(p.get_all_ratings().length).toBe(3);

		expect(p.has_rating('bullet')).toBe(false);
		p.add_rating('bullet', bullet);
		expect(p.has_rating('bullet')).toBe(true);

		expect(p.get_all_ratings().length).toBe(4);

		expect(p.index_time_control_id('blitz')).toBe(0);
		expect(p.index_time_control_id('rapid')).toBe(1);
		expect(p.index_time_control_id('classical')).toBe(2);
		expect(p.index_time_control_id('bullet')).toBe(3);

		expect(p.get_rating('bullet')).toEqual(bullet);
		expect(p.get_rating('blitz')).toEqual(blitz);
		expect(p.get_rating('rapid')).toEqual(rapid);
		expect(p.get_rating('classical')).toEqual(classical);

		expect(p.get_rating('bullet')).toBe(bullet);
		expect(p.get_rating('blitz')).toBe(blitz);
		expect(p.get_rating('rapid')).toBe(rapid);
		expect(p.get_rating('classical')).toBe(classical);

		p.set_rating('blitz', blitz_higher);
		expect(p.get_rating('blitz')).toBe(blitz_higher);
		expect(p.get_rating('blitz')).toEqual(blitz_higher);
		expect(p.get_rating('blitz')).not.toBe(blitz);

		p.set_rating('blitz', blitz_equal);
		expect(p.get_rating('blitz')).toBe(blitz_equal);
		expect(p.get_rating('blitz')).toEqual(blitz_equal);
		expect(p.get_rating('blitz')).not.toBe(blitz);

		p.set_rating('blitz', blitz);
		expect(p.get_rating('blitz')).toBe(blitz);
		expect(p.get_rating('blitz')).toEqual(blitz);
		expect(p.get_rating('blitz')).not.toBe(blitz_equal);
	});

	test('Clone', () => {
		let p = new Player('user.name', [
			new TimeControlRating('blitz', blitz),
			new TimeControlRating('rapid', rapid),
			new TimeControlRating('classical', classical)
		]);
		let pc = p.clone();

		expect(pc.get_rating('blitz')).toEqual(blitz);
		expect(pc.get_rating('rapid')).toEqual(rapid);
		expect(pc.get_rating('classical')).toEqual(classical);

		expect(pc.get_rating('blitz')).not.toBe(blitz);
		expect(pc.get_rating('rapid')).not.toBe(rapid);
		expect(pc.get_rating('classical')).not.toBe(classical);

		p.set_rating('blitz', blitz_higher);
		expect(pc.get_rating('blitz')).not.toEqual(blitz_higher);

		p.set_rating('blitz', blitz_equal);
		expect(pc.get_rating('blitz')).not.toBe(blitz);
		expect(pc.get_rating('blitz')).toEqual(blitz);
	});
});

describe('From JSON -- Elo', () => {
	initialize_rating_functions('Elo');
	const blitz = new EloRating(1500, 0, 0, 0, 0, 40, false);
	const classical = new EloRating(1700, 0, 0, 0, 0, 40, false);

	test('string', () => {
		const p = player_from_json(
			'{ "username": "user.name", "ratings": [ { "time_control": "blitz", "rating": { "rating": 1500, "num_games": 0, "won": 0, "drawn": 0, "lost": 0, "K": 40, "surpassed_2400": false } }, { "time_control": "classical", "rating": { "rating": 1700, "num_games": 0, "won": 0, "drawn": 0, "lost": 0, "K": 40, "surpassed_2400": false } } ]}'
		);

		expect(p.get_username()).toEqual('user.name');
		expect(p.get_all_ratings().length).toEqual(2);
		expect(p.has_rating('blitz')).toEqual(true);
		expect(p.has_rating('classical')).toEqual(true);
		expect(p.get_rating('classical')).toEqual(classical);
	});

	test('JSON', () => {
		const p = player_from_json({
			username: 'user.name',
			ratings: [
				{
					time_control: 'blitz',
					rating: {
						rating: 1500,
						num_games: 0,
						won: 0,
						drawn: 0,
						lost: 0,
						K: 40,
						surpassed_2400: false
					}
				},
				{
					time_control: 'classical',
					rating: {
						rating: 1700,
						num_games: 0,
						won: 0,
						drawn: 0,
						lost: 0,
						K: 40,
						surpassed_2400: false
					}
				}
			]
		});

		expect(p.get_username()).toEqual('user.name');
		expect(p.get_all_ratings().length).toEqual(2);
		expect(p.has_rating('blitz')).toEqual(true);
		expect(p.has_rating('classical')).toEqual(true);
		expect(p.get_rating('blitz')).toEqual(blitz);
		expect(p.get_rating('classical')).toEqual(classical);
	});
});
