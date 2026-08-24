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

import { toPlayerPrivateId } from '@common/models/player-id';
import { edgeFromString } from '@server/io/graph/edge';
import { Edge } from '@server/models/graph/edge';
import { EdgeMetadata } from '@server/models/graph/edge-metadata';

describe('IO conversion', () => {
	test('string', () => {
		expect(
			edgeFromString('{"neighbor": "A", "metadata": {"numGamesWon": 1, "numGamesDrawn": 0, "numGamesLost": 300}}'),
		).toEqual(new Edge(toPlayerPrivateId('A'), new EdgeMetadata(1, 0, 300)));
	});
});
