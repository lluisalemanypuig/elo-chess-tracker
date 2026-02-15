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

import { EdgeMetadata } from '../../../src-server/models/graph/edge_metadata';
import { Graph } from '../../../src-server/models/graph/graph';

describe('Simple construction and query', () => {
	test('1', () => {
		let g = new Graph();

		g.add_edge('A', 'B', 'white_wins');
		{
			expect(g.get_data_as_white('A', 'B')).toEqual(new EdgeMetadata(1, 0, 0));
			expect(g.get_data_as_black('A', 'B')).toEqual(undefined);
			expect(g.get_out_degree('A')).toBe(1);
			expect(g.get_in_degree('A')).toBe(0);
			expect(g.get_black_opponents('A')).toEqual(['B']);
			expect(g.get_white_opponents('A')).toEqual([]);
			expect(g.get_data_as_white('B', 'A')).toEqual(undefined);
			expect(g.get_data_as_black('B', 'A')).toEqual(new EdgeMetadata(0, 0, 1));
			expect(g.get_out_degree('B')).toBe(0);
			expect(g.get_in_degree('B')).toBe(1);
			expect(g.get_black_opponents('B')).toEqual([]);
			expect(g.get_white_opponents('B')).toEqual(['A']);
		}

		g.add_edge('A', 'B', 'white_wins');
		{
			expect(g.get_data_as_white('A', 'B')).toEqual(new EdgeMetadata(2, 0, 0));
			expect(g.get_data_as_black('A', 'B')).toEqual(undefined);
			expect(g.get_out_degree('A')).toBe(1);
			expect(g.get_in_degree('A')).toBe(0);
			expect(g.get_black_opponents('A')).toEqual(['B']);
			expect(g.get_white_opponents('A')).toEqual([]);
			expect(g.get_data_as_white('B', 'A')).toEqual(undefined);
			expect(g.get_data_as_black('B', 'A')).toEqual(new EdgeMetadata(0, 0, 2));
			expect(g.get_out_degree('B')).toBe(0);
			expect(g.get_in_degree('B')).toBe(1);
			expect(g.get_black_opponents('B')).toEqual([]);
			expect(g.get_white_opponents('B')).toEqual(['A']);
		}

		g.add_edge('A', 'B', 'white_wins');
		{
			expect(g.get_data_as_white('A', 'B')).toEqual(new EdgeMetadata(3, 0, 0));
			expect(g.get_data_as_black('A', 'B')).toEqual(undefined);
			expect(g.get_out_degree('A')).toBe(1);
			expect(g.get_in_degree('A')).toBe(0);
			expect(g.get_black_opponents('A')).toEqual(['B']);
			expect(g.get_white_opponents('A')).toEqual([]);
			expect(g.get_data_as_white('B', 'A')).toEqual(undefined);
			expect(g.get_data_as_black('B', 'A')).toEqual(new EdgeMetadata(0, 0, 3));
			expect(g.get_out_degree('B')).toBe(0);
			expect(g.get_in_degree('B')).toBe(1);
			expect(g.get_black_opponents('B')).toEqual([]);
			expect(g.get_white_opponents('B')).toEqual(['A']);
		}
	});

	test('2', () => {
		let g = new Graph();

		g.add_edge('A', 'B', 'white_wins');
		{
			expect(g.get_data_as_white('A', 'B')).toEqual(new EdgeMetadata(1, 0, 0));
			expect(g.get_data_as_black('A', 'B')).toEqual(undefined);
			expect(g.get_out_degree('A')).toBe(1);
			expect(g.get_in_degree('A')).toBe(0);
			expect(g.get_black_opponents('A')).toEqual(['B']);
			expect(g.get_white_opponents('A')).toEqual([]);
			expect(g.get_data_as_white('B', 'A')).toEqual(undefined);
			expect(g.get_data_as_black('B', 'A')).toEqual(new EdgeMetadata(0, 0, 1));
			expect(g.get_out_degree('B')).toBe(0);
			expect(g.get_in_degree('B')).toBe(1);
			expect(g.get_black_opponents('B')).toEqual([]);
			expect(g.get_white_opponents('B')).toEqual(['A']);
		}

		g.add_edge('A', 'B', 'black_wins');
		{
			expect(g.get_data_as_white('A', 'B')).toEqual(new EdgeMetadata(1, 0, 1));
			expect(g.get_data_as_black('A', 'B')).toEqual(undefined);
			expect(g.get_out_degree('A')).toBe(1);
			expect(g.get_in_degree('A')).toBe(0);
			expect(g.get_black_opponents('A')).toEqual(['B']);
			expect(g.get_white_opponents('A')).toEqual([]);
			expect(g.get_data_as_white('B', 'A')).toEqual(undefined);
			expect(g.get_data_as_black('B', 'A')).toEqual(new EdgeMetadata(1, 0, 1));
			expect(g.get_out_degree('B')).toBe(0);
			expect(g.get_in_degree('B')).toBe(1);
			expect(g.get_black_opponents('B')).toEqual([]);
			expect(g.get_white_opponents('B')).toEqual(['A']);
		}

		g.add_edge('A', 'B', 'draw');
		{
			expect(g.get_data_as_white('A', 'B')).toEqual(new EdgeMetadata(1, 1, 1));
			expect(g.get_data_as_black('A', 'B')).toEqual(undefined);
			expect(g.get_out_degree('A')).toBe(1);
			expect(g.get_in_degree('A')).toBe(0);
			expect(g.get_black_opponents('A')).toEqual(['B']);
			expect(g.get_white_opponents('A')).toEqual([]);
			expect(g.get_data_as_white('B', 'A')).toEqual(undefined);
			expect(g.get_data_as_black('B', 'A')).toEqual(new EdgeMetadata(1, 1, 1));
			expect(g.get_out_degree('B')).toBe(0);
			expect(g.get_in_degree('B')).toBe(1);
			expect(g.get_black_opponents('B')).toEqual([]);
			expect(g.get_white_opponents('B')).toEqual(['A']);
		}
	});

	test('3', () => {
		let g = new Graph();

		g.add_edge('A', 'B', 'white_wins');
		{
			expect(g.get_data_as_white('A', 'B')).toEqual(new EdgeMetadata(1, 0, 0));
			expect(g.get_data_as_black('A', 'B')).toEqual(undefined);
			expect(g.get_out_degree('A')).toBe(1);
			expect(g.get_in_degree('A')).toBe(0);
			expect(g.get_black_opponents('A')).toEqual(['B']);
			expect(g.get_white_opponents('A')).toEqual([]);
			expect(g.get_data_as_white('B', 'A')).toEqual(undefined);
			expect(g.get_data_as_black('B', 'A')).toEqual(new EdgeMetadata(0, 0, 1));
			expect(g.get_out_degree('B')).toBe(0);
			expect(g.get_in_degree('B')).toBe(1);
			expect(g.get_black_opponents('B')).toEqual([]);
			expect(g.get_white_opponents('B')).toEqual(['A']);
		}

		g.add_edge('B', 'A', 'black_wins');
		{
			expect(g.get_data_as_white('A', 'B')).toEqual(new EdgeMetadata(1, 0, 0));
			expect(g.get_data_as_black('A', 'B')).toEqual(new EdgeMetadata(1, 0, 0));
			expect(g.get_out_degree('A')).toBe(1);
			expect(g.get_in_degree('A')).toBe(1);
			expect(g.get_black_opponents('A')).toEqual(['B']);
			expect(g.get_white_opponents('A')).toEqual(['B']);
			expect(g.get_data_as_white('B', 'A')).toEqual(new EdgeMetadata(0, 0, 1));
			expect(g.get_data_as_black('B', 'A')).toEqual(new EdgeMetadata(0, 0, 1));
			expect(g.get_out_degree('B')).toBe(1);
			expect(g.get_in_degree('B')).toBe(1);
			expect(g.get_black_opponents('B')).toEqual(['A']);
			expect(g.get_white_opponents('B')).toEqual(['A']);
		}

		g.add_edge('A', 'B', 'draw');
		{
			expect(g.get_data_as_white('A', 'B')).toEqual(new EdgeMetadata(1, 1, 0));
			expect(g.get_data_as_black('A', 'B')).toEqual(new EdgeMetadata(1, 0, 0));
			expect(g.get_out_degree('A')).toBe(1);
			expect(g.get_in_degree('A')).toBe(1);
			expect(g.get_black_opponents('A')).toEqual(['B']);
			expect(g.get_white_opponents('A')).toEqual(['B']);
			expect(g.get_data_as_white('B', 'A')).toEqual(new EdgeMetadata(0, 0, 1));
			expect(g.get_data_as_black('B', 'A')).toEqual(new EdgeMetadata(0, 1, 1));
			expect(g.get_out_degree('B')).toBe(1);
			expect(g.get_in_degree('B')).toBe(1);
			expect(g.get_black_opponents('B')).toEqual(['A']);
			expect(g.get_white_opponents('B')).toEqual(['A']);
		}
	});

	test('4', () => {
		let g = new Graph();

		g.add_edge('A', 'B', 'white_wins');
		{
			expect(g.get_data_as_white('A', 'B')).toEqual(new EdgeMetadata(1, 0, 0));
			expect(g.get_data_as_black('A', 'B')).toEqual(undefined);
			expect(g.get_data_as_white('A', 'C')).toEqual(undefined);
			expect(g.get_data_as_black('A', 'C')).toEqual(undefined);
			expect(g.get_data_as_white('A', 'K')).toEqual(undefined);
			expect(g.get_data_as_black('A', 'K')).toEqual(undefined);
			expect(g.get_data_as_white('A', 'Z')).toEqual(undefined);
			expect(g.get_data_as_black('A', 'Z')).toEqual(undefined);
			expect(g.get_out_degree('A')).toBe(1);
			expect(g.get_in_degree('A')).toBe(0);
			expect(g.get_black_opponents('A')).toEqual(['B']);
			expect(g.get_white_opponents('A')).toEqual([]);
			expect(g.get_data_as_white('B', 'A')).toEqual(undefined);
			expect(g.get_data_as_black('B', 'A')).toEqual(new EdgeMetadata(0, 0, 1));
			expect(g.get_data_as_white('B', 'C')).toEqual(undefined);
			expect(g.get_data_as_black('B', 'C')).toEqual(undefined);
			expect(g.get_data_as_white('B', 'K')).toEqual(undefined);
			expect(g.get_data_as_black('B', 'K')).toEqual(undefined);
			expect(g.get_data_as_white('B', 'Z')).toEqual(undefined);
			expect(g.get_data_as_black('B', 'Z')).toEqual(undefined);
			expect(g.get_out_degree('B')).toBe(0);
			expect(g.get_in_degree('B')).toBe(1);
			expect(g.get_black_opponents('B')).toEqual([]);
			expect(g.get_white_opponents('B')).toEqual(['A']);
			expect(g.get_data_as_white('C', 'A')).toEqual(undefined);
			expect(g.get_data_as_black('C', 'A')).toEqual(undefined);
			expect(g.get_data_as_white('C', 'B')).toEqual(undefined);
			expect(g.get_data_as_black('C', 'B')).toEqual(undefined);
			expect(g.get_data_as_white('C', 'K')).toEqual(undefined);
			expect(g.get_data_as_black('C', 'K')).toEqual(undefined);
			expect(g.get_data_as_white('C', 'Z')).toEqual(undefined);
			expect(g.get_data_as_black('C', 'Z')).toEqual(undefined);
			expect(g.get_out_degree('C')).toBe(0);
			expect(g.get_in_degree('C')).toBe(0);
			expect(g.get_black_opponents('C')).toEqual([]);
			expect(g.get_white_opponents('C')).toEqual([]);
			expect(g.get_data_as_white('K', 'A')).toEqual(undefined);
			expect(g.get_data_as_black('K', 'A')).toEqual(undefined);
			expect(g.get_data_as_white('K', 'B')).toEqual(undefined);
			expect(g.get_data_as_black('K', 'B')).toEqual(undefined);
			expect(g.get_data_as_white('K', 'C')).toEqual(undefined);
			expect(g.get_data_as_black('K', 'C')).toEqual(undefined);
			expect(g.get_data_as_white('K', 'Z')).toEqual(undefined);
			expect(g.get_data_as_black('K', 'Z')).toEqual(undefined);
			expect(g.get_out_degree('K')).toBe(0);
			expect(g.get_in_degree('K')).toBe(0);
			expect(g.get_black_opponents('K')).toEqual([]);
			expect(g.get_white_opponents('K')).toEqual([]);
			expect(g.get_data_as_white('Z', 'A')).toEqual(undefined);
			expect(g.get_data_as_black('Z', 'A')).toEqual(undefined);
			expect(g.get_data_as_white('Z', 'B')).toEqual(undefined);
			expect(g.get_data_as_black('Z', 'B')).toEqual(undefined);
			expect(g.get_data_as_white('Z', 'C')).toEqual(undefined);
			expect(g.get_data_as_black('Z', 'C')).toEqual(undefined);
			expect(g.get_data_as_white('Z', 'K')).toEqual(undefined);
			expect(g.get_data_as_black('Z', 'K')).toEqual(undefined);
			expect(g.get_out_degree('Z')).toBe(0);
			expect(g.get_in_degree('Z')).toBe(0);
			expect(g.get_black_opponents('Z')).toEqual([]);
			expect(g.get_white_opponents('Z')).toEqual([]);
		}

		g.add_edge('A', 'C', 'black_wins');
		{
			expect(g.get_data_as_white('A', 'B')).toEqual(new EdgeMetadata(1, 0, 0));
			expect(g.get_data_as_black('A', 'B')).toEqual(undefined);
			expect(g.get_data_as_white('A', 'C')).toEqual(new EdgeMetadata(0, 0, 1));
			expect(g.get_data_as_black('A', 'C')).toEqual(undefined);
			expect(g.get_data_as_white('A', 'K')).toEqual(undefined);
			expect(g.get_data_as_black('A', 'K')).toEqual(undefined);
			expect(g.get_data_as_white('A', 'Z')).toEqual(undefined);
			expect(g.get_data_as_black('A', 'Z')).toEqual(undefined);
			expect(g.get_out_degree('A')).toBe(2);
			expect(g.get_in_degree('A')).toBe(0);
			expect(g.get_black_opponents('A')).toEqual(['B', 'C']);
			expect(g.get_white_opponents('A')).toEqual([]);
			expect(g.get_data_as_white('B', 'A')).toEqual(undefined);
			expect(g.get_data_as_black('B', 'A')).toEqual(new EdgeMetadata(0, 0, 1));
			expect(g.get_data_as_white('B', 'C')).toEqual(undefined);
			expect(g.get_data_as_black('B', 'C')).toEqual(undefined);
			expect(g.get_data_as_white('B', 'K')).toEqual(undefined);
			expect(g.get_data_as_black('B', 'K')).toEqual(undefined);
			expect(g.get_data_as_white('B', 'Z')).toEqual(undefined);
			expect(g.get_data_as_black('B', 'Z')).toEqual(undefined);
			expect(g.get_out_degree('B')).toBe(0);
			expect(g.get_in_degree('B')).toBe(1);
			expect(g.get_black_opponents('B')).toEqual([]);
			expect(g.get_white_opponents('B')).toEqual(['A']);
			expect(g.get_data_as_white('C', 'A')).toEqual(undefined);
			expect(g.get_data_as_black('C', 'A')).toEqual(new EdgeMetadata(1, 0, 0));
			expect(g.get_data_as_white('C', 'B')).toEqual(undefined);
			expect(g.get_data_as_black('C', 'B')).toEqual(undefined);
			expect(g.get_data_as_white('C', 'K')).toEqual(undefined);
			expect(g.get_data_as_black('C', 'K')).toEqual(undefined);
			expect(g.get_data_as_white('C', 'Z')).toEqual(undefined);
			expect(g.get_data_as_black('C', 'Z')).toEqual(undefined);
			expect(g.get_out_degree('C')).toBe(0);
			expect(g.get_in_degree('C')).toBe(1);
			expect(g.get_black_opponents('C')).toEqual([]);
			expect(g.get_white_opponents('C')).toEqual(['A']);
			expect(g.get_data_as_white('K', 'A')).toEqual(undefined);
			expect(g.get_data_as_black('K', 'A')).toEqual(undefined);
			expect(g.get_data_as_white('K', 'B')).toEqual(undefined);
			expect(g.get_data_as_black('K', 'B')).toEqual(undefined);
			expect(g.get_data_as_white('K', 'C')).toEqual(undefined);
			expect(g.get_data_as_black('K', 'C')).toEqual(undefined);
			expect(g.get_data_as_white('K', 'Z')).toEqual(undefined);
			expect(g.get_data_as_black('K', 'Z')).toEqual(undefined);
			expect(g.get_out_degree('K')).toBe(0);
			expect(g.get_in_degree('K')).toBe(0);
			expect(g.get_black_opponents('K')).toEqual([]);
			expect(g.get_white_opponents('K')).toEqual([]);
			expect(g.get_data_as_white('Z', 'A')).toEqual(undefined);
			expect(g.get_data_as_black('Z', 'A')).toEqual(undefined);
			expect(g.get_data_as_white('Z', 'B')).toEqual(undefined);
			expect(g.get_data_as_black('Z', 'B')).toEqual(undefined);
			expect(g.get_data_as_white('Z', 'C')).toEqual(undefined);
			expect(g.get_data_as_black('Z', 'C')).toEqual(undefined);
			expect(g.get_data_as_white('Z', 'K')).toEqual(undefined);
			expect(g.get_data_as_black('Z', 'K')).toEqual(undefined);
			expect(g.get_out_degree('Z')).toBe(0);
			expect(g.get_in_degree('Z')).toBe(0);
			expect(g.get_black_opponents('Z')).toEqual([]);
			expect(g.get_white_opponents('Z')).toEqual([]);
		}

		g.add_edge('A', 'B', 'white_wins');
		{
			expect(g.get_data_as_white('A', 'B')).toEqual(new EdgeMetadata(2, 0, 0));
			expect(g.get_data_as_black('A', 'B')).toEqual(undefined);
			expect(g.get_data_as_white('A', 'C')).toEqual(new EdgeMetadata(0, 0, 1));
			expect(g.get_data_as_black('A', 'C')).toEqual(undefined);
			expect(g.get_data_as_white('A', 'K')).toEqual(undefined);
			expect(g.get_data_as_black('A', 'K')).toEqual(undefined);
			expect(g.get_data_as_white('A', 'Z')).toEqual(undefined);
			expect(g.get_data_as_black('A', 'Z')).toEqual(undefined);
			expect(g.get_out_degree('A')).toBe(2);
			expect(g.get_in_degree('A')).toBe(0);
			expect(g.get_black_opponents('A')).toEqual(['B', 'C']);
			expect(g.get_white_opponents('A')).toEqual([]);
			expect(g.get_data_as_white('B', 'A')).toEqual(undefined);
			expect(g.get_data_as_black('B', 'A')).toEqual(new EdgeMetadata(0, 0, 2));
			expect(g.get_data_as_white('B', 'C')).toEqual(undefined);
			expect(g.get_data_as_black('B', 'C')).toEqual(undefined);
			expect(g.get_data_as_white('B', 'K')).toEqual(undefined);
			expect(g.get_data_as_black('B', 'K')).toEqual(undefined);
			expect(g.get_data_as_white('B', 'Z')).toEqual(undefined);
			expect(g.get_data_as_black('B', 'Z')).toEqual(undefined);
			expect(g.get_out_degree('B')).toBe(0);
			expect(g.get_in_degree('B')).toBe(1);
			expect(g.get_black_opponents('B')).toEqual([]);
			expect(g.get_white_opponents('B')).toEqual(['A']);
			expect(g.get_data_as_white('C', 'A')).toEqual(undefined);
			expect(g.get_data_as_black('C', 'A')).toEqual(new EdgeMetadata(1, 0, 0));
			expect(g.get_data_as_white('C', 'B')).toEqual(undefined);
			expect(g.get_data_as_black('C', 'B')).toEqual(undefined);
			expect(g.get_data_as_white('C', 'K')).toEqual(undefined);
			expect(g.get_data_as_black('C', 'K')).toEqual(undefined);
			expect(g.get_data_as_white('C', 'Z')).toEqual(undefined);
			expect(g.get_data_as_black('C', 'Z')).toEqual(undefined);
			expect(g.get_out_degree('C')).toBe(0);
			expect(g.get_in_degree('C')).toBe(1);
			expect(g.get_black_opponents('C')).toEqual([]);
			expect(g.get_white_opponents('C')).toEqual(['A']);
			expect(g.get_data_as_white('K', 'A')).toEqual(undefined);
			expect(g.get_data_as_black('K', 'A')).toEqual(undefined);
			expect(g.get_data_as_white('K', 'B')).toEqual(undefined);
			expect(g.get_data_as_black('K', 'B')).toEqual(undefined);
			expect(g.get_data_as_white('K', 'C')).toEqual(undefined);
			expect(g.get_data_as_black('K', 'C')).toEqual(undefined);
			expect(g.get_data_as_white('K', 'Z')).toEqual(undefined);
			expect(g.get_data_as_black('K', 'Z')).toEqual(undefined);
			expect(g.get_out_degree('K')).toBe(0);
			expect(g.get_in_degree('K')).toBe(0);
			expect(g.get_black_opponents('K')).toEqual([]);
			expect(g.get_white_opponents('K')).toEqual([]);
			expect(g.get_data_as_white('Z', 'A')).toEqual(undefined);
			expect(g.get_data_as_black('Z', 'A')).toEqual(undefined);
			expect(g.get_data_as_white('Z', 'B')).toEqual(undefined);
			expect(g.get_data_as_black('Z', 'B')).toEqual(undefined);
			expect(g.get_data_as_white('Z', 'C')).toEqual(undefined);
			expect(g.get_data_as_black('Z', 'C')).toEqual(undefined);
			expect(g.get_data_as_white('Z', 'K')).toEqual(undefined);
			expect(g.get_data_as_black('Z', 'K')).toEqual(undefined);
			expect(g.get_out_degree('Z')).toBe(0);
			expect(g.get_in_degree('Z')).toBe(0);
			expect(g.get_black_opponents('Z')).toEqual([]);
			expect(g.get_white_opponents('Z')).toEqual([]);
		}

		g.add_edge('A', 'Z', 'draw');
		{
			expect(g.get_data_as_white('A', 'B')).toEqual(new EdgeMetadata(2, 0, 0));
			expect(g.get_data_as_black('A', 'B')).toEqual(undefined);
			expect(g.get_data_as_white('A', 'C')).toEqual(new EdgeMetadata(0, 0, 1));
			expect(g.get_data_as_black('A', 'C')).toEqual(undefined);
			expect(g.get_data_as_white('A', 'K')).toEqual(undefined);
			expect(g.get_data_as_black('A', 'K')).toEqual(undefined);
			expect(g.get_data_as_white('A', 'Z')).toEqual(new EdgeMetadata(0, 1, 0));
			expect(g.get_data_as_black('A', 'Z')).toEqual(undefined);
			expect(g.get_out_degree('A')).toBe(3);
			expect(g.get_in_degree('A')).toBe(0);
			expect(g.get_black_opponents('A')).toEqual(['B', 'C', 'Z']);
			expect(g.get_white_opponents('A')).toEqual([]);
			expect(g.get_data_as_white('B', 'A')).toEqual(undefined);
			expect(g.get_data_as_black('B', 'A')).toEqual(new EdgeMetadata(0, 0, 2));
			expect(g.get_data_as_white('B', 'C')).toEqual(undefined);
			expect(g.get_data_as_black('B', 'C')).toEqual(undefined);
			expect(g.get_data_as_white('B', 'K')).toEqual(undefined);
			expect(g.get_data_as_black('B', 'K')).toEqual(undefined);
			expect(g.get_data_as_white('B', 'Z')).toEqual(undefined);
			expect(g.get_data_as_black('B', 'Z')).toEqual(undefined);
			expect(g.get_out_degree('B')).toBe(0);
			expect(g.get_in_degree('B')).toBe(1);
			expect(g.get_black_opponents('B')).toEqual([]);
			expect(g.get_white_opponents('B')).toEqual(['A']);
			expect(g.get_data_as_white('C', 'A')).toEqual(undefined);
			expect(g.get_data_as_black('C', 'A')).toEqual(new EdgeMetadata(1, 0, 0));
			expect(g.get_data_as_white('C', 'B')).toEqual(undefined);
			expect(g.get_data_as_black('C', 'B')).toEqual(undefined);
			expect(g.get_data_as_white('C', 'K')).toEqual(undefined);
			expect(g.get_data_as_black('C', 'K')).toEqual(undefined);
			expect(g.get_data_as_white('C', 'Z')).toEqual(undefined);
			expect(g.get_data_as_black('C', 'Z')).toEqual(undefined);
			expect(g.get_out_degree('C')).toBe(0);
			expect(g.get_in_degree('C')).toBe(1);
			expect(g.get_black_opponents('C')).toEqual([]);
			expect(g.get_white_opponents('C')).toEqual(['A']);
			expect(g.get_data_as_white('K', 'A')).toEqual(undefined);
			expect(g.get_data_as_black('K', 'A')).toEqual(undefined);
			expect(g.get_data_as_white('K', 'B')).toEqual(undefined);
			expect(g.get_data_as_black('K', 'B')).toEqual(undefined);
			expect(g.get_data_as_white('K', 'C')).toEqual(undefined);
			expect(g.get_data_as_black('K', 'C')).toEqual(undefined);
			expect(g.get_data_as_white('K', 'Z')).toEqual(undefined);
			expect(g.get_data_as_black('K', 'Z')).toEqual(undefined);
			expect(g.get_out_degree('K')).toBe(0);
			expect(g.get_in_degree('K')).toBe(0);
			expect(g.get_black_opponents('K')).toEqual([]);
			expect(g.get_white_opponents('K')).toEqual([]);
			expect(g.get_data_as_white('Z', 'A')).toEqual(undefined);
			expect(g.get_data_as_black('Z', 'A')).toEqual(new EdgeMetadata(0, 1, 0));
			expect(g.get_data_as_white('Z', 'B')).toEqual(undefined);
			expect(g.get_data_as_black('Z', 'B')).toEqual(undefined);
			expect(g.get_data_as_white('Z', 'C')).toEqual(undefined);
			expect(g.get_data_as_black('Z', 'C')).toEqual(undefined);
			expect(g.get_data_as_white('Z', 'K')).toEqual(undefined);
			expect(g.get_data_as_black('Z', 'K')).toEqual(undefined);
			expect(g.get_out_degree('Z')).toBe(0);
			expect(g.get_in_degree('Z')).toBe(1);
			expect(g.get_black_opponents('Z')).toEqual([]);
			expect(g.get_white_opponents('Z')).toEqual(['A']);
		}

		g.add_edge('A', 'K', 'black_wins');
		{
			expect(g.get_data_as_white('A', 'B')).toEqual(new EdgeMetadata(2, 0, 0));
			expect(g.get_data_as_black('A', 'B')).toEqual(undefined);
			expect(g.get_data_as_white('A', 'C')).toEqual(new EdgeMetadata(0, 0, 1));
			expect(g.get_data_as_black('A', 'C')).toEqual(undefined);
			expect(g.get_data_as_white('A', 'K')).toEqual(new EdgeMetadata(0, 0, 1));
			expect(g.get_data_as_black('A', 'K')).toEqual(undefined);
			expect(g.get_data_as_white('A', 'Z')).toEqual(new EdgeMetadata(0, 1, 0));
			expect(g.get_data_as_black('A', 'Z')).toEqual(undefined);
			expect(g.get_out_degree('A')).toBe(4);
			expect(g.get_in_degree('A')).toBe(0);
			expect(g.get_black_opponents('A')).toEqual(['B', 'C', 'K', 'Z']);
			expect(g.get_white_opponents('A')).toEqual([]);
			expect(g.get_data_as_white('B', 'A')).toEqual(undefined);
			expect(g.get_data_as_black('B', 'A')).toEqual(new EdgeMetadata(0, 0, 2));
			expect(g.get_data_as_white('B', 'C')).toEqual(undefined);
			expect(g.get_data_as_black('B', 'C')).toEqual(undefined);
			expect(g.get_data_as_white('B', 'K')).toEqual(undefined);
			expect(g.get_data_as_black('B', 'K')).toEqual(undefined);
			expect(g.get_data_as_white('B', 'Z')).toEqual(undefined);
			expect(g.get_data_as_black('B', 'Z')).toEqual(undefined);
			expect(g.get_out_degree('B')).toBe(0);
			expect(g.get_in_degree('B')).toBe(1);
			expect(g.get_black_opponents('B')).toEqual([]);
			expect(g.get_white_opponents('B')).toEqual(['A']);
			expect(g.get_data_as_white('C', 'A')).toEqual(undefined);
			expect(g.get_data_as_black('C', 'A')).toEqual(new EdgeMetadata(1, 0, 0));
			expect(g.get_data_as_white('C', 'B')).toEqual(undefined);
			expect(g.get_data_as_black('C', 'B')).toEqual(undefined);
			expect(g.get_data_as_white('C', 'K')).toEqual(undefined);
			expect(g.get_data_as_black('C', 'K')).toEqual(undefined);
			expect(g.get_data_as_white('C', 'Z')).toEqual(undefined);
			expect(g.get_data_as_black('C', 'Z')).toEqual(undefined);
			expect(g.get_out_degree('C')).toBe(0);
			expect(g.get_in_degree('C')).toBe(1);
			expect(g.get_black_opponents('C')).toEqual([]);
			expect(g.get_white_opponents('C')).toEqual(['A']);
			expect(g.get_data_as_white('K', 'A')).toEqual(undefined);
			expect(g.get_data_as_black('K', 'A')).toEqual(new EdgeMetadata(1, 0, 0));
			expect(g.get_data_as_white('K', 'B')).toEqual(undefined);
			expect(g.get_data_as_black('K', 'B')).toEqual(undefined);
			expect(g.get_data_as_white('K', 'C')).toEqual(undefined);
			expect(g.get_data_as_black('K', 'C')).toEqual(undefined);
			expect(g.get_data_as_white('K', 'Z')).toEqual(undefined);
			expect(g.get_data_as_black('K', 'Z')).toEqual(undefined);
			expect(g.get_out_degree('K')).toBe(0);
			expect(g.get_in_degree('K')).toBe(1);
			expect(g.get_black_opponents('K')).toEqual([]);
			expect(g.get_white_opponents('K')).toEqual(['A']);
			expect(g.get_data_as_white('Z', 'A')).toEqual(undefined);
			expect(g.get_data_as_black('Z', 'A')).toEqual(new EdgeMetadata(0, 1, 0));
			expect(g.get_data_as_white('Z', 'B')).toEqual(undefined);
			expect(g.get_data_as_black('Z', 'B')).toEqual(undefined);
			expect(g.get_data_as_white('Z', 'C')).toEqual(undefined);
			expect(g.get_data_as_black('Z', 'C')).toEqual(undefined);
			expect(g.get_data_as_white('Z', 'K')).toEqual(undefined);
			expect(g.get_data_as_black('Z', 'K')).toEqual(undefined);
			expect(g.get_out_degree('Z')).toBe(0);
			expect(g.get_in_degree('Z')).toBe(1);
			expect(g.get_black_opponents('Z')).toEqual([]);
			expect(g.get_white_opponents('Z')).toEqual(['A']);
		}
	});
});

describe('Complex network', () => {
	test('1', () => {
		let g = new Graph();

		g.add_edge('A', 'B', 'white_wins');
		g.add_edge('B', 'A', 'draw');
		g.add_edge('C', 'B', 'black_wins');

		g.add_edge('Z', 'D', 'black_wins');
		g.add_edge('E', 'D', 'white_wins');

		g.add_edge('F', 'K', 'draw');
		g.add_edge('F', 'A', 'white_wins');

		{
			expect(g.get_data_as_white('A', 'B')).toEqual(new EdgeMetadata(1, 0, 0));
			expect(g.get_data_as_black('A', 'B')).toEqual(new EdgeMetadata(0, 1, 0));
			expect(g.get_data_as_white('A', 'C')).toEqual(undefined);
			expect(g.get_data_as_black('A', 'C')).toEqual(undefined);
			expect(g.get_data_as_white('A', 'D')).toEqual(undefined);
			expect(g.get_data_as_black('A', 'D')).toEqual(undefined);
			expect(g.get_data_as_white('A', 'E')).toEqual(undefined);
			expect(g.get_data_as_black('A', 'E')).toEqual(undefined);
			expect(g.get_data_as_white('A', 'F')).toEqual(undefined);
			expect(g.get_data_as_black('A', 'F')).toEqual(new EdgeMetadata(0, 0, 1));
			expect(g.get_data_as_white('A', 'K')).toEqual(undefined);
			expect(g.get_data_as_black('A', 'K')).toEqual(undefined);
			expect(g.get_data_as_white('A', 'Z')).toEqual(undefined);
			expect(g.get_data_as_black('A', 'Z')).toEqual(undefined);
			expect(g.get_out_degree('A')).toBe(1);
			expect(g.get_in_degree('A')).toBe(2);
			expect(g.get_black_opponents('A')).toEqual(['B']);
			expect(g.get_white_opponents('A')).toEqual(['B', 'F']);
		}
		{
			expect(g.get_data_as_white('B', 'A')).toEqual(new EdgeMetadata(0, 1, 0));
			expect(g.get_data_as_black('B', 'A')).toEqual(new EdgeMetadata(0, 0, 1));
			expect(g.get_data_as_white('B', 'C')).toEqual(undefined);
			expect(g.get_data_as_black('B', 'C')).toEqual(new EdgeMetadata(1, 0, 0));
			expect(g.get_data_as_white('B', 'D')).toEqual(undefined);
			expect(g.get_data_as_black('B', 'D')).toEqual(undefined);
			expect(g.get_data_as_white('B', 'E')).toEqual(undefined);
			expect(g.get_data_as_black('B', 'E')).toEqual(undefined);
			expect(g.get_data_as_white('B', 'F')).toEqual(undefined);
			expect(g.get_data_as_black('B', 'F')).toEqual(undefined);
			expect(g.get_data_as_white('B', 'K')).toEqual(undefined);
			expect(g.get_data_as_black('B', 'K')).toEqual(undefined);
			expect(g.get_data_as_white('B', 'Z')).toEqual(undefined);
			expect(g.get_data_as_black('B', 'Z')).toEqual(undefined);
			expect(g.get_out_degree('B')).toBe(1);
			expect(g.get_in_degree('B')).toBe(2);
			expect(g.get_black_opponents('B')).toEqual(['A']);
			expect(g.get_white_opponents('B')).toEqual(['A', 'C']);
		}
		{
			expect(g.get_data_as_white('C', 'A')).toEqual(undefined);
			expect(g.get_data_as_black('C', 'A')).toEqual(undefined);
			expect(g.get_data_as_white('C', 'B')).toEqual(new EdgeMetadata(0, 0, 1));
			expect(g.get_data_as_black('C', 'B')).toEqual(undefined);
			expect(g.get_data_as_white('C', 'D')).toEqual(undefined);
			expect(g.get_data_as_black('C', 'D')).toEqual(undefined);
			expect(g.get_data_as_white('C', 'E')).toEqual(undefined);
			expect(g.get_data_as_black('C', 'E')).toEqual(undefined);
			expect(g.get_data_as_white('C', 'F')).toEqual(undefined);
			expect(g.get_data_as_black('C', 'F')).toEqual(undefined);
			expect(g.get_data_as_white('C', 'K')).toEqual(undefined);
			expect(g.get_data_as_black('C', 'K')).toEqual(undefined);
			expect(g.get_data_as_white('C', 'Z')).toEqual(undefined);
			expect(g.get_data_as_black('C', 'Z')).toEqual(undefined);
			expect(g.get_out_degree('C')).toBe(1);
			expect(g.get_in_degree('C')).toBe(0);
			expect(g.get_black_opponents('C')).toEqual(['B']);
			expect(g.get_white_opponents('C')).toEqual([]);
		}
		{
			expect(g.get_data_as_white('D', 'A')).toEqual(undefined);
			expect(g.get_data_as_black('D', 'A')).toEqual(undefined);
			expect(g.get_data_as_white('D', 'B')).toEqual(undefined);
			expect(g.get_data_as_black('D', 'B')).toEqual(undefined);
			expect(g.get_data_as_white('D', 'C')).toEqual(undefined);
			expect(g.get_data_as_black('D', 'C')).toEqual(undefined);
			expect(g.get_data_as_white('D', 'E')).toEqual(undefined);
			expect(g.get_data_as_black('D', 'E')).toEqual(new EdgeMetadata(0, 0, 1));
			expect(g.get_data_as_white('D', 'F')).toEqual(undefined);
			expect(g.get_data_as_black('D', 'F')).toEqual(undefined);
			expect(g.get_data_as_white('D', 'K')).toEqual(undefined);
			expect(g.get_data_as_black('D', 'K')).toEqual(undefined);
			expect(g.get_data_as_white('D', 'Z')).toEqual(undefined);
			expect(g.get_data_as_black('D', 'Z')).toEqual(new EdgeMetadata(1, 0, 0));
			expect(g.get_out_degree('D')).toBe(0);
			expect(g.get_in_degree('D')).toBe(2);
			expect(g.get_black_opponents('D')).toEqual([]);
			expect(g.get_white_opponents('D')).toEqual(['E', 'Z']);
		}
		{
			expect(g.get_data_as_white('E', 'A')).toEqual(undefined);
			expect(g.get_data_as_black('E', 'A')).toEqual(undefined);
			expect(g.get_data_as_white('E', 'B')).toEqual(undefined);
			expect(g.get_data_as_black('E', 'B')).toEqual(undefined);
			expect(g.get_data_as_white('E', 'C')).toEqual(undefined);
			expect(g.get_data_as_black('E', 'C')).toEqual(undefined);
			expect(g.get_data_as_white('E', 'D')).toEqual(new EdgeMetadata(1, 0, 0));
			expect(g.get_data_as_black('E', 'D')).toEqual(undefined);
			expect(g.get_data_as_white('E', 'F')).toEqual(undefined);
			expect(g.get_data_as_black('E', 'F')).toEqual(undefined);
			expect(g.get_data_as_white('E', 'K')).toEqual(undefined);
			expect(g.get_data_as_black('E', 'K')).toEqual(undefined);
			expect(g.get_data_as_white('E', 'Z')).toEqual(undefined);
			expect(g.get_data_as_black('E', 'Z')).toEqual(undefined);
			expect(g.get_out_degree('E')).toBe(1);
			expect(g.get_in_degree('E')).toBe(0);
			expect(g.get_black_opponents('E')).toEqual(['D']);
			expect(g.get_white_opponents('E')).toEqual([]);
		}
		{
			expect(g.get_data_as_white('F', 'A')).toEqual(new EdgeMetadata(1, 0, 0));
			expect(g.get_data_as_black('F', 'A')).toEqual(undefined);
			expect(g.get_data_as_white('F', 'B')).toEqual(undefined);
			expect(g.get_data_as_black('F', 'B')).toEqual(undefined);
			expect(g.get_data_as_white('F', 'C')).toEqual(undefined);
			expect(g.get_data_as_black('F', 'C')).toEqual(undefined);
			expect(g.get_data_as_white('F', 'D')).toEqual(undefined);
			expect(g.get_data_as_black('F', 'D')).toEqual(undefined);
			expect(g.get_data_as_white('F', 'E')).toEqual(undefined);
			expect(g.get_data_as_black('F', 'E')).toEqual(undefined);
			expect(g.get_data_as_white('F', 'K')).toEqual(new EdgeMetadata(0, 1, 0));
			expect(g.get_data_as_black('F', 'K')).toEqual(undefined);
			expect(g.get_data_as_white('F', 'Z')).toEqual(undefined);
			expect(g.get_data_as_black('F', 'Z')).toEqual(undefined);
			expect(g.get_out_degree('F')).toBe(2);
			expect(g.get_in_degree('F')).toBe(0);
			expect(g.get_black_opponents('F')).toEqual(['A', 'K']);
			expect(g.get_white_opponents('F')).toEqual([]);
		}
		{
			expect(g.get_data_as_white('Z', 'A')).toEqual(undefined);
			expect(g.get_data_as_black('Z', 'A')).toEqual(undefined);
			expect(g.get_data_as_white('Z', 'B')).toEqual(undefined);
			expect(g.get_data_as_black('Z', 'B')).toEqual(undefined);
			expect(g.get_data_as_white('Z', 'C')).toEqual(undefined);
			expect(g.get_data_as_black('Z', 'C')).toEqual(undefined);
			expect(g.get_data_as_white('Z', 'D')).toEqual(new EdgeMetadata(0, 0, 1));
			expect(g.get_data_as_black('Z', 'D')).toEqual(undefined);
			expect(g.get_data_as_white('Z', 'E')).toEqual(undefined);
			expect(g.get_data_as_black('Z', 'E')).toEqual(undefined);
			expect(g.get_data_as_white('Z', 'K')).toEqual(undefined);
			expect(g.get_data_as_black('Z', 'K')).toEqual(undefined);
			expect(g.get_data_as_white('Z', 'F')).toEqual(undefined);
			expect(g.get_data_as_black('Z', 'F')).toEqual(undefined);
			expect(g.get_out_degree('Z')).toBe(1);
			expect(g.get_in_degree('Z')).toBe(0);
			expect(g.get_black_opponents('Z')).toEqual(['D']);
			expect(g.get_white_opponents('Z')).toEqual([]);
		}
	});
});

describe('Edge update', () => {
	test('1', () => {
		let g = new Graph();

		g.add_edge('A', 'B', 'white_wins');

		g.change_game_result('A', 'B', 'white_wins', 'draw');
		{
			expect(g.get_data_as_white('A', 'B')).toEqual(new EdgeMetadata(0, 1, 0));
			expect(g.get_data_as_black('A', 'B')).toEqual(undefined);
			expect(g.get_data_as_white('A', 'C')).toEqual(undefined);
			expect(g.get_data_as_black('A', 'C')).toEqual(undefined);
			expect(g.get_out_degree('A')).toBe(1);
			expect(g.get_in_degree('A')).toBe(0);
			expect(g.get_black_opponents('A')).toEqual(['B']);
			expect(g.get_white_opponents('A')).toEqual([]);
			expect(g.get_data_as_white('B', 'A')).toEqual(undefined);
			expect(g.get_data_as_black('B', 'A')).toEqual(new EdgeMetadata(0, 1, 0));
			expect(g.get_data_as_white('B', 'C')).toEqual(undefined);
			expect(g.get_data_as_black('B', 'C')).toEqual(undefined);
			expect(g.get_out_degree('B')).toBe(0);
			expect(g.get_in_degree('B')).toBe(1);
			expect(g.get_black_opponents('B')).toEqual([]);
			expect(g.get_white_opponents('B')).toEqual(['A']);
			expect(g.get_data_as_white('C', 'A')).toEqual(undefined);
			expect(g.get_data_as_black('C', 'A')).toEqual(undefined);
			expect(g.get_data_as_white('C', 'B')).toEqual(undefined);
			expect(g.get_data_as_black('C', 'B')).toEqual(undefined);
			expect(g.get_out_degree('C')).toBe(0);
			expect(g.get_in_degree('C')).toBe(0);
			expect(g.get_black_opponents('C')).toEqual([]);
			expect(g.get_white_opponents('C')).toEqual([]);
		}

		g.change_game_result('A', 'B', 'draw', 'black_wins');
		{
			expect(g.get_data_as_white('A', 'B')).toEqual(new EdgeMetadata(0, 0, 1));
			expect(g.get_data_as_black('A', 'B')).toEqual(undefined);
			expect(g.get_data_as_white('A', 'C')).toEqual(undefined);
			expect(g.get_data_as_black('A', 'C')).toEqual(undefined);
			expect(g.get_out_degree('A')).toBe(1);
			expect(g.get_in_degree('A')).toBe(0);
			expect(g.get_black_opponents('A')).toEqual(['B']);
			expect(g.get_white_opponents('A')).toEqual([]);
			expect(g.get_data_as_white('B', 'A')).toEqual(undefined);
			expect(g.get_data_as_black('B', 'A')).toEqual(new EdgeMetadata(1, 0, 0));
			expect(g.get_data_as_white('B', 'C')).toEqual(undefined);
			expect(g.get_data_as_black('B', 'C')).toEqual(undefined);
			expect(g.get_out_degree('B')).toBe(0);
			expect(g.get_in_degree('B')).toBe(1);
			expect(g.get_black_opponents('B')).toEqual([]);
			expect(g.get_white_opponents('B')).toEqual(['A']);
			expect(g.get_data_as_white('C', 'A')).toEqual(undefined);
			expect(g.get_data_as_black('C', 'A')).toEqual(undefined);
			expect(g.get_data_as_white('C', 'B')).toEqual(undefined);
			expect(g.get_data_as_black('C', 'B')).toEqual(undefined);
			expect(g.get_out_degree('C')).toBe(0);
			expect(g.get_in_degree('C')).toBe(0);
			expect(g.get_black_opponents('C')).toEqual([]);
			expect(g.get_white_opponents('C')).toEqual([]);
		}

		g.change_game_result('A', 'B', 'black_wins', 'draw');
		{
			expect(g.get_data_as_white('A', 'B')).toEqual(new EdgeMetadata(0, 1, 0));
			expect(g.get_data_as_black('A', 'B')).toEqual(undefined);
			expect(g.get_data_as_white('A', 'C')).toEqual(undefined);
			expect(g.get_data_as_black('A', 'C')).toEqual(undefined);
			expect(g.get_out_degree('A')).toBe(1);
			expect(g.get_in_degree('A')).toBe(0);
			expect(g.get_black_opponents('A')).toEqual(['B']);
			expect(g.get_white_opponents('A')).toEqual([]);
			expect(g.get_data_as_white('B', 'A')).toEqual(undefined);
			expect(g.get_data_as_black('B', 'A')).toEqual(new EdgeMetadata(0, 1, 0));
			expect(g.get_data_as_white('B', 'C')).toEqual(undefined);
			expect(g.get_data_as_black('B', 'C')).toEqual(undefined);
			expect(g.get_out_degree('B')).toBe(0);
			expect(g.get_in_degree('B')).toBe(1);
			expect(g.get_black_opponents('B')).toEqual([]);
			expect(g.get_white_opponents('B')).toEqual(['A']);
			expect(g.get_data_as_white('C', 'A')).toEqual(undefined);
			expect(g.get_data_as_black('C', 'A')).toEqual(undefined);
			expect(g.get_data_as_white('C', 'B')).toEqual(undefined);
			expect(g.get_data_as_black('C', 'B')).toEqual(undefined);
			expect(g.get_out_degree('C')).toBe(0);
			expect(g.get_in_degree('C')).toBe(0);
			expect(g.get_black_opponents('C')).toEqual([]);
			expect(g.get_white_opponents('C')).toEqual([]);
		}

		g.add_edge('C', 'A', 'white_wins');
		g.add_edge('C', 'B', 'black_wins');

		g.change_game_result('C', 'A', 'white_wins', 'draw');
		{
			expect(g.get_data_as_white('A', 'B')).toEqual(new EdgeMetadata(0, 1, 0));
			expect(g.get_data_as_black('A', 'B')).toEqual(undefined);
			expect(g.get_data_as_white('A', 'C')).toEqual(undefined);
			expect(g.get_data_as_black('A', 'C')).toEqual(new EdgeMetadata(0, 1, 0));
			expect(g.get_out_degree('A')).toBe(1);
			expect(g.get_in_degree('A')).toBe(1);
			expect(g.get_black_opponents('A')).toEqual(['B']);
			expect(g.get_white_opponents('A')).toEqual(['C']);
			expect(g.get_data_as_white('B', 'A')).toEqual(undefined);
			expect(g.get_data_as_black('B', 'A')).toEqual(new EdgeMetadata(0, 1, 0));
			expect(g.get_data_as_white('B', 'C')).toEqual(undefined);
			expect(g.get_data_as_black('B', 'C')).toEqual(new EdgeMetadata(1, 0, 0));
			expect(g.get_out_degree('B')).toBe(0);
			expect(g.get_in_degree('B')).toBe(2);
			expect(g.get_black_opponents('B')).toEqual([]);
			expect(g.get_white_opponents('B')).toEqual(['A', 'C']);
			expect(g.get_data_as_white('C', 'A')).toEqual(new EdgeMetadata(0, 1, 0));
			expect(g.get_data_as_black('C', 'A')).toEqual(undefined);
			expect(g.get_data_as_white('C', 'B')).toEqual(new EdgeMetadata(0, 0, 1));
			expect(g.get_data_as_black('C', 'B')).toEqual(undefined);
			expect(g.get_out_degree('C')).toBe(2);
			expect(g.get_in_degree('C')).toBe(0);
			expect(g.get_black_opponents('C')).toEqual(['A', 'B']);
			expect(g.get_white_opponents('C')).toEqual([]);
		}
		g.change_game_result('C', 'B', 'black_wins', 'draw');
		{
			expect(g.get_data_as_white('A', 'B')).toEqual(new EdgeMetadata(0, 1, 0));
			expect(g.get_data_as_black('A', 'B')).toEqual(undefined);
			expect(g.get_data_as_white('A', 'C')).toEqual(undefined);
			expect(g.get_data_as_black('A', 'C')).toEqual(new EdgeMetadata(0, 1, 0));
			expect(g.get_out_degree('A')).toBe(1);
			expect(g.get_in_degree('A')).toBe(1);
			expect(g.get_black_opponents('A')).toEqual(['B']);
			expect(g.get_white_opponents('A')).toEqual(['C']);
			expect(g.get_data_as_white('B', 'A')).toEqual(undefined);
			expect(g.get_data_as_black('B', 'A')).toEqual(new EdgeMetadata(0, 1, 0));
			expect(g.get_data_as_white('B', 'C')).toEqual(undefined);
			expect(g.get_data_as_black('B', 'C')).toEqual(new EdgeMetadata(0, 1, 0));
			expect(g.get_out_degree('B')).toBe(0);
			expect(g.get_in_degree('B')).toBe(2);
			expect(g.get_black_opponents('B')).toEqual([]);
			expect(g.get_white_opponents('B')).toEqual(['A', 'C']);
			expect(g.get_data_as_white('C', 'A')).toEqual(new EdgeMetadata(0, 1, 0));
			expect(g.get_data_as_black('C', 'A')).toEqual(undefined);
			expect(g.get_data_as_white('C', 'B')).toEqual(new EdgeMetadata(0, 1, 0));
			expect(g.get_data_as_black('C', 'B')).toEqual(undefined);
			expect(g.get_out_degree('C')).toBe(2);
			expect(g.get_in_degree('C')).toBe(0);
			expect(g.get_black_opponents('C')).toEqual(['A', 'B']);
			expect(g.get_white_opponents('C')).toEqual([]);
		}
	});
});
