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

import { Graph } from '@common/models/graph/graph';
import { TimeControlId } from '@common/models/time-control';
import { searchLinearByKey } from '@server/utils/searching';

/**
 * @brief Graphs Manager singleton class
 *
 * This class stores in memory a graph for every time control id in the server
 * (@ref graphList).
 */
export class GraphsManager {
	private static instance: GraphsManager;

	constructor() {
		if (GraphsManager.instance) {
			return GraphsManager.instance;
		}
		GraphsManager.instance = this;
	}

	static getInstance(): GraphsManager {
		GraphsManager.instance = GraphsManager.instance || new GraphsManager();
		return GraphsManager.instance;
	}

	private graphList: [TimeControlId, Graph][] = [];

	clear(): void {
		this.graphList = [];
	}

	addGraph(id: TimeControlId, g: Graph): void {
		const idx = searchLinearByKey(this.graphList, (pair: [TimeControlId, Graph]): boolean => {
			return pair[0] === id;
		});
		if (idx === -1) {
			this.graphList.push([id, g]);
		}
	}

	getGraph(id: TimeControlId): Graph | undefined {
		const idx = searchLinearByKey(this.graphList, (pair: [TimeControlId, Graph]): boolean => {
			return pair[0] === id;
		});
		return idx !== -1 ? this.graphList[idx][1] : undefined;
	}
}
