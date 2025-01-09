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
import { Graph } from '../../../src-server/models/graph/graph';

describe('Simple construction and query', () => {
	test('', () => {
		let g = new Graph();

		g.add_edge('A', 'B', 'white_wins');
		expect(g.get_data('A', 'B')).toEqual(new EdgeMetadata(1, 0, 0));
		expect(g.get_degree('A')).toBe(1);
		expect(g.get_oponents('A')).toEqual(['B']);

		g.add_edge('A', 'B', 'white_wins');
		expect(g.get_data('A', 'B')).toEqual(new EdgeMetadata(2, 0, 0));
		expect(g.get_degree('A')).toBe(1);
		expect(g.get_oponents('A')).toEqual(['B']);

		g.add_edge('A', 'B', 'white_wins');
		expect(g.get_data('A', 'B')).toEqual(new EdgeMetadata(3, 0, 0));
		expect(g.get_degree('A')).toBe(1);
		expect(g.get_oponents('A')).toEqual(['B']);
	});

	test('', () => {
		let g = new Graph();

		g.add_edge('A', 'B', 'white_wins');
		expect(g.get_data('A', 'B')).toEqual(new EdgeMetadata(1, 0, 0));
		expect(g.get_degree('A')).toBe(1);
		expect(g.get_oponents('A')).toEqual(['B']);

		g.add_edge('A', 'B', 'black_wins');
		expect(g.get_data('A', 'B')).toEqual(new EdgeMetadata(1, 0, 1));
		expect(g.get_degree('A')).toBe(1);
		expect(g.get_oponents('A')).toEqual(['B']);

		g.add_edge('A', 'B', 'draw');
		expect(g.get_data('A', 'B')).toEqual(new EdgeMetadata(1, 1, 1));
		expect(g.get_degree('A')).toBe(1);
		expect(g.get_oponents('A')).toEqual(['B']);
	});

	test('', () => {
		let g = new Graph();

		g.add_edge('A', 'B', 'white_wins');
		expect(g.get_data('A', 'B')).toEqual(new EdgeMetadata(1, 0, 0));
		expect(g.get_degree('A')).toBe(1);
		expect(g.get_oponents('A')).toEqual(['B']);

		g.add_edge('A', 'C', 'black_wins');
		expect(g.get_data('A', 'C')).toEqual(new EdgeMetadata(0, 0, 1));
		expect(g.get_degree('A')).toBe(2);
		expect(g.get_oponents('A')).toEqual(['B', 'C']);

		g.add_edge('A', 'B', 'white_wins');
		expect(g.get_data('A', 'B')).toEqual(new EdgeMetadata(2, 0, 0));
		expect(g.get_degree('A')).toBe(2);
		expect(g.get_oponents('A')).toEqual(['B', 'C']);

		g.add_edge('A', 'Z', 'draw');
		expect(g.get_data('A', 'Z')).toEqual(new EdgeMetadata(0, 1, 0));
		expect(g.get_degree('A')).toBe(3);
		expect(g.get_oponents('A')).toEqual(['B', 'C', 'Z']);

		g.add_edge('A', 'K', 'black_wins');
		expect(g.get_data('A', 'K')).toEqual(new EdgeMetadata(0, 0, 1));
		expect(g.get_degree('A')).toBe(4);
		expect(g.get_oponents('A')).toEqual(['B', 'C', 'K', 'Z']);
	});
});
