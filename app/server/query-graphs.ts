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
const debug = Debug('ELO_CHESS_TRACKER:serverQueryGraphs');
import { Request, Response } from 'express';

import { logNow } from '@common/utils/time';
import { isUserLoggedIn } from '@server/managers/session';
import { User } from '@common/models/user';
import { GraphsManager } from '@server/managers/graphs-manager';
import { TimeControlId } from '@common/models/time-control';
import { searchLinearByKey } from '@server/utils/searching';
import { UsersManager } from '@server/managers/users-manager';
import { Edge } from '@common/models/graph/edge';
import { canUserSeeGraph } from '@server/managers/user-relationships';
import { isNotDefined } from '@common/utils/is-defined';
import { ROUTES } from '@common/api/routes';
import { inputSchemaOf } from '@common/api/schemas-endpoints';
import { safeParseRequestBody, safeParseRequestCookies } from '@server/utils/schemas';
import { EdgeInfo, NodeInfo, QueryGraphOutput } from '@common/api/schemas/query-graphs';
import { PlayerPrivateId } from '@common/models/player';

function retrieveGraphUser(username: PlayerPrivateId, timeControlId: TimeControlId): QueryGraphOutput {
	const users = UsersManager.getInstance();
	const graphs = GraphsManager.getInstance();

	const thisUser = users.getAllUserDataByPrivateId(username);
	if (isNotDefined(thisUser)) {
		debug(logNow(), `Index for user '${username}' could not be found.`);
		return { nodes: [], edges: [] };
	}

	const G = graphs.getGraph(timeControlId);
	if (isNotDefined(G)) {
		debug(logNow(), `Graph for '${timeControlId}' could not be found.`);
		return { nodes: [], edges: [] };
	}

	let listNodes: NodeInfo[];
	{
		const node: NodeInfo = {
			id: thisUser.publicId,
			fullName: thisUser.user.getFullName(),
			weight: {
				rating: thisUser.user.getRating(timeControlId).rating
			}
		};
		listNodes = [node];
	}
	let listEdges: EdgeInfo[] = [];

	G.getOutgoingEdges(username)?.forEach((e: Edge) => {
		const neighbor = users.getAllUserDataByPrivateId(e.neighbor);
		if (isNotDefined(neighbor)) {
			debug(logNow(), `Could not find user ${e.neighbor}.`);
			throw new Error(`Internal error when querying a graph.`);
		}

		const node: NodeInfo = {
			id: neighbor.publicId,
			fullName: neighbor.user.getFullName(),
			weight: {
				rating: neighbor.user.getRating(timeControlId).rating
			}
		};
		listNodes.push(node);

		const edge: EdgeInfo = {
			source: thisUser.publicId,
			target: neighbor.publicId,
			label: e.metadata.toString(),
			weight: {
				wins: e.metadata.numGamesWon,
				draws: e.metadata.numGamesDrawn,
				losses: e.metadata.numGamesLost
			}
		};
		listEdges.push(edge);
	});
	G.getIncomingEdges(username)?.forEach((e: Edge) => {
		const neighbor = users.getAllUserDataByPrivateId(e.neighbor);
		if (isNotDefined(neighbor)) {
			debug(logNow(), `Could not find user ${e.neighbor}.`);
			throw new Error(`Internal error when querying a graph.`);
		}

		const idx = searchLinearByKey(listNodes, (i: NodeInfo): boolean => {
			return i.id === neighbor.publicId;
		});

		if (idx === -1) {
			const node: NodeInfo = {
				id: neighbor.publicId,
				fullName: neighbor.user.getFullName(),
				weight: {
					rating: neighbor.user.getRating(timeControlId).rating
				}
			};
			listNodes.push(node);
		}

		const edge: EdgeInfo = {
			source: neighbor.publicId,
			target: thisUser.publicId,
			label: e.metadata.clone().reverse().toString(),
			weight: {
				wins: e.metadata.numGamesLost,
				draws: e.metadata.numGamesDrawn,
				losses: e.metadata.numGamesWon
			}
		};
		listEdges.push(edge);
	});

	return { nodes: listNodes, edges: listEdges };
}

function retrieveGraphFull(querier: User, timeControlId: TimeControlId): QueryGraphOutput {
	const users = UsersManager.getInstance();
	const graphs = GraphsManager.getInstance();

	const G = graphs.getGraph(timeControlId);
	if (isNotDefined(G)) {
		debug(logNow(), `Graph for '${timeControlId}' could not be found.`);
		return { nodes: [], edges: [] };
	}

	let listNodes: NodeInfo[] = [];
	let listEdges: EdgeInfo[] = [];

	for (let idx = 0; idx < users.numUsers(); ++idx) {
		const currentUser = users.getAllUserDataAtSafeIdx(idx);
		if (!canUserSeeGraph(querier, currentUser.user)) {
			continue;
		}

		let outDegree = 0;
		G.getOutgoingEdges(currentUser.user.username)?.forEach((e: Edge) => {
			const neighbor = users.getAllUserDataByPrivateId(e.neighbor);
			if (isNotDefined(neighbor)) {
				debug(logNow(), `Index of user '${e.neighbor}' does not exist`);
				return;
			}
			if (!canUserSeeGraph(querier, neighbor.user)) {
				return;
			}

			const edge: EdgeInfo = {
				source: currentUser.publicId,
				target: neighbor.publicId,
				label: e.metadata.toString(),
				weight: {
					wins: e.metadata.numGamesWon,
					draws: e.metadata.numGamesDrawn,
					losses: e.metadata.numGamesLost
				}
			};
			listEdges.push(edge);
			++outDegree;
		});

		const degree = G.getInDegree(currentUser.user.username) + outDegree;
		if (degree > 0) {
			const node: NodeInfo = {
				id: currentUser.publicId,
				fullName: currentUser.user.getFullName(),
				weight: {
					rating: currentUser.user.getRating(timeControlId).rating
				}
			};
			listNodes.push(node);
		}
	}

	return { nodes: listNodes, edges: listEdges };
}

export async function postQueryGraphOwn(req: Request, res: Response) {
	debug(logNow(), `POST ${ROUTES.QUERY_GRAPH_OWN}...`);

	const sessionParse = safeParseRequestCookies(req, res, debug);
	if (sessionParse.result === 'Exit') {
		return;
	}
	const session = sessionParse.data;
	const r = isUserLoggedIn(session);
	const user = r[2];
	if (isNotDefined(user)) {
		res.status(401).send(r[1]);
		return;
	}

	const graphParse = safeParseRequestBody(req, inputSchemaOf(ROUTES.QUERY_GRAPH_OWN), res, debug);
	if (graphParse.result === 'Exit') {
		return;
	}
	const timeControlId = graphParse.data.timeControlId;

	debug(logNow(), `User ${user.username} is querying their own graph of time control ${timeControlId}.`);

	const graph = retrieveGraphUser(user.username, timeControlId);
	res.status(200).send(graph);
}

export async function postQueryGraphFull(req: Request, res: Response) {
	debug(logNow(), `POST ${ROUTES.QUERY_GRAPH_FULL}...`);

	const sessionParse = safeParseRequestCookies(req, res, debug);
	if (sessionParse.result === 'Exit') {
		return;
	}
	const session = sessionParse.data;
	const r = isUserLoggedIn(session);
	const user = r[2];
	if (isNotDefined(user)) {
		res.status(401).send(r[1]);
		return;
	}

	if (!user.canDo('SEE_GRAPHS')) {
		res.status(403).send('You do not have enough permissions.');
		return;
	}

	const graphParse = safeParseRequestBody(req, inputSchemaOf(ROUTES.QUERY_GRAPH_FULL), res, debug);
	if (graphParse.result === 'Exit') {
		return;
	}
	const timeControlId = graphParse.data.timeControlId;

	debug(
		logNow(),
		`User ${user.username} is querying the graph of the entire server of time control ${timeControlId}.`
	);

	const graph = retrieveGraphFull(user, timeControlId);
	res.status(200).send(graph);
}
