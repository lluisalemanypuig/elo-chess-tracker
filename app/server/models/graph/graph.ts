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

import { GameResult, oppositeResult } from '@common/models/game-result';
import { PlayerPrivateId } from '@common/models/player-id';
import { isDefined, isNotDefined } from '@common/utils/is-defined';
import { InternalError } from '@server/models/error-types/internal-error';
import { Edge, EdgeSchema } from '@server/models/graph/edge';
import { EdgeMetadata } from '@server/models/graph/edge-metadata';
import {
	searchByKey,
	whereShouldBeInsertedByKey,
} from '@server/utils/searching';
import { z } from 'zod';

export const NeighborhoodSchema = z.array(EdgeSchema);

export const GraphSchema = z
	.object({
		adjacencyList: z.map(z.string(), NeighborhoodSchema),
		inAdjacencyList: z.map(z.string(), NeighborhoodSchema),
	})
	.strict();

export type Neighborhood = Edge[];

/**
 * @brief Graph abstraction for games between users.
 */
export class Graph {
	// The set of edges from a user A to all other users B against whom
	// A played as White. That is, edges of the form (A, B) where A is the
	// white player, and B is the black player.
	private adjacencyList: Map<PlayerPrivateId, Neighborhood> = new Map();
	// The set of edges from a user A to all other users B against whom
	// A played as Black. That is, edges of the form (A, B) where A is the
	// white player, and B is the black player.
	private inAdjacencyList: Map<PlayerPrivateId, Neighborhood> = new Map();

	// An iterator to the list of users who played as White.
	getOutEntries(): MapIterator<PlayerPrivateId> {
		return this.adjacencyList.keys();
	}
	// An iterator to the list of users who played as Black.
	getInEntries(): MapIterator<PlayerPrivateId> {
		return this.inAdjacencyList.keys();
	}

	private static insertIntoList(
		_u: PlayerPrivateId,
		v: PlayerPrivateId,
		edge: Edge,
		nU: Neighborhood,
	) {
		const [edgeIdx, exists]: [number, boolean] = whereShouldBeInsertedByKey(
			nU,
			(e: Edge): number => {
				return v.localeCompare(e.neighbor);
			},
		);
		if (exists) {
			nU[edgeIdx].merge(edge);
		} else {
			nU.splice(edgeIdx, 0, edge);
		}
	}
	/**
	 * @brief Add an edge between White @e w and Black @e b, with result.
	 * @param w White player
	 * @param b Black player
	 * @param result Result of the player
	 */
	addEdge(w: PlayerPrivateId, b: PlayerPrivateId, result: GameResult) {
		// insert into w's outgoing edges list
		let wOutList = this.adjacencyList.get(w);
		if (isNotDefined(wOutList)) {
			this.adjacencyList.set(w, []);
			wOutList = this.adjacencyList.get(w);
		}
		const wEdge = new Edge(b, EdgeMetadata.fromResult(result));
		Graph.insertIntoList(w, b, wEdge, wOutList as Neighborhood);

		// insert into b's ingoing edges list
		let bInList = this.inAdjacencyList.get(b);
		if (isNotDefined(bInList)) {
			this.inAdjacencyList.set(b, []);
			bInList = this.inAdjacencyList.get(b);
		}
		const bEdge = new Edge(w, EdgeMetadata.fromResult(oppositeResult(result)));
		Graph.insertIntoList(b, w, bEdge, bInList as Neighborhood);
	}
	/**
	 * @brief Add an edge between White @e w and Black @e b, with result.
	 * @param w White player
	 * @param b Black player
	 * @param result Result of the player
	 */
	addEdgeRaw(w: PlayerPrivateId, b: PlayerPrivateId, wEdge: Edge) {
		// insert into w's outgoing edges list
		let wOutList = this.adjacencyList.get(w);
		if (isNotDefined(wOutList)) {
			this.adjacencyList.set(w, []);
			wOutList = this.adjacencyList.get(w);
		}
		Graph.insertIntoList(w, b, wEdge, wOutList as Neighborhood);

		// insert into b's ingoing edges list
		let bInList = this.inAdjacencyList.get(b);
		if (isNotDefined(bInList)) {
			this.inAdjacencyList.set(b, []);
			bInList = this.inAdjacencyList.get(b);
		}

		const em = wEdge.metadata.clone().reverse();
		const bEdge = new Edge(w, em);
		Graph.insertIntoList(b, w, bEdge, bInList as Neighborhood);
	}

	private static deleteFromList(
		_u: PlayerPrivateId,
		v: PlayerPrivateId,
		result: GameResult,
		nU: Neighborhood,
	) {
		const index = searchByKey(nU, (e: Edge): number =>
			v.localeCompare(e.neighbor),
		);
		nU[index].metadata.decrease(result);
		if (nU[index].metadata.allZero()) {
			nU.splice(index, 1);
		}
	}
	/**
	 * @brief Deletes the result of a game from the graph.
	 *
	 * If the metadata of the corresponding edges goes down to zero, the corresponding
	 * edges are deleted entirely from the graph.
	 * @param w White player
	 * @param b Black player
	 * @param result Result of the game.
	 */
	deleteEdge(w: PlayerPrivateId, b: PlayerPrivateId, result: GameResult) {
		// delete from w's outgoing edges list
		let wOutList = this.adjacencyList.get(w);
		if (isNotDefined(wOutList)) {
			throw new InternalError(
				`Player '${w}' does not have any outgoing edge, and so no edge to '${b}'.`,
			);
		}
		Graph.deleteFromList(w, b, result, wOutList);
		if (wOutList.length === 0) {
			this.adjacencyList.delete(w);
		}

		// delete from b's ingoing edges list
		let bInList = this.inAdjacencyList.get(b);
		if (isNotDefined(bInList)) {
			throw new InternalError(
				`Player '${b}' does not have any ingoing edge, and so no edge from '${w}'.`,
			);
		}
		Graph.deleteFromList(b, w, oppositeResult(result), bInList);
		if (bInList.length === 0) {
			this.inAdjacencyList.delete(b);
		}
	}

	/**
	 * @brief The weight of edge (u,v) when 'u' plays as white.
	 * @param u White player.
	 * @param v Black player.
	 * @returns The summary of the games between @e u and @e v when @e u plays
	 * as white.
	 */
	getDataAsWhite(
		u: PlayerPrivateId,
		v: PlayerPrivateId,
	): EdgeMetadata | undefined {
		const wList = this.adjacencyList.get(u);
		if (isNotDefined(wList)) {
			return undefined;
		}

		const bIdx = searchByKey(wList, function (e: Edge): number {
			return v.localeCompare(e.neighbor);
		});
		return bIdx === -1 ? undefined : wList[bIdx].metadata;
	}
	/**
	 * @brief The weight of edge (u,v) when 'u' plays as black.
	 * @param u Black player.
	 * @param v White player.
	 * @returns The summary of the games between @e u and @e v when @e u plays
	 * as black.
	 */
	getDataAsBlack(
		u: PlayerPrivateId,
		v: PlayerPrivateId,
	): EdgeMetadata | undefined {
		const uList = this.inAdjacencyList.get(u);
		if (isNotDefined(uList)) {
			return undefined;
		}

		const vIdx = searchByKey(uList, function (e: Edge): number {
			return v.localeCompare(e.neighbor);
		});
		return vIdx === -1 ? undefined : uList[vIdx].metadata;
	}

	private changeGameResultList(
		u: PlayerPrivateId,
		v: PlayerPrivateId,
		oldRes: GameResult,
		newRes: GameResult,
		NU: Neighborhood,
	) {
		const bIdx = searchByKey(NU, function (e: Edge): number {
			return v.localeCompare(e.neighbor);
		});
		if (bIdx === -1) {
			throw new InternalError(`The edge from '${u}' to '${v}' does not exist.`);
		}

		if (oldRes === 'white_wins') {
			--NU[bIdx].metadata.numGamesWon;
		} else if (oldRes === 'draw') {
			--NU[bIdx].metadata.numGamesDrawn;
		} else {
			--NU[bIdx].metadata.numGamesLost;
		}

		if (newRes === 'white_wins') {
			++NU[bIdx].metadata.numGamesWon;
		} else if (newRes === 'draw') {
			++NU[bIdx].metadata.numGamesDrawn;
		} else {
			++NU[bIdx].metadata.numGamesLost;
		}
	}
	/**
	 * @brief Change the result of a game between @e w and @e b.
	 *
	 * There is no need to specify the game since the results are all aggregated,
	 * and the change only affects the aggregated data.
	 * @param w White player.
	 * @param b Black player.
	 * @param oldRes Original result of the game.
	 * @param newRes New result of the game.
	 * @pre @e oldRes !== @e newResult.
	 */
	changeGameResult(
		w: PlayerPrivateId,
		b: PlayerPrivateId,
		oldRes: GameResult,
		newRes: GameResult,
	) {
		const wList = this.adjacencyList.get(w);
		if (isDefined(wList)) {
			this.changeGameResultList(w, b, oldRes, newRes, wList);
		}

		const bList = this.inAdjacencyList.get(b);
		if (isDefined(bList)) {
			this.changeGameResultList(
				b,
				w,
				oppositeResult(oldRes),
				oppositeResult(newRes),
				bList,
			);
		}
	}

	/**
	 * @brief Number of opponents of @e u as white.
	 * @param u Player as white.
	 * @returns The number of opponents of @e u over games where @e u plays as
	 * White.
	 */
	getOutDegree(u: PlayerPrivateId): number {
		const uList = this.adjacencyList.get(u);
		if (isNotDefined(uList)) {
			return 0;
		}
		return uList.length;
	}
	// Returns the list of opponents and the metadata of @e u.
	getOutgoingEdges(u: PlayerPrivateId): Neighborhood | undefined {
		return this.adjacencyList.get(u);
	}

	/**
	 * @brief Number of opponents of @e u as white.
	 * @param u Player as white.
	 * @returns The number of opponents of @e u over games where @e u plays as
	 * White.
	 */
	getInDegree(u: PlayerPrivateId): number {
		const uList = this.inAdjacencyList.get(u);
		if (isNotDefined(uList)) {
			return 0;
		}
		return (uList as Neighborhood).length;
	}
	// Returns the list of opponents and the metadata of @e u.
	getIncomingEdges(u: PlayerPrivateId): Neighborhood | undefined {
		return this.inAdjacencyList.get(u);
	}

	// Returns the list of Black opponents of @e u.
	getBlackOpponents(u: PlayerPrivateId): PlayerPrivateId[] {
		const uList = this.adjacencyList.get(u);
		if (isNotDefined(uList)) {
			return [];
		}
		return uList.map((e: Edge): PlayerPrivateId => {
			return e.neighbor;
		});
	}

	// Returns the list of White opponents of @e u.
	getWhiteOpponents(u: PlayerPrivateId): PlayerPrivateId[] {
		const uList = this.inAdjacencyList.get(u);
		if (isNotDefined(uList)) {
			return [];
		}
		return uList.map((e: Edge): PlayerPrivateId => {
			return e.neighbor;
		});
	}
}
