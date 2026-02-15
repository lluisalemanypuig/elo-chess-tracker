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

import { initialize_rating_functions } from '../../src-server/managers/rating_system';
import { EloRating } from '../../src-server/rating_framework/Elo/rating';
import { player_from_json } from '../../src-server/io/player';

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
