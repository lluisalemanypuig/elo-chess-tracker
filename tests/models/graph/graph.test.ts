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

import fs from 'fs';

import { EdgeMetadata } from '../../../src-server/models/graph/edge_metadata';
import { Graph, graph_from_json, graph_full_to_file } from '../../../src-server/models/graph/graph';

describe('Simple construction and query', () => {
	test('1', () => {
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

	test('2', () => {
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

	test('3', () => {
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

describe('Edge update', () => {
	test('1', () => {
		let g = new Graph();

		g.add_edge('A', 'B', 'white_wins');
		expect(g.get_data('A', 'B')).toEqual(new EdgeMetadata(1, 0, 0));
		expect(g.get_degree('A')).toBe(1);
		expect(g.get_oponents('A')).toEqual(['B']);

		g.change_game_result('A', 'B', 'white_wins', 'draw');
		expect(g.get_data('A', 'B')).toEqual(new EdgeMetadata(0, 1, 0));
		expect(g.get_degree('A')).toBe(1);
		expect(g.get_oponents('A')).toEqual(['B']);

		g.change_game_result('A', 'B', 'draw', 'black_wins');
		expect(g.get_data('A', 'B')).toEqual(new EdgeMetadata(0, 0, 1));
		expect(g.get_degree('A')).toBe(1);
		expect(g.get_oponents('A')).toEqual(['B']);

		g.change_game_result('A', 'B', 'black_wins', 'draw');
		expect(g.get_data('A', 'B')).toEqual(new EdgeMetadata(0, 1, 0));
		expect(g.get_degree('A')).toBe(1);
		expect(g.get_oponents('A')).toEqual(['B']);

		g.add_edge('C', 'A', 'white_wins');
		g.add_edge('C', 'B', 'black_wins');
		expect(g.get_data('C', 'A')).toEqual(new EdgeMetadata(1, 0, 0));
		expect(g.get_data('C', 'B')).toEqual(new EdgeMetadata(0, 0, 1));
		expect(g.get_degree('C')).toBe(2);
		expect(g.get_oponents('C')).toEqual(['A', 'B']);

		g.change_game_result('C', 'A', 'white_wins', 'draw');
		expect(g.get_data('C', 'A')).toEqual(new EdgeMetadata(0, 1, 0));
		expect(g.get_data('C', 'B')).toEqual(new EdgeMetadata(0, 0, 1));
		g.change_game_result('C', 'B', 'black_wins', 'draw');
		expect(g.get_data('C', 'A')).toEqual(new EdgeMetadata(0, 1, 0));
		expect(g.get_data('C', 'B')).toEqual(new EdgeMetadata(0, 1, 0));
	});
});

describe('Write to and read from disk', () => {
	test('2 users -- write', () => {
		let g = new Graph();

		g.add_edge('A', 'B', 'white_wins');
		expect(g.get_data('A', 'B')).toEqual(new EdgeMetadata(1, 0, 0));
		expect(g.get_degree('A')).toBe(1);
		expect(g.get_oponents('A')).toEqual(['B']);

		g.add_edge('B', 'A', 'white_wins');
		expect(g.get_data('B', 'A')).toEqual(new EdgeMetadata(1, 0, 0));
		expect(g.get_degree('B')).toBe(1);
		expect(g.get_oponents('B')).toEqual(['A']);

		g.add_edge('A', 'B', 'draw');
		expect(g.get_data('A', 'B')).toEqual(new EdgeMetadata(1, 1, 0));
		expect(g.get_degree('A')).toBe(1);
		expect(g.get_oponents('A')).toEqual(['B']);

		g.add_edge('B', 'A', 'draw');
		expect(g.get_data('B', 'A')).toEqual(new EdgeMetadata(1, 1, 0));
		expect(g.get_degree('B')).toBe(1);
		expect(g.get_oponents('B')).toEqual(['A']);

		if (fs.existsSync('graph_test/')) {
			fs.rmdirSync('graph_test/', { recursive: true });
		}
		fs.mkdirSync('graph_test/');
		graph_full_to_file('graph_test/', g);
	});

	test('2 users -- read', () => {
		expect(fs.readdirSync('graph_test').length).toBe(2);

		const g = graph_from_json('graph_test/');
		expect(g.get_data('A', 'B')).toEqual(new EdgeMetadata(1, 1, 0));
		expect(g.get_degree('A')).toBe(1);
		expect(g.get_oponents('A')).toEqual(['B']);

		expect(g.get_data('B', 'A')).toEqual(new EdgeMetadata(1, 1, 0));
		expect(g.get_degree('B')).toBe(1);
		expect(g.get_oponents('B')).toEqual(['A']);
	});

	test('3 users -- write', () => {
		let g = new Graph();

		g.add_edge('A', 'B', 'white_wins');
		expect(g.get_data('A', 'B')).toEqual(new EdgeMetadata(1, 0, 0));
		expect(g.get_degree('A')).toBe(1);
		expect(g.get_oponents('A')).toEqual(['B']);

		g.add_edge('A', 'C', 'black_wins');
		expect(g.get_data('A', 'C')).toEqual(new EdgeMetadata(0, 0, 1));
		expect(g.get_degree('A')).toBe(2);
		expect(g.get_oponents('A')).toEqual(['B', 'C']);

		g.add_edge('B', 'C', 'draw');
		expect(g.get_data('B', 'C')).toEqual(new EdgeMetadata(0, 1, 0));
		expect(g.get_degree('B')).toBe(1);
		expect(g.get_oponents('B')).toEqual(['C']);

		g.add_edge('C', 'B', 'white_wins');
		expect(g.get_data('C', 'B')).toEqual(new EdgeMetadata(1, 0, 0));
		expect(g.get_degree('C')).toBe(1);
		expect(g.get_oponents('C')).toEqual(['B']);

		g.add_edge('C', 'A', 'white_wins');
		expect(g.get_data('C', 'A')).toEqual(new EdgeMetadata(1, 0, 0));
		expect(g.get_degree('C')).toBe(2);
		expect(g.get_oponents('C')).toEqual(['A', 'B']);

		g.add_edge('C', 'B', 'black_wins');
		expect(g.get_data('C', 'B')).toEqual(new EdgeMetadata(1, 0, 1));
		expect(g.get_degree('C')).toBe(2);
		expect(g.get_oponents('C')).toEqual(['A', 'B']);

		if (fs.existsSync('graph_test/')) {
			fs.rmdirSync('graph_test/', { recursive: true });
		}
		fs.mkdirSync('graph_test/');
		graph_full_to_file('graph_test/', g);
	});

	test('3 users -- read', () => {
		expect(fs.readdirSync('graph_test').length).toBe(3);
		const g = graph_from_json('graph_test/');

		expect(g.get_data('A', 'B')).toEqual(new EdgeMetadata(1, 0, 0));
		expect(g.get_data('A', 'C')).toEqual(new EdgeMetadata(0, 0, 1));
		expect(g.get_degree('A')).toBe(2);
		expect(g.get_oponents('A')).toEqual(['B', 'C']);

		expect(g.get_data('B', 'A')).toBe(undefined);
		expect(g.get_data('B', 'C')).toEqual(new EdgeMetadata(0, 1, 0));
		expect(g.get_degree('B')).toBe(1);
		expect(g.get_oponents('B')).toEqual(['C']);

		expect(g.get_data('C', 'A')).toEqual(new EdgeMetadata(1, 0, 0));
		expect(g.get_data('C', 'B')).toEqual(new EdgeMetadata(1, 0, 1));
		expect(g.get_degree('C')).toBe(2);
		expect(g.get_oponents('C')).toEqual(['A', 'B']);
	});
});
