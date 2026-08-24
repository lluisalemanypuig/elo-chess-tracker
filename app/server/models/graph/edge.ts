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

import {
	PlayerPrivateId,
	PlayerPrivateIdSchema,
} from '@common/models/player-id';
import { InternalError } from '@server/models/error-types/internal-error';
import {
	EdgeMetadata,
	EdgeMetadataSchema,
} from '@server/models/graph/edge-metadata';
import { z } from 'zod';

export const EdgeSchema = z
	.object({
		neighbor: PlayerPrivateIdSchema,
		metadata: EdgeMetadataSchema,
	})
	.strict();

/**
 * @brief A (directed) edge from user A to user B.
 *
 * An edge going from A to B is an abstraction of a game in which A plays as White
 * against B who plays as Black.
 *
 * Each edge has some metadata associated to it.
 */
export class Edge {
	// The id of B (the target of the edge).
	public neighbor: PlayerPrivateId;

	// The metadata of this edge.
	public metadata: EdgeMetadata;

	constructor(neigh: PlayerPrivateId, data: EdgeMetadata) {
		this.neighbor = neigh;
		this.metadata = data;
	}

	// Merge two edges
	merge(other: Edge) {
		if (this.neighbor !== other.neighbor) {
			throw new InternalError(
				`The current edge points to '${this.neighbor}' but the new edge points to '${other.neighbor}'.`,
			);
		}

		if (this.metadata !== undefined && other.metadata !== undefined) {
			this.metadata.merge(other.metadata);
		}
	}

	// Is the metadata of this edge all zeroes?
	isEmptyEdge(): boolean {
		return (
			this.metadata.numGamesDrawn === 0 &&
			this.metadata.numGamesLost === 0 &&
			this.metadata.numGamesWon === 0
		);
	}
}

export const EdgeArraySchema = z.array(EdgeSchema);

export type EdgeArray = Edge[];
