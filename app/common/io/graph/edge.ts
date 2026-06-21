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

import { Edge, EdgeArraySchema, EdgeSchema } from '@common/models/graph/edge';
import { read_schema } from '@common/io/generic';
import { isDefined } from '@common/utils/is_defined';
import { EdgeMetadata } from '@common/models/graph/edge_metadata';

/**
 * @brief Parses a JSON string and returns an Edge.
 * @param str A string with data of an Edge.
 * @returns A new Edge object.
 */
export function edge_from_string(str: string): Edge | null {
	const data = read_schema(EdgeSchema, str);
	if (!isDefined(data)) {
		return null;
	}
	return new Edge(
		data.neighbor,
		new EdgeMetadata(data.metadata.num_games_won, data.metadata.num_games_drawn, data.metadata.num_games_lost)
	);
}

/**
 * @brief Parses a JSON string and returns an Edge.
 * @param str A string with data of an Edge.
 * @returns A new Edge object.
 */
export function edge_array_from_string(str: string): Edge[] | null {
	const data = read_schema(EdgeArraySchema, str);
	if (!isDefined(data)) {
		return null;
	}

	let edges: Edge[] = [];
	for (const edge of data) {
		edges.push(
			new Edge(
				edge.neighbor,
				new EdgeMetadata(
					edge.metadata.num_games_won,
					edge.metadata.num_games_drawn,
					edge.metadata.num_games_lost
				)
			)
		);
	}
	return edges;
}
