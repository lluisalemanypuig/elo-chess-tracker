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

import fs from 'fs';

import { EdgeMetadata } from '../../../src-server/models/graph/edge_metadata';
import { Graph } from '../../../src-server/models/graph/graph';

import { graph_from_json, graph_full_to_file } from '../../../src-server/io/graph/graph';

describe('Write to and read from disk', () => {
	test('2 users -- write', () => {
		let g = new Graph();

		g.add_edge('A', 'B', 'white_wins');
		g.add_edge('B', 'A', 'white_wins');
		g.add_edge('A', 'B', 'draw');
		g.add_edge('B', 'A', 'draw');

		if (fs.existsSync('graph_test/')) {
			fs.rmdirSync('graph_test/', { recursive: true });
		}
		fs.mkdirSync('graph_test/');
		graph_full_to_file('graph_test/', g);
	});

	test('2 users -- read', () => {
		expect(fs.readdirSync('graph_test').length).toBe(2);

		const g = graph_from_json('graph_test/');

		expect(g.get_data_as_white('A', 'B')).toEqual(new EdgeMetadata(1, 1, 0));
		expect(g.get_data_as_black('A', 'B')).toEqual(new EdgeMetadata(0, 1, 1));
		expect(g.get_out_degree('A')).toBe(1);
		expect(g.get_in_degree('A')).toBe(1);
		expect(g.get_black_opponents('A')).toEqual(['B']);
		expect(g.get_white_opponents('A')).toEqual(['B']);
		expect(g.get_data_as_white('B', 'A')).toEqual(new EdgeMetadata(1, 1, 0));
		expect(g.get_data_as_black('B', 'A')).toEqual(new EdgeMetadata(0, 1, 1));
		expect(g.get_out_degree('B')).toBe(1);
		expect(g.get_in_degree('B')).toBe(1);
		expect(g.get_black_opponents('B')).toEqual(['A']);
		expect(g.get_white_opponents('B')).toEqual(['A']);
	});

	test('3 users -- write', () => {
		let g = new Graph();

		g.add_edge('A', 'B', 'white_wins');
		g.add_edge('A', 'C', 'black_wins');
		g.add_edge('B', 'C', 'draw');
		g.add_edge('C', 'B', 'white_wins');
		g.add_edge('C', 'A', 'white_wins');
		g.add_edge('C', 'B', 'black_wins');

		if (fs.existsSync('graph_test/')) {
			fs.rmdirSync('graph_test/', { recursive: true });
		}
		fs.mkdirSync('graph_test/');
		graph_full_to_file('graph_test/', g);
	});

	test('3 users -- read', () => {
		expect(fs.readdirSync('graph_test').length).toBe(3);
		const g = graph_from_json('graph_test/');

		expect(g.get_data_as_white('A', 'B')).toEqual(new EdgeMetadata(1, 0, 0));
		expect(g.get_data_as_black('A', 'B')).toEqual(undefined);
		expect(g.get_data_as_white('A', 'C')).toEqual(new EdgeMetadata(0, 0, 1));
		expect(g.get_data_as_black('A', 'C')).toEqual(new EdgeMetadata(0, 0, 1));
		expect(g.get_out_degree('A')).toBe(2);
		expect(g.get_in_degree('A')).toBe(1);
		expect(g.get_black_opponents('A')).toEqual(['B', 'C']);
		expect(g.get_white_opponents('A')).toEqual(['C']);

		expect(g.get_data_as_white('B', 'A')).toEqual(undefined);
		expect(g.get_data_as_black('B', 'A')).toEqual(new EdgeMetadata(0, 0, 1));
		expect(g.get_data_as_white('B', 'C')).toEqual(new EdgeMetadata(0, 1, 0));
		expect(g.get_data_as_black('B', 'C')).toEqual(new EdgeMetadata(1, 0, 1));
		expect(g.get_out_degree('B')).toBe(1);
		expect(g.get_in_degree('B')).toBe(2);
		expect(g.get_black_opponents('B')).toEqual(['C']);
		expect(g.get_white_opponents('B')).toEqual(['A', 'C']);

		expect(g.get_data_as_white('C', 'A')).toEqual(new EdgeMetadata(1, 0, 0));
		expect(g.get_data_as_black('C', 'A')).toEqual(new EdgeMetadata(1, 0, 0));
		expect(g.get_data_as_white('C', 'B')).toEqual(new EdgeMetadata(1, 0, 1));
		expect(g.get_data_as_black('C', 'B')).toEqual(new EdgeMetadata(0, 1, 0));
		expect(g.get_out_degree('C')).toBe(2);
		expect(g.get_in_degree('C')).toBe(2);
		expect(g.get_black_opponents('C')).toEqual(['A', 'B']);
		expect(g.get_white_opponents('C')).toEqual(['A', 'B']);
	});
});
