/*
Elo rating for a Chess Club
Copyright (C) 2023 - 2026  Lluís Alemany Puig

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

import { messageFromResponse, serverCall } from '@client/action';
import { Route, ROUTES } from '@common/routes';
import { QueryGraphOutput } from '@common/schemas/query-graphs';
import { TimeControlId } from '@common/models/time-control';

let s: Sigma;
let graphData: QueryGraphOutput;
let serverGraph: Graph;
let graphLoaded: boolean = false;

let minRating: number;
let maxRating: number;

let minGames: number;
let maxGames: number;
let minEdgeWeight: number;
let maxEdgeWeight: number;

function weightEdge(weight: any): number {
	return 10 * weight.wins + 5 * weight.draws + weight.losses;
}

function normalize(v: number, min: number, max: number): number {
	if (max == min) {
		return 1;
	}
	return (v - min) / (max - min);
}

function resizeViewer() {
	const viewportHeight = window.innerHeight;
	let viewer = document.getElementById('graph-viewer') as HTMLDivElement;
	const newHeight = viewportHeight - 20 - 20;
	viewer.setAttribute('style', `width: 100%; height: ${newHeight}px`);
}

function initializeSigma() {
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

async function loadGraph() {
	const selectTimeControl = document.getElementById('select-time-control') as HTMLSelectElement;
	const timeControlId = selectTimeControl.options[selectTimeControl.selectedIndex].value as TimeControlId;

	if (timeControlId == '') {
		return;
	}

	const val = document.getElementById('graph-viewer')?.getAttribute('value');
	const queryToServer: Route = (() => {
		if (val == 'full') {
			return ROUTES.QUERY_GRAPH_FULL;
		}
		if (val == 'own') {
			return ROUTES.QUERY_GRAPH_OWN;
		}
		throw new Error(`Wrong value for page configuration ${val}`);
	})();

	// "query" the server
	const response = await serverCall(queryToServer, { timeControlId: timeControlId });
	if (response.status === 'Error') {
		alert(messageFromResponse(response));
		return;
	}

	graphData = response.value;

	if (graphLoaded) {
		serverGraph.clear();
	}
	serverGraph = new Graph({ type: 'directed' });

	minRating = 99999;
	maxRating = 0;
	for (const node of graphData.nodes) {
		serverGraph.addNode(node.id, { label: node.fullName });

		const r = node.weight.rating;
		minRating = r < minRating ? r : minRating;
		maxRating = r > maxRating ? r : maxRating;
	}

	minGames = 9999;
	maxGames = 0;
	minEdgeWeight = 9999;
	maxEdgeWeight = 0;
	for (const edge of graphData.edges) {
		serverGraph.addEdge(edge.source, edge.target, { label: edge.label });

		const numGames = edge.weight.wins + edge.weight.draws + edge.weight.losses;
		minGames = numGames < minGames ? numGames : minGames;
		maxGames = numGames > maxGames ? numGames : maxGames;

		const edgeW = weightEdge(edge.weight);
		minEdgeWeight = edgeW < minEdgeWeight ? edgeW : minEdgeWeight;
		maxEdgeWeight = edgeW > maxEdgeWeight ? edgeW : maxEdgeWeight;
	}

	for (const u of serverGraph.nodeEntries()) {
		for (const v of serverGraph.outNeighborEntries(u.node)) {
			const found = serverGraph.hasDirectedEdge(v.neighbor, u.node);
			if (found) {
				serverGraph.setEdgeAttribute(u.node, v.neighbor, 'type', 'curvedArrow');
				serverGraph.setEdgeAttribute(u.node, v.neighbor, 'curvature', 0.25);
			}
		}
	}

	graphLoaded = true;
}

function colorPickerNodeChanged(_event: any) {
	if (!graphLoaded) {
		return;
	}

	const selectNodeColor = document.getElementById('select-node-color') as HTMLSelectElement;
	const option = selectNodeColor.options[selectNodeColor.selectedIndex].value;
	const colorPickerNode = document.getElementById('color-picker-node') as HTMLInputElement;

	if (option == 'fixed') {
		for (const node of graphData.nodes) {
			serverGraph.setNodeAttribute(node.id, 'color', colorPickerNode.value);
		}
	} else if (option == 'dynamicRating') {
		const colorInterpolator = scaleLinear<string>()
			.domain([0, 1])
			.interpolate(interpolateRgb)
			.range(['#F6F5F4', colorPickerNode.value]);

		console.log('minRating', minRating);
		console.log('maxRating', maxRating);
		for (const node of graphData.nodes) {
			const k = (node.weight.rating - minRating) / (maxRating - minRating);
			serverGraph.setNodeAttribute(node.id, 'color', colorInterpolator(k));
		}
	}

	displayGraph();
}

function selectNodeColorChanged(_event: any) {
	if (!graphLoaded) {
		return;
	}

	colorPickerNodeChanged(null);
}

function colorPickerEdgeChanged(_event: any) {
	if (!graphLoaded) {
		return;
	}

	const selectNodeColor = document.getElementById('select-edge-color') as HTMLSelectElement;
	const option = selectNodeColor.options[selectNodeColor.selectedIndex].value;
	const colorPickerNode = document.getElementById('color-picker-edge') as HTMLInputElement;

	if (option == 'fixed') {
		const color = colorPickerNode.value;
		for (const edge of graphData.edges) {
			serverGraph.setEdgeAttribute(edge.source, edge.target, 'color', color);
		}
	} else if (option == 'dynamicGames') {
		const colorInterpolator = scaleLinear<string>()
			.domain([0, 1])
			.interpolate(interpolateRgb)
			.range(['#F6F5F4', colorPickerNode.value]);

		for (const edge of graphData.edges) {
			const numGames = edge.weight.wins + edge.weight.draws + edge.weight.losses;
			let k: number;
			if (numGames == minGames && numGames == maxGames) {
				k = 1;
			} else {
				k = normalize(numGames, minGames, maxGames);
			}
			serverGraph.setEdgeAttribute(edge.source, edge.target, 'color', colorInterpolator(k));
		}
	} else if (option == 'dynamicResults') {
		const colorInterpolator = scaleLinear<string>()
			.domain([0, 1])
			.interpolate(interpolateRgb)
			.range(['#F6F5F4', colorPickerNode.value]);

		for (const edge of graphData.edges) {
			const edgeW = weightEdge(edge.weight);
			let k: number;
			if (edgeW == minEdgeWeight && edgeW == maxEdgeWeight) {
				k = 1;
			} else {
				k = normalize(edgeW, minEdgeWeight, maxEdgeWeight);
			}
			serverGraph.setEdgeAttribute(edge.source, edge.target, 'color', colorInterpolator(k));
		}
	}

	displayGraph();
}

function selectEdgeColorChanged(_event: any) {
	if (!graphLoaded) {
		return;
	}

	colorPickerEdgeChanged(null);
}

function sizePickerNodeChanged(_event: any) {
	if (!graphLoaded) {
		return;
	}

	const selectNodeSize = document.getElementById('select-node-size') as HTMLSelectElement;
	const option = selectNodeSize.options[selectNodeSize.selectedIndex].value;
	const sizePickerNode = document.getElementById('size-picker-node') as HTMLInputElement;

	if (option == 'fixed') {
		for (const node of graphData.nodes) {
			serverGraph.setNodeAttribute(node.id, 'size', sizePickerNode.value);
		}
	} else if (option == 'dynamicRating') {
		const M = parseInt(sizePickerNode.value);
		for (const node of graphData.nodes) {
			const r = node.weight.rating;
			const k = M * (1 + normalize(r, minRating, maxRating));
			serverGraph.setNodeAttribute(node.id, 'size', k);
		}
	}
	displayGraph();
}

function selectNodeSizeChanged(_event: any) {
	if (!graphLoaded) {
		return;
	}

	sizePickerNodeChanged(null);
}

function sizePickerEdgeChanged(_event: any) {
	if (!graphLoaded) {
		return;
	}

	const selectNodeSize = document.getElementById('select-edge-size') as HTMLSelectElement;
	const option = selectNodeSize.options[selectNodeSize.selectedIndex].value;
	const sizePickerNode = document.getElementById('size-picker-edge') as HTMLInputElement;
	const M = parseInt(sizePickerNode.value);

	if (option == 'fixed') {
		for (const edge of graphData.edges) {
			serverGraph.setEdgeAttribute(edge.source, edge.target, 'size', sizePickerNode.value);
		}
	} else if (option == 'dynamicGames') {
		for (const edge of graphData.edges) {
			const numGames = edge.weight.wins + edge.weight.draws + edge.weight.losses;
			const k = M * (1 + normalize(numGames, minGames, maxGames));
			serverGraph.setEdgeAttribute(edge.source, edge.target, 'size', k);
		}
	} else if (option == 'dynamicResults') {
		for (const edge of graphData.edges) {
			const edgeW = weightEdge(edge.weight);
			const k: number = M * (1 + normalize(edgeW, minEdgeWeight, maxEdgeWeight));
			serverGraph.setEdgeAttribute(edge.source, edge.target, 'size', k);
		}
	}

	displayGraph();
}

function selectEdgeSizeChanged(_event: any) {
	if (!graphLoaded) {
		return;
	}

	sizePickerEdgeChanged(null);
}

function computeCoordinates() {
	if (!graphLoaded) {
		return;
	}

	let i = 0;
	for (const node of serverGraph.nodes()) {
		serverGraph.setNodeAttribute(node, 'x', i);
		serverGraph.setNodeAttribute(node, 'y', i * i - i);
		++i;
	}
	const res = forceAtlas2(serverGraph, { iterations: 100 });
	for (const node of serverGraph.nodes()) {
		serverGraph.setNodeAttribute(node, 'x', res[node]['x']);
		serverGraph.setNodeAttribute(node, 'y', res[node]['y']);
	}
}

function displayGraph() {
	computeCoordinates();
	s.clear();
	s.setGraph(serverGraph);
}

async function loadAndDisplay(_event: any) {
	await loadGraph();
	sizePickerNodeChanged(null);
	colorPickerNodeChanged(null);
	sizePickerEdgeChanged(null);
	colorPickerEdgeChanged(null);
	displayGraph();
}

window.onresize = resizeViewer;

window.onload = async function () {
	const menu = document.getElementById('side-menu') as HTMLDivElement;
	let toggleBtn = document.getElementById('menu-toggle-btn') as HTMLDivElement;
	let arrow = document.getElementById('menu-arrow') as HTMLSpanElement;

	toggleBtn.addEventListener('click', function () {
		const isHidden = menu.classList.toggle('hide');
		arrow.innerHTML = isHidden ? '>' : '<';
	});

	resizeViewer();
	initializeSigma();

	let selectTimeControl = document.getElementById('select-time-control') as HTMLSelectElement;
	selectTimeControl.onchange = loadAndDisplay;

	let selectNodeColor = document.getElementById('select-node-color') as HTMLSelectElement;
	selectNodeColor.onchange = selectNodeColorChanged;
	let colorPickerNode = document.getElementById('color-picker-node') as HTMLInputElement;
	colorPickerNode.onchange = colorPickerNodeChanged;

	let selectEdgeColor = document.getElementById('select-edge-color') as HTMLSelectElement;
	selectEdgeColor.onchange = selectEdgeColorChanged;
	let colorPickerEdge = document.getElementById('color-picker-edge') as HTMLInputElement;
	colorPickerEdge.onchange = colorPickerEdgeChanged;

	let selectNodeSize = document.getElementById('select-node-size') as HTMLSelectElement;
	selectNodeSize.onchange = selectNodeSizeChanged;
	let sizePickerNode = document.getElementById('size-picker-node') as HTMLInputElement;
	sizePickerNode.onchange = sizePickerNodeChanged;

	let selectEdgeSize = document.getElementById('select-edge-size') as HTMLSelectElement;
	selectEdgeSize.onchange = selectEdgeSizeChanged;
	let sizePickerEdge = document.getElementById('size-picker-edge') as HTMLInputElement;
	sizePickerEdge.onchange = sizePickerEdgeChanged;
};
