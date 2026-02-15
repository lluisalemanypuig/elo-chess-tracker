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

import { GraphsManager } from '../../src-server/managers/graphs_manager';
import { Graph } from '../../src-server/models/graph/graph';

describe('Graph manager', () => {
	let man = GraphsManager.get_instance();

	test('Add empty graphs', () => {
		man.add_graph('Blitz', new Graph());
		man.add_graph('Classical', new Graph());
		man.add_graph('Rapid', new Graph());
	});

	test('Get empty graphs', () => {
		expect(man.get_graph('Blitz')).toEqual(new Graph());
		expect(man.get_graph('Classical')).toEqual(new Graph());
		expect(man.get_graph('Rapid')).toEqual(new Graph());
	});

	let blitz = new Graph();
	let classical = new Graph();
	let rapid = new Graph();

	test('Modify some graphs', () => {
		blitz.add_edge('C', 'D', 'draw');
		man.get_graph('Blitz')?.add_edge('C', 'D', 'draw');

		classical.add_edge('E', 'F', 'black_wins');
		man.get_graph('Classical')?.add_edge('E', 'F', 'black_wins');

		rapid.add_edge('A', 'B', 'white_wins');
		man.get_graph('Rapid')?.add_edge('A', 'B', 'white_wins');
	});

	test('Get graphs', () => {
		expect(man.get_graph('Rapid')).toEqual(rapid);
		expect(man.get_graph('Blitz')).toEqual(blitz);
		expect(man.get_graph('Classical')).toEqual(classical);
	});
});
