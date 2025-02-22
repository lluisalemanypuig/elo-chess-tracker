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

import Debug from 'debug';
const debug = Debug('ELO_TRACKER:server_query_graphs');

import { log_now } from './utils/time';
import { is_user_logged_in } from './managers/session';
import { User } from './models/user';
import { SessionID } from './models/session_id';
import { GraphsManager } from './managers/graphs_manager';
import { TimeControlID } from './models/time_control';
import { Graph } from './models/graph/graph';
import { search_linear_by_key } from './utils/searching';
import { UsersManager } from './managers/users_manager';
import { Edge } from './models/graph/edge';
import { can_user_see_graph } from './models/user_relationships';
import { SEE_GRAPHS_USER } from './models/user_action';

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

	const this_user_idx = users.get_user_index_by_username(username) as number;
	const this_user_rand_id = users.get_user_random_ID_at(this_user_idx) as number;
	const this_user = users.get_user_at(this_user_idx) as User;

	const G = graphs.get_graph(time_control_id) as Graph;

	let list_nodes: NodeInfo[];
	{
		let i = new NodeInfo();
		i.full_name = this_user.get_full_name();
		i.id = this_user_rand_id;
		i.weight.rating = this_user.get_rating(time_control_id).rating;
		list_nodes = [i];
	}
	let list_edges: EdgeInfo[] = [];

	G.get_outgoing_edges(username)?.forEach((e: Edge) => {
		const edge_user_idx = users.get_user_index_by_username(e.neighbor) as number;
		const edge_user_rand_id = users.get_user_random_ID_at(edge_user_idx) as number;
		const edge_user = users.get_user_at(edge_user_idx) as User;

		{
			let i = new NodeInfo();
			i.id = edge_user_rand_id;
			i.full_name = edge_user.get_full_name();
			i.weight.rating = edge_user.get_rating(time_control_id).rating;
			list_nodes.push(i);
		}
		{
			let ei = new EdgeInfo();
			ei.source = this_user_rand_id;
			ei.target = edge_user_rand_id;
			ei.label = e.metadata.to_string();
			ei.weight.wins = e.metadata.num_games_won;
			ei.weight.draws = e.metadata.num_games_drawn;
			ei.weight.losses = e.metadata.num_games_lost;
			list_edges.push(ei);
		}
	});
	G.get_ingoing_edges(username)?.forEach((e: Edge) => {
		const edge_user_idx = users.get_user_index_by_username(e.neighbor) as number;
		const edge_user_rand_id = users.get_user_random_ID_at(edge_user_idx) as number;

		const idx = search_linear_by_key(list_nodes, (i: NodeInfo): boolean => {
			return i.id == edge_user_rand_id;
		});

		if (idx == -1) {
			const edge_user = users.get_user_at(edge_user_idx) as User;
			{
				let i = new NodeInfo();
				i.id = edge_user_rand_id;
				i.weight.rating = edge_user.get_rating(time_control_id).rating;
				i.full_name = edge_user.get_full_name();
				list_nodes.push(i);
			}
			{
				let ei = new EdgeInfo();
				ei.source = edge_user_rand_id;
				ei.target = this_user_rand_id;
				ei.label = e.metadata.to_string();
				ei.weight.wins = e.metadata.num_games_won;
				ei.weight.draws = e.metadata.num_games_drawn;
				ei.weight.losses = e.metadata.num_games_lost;
				list_edges.push(ei);
			}
		}
	});

	return [list_nodes, list_edges];
}

function retrieve_graph_full(querier: User, time_control_id: TimeControlID): [NodeInfo[], EdgeInfo[]] {
	const users = UsersManager.get_instance();
	const graphs = GraphsManager.get_instance();

	const G = graphs.get_graph(time_control_id) as Graph;

	let list_nodes: NodeInfo[] = [];
	let list_edges: EdgeInfo[] = [];
	for (let idx = 0; idx < users.num_users(); ++idx) {
		const this_user = users.get_user_at(idx) as User;
		if (!can_user_see_graph(querier, this_user)) {
			continue;
		}

		const username = this_user.get_username();
		const this_user_rand_id = users.get_user_random_ID_at(idx) as number;
		{
			let i = new NodeInfo();
			i.full_name = this_user.get_full_name();
			i.id = users.get_user_random_ID_at(idx) as number;
			i.weight.rating = this_user.get_rating(time_control_id).rating;
			list_nodes.push(i);
		}

		G.get_outgoing_edges(username)?.forEach((e: Edge) => {
			const edge_user_idx = users.get_user_index_by_username(e.neighbor) as number;
			const edge_user = users.get_user_at(edge_user_idx) as User;
			if (!can_user_see_graph(querier, edge_user)) {
				return;
			}

			const edge_user_rand_id = users.get_user_random_ID_at(edge_user_idx) as number;

			let ei = new EdgeInfo();
			ei.source = this_user_rand_id;
			ei.target = edge_user_rand_id;
			ei.label = e.metadata.to_string();
			ei.weight.wins = e.metadata.num_games_won;
			ei.weight.draws = e.metadata.num_games_drawn;
			ei.weight.losses = e.metadata.num_games_lost;
			list_edges.push(ei);
		});
	}

	return [list_nodes, list_edges];
}

export async function post_query_graphs_own(req: any, res: any) {
	debug(log_now(), 'POST query_graphs_own...');

	const session = SessionID.from_cookie(req.cookies);
	const r = is_user_logged_in(session);

	if (!r[0]) {
		res.send({ r: '0', reason: r[1] });
		return;
	}

	const time_control_id = req.body.tc_i as TimeControlID;
	debug(log_now(), `User ${session.username} is querying their own graph of time control ${time_control_id}.`);

	const [list_nodes, list_edges] = retrieve_graph_user(session.username, time_control_id);
	res.send({
		r: '1',
		nodes: list_nodes,
		edges: list_edges
	});
}

export async function post_query_graphs_full(req: any, res: any) {
	debug(log_now(), 'POST query_graphs_full...');

	const session = SessionID.from_cookie(req.cookies);
	const r = is_user_logged_in(session);

	if (!r[0]) {
		res.send({ r: '0', reason: r[1] });
		return;
	}

	const user = r[2] as User;
	if (!user.can_do(SEE_GRAPHS_USER)) {
		res.send({ r: '0', reason: 'You do not have enough permissions.' });
		return;
	}

	const time_control_id = req.body.tc_i as TimeControlID;
	debug(
		log_now(),
		`User ${session.username} is querying the graph of the entire server of time control ${time_control_id}.`
	);

	const [list_nodes, list_edges] = retrieve_graph_full(user, time_control_id);
	res.send({
		r: '1',
		nodes: list_nodes,
		edges: list_edges
	});
}
