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

import fs from 'fs';
import path from 'path';

import { game_add_new, game_delete } from '../../src-server/managers/games';
import { server_init_from_data } from '../../src-server/managers/initialization';
import { user_add_new } from '../../src-server/managers/users';
import { ADMIN } from '../../src-server/models/user_role';
import { run_command } from './exec_utils';
import { User } from '../../src-server/models/user';
import { UsersManager } from '../../src-server/managers/users_manager';
import { GamesManager } from '../../src-server/managers/games_manager';
import { EnvironmentManager } from '../../src-server/managers/environment_manager';
import { EdgeMetadata } from '../../src-server/models/graph/edge_metadata';
import { GraphsManager } from '../../src-server/managers/graphs_manager';
import { Graph } from '../../src-server/models/graph/graph';

const configuration = {
	ssl_certificate: {
		public_key_file: 'sadf',
		private_key_file: 'qwer',
		passphrase_file: 'kgj68'
	},
	ports: {
		http: '8080',
		https: '8443'
	},
	favicon: 'favicon.png',
	login_page: {
		title: 'Login title',
		icon: 'login.png'
	},
	home_page: {
		title: 'Home title',
		icon: 'home.png'
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
	permissions: {
		admin: [],
		teacher: [],
		member: [],
		student: []
	}
};

let a: User;
let b: User;
let c: User;
let d: User;
let e: User;
let f: User;

function u(username: string): User {
	return UsersManager.get_instance().get_user_by_username(username) as User;
}

describe('Server setup', () => {
	test('Fill an empty server', async () => {
		await run_command('./tests/initialize_empty.sh');
		expect(() => server_init_from_data('tests/webpage', configuration)).not.toThrow();

		a = user_add_new('a', 'A', 'aa', 'aaaa', [ADMIN]);
		b = user_add_new('b', 'B', 'bb', 'dddd', [ADMIN]);
		c = user_add_new('c', 'C', 'cc', 'cccc', [ADMIN]);
		d = user_add_new('d', 'D', 'dd', 'dddd', [ADMIN]);
		e = user_add_new('e', 'E', 'ee', 'eeee', [ADMIN]);
		f = user_add_new('f', 'F', 'ff', 'ffff', [ADMIN]);
	});
});

describe('Sequential game creation', () => {
	test('Add "Blitz" games', () => {
		game_add_new(u('a'), u('b'), 'white_wins', 'Blitz', 'Blitz (5 + 3)', '2025-01-19', '17:06:00:000');
		game_add_new(u('c'), u('d'), 'black_wins', 'Blitz', 'Blitz (5 + 3)', '2025-01-19', '17:06:10:000');
		game_add_new(u('e'), u('f'), 'draw', 'Blitz', 'Blitz (5 + 3)', '2025-01-19', '17:06:20:000');
		game_add_new(u('a'), u('f'), 'black_wins', 'Blitz', 'Blitz (5 + 3)', '2025-01-19', '17:06:30:000');
		game_add_new(u('b'), u('a'), 'white_wins', 'Blitz', 'Blitz (5 + 3)', '2025-01-19', '17:06:40:000');

		expect(a.get_games('Blitz').length).toBe(1);
		expect(b.get_games('Blitz').length).toBe(1);
		expect(c.get_games('Blitz').length).toBe(1);
		expect(d.get_games('Blitz').length).toBe(1);
		expect(e.get_games('Blitz').length).toBe(1);
		expect(f.get_games('Blitz').length).toBe(1);

		expect(a.get_rating('Blitz').num_won_drawn_lost()).toEqual([3, 1, 0, 2]);
		expect(b.get_rating('Blitz').num_won_drawn_lost()).toEqual([2, 1, 0, 1]);
		expect(c.get_rating('Blitz').num_won_drawn_lost()).toEqual([1, 0, 0, 1]);
		expect(d.get_rating('Blitz').num_won_drawn_lost()).toEqual([1, 1, 0, 0]);
		expect(e.get_rating('Blitz').num_won_drawn_lost()).toEqual([1, 0, 1, 0]);
		expect(f.get_rating('Blitz').num_won_drawn_lost()).toEqual([2, 1, 1, 0]);
	});

	test('Check "Blitz" graph', () => {
		const graphs_manager = GraphsManager.get_instance();
		const g = graphs_manager.get_graph('Blitz') as Graph;

		// white

		expect(g.get_data_as_white('a', 'b')).toEqual(new EdgeMetadata(1, 0, 0));
		expect(g.get_data_as_white('a', 'c')).toEqual(undefined);
		expect(g.get_data_as_white('a', 'd')).toEqual(undefined);
		expect(g.get_data_as_white('a', 'e')).toEqual(undefined);
		expect(g.get_data_as_white('a', 'f')).toEqual(new EdgeMetadata(0, 0, 1));

		expect(g.get_data_as_white('b', 'a')).toEqual(new EdgeMetadata(1, 0, 0));
		expect(g.get_data_as_white('b', 'c')).toEqual(undefined);
		expect(g.get_data_as_white('b', 'd')).toEqual(undefined);
		expect(g.get_data_as_white('b', 'e')).toEqual(undefined);
		expect(g.get_data_as_white('b', 'f')).toEqual(undefined);

		expect(g.get_data_as_white('c', 'a')).toEqual(undefined);
		expect(g.get_data_as_white('c', 'b')).toEqual(undefined);
		expect(g.get_data_as_white('c', 'd')).toEqual(new EdgeMetadata(0, 0, 1));
		expect(g.get_data_as_white('c', 'e')).toEqual(undefined);
		expect(g.get_data_as_white('c', 'f')).toEqual(undefined);

		expect(g.get_data_as_white('d', 'a')).toEqual(undefined);
		expect(g.get_data_as_white('d', 'b')).toEqual(undefined);
		expect(g.get_data_as_white('d', 'c')).toEqual(undefined);
		expect(g.get_data_as_white('d', 'e')).toEqual(undefined);
		expect(g.get_data_as_white('d', 'f')).toEqual(undefined);

		expect(g.get_data_as_white('e', 'a')).toEqual(undefined);
		expect(g.get_data_as_white('e', 'b')).toEqual(undefined);
		expect(g.get_data_as_white('e', 'c')).toEqual(undefined);
		expect(g.get_data_as_white('e', 'd')).toEqual(undefined);
		expect(g.get_data_as_white('e', 'f')).toEqual(new EdgeMetadata(0, 1, 0));

		expect(g.get_data_as_white('f', 'a')).toEqual(undefined);
		expect(g.get_data_as_white('f', 'b')).toEqual(undefined);
		expect(g.get_data_as_white('f', 'c')).toEqual(undefined);
		expect(g.get_data_as_white('f', 'd')).toEqual(undefined);
		expect(g.get_data_as_white('f', 'e')).toEqual(undefined);

		// black

		expect(g.get_data_as_black('a', 'b')).toEqual(new EdgeMetadata(0, 0, 1));
		expect(g.get_data_as_black('a', 'c')).toEqual(undefined);
		expect(g.get_data_as_black('a', 'd')).toEqual(undefined);
		expect(g.get_data_as_black('a', 'e')).toEqual(undefined);
		expect(g.get_data_as_black('a', 'f')).toEqual(undefined);

		expect(g.get_data_as_black('b', 'a')).toEqual(new EdgeMetadata(0, 0, 1));
		expect(g.get_data_as_black('b', 'c')).toEqual(undefined);
		expect(g.get_data_as_black('b', 'd')).toEqual(undefined);
		expect(g.get_data_as_black('b', 'e')).toEqual(undefined);
		expect(g.get_data_as_black('b', 'f')).toEqual(undefined);

		expect(g.get_data_as_black('c', 'a')).toEqual(undefined);
		expect(g.get_data_as_black('c', 'b')).toEqual(undefined);
		expect(g.get_data_as_black('c', 'd')).toEqual(undefined);
		expect(g.get_data_as_black('c', 'e')).toEqual(undefined);
		expect(g.get_data_as_black('c', 'f')).toEqual(undefined);

		expect(g.get_data_as_black('d', 'a')).toEqual(undefined);
		expect(g.get_data_as_black('d', 'b')).toEqual(undefined);
		expect(g.get_data_as_black('d', 'c')).toEqual(new EdgeMetadata(1, 0, 0));
		expect(g.get_data_as_black('d', 'e')).toEqual(undefined);
		expect(g.get_data_as_black('d', 'f')).toEqual(undefined);

		expect(g.get_data_as_black('e', 'a')).toEqual(undefined);
		expect(g.get_data_as_black('e', 'b')).toEqual(undefined);
		expect(g.get_data_as_black('e', 'c')).toEqual(undefined);
		expect(g.get_data_as_black('e', 'd')).toEqual(undefined);
		expect(g.get_data_as_black('e', 'f')).toEqual(undefined);

		expect(g.get_data_as_black('f', 'a')).toEqual(new EdgeMetadata(1, 0, 0));
		expect(g.get_data_as_black('f', 'b')).toEqual(undefined);
		expect(g.get_data_as_black('f', 'c')).toEqual(undefined);
		expect(g.get_data_as_black('f', 'd')).toEqual(undefined);
		expect(g.get_data_as_black('f', 'e')).toEqual(new EdgeMetadata(0, 1, 0));

		const blitz_dir = EnvironmentManager.get_instance().get_dir_graphs_time_control('Blitz');
		expect(fs.existsSync(path.join(blitz_dir, 'a'))).toBe(true);
		expect(fs.existsSync(path.join(blitz_dir, 'b'))).toBe(true);
		expect(fs.existsSync(path.join(blitz_dir, 'c'))).toBe(true);
		expect(fs.existsSync(path.join(blitz_dir, 'e'))).toBe(true);
	});

	test('Delete game 0000000001', () => {
		expect(() => game_delete('0000000001')).not.toThrow();

		let man = GamesManager.get_instance();
		expect(man.game_exists('0000000001')).toBe(false);
		expect(man.game_exists('0000000002')).toBe(true);
		expect(man.game_exists('0000000003')).toBe(true);
		expect(man.game_exists('0000000004')).toBe(true);
		expect(man.game_exists('0000000005')).toBe(true);

		expect(a.get_games('Blitz').length).toBe(1);
		expect(b.get_games('Blitz').length).toBe(1);
		expect(c.get_games('Blitz').length).toBe(1);
		expect(d.get_games('Blitz').length).toBe(1);
		expect(e.get_games('Blitz').length).toBe(1);
		expect(f.get_games('Blitz').length).toBe(1);

		expect(a.get_rating('Blitz').num_won_drawn_lost()).toEqual([2, 0, 0, 2]);
		expect(b.get_rating('Blitz').num_won_drawn_lost()).toEqual([1, 1, 0, 0]);
		expect(c.get_rating('Blitz').num_won_drawn_lost()).toEqual([1, 0, 0, 1]);
		expect(d.get_rating('Blitz').num_won_drawn_lost()).toEqual([1, 1, 0, 0]);
		expect(e.get_rating('Blitz').num_won_drawn_lost()).toEqual([1, 0, 1, 0]);
		expect(f.get_rating('Blitz').num_won_drawn_lost()).toEqual([2, 1, 1, 0]);

		const blitz_dir = EnvironmentManager.get_instance().get_dir_games_time_control('Blitz');
		expect(fs.existsSync(path.join(blitz_dir, '2025-01-19'))).toBe(true);
	});

	test('Check "Blitz" graph', () => {
		const graphs_manager = GraphsManager.get_instance();
		const g = graphs_manager.get_graph('Blitz') as Graph;

		// white

		expect(g.get_data_as_white('a', 'b')).toEqual(undefined);
		expect(g.get_data_as_white('a', 'c')).toEqual(undefined);
		expect(g.get_data_as_white('a', 'd')).toEqual(undefined);
		expect(g.get_data_as_white('a', 'e')).toEqual(undefined);
		expect(g.get_data_as_white('a', 'f')).toEqual(new EdgeMetadata(0, 0, 1));

		expect(g.get_data_as_white('b', 'a')).toEqual(new EdgeMetadata(1, 0, 0));
		expect(g.get_data_as_white('b', 'c')).toEqual(undefined);
		expect(g.get_data_as_white('b', 'd')).toEqual(undefined);
		expect(g.get_data_as_white('b', 'e')).toEqual(undefined);
		expect(g.get_data_as_white('b', 'f')).toEqual(undefined);

		expect(g.get_data_as_white('c', 'a')).toEqual(undefined);
		expect(g.get_data_as_white('c', 'b')).toEqual(undefined);
		expect(g.get_data_as_white('c', 'd')).toEqual(new EdgeMetadata(0, 0, 1));
		expect(g.get_data_as_white('c', 'e')).toEqual(undefined);
		expect(g.get_data_as_white('c', 'f')).toEqual(undefined);

		expect(g.get_data_as_white('d', 'a')).toEqual(undefined);
		expect(g.get_data_as_white('d', 'b')).toEqual(undefined);
		expect(g.get_data_as_white('d', 'c')).toEqual(undefined);
		expect(g.get_data_as_white('d', 'e')).toEqual(undefined);
		expect(g.get_data_as_white('d', 'f')).toEqual(undefined);

		expect(g.get_data_as_white('e', 'a')).toEqual(undefined);
		expect(g.get_data_as_white('e', 'b')).toEqual(undefined);
		expect(g.get_data_as_white('e', 'c')).toEqual(undefined);
		expect(g.get_data_as_white('e', 'd')).toEqual(undefined);
		expect(g.get_data_as_white('e', 'f')).toEqual(new EdgeMetadata(0, 1, 0));

		expect(g.get_data_as_white('f', 'a')).toEqual(undefined);
		expect(g.get_data_as_white('f', 'b')).toEqual(undefined);
		expect(g.get_data_as_white('f', 'c')).toEqual(undefined);
		expect(g.get_data_as_white('f', 'd')).toEqual(undefined);
		expect(g.get_data_as_white('f', 'e')).toEqual(undefined);

		// black

		expect(g.get_data_as_black('a', 'b')).toEqual(new EdgeMetadata(0, 0, 1));
		expect(g.get_data_as_black('a', 'c')).toEqual(undefined);
		expect(g.get_data_as_black('a', 'd')).toEqual(undefined);
		expect(g.get_data_as_black('a', 'e')).toEqual(undefined);
		expect(g.get_data_as_black('a', 'f')).toEqual(undefined);

		expect(g.get_data_as_black('b', 'a')).toEqual(undefined);
		expect(g.get_data_as_black('b', 'c')).toEqual(undefined);
		expect(g.get_data_as_black('b', 'd')).toEqual(undefined);
		expect(g.get_data_as_black('b', 'e')).toEqual(undefined);
		expect(g.get_data_as_black('b', 'f')).toEqual(undefined);

		expect(g.get_data_as_black('c', 'a')).toEqual(undefined);
		expect(g.get_data_as_black('c', 'b')).toEqual(undefined);
		expect(g.get_data_as_black('c', 'd')).toEqual(undefined);
		expect(g.get_data_as_black('c', 'e')).toEqual(undefined);
		expect(g.get_data_as_black('c', 'f')).toEqual(undefined);

		expect(g.get_data_as_black('d', 'a')).toEqual(undefined);
		expect(g.get_data_as_black('d', 'b')).toEqual(undefined);
		expect(g.get_data_as_black('d', 'c')).toEqual(new EdgeMetadata(1, 0, 0));
		expect(g.get_data_as_black('d', 'e')).toEqual(undefined);
		expect(g.get_data_as_black('d', 'f')).toEqual(undefined);

		expect(g.get_data_as_black('e', 'a')).toEqual(undefined);
		expect(g.get_data_as_black('e', 'b')).toEqual(undefined);
		expect(g.get_data_as_black('e', 'c')).toEqual(undefined);
		expect(g.get_data_as_black('e', 'd')).toEqual(undefined);
		expect(g.get_data_as_black('e', 'f')).toEqual(undefined);

		expect(g.get_data_as_black('f', 'a')).toEqual(new EdgeMetadata(1, 0, 0));
		expect(g.get_data_as_black('f', 'b')).toEqual(undefined);
		expect(g.get_data_as_black('f', 'c')).toEqual(undefined);
		expect(g.get_data_as_black('f', 'd')).toEqual(undefined);
		expect(g.get_data_as_black('f', 'e')).toEqual(new EdgeMetadata(0, 1, 0));

		const blitz_dir = EnvironmentManager.get_instance().get_dir_graphs_time_control('Blitz');
		expect(fs.existsSync(path.join(blitz_dir, 'a'))).toBe(true);
		expect(fs.existsSync(path.join(blitz_dir, 'b'))).toBe(true);
		expect(fs.existsSync(path.join(blitz_dir, 'c'))).toBe(true);
		expect(fs.existsSync(path.join(blitz_dir, 'e'))).toBe(true);
	});

	test('Delete game 0000000004', () => {
		expect(() => game_delete('0000000004')).not.toThrow();

		let man = GamesManager.get_instance();
		expect(man.game_exists('0000000001')).toBe(false);
		expect(man.game_exists('0000000002')).toBe(true);
		expect(man.game_exists('0000000003')).toBe(true);
		expect(man.game_exists('0000000004')).toBe(false);
		expect(man.game_exists('0000000005')).toBe(true);

		expect(a.get_games('Blitz').length).toBe(1);
		expect(b.get_games('Blitz').length).toBe(1);
		expect(c.get_games('Blitz').length).toBe(1);
		expect(d.get_games('Blitz').length).toBe(1);
		expect(e.get_games('Blitz').length).toBe(1);
		expect(f.get_games('Blitz').length).toBe(1);

		expect(a.get_rating('Blitz').num_won_drawn_lost()).toEqual([1, 0, 0, 1]);
		expect(b.get_rating('Blitz').num_won_drawn_lost()).toEqual([1, 1, 0, 0]);
		expect(c.get_rating('Blitz').num_won_drawn_lost()).toEqual([1, 0, 0, 1]);
		expect(d.get_rating('Blitz').num_won_drawn_lost()).toEqual([1, 1, 0, 0]);
		expect(e.get_rating('Blitz').num_won_drawn_lost()).toEqual([1, 0, 1, 0]);
		expect(f.get_rating('Blitz').num_won_drawn_lost()).toEqual([1, 0, 1, 0]);

		const blitz_dir = EnvironmentManager.get_instance().get_dir_games_time_control('Blitz');
		expect(fs.existsSync(path.join(blitz_dir, '2025-01-19'))).toBe(true);
	});

	test('Check "Blitz" graph', () => {
		const graphs_manager = GraphsManager.get_instance();
		const g = graphs_manager.get_graph('Blitz') as Graph;

		// white

		expect(g.get_data_as_white('a', 'b')).toEqual(undefined);
		expect(g.get_data_as_white('a', 'c')).toEqual(undefined);
		expect(g.get_data_as_white('a', 'd')).toEqual(undefined);
		expect(g.get_data_as_white('a', 'e')).toEqual(undefined);
		expect(g.get_data_as_white('a', 'f')).toEqual(undefined);

		expect(g.get_data_as_white('b', 'a')).toEqual(new EdgeMetadata(1, 0, 0));
		expect(g.get_data_as_white('b', 'c')).toEqual(undefined);
		expect(g.get_data_as_white('b', 'd')).toEqual(undefined);
		expect(g.get_data_as_white('b', 'e')).toEqual(undefined);
		expect(g.get_data_as_white('b', 'f')).toEqual(undefined);

		expect(g.get_data_as_white('c', 'a')).toEqual(undefined);
		expect(g.get_data_as_white('c', 'b')).toEqual(undefined);
		expect(g.get_data_as_white('c', 'd')).toEqual(new EdgeMetadata(0, 0, 1));
		expect(g.get_data_as_white('c', 'e')).toEqual(undefined);
		expect(g.get_data_as_white('c', 'f')).toEqual(undefined);

		expect(g.get_data_as_white('d', 'a')).toEqual(undefined);
		expect(g.get_data_as_white('d', 'b')).toEqual(undefined);
		expect(g.get_data_as_white('d', 'c')).toEqual(undefined);
		expect(g.get_data_as_white('d', 'e')).toEqual(undefined);
		expect(g.get_data_as_white('d', 'f')).toEqual(undefined);

		expect(g.get_data_as_white('e', 'a')).toEqual(undefined);
		expect(g.get_data_as_white('e', 'b')).toEqual(undefined);
		expect(g.get_data_as_white('e', 'c')).toEqual(undefined);
		expect(g.get_data_as_white('e', 'd')).toEqual(undefined);
		expect(g.get_data_as_white('e', 'f')).toEqual(new EdgeMetadata(0, 1, 0));

		expect(g.get_data_as_white('f', 'a')).toEqual(undefined);
		expect(g.get_data_as_white('f', 'b')).toEqual(undefined);
		expect(g.get_data_as_white('f', 'c')).toEqual(undefined);
		expect(g.get_data_as_white('f', 'd')).toEqual(undefined);
		expect(g.get_data_as_white('f', 'e')).toEqual(undefined);

		// black

		expect(g.get_data_as_black('a', 'b')).toEqual(new EdgeMetadata(0, 0, 1));
		expect(g.get_data_as_black('a', 'c')).toEqual(undefined);
		expect(g.get_data_as_black('a', 'd')).toEqual(undefined);
		expect(g.get_data_as_black('a', 'e')).toEqual(undefined);
		expect(g.get_data_as_black('a', 'f')).toEqual(undefined);

		expect(g.get_data_as_black('b', 'a')).toEqual(undefined);
		expect(g.get_data_as_black('b', 'c')).toEqual(undefined);
		expect(g.get_data_as_black('b', 'd')).toEqual(undefined);
		expect(g.get_data_as_black('b', 'e')).toEqual(undefined);
		expect(g.get_data_as_black('b', 'f')).toEqual(undefined);

		expect(g.get_data_as_black('c', 'a')).toEqual(undefined);
		expect(g.get_data_as_black('c', 'b')).toEqual(undefined);
		expect(g.get_data_as_black('c', 'd')).toEqual(undefined);
		expect(g.get_data_as_black('c', 'e')).toEqual(undefined);
		expect(g.get_data_as_black('c', 'f')).toEqual(undefined);

		expect(g.get_data_as_black('d', 'a')).toEqual(undefined);
		expect(g.get_data_as_black('d', 'b')).toEqual(undefined);
		expect(g.get_data_as_black('d', 'c')).toEqual(new EdgeMetadata(1, 0, 0));
		expect(g.get_data_as_black('d', 'e')).toEqual(undefined);
		expect(g.get_data_as_black('d', 'f')).toEqual(undefined);

		expect(g.get_data_as_black('e', 'a')).toEqual(undefined);
		expect(g.get_data_as_black('e', 'b')).toEqual(undefined);
		expect(g.get_data_as_black('e', 'c')).toEqual(undefined);
		expect(g.get_data_as_black('e', 'd')).toEqual(undefined);
		expect(g.get_data_as_black('e', 'f')).toEqual(undefined);

		expect(g.get_data_as_black('f', 'a')).toEqual(undefined);
		expect(g.get_data_as_black('f', 'b')).toEqual(undefined);
		expect(g.get_data_as_black('f', 'c')).toEqual(undefined);
		expect(g.get_data_as_black('f', 'd')).toEqual(undefined);
		expect(g.get_data_as_black('f', 'e')).toEqual(new EdgeMetadata(0, 1, 0));

		const blitz_dir = EnvironmentManager.get_instance().get_dir_graphs_time_control('Blitz');
		expect(fs.existsSync(path.join(blitz_dir, 'a'))).toBe(false);
		expect(fs.existsSync(path.join(blitz_dir, 'b'))).toBe(true);
		expect(fs.existsSync(path.join(blitz_dir, 'c'))).toBe(true);
		expect(fs.existsSync(path.join(blitz_dir, 'e'))).toBe(true);
	});

	test('Delete game 0000000003', () => {
		expect(() => game_delete('0000000003')).not.toThrow();

		let man = GamesManager.get_instance();
		expect(man.game_exists('0000000001')).toBe(false);
		expect(man.game_exists('0000000002')).toBe(true);
		expect(man.game_exists('0000000003')).toBe(false);
		expect(man.game_exists('0000000004')).toBe(false);
		expect(man.game_exists('0000000005')).toBe(true);

		expect(a.get_games('Blitz').length).toBe(1);
		expect(b.get_games('Blitz').length).toBe(1);
		expect(c.get_games('Blitz').length).toBe(1);
		expect(d.get_games('Blitz').length).toBe(1);
		expect(e.get_games('Blitz').length).toBe(0);
		expect(f.get_games('Blitz').length).toBe(0);

		expect(a.get_rating('Blitz').num_won_drawn_lost()).toEqual([1, 0, 0, 1]);
		expect(b.get_rating('Blitz').num_won_drawn_lost()).toEqual([1, 1, 0, 0]);
		expect(c.get_rating('Blitz').num_won_drawn_lost()).toEqual([1, 0, 0, 1]);
		expect(d.get_rating('Blitz').num_won_drawn_lost()).toEqual([1, 1, 0, 0]);
		expect(e.get_rating('Blitz').num_won_drawn_lost()).toEqual([0, 0, 0, 0]);
		expect(f.get_rating('Blitz').num_won_drawn_lost()).toEqual([0, 0, 0, 0]);

		const blitz_dir = EnvironmentManager.get_instance().get_dir_games_time_control('Blitz');
		expect(fs.existsSync(path.join(blitz_dir, '2025-01-19'))).toBe(true);
	});

	test('Check "Blitz" graph', () => {
		const graphs_manager = GraphsManager.get_instance();
		const g = graphs_manager.get_graph('Blitz') as Graph;

		// white

		expect(g.get_data_as_white('a', 'b')).toEqual(undefined);
		expect(g.get_data_as_white('a', 'c')).toEqual(undefined);
		expect(g.get_data_as_white('a', 'd')).toEqual(undefined);
		expect(g.get_data_as_white('a', 'e')).toEqual(undefined);
		expect(g.get_data_as_white('a', 'f')).toEqual(undefined);

		expect(g.get_data_as_white('b', 'a')).toEqual(new EdgeMetadata(1, 0, 0));
		expect(g.get_data_as_white('b', 'c')).toEqual(undefined);
		expect(g.get_data_as_white('b', 'd')).toEqual(undefined);
		expect(g.get_data_as_white('b', 'e')).toEqual(undefined);
		expect(g.get_data_as_white('b', 'f')).toEqual(undefined);

		expect(g.get_data_as_white('c', 'a')).toEqual(undefined);
		expect(g.get_data_as_white('c', 'b')).toEqual(undefined);
		expect(g.get_data_as_white('c', 'd')).toEqual(new EdgeMetadata(0, 0, 1));
		expect(g.get_data_as_white('c', 'e')).toEqual(undefined);
		expect(g.get_data_as_white('c', 'f')).toEqual(undefined);

		expect(g.get_data_as_white('d', 'a')).toEqual(undefined);
		expect(g.get_data_as_white('d', 'b')).toEqual(undefined);
		expect(g.get_data_as_white('d', 'c')).toEqual(undefined);
		expect(g.get_data_as_white('d', 'e')).toEqual(undefined);
		expect(g.get_data_as_white('d', 'f')).toEqual(undefined);

		expect(g.get_data_as_white('e', 'a')).toEqual(undefined);
		expect(g.get_data_as_white('e', 'b')).toEqual(undefined);
		expect(g.get_data_as_white('e', 'c')).toEqual(undefined);
		expect(g.get_data_as_white('e', 'd')).toEqual(undefined);
		expect(g.get_data_as_white('e', 'f')).toEqual(undefined);

		expect(g.get_data_as_white('f', 'a')).toEqual(undefined);
		expect(g.get_data_as_white('f', 'b')).toEqual(undefined);
		expect(g.get_data_as_white('f', 'c')).toEqual(undefined);
		expect(g.get_data_as_white('f', 'd')).toEqual(undefined);
		expect(g.get_data_as_white('f', 'e')).toEqual(undefined);

		// black

		expect(g.get_data_as_black('a', 'b')).toEqual(new EdgeMetadata(0, 0, 1));
		expect(g.get_data_as_black('a', 'c')).toEqual(undefined);
		expect(g.get_data_as_black('a', 'd')).toEqual(undefined);
		expect(g.get_data_as_black('a', 'e')).toEqual(undefined);
		expect(g.get_data_as_black('a', 'f')).toEqual(undefined);

		expect(g.get_data_as_black('b', 'a')).toEqual(undefined);
		expect(g.get_data_as_black('b', 'c')).toEqual(undefined);
		expect(g.get_data_as_black('b', 'd')).toEqual(undefined);
		expect(g.get_data_as_black('b', 'e')).toEqual(undefined);
		expect(g.get_data_as_black('b', 'f')).toEqual(undefined);

		expect(g.get_data_as_black('c', 'a')).toEqual(undefined);
		expect(g.get_data_as_black('c', 'b')).toEqual(undefined);
		expect(g.get_data_as_black('c', 'd')).toEqual(undefined);
		expect(g.get_data_as_black('c', 'e')).toEqual(undefined);
		expect(g.get_data_as_black('c', 'f')).toEqual(undefined);

		expect(g.get_data_as_black('d', 'a')).toEqual(undefined);
		expect(g.get_data_as_black('d', 'b')).toEqual(undefined);
		expect(g.get_data_as_black('d', 'c')).toEqual(new EdgeMetadata(1, 0, 0));
		expect(g.get_data_as_black('d', 'e')).toEqual(undefined);
		expect(g.get_data_as_black('d', 'f')).toEqual(undefined);

		expect(g.get_data_as_black('e', 'a')).toEqual(undefined);
		expect(g.get_data_as_black('e', 'b')).toEqual(undefined);
		expect(g.get_data_as_black('e', 'c')).toEqual(undefined);
		expect(g.get_data_as_black('e', 'd')).toEqual(undefined);
		expect(g.get_data_as_black('e', 'f')).toEqual(undefined);

		expect(g.get_data_as_black('f', 'a')).toEqual(undefined);
		expect(g.get_data_as_black('f', 'b')).toEqual(undefined);
		expect(g.get_data_as_black('f', 'c')).toEqual(undefined);
		expect(g.get_data_as_black('f', 'd')).toEqual(undefined);
		expect(g.get_data_as_black('f', 'e')).toEqual(undefined);

		const blitz_dir = EnvironmentManager.get_instance().get_dir_graphs_time_control('Blitz');
		expect(fs.existsSync(path.join(blitz_dir, 'a'))).toBe(false);
		expect(fs.existsSync(path.join(blitz_dir, 'b'))).toBe(true);
		expect(fs.existsSync(path.join(blitz_dir, 'c'))).toBe(true);
		expect(fs.existsSync(path.join(blitz_dir, 'e'))).toBe(false);
	});

	test('Delete game 0000000002', () => {
		expect(() => game_delete('0000000002')).not.toThrow();

		let man = GamesManager.get_instance();
		expect(man.game_exists('0000000001')).toBe(false);
		expect(man.game_exists('0000000002')).toBe(false);
		expect(man.game_exists('0000000003')).toBe(false);
		expect(man.game_exists('0000000004')).toBe(false);
		expect(man.game_exists('0000000005')).toBe(true);

		expect(a.get_games('Blitz').length).toBe(1);
		expect(b.get_games('Blitz').length).toBe(1);
		expect(c.get_games('Blitz').length).toBe(0);
		expect(d.get_games('Blitz').length).toBe(0);
		expect(e.get_games('Blitz').length).toBe(0);
		expect(f.get_games('Blitz').length).toBe(0);

		expect(a.get_rating('Blitz').num_won_drawn_lost()).toEqual([1, 0, 0, 1]);
		expect(b.get_rating('Blitz').num_won_drawn_lost()).toEqual([1, 1, 0, 0]);
		expect(c.get_rating('Blitz').num_won_drawn_lost()).toEqual([0, 0, 0, 0]);
		expect(d.get_rating('Blitz').num_won_drawn_lost()).toEqual([0, 0, 0, 0]);
		expect(e.get_rating('Blitz').num_won_drawn_lost()).toEqual([0, 0, 0, 0]);
		expect(f.get_rating('Blitz').num_won_drawn_lost()).toEqual([0, 0, 0, 0]);

		const blitz_dir = EnvironmentManager.get_instance().get_dir_games_time_control('Blitz');
		expect(fs.existsSync(path.join(blitz_dir, '2025-01-19'))).toBe(true);
	});

	test('Check "Blitz" graph', () => {
		const graphs_manager = GraphsManager.get_instance();
		const g = graphs_manager.get_graph('Blitz') as Graph;

		// white

		expect(g.get_data_as_white('a', 'b')).toEqual(undefined);
		expect(g.get_data_as_white('a', 'c')).toEqual(undefined);
		expect(g.get_data_as_white('a', 'd')).toEqual(undefined);
		expect(g.get_data_as_white('a', 'e')).toEqual(undefined);
		expect(g.get_data_as_white('a', 'f')).toEqual(undefined);

		expect(g.get_data_as_white('b', 'a')).toEqual(new EdgeMetadata(1, 0, 0));
		expect(g.get_data_as_white('b', 'c')).toEqual(undefined);
		expect(g.get_data_as_white('b', 'd')).toEqual(undefined);
		expect(g.get_data_as_white('b', 'e')).toEqual(undefined);
		expect(g.get_data_as_white('b', 'f')).toEqual(undefined);

		expect(g.get_data_as_white('c', 'a')).toEqual(undefined);
		expect(g.get_data_as_white('c', 'b')).toEqual(undefined);
		expect(g.get_data_as_white('c', 'd')).toEqual(undefined);
		expect(g.get_data_as_white('c', 'e')).toEqual(undefined);
		expect(g.get_data_as_white('c', 'f')).toEqual(undefined);

		expect(g.get_data_as_white('d', 'a')).toEqual(undefined);
		expect(g.get_data_as_white('d', 'b')).toEqual(undefined);
		expect(g.get_data_as_white('d', 'c')).toEqual(undefined);
		expect(g.get_data_as_white('d', 'e')).toEqual(undefined);
		expect(g.get_data_as_white('d', 'f')).toEqual(undefined);

		expect(g.get_data_as_white('e', 'a')).toEqual(undefined);
		expect(g.get_data_as_white('e', 'b')).toEqual(undefined);
		expect(g.get_data_as_white('e', 'c')).toEqual(undefined);
		expect(g.get_data_as_white('e', 'd')).toEqual(undefined);
		expect(g.get_data_as_white('e', 'f')).toEqual(undefined);

		expect(g.get_data_as_white('f', 'a')).toEqual(undefined);
		expect(g.get_data_as_white('f', 'b')).toEqual(undefined);
		expect(g.get_data_as_white('f', 'c')).toEqual(undefined);
		expect(g.get_data_as_white('f', 'd')).toEqual(undefined);
		expect(g.get_data_as_white('f', 'e')).toEqual(undefined);

		// black

		expect(g.get_data_as_black('a', 'b')).toEqual(new EdgeMetadata(0, 0, 1));
		expect(g.get_data_as_black('a', 'c')).toEqual(undefined);
		expect(g.get_data_as_black('a', 'd')).toEqual(undefined);
		expect(g.get_data_as_black('a', 'e')).toEqual(undefined);
		expect(g.get_data_as_black('a', 'f')).toEqual(undefined);

		expect(g.get_data_as_black('b', 'a')).toEqual(undefined);
		expect(g.get_data_as_black('b', 'c')).toEqual(undefined);
		expect(g.get_data_as_black('b', 'd')).toEqual(undefined);
		expect(g.get_data_as_black('b', 'e')).toEqual(undefined);
		expect(g.get_data_as_black('b', 'f')).toEqual(undefined);

		expect(g.get_data_as_black('c', 'a')).toEqual(undefined);
		expect(g.get_data_as_black('c', 'b')).toEqual(undefined);
		expect(g.get_data_as_black('c', 'd')).toEqual(undefined);
		expect(g.get_data_as_black('c', 'e')).toEqual(undefined);
		expect(g.get_data_as_black('c', 'f')).toEqual(undefined);

		expect(g.get_data_as_black('d', 'a')).toEqual(undefined);
		expect(g.get_data_as_black('d', 'b')).toEqual(undefined);
		expect(g.get_data_as_black('d', 'c')).toEqual(undefined);
		expect(g.get_data_as_black('d', 'e')).toEqual(undefined);
		expect(g.get_data_as_black('d', 'f')).toEqual(undefined);

		expect(g.get_data_as_black('e', 'a')).toEqual(undefined);
		expect(g.get_data_as_black('e', 'b')).toEqual(undefined);
		expect(g.get_data_as_black('e', 'c')).toEqual(undefined);
		expect(g.get_data_as_black('e', 'd')).toEqual(undefined);
		expect(g.get_data_as_black('e', 'f')).toEqual(undefined);

		expect(g.get_data_as_black('f', 'a')).toEqual(undefined);
		expect(g.get_data_as_black('f', 'b')).toEqual(undefined);
		expect(g.get_data_as_black('f', 'c')).toEqual(undefined);
		expect(g.get_data_as_black('f', 'd')).toEqual(undefined);
		expect(g.get_data_as_black('f', 'e')).toEqual(undefined);

		const blitz_dir = EnvironmentManager.get_instance().get_dir_graphs_time_control('Blitz');
		expect(fs.existsSync(path.join(blitz_dir, 'a'))).toBe(false);
		expect(fs.existsSync(path.join(blitz_dir, 'b'))).toBe(true);
		expect(fs.existsSync(path.join(blitz_dir, 'c'))).toBe(false);
		expect(fs.existsSync(path.join(blitz_dir, 'e'))).toBe(false);
	});

	test('Delete game 0000000005', () => {
		expect(() => game_delete('0000000005')).not.toThrow();

		let man = GamesManager.get_instance();
		expect(man.game_exists('0000000001')).toBe(false);
		expect(man.game_exists('0000000002')).toBe(false);
		expect(man.game_exists('0000000003')).toBe(false);
		expect(man.game_exists('0000000004')).toBe(false);
		expect(man.game_exists('0000000005')).toBe(false);

		expect(a.get_games('Blitz').length).toBe(0);
		expect(b.get_games('Blitz').length).toBe(0);
		expect(c.get_games('Blitz').length).toBe(0);
		expect(d.get_games('Blitz').length).toBe(0);
		expect(e.get_games('Blitz').length).toBe(0);
		expect(f.get_games('Blitz').length).toBe(0);

		expect(a.get_rating('Blitz').num_won_drawn_lost()).toEqual([0, 0, 0, 0]);
		expect(b.get_rating('Blitz').num_won_drawn_lost()).toEqual([0, 0, 0, 0]);
		expect(c.get_rating('Blitz').num_won_drawn_lost()).toEqual([0, 0, 0, 0]);
		expect(d.get_rating('Blitz').num_won_drawn_lost()).toEqual([0, 0, 0, 0]);
		expect(e.get_rating('Blitz').num_won_drawn_lost()).toEqual([0, 0, 0, 0]);
		expect(f.get_rating('Blitz').num_won_drawn_lost()).toEqual([0, 0, 0, 0]);

		const blitz_dir = EnvironmentManager.get_instance().get_dir_games_time_control('Blitz');
		expect(fs.existsSync(path.join(blitz_dir, '2025-01-19'))).toBe(false);
	});

	test('Check "Blitz" graph', () => {
		const graphs_manager = GraphsManager.get_instance();
		const g = graphs_manager.get_graph('Blitz') as Graph;

		// white

		expect(g.get_data_as_white('a', 'b')).toEqual(undefined);
		expect(g.get_data_as_white('a', 'c')).toEqual(undefined);
		expect(g.get_data_as_white('a', 'd')).toEqual(undefined);
		expect(g.get_data_as_white('a', 'e')).toEqual(undefined);
		expect(g.get_data_as_white('a', 'f')).toEqual(undefined);

		expect(g.get_data_as_white('b', 'a')).toEqual(undefined);
		expect(g.get_data_as_white('b', 'c')).toEqual(undefined);
		expect(g.get_data_as_white('b', 'd')).toEqual(undefined);
		expect(g.get_data_as_white('b', 'e')).toEqual(undefined);
		expect(g.get_data_as_white('b', 'f')).toEqual(undefined);

		expect(g.get_data_as_white('c', 'a')).toEqual(undefined);
		expect(g.get_data_as_white('c', 'b')).toEqual(undefined);
		expect(g.get_data_as_white('c', 'd')).toEqual(undefined);
		expect(g.get_data_as_white('c', 'e')).toEqual(undefined);
		expect(g.get_data_as_white('c', 'f')).toEqual(undefined);

		expect(g.get_data_as_white('d', 'a')).toEqual(undefined);
		expect(g.get_data_as_white('d', 'b')).toEqual(undefined);
		expect(g.get_data_as_white('d', 'c')).toEqual(undefined);
		expect(g.get_data_as_white('d', 'e')).toEqual(undefined);
		expect(g.get_data_as_white('d', 'f')).toEqual(undefined);

		expect(g.get_data_as_white('e', 'a')).toEqual(undefined);
		expect(g.get_data_as_white('e', 'b')).toEqual(undefined);
		expect(g.get_data_as_white('e', 'c')).toEqual(undefined);
		expect(g.get_data_as_white('e', 'd')).toEqual(undefined);
		expect(g.get_data_as_white('e', 'f')).toEqual(undefined);

		expect(g.get_data_as_white('f', 'a')).toEqual(undefined);
		expect(g.get_data_as_white('f', 'b')).toEqual(undefined);
		expect(g.get_data_as_white('f', 'c')).toEqual(undefined);
		expect(g.get_data_as_white('f', 'd')).toEqual(undefined);
		expect(g.get_data_as_white('f', 'e')).toEqual(undefined);

		// black

		expect(g.get_data_as_black('a', 'b')).toEqual(undefined);
		expect(g.get_data_as_black('a', 'c')).toEqual(undefined);
		expect(g.get_data_as_black('a', 'd')).toEqual(undefined);
		expect(g.get_data_as_black('a', 'e')).toEqual(undefined);
		expect(g.get_data_as_black('a', 'f')).toEqual(undefined);

		expect(g.get_data_as_black('b', 'a')).toEqual(undefined);
		expect(g.get_data_as_black('b', 'c')).toEqual(undefined);
		expect(g.get_data_as_black('b', 'd')).toEqual(undefined);
		expect(g.get_data_as_black('b', 'e')).toEqual(undefined);
		expect(g.get_data_as_black('b', 'f')).toEqual(undefined);

		expect(g.get_data_as_black('c', 'a')).toEqual(undefined);
		expect(g.get_data_as_black('c', 'b')).toEqual(undefined);
		expect(g.get_data_as_black('c', 'd')).toEqual(undefined);
		expect(g.get_data_as_black('c', 'e')).toEqual(undefined);
		expect(g.get_data_as_black('c', 'f')).toEqual(undefined);

		expect(g.get_data_as_black('d', 'a')).toEqual(undefined);
		expect(g.get_data_as_black('d', 'b')).toEqual(undefined);
		expect(g.get_data_as_black('d', 'c')).toEqual(undefined);
		expect(g.get_data_as_black('d', 'e')).toEqual(undefined);
		expect(g.get_data_as_black('d', 'f')).toEqual(undefined);

		expect(g.get_data_as_black('e', 'a')).toEqual(undefined);
		expect(g.get_data_as_black('e', 'b')).toEqual(undefined);
		expect(g.get_data_as_black('e', 'c')).toEqual(undefined);
		expect(g.get_data_as_black('e', 'd')).toEqual(undefined);
		expect(g.get_data_as_black('e', 'f')).toEqual(undefined);

		expect(g.get_data_as_black('f', 'a')).toEqual(undefined);
		expect(g.get_data_as_black('f', 'b')).toEqual(undefined);
		expect(g.get_data_as_black('f', 'c')).toEqual(undefined);
		expect(g.get_data_as_black('f', 'd')).toEqual(undefined);
		expect(g.get_data_as_black('f', 'e')).toEqual(undefined);

		const blitz_dir = EnvironmentManager.get_instance().get_dir_graphs_time_control('Blitz');
		expect(fs.existsSync(path.join(blitz_dir, 'a'))).toBe(false);
		expect(fs.existsSync(path.join(blitz_dir, 'b'))).toBe(false);
		expect(fs.existsSync(path.join(blitz_dir, 'c'))).toBe(false);
		expect(fs.existsSync(path.join(blitz_dir, 'e'))).toBe(false);
	});
});
