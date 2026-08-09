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

import { toPlayerPrivateId } from '@common/models/player';
import { EdgeMetadata } from '@common/models/graph/edge-metadata';
import { Graph } from '@common/models/graph/graph';

const A = toPlayerPrivateId('A');
const B = toPlayerPrivateId('B');
const C = toPlayerPrivateId('C');
const D = toPlayerPrivateId('D');
const E = toPlayerPrivateId('E');
const F = toPlayerPrivateId('F');
const K = toPlayerPrivateId('K');
const Z = toPlayerPrivateId('Z');

describe('Simple construction and query', () => {
	test('1', () => {
		let g = new Graph();

		g.addEdge(A, B, 'white_wins');
		{
			expect(g.getDataAsWhite(A, B)).toEqual(new EdgeMetadata(1, 0, 0));
			expect(g.getDataAsBlack(A, B)).toEqual(undefined);
			expect(g.getOutDegree(A)).toBe(1);
			expect(g.getInDegree(A)).toBe(0);
			expect(g.getBlackOpponents(A)).toEqual([B]);
			expect(g.getWhiteOpponents(A)).toEqual([]);
			expect(g.getDataAsWhite(B, A)).toEqual(undefined);
			expect(g.getDataAsBlack(B, A)).toEqual(new EdgeMetadata(0, 0, 1));
			expect(g.getOutDegree(B)).toBe(0);
			expect(g.getInDegree(B)).toBe(1);
			expect(g.getBlackOpponents(B)).toEqual([]);
			expect(g.getWhiteOpponents(B)).toEqual([A]);
		}

		g.addEdge(A, B, 'white_wins');
		{
			expect(g.getDataAsWhite(A, B)).toEqual(new EdgeMetadata(2, 0, 0));
			expect(g.getDataAsBlack(A, B)).toEqual(undefined);
			expect(g.getOutDegree(A)).toBe(1);
			expect(g.getInDegree(A)).toBe(0);
			expect(g.getBlackOpponents(A)).toEqual([B]);
			expect(g.getWhiteOpponents(A)).toEqual([]);
			expect(g.getDataAsWhite(B, A)).toEqual(undefined);
			expect(g.getDataAsBlack(B, A)).toEqual(new EdgeMetadata(0, 0, 2));
			expect(g.getOutDegree(B)).toBe(0);
			expect(g.getInDegree(B)).toBe(1);
			expect(g.getBlackOpponents(B)).toEqual([]);
			expect(g.getWhiteOpponents(B)).toEqual([A]);
		}

		g.addEdge(A, B, 'white_wins');
		{
			expect(g.getDataAsWhite(A, B)).toEqual(new EdgeMetadata(3, 0, 0));
			expect(g.getDataAsBlack(A, B)).toEqual(undefined);
			expect(g.getOutDegree(A)).toBe(1);
			expect(g.getInDegree(A)).toBe(0);
			expect(g.getBlackOpponents(A)).toEqual([B]);
			expect(g.getWhiteOpponents(A)).toEqual([]);
			expect(g.getDataAsWhite(B, A)).toEqual(undefined);
			expect(g.getDataAsBlack(B, A)).toEqual(new EdgeMetadata(0, 0, 3));
			expect(g.getOutDegree(B)).toBe(0);
			expect(g.getInDegree(B)).toBe(1);
			expect(g.getBlackOpponents(B)).toEqual([]);
			expect(g.getWhiteOpponents(B)).toEqual([A]);
		}
	});

	test('2', () => {
		let g = new Graph();

		g.addEdge(A, B, 'white_wins');
		{
			expect(g.getDataAsWhite(A, B)).toEqual(new EdgeMetadata(1, 0, 0));
			expect(g.getDataAsBlack(A, B)).toEqual(undefined);
			expect(g.getOutDegree(A)).toBe(1);
			expect(g.getInDegree(A)).toBe(0);
			expect(g.getBlackOpponents(A)).toEqual([B]);
			expect(g.getWhiteOpponents(A)).toEqual([]);
			expect(g.getDataAsWhite(B, A)).toEqual(undefined);
			expect(g.getDataAsBlack(B, A)).toEqual(new EdgeMetadata(0, 0, 1));
			expect(g.getOutDegree(B)).toBe(0);
			expect(g.getInDegree(B)).toBe(1);
			expect(g.getBlackOpponents(B)).toEqual([]);
			expect(g.getWhiteOpponents(B)).toEqual([A]);
		}

		g.addEdge(A, B, 'black_wins');
		{
			expect(g.getDataAsWhite(A, B)).toEqual(new EdgeMetadata(1, 0, 1));
			expect(g.getDataAsBlack(A, B)).toEqual(undefined);
			expect(g.getOutDegree(A)).toBe(1);
			expect(g.getInDegree(A)).toBe(0);
			expect(g.getBlackOpponents(A)).toEqual([B]);
			expect(g.getWhiteOpponents(A)).toEqual([]);
			expect(g.getDataAsWhite(B, A)).toEqual(undefined);
			expect(g.getDataAsBlack(B, A)).toEqual(new EdgeMetadata(1, 0, 1));
			expect(g.getOutDegree(B)).toBe(0);
			expect(g.getInDegree(B)).toBe(1);
			expect(g.getBlackOpponents(B)).toEqual([]);
			expect(g.getWhiteOpponents(B)).toEqual([A]);
		}

		g.addEdge(A, B, 'draw');
		{
			expect(g.getDataAsWhite(A, B)).toEqual(new EdgeMetadata(1, 1, 1));
			expect(g.getDataAsBlack(A, B)).toEqual(undefined);
			expect(g.getOutDegree(A)).toBe(1);
			expect(g.getInDegree(A)).toBe(0);
			expect(g.getBlackOpponents(A)).toEqual([B]);
			expect(g.getWhiteOpponents(A)).toEqual([]);
			expect(g.getDataAsWhite(B, A)).toEqual(undefined);
			expect(g.getDataAsBlack(B, A)).toEqual(new EdgeMetadata(1, 1, 1));
			expect(g.getOutDegree(B)).toBe(0);
			expect(g.getInDegree(B)).toBe(1);
			expect(g.getBlackOpponents(B)).toEqual([]);
			expect(g.getWhiteOpponents(B)).toEqual([A]);
		}
	});

	test('3', () => {
		let g = new Graph();

		g.addEdge(A, B, 'white_wins');
		{
			expect(g.getDataAsWhite(A, B)).toEqual(new EdgeMetadata(1, 0, 0));
			expect(g.getDataAsBlack(A, B)).toEqual(undefined);
			expect(g.getOutDegree(A)).toBe(1);
			expect(g.getInDegree(A)).toBe(0);
			expect(g.getBlackOpponents(A)).toEqual([B]);
			expect(g.getWhiteOpponents(A)).toEqual([]);
			expect(g.getDataAsWhite(B, A)).toEqual(undefined);
			expect(g.getDataAsBlack(B, A)).toEqual(new EdgeMetadata(0, 0, 1));
			expect(g.getOutDegree(B)).toBe(0);
			expect(g.getInDegree(B)).toBe(1);
			expect(g.getBlackOpponents(B)).toEqual([]);
			expect(g.getWhiteOpponents(B)).toEqual([A]);
		}

		g.addEdge(B, A, 'black_wins');
		{
			expect(g.getDataAsWhite(A, B)).toEqual(new EdgeMetadata(1, 0, 0));
			expect(g.getDataAsBlack(A, B)).toEqual(new EdgeMetadata(1, 0, 0));
			expect(g.getOutDegree(A)).toBe(1);
			expect(g.getInDegree(A)).toBe(1);
			expect(g.getBlackOpponents(A)).toEqual([B]);
			expect(g.getWhiteOpponents(A)).toEqual([B]);
			expect(g.getDataAsWhite(B, A)).toEqual(new EdgeMetadata(0, 0, 1));
			expect(g.getDataAsBlack(B, A)).toEqual(new EdgeMetadata(0, 0, 1));
			expect(g.getOutDegree(B)).toBe(1);
			expect(g.getInDegree(B)).toBe(1);
			expect(g.getBlackOpponents(B)).toEqual([A]);
			expect(g.getWhiteOpponents(B)).toEqual([A]);
		}

		g.addEdge(A, B, 'draw');
		{
			expect(g.getDataAsWhite(A, B)).toEqual(new EdgeMetadata(1, 1, 0));
			expect(g.getDataAsBlack(A, B)).toEqual(new EdgeMetadata(1, 0, 0));
			expect(g.getOutDegree(A)).toBe(1);
			expect(g.getInDegree(A)).toBe(1);
			expect(g.getBlackOpponents(A)).toEqual([B]);
			expect(g.getWhiteOpponents(A)).toEqual([B]);
			expect(g.getDataAsWhite(B, A)).toEqual(new EdgeMetadata(0, 0, 1));
			expect(g.getDataAsBlack(B, A)).toEqual(new EdgeMetadata(0, 1, 1));
			expect(g.getOutDegree(B)).toBe(1);
			expect(g.getInDegree(B)).toBe(1);
			expect(g.getBlackOpponents(B)).toEqual([A]);
			expect(g.getWhiteOpponents(B)).toEqual([A]);
		}
	});

	test('4', () => {
		let g = new Graph();

		g.addEdge(A, B, 'white_wins');
		{
			expect(g.getDataAsWhite(A, B)).toEqual(new EdgeMetadata(1, 0, 0));
			expect(g.getDataAsBlack(A, B)).toEqual(undefined);
			expect(g.getDataAsWhite(A, C)).toEqual(undefined);
			expect(g.getDataAsBlack(A, C)).toEqual(undefined);
			expect(g.getDataAsWhite(A, K)).toEqual(undefined);
			expect(g.getDataAsBlack(A, K)).toEqual(undefined);
			expect(g.getDataAsWhite(A, Z)).toEqual(undefined);
			expect(g.getDataAsBlack(A, Z)).toEqual(undefined);
			expect(g.getOutDegree(A)).toBe(1);
			expect(g.getInDegree(A)).toBe(0);
			expect(g.getBlackOpponents(A)).toEqual([B]);
			expect(g.getWhiteOpponents(A)).toEqual([]);
			expect(g.getDataAsWhite(B, A)).toEqual(undefined);
			expect(g.getDataAsBlack(B, A)).toEqual(new EdgeMetadata(0, 0, 1));
			expect(g.getDataAsWhite(B, C)).toEqual(undefined);
			expect(g.getDataAsBlack(B, C)).toEqual(undefined);
			expect(g.getDataAsWhite(B, K)).toEqual(undefined);
			expect(g.getDataAsBlack(B, K)).toEqual(undefined);
			expect(g.getDataAsWhite(B, Z)).toEqual(undefined);
			expect(g.getDataAsBlack(B, Z)).toEqual(undefined);
			expect(g.getOutDegree(B)).toBe(0);
			expect(g.getInDegree(B)).toBe(1);
			expect(g.getBlackOpponents(B)).toEqual([]);
			expect(g.getWhiteOpponents(B)).toEqual([A]);
			expect(g.getDataAsWhite(C, A)).toEqual(undefined);
			expect(g.getDataAsBlack(C, A)).toEqual(undefined);
			expect(g.getDataAsWhite(C, B)).toEqual(undefined);
			expect(g.getDataAsBlack(C, B)).toEqual(undefined);
			expect(g.getDataAsWhite(C, K)).toEqual(undefined);
			expect(g.getDataAsBlack(C, K)).toEqual(undefined);
			expect(g.getDataAsWhite(C, Z)).toEqual(undefined);
			expect(g.getDataAsBlack(C, Z)).toEqual(undefined);
			expect(g.getOutDegree(C)).toBe(0);
			expect(g.getInDegree(C)).toBe(0);
			expect(g.getBlackOpponents(C)).toEqual([]);
			expect(g.getWhiteOpponents(C)).toEqual([]);
			expect(g.getDataAsWhite(K, A)).toEqual(undefined);
			expect(g.getDataAsBlack(K, A)).toEqual(undefined);
			expect(g.getDataAsWhite(K, B)).toEqual(undefined);
			expect(g.getDataAsBlack(K, B)).toEqual(undefined);
			expect(g.getDataAsWhite(K, C)).toEqual(undefined);
			expect(g.getDataAsBlack(K, C)).toEqual(undefined);
			expect(g.getDataAsWhite(K, Z)).toEqual(undefined);
			expect(g.getDataAsBlack(K, Z)).toEqual(undefined);
			expect(g.getOutDegree(K)).toBe(0);
			expect(g.getInDegree(K)).toBe(0);
			expect(g.getBlackOpponents(K)).toEqual([]);
			expect(g.getWhiteOpponents(K)).toEqual([]);
			expect(g.getDataAsWhite(Z, A)).toEqual(undefined);
			expect(g.getDataAsBlack(Z, A)).toEqual(undefined);
			expect(g.getDataAsWhite(Z, B)).toEqual(undefined);
			expect(g.getDataAsBlack(Z, B)).toEqual(undefined);
			expect(g.getDataAsWhite(Z, C)).toEqual(undefined);
			expect(g.getDataAsBlack(Z, C)).toEqual(undefined);
			expect(g.getDataAsWhite(Z, K)).toEqual(undefined);
			expect(g.getDataAsBlack(Z, K)).toEqual(undefined);
			expect(g.getOutDegree(Z)).toBe(0);
			expect(g.getInDegree(Z)).toBe(0);
			expect(g.getBlackOpponents(Z)).toEqual([]);
			expect(g.getWhiteOpponents(Z)).toEqual([]);
		}

		g.addEdge(A, C, 'black_wins');
		{
			expect(g.getDataAsWhite(A, B)).toEqual(new EdgeMetadata(1, 0, 0));
			expect(g.getDataAsBlack(A, B)).toEqual(undefined);
			expect(g.getDataAsWhite(A, C)).toEqual(new EdgeMetadata(0, 0, 1));
			expect(g.getDataAsBlack(A, C)).toEqual(undefined);
			expect(g.getDataAsWhite(A, K)).toEqual(undefined);
			expect(g.getDataAsBlack(A, K)).toEqual(undefined);
			expect(g.getDataAsWhite(A, Z)).toEqual(undefined);
			expect(g.getDataAsBlack(A, Z)).toEqual(undefined);
			expect(g.getOutDegree(A)).toBe(2);
			expect(g.getInDegree(A)).toBe(0);
			expect(g.getBlackOpponents(A)).toEqual([B, C]);
			expect(g.getWhiteOpponents(A)).toEqual([]);
			expect(g.getDataAsWhite(B, A)).toEqual(undefined);
			expect(g.getDataAsBlack(B, A)).toEqual(new EdgeMetadata(0, 0, 1));
			expect(g.getDataAsWhite(B, C)).toEqual(undefined);
			expect(g.getDataAsBlack(B, C)).toEqual(undefined);
			expect(g.getDataAsWhite(B, K)).toEqual(undefined);
			expect(g.getDataAsBlack(B, K)).toEqual(undefined);
			expect(g.getDataAsWhite(B, Z)).toEqual(undefined);
			expect(g.getDataAsBlack(B, Z)).toEqual(undefined);
			expect(g.getOutDegree(B)).toBe(0);
			expect(g.getInDegree(B)).toBe(1);
			expect(g.getBlackOpponents(B)).toEqual([]);
			expect(g.getWhiteOpponents(B)).toEqual([A]);
			expect(g.getDataAsWhite(C, A)).toEqual(undefined);
			expect(g.getDataAsBlack(C, A)).toEqual(new EdgeMetadata(1, 0, 0));
			expect(g.getDataAsWhite(C, B)).toEqual(undefined);
			expect(g.getDataAsBlack(C, B)).toEqual(undefined);
			expect(g.getDataAsWhite(C, K)).toEqual(undefined);
			expect(g.getDataAsBlack(C, K)).toEqual(undefined);
			expect(g.getDataAsWhite(C, Z)).toEqual(undefined);
			expect(g.getDataAsBlack(C, Z)).toEqual(undefined);
			expect(g.getOutDegree(C)).toBe(0);
			expect(g.getInDegree(C)).toBe(1);
			expect(g.getBlackOpponents(C)).toEqual([]);
			expect(g.getWhiteOpponents(C)).toEqual([A]);
			expect(g.getDataAsWhite(K, A)).toEqual(undefined);
			expect(g.getDataAsBlack(K, A)).toEqual(undefined);
			expect(g.getDataAsWhite(K, B)).toEqual(undefined);
			expect(g.getDataAsBlack(K, B)).toEqual(undefined);
			expect(g.getDataAsWhite(K, C)).toEqual(undefined);
			expect(g.getDataAsBlack(K, C)).toEqual(undefined);
			expect(g.getDataAsWhite(K, Z)).toEqual(undefined);
			expect(g.getDataAsBlack(K, Z)).toEqual(undefined);
			expect(g.getOutDegree(K)).toBe(0);
			expect(g.getInDegree(K)).toBe(0);
			expect(g.getBlackOpponents(K)).toEqual([]);
			expect(g.getWhiteOpponents(K)).toEqual([]);
			expect(g.getDataAsWhite(Z, A)).toEqual(undefined);
			expect(g.getDataAsBlack(Z, A)).toEqual(undefined);
			expect(g.getDataAsWhite(Z, B)).toEqual(undefined);
			expect(g.getDataAsBlack(Z, B)).toEqual(undefined);
			expect(g.getDataAsWhite(Z, C)).toEqual(undefined);
			expect(g.getDataAsBlack(Z, C)).toEqual(undefined);
			expect(g.getDataAsWhite(Z, K)).toEqual(undefined);
			expect(g.getDataAsBlack(Z, K)).toEqual(undefined);
			expect(g.getOutDegree(Z)).toBe(0);
			expect(g.getInDegree(Z)).toBe(0);
			expect(g.getBlackOpponents(Z)).toEqual([]);
			expect(g.getWhiteOpponents(Z)).toEqual([]);
		}

		g.addEdge(A, B, 'white_wins');
		{
			expect(g.getDataAsWhite(A, B)).toEqual(new EdgeMetadata(2, 0, 0));
			expect(g.getDataAsBlack(A, B)).toEqual(undefined);
			expect(g.getDataAsWhite(A, C)).toEqual(new EdgeMetadata(0, 0, 1));
			expect(g.getDataAsBlack(A, C)).toEqual(undefined);
			expect(g.getDataAsWhite(A, K)).toEqual(undefined);
			expect(g.getDataAsBlack(A, K)).toEqual(undefined);
			expect(g.getDataAsWhite(A, Z)).toEqual(undefined);
			expect(g.getDataAsBlack(A, Z)).toEqual(undefined);
			expect(g.getOutDegree(A)).toBe(2);
			expect(g.getInDegree(A)).toBe(0);
			expect(g.getBlackOpponents(A)).toEqual([B, C]);
			expect(g.getWhiteOpponents(A)).toEqual([]);
			expect(g.getDataAsWhite(B, A)).toEqual(undefined);
			expect(g.getDataAsBlack(B, A)).toEqual(new EdgeMetadata(0, 0, 2));
			expect(g.getDataAsWhite(B, C)).toEqual(undefined);
			expect(g.getDataAsBlack(B, C)).toEqual(undefined);
			expect(g.getDataAsWhite(B, K)).toEqual(undefined);
			expect(g.getDataAsBlack(B, K)).toEqual(undefined);
			expect(g.getDataAsWhite(B, Z)).toEqual(undefined);
			expect(g.getDataAsBlack(B, Z)).toEqual(undefined);
			expect(g.getOutDegree(B)).toBe(0);
			expect(g.getInDegree(B)).toBe(1);
			expect(g.getBlackOpponents(B)).toEqual([]);
			expect(g.getWhiteOpponents(B)).toEqual([A]);
			expect(g.getDataAsWhite(C, A)).toEqual(undefined);
			expect(g.getDataAsBlack(C, A)).toEqual(new EdgeMetadata(1, 0, 0));
			expect(g.getDataAsWhite(C, B)).toEqual(undefined);
			expect(g.getDataAsBlack(C, B)).toEqual(undefined);
			expect(g.getDataAsWhite(C, K)).toEqual(undefined);
			expect(g.getDataAsBlack(C, K)).toEqual(undefined);
			expect(g.getDataAsWhite(C, Z)).toEqual(undefined);
			expect(g.getDataAsBlack(C, Z)).toEqual(undefined);
			expect(g.getOutDegree(C)).toBe(0);
			expect(g.getInDegree(C)).toBe(1);
			expect(g.getBlackOpponents(C)).toEqual([]);
			expect(g.getWhiteOpponents(C)).toEqual([A]);
			expect(g.getDataAsWhite(K, A)).toEqual(undefined);
			expect(g.getDataAsBlack(K, A)).toEqual(undefined);
			expect(g.getDataAsWhite(K, B)).toEqual(undefined);
			expect(g.getDataAsBlack(K, B)).toEqual(undefined);
			expect(g.getDataAsWhite(K, C)).toEqual(undefined);
			expect(g.getDataAsBlack(K, C)).toEqual(undefined);
			expect(g.getDataAsWhite(K, Z)).toEqual(undefined);
			expect(g.getDataAsBlack(K, Z)).toEqual(undefined);
			expect(g.getOutDegree(K)).toBe(0);
			expect(g.getInDegree(K)).toBe(0);
			expect(g.getBlackOpponents(K)).toEqual([]);
			expect(g.getWhiteOpponents(K)).toEqual([]);
			expect(g.getDataAsWhite(Z, A)).toEqual(undefined);
			expect(g.getDataAsBlack(Z, A)).toEqual(undefined);
			expect(g.getDataAsWhite(Z, B)).toEqual(undefined);
			expect(g.getDataAsBlack(Z, B)).toEqual(undefined);
			expect(g.getDataAsWhite(Z, C)).toEqual(undefined);
			expect(g.getDataAsBlack(Z, C)).toEqual(undefined);
			expect(g.getDataAsWhite(Z, K)).toEqual(undefined);
			expect(g.getDataAsBlack(Z, K)).toEqual(undefined);
			expect(g.getOutDegree(Z)).toBe(0);
			expect(g.getInDegree(Z)).toBe(0);
			expect(g.getBlackOpponents(Z)).toEqual([]);
			expect(g.getWhiteOpponents(Z)).toEqual([]);
		}

		g.addEdge(A, Z, 'draw');
		{
			expect(g.getDataAsWhite(A, B)).toEqual(new EdgeMetadata(2, 0, 0));
			expect(g.getDataAsBlack(A, B)).toEqual(undefined);
			expect(g.getDataAsWhite(A, C)).toEqual(new EdgeMetadata(0, 0, 1));
			expect(g.getDataAsBlack(A, C)).toEqual(undefined);
			expect(g.getDataAsWhite(A, K)).toEqual(undefined);
			expect(g.getDataAsBlack(A, K)).toEqual(undefined);
			expect(g.getDataAsWhite(A, Z)).toEqual(new EdgeMetadata(0, 1, 0));
			expect(g.getDataAsBlack(A, Z)).toEqual(undefined);
			expect(g.getOutDegree(A)).toBe(3);
			expect(g.getInDegree(A)).toBe(0);
			expect(g.getBlackOpponents(A)).toEqual([B, C, Z]);
			expect(g.getWhiteOpponents(A)).toEqual([]);
			expect(g.getDataAsWhite(B, A)).toEqual(undefined);
			expect(g.getDataAsBlack(B, A)).toEqual(new EdgeMetadata(0, 0, 2));
			expect(g.getDataAsWhite(B, C)).toEqual(undefined);
			expect(g.getDataAsBlack(B, C)).toEqual(undefined);
			expect(g.getDataAsWhite(B, K)).toEqual(undefined);
			expect(g.getDataAsBlack(B, K)).toEqual(undefined);
			expect(g.getDataAsWhite(B, Z)).toEqual(undefined);
			expect(g.getDataAsBlack(B, Z)).toEqual(undefined);
			expect(g.getOutDegree(B)).toBe(0);
			expect(g.getInDegree(B)).toBe(1);
			expect(g.getBlackOpponents(B)).toEqual([]);
			expect(g.getWhiteOpponents(B)).toEqual([A]);
			expect(g.getDataAsWhite(C, A)).toEqual(undefined);
			expect(g.getDataAsBlack(C, A)).toEqual(new EdgeMetadata(1, 0, 0));
			expect(g.getDataAsWhite(C, B)).toEqual(undefined);
			expect(g.getDataAsBlack(C, B)).toEqual(undefined);
			expect(g.getDataAsWhite(C, K)).toEqual(undefined);
			expect(g.getDataAsBlack(C, K)).toEqual(undefined);
			expect(g.getDataAsWhite(C, Z)).toEqual(undefined);
			expect(g.getDataAsBlack(C, Z)).toEqual(undefined);
			expect(g.getOutDegree(C)).toBe(0);
			expect(g.getInDegree(C)).toBe(1);
			expect(g.getBlackOpponents(C)).toEqual([]);
			expect(g.getWhiteOpponents(C)).toEqual([A]);
			expect(g.getDataAsWhite(K, A)).toEqual(undefined);
			expect(g.getDataAsBlack(K, A)).toEqual(undefined);
			expect(g.getDataAsWhite(K, B)).toEqual(undefined);
			expect(g.getDataAsBlack(K, B)).toEqual(undefined);
			expect(g.getDataAsWhite(K, C)).toEqual(undefined);
			expect(g.getDataAsBlack(K, C)).toEqual(undefined);
			expect(g.getDataAsWhite(K, Z)).toEqual(undefined);
			expect(g.getDataAsBlack(K, Z)).toEqual(undefined);
			expect(g.getOutDegree(K)).toBe(0);
			expect(g.getInDegree(K)).toBe(0);
			expect(g.getBlackOpponents(K)).toEqual([]);
			expect(g.getWhiteOpponents(K)).toEqual([]);
			expect(g.getDataAsWhite(Z, A)).toEqual(undefined);
			expect(g.getDataAsBlack(Z, A)).toEqual(new EdgeMetadata(0, 1, 0));
			expect(g.getDataAsWhite(Z, B)).toEqual(undefined);
			expect(g.getDataAsBlack(Z, B)).toEqual(undefined);
			expect(g.getDataAsWhite(Z, C)).toEqual(undefined);
			expect(g.getDataAsBlack(Z, C)).toEqual(undefined);
			expect(g.getDataAsWhite(Z, K)).toEqual(undefined);
			expect(g.getDataAsBlack(Z, K)).toEqual(undefined);
			expect(g.getOutDegree(Z)).toBe(0);
			expect(g.getInDegree(Z)).toBe(1);
			expect(g.getBlackOpponents(Z)).toEqual([]);
			expect(g.getWhiteOpponents(Z)).toEqual([A]);
		}

		g.addEdge(A, K, 'black_wins');
		{
			expect(g.getDataAsWhite(A, B)).toEqual(new EdgeMetadata(2, 0, 0));
			expect(g.getDataAsBlack(A, B)).toEqual(undefined);
			expect(g.getDataAsWhite(A, C)).toEqual(new EdgeMetadata(0, 0, 1));
			expect(g.getDataAsBlack(A, C)).toEqual(undefined);
			expect(g.getDataAsWhite(A, K)).toEqual(new EdgeMetadata(0, 0, 1));
			expect(g.getDataAsBlack(A, K)).toEqual(undefined);
			expect(g.getDataAsWhite(A, Z)).toEqual(new EdgeMetadata(0, 1, 0));
			expect(g.getDataAsBlack(A, Z)).toEqual(undefined);
			expect(g.getOutDegree(A)).toBe(4);
			expect(g.getInDegree(A)).toBe(0);
			expect(g.getBlackOpponents(A)).toEqual([B, C, K, Z]);
			expect(g.getWhiteOpponents(A)).toEqual([]);
			expect(g.getDataAsWhite(B, A)).toEqual(undefined);
			expect(g.getDataAsBlack(B, A)).toEqual(new EdgeMetadata(0, 0, 2));
			expect(g.getDataAsWhite(B, C)).toEqual(undefined);
			expect(g.getDataAsBlack(B, C)).toEqual(undefined);
			expect(g.getDataAsWhite(B, K)).toEqual(undefined);
			expect(g.getDataAsBlack(B, K)).toEqual(undefined);
			expect(g.getDataAsWhite(B, Z)).toEqual(undefined);
			expect(g.getDataAsBlack(B, Z)).toEqual(undefined);
			expect(g.getOutDegree(B)).toBe(0);
			expect(g.getInDegree(B)).toBe(1);
			expect(g.getBlackOpponents(B)).toEqual([]);
			expect(g.getWhiteOpponents(B)).toEqual([A]);
			expect(g.getDataAsWhite(C, A)).toEqual(undefined);
			expect(g.getDataAsBlack(C, A)).toEqual(new EdgeMetadata(1, 0, 0));
			expect(g.getDataAsWhite(C, B)).toEqual(undefined);
			expect(g.getDataAsBlack(C, B)).toEqual(undefined);
			expect(g.getDataAsWhite(C, K)).toEqual(undefined);
			expect(g.getDataAsBlack(C, K)).toEqual(undefined);
			expect(g.getDataAsWhite(C, Z)).toEqual(undefined);
			expect(g.getDataAsBlack(C, Z)).toEqual(undefined);
			expect(g.getOutDegree(C)).toBe(0);
			expect(g.getInDegree(C)).toBe(1);
			expect(g.getBlackOpponents(C)).toEqual([]);
			expect(g.getWhiteOpponents(C)).toEqual([A]);
			expect(g.getDataAsWhite(K, A)).toEqual(undefined);
			expect(g.getDataAsBlack(K, A)).toEqual(new EdgeMetadata(1, 0, 0));
			expect(g.getDataAsWhite(K, B)).toEqual(undefined);
			expect(g.getDataAsBlack(K, B)).toEqual(undefined);
			expect(g.getDataAsWhite(K, C)).toEqual(undefined);
			expect(g.getDataAsBlack(K, C)).toEqual(undefined);
			expect(g.getDataAsWhite(K, Z)).toEqual(undefined);
			expect(g.getDataAsBlack(K, Z)).toEqual(undefined);
			expect(g.getOutDegree(K)).toBe(0);
			expect(g.getInDegree(K)).toBe(1);
			expect(g.getBlackOpponents(K)).toEqual([]);
			expect(g.getWhiteOpponents(K)).toEqual([A]);
			expect(g.getDataAsWhite(Z, A)).toEqual(undefined);
			expect(g.getDataAsBlack(Z, A)).toEqual(new EdgeMetadata(0, 1, 0));
			expect(g.getDataAsWhite(Z, B)).toEqual(undefined);
			expect(g.getDataAsBlack(Z, B)).toEqual(undefined);
			expect(g.getDataAsWhite(Z, C)).toEqual(undefined);
			expect(g.getDataAsBlack(Z, C)).toEqual(undefined);
			expect(g.getDataAsWhite(Z, K)).toEqual(undefined);
			expect(g.getDataAsBlack(Z, K)).toEqual(undefined);
			expect(g.getOutDegree(Z)).toBe(0);
			expect(g.getInDegree(Z)).toBe(1);
			expect(g.getBlackOpponents(Z)).toEqual([]);
			expect(g.getWhiteOpponents(Z)).toEqual([A]);
		}
	});
});

describe('Complex network', () => {
	test('1', () => {
		let g = new Graph();

		g.addEdge(A, B, 'white_wins');
		g.addEdge(B, A, 'draw');
		g.addEdge(C, B, 'black_wins');

		g.addEdge(Z, D, 'black_wins');
		g.addEdge(E, D, 'white_wins');

		g.addEdge(F, K, 'draw');
		g.addEdge(F, A, 'white_wins');

		{
			expect(g.getDataAsWhite(A, B)).toEqual(new EdgeMetadata(1, 0, 0));
			expect(g.getDataAsBlack(A, B)).toEqual(new EdgeMetadata(0, 1, 0));
			expect(g.getDataAsWhite(A, C)).toEqual(undefined);
			expect(g.getDataAsBlack(A, C)).toEqual(undefined);
			expect(g.getDataAsWhite(A, D)).toEqual(undefined);
			expect(g.getDataAsBlack(A, D)).toEqual(undefined);
			expect(g.getDataAsWhite(A, E)).toEqual(undefined);
			expect(g.getDataAsBlack(A, E)).toEqual(undefined);
			expect(g.getDataAsWhite(A, F)).toEqual(undefined);
			expect(g.getDataAsBlack(A, F)).toEqual(new EdgeMetadata(0, 0, 1));
			expect(g.getDataAsWhite(A, K)).toEqual(undefined);
			expect(g.getDataAsBlack(A, K)).toEqual(undefined);
			expect(g.getDataAsWhite(A, Z)).toEqual(undefined);
			expect(g.getDataAsBlack(A, Z)).toEqual(undefined);
			expect(g.getOutDegree(A)).toBe(1);
			expect(g.getInDegree(A)).toBe(2);
			expect(g.getBlackOpponents(A)).toEqual([B]);
			expect(g.getWhiteOpponents(A)).toEqual([B, F]);
		}
		{
			expect(g.getDataAsWhite(B, A)).toEqual(new EdgeMetadata(0, 1, 0));
			expect(g.getDataAsBlack(B, A)).toEqual(new EdgeMetadata(0, 0, 1));
			expect(g.getDataAsWhite(B, C)).toEqual(undefined);
			expect(g.getDataAsBlack(B, C)).toEqual(new EdgeMetadata(1, 0, 0));
			expect(g.getDataAsWhite(B, D)).toEqual(undefined);
			expect(g.getDataAsBlack(B, D)).toEqual(undefined);
			expect(g.getDataAsWhite(B, E)).toEqual(undefined);
			expect(g.getDataAsBlack(B, E)).toEqual(undefined);
			expect(g.getDataAsWhite(B, F)).toEqual(undefined);
			expect(g.getDataAsBlack(B, F)).toEqual(undefined);
			expect(g.getDataAsWhite(B, K)).toEqual(undefined);
			expect(g.getDataAsBlack(B, K)).toEqual(undefined);
			expect(g.getDataAsWhite(B, Z)).toEqual(undefined);
			expect(g.getDataAsBlack(B, Z)).toEqual(undefined);
			expect(g.getOutDegree(B)).toBe(1);
			expect(g.getInDegree(B)).toBe(2);
			expect(g.getBlackOpponents(B)).toEqual([A]);
			expect(g.getWhiteOpponents(B)).toEqual([A, C]);
		}
		{
			expect(g.getDataAsWhite(C, A)).toEqual(undefined);
			expect(g.getDataAsBlack(C, A)).toEqual(undefined);
			expect(g.getDataAsWhite(C, B)).toEqual(new EdgeMetadata(0, 0, 1));
			expect(g.getDataAsBlack(C, B)).toEqual(undefined);
			expect(g.getDataAsWhite(C, D)).toEqual(undefined);
			expect(g.getDataAsBlack(C, D)).toEqual(undefined);
			expect(g.getDataAsWhite(C, E)).toEqual(undefined);
			expect(g.getDataAsBlack(C, E)).toEqual(undefined);
			expect(g.getDataAsWhite(C, F)).toEqual(undefined);
			expect(g.getDataAsBlack(C, F)).toEqual(undefined);
			expect(g.getDataAsWhite(C, K)).toEqual(undefined);
			expect(g.getDataAsBlack(C, K)).toEqual(undefined);
			expect(g.getDataAsWhite(C, Z)).toEqual(undefined);
			expect(g.getDataAsBlack(C, Z)).toEqual(undefined);
			expect(g.getOutDegree(C)).toBe(1);
			expect(g.getInDegree(C)).toBe(0);
			expect(g.getBlackOpponents(C)).toEqual([B]);
			expect(g.getWhiteOpponents(C)).toEqual([]);
		}
		{
			expect(g.getDataAsWhite(D, A)).toEqual(undefined);
			expect(g.getDataAsBlack(D, A)).toEqual(undefined);
			expect(g.getDataAsWhite(D, B)).toEqual(undefined);
			expect(g.getDataAsBlack(D, B)).toEqual(undefined);
			expect(g.getDataAsWhite(D, C)).toEqual(undefined);
			expect(g.getDataAsBlack(D, C)).toEqual(undefined);
			expect(g.getDataAsWhite(D, E)).toEqual(undefined);
			expect(g.getDataAsBlack(D, E)).toEqual(new EdgeMetadata(0, 0, 1));
			expect(g.getDataAsWhite(D, F)).toEqual(undefined);
			expect(g.getDataAsBlack(D, F)).toEqual(undefined);
			expect(g.getDataAsWhite(D, K)).toEqual(undefined);
			expect(g.getDataAsBlack(D, K)).toEqual(undefined);
			expect(g.getDataAsWhite(D, Z)).toEqual(undefined);
			expect(g.getDataAsBlack(D, Z)).toEqual(new EdgeMetadata(1, 0, 0));
			expect(g.getOutDegree(D)).toBe(0);
			expect(g.getInDegree(D)).toBe(2);
			expect(g.getBlackOpponents(D)).toEqual([]);
			expect(g.getWhiteOpponents(D)).toEqual([E, Z]);
		}
		{
			expect(g.getDataAsWhite(E, A)).toEqual(undefined);
			expect(g.getDataAsBlack(E, A)).toEqual(undefined);
			expect(g.getDataAsWhite(E, B)).toEqual(undefined);
			expect(g.getDataAsBlack(E, B)).toEqual(undefined);
			expect(g.getDataAsWhite(E, C)).toEqual(undefined);
			expect(g.getDataAsBlack(E, C)).toEqual(undefined);
			expect(g.getDataAsWhite(E, D)).toEqual(new EdgeMetadata(1, 0, 0));
			expect(g.getDataAsBlack(E, D)).toEqual(undefined);
			expect(g.getDataAsWhite(E, F)).toEqual(undefined);
			expect(g.getDataAsBlack(E, F)).toEqual(undefined);
			expect(g.getDataAsWhite(E, K)).toEqual(undefined);
			expect(g.getDataAsBlack(E, K)).toEqual(undefined);
			expect(g.getDataAsWhite(E, Z)).toEqual(undefined);
			expect(g.getDataAsBlack(E, Z)).toEqual(undefined);
			expect(g.getOutDegree(E)).toBe(1);
			expect(g.getInDegree(E)).toBe(0);
			expect(g.getBlackOpponents(E)).toEqual([D]);
			expect(g.getWhiteOpponents(E)).toEqual([]);
		}
		{
			expect(g.getDataAsWhite(F, A)).toEqual(new EdgeMetadata(1, 0, 0));
			expect(g.getDataAsBlack(F, A)).toEqual(undefined);
			expect(g.getDataAsWhite(F, B)).toEqual(undefined);
			expect(g.getDataAsBlack(F, B)).toEqual(undefined);
			expect(g.getDataAsWhite(F, C)).toEqual(undefined);
			expect(g.getDataAsBlack(F, C)).toEqual(undefined);
			expect(g.getDataAsWhite(F, D)).toEqual(undefined);
			expect(g.getDataAsBlack(F, D)).toEqual(undefined);
			expect(g.getDataAsWhite(F, E)).toEqual(undefined);
			expect(g.getDataAsBlack(F, E)).toEqual(undefined);
			expect(g.getDataAsWhite(F, K)).toEqual(new EdgeMetadata(0, 1, 0));
			expect(g.getDataAsBlack(F, K)).toEqual(undefined);
			expect(g.getDataAsWhite(F, Z)).toEqual(undefined);
			expect(g.getDataAsBlack(F, Z)).toEqual(undefined);
			expect(g.getOutDegree(F)).toBe(2);
			expect(g.getInDegree(F)).toBe(0);
			expect(g.getBlackOpponents(F)).toEqual([A, K]);
			expect(g.getWhiteOpponents(F)).toEqual([]);
		}
		{
			expect(g.getDataAsWhite(Z, A)).toEqual(undefined);
			expect(g.getDataAsBlack(Z, A)).toEqual(undefined);
			expect(g.getDataAsWhite(Z, B)).toEqual(undefined);
			expect(g.getDataAsBlack(Z, B)).toEqual(undefined);
			expect(g.getDataAsWhite(Z, C)).toEqual(undefined);
			expect(g.getDataAsBlack(Z, C)).toEqual(undefined);
			expect(g.getDataAsWhite(Z, D)).toEqual(new EdgeMetadata(0, 0, 1));
			expect(g.getDataAsBlack(Z, D)).toEqual(undefined);
			expect(g.getDataAsWhite(Z, E)).toEqual(undefined);
			expect(g.getDataAsBlack(Z, E)).toEqual(undefined);
			expect(g.getDataAsWhite(Z, K)).toEqual(undefined);
			expect(g.getDataAsBlack(Z, K)).toEqual(undefined);
			expect(g.getDataAsWhite(Z, F)).toEqual(undefined);
			expect(g.getDataAsBlack(Z, F)).toEqual(undefined);
			expect(g.getOutDegree(Z)).toBe(1);
			expect(g.getInDegree(Z)).toBe(0);
			expect(g.getBlackOpponents(Z)).toEqual([D]);
			expect(g.getWhiteOpponents(Z)).toEqual([]);
		}
	});
});

describe('Edge update', () => {
	test('1', () => {
		let g = new Graph();

		g.addEdge(A, B, 'white_wins');

		g.changeGameResult(A, B, 'white_wins', 'draw');
		{
			expect(g.getDataAsWhite(A, B)).toEqual(new EdgeMetadata(0, 1, 0));
			expect(g.getDataAsBlack(A, B)).toEqual(undefined);
			expect(g.getDataAsWhite(A, C)).toEqual(undefined);
			expect(g.getDataAsBlack(A, C)).toEqual(undefined);
			expect(g.getOutDegree(A)).toBe(1);
			expect(g.getInDegree(A)).toBe(0);
			expect(g.getBlackOpponents(A)).toEqual([B]);
			expect(g.getWhiteOpponents(A)).toEqual([]);
			expect(g.getDataAsWhite(B, A)).toEqual(undefined);
			expect(g.getDataAsBlack(B, A)).toEqual(new EdgeMetadata(0, 1, 0));
			expect(g.getDataAsWhite(B, C)).toEqual(undefined);
			expect(g.getDataAsBlack(B, C)).toEqual(undefined);
			expect(g.getOutDegree(B)).toBe(0);
			expect(g.getInDegree(B)).toBe(1);
			expect(g.getBlackOpponents(B)).toEqual([]);
			expect(g.getWhiteOpponents(B)).toEqual([A]);
			expect(g.getDataAsWhite(C, A)).toEqual(undefined);
			expect(g.getDataAsBlack(C, A)).toEqual(undefined);
			expect(g.getDataAsWhite(C, B)).toEqual(undefined);
			expect(g.getDataAsBlack(C, B)).toEqual(undefined);
			expect(g.getOutDegree(C)).toBe(0);
			expect(g.getInDegree(C)).toBe(0);
			expect(g.getBlackOpponents(C)).toEqual([]);
			expect(g.getWhiteOpponents(C)).toEqual([]);
		}

		g.changeGameResult(A, B, 'draw', 'black_wins');
		{
			expect(g.getDataAsWhite(A, B)).toEqual(new EdgeMetadata(0, 0, 1));
			expect(g.getDataAsBlack(A, B)).toEqual(undefined);
			expect(g.getDataAsWhite(A, C)).toEqual(undefined);
			expect(g.getDataAsBlack(A, C)).toEqual(undefined);
			expect(g.getOutDegree(A)).toBe(1);
			expect(g.getInDegree(A)).toBe(0);
			expect(g.getBlackOpponents(A)).toEqual([B]);
			expect(g.getWhiteOpponents(A)).toEqual([]);
			expect(g.getDataAsWhite(B, A)).toEqual(undefined);
			expect(g.getDataAsBlack(B, A)).toEqual(new EdgeMetadata(1, 0, 0));
			expect(g.getDataAsWhite(B, C)).toEqual(undefined);
			expect(g.getDataAsBlack(B, C)).toEqual(undefined);
			expect(g.getOutDegree(B)).toBe(0);
			expect(g.getInDegree(B)).toBe(1);
			expect(g.getBlackOpponents(B)).toEqual([]);
			expect(g.getWhiteOpponents(B)).toEqual([A]);
			expect(g.getDataAsWhite(C, A)).toEqual(undefined);
			expect(g.getDataAsBlack(C, A)).toEqual(undefined);
			expect(g.getDataAsWhite(C, B)).toEqual(undefined);
			expect(g.getDataAsBlack(C, B)).toEqual(undefined);
			expect(g.getOutDegree(C)).toBe(0);
			expect(g.getInDegree(C)).toBe(0);
			expect(g.getBlackOpponents(C)).toEqual([]);
			expect(g.getWhiteOpponents(C)).toEqual([]);
		}

		g.changeGameResult(A, B, 'black_wins', 'draw');
		{
			expect(g.getDataAsWhite(A, B)).toEqual(new EdgeMetadata(0, 1, 0));
			expect(g.getDataAsBlack(A, B)).toEqual(undefined);
			expect(g.getDataAsWhite(A, C)).toEqual(undefined);
			expect(g.getDataAsBlack(A, C)).toEqual(undefined);
			expect(g.getOutDegree(A)).toBe(1);
			expect(g.getInDegree(A)).toBe(0);
			expect(g.getBlackOpponents(A)).toEqual([B]);
			expect(g.getWhiteOpponents(A)).toEqual([]);
			expect(g.getDataAsWhite(B, A)).toEqual(undefined);
			expect(g.getDataAsBlack(B, A)).toEqual(new EdgeMetadata(0, 1, 0));
			expect(g.getDataAsWhite(B, C)).toEqual(undefined);
			expect(g.getDataAsBlack(B, C)).toEqual(undefined);
			expect(g.getOutDegree(B)).toBe(0);
			expect(g.getInDegree(B)).toBe(1);
			expect(g.getBlackOpponents(B)).toEqual([]);
			expect(g.getWhiteOpponents(B)).toEqual([A]);
			expect(g.getDataAsWhite(C, A)).toEqual(undefined);
			expect(g.getDataAsBlack(C, A)).toEqual(undefined);
			expect(g.getDataAsWhite(C, B)).toEqual(undefined);
			expect(g.getDataAsBlack(C, B)).toEqual(undefined);
			expect(g.getOutDegree(C)).toBe(0);
			expect(g.getInDegree(C)).toBe(0);
			expect(g.getBlackOpponents(C)).toEqual([]);
			expect(g.getWhiteOpponents(C)).toEqual([]);
		}

		g.addEdge(C, A, 'white_wins');
		g.addEdge(C, B, 'black_wins');

		g.changeGameResult(C, A, 'white_wins', 'draw');
		{
			expect(g.getDataAsWhite(A, B)).toEqual(new EdgeMetadata(0, 1, 0));
			expect(g.getDataAsBlack(A, B)).toEqual(undefined);
			expect(g.getDataAsWhite(A, C)).toEqual(undefined);
			expect(g.getDataAsBlack(A, C)).toEqual(new EdgeMetadata(0, 1, 0));
			expect(g.getOutDegree(A)).toBe(1);
			expect(g.getInDegree(A)).toBe(1);
			expect(g.getBlackOpponents(A)).toEqual([B]);
			expect(g.getWhiteOpponents(A)).toEqual([C]);
			expect(g.getDataAsWhite(B, A)).toEqual(undefined);
			expect(g.getDataAsBlack(B, A)).toEqual(new EdgeMetadata(0, 1, 0));
			expect(g.getDataAsWhite(B, C)).toEqual(undefined);
			expect(g.getDataAsBlack(B, C)).toEqual(new EdgeMetadata(1, 0, 0));
			expect(g.getOutDegree(B)).toBe(0);
			expect(g.getInDegree(B)).toBe(2);
			expect(g.getBlackOpponents(B)).toEqual([]);
			expect(g.getWhiteOpponents(B)).toEqual([A, C]);
			expect(g.getDataAsWhite(C, A)).toEqual(new EdgeMetadata(0, 1, 0));
			expect(g.getDataAsBlack(C, A)).toEqual(undefined);
			expect(g.getDataAsWhite(C, B)).toEqual(new EdgeMetadata(0, 0, 1));
			expect(g.getDataAsBlack(C, B)).toEqual(undefined);
			expect(g.getOutDegree(C)).toBe(2);
			expect(g.getInDegree(C)).toBe(0);
			expect(g.getBlackOpponents(C)).toEqual([A, B]);
			expect(g.getWhiteOpponents(C)).toEqual([]);
		}
		g.changeGameResult(C, B, 'black_wins', 'draw');
		{
			expect(g.getDataAsWhite(A, B)).toEqual(new EdgeMetadata(0, 1, 0));
			expect(g.getDataAsBlack(A, B)).toEqual(undefined);
			expect(g.getDataAsWhite(A, C)).toEqual(undefined);
			expect(g.getDataAsBlack(A, C)).toEqual(new EdgeMetadata(0, 1, 0));
			expect(g.getOutDegree(A)).toBe(1);
			expect(g.getInDegree(A)).toBe(1);
			expect(g.getBlackOpponents(A)).toEqual([B]);
			expect(g.getWhiteOpponents(A)).toEqual([C]);
			expect(g.getDataAsWhite(B, A)).toEqual(undefined);
			expect(g.getDataAsBlack(B, A)).toEqual(new EdgeMetadata(0, 1, 0));
			expect(g.getDataAsWhite(B, C)).toEqual(undefined);
			expect(g.getDataAsBlack(B, C)).toEqual(new EdgeMetadata(0, 1, 0));
			expect(g.getOutDegree(B)).toBe(0);
			expect(g.getInDegree(B)).toBe(2);
			expect(g.getBlackOpponents(B)).toEqual([]);
			expect(g.getWhiteOpponents(B)).toEqual([A, C]);
			expect(g.getDataAsWhite(C, A)).toEqual(new EdgeMetadata(0, 1, 0));
			expect(g.getDataAsBlack(C, A)).toEqual(undefined);
			expect(g.getDataAsWhite(C, B)).toEqual(new EdgeMetadata(0, 1, 0));
			expect(g.getDataAsBlack(C, B)).toEqual(undefined);
			expect(g.getOutDegree(C)).toBe(2);
			expect(g.getInDegree(C)).toBe(0);
			expect(g.getBlackOpponents(C)).toEqual([A, B]);
			expect(g.getWhiteOpponents(C)).toEqual([]);
		}
	});
});
