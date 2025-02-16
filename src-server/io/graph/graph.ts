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

import fs from 'fs';
import path from 'path';

import { Neighborhood } from '../../models/graph/graph';
import { Graph } from '../../models/graph/graph';
import { edge_set_from_json } from './edge';

/**
 * @brief Save a portion of the graph from a file.
 *
 * The file represents the opponents of a specific user @e username when said
 * user plays as White.
 * @param dir Directory.
 * @param username The actual filename.
 * @param edges The information to save.
 */
export function neighborhood_to_file(dir: string, username: string, edges: Neighborhood): void {
	const filename = path.join(dir, username);
	fs.writeFileSync(filename, JSON.stringify(edges, null, 4));
}

/**
 * @brief Save portions of a graph into distinct files.
 *
 * This function only saves a portion of the graph, that is, the portions
 * corresponding to those users for which there has been a change. Each file
 * created or updated corresponds to a specific user of the server.
 * @param dir The directory where to save the graph.
 * @param changes The users for which their portion graph is to be saved.
 * @param g The graph to be saved.
 */
export function graph_to_file(dir: string, changes: string[], g: Graph): void {
	for (const username of changes) {
		neighborhood_to_file(dir, username, g.get_outgoing_edges(username) as Neighborhood);
	}
}

/**
 * @brief Save a whole graph into distinct files.
 *
 * This saves the whole graph into several files. Each file corresponds to a
 * specific user of the server.
 * @param dir The directory where to save the graph.
 * @param g The graph to be saved.
 */
export function graph_full_to_file(dir: string, g: Graph): void {
	for (const username of g.get_out_entries()) {
		neighborhood_to_file(dir, username, g.get_outgoing_edges(username) as Neighborhood);
	}
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
			g.add_edge_raw(username, edge_set[i].neighbor, edge_set[i]);
		}
	}

	return g;
}
