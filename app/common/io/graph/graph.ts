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

import Debug from 'debug';
const debug = Debug('ELOCHESSTRACKER:io');

import fs from 'fs';
import path from 'path';

import { Neighborhood, Graph } from '@common/models/graph/graph';
import { edgeArrayFromString } from '@common/io/graph/edge';
import { readDirectory } from '@app/server/utils/read-directory';
import { isNotDefined } from '@common/utils/is-defined';
import { logNow } from '@common/utils/time';
import { PlayerPrivateId, toPlayerPrivateId } from '@common/models/player';

/**
 * @brief Save a portion of the graph from a file.
 *
 * The file represents the opponents of a specific user @e username when said
 * user plays as White.
 * @param dir Directory.
 * @param username The actual filename.
 * @param edges The information to save.
 */
export function neighborhoodToFile(dir: string, username: PlayerPrivateId, edges: Neighborhood): void {
	const filename = path.join(dir, username);
	fs.writeFileSync(filename, JSON.stringify(edges, null, 4));
}

/**
 * @brief Save portions of a graph into distinct files.
 *
 * This function only saves a portion of the graph, that is, the portions
 * corresponding to those users for which there has been a change. Each file
 * created or updated corresponds to a specific user of the server.
 *
 * If the portion to be saved is empty, the file is deleted.
 * @param dir The directory where to save the graph.
 * @param changes The users for which their portion graph is to be saved.
 * @param g The graph to be saved.
 */
export function graphToFile(dir: string, changes: PlayerPrivateId[], g: Graph): void {
	for (const username of changes) {
		if (g.getOutDegree(username) > 0) {
			const out = g.getOutgoingEdges(username);
			if (isNotDefined(out)) {
				debug(logNow(), `Could not get niehgbors of user '${username}'`);
				continue;
			}
			neighborhoodToFile(dir, username, out);
		} else {
			const filename = path.join(dir, username);
			fs.rmSync(filename);
		}
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
export function graphFullToFile(dir: string, g: Graph): void {
	for (const username of g.getOutEntries()) {
		const out = g.getOutgoingEdges(username);
		if (isNotDefined(out)) {
			debug(logNow(), `Could not get niehgbors of user '${username}'`);
			continue;
		}
		neighborhoodToFile(dir, username, out);
	}
}

/**
 * @brief Parses the files in the given directory and returns a Graph.
 * @param dir The directory where to read the graph from.
 * @returns A new Graph object.
 */
export function graphFromString(dir: string): Graph | null {
	let g = new Graph();

	const files = readDirectory(dir, false);
	if (!fs.existsSync(dir)) {
		debug(logNow(), `Path '${dir}' does not exist.`);
		return null;
	}

	for (const username of files) {
		const filename = path.join(dir, username);

		if (!fs.existsSync(filename)) {
			debug(logNow(), `Path '${filename}' does not exist.`);
			return null;
		}
		const edgeArray = fs.readFileSync(filename, 'utf8');
		const edgeSet = edgeArrayFromString(edgeArray);
		if (isNotDefined(edgeSet)) {
			debug(logNow(), `Could not read edge set at file '${filename}'.`);
			return null;
		}

		const usernameId = toPlayerPrivateId(username);
		for (const edge of edgeSet) {
			g.addEdgeRaw(usernameId, edge.neighbor, edge);
		}
	}

	return g;
}
