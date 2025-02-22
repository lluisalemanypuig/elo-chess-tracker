import EdgeCurveProgram from '@sigma/edge-curve';
import Graph from 'graphology';
import Sigma from 'sigma';
import { EdgeArrowProgram } from 'sigma/rendering';
import forceAtlas2 from 'graphology-layout-forceatlas2';

import { set_footer_version_number } from './client_utils_version_number';
import { fill_time_controls } from './client_utils_time_control_select';

let s: Sigma;
let graph_data: any;
let server_graph: Graph;
let graph_loaded: boolean = false;

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
	const time_control_select = document.getElementById('time_control_select') as HTMLSelectElement;
	const time_control_id = time_control_select.options[time_control_select.selectedIndex].value;

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

function change_node_color(_event: any) {
	if (!graph_loaded) {
		return;
	}

	for (const node of graph_data.nodes) {
		server_graph.setNodeAttribute(node.id, 'color', 'blue');
	}

	display_graph();
}

function change_node_size(_event: any) {
	if (!graph_loaded) {
		return;
	}

	for (const node of graph_data.nodes) {
		server_graph.setNodeAttribute(node.id, 'size', 2);
	}

	display_graph();
}

function change_edge_color(_event: any) {
	if (!graph_loaded) {
		return;
	}

	for (const edge of graph_data.edges) {
		server_graph.setEdgeAttribute(edge.source, edge.target, 'color', 'red');
	}

	display_graph();
}

function change_edge_size(_event: any) {
	if (!graph_loaded) {
		return;
	}

	for (const edge of graph_data.edges) {
		server_graph.setEdgeAttribute(edge.source, edge.target, 'size', edge.size);
	}

	display_graph();
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
	console.log('Display coordinates...');
	compute_coordinates();
	console.log('Clear sigma...');
	s.clear();
	console.log('Set sigma...');
	s.setGraph(server_graph);
}

async function load_and_display(_event: any) {
	console.log('About to load a graph...');
	await load_graph();
	console.log('About to display the graph...');
	display_graph();
}

window.onresize = resize_viewer;

window.onload = async function () {
	resize_viewer();
	fill_time_controls('time_control_select');
	set_footer_version_number();
	initialize_sigma();

	let time_control_select = document.getElementById('time_control_select') as HTMLSelectElement;
	time_control_select.onchange = load_and_display;

	let node_color_select = document.getElementById('node_color_select') as HTMLSelectElement;
	node_color_select.onchange = change_node_color;
	let node_size_select = document.getElementById('node_size_select') as HTMLSelectElement;
	node_size_select.onchange = change_node_size;

	let edge_color_select = document.getElementById('edge_color_select') as HTMLSelectElement;
	edge_color_select.onchange = change_edge_color;
	let edge_size_select = document.getElementById('edge_size_select') as HTMLSelectElement;
	edge_size_select.onchange = change_edge_size;
};
