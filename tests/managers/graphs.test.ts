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

import { run_command } from './exec_utils';

import { EdgeMetadata } from '../../src-server/models/graph/edge_metadata';
import { graph_modify_edge, graph_update } from '../../src-server/managers/graphs';
import { server_init_from_data } from '../../src-server/managers/initialization';
import { clear_server } from '../../src-server/managers/clear';
import { graph_from_json } from '../../src-server/io/graph/graph';
import { EnvironmentManager } from '../../src-server/managers/environment_manager';

const configuration = {
	environment: {
		ssl_certificate: {
			public_key_file: 'sadf',
			private_key_file: 'qwer',
			passphrase_file: 'kgj68'
		},
		favicon: 'favicon.png',
		login_page: {
			title: 'Login title',
			icon: 'login.png'
		},
		home_page: {
			title: 'Home title',
			icon: 'home.png'
		}
	},
	server: {
		domain_name: '',
		ports: {
			http: '8080',
			https: '8443'
		}
	},
	rating_system: 'Elo',
	time_controls: [
		{
			id: 'Classical',
			name: 'Classical (90 + 30)'
		},
		{
			id: 'Rapid',
			name: 'Rapid (12 + 5)'
		},
		{
			id: 'Rapid',
			name: 'Rapid (10 + 0)'
		},
		{
			id: 'Blitz',
			name: 'Blitz (5 + 3)'
		}
	],
	behavior: {
		challenges: {
			higher_rated_player_can_decline_challenge_from_lower_rated_player: false
		}
	},
	permissions: {
		admin: ['challenge_user', 'challenge_admin', 'challenge_member', 'challenge_teacher', 'challenge_student'],
		teacher: ['challenge_user', 'challenge_admin', 'challenge_member', 'challenge_teacher', 'challenge_student'],
		member: ['challenge_user', 'challenge_admin', 'challenge_member', 'challenge_teacher', 'challenge_student'],
		student: ['challenge_user', 'challenge_admin', 'challenge_member', 'challenge_teacher', 'challenge_student']
	}
};

describe('Server setup', () => {
	test('Load an empty server', async () => {
		await run_command('./tests/initialize_empty.sh');
		expect(() => server_init_from_data('tests/webpage', configuration)).not.toThrow();
	});
});

describe('Simple construction and query', () => {
	test('Blitz', () => {
		graph_update('A', 'B', 'white_wins', 'Blitz');
		{
			const g = graph_from_json(EnvironmentManager.get_instance().get_dir_graphs_time_control('Blitz'));
			expect(g.get_data_as_white('A', 'B')).toEqual(new EdgeMetadata(1, 0, 0));
			expect(g.get_data_as_black('A', 'B')).toEqual(undefined);
			expect(g.get_out_degree('A')).toBe(1);
			expect(g.get_in_degree('A')).toBe(0);
			expect(g.get_black_opponents('A')).toEqual(['B']);
			expect(g.get_white_opponents('A')).toEqual([]);
			expect(g.get_data_as_white('B', 'A')).toEqual(undefined);
			expect(g.get_data_as_black('B', 'A')).toEqual(new EdgeMetadata(0, 0, 1));
			expect(g.get_out_degree('B')).toBe(0);
			expect(g.get_in_degree('B')).toBe(1);
			expect(g.get_black_opponents('B')).toEqual([]);
			expect(g.get_white_opponents('B')).toEqual(['A']);
		}

		graph_update('A', 'B', 'white_wins', 'Blitz');
		{
			const g = graph_from_json(EnvironmentManager.get_instance().get_dir_graphs_time_control('Blitz'));
			expect(g.get_data_as_white('A', 'B')).toEqual(new EdgeMetadata(2, 0, 0));
			expect(g.get_data_as_black('A', 'B')).toEqual(undefined);
			expect(g.get_out_degree('A')).toBe(1);
			expect(g.get_in_degree('A')).toBe(0);
			expect(g.get_black_opponents('A')).toEqual(['B']);
			expect(g.get_white_opponents('A')).toEqual([]);
			expect(g.get_data_as_white('B', 'A')).toEqual(undefined);
			expect(g.get_data_as_black('B', 'A')).toEqual(new EdgeMetadata(0, 0, 2));
			expect(g.get_out_degree('B')).toBe(0);
			expect(g.get_in_degree('B')).toBe(1);
			expect(g.get_black_opponents('B')).toEqual([]);
			expect(g.get_white_opponents('B')).toEqual(['A']);
		}

		graph_update('A', 'B', 'white_wins', 'Blitz');
		{
			const g = graph_from_json(EnvironmentManager.get_instance().get_dir_graphs_time_control('Blitz'));
			expect(g.get_data_as_white('A', 'B')).toEqual(new EdgeMetadata(3, 0, 0));
			expect(g.get_data_as_black('A', 'B')).toEqual(undefined);
			expect(g.get_out_degree('A')).toBe(1);
			expect(g.get_in_degree('A')).toBe(0);
			expect(g.get_black_opponents('A')).toEqual(['B']);
			expect(g.get_white_opponents('A')).toEqual([]);
			expect(g.get_data_as_white('B', 'A')).toEqual(undefined);
			expect(g.get_data_as_black('B', 'A')).toEqual(new EdgeMetadata(0, 0, 3));
			expect(g.get_out_degree('B')).toBe(0);
			expect(g.get_in_degree('B')).toBe(1);
			expect(g.get_black_opponents('B')).toEqual([]);
			expect(g.get_white_opponents('B')).toEqual(['A']);
		}
	});

	test('Classical', () => {
		graph_update('A', 'B', 'white_wins', 'Classical');
		{
			const g = graph_from_json(EnvironmentManager.get_instance().get_dir_graphs_time_control('Classical'));
			expect(g.get_data_as_white('A', 'B')).toEqual(new EdgeMetadata(1, 0, 0));
			expect(g.get_data_as_black('A', 'B')).toEqual(undefined);
			expect(g.get_out_degree('A')).toBe(1);
			expect(g.get_in_degree('A')).toBe(0);
			expect(g.get_black_opponents('A')).toEqual(['B']);
			expect(g.get_white_opponents('A')).toEqual([]);
			expect(g.get_data_as_white('B', 'A')).toEqual(undefined);
			expect(g.get_data_as_black('B', 'A')).toEqual(new EdgeMetadata(0, 0, 1));
			expect(g.get_out_degree('B')).toBe(0);
			expect(g.get_in_degree('B')).toBe(1);
			expect(g.get_black_opponents('B')).toEqual([]);
			expect(g.get_white_opponents('B')).toEqual(['A']);
		}

		graph_update('A', 'B', 'black_wins', 'Classical');
		{
			const g = graph_from_json(EnvironmentManager.get_instance().get_dir_graphs_time_control('Classical'));
			expect(g.get_data_as_white('A', 'B')).toEqual(new EdgeMetadata(1, 0, 1));
			expect(g.get_data_as_black('A', 'B')).toEqual(undefined);
			expect(g.get_out_degree('A')).toBe(1);
			expect(g.get_in_degree('A')).toBe(0);
			expect(g.get_black_opponents('A')).toEqual(['B']);
			expect(g.get_white_opponents('A')).toEqual([]);
			expect(g.get_data_as_white('B', 'A')).toEqual(undefined);
			expect(g.get_data_as_black('B', 'A')).toEqual(new EdgeMetadata(1, 0, 1));
			expect(g.get_out_degree('B')).toBe(0);
			expect(g.get_in_degree('B')).toBe(1);
			expect(g.get_black_opponents('B')).toEqual([]);
			expect(g.get_white_opponents('B')).toEqual(['A']);
		}

		graph_update('A', 'B', 'draw', 'Classical');
		{
			const g = graph_from_json(EnvironmentManager.get_instance().get_dir_graphs_time_control('Classical'));
			expect(g.get_data_as_white('A', 'B')).toEqual(new EdgeMetadata(1, 1, 1));
			expect(g.get_data_as_black('A', 'B')).toEqual(undefined);
			expect(g.get_out_degree('A')).toBe(1);
			expect(g.get_in_degree('A')).toBe(0);
			expect(g.get_black_opponents('A')).toEqual(['B']);
			expect(g.get_white_opponents('A')).toEqual([]);
			expect(g.get_data_as_white('B', 'A')).toEqual(undefined);
			expect(g.get_data_as_black('B', 'A')).toEqual(new EdgeMetadata(1, 1, 1));
			expect(g.get_out_degree('B')).toBe(0);
			expect(g.get_in_degree('B')).toBe(1);
			expect(g.get_black_opponents('B')).toEqual([]);
			expect(g.get_white_opponents('B')).toEqual(['A']);
		}
	});
});

describe('Server reset', () => {
	test('Clear and reload server', async () => {
		clear_server();
		await run_command('./tests/initialize_empty.sh');
		server_init_from_data('tests/webpage', configuration);
	});
});

describe('Edge update', () => {
	test('Classical', () => {
		graph_update('A', 'B', 'white_wins', 'Classical');
		graph_modify_edge('A', 'B', 'white_wins', 'draw', 'Classical');
		{
			const g = graph_from_json(EnvironmentManager.get_instance().get_dir_graphs_time_control('Classical'));
			expect(g.get_data_as_white('A', 'B')).toEqual(new EdgeMetadata(0, 1, 0));
			expect(g.get_data_as_black('A', 'B')).toEqual(undefined);
			expect(g.get_data_as_white('A', 'C')).toEqual(undefined);
			expect(g.get_data_as_black('A', 'C')).toEqual(undefined);
			expect(g.get_out_degree('A')).toBe(1);
			expect(g.get_in_degree('A')).toBe(0);
			expect(g.get_black_opponents('A')).toEqual(['B']);
			expect(g.get_white_opponents('A')).toEqual([]);
			expect(g.get_data_as_white('B', 'A')).toEqual(undefined);
			expect(g.get_data_as_black('B', 'A')).toEqual(new EdgeMetadata(0, 1, 0));
			expect(g.get_data_as_white('B', 'C')).toEqual(undefined);
			expect(g.get_data_as_black('B', 'C')).toEqual(undefined);
			expect(g.get_out_degree('B')).toBe(0);
			expect(g.get_in_degree('B')).toBe(1);
			expect(g.get_black_opponents('B')).toEqual([]);
			expect(g.get_white_opponents('B')).toEqual(['A']);
			expect(g.get_data_as_white('C', 'A')).toEqual(undefined);
			expect(g.get_data_as_black('C', 'A')).toEqual(undefined);
			expect(g.get_data_as_white('C', 'B')).toEqual(undefined);
			expect(g.get_data_as_black('C', 'B')).toEqual(undefined);
			expect(g.get_out_degree('C')).toBe(0);
			expect(g.get_in_degree('C')).toBe(0);
			expect(g.get_black_opponents('C')).toEqual([]);
			expect(g.get_white_opponents('C')).toEqual([]);
		}

		graph_modify_edge('A', 'B', 'draw', 'black_wins', 'Classical');
		{
			const g = graph_from_json(EnvironmentManager.get_instance().get_dir_graphs_time_control('Classical'));
			expect(g.get_data_as_white('A', 'B')).toEqual(new EdgeMetadata(0, 0, 1));
			expect(g.get_data_as_black('A', 'B')).toEqual(undefined);
			expect(g.get_data_as_white('A', 'C')).toEqual(undefined);
			expect(g.get_data_as_black('A', 'C')).toEqual(undefined);
			expect(g.get_out_degree('A')).toBe(1);
			expect(g.get_in_degree('A')).toBe(0);
			expect(g.get_black_opponents('A')).toEqual(['B']);
			expect(g.get_white_opponents('A')).toEqual([]);
			expect(g.get_data_as_white('B', 'A')).toEqual(undefined);
			expect(g.get_data_as_black('B', 'A')).toEqual(new EdgeMetadata(1, 0, 0));
			expect(g.get_data_as_white('B', 'C')).toEqual(undefined);
			expect(g.get_data_as_black('B', 'C')).toEqual(undefined);
			expect(g.get_out_degree('B')).toBe(0);
			expect(g.get_in_degree('B')).toBe(1);
			expect(g.get_black_opponents('B')).toEqual([]);
			expect(g.get_white_opponents('B')).toEqual(['A']);
			expect(g.get_data_as_white('C', 'A')).toEqual(undefined);
			expect(g.get_data_as_black('C', 'A')).toEqual(undefined);
			expect(g.get_data_as_white('C', 'B')).toEqual(undefined);
			expect(g.get_data_as_black('C', 'B')).toEqual(undefined);
			expect(g.get_out_degree('C')).toBe(0);
			expect(g.get_in_degree('C')).toBe(0);
			expect(g.get_black_opponents('C')).toEqual([]);
			expect(g.get_white_opponents('C')).toEqual([]);
		}

		graph_modify_edge('A', 'B', 'black_wins', 'draw', 'Classical');
		{
			const g = graph_from_json(EnvironmentManager.get_instance().get_dir_graphs_time_control('Classical'));
			expect(g.get_data_as_white('A', 'B')).toEqual(new EdgeMetadata(0, 1, 0));
			expect(g.get_data_as_black('A', 'B')).toEqual(undefined);
			expect(g.get_data_as_white('A', 'C')).toEqual(undefined);
			expect(g.get_data_as_black('A', 'C')).toEqual(undefined);
			expect(g.get_out_degree('A')).toBe(1);
			expect(g.get_in_degree('A')).toBe(0);
			expect(g.get_black_opponents('A')).toEqual(['B']);
			expect(g.get_white_opponents('A')).toEqual([]);
			expect(g.get_data_as_white('B', 'A')).toEqual(undefined);
			expect(g.get_data_as_black('B', 'A')).toEqual(new EdgeMetadata(0, 1, 0));
			expect(g.get_data_as_white('B', 'C')).toEqual(undefined);
			expect(g.get_data_as_black('B', 'C')).toEqual(undefined);
			expect(g.get_out_degree('B')).toBe(0);
			expect(g.get_in_degree('B')).toBe(1);
			expect(g.get_black_opponents('B')).toEqual([]);
			expect(g.get_white_opponents('B')).toEqual(['A']);
			expect(g.get_data_as_white('C', 'A')).toEqual(undefined);
			expect(g.get_data_as_black('C', 'A')).toEqual(undefined);
			expect(g.get_data_as_white('C', 'B')).toEqual(undefined);
			expect(g.get_data_as_black('C', 'B')).toEqual(undefined);
			expect(g.get_out_degree('C')).toBe(0);
			expect(g.get_in_degree('C')).toBe(0);
			expect(g.get_black_opponents('C')).toEqual([]);
			expect(g.get_white_opponents('C')).toEqual([]);
		}

		graph_update('C', 'A', 'white_wins', 'Classical');
		graph_update('C', 'B', 'black_wins', 'Classical');

		graph_modify_edge('C', 'A', 'white_wins', 'draw', 'Classical');
		{
			const g = graph_from_json(EnvironmentManager.get_instance().get_dir_graphs_time_control('Classical'));
			expect(g.get_data_as_white('A', 'B')).toEqual(new EdgeMetadata(0, 1, 0));
			expect(g.get_data_as_black('A', 'B')).toEqual(undefined);
			expect(g.get_data_as_white('A', 'C')).toEqual(undefined);
			expect(g.get_data_as_black('A', 'C')).toEqual(new EdgeMetadata(0, 1, 0));
			expect(g.get_out_degree('A')).toBe(1);
			expect(g.get_in_degree('A')).toBe(1);
			expect(g.get_black_opponents('A')).toEqual(['B']);
			expect(g.get_white_opponents('A')).toEqual(['C']);
			expect(g.get_data_as_white('B', 'A')).toEqual(undefined);
			expect(g.get_data_as_black('B', 'A')).toEqual(new EdgeMetadata(0, 1, 0));
			expect(g.get_data_as_white('B', 'C')).toEqual(undefined);
			expect(g.get_data_as_black('B', 'C')).toEqual(new EdgeMetadata(1, 0, 0));
			expect(g.get_out_degree('B')).toBe(0);
			expect(g.get_in_degree('B')).toBe(2);
			expect(g.get_black_opponents('B')).toEqual([]);
			expect(g.get_white_opponents('B')).toEqual(['A', 'C']);
			expect(g.get_data_as_white('C', 'A')).toEqual(new EdgeMetadata(0, 1, 0));
			expect(g.get_data_as_black('C', 'A')).toEqual(undefined);
			expect(g.get_data_as_white('C', 'B')).toEqual(new EdgeMetadata(0, 0, 1));
			expect(g.get_data_as_black('C', 'B')).toEqual(undefined);
			expect(g.get_out_degree('C')).toBe(2);
			expect(g.get_in_degree('C')).toBe(0);
			expect(g.get_black_opponents('C')).toEqual(['A', 'B']);
			expect(g.get_white_opponents('C')).toEqual([]);
		}

		graph_modify_edge('C', 'B', 'black_wins', 'draw', 'Classical');
		{
			const g = graph_from_json(EnvironmentManager.get_instance().get_dir_graphs_time_control('Classical'));
			expect(g.get_data_as_white('A', 'B')).toEqual(new EdgeMetadata(0, 1, 0));
			expect(g.get_data_as_black('A', 'B')).toEqual(undefined);
			expect(g.get_data_as_white('A', 'C')).toEqual(undefined);
			expect(g.get_data_as_black('A', 'C')).toEqual(new EdgeMetadata(0, 1, 0));
			expect(g.get_out_degree('A')).toBe(1);
			expect(g.get_in_degree('A')).toBe(1);
			expect(g.get_black_opponents('A')).toEqual(['B']);
			expect(g.get_white_opponents('A')).toEqual(['C']);
			expect(g.get_data_as_white('B', 'A')).toEqual(undefined);
			expect(g.get_data_as_black('B', 'A')).toEqual(new EdgeMetadata(0, 1, 0));
			expect(g.get_data_as_white('B', 'C')).toEqual(undefined);
			expect(g.get_data_as_black('B', 'C')).toEqual(new EdgeMetadata(0, 1, 0));
			expect(g.get_out_degree('B')).toBe(0);
			expect(g.get_in_degree('B')).toBe(2);
			expect(g.get_black_opponents('B')).toEqual([]);
			expect(g.get_white_opponents('B')).toEqual(['A', 'C']);
			expect(g.get_data_as_white('C', 'A')).toEqual(new EdgeMetadata(0, 1, 0));
			expect(g.get_data_as_black('C', 'A')).toEqual(undefined);
			expect(g.get_data_as_white('C', 'B')).toEqual(new EdgeMetadata(0, 1, 0));
			expect(g.get_data_as_black('C', 'B')).toEqual(undefined);
			expect(g.get_out_degree('C')).toBe(2);
			expect(g.get_in_degree('C')).toBe(0);
			expect(g.get_black_opponents('C')).toEqual(['A', 'B']);
			expect(g.get_white_opponents('C')).toEqual([]);
		}
	});
});
