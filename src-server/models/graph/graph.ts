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

import { EdgeMetadata } from './edge_metadata';
import { Edge } from './edge';
import { search_by_key, where_should_be_inserted_by_key } from '../../utils/searching';
import { GameResult, opposite_result } from '../game';

export type Neighborhood = Edge[];

/**
 * @brief Graph abstraction for games between users.
 */
export class Graph {
	/// The set of edges from a user A to all other users B against whom
	/// A played as White. That is, edges of the form (A, B) where A is the
	/// white player, and B is the black player.
	private adjacency_list: Map<string, Neighborhood> = new Map();
	/// The set of edges from a user A to all other users B against whom
	/// A played as Black. That is, edges of the form (A, B) where A is the
	/// white player, and B is the black player.
	private in_adjacency_list: Map<string, Neighborhood> = new Map();

	/// An iterator to the list of users who played as White.
	get_out_entries(): MapIterator<string> {
		return this.adjacency_list.keys();
	}
	/// An iterator to the list of users who played as Black.
	get_in_entries(): MapIterator<string> {
		return this.in_adjacency_list.keys();
	}

	private static insert_into_list(_u: string, v: string, edge: Edge, N_u: Neighborhood): void {
		const [edge_idx, exists]: [number, boolean] = where_should_be_inserted_by_key(
			N_u,
			v,
			function (e: Edge) {
				return e.neighbor;
			},
			function (s: string, t: string): number {
				return s.localeCompare(t);
			}
		);
		if (exists) {
			N_u[edge_idx].merge(edge);
		} else {
			N_u.splice(edge_idx, 0, edge);
		}
	}
	/**
	 * @brief Add an edge between White @e w and Black @e b, with result.
	 * @param w White player
	 * @param b Black player
	 * @param result Result of the player
	 */
	add_edge(w: string, b: string, result: GameResult): void {
		// insert into w's outgoing edges list
		let _w_out_list = this.adjacency_list.get(w);
		if (_w_out_list == undefined) {
			this.adjacency_list.set(w, []);
			_w_out_list = this.adjacency_list.get(w);
		}
		const w_edge = new Edge(b, EdgeMetadata.from_result(result));
		Graph.insert_into_list(w, b, w_edge, _w_out_list as Neighborhood);

		// insert into b's ingoing edges list
		let _b_in_list = this.in_adjacency_list.get(b);
		if (_b_in_list == undefined) {
			this.in_adjacency_list.set(b, []);
			_b_in_list = this.in_adjacency_list.get(b);
		}
		const b_edge = new Edge(w, EdgeMetadata.from_result(opposite_result(result)));
		Graph.insert_into_list(b, w, b_edge, _b_in_list as Neighborhood);
	}
	/**
	 * @brief Add an edge between White @e w and Black @e b, with result.
	 * @param w White player
	 * @param b Black player
	 * @param result Result of the player
	 */
	add_edge_raw(w: string, b: string, w_edge: Edge): void {
		// insert into w's outgoing edges list
		let _w_out_list = this.adjacency_list.get(w);
		if (_w_out_list == undefined) {
			this.adjacency_list.set(w, []);
			_w_out_list = this.adjacency_list.get(w);
		}
		Graph.insert_into_list(w, b, w_edge, _w_out_list as Neighborhood);

		// insert into b's ingoing edges list
		let _b_in_list = this.in_adjacency_list.get(b);
		if (_b_in_list == undefined) {
			this.in_adjacency_list.set(b, []);
			_b_in_list = this.in_adjacency_list.get(b);
		}

		let em = w_edge.metadata.clone();
		em.reverse();
		const b_edge = new Edge(w, em);
		Graph.insert_into_list(b, w, b_edge, _b_in_list as Neighborhood);
	}

	/**
	 * @brief The weight of edge (u,v) when 'u' plays as white.
	 * @param u White player.
	 * @param v Black player.
	 * @returns The summary of the games between @e u and @e v when @e u plays
	 * as white.
	 */
	get_data_as_white(u: string, v: string): EdgeMetadata | undefined {
		const _w_list = this.adjacency_list.get(u);
		if (_w_list == undefined) {
			return undefined;
		}

		const w_list = _w_list as Neighborhood;
		const b_idx = search_by_key(
			w_list,
			v,
			function (a: Edge) {
				return a.neighbor;
			},
			function (s: string, t: string): number {
				return s.localeCompare(t);
			}
		);
		return b_idx == -1 ? undefined : w_list[b_idx].metadata;
	}
	/**
	 * @brief The weight of edge (u,v) when 'u' plays as black.
	 * @param u Black player.
	 * @param v White player.
	 * @returns The summary of the games between @e u and @e v when @e u plays
	 * as black.
	 */
	get_data_as_black(u: string, v: string): EdgeMetadata | undefined {
		const _u_list = this.in_adjacency_list.get(u);
		if (_u_list == undefined) {
			return undefined;
		}

		const u_list = _u_list as Neighborhood;
		const v_idx = search_by_key(
			u_list,
			v,
			function (a: Edge) {
				return a.neighbor;
			},
			function (s: string, t: string): number {
				return s.localeCompare(t);
			}
		);
		return v_idx == -1 ? undefined : u_list[v_idx].metadata;
	}

	private change_game_result_list(
		u: string,
		v: string,
		old_res: GameResult,
		new_res: GameResult,
		N_u: Neighborhood
	): void {
		const b_idx = search_by_key(
			N_u,
			v,
			function (a: Edge) {
				return a.neighbor;
			},
			function (s: string, t: string): number {
				return s.localeCompare(t);
			}
		);
		if (b_idx == -1) {
			throw new Error(`The edge from '${u}' to '${v}' does not exist.`);
		}

		if (old_res == 'white_wins') {
			--N_u[b_idx].metadata.num_games_won;
		} else if (old_res == 'draw') {
			--N_u[b_idx].metadata.num_games_drawn;
		} else {
			--N_u[b_idx].metadata.num_games_lost;
		}

		if (new_res == 'white_wins') {
			++N_u[b_idx].metadata.num_games_won;
		} else if (new_res == 'draw') {
			++N_u[b_idx].metadata.num_games_drawn;
		} else {
			++N_u[b_idx].metadata.num_games_lost;
		}
	}
	/**
	 * @brief Change the result of a game between @e w and @e b.
	 *
	 * There is no need to specify the game since the results are all aggregated,
	 * and the change only affects the aggregated data.
	 * @param w White player.
	 * @param b Black player.
	 * @param old_res Original result of the game.
	 * @param new_res New result of the game.
	 * @pre @e old_res != @e new_result.
	 */
	change_game_result(w: string, b: string, old_res: GameResult, new_res: GameResult): void {
		const _w_list = this.adjacency_list.get(w);
		if (_w_list != undefined) {
			let w_list = _w_list as Neighborhood;
			this.change_game_result_list(w, b, old_res, new_res, w_list);
		}

		const _b_list = this.in_adjacency_list.get(b);
		if (_b_list != undefined) {
			let b_list = _b_list as Neighborhood;
			this.change_game_result_list(b, w, opposite_result(old_res), opposite_result(new_res), b_list);
		}
	}

	/**
	 * @brief Number of opponents of @e u as white.
	 * @param u Player as white.
	 * @returns The number of opponents of @e u over games where @e u plays as
	 * White.
	 */
	get_out_degree(u: string): number {
		const _u_list = this.adjacency_list.get(u);
		if (_u_list == undefined) {
			return 0;
		}
		return (_u_list as Neighborhood).length;
	}
	/// Returns the list of opponents and the metadata of @e u.
	get_outgoing_edges(u: string): Neighborhood | undefined {
		return this.adjacency_list.get(u);
	}

	/**
	 * @brief Number of opponents of @e u as white.
	 * @param u Player as white.
	 * @returns The number of opponents of @e u over games where @e u plays as
	 * White.
	 */
	get_in_degree(u: string): number {
		const _u_list = this.in_adjacency_list.get(u);
		if (_u_list == undefined) {
			return 0;
		}
		return (_u_list as Neighborhood).length;
	}
	/// Returns the list of opponents and the metadata of @e u.
	get_ingoing_edges(u: string): Neighborhood | undefined {
		return this.in_adjacency_list.get(u);
	}

	/// Returns the list of Black opponents of @e u.
	get_black_opponents(u: string): string[] {
		const _u_list = this.adjacency_list.get(u);
		if (_u_list == undefined) {
			return [];
		}
		const u_list = _u_list as Neighborhood;
		return u_list.map((e: Edge): string => {
			return e.neighbor;
		});
	}

	/// Returns the list of White opponents of @e u.
	get_white_opponents(u: string): string[] {
		const _u_list = this.in_adjacency_list.get(u);
		if (_u_list == undefined) {
			return [];
		}
		const u_list = _u_list as Neighborhood;
		return u_list.map((e: Edge): string => {
			return e.neighbor;
		});
	}
}
