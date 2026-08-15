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

import { EdgeMetadata } from '@server/models/graph/edge-metadata';
import { Graph } from '@server/models/graph/graph';
import { graphFromString, graphFullToFile } from '@server/io/graph/graph';
import { isNotDefined } from '@common/utils/is-defined';
import { toPlayerPrivateId } from '@common/models/player-id';

const A = toPlayerPrivateId('A');
const B = toPlayerPrivateId('B');
const C = toPlayerPrivateId('C');

describe('Write to and read from disk', () => {
	test('2 users -- write', () => {
		let g = new Graph();

		g.addEdge(A, B, 'white_wins');
		g.addEdge(B, A, 'white_wins');
		g.addEdge(A, B, 'draw');
		g.addEdge(B, A, 'draw');

		if (fs.existsSync('graph_test/')) {
			fs.rmdirSync('graph_test/', { recursive: true });
		}
		fs.mkdirSync('graph_test/');
		graphFullToFile('graph_test/', g);
	});

	test('2 users -- read', () => {
		expect(fs.readdirSync('graph_test').length).toBe(2);
		expect(fs.existsSync('graph_test/A')).toBe(true);
		expect(fs.existsSync('graph_test/B')).toBe(true);

		const g = graphFromString('graph_test/');
		expect(g).not.toBeNull();
		if (isNotDefined(g)) {
			return;
		}
		expect(g.getDataAsWhite(A, B)).toEqual(new EdgeMetadata(1, 1, 0));
		expect(g.getDataAsBlack(A, B)).toEqual(new EdgeMetadata(0, 1, 1));
		expect(g.getOutDegree(A)).toBe(1);
		expect(g.getInDegree(A)).toBe(1);
		expect(g.getBlackOpponents(A)).toEqual(['B']);
		expect(g.getWhiteOpponents(A)).toEqual(['B']);
		expect(g.getDataAsWhite(B, A)).toEqual(new EdgeMetadata(1, 1, 0));
		expect(g.getDataAsBlack(B, A)).toEqual(new EdgeMetadata(0, 1, 1));
		expect(g.getOutDegree(B)).toBe(1);
		expect(g.getInDegree(B)).toBe(1);
		expect(g.getBlackOpponents(B)).toEqual(['A']);
		expect(g.getWhiteOpponents(B)).toEqual(['A']);
	});

	test('3 users -- write', () => {
		let g = new Graph();

		g.addEdge(A, B, 'white_wins');
		g.addEdge(A, C, 'black_wins');
		g.addEdge(B, C, 'draw');
		g.addEdge(C, B, 'white_wins');
		g.addEdge(C, A, 'white_wins');
		g.addEdge(C, B, 'black_wins');

		if (fs.existsSync('graph_test/')) {
			fs.rmdirSync('graph_test/', { recursive: true });
		}
		fs.mkdirSync('graph_test/');
		graphFullToFile('graph_test/', g);
	});

	test('3 users -- read', () => {
		expect(fs.readdirSync('graph_test').length).toBe(3);
		expect(fs.existsSync('graph_test/A')).toBe(true);
		expect(fs.existsSync('graph_test/B')).toBe(true);
		expect(fs.existsSync('graph_test/C')).toBe(true);

		const g = graphFromString('graph_test/');
		expect(g).not.toBeNull();
		if (isNotDefined(g)) {
			return;
		}
		expect(g.getDataAsWhite(A, B)).toEqual(new EdgeMetadata(1, 0, 0));
		expect(g.getDataAsBlack(A, B)).toEqual(undefined);
		expect(g.getDataAsWhite(A, C)).toEqual(new EdgeMetadata(0, 0, 1));
		expect(g.getDataAsBlack(A, C)).toEqual(new EdgeMetadata(0, 0, 1));
		expect(g.getOutDegree(A)).toBe(2);
		expect(g.getInDegree(A)).toBe(1);
		expect(g.getBlackOpponents(A)).toEqual(['B', 'C']);
		expect(g.getWhiteOpponents(A)).toEqual(['C']);

		expect(g.getDataAsWhite(B, A)).toEqual(undefined);
		expect(g.getDataAsBlack(B, A)).toEqual(new EdgeMetadata(0, 0, 1));
		expect(g.getDataAsWhite(B, C)).toEqual(new EdgeMetadata(0, 1, 0));
		expect(g.getDataAsBlack(B, C)).toEqual(new EdgeMetadata(1, 0, 1));
		expect(g.getOutDegree(B)).toBe(1);
		expect(g.getInDegree(B)).toBe(2);
		expect(g.getBlackOpponents(B)).toEqual(['C']);
		expect(g.getWhiteOpponents(B)).toEqual(['A', 'C']);

		expect(g.getDataAsWhite(C, A)).toEqual(new EdgeMetadata(1, 0, 0));
		expect(g.getDataAsBlack(C, A)).toEqual(new EdgeMetadata(1, 0, 0));
		expect(g.getDataAsWhite(C, B)).toEqual(new EdgeMetadata(1, 0, 1));
		expect(g.getDataAsBlack(C, B)).toEqual(new EdgeMetadata(0, 1, 0));
		expect(g.getOutDegree(C)).toBe(2);
		expect(g.getInDegree(C)).toBe(2);
		expect(g.getBlackOpponents(C)).toEqual(['A', 'B']);
		expect(g.getWhiteOpponents(C)).toEqual(['A', 'B']);
	});
});
