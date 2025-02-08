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
	public metadata: EdgeMetadata;

	constructor(neigh: string, data: EdgeMetadata) {
		this.neighbor = neigh;
		this.metadata = data;
	}

	/// Merge two edges
	merge(other: Edge): void {
		if (this.neighbor != other.neighbor) {
			throw new Error(
				`The current edge points to '${this.neighbor}' but the new edge points to '${other.neighbor}'.`
			);
		}

		if (this.metadata != undefined && other.metadata != undefined) {
			this.metadata.merge(other.metadata);
		}
	}

	/// Is the metadata of this edge all zeroes?
	is_empty_edge(): boolean {
		return (
			this.metadata.num_games_drawn == 0 && this.metadata.num_games_lost == 0 && this.metadata.num_games_won == 0
		);
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

	return new Edge(json.neighbor, edge_metadata_from_json(json.metadata));
}

/**
 * @brief Parses a JSON string or object and returns an Edge.
 * @param json A string with data of an Edge.
 * @returns A new Edge object.
 * @pre If @e json is a string, then it cannot start with '['.
 */
export function edge_set_from_json(json: any): Edge[] {
	if (typeof json === 'string') {
		const json_parse = JSON.parse(json);
		return edge_set_from_json(json_parse);
	}
	let edge_set: Edge[] = [];
	for (var edge in json) {
		edge_set.push(edge_from_json(json[edge]));
	}
	return edge_set;
}
