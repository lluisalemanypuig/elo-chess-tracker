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

import { EdgeMetadata } from '../../../ts-server/models/graph/edge_metadata';
import { edge_from_json, Edge } from '../../../ts-server/models/graph/edge';

describe('Edge :: From JSON', () => {
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

describe('Merge edges', () => {
	test('1', () => {
		let e1 = new Edge('a', new EdgeMetadata(1, 0, 10));
		let e2 = new Edge('a', new EdgeMetadata(0, 0, 0));
		e1.merge(e2);

		expect(e1.neighbor).toBe('a');
		expect(e1.metadata?.num_games_won).toBe(1);
		expect(e1.metadata?.num_games_drawn).toBe(0);
		expect(e1.metadata?.num_games_lost).toBe(10);
	});

	test('2', () => {
		let e1 = new Edge('b', new EdgeMetadata(1, 0, 10));
		let e2 = new Edge('b', new EdgeMetadata(0, 3, 0));
		e1.merge(e2);

		expect(e1.neighbor).toBe('b');
		expect(e1.metadata?.num_games_won).toBe(1);
		expect(e1.metadata?.num_games_drawn).toBe(3);
		expect(e1.metadata?.num_games_lost).toBe(10);
	});

	test('3', () => {
		let e1 = new Edge('c', new EdgeMetadata(1, 0, 10));
		let e2 = new Edge('c', new EdgeMetadata(0, 3, 0));
		e1.merge(e2);

		let e3 = new Edge('c', new EdgeMetadata(50, 3, 0));
		e1.merge(e3);

		expect(e1.neighbor).toBe('c');
		expect(e1.metadata?.num_games_won).toBe(51);
		expect(e1.metadata?.num_games_drawn).toBe(6);
		expect(e1.metadata?.num_games_lost).toBe(10);
	});
});
