import EdgeCurveProgram from '@sigma/edge-curve';
import Graph from 'graphology';
import Sigma from 'sigma';
import { EdgeArrowProgram } from 'sigma/rendering';
import forceAtlas2 from 'graphology-layout-forceatlas2';

import { set_footer_version_number } from './client_utils_version_number';
import { fill_time_controls } from './client_utils_time_control_select';

let s: Sigma;

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

async function display_graph(_event: any) {
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

	const data = await response.json();
	if (data.r == '0') {
		return;
	}

	// Create a graph, with various parallel edges:
	let graph = new Graph({ type: 'directed' });

	for (const node of data.nodes) {
		const name = graph.addNode(node.random_id, { size: node.size, label: node.full_name });
		graph.setNodeAttribute(name, 'color', 'blue');
	}

	for (const edge of data.edges) {
		const name = graph.addEdge(edge.source, edge.target, { label: edge.label });
		graph.setEdgeAttribute(name, 'color', 'red');
		graph.setEdgeAttribute(name, 'size', edge.size);
	}

	for (let u of graph.nodeEntries()) {
		for (let v of graph.outNeighborEntries(u.node)) {
			const found = graph.hasDirectedEdge(v.neighbor, u.node);
			if (found) {
				graph.setEdgeAttribute(u.node, v.neighbor, 'type', 'curved');
				graph.setEdgeAttribute(u.node, v.neighbor, 'curvature', 0.25);
			}
		}
	}

	let i = 0;
	for (let node of graph.nodes()) {
		graph.setNodeAttribute(node, 'x', i);
		graph.setNodeAttribute(node, 'y', i * i - i);
		++i;
	}
	const res = forceAtlas2(graph, { iterations: 100 });
	for (let node of graph.nodes()) {
		graph.setNodeAttribute(node, 'x', res[node]['x']);
		graph.setNodeAttribute(node, 'y', res[node]['y']);
	}

	s.clear();
	s.setGraph(graph);
}

window.onresize = resize_viewer;

window.onload = async function () {
	resize_viewer();
	fill_time_controls('time_control_select');
	set_footer_version_number();
	initialize_sigma();

	let time_control_select = document.getElementById('time_control_select') as HTMLSelectElement;
	time_control_select.onchange = display_graph;
};
