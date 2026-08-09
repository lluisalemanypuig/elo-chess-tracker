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
import { GRAPHS_SEE_USER } from '@common/models/user-action';
import { isNotDefined } from '@common/utils/is-defined';
import { ROUTES } from '@common/routes';
import { inputSchemaOf } from '@common/api/schemas';
import { safeParseRequestBody, safeParseRequestCookies } from '@server/utils/schemas';
import { AuthenticationInputSchema } from '@common/schemas/authentication';
import { EdgeInfo, NodeInfo, QueryGraphOutput } from '@common/schemas/query-graphs';
import { PlayerPrivateId, PlayerPublicId } from '@common/models/player';

function retrieveGraphUser(username: PlayerPrivateId, timeControlId: TimeControlId): QueryGraphOutput {
	const users = UsersManager.getInstance();
	const graphs = GraphsManager.getInstance();

	const thisUserIdx = users.getUserIndexByUsername(username);
	if (isNotDefined(thisUserIdx)) {
		debug(logNow(), `Index for user '${username}' could not be found.`);
		return { nodes: [], edges: [] };
	}
	const thisUserRandId = users.getUserPublicIdAt(thisUserIdx);
	if (isNotDefined(thisUserRandId)) {
		debug(logNow(), `Random id for user '${username}' could not be found.`);
		return { nodes: [], edges: [] };
	}
	const thisUser = users.getUserAt(thisUserIdx);
	if (isNotDefined(thisUser)) {
		debug(logNow(), `User '${username}' could not be found.`);
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
			id: thisUserRandId,
			fullName: thisUser.getFullName(),
			weight: {
				rating: thisUser.getRating(timeControlId).rating
			}
		};
		listNodes = [node];
	}
	let listEdges: EdgeInfo[] = [];

	G.getOutgoingEdges(username)?.forEach((e: Edge) => {
		const edgeUserIdx = users.getUserIndexByUsername(e.neighbor) as number;
		const edgeUserPublicId = users.getUserPublicIdAt(edgeUserIdx) as PlayerPublicId;
		const edgeUser = users.getUserAt(edgeUserIdx) as User;

		const node: NodeInfo = {
			id: edgeUserPublicId,
			fullName: edgeUser.getFullName(),
			weight: {
				rating: edgeUser.getRating(timeControlId).rating
			}
		};
		listNodes.push(node);

		const edge: EdgeInfo = {
			source: thisUserRandId,
			target: edgeUserPublicId,
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
		const neighborIdx = users.getUserIndexByUsername(e.neighbor) as number;
		const neighborPublicId = users.getUserPublicIdAt(neighborIdx) as PlayerPublicId;

		const idx = searchLinearByKey(listNodes, (i: NodeInfo): boolean => {
			return i.id == neighborPublicId;
		});

		if (idx == -1) {
			const edgeUser = users.getUserAt(neighborIdx) as User;

			const node: NodeInfo = {
				id: neighborPublicId,
				fullName: edgeUser.getFullName(),
				weight: {
					rating: edgeUser.getRating(timeControlId).rating
				}
			};
			listNodes.push(node);
		}

		const edge: EdgeInfo = {
			source: neighborPublicId,
			target: thisUserRandId,
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
		const thisUser = users.getUserAt(idx);
		if (isNotDefined(thisUser)) {
			debug(logNow(), `User at index '${idx}' could not be found.`);
			return { nodes: [], edges: [] };
		}
		if (!canUserSeeGraph(querier, thisUser)) {
			continue;
		}

		const username = thisUser.username;
		const thisUserPublicId = users.getUserPublicIdAt(idx) as PlayerPublicId;

		let outDegree = 0;
		G.getOutgoingEdges(username)?.forEach((e: Edge) => {
			const edgeUserIdx = users.getUserIndexByUsername(e.neighbor);
			if (isNotDefined(edgeUserIdx)) {
				debug(logNow(), `Index of user '${e.neighbor}' does not exist`);
				return;
			}
			const edgeUser = users.getUserAt(edgeUserIdx);
			if (isNotDefined(edgeUser)) {
				debug(logNow(), `User at index '${edgeUserIdx}' does not exist`);
				return;
			}
			if (!canUserSeeGraph(querier, edgeUser)) {
				return;
			}

			const edgeUserRandId = users.getUserPublicIdAt(edgeUserIdx) as number;

			const edge: EdgeInfo = {
				source: thisUserPublicId,
				target: edgeUserRandId,
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

		const degree = G.getInDegree(username) + outDegree;
		if (degree > 0) {
			const publicId = users.getUserPublicIdAt(idx) as PlayerPublicId;
			const node: NodeInfo = {
				id: publicId,
				fullName: thisUser.getFullName(),
				weight: {
					rating: thisUser.getRating(timeControlId).rating
				}
			};
			listNodes.push(node);
		}
	}

	return { nodes: listNodes, edges: listEdges };
}

export async function postQueryGraphOwn(req: Request, res: Response) {
	debug(logNow(), `POST ${ROUTES.QUERY_GRAPH_OWN}...`);

	const sessionParse = safeParseRequestCookies(req, AuthenticationInputSchema, res, debug);
	if (sessionParse.result === 'Exit') {
		return;
	}
	const session = sessionParse.data;
	const r = isUserLoggedIn(session);

	if (isNotDefined(r[2])) {
		res.status(401).send(r[1]);
		return;
	}

	const graphParse = safeParseRequestBody(req, inputSchemaOf(ROUTES.QUERY_GRAPH_OWN), res, debug);
	if (graphParse.result === 'Exit') {
		return;
	}
	const timeControlId = graphParse.data.timeControlId;

	debug(logNow(), `User ${session.username} is querying their own graph of time control ${timeControlId}.`);

	const graph = retrieveGraphUser(session.username, timeControlId);
	res.status(200).send(graph);
}

export async function postQueryGraphFull(req: Request, res: Response) {
	debug(logNow(), `POST ${ROUTES.QUERY_GRAPH_FULL}...`);

	const sessionParse = safeParseRequestCookies(req, AuthenticationInputSchema, res, debug);
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

	if (!user.canDo(GRAPHS_SEE_USER)) {
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
		`User ${session.username} is querying the graph of the entire server of time control ${timeControlId}.`
	);

	const graph = retrieveGraphFull(user, timeControlId);
	res.status(200).send(graph);
}
