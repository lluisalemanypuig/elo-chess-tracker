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
import { search_by_key, where_should_be_inserted_by_key } from '../utils/searching';
import { Game, GameResult } from './game';

/**
 * @brief Metadata of an edge.
 *
 * Recall that an edge from a player A to another player B is an abstraction
 * in which A plays as White against B who plays as Black.
 */
export class EdgeMetadata {
	/// The number of games in which A beats B.
	public num_games_won: number = 0;
	/// The number of games in which A draws against B.
	public num_games_drawn: number = 0;
	/// The number of games in which B beats A.
	public num_games_lost: number = 0;

	constructor(num_games_won: number, num_games_drawn: number, num_games_lost: number) {
		this.num_games_won = num_games_won;
		this.num_games_drawn = num_games_drawn;
		this.num_games_lost = num_games_lost;
	}

	merge(other: EdgeMetadata): void {
		this.num_games_won += other.num_games_won;
		this.num_games_drawn += other.num_games_drawn;
		this.num_games_lost += other.num_games_lost;
	}

	static from_result(result: GameResult): EdgeMetadata {
		return new EdgeMetadata(
			result == 'white_wins' ? 1 : 0,
			result == 'draw' ? 1 : 0,
			result == 'black_wins' ? 1 : 0
		);
	}

	static empty(): EdgeMetadata {
		return new EdgeMetadata(0, 0, 0);
	}
}

/**
 * @brief Parses a JSON string or object and returns an Edge.
 * @param json A string with data of an Edge.
 * @returns A new Edge object.
 * @pre If @e json is a string, then it cannot start with '['.
 */
export function edge_metadata_from_json(json: any): EdgeMetadata {
	if (typeof json === 'string') {
		let json_parse = JSON.parse(json);
		return edge_metadata_from_json(json_parse);
	}

	return new EdgeMetadata(json['num_games_won'], json['num_games_drawn'], json['num_games_lost']);
}

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
		let json_parse = JSON.parse(json);
		return edge_from_json(json_parse);
	}

	return new Edge(json['neighbor'], edge_metadata_from_json(json['metadata']));
}

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
		let json_parse = JSON.parse(json);
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
