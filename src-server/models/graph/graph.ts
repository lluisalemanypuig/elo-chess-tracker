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

import path from 'path';
import fs from 'fs';

import { EdgeMetadata } from './edge_metadata';
import { Edge, edge_set_from_json } from './edge';
import { search_by_key, where_should_be_inserted_by_key } from '../../utils/searching';
import { GameResult } from '../game';

export type Neighborhood = Edge[];

/**
 * @brief Graph abstraction for games between pairs of users.
 */
export class Graph {
	/// This is used to locate the games for any user A
	private adjacency_list: Map<string, Neighborhood> = new Map();

	/// Add a new user to the graph.
	private push_user(user: string): void {
		this.adjacency_list.set(user, []);
	}

	get_entries(): MapIterator<string> {
		return this.adjacency_list.keys();
	}

	add_edge(W: string, B: string, result: GameResult): void {
		const edge = new Edge(B, EdgeMetadata.from_result(result));
		this.add_edge_raw(W, edge);
	}

	add_edge_raw(W: string, edge: Edge): void {
		let _W_list = this.adjacency_list.get(W);
		if (_W_list == undefined) {
			this.push_user(W);
			_W_list = this.adjacency_list.get(W);
		}

		let W_list = _W_list as Neighborhood;

		const [edge_idx, exists]: [number, boolean] = where_should_be_inserted_by_key(
			W_list,
			edge.neighbor,
			function (a: Edge) {
				return a.neighbor;
			},
			function (s: string, t: string): number {
				return s.localeCompare(t);
			}
		);

		if (exists) {
			W_list[edge_idx].merge(edge);
		} else {
			W_list.splice(edge_idx, 0, edge);
		}
	}

	get_data(W: string, B: string): EdgeMetadata | undefined {
		const _W_list = this.adjacency_list.get(W);
		if (_W_list == undefined) {
			return undefined;
		}

		const W_list = _W_list as Neighborhood;
		const B_idx = search_by_key(
			W_list,
			B,
			function (a: Edge) {
				return a.neighbor;
			},
			function (s: string, t: string): number {
				return s.localeCompare(t);
			}
		);
		return B_idx == -1 ? undefined : W_list[B_idx].metadata;
	}

	change_game_result(W: string, B: string, old_res: GameResult, new_res: GameResult): void {
		const _W_list = this.adjacency_list.get(W);
		if (_W_list == undefined) {
			return undefined;
		}

		let W_list = _W_list as Neighborhood;
		const B_idx = search_by_key(
			W_list,
			B,
			function (a: Edge) {
				return a.neighbor;
			},
			function (s: string, t: string): number {
				return s.localeCompare(t);
			}
		);
		if (B_idx == -1) {
			throw new Error(`The edge from '${W}' to '${B}' does not exist.`);
		}

		if (old_res == 'white_wins') {
			--W_list[B_idx].metadata.num_games_won;
		} else if (old_res == 'draw') {
			--W_list[B_idx].metadata.num_games_drawn;
		} else {
			--W_list[B_idx].metadata.num_games_lost;
		}

		if (new_res == 'white_wins') {
			++W_list[B_idx].metadata.num_games_won;
		} else if (new_res == 'draw') {
			++W_list[B_idx].metadata.num_games_drawn;
		} else {
			++W_list[B_idx].metadata.num_games_lost;
		}
	}

	get_degree(u: string): number {
		const _u_list = this.adjacency_list.get(u);
		if (_u_list == undefined) {
			return -1;
		}
		return (_u_list as Neighborhood).length;
	}

	get_outgoing_edges(u: string): Neighborhood | undefined {
		return this.adjacency_list.get(u);
	}

	get_oponents(u: string): string[] | undefined {
		const _u_list = this.adjacency_list.get(u);
		if (_u_list == undefined) {
			return undefined;
		}
		const u_list = _u_list as Neighborhood;
		return u_list.map((e: Edge): string => {
			return e.neighbor;
		});
	}
}

export function neighborhood_to_file(dir: string, username: string, edges: Neighborhood): void {
	const filename = path.join(dir, username);
	fs.writeFileSync(filename, JSON.stringify(edges, null, 4));
}

export function graph_to_file(dir: string, changes: string[], g: Graph): void {
	for (const username of changes) {
		neighborhood_to_file(dir, username, g.get_outgoing_edges(username) as Neighborhood);
	}
}

export function graph_full_to_file(dir: string, g: Graph): void {
	graph_to_file(dir, Array.from(g.get_entries()), g);
}

/**
 * @brief Parses a JSON string or object and returns a Graph.
 * @param dir The directory where to read the graph from.
 * @returns A new Graph object.
 * @pre If @e json is a string, then it cannot start with '['.
 */
export function graph_from_json(dir: string): Graph {
	let g = new Graph();

	const files = fs.readdirSync(dir);
	for (let i = 0; i < files.length; ++i) {
		const username = files[i] as string;

		const filename = path.join(dir, username);
		const edge_set = edge_set_from_json(fs.readFileSync(filename, 'utf8'));

		for (let i = 0; i < edge_set.length; ++i) {
			g.add_edge_raw(username, edge_set[i]);
		}
	}

	return g;
}
