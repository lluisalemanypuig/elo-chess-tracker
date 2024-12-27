/*
Elo rating for a Chess Club
Copyright (C) 2023 - 2024  Lluís Alemany Puig

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

Contact:
	Lluís Alemany Puig
	https://github.com/lluisalemanypuig
*/

import { assert } from 'console';
import { EdgeMetadata, edge_metadata_from_json } from './edge_metadata';

/**
 * @brief A (directed) edge from user A to user B.
 *
 * An edge going from A to B is an abstraction of a game in which A plays as White
 * against B who plays as Black.
 *
 * Each edge has some metadata associated to it.
 */
export class Edge {
	/// The id of B (the target of the edge).
	public neighbor: string;

	/// The metadata of this edge.
	public metadata: EdgeMetadata | undefined;

	constructor(neigh: string, data: EdgeMetadata | undefined) {
		this.neighbor = neigh;
		this.metadata = data;
	}

	/// Merge two edges
	merge(other: Edge): void {
		assert(this.neighbor == other.neighbor);
		if (this.metadata != undefined && other.metadata != undefined) {
			this.metadata.merge(other.metadata);
		}
	}
}

/**
 * @brief Parses a JSON string or object and returns an Edge.
 * @param json A string with data of an Edge.
 * @returns A new Edge object.
 * @pre If @e json is a string, then it cannot start with '['.
 */
export function edge_from_json(json: any): Edge {
	if (typeof json === 'string') {
		const json_parse = JSON.parse(json);
		return edge_from_json(json_parse);
	}

	return new Edge(json['neighbor'], edge_metadata_from_json(json['metadata']));
}
