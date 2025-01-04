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

Contact:
	Lluís Alemany Puig
	https://github.com/lluisalemanypuig
*/

import { EdgeMetadata } from './edge_metadata';
import { Edge, edge_from_json } from './edge';
import { search_by_key, where_should_be_inserted_by_key } from '../../utils/searching';
import { Game, GameResult } from '../game';

/**
 * @brief Graph abstraction for games between pairs of users.
 */
export class Graph {
	/// This is used to locate the games for any user A
	private user_to_index: Map<string, number> = new Map();
	private max_user_idx: number = 0;

	/// The list of games for every user.
	private adjacency_list: Edge[][] = [];

	/// Add a new user to the graph.
	private push_user(user: string): void {
		this.user_to_index.set(user, this.max_user_idx);
		++this.max_user_idx;
	}

	/**
	 * @brief Adds a new edge to this neighborhood.
	 *
	 * This is a sorted insertion by target.
	 * @param neigh The new edge to add.
	 */
	add_game(game: Game): void {
		this.add_edge(game.get_white(), game.get_black(), game.get_result());
	}

	add_edge(W: string, B: string, result: GameResult): void {
		const edge = new Edge(B, EdgeMetadata.from_result(result));
		this.add_edge_raw(W, edge);
	}

	add_edge_raw(W: string, edge: Edge): void {
		let white_idx = this.user_to_index.get(W);
		if (white_idx == undefined) {
			white_idx = this.max_user_idx;
			this.push_user(W);
			this.adjacency_list.push([]);
		}

		let W_list = this.adjacency_list[white_idx];

		const [edge_idx, exists]: [number, boolean] = where_should_be_inserted_by_key(
			W_list,
			edge.neighbor,
			function (s: string, t: string): number {
				return s.localeCompare(t);
			},
			function (a: Edge) {
				return a.neighbor;
			}
		);

		if (exists) {
			W_list[edge_idx].merge(edge);
		} else {
			W_list.splice(edge_idx, 0, edge);
		}
	}

	get_data(W: string, B: string): EdgeMetadata | undefined {
		const W_idx = this.user_to_index.get(W);
		if (W_idx == undefined) {
			return undefined;
		}

		const W_list = this.adjacency_list[W_idx];
		const B_idx = search_by_key(
			W_list,
			B,
			function (a: string, b: string) {
				return a.localeCompare(b);
			},
			function (a: Edge) {
				return a.neighbor;
			}
		);
		return B_idx == -1 ? undefined : W_list[B_idx].metadata;
	}

	get_degree(u: string): number {
		const u_idx = this.user_to_index.get(u);
		if (u_idx == undefined) {
			return -1;
		}
		return this.adjacency_list[u_idx].length;
	}

	get_edges(u: string): Edge[] | undefined {
		const u_idx = this.user_to_index.get(u);
		if (u_idx == undefined) {
			return undefined;
		}
		return this.adjacency_list[u_idx];
	}

	get_oponents(u: string): string[] | undefined {
		const u_idx = this.user_to_index.get(u);
		if (u_idx == undefined) {
			return undefined;
		}
		return this.adjacency_list[u_idx].map((e: Edge): string => {
			return e.neighbor;
		});
	}
}

/**
 * @brief Parses a JSON string or object and returns a Graph.
 * @param json A string with data of a Graph.
 * @returns A new Graph object.
 * @pre If @e json is a string, then it cannot start with '['.
 */
export function graph_from_json(json: any): Graph {
	if (typeof json === 'string') {
		const json_parse = JSON.parse(json);
		return graph_from_json(json_parse);
	}

	const user_to_index = json.user_to_index;
	let index_to_user: string[] = new Array(user_to_index.length);
	for (const [key, value] of user_to_index) {
		index_to_user[value] = key;
	}

	let G = new Graph();
	const adj = json['adjacency_list'];
	for (let i = 0; i < adj.length; ++i) {
		const W = index_to_user[i];
		for (let j = 0; j < adj[i].length; ++j) {
			const edge = edge_from_json(adj[i][j]);
			G.add_edge_raw(W, edge);
		}
	}

	return G;
}
