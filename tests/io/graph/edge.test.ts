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

import { EdgeMetadata } from '../../../src-server/models/graph/edge_metadata';
import { Edge } from '../../../src-server/models/graph/edge';

import { edge_from_json } from '../../../src-server/io/graph/edge';

describe('From JSON', () => {
	test('string', () => {
		expect(
			edge_from_json(
				'{"neighbor": "A", "metadata": {"num_games_won": 1, "num_games_drawn": 0, "num_games_lost": 300}}'
			)
		).toEqual(new Edge('A', new EdgeMetadata(1, 0, 300)));
	});

	test('JSON', () => {
		expect(
			edge_from_json({ neighbor: 'A', metadata: { num_games_won: 1, num_games_drawn: 0, num_games_lost: 300 } })
		).toEqual(new Edge('A', new EdgeMetadata(1, 0, 300)));
	});
});
