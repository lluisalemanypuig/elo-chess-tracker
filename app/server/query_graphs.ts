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
const debug = Debug('ELO_CHESS_TRACKER:server_query_graphs');
import { Request, Response } from 'express';

import { log_now } from '@server/utils/time';
import { is_user_logged_in } from '@server/managers/session';
import { User } from '@common/models/user';
import { GraphsManager } from '@server/managers/graphs_manager';
import { TimeControlID } from '@common/models/time_control';
import { search_linear_by_key } from '@server/utils/searching';
import { UsersManager } from '@server/managers/users_manager';
import { Edge } from '@common/models/graph/edge';
import { can_user_see_graph } from '@server/managers/user_relationships';
import { GRAPHS_SEE_USER } from '@common/models/user_action';
import { isDefined } from '@common/utils/is_defined';
import { Routes } from '@common/routes';
import { InputSchemaOf } from '@common/api/schemas';
import { safe_parse_request_body, safe_parse_request_cookies } from '@server/utils/schemas';
import { AuthenticationInputSchema } from '@common/schemas/authentication';

class NodeWeight {
	rating: number = 0;
}

class NodeInfo {
	id: number = 0;
	full_name: string = '';
	weight: NodeWeight = new NodeWeight();
}

class EdgeWeight {
	wins: number = 0;
	draws: number = 0;
	losses: number = 0;
}

class EdgeInfo {
	source: number = 0;
	target: number = 0;
	label: string = '';
	weight: EdgeWeight = new EdgeWeight();
}

function retrieve_graph_user(username: string, time_control_id: TimeControlID): [NodeInfo[], EdgeInfo[]] {
	const users = UsersManager.get_instance();
	const graphs = GraphsManager.get_instance();

	const this_user_idx = users.get_user_index_by_username(username);
	if (!isDefined(this_user_idx)) {
		debug(log_now(), `Index for user '${username}' could not be found.`);
		return [[], []];
	}
	const this_user_rand_id = users.get_user_random_ID_at(this_user_idx);
	if (!isDefined(this_user_rand_id)) {
		debug(log_now(), `Random id for user '${username}' could not be found.`);
		return [[], []];
	}
	const this_user = users.get_user_at(this_user_idx);
	if (!isDefined(this_user)) {
		debug(log_now(), `User '${username}' could not be found.`);
		return [[], []];
	}
	const G = graphs.get_graph(time_control_id);
	if (!isDefined(G)) {
		debug(log_now(), `Graph for '${time_control_id}' could not be found.`);
		return [[], []];
	}

	let list_nodes: NodeInfo[];
	{
		let node = new NodeInfo();
		node.full_name = this_user.get_full_name();
		node.id = this_user_rand_id;
		node.weight.rating = this_user.get_rating(time_control_id).rating;
		list_nodes = [node];
	}
	let list_edges: EdgeInfo[] = [];

	G.get_outgoing_edges(username)?.forEach((e: Edge) => {
		const edge_user_idx = users.get_user_index_by_username(e.neighbor) as number;
		const edge_user_rand_id = users.get_user_random_ID_at(edge_user_idx) as number;
		const edge_user = users.get_user_at(edge_user_idx) as User;

		let node = new NodeInfo();
		node.id = edge_user_rand_id;
		node.full_name = edge_user.get_full_name();
		node.weight.rating = edge_user.get_rating(time_control_id).rating;
		list_nodes.push(node);

		let edge = new EdgeInfo();
		edge.source = this_user_rand_id;
		edge.target = edge_user_rand_id;
		edge.label = e.metadata.to_string();
		edge.weight.wins = e.metadata.num_games_won;
		edge.weight.draws = e.metadata.num_games_drawn;
		edge.weight.losses = e.metadata.num_games_lost;
		list_edges.push(edge);
	});
	G.get_incoming_edges(username)?.forEach((e: Edge) => {
		const neighbor_idx = users.get_user_index_by_username(e.neighbor) as number;
		const neighbor_rand_id = users.get_user_random_ID_at(neighbor_idx) as number;

		const idx = search_linear_by_key(list_nodes, (i: NodeInfo): boolean => {
			return i.id == neighbor_rand_id;
		});

		if (idx == -1) {
			const edge_user = users.get_user_at(neighbor_idx) as User;

			let node = new NodeInfo();
			node.id = neighbor_rand_id;
			node.weight.rating = edge_user.get_rating(time_control_id).rating;
			node.full_name = edge_user.get_full_name();
			list_nodes.push(node);
		}

		let edge = new EdgeInfo();
		edge.source = neighbor_rand_id;
		edge.target = this_user_rand_id;
		edge.label = e.metadata.clone().reverse().to_string();
		edge.weight.wins = e.metadata.num_games_lost;
		edge.weight.draws = e.metadata.num_games_drawn;
		edge.weight.losses = e.metadata.num_games_won;
		list_edges.push(edge);
	});

	return [list_nodes, list_edges];
}

function retrieve_graph_full(querier: User, time_control_id: TimeControlID): [NodeInfo[], EdgeInfo[]] {
	const users = UsersManager.get_instance();
	const graphs = GraphsManager.get_instance();

	const G = graphs.get_graph(time_control_id);
	if (!isDefined(G)) {
		debug(log_now(), `Graph for '${time_control_id}' could not be found.`);
		return [[], []];
	}

	let list_nodes: NodeInfo[] = [];
	let list_edges: EdgeInfo[] = [];

	for (let idx = 0; idx < users.num_users(); ++idx) {
		const this_user = users.get_user_at(idx);
		if (!isDefined(this_user)) {
			debug(log_now(), `User at index '${idx}' could not be found.`);
			return [[], []];
		}
		if (!can_user_see_graph(querier, this_user)) {
			continue;
		}

		const username = this_user.username;
		const this_user_rand_id = users.get_user_random_ID_at(idx) as number;

		let out_degree = 0;
		G.get_outgoing_edges(username)?.forEach((e: Edge) => {
			const edge_user_idx = users.get_user_index_by_username(e.neighbor);
			if (!isDefined(edge_user_idx)) {
				debug(log_now(), `Index of user '${e.neighbor}' does not exist`);
				return;
			}
			const edge_user = users.get_user_at(edge_user_idx);
			if (!isDefined(edge_user)) {
				debug(log_now(), `User at index '${edge_user_idx}' does not exist`);
				return;
			}
			if (!can_user_see_graph(querier, edge_user)) {
				return;
			}

			const edge_user_rand_id = users.get_user_random_ID_at(edge_user_idx) as number;

			let edge = new EdgeInfo();
			edge.source = this_user_rand_id;
			edge.target = edge_user_rand_id;
			edge.label = e.metadata.to_string();
			edge.weight.wins = e.metadata.num_games_won;
			edge.weight.draws = e.metadata.num_games_drawn;
			edge.weight.losses = e.metadata.num_games_lost;
			list_edges.push(edge);

			++out_degree;
		});

		const degree = G.get_in_degree(username) + out_degree;
		if (degree > 0) {
			let node = new NodeInfo();
			node.full_name = this_user.get_full_name();
			node.id = users.get_user_random_ID_at(idx) as number;
			node.weight.rating = this_user.get_rating(time_control_id).rating;
			list_nodes.push(node);
		}
	}

	return [list_nodes, list_edges];
}

export async function post_query_graph_own(req: Request, res: Response) {
	debug(log_now(), `POST ${Routes.QUERY_GRAPH_OWN}...`);

	const session_parse = safe_parse_request_cookies(req, AuthenticationInputSchema, res, debug);
	if (session_parse.result === 'Exit') {
		return;
	}
	const session = session_parse.data;
	const r = is_user_logged_in(session);

	if (!isDefined(r[2])) {
		res.status(401).send(r[1]);
		return;
	}

	const graph_parse = safe_parse_request_body(req, InputSchemaOf(Routes.QUERY_GRAPH_OWN), res, debug);
	if (graph_parse.result === 'Exit') {
		return;
	}
	const time_control_id = graph_parse.data.tc_i;

	debug(log_now(), `User ${session.username} is querying their own graph of time control ${time_control_id}.`);

	const [list_nodes, list_edges] = retrieve_graph_user(session.username, time_control_id);
	res.status(200).send({
		nodes: list_nodes,
		edges: list_edges
	});
}

export async function post_query_graph_full(req: Request, res: Response) {
	debug(log_now(), `POST ${Routes.QUERY_GRAPH_FULL}...`);

	const session_parse = safe_parse_request_cookies(req, AuthenticationInputSchema, res, debug);
	if (session_parse.result === 'Exit') {
		return;
	}
	const session = session_parse.data;
	const r = is_user_logged_in(session);

	const user = r[2];
	if (!isDefined(user)) {
		res.status(401).send(r[1]);
		return;
	}

	if (!user.can_do(GRAPHS_SEE_USER)) {
		res.status(403).send('You do not have enough permissions.');
		return;
	}

	const graph_parse = safe_parse_request_body(req, InputSchemaOf(Routes.QUERY_GRAPH_FULL), res, debug);
	if (graph_parse.result === 'Exit') {
		return;
	}
	const time_control_id = graph_parse.data.tc_i;

	debug(
		log_now(),
		`User ${session.username} is querying the graph of the entire server of time control ${time_control_id}.`
	);

	const [list_nodes, list_edges] = retrieve_graph_full(user, time_control_id);
	res.status(200).send({
		nodes: list_nodes,
		edges: list_edges
	});
}
