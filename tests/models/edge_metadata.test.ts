/*
Elo rating for a Chess Club
Copyright (C) 2023  Lluís Alemany Puig

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

import { edge_metadata_from_json, EdgeMetadata } from '../../ts-server/models/graph/edge_metadata';

describe('EdgeMetadata :: From JSON', () => {
	test('string', () => {
		expect(edge_metadata_from_json('{"num_games_won": 1, "num_games_drawn": 0, "num_games_lost": 300}')).toEqual(
			new EdgeMetadata(1, 0, 300)
		);
	});

	test('JSON', () => {
		expect(edge_metadata_from_json({ num_games_won: 1, num_games_drawn: 0, num_games_lost: 300 })).toEqual(
			new EdgeMetadata(1, 0, 300)
		);
	});
});

describe('Static initialization', () => {
	test('Empty', () => {
		expect(EdgeMetadata.empty()).toEqual(new EdgeMetadata(0, 0, 0));
	});

	test('From result', () => {
		expect(EdgeMetadata.from_result('white_wins')).toEqual(new EdgeMetadata(1, 0, 0));
		expect(EdgeMetadata.from_result('draw')).toEqual(new EdgeMetadata(0, 1, 0));
		expect(EdgeMetadata.from_result('black_wins')).toEqual(new EdgeMetadata(0, 0, 1));
	});
});
