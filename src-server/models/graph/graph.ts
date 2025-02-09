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
import { GameResult } from '../game';

export type Neighborhood = Edge[];

/**
 * @brief Graph abstraction for games between users.
 */
export class Graph {
	/// This is used to locate the games for any user A
	private adjacency_list: Map<string, Neighborhood> = new Map();

	/// Add a new user to the graph.
	private push_user(user: string): void {
		this.adjacency_list.set(user, []);
	}

	/// An iterator to the list of users who played as White.
	get_entries(): MapIterator<string> {
		return this.adjacency_list.keys();
	}

	/**
	 * @brief Add an edge between White @e w and Black @e b, with result.
	 * @param w White player
	 * @param b Black player
	 * @param result Result of the player
	 */
	add_edge(w: string, b: string, result: GameResult): void {
		const edge = new Edge(b, EdgeMetadata.from_result(result));
		this.add_edge_raw(w, edge);
	}

	/**
	 * @brief Add an edge @ref edge outgoing from White @e w.
	 * @param w White player.
	 * @param edge The edge outgoing from @e w towards another player.
	 */
	add_edge_raw(w: string, edge: Edge): void {
		let _w_list = this.adjacency_list.get(w);
		if (_w_list == undefined) {
			this.push_user(w);
			_w_list = this.adjacency_list.get(w);
		}

		let w_list = _w_list as Neighborhood;

		const [edge_idx, exists]: [number, boolean] = where_should_be_inserted_by_key(
			w_list,
			edge.neighbor,
			function (a: Edge) {
				return a.neighbor;
			},
			function (s: string, t: string): number {
				return s.localeCompare(t);
			}
		);

		if (exists) {
			w_list[edge_idx].merge(edge);
		} else {
			w_list.splice(edge_idx, 0, edge);
		}
	}

	/**
	 * @brief The weight of edge (w,b).
	 * @param w White player.
	 * @param b Black player.
	 * @returns The summary of all games between @e w and @e b.
	 */
	get_data(w: string, b: string): EdgeMetadata | undefined {
		const _w_list = this.adjacency_list.get(w);
		if (_w_list == undefined) {
			return undefined;
		}

		const w_list = _w_list as Neighborhood;
		const b_idx = search_by_key(
			w_list,
			b,
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
		if (_w_list == undefined) {
			return undefined;
		}

		let w_list = _w_list as Neighborhood;
		const b_idx = search_by_key(
			w_list,
			b,
			function (a: Edge) {
				return a.neighbor;
			},
			function (s: string, t: string): number {
				return s.localeCompare(t);
			}
		);
		if (b_idx == -1) {
			throw new Error(`The edge from '${w}' to '${b}' does not exist.`);
		}

		if (old_res == 'white_wins') {
			--w_list[b_idx].metadata.num_games_won;
		} else if (old_res == 'draw') {
			--w_list[b_idx].metadata.num_games_drawn;
		} else {
			--w_list[b_idx].metadata.num_games_lost;
		}

		if (new_res == 'white_wins') {
			++w_list[b_idx].metadata.num_games_won;
		} else if (new_res == 'draw') {
			++w_list[b_idx].metadata.num_games_drawn;
		} else {
			++w_list[b_idx].metadata.num_games_lost;
		}
	}

	/**
	 * @brief Number of opponents of @e u as white.
	 * @param u Player as white.
	 * @returns The number of opponents of @e u over games where @e u plays as
	 * White.
	 */
	get_degree(u: string): number {
		const _u_list = this.adjacency_list.get(u);
		if (_u_list == undefined) {
			return -1;
		}
		return (_u_list as Neighborhood).length;
	}

	/// Returns the list of opponents and the metadata of @e u.
	get_outgoing_edges(u: string): Neighborhood | undefined {
		return this.adjacency_list.get(u);
	}

	/// Returns the list of opponents of @e u.
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
