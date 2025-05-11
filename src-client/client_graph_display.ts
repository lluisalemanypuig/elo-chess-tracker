/*
Elo rating for a Chess Club
Copyright (C) 2023 - 2025  Lluís Alemany Puig

This program is free software: you can redistribute it and/or modify
it under the terms of the GNU Affero General Public License as published
by the Free Software Foundation, either version 3 of the License, or
(at your option) any later version.

This program is distributed in the hope that it will be useful,
but WITHOUT ANY WARRANTY; without even the implied warranty of
MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE. See the
GNU Affero General Public License for more details.

You should have received a copy of the GNU Affero General Public License
along with this program. If not, see <https://www.gnu.org/licenses/>.

Full source code of elo-chess-tracker:
	https://github.com/lluisalemanypuig/elo-chess-tracker
*/

import 'htmx.org';

import { EdgeCurvedArrowProgram } from '@sigma/edge-curve';
import Graph from 'graphology';
import Sigma from 'sigma';
import { EdgeArrowProgram } from 'sigma/rendering';
import forceAtlas2 from 'graphology-layout-forceatlas2';
import { scaleLinear } from 'd3-scale';
import { interpolateRgb } from 'd3-interpolate';

let s: Sigma;
let graph_data: any;
let server_graph: Graph;
let graph_loaded: boolean = false;

let min_rating: number;
let max_rating: number;

let min_games: number;
let max_games: number;
let min_edge_weight: number;
let max_edge_weight: number;

function weight_edge(weight: any): number {
	return 10 * weight.wins + 5 * weight.draws + weight.losses;
}

function normalize(v: number, min: number, max: number): number {
	if (max == min) {
		return 1;
	}
	return (v - min) / (max - min);
}

function resize_viewer() {
	const viewport_height = window.innerHeight;
	let viewer = document.getElementById('graph-viewer') as HTMLDivElement;
	const new_height = viewport_height - 20 - 20;
	viewer.setAttribute('style', `width: 100%; height: ${new_height}px`);
}

function initialize_sigma() {
	const container = document.getElementById('graph-viewer') as HTMLElement;
	s = new Sigma(new Graph(), container, {
		allowInvalidContainer: true,
		defaultEdgeType: 'arrow',
		renderEdgeLabels: true,
		edgeProgramClasses: {
			straight: EdgeArrowProgram,
			curvedArrow: EdgeCurvedArrowProgram
		}
	});
}

async function load_graph() {
	const select_time_control = document.getElementById('select_time_control') as HTMLSelectElement;
	const time_control_id = select_time_control.options[select_time_control.selectedIndex].value;

	if (time_control_id == '') {
		return;
	}

	const val = document.getElementById('graph-viewer')?.getAttribute('value');
	const query_to_server: string = (() => {
		if (val == 'full') {
			return '/query/graph/full';
		}
		if (val == 'own') {
			return '/query/graph/own';
		}
		return '?';
	})();

	// "query" the server
	const response = await fetch(query_to_server, {
		method: 'POST',
		body: JSON.stringify({ tc_i: time_control_id }),
		headers: { 'Content-type': 'application/json; charset=UTF-8' }
	});
	if (response.status >= 400) {
		const message = await response.text();
		alert(`${response.status} -- ${response.statusText}\nMessage: '${message}'`);
		return;
	}

	graph_data = await response.json();

	if (graph_loaded) {
		server_graph.clear();
	}
	server_graph = new Graph({ type: 'directed' });

	min_rating = 99999;
	max_rating = 0;
	for (const node of graph_data.nodes) {
		server_graph.addNode(node.id, { label: node.full_name });

		const r = node.weight.rating;
		min_rating = r < min_rating ? r : min_rating;
		max_rating = r > max_rating ? r : max_rating;
	}

	min_games = 9999;
	max_games = 0;
	min_edge_weight = 9999;
	max_edge_weight = 0;
	for (const edge of graph_data.edges) {
		server_graph.addEdge(edge.source, edge.target, { label: edge.label });

		const num_games = edge.weight.wins + edge.weight.draws + edge.weight.losses;
		min_games = num_games < min_games ? num_games : min_games;
		max_games = num_games > max_games ? num_games : max_games;

		const edge_w = weight_edge(edge.weight);
		min_edge_weight = edge_w < min_edge_weight ? edge_w : min_edge_weight;
		max_edge_weight = edge_w > max_edge_weight ? edge_w : max_edge_weight;
	}

	for (let u of server_graph.nodeEntries()) {
		for (let v of server_graph.outNeighborEntries(u.node)) {
			const found = server_graph.hasDirectedEdge(v.neighbor, u.node);
			if (found) {
				server_graph.setEdgeAttribute(u.node, v.neighbor, 'type', 'curvedArrow');
				server_graph.setEdgeAttribute(u.node, v.neighbor, 'curvature', 0.25);
			}
		}
	}

	graph_loaded = true;
}

function color_picker_node_changed(_event: any) {
	if (!graph_loaded) {
		return;
	}

	const select_node_color = document.getElementById('select_node_color') as HTMLSelectElement;
	const option = select_node_color.options[select_node_color.selectedIndex].value;
	const color_picker_node = document.getElementById('color_picker_node') as HTMLInputElement;

	if (option == 'fixed') {
		for (const node of graph_data.nodes) {
			server_graph.setNodeAttribute(node.id, 'color', color_picker_node.value);
		}
	} else if (option == 'dynamic_rating') {
		const color_interpolator = scaleLinear<string>()
			.domain([0, 1])
			.interpolate(interpolateRgb)
			.range(['#F6F5F4', color_picker_node.value]);

		console.log('min_rating', min_rating);
		console.log('max_rating', max_rating);
		for (const node of graph_data.nodes) {
			const k = (node.weight.rating - min_rating) / (max_rating - min_rating);
			server_graph.setNodeAttribute(node.id, 'color', color_interpolator(k));
		}
	}

	display_graph();
}

function select_node_color_changed(_event: any) {
	if (!graph_loaded) {
		return;
	}

	color_picker_node_changed(null);
}

function color_picker_edge_changed(_event: any) {
	if (!graph_loaded) {
		return;
	}

	const select_node_color = document.getElementById('select_edge_color') as HTMLSelectElement;
	const option = select_node_color.options[select_node_color.selectedIndex].value;
	const color_picker_node = document.getElementById('color_picker_edge') as HTMLInputElement;

	if (option == 'fixed') {
		const color = color_picker_node.value;
		for (const edge of graph_data.edges) {
			server_graph.setEdgeAttribute(edge.source, edge.target, 'color', color);
		}
	} else if (option == 'dynamic_games') {
		const color_interpolator = scaleLinear<string>()
			.domain([0, 1])
			.interpolate(interpolateRgb)
			.range(['#F6F5F4', color_picker_node.value]);

		for (const edge of graph_data.edges) {
			const num_games = edge.weight.wins + edge.weight.draws + edge.weight.losses;
			let k: number;
			if (num_games == min_games && num_games == max_games) {
				k = 1;
			} else {
				k = normalize(num_games, min_games, max_games);
			}
			server_graph.setEdgeAttribute(edge.source, edge.target, 'color', color_interpolator(k));
		}
	} else if (option == 'dynamic_results') {
		const color_interpolator = scaleLinear<string>()
			.domain([0, 1])
			.interpolate(interpolateRgb)
			.range(['#F6F5F4', color_picker_node.value]);

		for (const edge of graph_data.edges) {
			const edge_w = weight_edge(edge.weight);
			let k: number;
			if (edge_w == min_edge_weight && edge_w == max_edge_weight) {
				k = 1;
			} else {
				k = normalize(edge_w, min_edge_weight, max_edge_weight);
			}
			server_graph.setEdgeAttribute(edge.source, edge.target, 'color', color_interpolator(k));
		}
	}

	display_graph();
}

function select_edge_color_changed(_event: any) {
	if (!graph_loaded) {
		return;
	}

	color_picker_edge_changed(null);
}

function size_picker_node_changed(_event: any) {
	if (!graph_loaded) {
		return;
	}

	const select_node_size = document.getElementById('select_node_size') as HTMLSelectElement;
	const option = select_node_size.options[select_node_size.selectedIndex].value;
	const size_picker_node = document.getElementById('size_picker_node') as HTMLInputElement;

	if (option == 'fixed') {
		for (const node of graph_data.nodes) {
			server_graph.setNodeAttribute(node.id, 'size', size_picker_node.value);
		}
	} else if (option == 'dynamic_rating') {
		const k = parseInt(size_picker_node.value);
		for (const node of graph_data.nodes) {
			const r = node.weight.rating;
			server_graph.setNodeAttribute(node.id, 'size', k * (1 + normalize(r, min_rating, max_rating)));
		}
	}
	display_graph();
}

function select_node_size_changed(_event: any) {
	if (!graph_loaded) {
		return;
	}

	size_picker_node_changed(null);
}

function size_picker_edge_changed(_event: any) {
	if (!graph_loaded) {
		return;
	}

	const select_node_size = document.getElementById('select_edge_size') as HTMLSelectElement;
	const option = select_node_size.options[select_node_size.selectedIndex].value;
	const size_picker_node = document.getElementById('size_picker_edge') as HTMLInputElement;
	const M = parseInt(size_picker_node.value);

	if (option == 'fixed') {
		for (const edge of graph_data.edges) {
			server_graph.setEdgeAttribute(edge.source, edge.target, 'size', size_picker_node.value);
		}
	} else if (option == 'dynamic_games') {
		for (const edge of graph_data.edges) {
			const num_games = edge.weight.wins + edge.weight.draws + edge.weight.losses;
			let k: number;
			if (num_games == min_games && num_games == max_games) {
				k = 1;
			} else {
				k = M * normalize(num_games, min_games, max_games);
			}
			server_graph.setEdgeAttribute(edge.source, edge.target, 'size', k);
		}
	} else if (option == 'dynamic_results') {
		for (const edge of graph_data.edges) {
			const edge_w = weight_edge(edge.weight);
			let k: number;
			if (edge_w == min_edge_weight && edge_w == max_edge_weight) {
				k = 1;
			} else {
				k = M * normalize(edge_w, min_edge_weight, max_edge_weight);
			}
			server_graph.setEdgeAttribute(edge.source, edge.target, 'size', k);
		}
	}

	display_graph();
}

function select_edge_size_changed(_event: any) {
	if (!graph_loaded) {
		return;
	}

	size_picker_edge_changed(null);
}

function compute_coordinates() {
	if (!graph_loaded) {
		return;
	}

	let i = 0;
	for (const node of server_graph.nodes()) {
		server_graph.setNodeAttribute(node, 'x', i);
		server_graph.setNodeAttribute(node, 'y', i * i - i);
		++i;
	}
	const res = forceAtlas2(server_graph, { iterations: 100 });
	for (const node of server_graph.nodes()) {
		server_graph.setNodeAttribute(node, 'x', res[node]['x']);
		server_graph.setNodeAttribute(node, 'y', res[node]['y']);
	}
}

function display_graph() {
	compute_coordinates();
	s.clear();
	s.setGraph(server_graph);
}

async function load_and_display(_event: any) {
	await load_graph();
	size_picker_node_changed(null);
	color_picker_node_changed(null);
	size_picker_edge_changed(null);
	color_picker_edge_changed(null);
	display_graph();
}

window.onresize = resize_viewer;

window.onload = async function () {
	resize_viewer();
	initialize_sigma();

	let select_time_control = document.getElementById('select_time_control') as HTMLSelectElement;
	select_time_control.onchange = load_and_display;

	let select_node_color = document.getElementById('select_node_color') as HTMLSelectElement;
	select_node_color.onchange = select_node_color_changed;
	let color_picker_node = document.getElementById('color_picker_node') as HTMLInputElement;
	color_picker_node.onchange = color_picker_node_changed;

	let select_edge_color = document.getElementById('select_edge_color') as HTMLSelectElement;
	select_edge_color.onchange = select_edge_color_changed;
	let color_picker_edge = document.getElementById('color_picker_edge') as HTMLInputElement;
	color_picker_edge.onchange = color_picker_edge_changed;

	let select_node_size = document.getElementById('select_node_size') as HTMLSelectElement;
	select_node_size.onchange = select_node_size_changed;
	let size_picker_node = document.getElementById('size_picker_node') as HTMLInputElement;
	size_picker_node.onchange = size_picker_node_changed;

	let select_edge_size = document.getElementById('select_edge_size') as HTMLSelectElement;
	select_edge_size.onchange = select_edge_size_changed;
	let size_picker_edge = document.getElementById('size_picker_edge') as HTMLInputElement;
	size_picker_edge.onchange = size_picker_edge_changed;
};
