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

import { graph_to_file } from '../io/graph/graph';
import { GameResult } from '../models/game';
import { Graph } from '../models/graph/graph';
import { TimeControlID } from '../models/time_control';
import { EnvironmentManager } from './environment_manager';
import { GraphsManager } from './graphs_manager';

export function graph_update(w: string, b: string, result: GameResult, id: TimeControlID): void {
	let manager = GraphsManager.get_instance();
	let _g = manager.get_graph(id);
	if (_g == undefined) {
		throw new Error(`Graph of time control id '${id}' does not exist.`);
	}
	let g = _g as Graph;
	g.add_edge(w, b, result);

	const graphs_dir = EnvironmentManager.get_instance().get_dir_graphs_time_control(id);
	graph_to_file(graphs_dir, [w], g);
}

export function graph_modify_edge(
	w: string,
	b: string,
	old_res: GameResult,
	new_res: GameResult,
	id: TimeControlID
): void {
	let manager = GraphsManager.get_instance();
	let _g = manager.get_graph(id);
	if (_g == undefined) {
		throw new Error(`Graph of time control id '${id}' does not exist.`);
	}
	let g = _g as Graph;
	g.change_game_result(w, b, old_res, new_res);

	const graphs_dir = EnvironmentManager.get_instance().get_dir_graphs_time_control(id);
	graph_to_file(graphs_dir, [w], g);
}
