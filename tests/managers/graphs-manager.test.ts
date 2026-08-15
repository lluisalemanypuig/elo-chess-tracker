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

import { clearServer } from '@server/managers/memory/clear';
import { GraphsManager } from '@server/managers/graphs-manager';
import { Graph } from '@server/models/graph/graph';
import { toTimeControlId } from '@common/models/time-control';
import { toPlayerPrivateId } from '@common/models/player-id';

const Classical = toTimeControlId('Classical');
const Rapid = toTimeControlId('Rapid');
const Blitz = toTimeControlId('Blitz');

describe('Graph manager', () => {
	clearServer();
	let man = GraphsManager.getInstance();

	test('Add empty graphs', () => {
		man.addGraph(Blitz, new Graph());
		man.addGraph(Classical, new Graph());
		man.addGraph(Rapid, new Graph());
	});

	test('Get empty graphs', () => {
		expect(man.getGraph(Blitz)).toEqual(new Graph());
		expect(man.getGraph(Classical)).toEqual(new Graph());
		expect(man.getGraph(Rapid)).toEqual(new Graph());
	});

	let blitz = new Graph();
	let classical = new Graph();
	let rapid = new Graph();

	const A = toPlayerPrivateId('A');
	const B = toPlayerPrivateId('B');
	const C = toPlayerPrivateId('C');
	const D = toPlayerPrivateId('D');
	const E = toPlayerPrivateId('E');
	const F = toPlayerPrivateId('F');

	test('Modify some graphs', () => {
		blitz.addEdge(C, D, 'draw');
		man.getGraph(Blitz)?.addEdge(C, D, 'draw');

		classical.addEdge(E, F, 'black_wins');
		man.getGraph(Classical)?.addEdge(E, F, 'black_wins');

		rapid.addEdge(A, B, 'white_wins');
		man.getGraph(Rapid)?.addEdge(A, B, 'white_wins');
	});

	test('Get graphs', () => {
		expect(man.getGraph(Rapid)).toEqual(rapid);
		expect(man.getGraph(Blitz)).toEqual(blitz);
		expect(man.getGraph(Classical)).toEqual(classical);
	});
});
