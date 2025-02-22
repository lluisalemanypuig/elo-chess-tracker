import EdgeCurveProgram from '@sigma/edge-curve';
import Graph from 'graphology';
import Sigma from 'sigma';
import { EdgeArrowProgram } from 'sigma/rendering';
import forceAtlas2 from 'graphology-layout-forceatlas2';
import { scaleLinear } from 'd3-scale';
import { interpolateRgb } from 'd3-interpolate';

import { set_footer_version_number } from './client_utils_version_number';
import { fill_time_controls } from './client_utils_time_control_select';

let s: Sigma;
let graph_data: any;
let server_graph: Graph;
let graph_loaded: boolean = false;

let min_rating: number = 99999;
let max_rating: number = 0;

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
			curved: EdgeCurveProgram
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
			return '/query_graphs_full';
		}
		if (val == 'own') {
			return '/query_graphs_own';
		}
		return '?';
	})();

	// "query" the server
	const response = await fetch(query_to_server, {
		method: 'POST',
		body: JSON.stringify({ tc_i: time_control_id }),
		headers: { 'Content-type': 'application/json; charset=UTF-8' }
	});

	graph_data = await response.json();
	if (graph_data.r == '0') {
		graph_loaded = false;
		return;
	}

	if (graph_loaded) {
		server_graph.clear();
	}
	server_graph = new Graph({ type: 'directed' });

	min_rating = 99999;
	max_rating = 0;
	for (const node of graph_data.nodes) {
		const r = node.weight.rating;
		min_rating = r < min_rating ? r : min_rating;
		max_rating = r > max_rating ? r : max_rating;
	}
	for (const node of graph_data.nodes) {
		server_graph.addNode(node.id, { label: node.full_name });
	}

	for (const edge of graph_data.edges) {
		server_graph.addEdge(edge.source, edge.target, { label: edge.label });
	}

	for (let u of server_graph.nodeEntries()) {
		for (let v of server_graph.outNeighborEntries(u.node)) {
			const found = server_graph.hasDirectedEdge(v.neighbor, u.node);
			if (found) {
				server_graph.setEdgeAttribute(u.node, v.neighbor, 'type', 'curved');
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

		console.log('min_rating', min_rating);
		console.log('max_rating', max_rating);

		let min_games: number = 99999;
		let max_games: number = 0;

		for (const edge of graph_data.edges) {
			const num_games = edge.weight.wins + edge.weight.draws + edge.weight.losses;
			min_games = num_games < min_games ? num_games : min_games;
			max_games = num_games > max_games ? num_games : max_games;
		}

		for (const edge of graph_data.edges) {
			const num_games = edge.weight.wins + edge.weight.draws + edge.weight.losses;
			let k: number;
			if (num_games == min_games && num_games == max_games) {
				k = 1;
			} else {
				k = (num_games - min_games) / (max_games - min_games);
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
	} else if (option == 'dynamic_size') {
		const k = parseInt(size_picker_node.value);
		for (const node of graph_data.nodes) {
			const r = node.weight.rating;
			server_graph.setNodeAttribute(node.id, 'size', k * ((r - min_rating) / (max_rating - min_rating)) + 3);
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

	if (option == 'fixed') {
		const size_picker_node = document.getElementById('size_picker_edge') as HTMLInputElement;
		for (const edge of graph_data.edges) {
			server_graph.setEdgeAttribute(edge.source, edge.target, 'size', size_picker_node.value);
		}
	}

	display_graph();
}

function select_edge_size_changed(_event: any) {
	const select_edge_size = document.getElementById('select_edge_size') as HTMLSelectElement;
	const option = select_edge_size.options[select_edge_size.selectedIndex].value;
	const size_picker_edge = document.getElementById('size_picker_edge') as HTMLInputElement;
	if (option == 'fixed') {
		size_picker_edge.style.visibility = 'visible';
	} else {
		size_picker_edge.style.visibility = 'hidden';
	}

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
	fill_time_controls('select_time_control');
	set_footer_version_number();
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
