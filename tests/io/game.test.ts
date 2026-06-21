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

import { initialize_rating_functions } from '@server/managers/rating_system';
import { game_from_string } from '@common/io/game';
import { isDefined } from '@common/utils/is_defined';

describe('IO conversion -- Elo', () => {
	initialize_rating_functions('Elo');

	test('string', () => {
		const g = game_from_string(
			'{ "id": "0001", "title": "asdf", "white": "W", "white_rating": {"rating": 1500.43, "num_games": 100, "won": 50, "drawn": 20, "lost": 30, "K": 40, "surpassed_2400": true}, "black": "B", "black_rating" : {"rating": 1500.43, "num_games": 100, "won": 50, "drawn": 20, "lost": 30, "K": 40, "surpassed_2400": false}, "result": "black_wins", "time_control_id": "blitz", "time_control_name": "Blitz (5 + 3)", "when": "2024-12-29..12:24:00"}'
		);
		expect(g).not.toBeNull();
		if (!isDefined(g)) {
			return;
		}
		expect(g.id).toEqual('0001');
		expect(g.title).toEqual('asdf');
		expect(g.white).toEqual('W');
		expect(g.white_rating).toEqual({
			rating: 1500.43,
			num_games: 100,
			won: 50,
			drawn: 20,
			lost: 30,
			K: 40,
			surpassed_2400: true
		});
		expect(g.black).toEqual('B');
		expect(g.black_rating).toEqual({
			rating: 1500.43,
			num_games: 100,
			won: 50,
			drawn: 20,
			lost: 30,
			K: 40,
			surpassed_2400: false
		});
		expect(g.result).toEqual('black_wins');
		expect(g.time_control_id).toEqual('blitz');
		expect(g.time_control_name).toEqual('Blitz (5 + 3)');
		expect(g.when).toEqual('2024-12-29..12:24:00');
	});
});
