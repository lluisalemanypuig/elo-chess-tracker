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

import { Graph } from '../models/graph/graph';
import { TimeControlID } from '../models/time_control';
import { search_linear_by_key } from '../utils/searching';

/**
 * @brief Graphs Manager singleton class
 *
 * This class stores in memory a graph for every time control id in the server
 * (@ref graph_list).
 */
export class GraphsManager {
	private static instance: GraphsManager;

	constructor() {
		if (GraphsManager.instance) {
			return GraphsManager.instance;
		}
		GraphsManager.instance = this;
	}

	static get_instance(): GraphsManager {
		GraphsManager.instance = GraphsManager.instance || new GraphsManager();
		return GraphsManager.instance;
	}

	private graph_list: [TimeControlID, Graph][] = [];

	clear(): void {
		this.graph_list = [];
	}

	add_graph(id: TimeControlID, g: Graph): void {
		const idx = search_linear_by_key(this.graph_list, (pair: [TimeControlID, Graph]): boolean => {
			return pair[0] == id;
		});
		if (idx == -1) {
			this.graph_list.push([id, g]);
		}
	}

	get_graph(id: TimeControlID): Graph | undefined {
		const idx = search_linear_by_key(this.graph_list, (pair: [TimeControlID, Graph]): boolean => {
			return pair[0] == id;
		});
		return idx != -1 ? this.graph_list[idx][1] : undefined;
	}
}
