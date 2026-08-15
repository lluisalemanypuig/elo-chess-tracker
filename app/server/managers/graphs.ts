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
const debug = Debug('ELO_CHESS_TRACKER:managers/graphs');

import { isNotDefined } from '@common/utils/is-defined';
import { graphFullToFile, graphToFile } from '@common/io/graph/graph';
import { GameResult } from '@common/models/game';
import { Graph } from '@common/models/graph/graph';
import { TimeControlId } from '@common/models/time-control';
import { EnvironmentManager } from '@server/managers/environment-manager';
import { GamesIterator } from '@server/managers/games-iterator';
import { GraphsManager } from '@server/managers/graphs-manager';
import { RatingSystemManager } from '@server/managers/rating-system-manager';
import { PlayerPrivateId } from '@common/models/player';
import { User } from '@common/models/user';
import { logNow } from '@common/utils/time';

export function graphUpdate(w: PlayerPrivateId, b: PlayerPrivateId, result: GameResult, id: TimeControlId) {
	let manager = GraphsManager.getInstance();
	let g = manager.getGraph(id);
	if (isNotDefined(g)) {
		throw new Error(`Graph of time control id '${id}' does not exist.`);
	}
	g.addEdge(w, b, result);

	const graphsDir = EnvironmentManager.getInstance().getDirGraphsTimeControl(id);
	graphToFile(graphsDir, [w], g);
}

export function graphModifyEdge(
	w: PlayerPrivateId,
	b: PlayerPrivateId,
	oldRes: GameResult,
	newRes: GameResult,
	id: TimeControlId
) {
	let manager = GraphsManager.getInstance();
	let g = manager.getGraph(id);
	if (isNotDefined(g)) {
		throw new Error(`Graph of time control id '${id}' does not exist.`);
	}
	g.changeGameResult(w, b, oldRes, newRes);

	const graphsDir = EnvironmentManager.getInstance().getDirGraphsTimeControl(id);
	graphToFile(graphsDir, [w], g);
}

export function graphDeleteEdge(w: PlayerPrivateId, b: PlayerPrivateId, result: GameResult, id: TimeControlId) {
	let manager = GraphsManager.getInstance();
	let g = manager.getGraph(id);
	if (isNotDefined(g)) {
		throw new Error(`Graph of time control id '${id}' does not exist.`);
	}
	g.deleteEdge(w, b, result);

	const graphsDir = EnvironmentManager.getInstance().getDirGraphsTimeControl(id);
	graphToFile(graphsDir, [w], g);
}

export function recalculateAllGraphs(user: User) {
	if (!user.is('ADMIN')) {
		debug(logNow(), `User '${user.username}' cannot recalculate graphs.`);
		throw new Error('You cannot recalculate the graphs.');
	}

	let manager = GraphsManager.getInstance();
	manager.clear();

	const uniqueTimeControls = RatingSystemManager.getInstance().getUniqueTimeControlsIds();
	for (const timeControlId of uniqueTimeControls) {
		const gamesDir = EnvironmentManager.getInstance().getDirGamesTimeControl(timeControlId);
		let g = new Graph();
		let iter = new GamesIterator(gamesDir);
		while (!iter.endRecordList()) {
			const game = iter.getCurrentGame();
			g.addEdge(game.white, game.black, game.result);
			iter.nextGame();
		}
		manager.addGraph(timeControlId, g);

		const graphsDir = EnvironmentManager.getInstance().getDirGraphsTimeControl(timeControlId);
		graphFullToFile(graphsDir, g);
	}
}
