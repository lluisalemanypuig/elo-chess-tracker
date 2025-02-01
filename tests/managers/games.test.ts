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

import { game_add_new, game_edit_result, game_find_by_id } from '../../src-server/managers/games';
import { server_init_from_data } from '../../src-server/managers/initialization';
import { user_add_new } from '../../src-server/managers/users';
import { ADMIN } from '../../src-server/models/user_role';
import { run_command } from './exec_utils';
import { EnvironmentManager } from '../../src-server/managers/environment_manager';
import { Game, game_set_from_json } from '../../src-server/models/game';
import { User } from '../../src-server/models/user';
import { DateStringShort } from '../../src-server/utils/time';
import { UsersManager } from '../../src-server/managers/users_manager';

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
		admin: ['challenge_user', 'challenge_admin', 'challenge_member', 'challenge_teacher', 'challenge_student'],
		teacher: ['challenge_user', 'challenge_admin', 'challenge_member', 'challenge_teacher', 'challenge_student'],
		member: ['challenge_user', 'challenge_admin', 'challenge_member', 'challenge_teacher', 'challenge_student'],
		student: ['challenge_user', 'challenge_admin', 'challenge_member', 'challenge_teacher', 'challenge_student']
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
		const blitz_dir = EnvironmentManager.get_instance().get_dir_games_time_control('Blitz');

		game_add_new(u('a'), u('b'), 'white_wins', 'Blitz', 'Blitz (5 + 3)', '2025-01-19', '17:06:00:000');
		{
			const game_set = game_set_from_json(fs.readFileSync(path.join(blitz_dir, '2025-01-19'), 'utf8'));
			expect(game_set.length).toBe(1);

			expect(game_set[0].get_id()).toBe('0000000001');
			expect(game_set[0].get_white()).toBe('a');
			expect(game_set[0].get_black()).toBe('b');
			expect(game_set[0].get_result()).toBe('white_wins');
			expect(game_set[0].get_time_control_id()).toBe('Blitz');
			expect(game_set[0].get_time_control_name()).toBe('Blitz (5 + 3)');
			expect(game_set[0].get_date()).toBe('2025-01-19..17:06:00:000');

			expect(a.get_games('Blitz')?.length).toBe(1);
			expect(b.get_games('Blitz')?.length).toBe(1);
			expect(c.get_games('Blitz')?.length).toBe(0);
			expect(d.get_games('Blitz')?.length).toBe(0);
			expect(e.get_games('Blitz')?.length).toBe(0);
			expect(f.get_games('Blitz')?.length).toBe(0);
			expect(a.get_games('Classical')?.length).toBe(0);
			expect(b.get_games('Classical')?.length).toBe(0);
			expect(c.get_games('Classical')?.length).toBe(0);
			expect(d.get_games('Classical')?.length).toBe(0);
			expect(e.get_games('Classical')?.length).toBe(0);
			expect(f.get_games('Classical')?.length).toBe(0);

			expect(a.get_rating('Blitz').num_won_drawn_lost()).toEqual([1, 1, 0, 0]);
			expect(b.get_rating('Blitz').num_won_drawn_lost()).toEqual([1, 0, 0, 1]);
			expect(c.get_rating('Blitz').num_won_drawn_lost()).toEqual([0, 0, 0, 0]);
			expect(d.get_rating('Blitz').num_won_drawn_lost()).toEqual([0, 0, 0, 0]);
			expect(e.get_rating('Blitz').num_won_drawn_lost()).toEqual([0, 0, 0, 0]);
			expect(f.get_rating('Blitz').num_won_drawn_lost()).toEqual([0, 0, 0, 0]);
			expect(a.get_rating('Classical').num_won_drawn_lost()).toEqual([0, 0, 0, 0]);
			expect(b.get_rating('Classical').num_won_drawn_lost()).toEqual([0, 0, 0, 0]);
			expect(c.get_rating('Classical').num_won_drawn_lost()).toEqual([0, 0, 0, 0]);
			expect(d.get_rating('Classical').num_won_drawn_lost()).toEqual([0, 0, 0, 0]);
			expect(e.get_rating('Classical').num_won_drawn_lost()).toEqual([0, 0, 0, 0]);
			expect(f.get_rating('Classical').num_won_drawn_lost()).toEqual([0, 0, 0, 0]);
		}

		game_add_new(u('c'), u('d'), 'black_wins', 'Blitz', 'Blitz (5 + 3)', '2025-01-19', '17:06:10:000');
		{
			const game_set = game_set_from_json(fs.readFileSync(path.join(blitz_dir, '2025-01-19'), 'utf8'));
			expect(game_set.length).toBe(2);

			expect(game_set[0].get_id()).toBe('0000000001');
			expect(game_set[0].get_white()).toBe('a');
			expect(game_set[0].get_black()).toBe('b');
			expect(game_set[0].get_result()).toBe('white_wins');
			expect(game_set[0].get_time_control_id()).toBe('Blitz');
			expect(game_set[0].get_time_control_name()).toBe('Blitz (5 + 3)');
			expect(game_set[0].get_date()).toBe('2025-01-19..17:06:00:000');

			expect(game_set[1].get_id()).toBe('0000000002');
			expect(game_set[1].get_white()).toBe('c');
			expect(game_set[1].get_black()).toBe('d');
			expect(game_set[1].get_result()).toBe('black_wins');
			expect(game_set[1].get_time_control_id()).toBe('Blitz');
			expect(game_set[1].get_time_control_name()).toBe('Blitz (5 + 3)');
			expect(game_set[1].get_date()).toBe('2025-01-19..17:06:10:000');

			expect(a.get_games('Blitz')?.length).toBe(1);
			expect(b.get_games('Blitz')?.length).toBe(1);
			expect(c.get_games('Blitz')?.length).toBe(1);
			expect(d.get_games('Blitz')?.length).toBe(1);
			expect(e.get_games('Blitz')?.length).toBe(0);
			expect(f.get_games('Blitz')?.length).toBe(0);
			expect(a.get_games('Classical')?.length).toBe(0);
			expect(b.get_games('Classical')?.length).toBe(0);
			expect(c.get_games('Classical')?.length).toBe(0);
			expect(d.get_games('Classical')?.length).toBe(0);
			expect(e.get_games('Classical')?.length).toBe(0);
			expect(f.get_games('Classical')?.length).toBe(0);

			expect(a.get_rating('Blitz').num_won_drawn_lost()).toEqual([1, 1, 0, 0]);
			expect(b.get_rating('Blitz').num_won_drawn_lost()).toEqual([1, 0, 0, 1]);
			expect(c.get_rating('Blitz').num_won_drawn_lost()).toEqual([1, 0, 0, 1]);
			expect(d.get_rating('Blitz').num_won_drawn_lost()).toEqual([1, 1, 0, 0]);
			expect(e.get_rating('Blitz').num_won_drawn_lost()).toEqual([0, 0, 0, 0]);
			expect(f.get_rating('Blitz').num_won_drawn_lost()).toEqual([0, 0, 0, 0]);
			expect(a.get_rating('Classical').num_won_drawn_lost()).toEqual([0, 0, 0, 0]);
			expect(b.get_rating('Classical').num_won_drawn_lost()).toEqual([0, 0, 0, 0]);
			expect(c.get_rating('Classical').num_won_drawn_lost()).toEqual([0, 0, 0, 0]);
			expect(d.get_rating('Classical').num_won_drawn_lost()).toEqual([0, 0, 0, 0]);
			expect(e.get_rating('Classical').num_won_drawn_lost()).toEqual([0, 0, 0, 0]);
			expect(f.get_rating('Classical').num_won_drawn_lost()).toEqual([0, 0, 0, 0]);
		}

		game_add_new(u('e'), u('f'), 'draw', 'Blitz', 'Blitz (5 + 3)', '2025-01-19', '17:06:20:000');
		{
			const game_set = game_set_from_json(fs.readFileSync(path.join(blitz_dir, '2025-01-19'), 'utf8'));
			expect(game_set.length).toBe(3);

			expect(game_set[0].get_id()).toBe('0000000001');
			expect(game_set[0].get_white()).toBe('a');
			expect(game_set[0].get_black()).toBe('b');
			expect(game_set[0].get_result()).toBe('white_wins');
			expect(game_set[0].get_time_control_id()).toBe('Blitz');
			expect(game_set[0].get_time_control_name()).toBe('Blitz (5 + 3)');
			expect(game_set[0].get_date()).toBe('2025-01-19..17:06:00:000');

			expect(game_set[1].get_id()).toBe('0000000002');
			expect(game_set[1].get_white()).toBe('c');
			expect(game_set[1].get_black()).toBe('d');
			expect(game_set[1].get_result()).toBe('black_wins');
			expect(game_set[1].get_time_control_id()).toBe('Blitz');
			expect(game_set[1].get_time_control_name()).toBe('Blitz (5 + 3)');
			expect(game_set[1].get_date()).toBe('2025-01-19..17:06:10:000');

			expect(game_set[2].get_id()).toBe('0000000003');
			expect(game_set[2].get_white()).toBe('e');
			expect(game_set[2].get_black()).toBe('f');
			expect(game_set[2].get_result()).toBe('draw');
			expect(game_set[2].get_time_control_id()).toBe('Blitz');
			expect(game_set[2].get_time_control_name()).toBe('Blitz (5 + 3)');
			expect(game_set[2].get_date()).toBe('2025-01-19..17:06:20:000');

			expect(a.get_games('Blitz')?.length).toBe(1);
			expect(b.get_games('Blitz')?.length).toBe(1);
			expect(c.get_games('Blitz')?.length).toBe(1);
			expect(d.get_games('Blitz')?.length).toBe(1);
			expect(e.get_games('Blitz')?.length).toBe(1);
			expect(f.get_games('Blitz')?.length).toBe(1);
			expect(a.get_games('Classical')?.length).toBe(0);
			expect(b.get_games('Classical')?.length).toBe(0);
			expect(c.get_games('Classical')?.length).toBe(0);
			expect(d.get_games('Classical')?.length).toBe(0);
			expect(e.get_games('Classical')?.length).toBe(0);
			expect(f.get_games('Classical')?.length).toBe(0);

			expect(a.get_rating('Blitz').num_won_drawn_lost()).toEqual([1, 1, 0, 0]);
			expect(b.get_rating('Blitz').num_won_drawn_lost()).toEqual([1, 0, 0, 1]);
			expect(c.get_rating('Blitz').num_won_drawn_lost()).toEqual([1, 0, 0, 1]);
			expect(d.get_rating('Blitz').num_won_drawn_lost()).toEqual([1, 1, 0, 0]);
			expect(e.get_rating('Blitz').num_won_drawn_lost()).toEqual([1, 0, 1, 0]);
			expect(f.get_rating('Blitz').num_won_drawn_lost()).toEqual([1, 0, 1, 0]);
			expect(a.get_rating('Classical').num_won_drawn_lost()).toEqual([0, 0, 0, 0]);
			expect(b.get_rating('Classical').num_won_drawn_lost()).toEqual([0, 0, 0, 0]);
			expect(c.get_rating('Classical').num_won_drawn_lost()).toEqual([0, 0, 0, 0]);
			expect(d.get_rating('Classical').num_won_drawn_lost()).toEqual([0, 0, 0, 0]);
			expect(e.get_rating('Classical').num_won_drawn_lost()).toEqual([0, 0, 0, 0]);
			expect(f.get_rating('Classical').num_won_drawn_lost()).toEqual([0, 0, 0, 0]);
		}

		game_add_new(u('a'), u('f'), 'black_wins', 'Blitz', 'Blitz (5 + 3)', '2025-01-19', '17:06:30:000');
		{
			const game_set = game_set_from_json(fs.readFileSync(path.join(blitz_dir, '2025-01-19'), 'utf8'));
			expect(game_set.length).toBe(4);

			expect(game_set[0].get_id()).toBe('0000000001');
			expect(game_set[0].get_white()).toBe('a');
			expect(game_set[0].get_black()).toBe('b');
			expect(game_set[0].get_result()).toBe('white_wins');
			expect(game_set[0].get_time_control_id()).toBe('Blitz');
			expect(game_set[0].get_time_control_name()).toBe('Blitz (5 + 3)');
			expect(game_set[0].get_date()).toBe('2025-01-19..17:06:00:000');

			expect(game_set[1].get_id()).toBe('0000000002');
			expect(game_set[1].get_white()).toBe('c');
			expect(game_set[1].get_black()).toBe('d');
			expect(game_set[1].get_result()).toBe('black_wins');
			expect(game_set[1].get_time_control_id()).toBe('Blitz');
			expect(game_set[1].get_time_control_name()).toBe('Blitz (5 + 3)');
			expect(game_set[1].get_date()).toBe('2025-01-19..17:06:10:000');

			expect(game_set[2].get_id()).toBe('0000000003');
			expect(game_set[2].get_white()).toBe('e');
			expect(game_set[2].get_black()).toBe('f');
			expect(game_set[2].get_result()).toBe('draw');
			expect(game_set[2].get_time_control_id()).toBe('Blitz');
			expect(game_set[2].get_time_control_name()).toBe('Blitz (5 + 3)');
			expect(game_set[2].get_date()).toBe('2025-01-19..17:06:20:000');

			expect(game_set[3].get_id()).toBe('0000000004');
			expect(game_set[3].get_white()).toBe('a');
			expect(game_set[3].get_black()).toBe('f');
			expect(game_set[3].get_result()).toBe('black_wins');
			expect(game_set[3].get_time_control_id()).toBe('Blitz');
			expect(game_set[3].get_time_control_name()).toBe('Blitz (5 + 3)');
			expect(game_set[3].get_date()).toBe('2025-01-19..17:06:30:000');

			expect(a.get_games('Blitz')?.length).toBe(1);
			expect(b.get_games('Blitz')?.length).toBe(1);
			expect(c.get_games('Blitz')?.length).toBe(1);
			expect(d.get_games('Blitz')?.length).toBe(1);
			expect(e.get_games('Blitz')?.length).toBe(1);
			expect(f.get_games('Blitz')?.length).toBe(1);
			expect(a.get_games('Classical')?.length).toBe(0);
			expect(b.get_games('Classical')?.length).toBe(0);
			expect(c.get_games('Classical')?.length).toBe(0);
			expect(d.get_games('Classical')?.length).toBe(0);
			expect(e.get_games('Classical')?.length).toBe(0);
			expect(f.get_games('Classical')?.length).toBe(0);

			expect(a.get_rating('Blitz').num_won_drawn_lost()).toEqual([2, 1, 0, 1]);
			expect(b.get_rating('Blitz').num_won_drawn_lost()).toEqual([1, 0, 0, 1]);
			expect(c.get_rating('Blitz').num_won_drawn_lost()).toEqual([1, 0, 0, 1]);
			expect(d.get_rating('Blitz').num_won_drawn_lost()).toEqual([1, 1, 0, 0]);
			expect(e.get_rating('Blitz').num_won_drawn_lost()).toEqual([1, 0, 1, 0]);
			expect(f.get_rating('Blitz').num_won_drawn_lost()).toEqual([2, 1, 1, 0]);
			expect(a.get_rating('Classical').num_won_drawn_lost()).toEqual([0, 0, 0, 0]);
			expect(b.get_rating('Classical').num_won_drawn_lost()).toEqual([0, 0, 0, 0]);
			expect(c.get_rating('Classical').num_won_drawn_lost()).toEqual([0, 0, 0, 0]);
			expect(d.get_rating('Classical').num_won_drawn_lost()).toEqual([0, 0, 0, 0]);
			expect(e.get_rating('Classical').num_won_drawn_lost()).toEqual([0, 0, 0, 0]);
			expect(f.get_rating('Classical').num_won_drawn_lost()).toEqual([0, 0, 0, 0]);
		}
	});

	test('Add "Classical" games', () => {
		const classical_dir = EnvironmentManager.get_instance().get_dir_games_time_control('Classical');

		game_add_new(u('a'), u('b'), 'white_wins', 'Classical', 'Classical (90 + 30)', '2025-01-19', '17:06:00:000');
		{
			const game_set = game_set_from_json(fs.readFileSync(path.join(classical_dir, '2025-01-19'), 'utf8'));
			expect(game_set.length).toBe(1);

			expect(game_set[0].get_id()).toBe('0000000005');
			expect(game_set[0].get_white()).toBe('a');
			expect(game_set[0].get_black()).toBe('b');
			expect(game_set[0].get_result()).toBe('white_wins');
			expect(game_set[0].get_time_control_id()).toBe('Classical');
			expect(game_set[0].get_time_control_name()).toBe('Classical (90 + 30)');
			expect(game_set[0].get_date()).toBe('2025-01-19..17:06:00:000');

			expect(a.get_games('Blitz')?.length).toBe(1);
			expect(b.get_games('Blitz')?.length).toBe(1);
			expect(c.get_games('Blitz')?.length).toBe(1);
			expect(d.get_games('Blitz')?.length).toBe(1);
			expect(e.get_games('Blitz')?.length).toBe(1);
			expect(f.get_games('Blitz')?.length).toBe(1);
			expect(a.get_games('Classical')?.length).toBe(1);
			expect(b.get_games('Classical')?.length).toBe(1);
			expect(c.get_games('Classical')?.length).toBe(0);
			expect(d.get_games('Classical')?.length).toBe(0);
			expect(e.get_games('Classical')?.length).toBe(0);
			expect(f.get_games('Classical')?.length).toBe(0);

			expect(a.get_rating('Blitz').num_won_drawn_lost()).toEqual([2, 1, 0, 1]);
			expect(b.get_rating('Blitz').num_won_drawn_lost()).toEqual([1, 0, 0, 1]);
			expect(c.get_rating('Blitz').num_won_drawn_lost()).toEqual([1, 0, 0, 1]);
			expect(d.get_rating('Blitz').num_won_drawn_lost()).toEqual([1, 1, 0, 0]);
			expect(e.get_rating('Blitz').num_won_drawn_lost()).toEqual([1, 0, 1, 0]);
			expect(f.get_rating('Blitz').num_won_drawn_lost()).toEqual([2, 1, 1, 0]);
			expect(a.get_rating('Classical').num_won_drawn_lost()).toEqual([1, 1, 0, 0]);
			expect(b.get_rating('Classical').num_won_drawn_lost()).toEqual([1, 0, 0, 1]);
			expect(c.get_rating('Classical').num_won_drawn_lost()).toEqual([0, 0, 0, 0]);
			expect(d.get_rating('Classical').num_won_drawn_lost()).toEqual([0, 0, 0, 0]);
			expect(e.get_rating('Classical').num_won_drawn_lost()).toEqual([0, 0, 0, 0]);
			expect(f.get_rating('Classical').num_won_drawn_lost()).toEqual([0, 0, 0, 0]);
		}

		game_add_new(u('c'), u('d'), 'black_wins', 'Classical', 'Classical (90 + 30)', '2025-01-19', '17:06:10:000');
		{
			const game_set = game_set_from_json(fs.readFileSync(path.join(classical_dir, '2025-01-19'), 'utf8'));
			expect(game_set.length).toBe(2);

			expect(game_set[0].get_id()).toBe('0000000005');
			expect(game_set[0].get_white()).toBe('a');
			expect(game_set[0].get_black()).toBe('b');
			expect(game_set[0].get_result()).toBe('white_wins');
			expect(game_set[0].get_time_control_id()).toBe('Classical');
			expect(game_set[0].get_time_control_name()).toBe('Classical (90 + 30)');
			expect(game_set[0].get_date()).toBe('2025-01-19..17:06:00:000');

			expect(game_set[1].get_id()).toBe('0000000006');
			expect(game_set[1].get_white()).toBe('c');
			expect(game_set[1].get_black()).toBe('d');
			expect(game_set[1].get_result()).toBe('black_wins');
			expect(game_set[1].get_time_control_id()).toBe('Classical');
			expect(game_set[1].get_time_control_name()).toBe('Classical (90 + 30)');
			expect(game_set[1].get_date()).toBe('2025-01-19..17:06:10:000');

			expect(a.get_games('Blitz')?.length).toBe(1);
			expect(b.get_games('Blitz')?.length).toBe(1);
			expect(c.get_games('Blitz')?.length).toBe(1);
			expect(d.get_games('Blitz')?.length).toBe(1);
			expect(e.get_games('Blitz')?.length).toBe(1);
			expect(f.get_games('Blitz')?.length).toBe(1);
			expect(a.get_games('Classical')?.length).toBe(1);
			expect(b.get_games('Classical')?.length).toBe(1);
			expect(c.get_games('Classical')?.length).toBe(1);
			expect(d.get_games('Classical')?.length).toBe(1);
			expect(e.get_games('Classical')?.length).toBe(0);
			expect(f.get_games('Classical')?.length).toBe(0);

			expect(a.get_rating('Blitz').num_won_drawn_lost()).toEqual([2, 1, 0, 1]);
			expect(b.get_rating('Blitz').num_won_drawn_lost()).toEqual([1, 0, 0, 1]);
			expect(c.get_rating('Blitz').num_won_drawn_lost()).toEqual([1, 0, 0, 1]);
			expect(d.get_rating('Blitz').num_won_drawn_lost()).toEqual([1, 1, 0, 0]);
			expect(e.get_rating('Blitz').num_won_drawn_lost()).toEqual([1, 0, 1, 0]);
			expect(f.get_rating('Blitz').num_won_drawn_lost()).toEqual([2, 1, 1, 0]);
			expect(a.get_rating('Classical').num_won_drawn_lost()).toEqual([1, 1, 0, 0]);
			expect(b.get_rating('Classical').num_won_drawn_lost()).toEqual([1, 0, 0, 1]);
			expect(c.get_rating('Classical').num_won_drawn_lost()).toEqual([1, 0, 0, 1]);
			expect(d.get_rating('Classical').num_won_drawn_lost()).toEqual([1, 1, 0, 0]);
			expect(e.get_rating('Classical').num_won_drawn_lost()).toEqual([0, 0, 0, 0]);
			expect(f.get_rating('Classical').num_won_drawn_lost()).toEqual([0, 0, 0, 0]);
		}

		game_add_new(u('e'), u('f'), 'draw', 'Classical', 'Classical (90 + 30)', '2025-01-19', '17:06:20:000');
		{
			const game_set = game_set_from_json(fs.readFileSync(path.join(classical_dir, '2025-01-19'), 'utf8'));
			expect(game_set.length).toBe(3);

			expect(game_set[0].get_id()).toBe('0000000005');
			expect(game_set[0].get_white()).toBe('a');
			expect(game_set[0].get_black()).toBe('b');
			expect(game_set[0].get_result()).toBe('white_wins');
			expect(game_set[0].get_time_control_id()).toBe('Classical');
			expect(game_set[0].get_time_control_name()).toBe('Classical (90 + 30)');
			expect(game_set[0].get_date()).toBe('2025-01-19..17:06:00:000');

			expect(game_set[1].get_id()).toBe('0000000006');
			expect(game_set[1].get_white()).toBe('c');
			expect(game_set[1].get_black()).toBe('d');
			expect(game_set[1].get_result()).toBe('black_wins');
			expect(game_set[1].get_time_control_id()).toBe('Classical');
			expect(game_set[1].get_time_control_name()).toBe('Classical (90 + 30)');
			expect(game_set[1].get_date()).toBe('2025-01-19..17:06:10:000');

			expect(game_set[2].get_id()).toBe('0000000007');
			expect(game_set[2].get_white()).toBe('e');
			expect(game_set[2].get_black()).toBe('f');
			expect(game_set[2].get_result()).toBe('draw');
			expect(game_set[2].get_time_control_id()).toBe('Classical');
			expect(game_set[2].get_time_control_name()).toBe('Classical (90 + 30)');
			expect(game_set[2].get_date()).toBe('2025-01-19..17:06:20:000');

			expect(a.get_games('Blitz')?.length).toBe(1);
			expect(b.get_games('Blitz')?.length).toBe(1);
			expect(c.get_games('Blitz')?.length).toBe(1);
			expect(d.get_games('Blitz')?.length).toBe(1);
			expect(e.get_games('Blitz')?.length).toBe(1);
			expect(f.get_games('Blitz')?.length).toBe(1);
			expect(a.get_games('Classical')?.length).toBe(1);
			expect(b.get_games('Classical')?.length).toBe(1);
			expect(c.get_games('Classical')?.length).toBe(1);
			expect(d.get_games('Classical')?.length).toBe(1);
			expect(e.get_games('Classical')?.length).toBe(1);
			expect(f.get_games('Classical')?.length).toBe(1);

			expect(a.get_rating('Blitz').num_won_drawn_lost()).toEqual([2, 1, 0, 1]);
			expect(b.get_rating('Blitz').num_won_drawn_lost()).toEqual([1, 0, 0, 1]);
			expect(c.get_rating('Blitz').num_won_drawn_lost()).toEqual([1, 0, 0, 1]);
			expect(d.get_rating('Blitz').num_won_drawn_lost()).toEqual([1, 1, 0, 0]);
			expect(e.get_rating('Blitz').num_won_drawn_lost()).toEqual([1, 0, 1, 0]);
			expect(f.get_rating('Blitz').num_won_drawn_lost()).toEqual([2, 1, 1, 0]);
			expect(a.get_rating('Classical').num_won_drawn_lost()).toEqual([1, 1, 0, 0]);
			expect(b.get_rating('Classical').num_won_drawn_lost()).toEqual([1, 0, 0, 1]);
			expect(c.get_rating('Classical').num_won_drawn_lost()).toEqual([1, 0, 0, 1]);
			expect(d.get_rating('Classical').num_won_drawn_lost()).toEqual([1, 1, 0, 0]);
			expect(e.get_rating('Classical').num_won_drawn_lost()).toEqual([1, 0, 1, 0]);
			expect(f.get_rating('Classical').num_won_drawn_lost()).toEqual([1, 0, 1, 0]);
		}

		game_add_new(u('a'), u('f'), 'black_wins', 'Classical', 'Classical (90 + 30)', '2025-01-19', '17:06:30:000');
		{
			const game_set = game_set_from_json(fs.readFileSync(path.join(classical_dir, '2025-01-19'), 'utf8'));
			expect(game_set.length).toBe(4);

			expect(game_set[0].get_id()).toBe('0000000005');
			expect(game_set[0].get_white()).toBe('a');
			expect(game_set[0].get_black()).toBe('b');
			expect(game_set[0].get_result()).toBe('white_wins');
			expect(game_set[0].get_time_control_id()).toBe('Classical');
			expect(game_set[0].get_time_control_name()).toBe('Classical (90 + 30)');
			expect(game_set[0].get_date()).toBe('2025-01-19..17:06:00:000');

			expect(game_set[1].get_id()).toBe('0000000006');
			expect(game_set[1].get_white()).toBe('c');
			expect(game_set[1].get_black()).toBe('d');
			expect(game_set[1].get_result()).toBe('black_wins');
			expect(game_set[1].get_time_control_id()).toBe('Classical');
			expect(game_set[1].get_time_control_name()).toBe('Classical (90 + 30)');
			expect(game_set[1].get_date()).toBe('2025-01-19..17:06:10:000');

			expect(game_set[2].get_id()).toBe('0000000007');
			expect(game_set[2].get_white()).toBe('e');
			expect(game_set[2].get_black()).toBe('f');
			expect(game_set[2].get_result()).toBe('draw');
			expect(game_set[2].get_time_control_id()).toBe('Classical');
			expect(game_set[2].get_time_control_name()).toBe('Classical (90 + 30)');
			expect(game_set[2].get_date()).toBe('2025-01-19..17:06:20:000');

			expect(game_set[3].get_id()).toBe('0000000008');
			expect(game_set[3].get_white()).toBe('a');
			expect(game_set[3].get_black()).toBe('f');
			expect(game_set[3].get_result()).toBe('black_wins');
			expect(game_set[3].get_time_control_id()).toBe('Classical');
			expect(game_set[3].get_time_control_name()).toBe('Classical (90 + 30)');
			expect(game_set[3].get_date()).toBe('2025-01-19..17:06:30:000');

			expect(a.get_games('Blitz')?.length).toBe(1);
			expect(b.get_games('Blitz')?.length).toBe(1);
			expect(c.get_games('Blitz')?.length).toBe(1);
			expect(d.get_games('Blitz')?.length).toBe(1);
			expect(e.get_games('Blitz')?.length).toBe(1);
			expect(f.get_games('Blitz')?.length).toBe(1);
			expect(a.get_games('Classical')?.length).toBe(1);
			expect(b.get_games('Classical')?.length).toBe(1);
			expect(c.get_games('Classical')?.length).toBe(1);
			expect(d.get_games('Classical')?.length).toBe(1);
			expect(e.get_games('Classical')?.length).toBe(1);
			expect(f.get_games('Classical')?.length).toBe(1);

			expect(a.get_rating('Blitz').num_won_drawn_lost()).toEqual([2, 1, 0, 1]);
			expect(b.get_rating('Blitz').num_won_drawn_lost()).toEqual([1, 0, 0, 1]);
			expect(c.get_rating('Blitz').num_won_drawn_lost()).toEqual([1, 0, 0, 1]);
			expect(d.get_rating('Blitz').num_won_drawn_lost()).toEqual([1, 1, 0, 0]);
			expect(e.get_rating('Blitz').num_won_drawn_lost()).toEqual([1, 0, 1, 0]);
			expect(f.get_rating('Blitz').num_won_drawn_lost()).toEqual([2, 1, 1, 0]);
			expect(a.get_rating('Classical').num_won_drawn_lost()).toEqual([2, 1, 0, 1]);
			expect(b.get_rating('Classical').num_won_drawn_lost()).toEqual([1, 0, 0, 1]);
			expect(c.get_rating('Classical').num_won_drawn_lost()).toEqual([1, 0, 0, 1]);
			expect(d.get_rating('Classical').num_won_drawn_lost()).toEqual([1, 1, 0, 0]);
			expect(e.get_rating('Classical').num_won_drawn_lost()).toEqual([1, 0, 1, 0]);
			expect(f.get_rating('Classical').num_won_drawn_lost()).toEqual([2, 1, 1, 0]);
		}
	});
});

describe('Inverse game creation', () => {
	test('Add "Blitz" games', () => {
		const blitz_dir = EnvironmentManager.get_instance().get_dir_games_time_control('Blitz');

		game_add_new(u('a'), u('f'), 'draw', 'Blitz', 'Blitz (5 + 0)', '2025-01-20', '17:06:30:000');
		{
			const game_set = game_set_from_json(fs.readFileSync(path.join(blitz_dir, '2025-01-20'), 'utf8'));
			expect(game_set.length).toBe(1);

			expect(game_set[0].get_id()).toBe('0000000009');
			expect(game_set[0].get_white()).toBe('a');
			expect(game_set[0].get_black()).toBe('f');
			expect(game_set[0].get_result()).toBe('draw');
			expect(game_set[0].get_time_control_id()).toBe('Blitz');
			expect(game_set[0].get_time_control_name()).toBe('Blitz (5 + 0)');
			expect(game_set[0].get_date()).toBe('2025-01-20..17:06:30:000');

			expect(a.get_games('Blitz')?.length).toBe(2);
			expect(b.get_games('Blitz')?.length).toBe(1);
			expect(c.get_games('Blitz')?.length).toBe(1);
			expect(d.get_games('Blitz')?.length).toBe(1);
			expect(e.get_games('Blitz')?.length).toBe(1);
			expect(f.get_games('Blitz')?.length).toBe(2);
			expect(a.get_games('Classical')?.length).toBe(1);
			expect(b.get_games('Classical')?.length).toBe(1);
			expect(c.get_games('Classical')?.length).toBe(1);
			expect(d.get_games('Classical')?.length).toBe(1);
			expect(e.get_games('Classical')?.length).toBe(1);
			expect(f.get_games('Classical')?.length).toBe(1);

			expect(a.get_rating('Blitz').num_won_drawn_lost()).toEqual([3, 1, 1, 1]);
			expect(b.get_rating('Blitz').num_won_drawn_lost()).toEqual([1, 0, 0, 1]);
			expect(c.get_rating('Blitz').num_won_drawn_lost()).toEqual([1, 0, 0, 1]);
			expect(d.get_rating('Blitz').num_won_drawn_lost()).toEqual([1, 1, 0, 0]);
			expect(e.get_rating('Blitz').num_won_drawn_lost()).toEqual([1, 0, 1, 0]);
			expect(f.get_rating('Blitz').num_won_drawn_lost()).toEqual([3, 1, 2, 0]);
			expect(a.get_rating('Classical').num_won_drawn_lost()).toEqual([2, 1, 0, 1]);
			expect(b.get_rating('Classical').num_won_drawn_lost()).toEqual([1, 0, 0, 1]);
			expect(c.get_rating('Classical').num_won_drawn_lost()).toEqual([1, 0, 0, 1]);
			expect(d.get_rating('Classical').num_won_drawn_lost()).toEqual([1, 1, 0, 0]);
			expect(e.get_rating('Classical').num_won_drawn_lost()).toEqual([1, 0, 1, 0]);
			expect(f.get_rating('Classical').num_won_drawn_lost()).toEqual([2, 1, 1, 0]);
		}

		game_add_new(u('e'), u('f'), 'draw', 'Blitz', 'Blitz (5 + 0)', '2025-01-20', '17:06:20:000');
		{
			const game_set = game_set_from_json(fs.readFileSync(path.join(blitz_dir, '2025-01-20'), 'utf8'));
			expect(game_set.length).toBe(2);

			expect(game_set[0].get_id()).toBe('0000000010');
			expect(game_set[0].get_white()).toBe('e');
			expect(game_set[0].get_black()).toBe('f');
			expect(game_set[0].get_result()).toBe('draw');
			expect(game_set[0].get_time_control_id()).toBe('Blitz');
			expect(game_set[0].get_time_control_name()).toBe('Blitz (5 + 0)');
			expect(game_set[0].get_date()).toBe('2025-01-20..17:06:20:000');

			expect(game_set[1].get_id()).toBe('0000000009');
			expect(game_set[1].get_white()).toBe('a');
			expect(game_set[1].get_black()).toBe('f');
			expect(game_set[1].get_result()).toBe('draw');
			expect(game_set[1].get_time_control_id()).toBe('Blitz');
			expect(game_set[1].get_time_control_name()).toBe('Blitz (5 + 0)');
			expect(game_set[1].get_date()).toBe('2025-01-20..17:06:30:000');

			expect(a.get_games('Blitz')?.length).toBe(2);
			expect(b.get_games('Blitz')?.length).toBe(1);
			expect(c.get_games('Blitz')?.length).toBe(1);
			expect(d.get_games('Blitz')?.length).toBe(1);
			expect(e.get_games('Blitz')?.length).toBe(2);
			expect(f.get_games('Blitz')?.length).toBe(2);
			expect(a.get_games('Classical')?.length).toBe(1);
			expect(b.get_games('Classical')?.length).toBe(1);
			expect(c.get_games('Classical')?.length).toBe(1);
			expect(d.get_games('Classical')?.length).toBe(1);
			expect(e.get_games('Classical')?.length).toBe(1);
			expect(f.get_games('Classical')?.length).toBe(1);

			expect(a.get_rating('Blitz').num_won_drawn_lost()).toEqual([3, 1, 1, 1]);
			expect(b.get_rating('Blitz').num_won_drawn_lost()).toEqual([1, 0, 0, 1]);
			expect(c.get_rating('Blitz').num_won_drawn_lost()).toEqual([1, 0, 0, 1]);
			expect(d.get_rating('Blitz').num_won_drawn_lost()).toEqual([1, 1, 0, 0]);
			expect(e.get_rating('Blitz').num_won_drawn_lost()).toEqual([2, 0, 2, 0]);
			expect(f.get_rating('Blitz').num_won_drawn_lost()).toEqual([4, 1, 3, 0]);
			expect(a.get_rating('Classical').num_won_drawn_lost()).toEqual([2, 1, 0, 1]);
			expect(b.get_rating('Classical').num_won_drawn_lost()).toEqual([1, 0, 0, 1]);
			expect(c.get_rating('Classical').num_won_drawn_lost()).toEqual([1, 0, 0, 1]);
			expect(d.get_rating('Classical').num_won_drawn_lost()).toEqual([1, 1, 0, 0]);
			expect(e.get_rating('Classical').num_won_drawn_lost()).toEqual([1, 0, 1, 0]);
			expect(f.get_rating('Classical').num_won_drawn_lost()).toEqual([2, 1, 1, 0]);
		}

		game_add_new(u('c'), u('d'), 'black_wins', 'Blitz', 'Blitz (5 + 3)', '2025-01-20', '17:06:10:000');
		{
			const game_set = game_set_from_json(fs.readFileSync(path.join(blitz_dir, '2025-01-20'), 'utf8'));
			expect(game_set.length).toBe(3);

			expect(game_set[0].get_id()).toBe('0000000011');
			expect(game_set[0].get_white()).toBe('c');
			expect(game_set[0].get_black()).toBe('d');
			expect(game_set[0].get_result()).toBe('black_wins');
			expect(game_set[0].get_time_control_id()).toBe('Blitz');
			expect(game_set[0].get_time_control_name()).toBe('Blitz (5 + 3)');
			expect(game_set[0].get_date()).toBe('2025-01-20..17:06:10:000');

			expect(game_set[1].get_id()).toBe('0000000010');
			expect(game_set[1].get_white()).toBe('e');
			expect(game_set[1].get_black()).toBe('f');
			expect(game_set[1].get_result()).toBe('draw');
			expect(game_set[1].get_time_control_id()).toBe('Blitz');
			expect(game_set[1].get_time_control_name()).toBe('Blitz (5 + 0)');
			expect(game_set[1].get_date()).toBe('2025-01-20..17:06:20:000');

			expect(game_set[2].get_id()).toBe('0000000009');
			expect(game_set[2].get_white()).toBe('a');
			expect(game_set[2].get_black()).toBe('f');
			expect(game_set[2].get_result()).toBe('draw');
			expect(game_set[2].get_time_control_id()).toBe('Blitz');
			expect(game_set[2].get_time_control_name()).toBe('Blitz (5 + 0)');
			expect(game_set[2].get_date()).toBe('2025-01-20..17:06:30:000');

			expect(a.get_games('Blitz')?.length).toBe(2);
			expect(b.get_games('Blitz')?.length).toBe(1);
			expect(c.get_games('Blitz')?.length).toBe(2);
			expect(d.get_games('Blitz')?.length).toBe(2);
			expect(e.get_games('Blitz')?.length).toBe(2);
			expect(f.get_games('Blitz')?.length).toBe(2);
			expect(a.get_games('Classical')?.length).toBe(1);
			expect(b.get_games('Classical')?.length).toBe(1);
			expect(c.get_games('Classical')?.length).toBe(1);
			expect(d.get_games('Classical')?.length).toBe(1);
			expect(e.get_games('Classical')?.length).toBe(1);
			expect(f.get_games('Classical')?.length).toBe(1);

			expect(a.get_rating('Blitz').num_won_drawn_lost()).toEqual([3, 1, 1, 1]);
			expect(b.get_rating('Blitz').num_won_drawn_lost()).toEqual([1, 0, 0, 1]);
			expect(c.get_rating('Blitz').num_won_drawn_lost()).toEqual([2, 0, 0, 2]);
			expect(d.get_rating('Blitz').num_won_drawn_lost()).toEqual([2, 2, 0, 0]);
			expect(e.get_rating('Blitz').num_won_drawn_lost()).toEqual([2, 0, 2, 0]);
			expect(f.get_rating('Blitz').num_won_drawn_lost()).toEqual([4, 1, 3, 0]);
			expect(a.get_rating('Classical').num_won_drawn_lost()).toEqual([2, 1, 0, 1]);
			expect(b.get_rating('Classical').num_won_drawn_lost()).toEqual([1, 0, 0, 1]);
			expect(c.get_rating('Classical').num_won_drawn_lost()).toEqual([1, 0, 0, 1]);
			expect(d.get_rating('Classical').num_won_drawn_lost()).toEqual([1, 1, 0, 0]);
			expect(e.get_rating('Classical').num_won_drawn_lost()).toEqual([1, 0, 1, 0]);
			expect(f.get_rating('Classical').num_won_drawn_lost()).toEqual([2, 1, 1, 0]);
		}

		game_add_new(u('a'), u('b'), 'white_wins', 'Blitz', 'Blitz (5 + 3)', '2025-01-20', '17:06:00:000');
		{
			const game_set = game_set_from_json(fs.readFileSync(path.join(blitz_dir, '2025-01-20'), 'utf8'));
			expect(game_set.length).toBe(4);

			expect(game_set[0].get_id()).toBe('0000000012');
			expect(game_set[0].get_white()).toBe('a');
			expect(game_set[0].get_black()).toBe('b');
			expect(game_set[0].get_result()).toBe('white_wins');
			expect(game_set[0].get_time_control_id()).toBe('Blitz');
			expect(game_set[0].get_time_control_name()).toBe('Blitz (5 + 3)');
			expect(game_set[0].get_date()).toBe('2025-01-20..17:06:00:000');

			expect(game_set[1].get_id()).toBe('0000000011');
			expect(game_set[1].get_white()).toBe('c');
			expect(game_set[1].get_black()).toBe('d');
			expect(game_set[1].get_result()).toBe('black_wins');
			expect(game_set[1].get_time_control_id()).toBe('Blitz');
			expect(game_set[1].get_time_control_name()).toBe('Blitz (5 + 3)');
			expect(game_set[1].get_date()).toBe('2025-01-20..17:06:10:000');

			expect(game_set[2].get_id()).toBe('0000000010');
			expect(game_set[2].get_white()).toBe('e');
			expect(game_set[2].get_black()).toBe('f');
			expect(game_set[2].get_result()).toBe('draw');
			expect(game_set[2].get_time_control_id()).toBe('Blitz');
			expect(game_set[2].get_time_control_name()).toBe('Blitz (5 + 0)');
			expect(game_set[2].get_date()).toBe('2025-01-20..17:06:20:000');

			expect(game_set[3].get_id()).toBe('0000000009');
			expect(game_set[3].get_white()).toBe('a');
			expect(game_set[3].get_black()).toBe('f');
			expect(game_set[3].get_result()).toBe('draw');
			expect(game_set[3].get_time_control_id()).toBe('Blitz');
			expect(game_set[3].get_time_control_name()).toBe('Blitz (5 + 0)');
			expect(game_set[3].get_date()).toBe('2025-01-20..17:06:30:000');

			expect(a.get_games('Blitz')?.length).toBe(2);
			expect(b.get_games('Blitz')?.length).toBe(2);
			expect(c.get_games('Blitz')?.length).toBe(2);
			expect(d.get_games('Blitz')?.length).toBe(2);
			expect(e.get_games('Blitz')?.length).toBe(2);
			expect(f.get_games('Blitz')?.length).toBe(2);
			expect(a.get_games('Classical')?.length).toBe(1);
			expect(b.get_games('Classical')?.length).toBe(1);
			expect(c.get_games('Classical')?.length).toBe(1);
			expect(d.get_games('Classical')?.length).toBe(1);
			expect(e.get_games('Classical')?.length).toBe(1);
			expect(f.get_games('Classical')?.length).toBe(1);

			expect(a.get_rating('Blitz').num_won_drawn_lost()).toEqual([4, 2, 1, 1]);
			expect(b.get_rating('Blitz').num_won_drawn_lost()).toEqual([2, 0, 0, 2]);
			expect(c.get_rating('Blitz').num_won_drawn_lost()).toEqual([2, 0, 0, 2]);
			expect(d.get_rating('Blitz').num_won_drawn_lost()).toEqual([2, 2, 0, 0]);
			expect(e.get_rating('Blitz').num_won_drawn_lost()).toEqual([2, 0, 2, 0]);
			expect(f.get_rating('Blitz').num_won_drawn_lost()).toEqual([4, 1, 3, 0]);
			expect(a.get_rating('Classical').num_won_drawn_lost()).toEqual([2, 1, 0, 1]);
			expect(b.get_rating('Classical').num_won_drawn_lost()).toEqual([1, 0, 0, 1]);
			expect(c.get_rating('Classical').num_won_drawn_lost()).toEqual([1, 0, 0, 1]);
			expect(d.get_rating('Classical').num_won_drawn_lost()).toEqual([1, 1, 0, 0]);
			expect(e.get_rating('Classical').num_won_drawn_lost()).toEqual([1, 0, 1, 0]);
			expect(f.get_rating('Classical').num_won_drawn_lost()).toEqual([2, 1, 1, 0]);
		}
	});

	test('Add "Classical" games', () => {
		const classical_dir = EnvironmentManager.get_instance().get_dir_games_time_control('Classical');

		game_add_new(u('a'), u('f'), 'draw', 'Classical', 'Classical (90 + 30)', '2025-01-20', '17:06:30:000');
		{
			const game_set = game_set_from_json(fs.readFileSync(path.join(classical_dir, '2025-01-20'), 'utf8'));
			expect(game_set.length).toBe(1);

			expect(game_set[0].get_id()).toBe('0000000013');
			expect(game_set[0].get_white()).toBe('a');
			expect(game_set[0].get_black()).toBe('f');
			expect(game_set[0].get_result()).toBe('draw');
			expect(game_set[0].get_time_control_id()).toBe('Classical');
			expect(game_set[0].get_time_control_name()).toBe('Classical (90 + 30)');
			expect(game_set[0].get_date()).toBe('2025-01-20..17:06:30:000');

			expect(a.get_games('Blitz')?.length).toBe(2);
			expect(b.get_games('Blitz')?.length).toBe(2);
			expect(c.get_games('Blitz')?.length).toBe(2);
			expect(d.get_games('Blitz')?.length).toBe(2);
			expect(e.get_games('Blitz')?.length).toBe(2);
			expect(f.get_games('Blitz')?.length).toBe(2);
			expect(a.get_games('Classical')?.length).toBe(2);
			expect(b.get_games('Classical')?.length).toBe(1);
			expect(c.get_games('Classical')?.length).toBe(1);
			expect(d.get_games('Classical')?.length).toBe(1);
			expect(e.get_games('Classical')?.length).toBe(1);
			expect(f.get_games('Classical')?.length).toBe(2);

			expect(a.get_rating('Blitz').num_won_drawn_lost()).toEqual([4, 2, 1, 1]);
			expect(b.get_rating('Blitz').num_won_drawn_lost()).toEqual([2, 0, 0, 2]);
			expect(c.get_rating('Blitz').num_won_drawn_lost()).toEqual([2, 0, 0, 2]);
			expect(d.get_rating('Blitz').num_won_drawn_lost()).toEqual([2, 2, 0, 0]);
			expect(e.get_rating('Blitz').num_won_drawn_lost()).toEqual([2, 0, 2, 0]);
			expect(f.get_rating('Blitz').num_won_drawn_lost()).toEqual([4, 1, 3, 0]);
			expect(a.get_rating('Classical').num_won_drawn_lost()).toEqual([3, 1, 1, 1]);
			expect(b.get_rating('Classical').num_won_drawn_lost()).toEqual([1, 0, 0, 1]);
			expect(c.get_rating('Classical').num_won_drawn_lost()).toEqual([1, 0, 0, 1]);
			expect(d.get_rating('Classical').num_won_drawn_lost()).toEqual([1, 1, 0, 0]);
			expect(e.get_rating('Classical').num_won_drawn_lost()).toEqual([1, 0, 1, 0]);
			expect(f.get_rating('Classical').num_won_drawn_lost()).toEqual([3, 1, 2, 0]);
		}

		game_add_new(u('e'), u('f'), 'draw', 'Classical', 'Classical (90 + 30)', '2025-01-20', '17:06:20:000');
		{
			const game_set = game_set_from_json(fs.readFileSync(path.join(classical_dir, '2025-01-20'), 'utf8'));
			expect(game_set.length).toBe(2);

			expect(game_set[0].get_id()).toBe('0000000014');
			expect(game_set[0].get_white()).toBe('e');
			expect(game_set[0].get_black()).toBe('f');
			expect(game_set[0].get_result()).toBe('draw');
			expect(game_set[0].get_time_control_id()).toBe('Classical');
			expect(game_set[0].get_time_control_name()).toBe('Classical (90 + 30)');
			expect(game_set[0].get_date()).toBe('2025-01-20..17:06:20:000');

			expect(game_set[1].get_id()).toBe('0000000013');
			expect(game_set[1].get_white()).toBe('a');
			expect(game_set[1].get_black()).toBe('f');
			expect(game_set[1].get_result()).toBe('draw');
			expect(game_set[1].get_time_control_id()).toBe('Classical');
			expect(game_set[1].get_time_control_name()).toBe('Classical (90 + 30)');
			expect(game_set[1].get_date()).toBe('2025-01-20..17:06:30:000');

			expect(a.get_games('Blitz')?.length).toBe(2);
			expect(b.get_games('Blitz')?.length).toBe(2);
			expect(c.get_games('Blitz')?.length).toBe(2);
			expect(d.get_games('Blitz')?.length).toBe(2);
			expect(e.get_games('Blitz')?.length).toBe(2);
			expect(f.get_games('Blitz')?.length).toBe(2);
			expect(a.get_games('Classical')?.length).toBe(2);
			expect(b.get_games('Classical')?.length).toBe(1);
			expect(c.get_games('Classical')?.length).toBe(1);
			expect(d.get_games('Classical')?.length).toBe(1);
			expect(e.get_games('Classical')?.length).toBe(2);
			expect(f.get_games('Classical')?.length).toBe(2);

			expect(a.get_rating('Blitz').num_won_drawn_lost()).toEqual([4, 2, 1, 1]);
			expect(b.get_rating('Blitz').num_won_drawn_lost()).toEqual([2, 0, 0, 2]);
			expect(c.get_rating('Blitz').num_won_drawn_lost()).toEqual([2, 0, 0, 2]);
			expect(d.get_rating('Blitz').num_won_drawn_lost()).toEqual([2, 2, 0, 0]);
			expect(e.get_rating('Blitz').num_won_drawn_lost()).toEqual([2, 0, 2, 0]);
			expect(f.get_rating('Blitz').num_won_drawn_lost()).toEqual([4, 1, 3, 0]);
			expect(a.get_rating('Classical').num_won_drawn_lost()).toEqual([3, 1, 1, 1]);
			expect(b.get_rating('Classical').num_won_drawn_lost()).toEqual([1, 0, 0, 1]);
			expect(c.get_rating('Classical').num_won_drawn_lost()).toEqual([1, 0, 0, 1]);
			expect(d.get_rating('Classical').num_won_drawn_lost()).toEqual([1, 1, 0, 0]);
			expect(e.get_rating('Classical').num_won_drawn_lost()).toEqual([2, 0, 2, 0]);
			expect(f.get_rating('Classical').num_won_drawn_lost()).toEqual([4, 1, 3, 0]);
		}

		game_add_new(u('c'), u('d'), 'black_wins', 'Classical', 'Classical (90 + 30)', '2025-01-20', '17:06:10:000');
		{
			const game_set = game_set_from_json(fs.readFileSync(path.join(classical_dir, '2025-01-20'), 'utf8'));
			expect(game_set.length).toBe(3);

			expect(game_set[0].get_id()).toBe('0000000015');
			expect(game_set[0].get_white()).toBe('c');
			expect(game_set[0].get_black()).toBe('d');
			expect(game_set[0].get_result()).toBe('black_wins');
			expect(game_set[0].get_time_control_id()).toBe('Classical');
			expect(game_set[0].get_time_control_name()).toBe('Classical (90 + 30)');
			expect(game_set[0].get_date()).toBe('2025-01-20..17:06:10:000');

			expect(game_set[1].get_id()).toBe('0000000014');
			expect(game_set[1].get_white()).toBe('e');
			expect(game_set[1].get_black()).toBe('f');
			expect(game_set[1].get_result()).toBe('draw');
			expect(game_set[1].get_time_control_id()).toBe('Classical');
			expect(game_set[1].get_time_control_name()).toBe('Classical (90 + 30)');
			expect(game_set[1].get_date()).toBe('2025-01-20..17:06:20:000');

			expect(game_set[2].get_id()).toBe('0000000013');
			expect(game_set[2].get_white()).toBe('a');
			expect(game_set[2].get_black()).toBe('f');
			expect(game_set[2].get_result()).toBe('draw');
			expect(game_set[2].get_time_control_id()).toBe('Classical');
			expect(game_set[2].get_time_control_name()).toBe('Classical (90 + 30)');
			expect(game_set[2].get_date()).toBe('2025-01-20..17:06:30:000');

			expect(a.get_games('Blitz')?.length).toBe(2);
			expect(b.get_games('Blitz')?.length).toBe(2);
			expect(c.get_games('Blitz')?.length).toBe(2);
			expect(d.get_games('Blitz')?.length).toBe(2);
			expect(e.get_games('Blitz')?.length).toBe(2);
			expect(f.get_games('Blitz')?.length).toBe(2);
			expect(a.get_games('Classical')?.length).toBe(2);
			expect(b.get_games('Classical')?.length).toBe(1);
			expect(c.get_games('Classical')?.length).toBe(2);
			expect(d.get_games('Classical')?.length).toBe(2);
			expect(e.get_games('Classical')?.length).toBe(2);
			expect(f.get_games('Classical')?.length).toBe(2);

			expect(a.get_rating('Blitz').num_won_drawn_lost()).toEqual([4, 2, 1, 1]);
			expect(b.get_rating('Blitz').num_won_drawn_lost()).toEqual([2, 0, 0, 2]);
			expect(c.get_rating('Blitz').num_won_drawn_lost()).toEqual([2, 0, 0, 2]);
			expect(d.get_rating('Blitz').num_won_drawn_lost()).toEqual([2, 2, 0, 0]);
			expect(e.get_rating('Blitz').num_won_drawn_lost()).toEqual([2, 0, 2, 0]);
			expect(f.get_rating('Blitz').num_won_drawn_lost()).toEqual([4, 1, 3, 0]);
			expect(a.get_rating('Classical').num_won_drawn_lost()).toEqual([3, 1, 1, 1]);
			expect(b.get_rating('Classical').num_won_drawn_lost()).toEqual([1, 0, 0, 1]);
			expect(c.get_rating('Classical').num_won_drawn_lost()).toEqual([2, 0, 0, 2]);
			expect(d.get_rating('Classical').num_won_drawn_lost()).toEqual([2, 2, 0, 0]);
			expect(e.get_rating('Classical').num_won_drawn_lost()).toEqual([2, 0, 2, 0]);
			expect(f.get_rating('Classical').num_won_drawn_lost()).toEqual([4, 1, 3, 0]);
		}

		game_add_new(u('a'), u('b'), 'white_wins', 'Classical', 'Classical (90 + 30)', '2025-01-20', '17:06:00:000');
		{
			const game_set = game_set_from_json(fs.readFileSync(path.join(classical_dir, '2025-01-20'), 'utf8'));
			expect(game_set.length).toBe(4);

			expect(game_set[0].get_id()).toBe('0000000016');
			expect(game_set[0].get_white()).toBe('a');
			expect(game_set[0].get_black()).toBe('b');
			expect(game_set[0].get_result()).toBe('white_wins');
			expect(game_set[0].get_time_control_id()).toBe('Classical');
			expect(game_set[0].get_time_control_name()).toBe('Classical (90 + 30)');
			expect(game_set[0].get_date()).toBe('2025-01-20..17:06:00:000');

			expect(game_set[1].get_id()).toBe('0000000015');
			expect(game_set[1].get_white()).toBe('c');
			expect(game_set[1].get_black()).toBe('d');
			expect(game_set[1].get_result()).toBe('black_wins');
			expect(game_set[1].get_time_control_id()).toBe('Classical');
			expect(game_set[1].get_time_control_name()).toBe('Classical (90 + 30)');
			expect(game_set[1].get_date()).toBe('2025-01-20..17:06:10:000');

			expect(game_set[2].get_id()).toBe('0000000014');
			expect(game_set[2].get_white()).toBe('e');
			expect(game_set[2].get_black()).toBe('f');
			expect(game_set[2].get_result()).toBe('draw');
			expect(game_set[2].get_time_control_id()).toBe('Classical');
			expect(game_set[2].get_time_control_name()).toBe('Classical (90 + 30)');
			expect(game_set[2].get_date()).toBe('2025-01-20..17:06:20:000');

			expect(game_set[3].get_id()).toBe('0000000013');
			expect(game_set[3].get_white()).toBe('a');
			expect(game_set[3].get_black()).toBe('f');
			expect(game_set[3].get_result()).toBe('draw');
			expect(game_set[3].get_time_control_id()).toBe('Classical');
			expect(game_set[3].get_time_control_name()).toBe('Classical (90 + 30)');
			expect(game_set[3].get_date()).toBe('2025-01-20..17:06:30:000');

			expect(a.get_games('Blitz')?.length).toBe(2);
			expect(b.get_games('Blitz')?.length).toBe(2);
			expect(c.get_games('Blitz')?.length).toBe(2);
			expect(d.get_games('Blitz')?.length).toBe(2);
			expect(e.get_games('Blitz')?.length).toBe(2);
			expect(f.get_games('Blitz')?.length).toBe(2);
			expect(a.get_games('Classical')?.length).toBe(2);
			expect(b.get_games('Classical')?.length).toBe(2);
			expect(c.get_games('Classical')?.length).toBe(2);
			expect(d.get_games('Classical')?.length).toBe(2);
			expect(e.get_games('Classical')?.length).toBe(2);
			expect(f.get_games('Classical')?.length).toBe(2);

			expect(a.get_rating('Blitz').num_won_drawn_lost()).toEqual([4, 2, 1, 1]);
			expect(b.get_rating('Blitz').num_won_drawn_lost()).toEqual([2, 0, 0, 2]);
			expect(c.get_rating('Blitz').num_won_drawn_lost()).toEqual([2, 0, 0, 2]);
			expect(d.get_rating('Blitz').num_won_drawn_lost()).toEqual([2, 2, 0, 0]);
			expect(e.get_rating('Blitz').num_won_drawn_lost()).toEqual([2, 0, 2, 0]);
			expect(f.get_rating('Blitz').num_won_drawn_lost()).toEqual([4, 1, 3, 0]);
			expect(a.get_rating('Classical').num_won_drawn_lost()).toEqual([4, 2, 1, 1]);
			expect(b.get_rating('Classical').num_won_drawn_lost()).toEqual([2, 0, 0, 2]);
			expect(c.get_rating('Classical').num_won_drawn_lost()).toEqual([2, 0, 0, 2]);
			expect(d.get_rating('Classical').num_won_drawn_lost()).toEqual([2, 2, 0, 0]);
			expect(e.get_rating('Classical').num_won_drawn_lost()).toEqual([2, 0, 2, 0]);
			expect(f.get_rating('Classical').num_won_drawn_lost()).toEqual([4, 1, 3, 0]);
		}
	});
});

describe('Zig-zag game creation', () => {
	test('Add "Blitz" games', () => {
		const blitz_dir = EnvironmentManager.get_instance().get_dir_games_time_control('Blitz');
		game_add_new(u('a'), u('f'), 'draw', 'Blitz', 'Blitz (5 + 0)', '2025-01-20', '17:06:25:000');
		{
			const game_set = game_set_from_json(fs.readFileSync(path.join(blitz_dir, '2025-01-20'), 'utf8'));
			expect(game_set.length).toBe(5);

			expect(game_set[0].get_id()).toBe('0000000012');
			expect(game_set[0].get_white()).toBe('a');
			expect(game_set[0].get_black()).toBe('b');
			expect(game_set[0].get_result()).toBe('white_wins');
			expect(game_set[0].get_time_control_id()).toBe('Blitz');
			expect(game_set[0].get_time_control_name()).toBe('Blitz (5 + 3)');
			expect(game_set[0].get_date()).toBe('2025-01-20..17:06:00:000');

			expect(game_set[1].get_id()).toBe('0000000011');
			expect(game_set[1].get_white()).toBe('c');
			expect(game_set[1].get_black()).toBe('d');
			expect(game_set[1].get_result()).toBe('black_wins');
			expect(game_set[1].get_time_control_id()).toBe('Blitz');
			expect(game_set[1].get_time_control_name()).toBe('Blitz (5 + 3)');
			expect(game_set[1].get_date()).toBe('2025-01-20..17:06:10:000');

			expect(game_set[2].get_id()).toBe('0000000010');
			expect(game_set[2].get_white()).toBe('e');
			expect(game_set[2].get_black()).toBe('f');
			expect(game_set[2].get_result()).toBe('draw');
			expect(game_set[2].get_time_control_id()).toBe('Blitz');
			expect(game_set[2].get_time_control_name()).toBe('Blitz (5 + 0)');
			expect(game_set[2].get_date()).toBe('2025-01-20..17:06:20:000');

			expect(game_set[3].get_id()).toBe('0000000017');
			expect(game_set[3].get_white()).toBe('a');
			expect(game_set[3].get_black()).toBe('f');
			expect(game_set[3].get_result()).toBe('draw');
			expect(game_set[3].get_time_control_id()).toBe('Blitz');
			expect(game_set[3].get_time_control_name()).toBe('Blitz (5 + 0)');
			expect(game_set[3].get_date()).toBe('2025-01-20..17:06:25:000');

			expect(game_set[4].get_id()).toBe('0000000009');
			expect(game_set[4].get_white()).toBe('a');
			expect(game_set[4].get_black()).toBe('f');
			expect(game_set[4].get_result()).toBe('draw');
			expect(game_set[4].get_time_control_id()).toBe('Blitz');
			expect(game_set[4].get_time_control_name()).toBe('Blitz (5 + 0)');
			expect(game_set[4].get_date()).toBe('2025-01-20..17:06:30:000');

			expect(a.get_games('Blitz')?.length).toBe(2);
			expect(b.get_games('Blitz')?.length).toBe(2);
			expect(c.get_games('Blitz')?.length).toBe(2);
			expect(d.get_games('Blitz')?.length).toBe(2);
			expect(e.get_games('Blitz')?.length).toBe(2);
			expect(f.get_games('Blitz')?.length).toBe(2);
			expect(a.get_games('Classical')?.length).toBe(2);
			expect(b.get_games('Classical')?.length).toBe(2);
			expect(c.get_games('Classical')?.length).toBe(2);
			expect(d.get_games('Classical')?.length).toBe(2);
			expect(e.get_games('Classical')?.length).toBe(2);
			expect(f.get_games('Classical')?.length).toBe(2);

			expect(a.get_rating('Blitz').num_won_drawn_lost()).toEqual([5, 2, 2, 1]);
			expect(b.get_rating('Blitz').num_won_drawn_lost()).toEqual([2, 0, 0, 2]);
			expect(c.get_rating('Blitz').num_won_drawn_lost()).toEqual([2, 0, 0, 2]);
			expect(d.get_rating('Blitz').num_won_drawn_lost()).toEqual([2, 2, 0, 0]);
			expect(e.get_rating('Blitz').num_won_drawn_lost()).toEqual([2, 0, 2, 0]);
			expect(f.get_rating('Blitz').num_won_drawn_lost()).toEqual([5, 1, 4, 0]);
			expect(a.get_rating('Classical').num_won_drawn_lost()).toEqual([4, 2, 1, 1]);
			expect(b.get_rating('Classical').num_won_drawn_lost()).toEqual([2, 0, 0, 2]);
			expect(c.get_rating('Classical').num_won_drawn_lost()).toEqual([2, 0, 0, 2]);
			expect(d.get_rating('Classical').num_won_drawn_lost()).toEqual([2, 2, 0, 0]);
			expect(e.get_rating('Classical').num_won_drawn_lost()).toEqual([2, 0, 2, 0]);
			expect(f.get_rating('Classical').num_won_drawn_lost()).toEqual([4, 1, 3, 0]);
		}

		game_add_new(u('e'), u('f'), 'draw', 'Blitz', 'Blitz (5 + 0)', '2025-01-20', '17:06:05:000');
		{
			const game_set = game_set_from_json(fs.readFileSync(path.join(blitz_dir, '2025-01-20'), 'utf8'));
			expect(game_set.length).toBe(6);

			expect(game_set[0].get_id()).toBe('0000000012');
			expect(game_set[0].get_white()).toBe('a');
			expect(game_set[0].get_black()).toBe('b');
			expect(game_set[0].get_result()).toBe('white_wins');
			expect(game_set[0].get_time_control_id()).toBe('Blitz');
			expect(game_set[0].get_time_control_name()).toBe('Blitz (5 + 3)');
			expect(game_set[0].get_date()).toBe('2025-01-20..17:06:00:000');

			expect(game_set[1].get_id()).toBe('0000000018');
			expect(game_set[1].get_white()).toBe('e');
			expect(game_set[1].get_black()).toBe('f');
			expect(game_set[1].get_result()).toBe('draw');
			expect(game_set[1].get_time_control_id()).toBe('Blitz');
			expect(game_set[1].get_time_control_name()).toBe('Blitz (5 + 0)');
			expect(game_set[1].get_date()).toBe('2025-01-20..17:06:05:000');

			expect(game_set[2].get_id()).toBe('0000000011');
			expect(game_set[2].get_white()).toBe('c');
			expect(game_set[2].get_black()).toBe('d');
			expect(game_set[2].get_result()).toBe('black_wins');
			expect(game_set[2].get_time_control_id()).toBe('Blitz');
			expect(game_set[2].get_time_control_name()).toBe('Blitz (5 + 3)');
			expect(game_set[2].get_date()).toBe('2025-01-20..17:06:10:000');

			expect(game_set[3].get_id()).toBe('0000000010');
			expect(game_set[3].get_white()).toBe('e');
			expect(game_set[3].get_black()).toBe('f');
			expect(game_set[3].get_result()).toBe('draw');
			expect(game_set[3].get_time_control_id()).toBe('Blitz');
			expect(game_set[3].get_time_control_name()).toBe('Blitz (5 + 0)');
			expect(game_set[3].get_date()).toBe('2025-01-20..17:06:20:000');

			expect(game_set[4].get_id()).toBe('0000000017');
			expect(game_set[4].get_white()).toBe('a');
			expect(game_set[4].get_black()).toBe('f');
			expect(game_set[4].get_result()).toBe('draw');
			expect(game_set[4].get_time_control_id()).toBe('Blitz');
			expect(game_set[4].get_time_control_name()).toBe('Blitz (5 + 0)');
			expect(game_set[4].get_date()).toBe('2025-01-20..17:06:25:000');

			expect(game_set[5].get_id()).toBe('0000000009');
			expect(game_set[5].get_white()).toBe('a');
			expect(game_set[5].get_black()).toBe('f');
			expect(game_set[5].get_result()).toBe('draw');
			expect(game_set[5].get_time_control_id()).toBe('Blitz');
			expect(game_set[5].get_time_control_name()).toBe('Blitz (5 + 0)');
			expect(game_set[5].get_date()).toBe('2025-01-20..17:06:30:000');

			expect(a.get_games('Blitz')?.length).toBe(2);
			expect(b.get_games('Blitz')?.length).toBe(2);
			expect(c.get_games('Blitz')?.length).toBe(2);
			expect(d.get_games('Blitz')?.length).toBe(2);
			expect(e.get_games('Blitz')?.length).toBe(2);
			expect(f.get_games('Blitz')?.length).toBe(2);
			expect(a.get_games('Classical')?.length).toBe(2);
			expect(b.get_games('Classical')?.length).toBe(2);
			expect(c.get_games('Classical')?.length).toBe(2);
			expect(d.get_games('Classical')?.length).toBe(2);
			expect(e.get_games('Classical')?.length).toBe(2);
			expect(f.get_games('Classical')?.length).toBe(2);

			expect(a.get_rating('Blitz').num_won_drawn_lost()).toEqual([5, 2, 2, 1]);
			expect(b.get_rating('Blitz').num_won_drawn_lost()).toEqual([2, 0, 0, 2]);
			expect(c.get_rating('Blitz').num_won_drawn_lost()).toEqual([2, 0, 0, 2]);
			expect(d.get_rating('Blitz').num_won_drawn_lost()).toEqual([2, 2, 0, 0]);
			expect(e.get_rating('Blitz').num_won_drawn_lost()).toEqual([3, 0, 3, 0]);
			expect(f.get_rating('Blitz').num_won_drawn_lost()).toEqual([6, 1, 5, 0]);
			expect(a.get_rating('Classical').num_won_drawn_lost()).toEqual([4, 2, 1, 1]);
			expect(b.get_rating('Classical').num_won_drawn_lost()).toEqual([2, 0, 0, 2]);
			expect(c.get_rating('Classical').num_won_drawn_lost()).toEqual([2, 0, 0, 2]);
			expect(d.get_rating('Classical').num_won_drawn_lost()).toEqual([2, 2, 0, 0]);
			expect(e.get_rating('Classical').num_won_drawn_lost()).toEqual([2, 0, 2, 0]);
			expect(f.get_rating('Classical').num_won_drawn_lost()).toEqual([4, 1, 3, 0]);
		}

		game_add_new(u('c'), u('d'), 'white_wins', 'Blitz', 'Blitz (5 + 3)', '2025-01-20', '17:06:15:000');
		{
			const game_set = game_set_from_json(fs.readFileSync(path.join(blitz_dir, '2025-01-20'), 'utf8'));
			expect(game_set.length).toBe(7);

			expect(game_set[0].get_id()).toBe('0000000012');
			expect(game_set[0].get_white()).toBe('a');
			expect(game_set[0].get_black()).toBe('b');
			expect(game_set[0].get_result()).toBe('white_wins');
			expect(game_set[0].get_time_control_id()).toBe('Blitz');
			expect(game_set[0].get_time_control_name()).toBe('Blitz (5 + 3)');
			expect(game_set[0].get_date()).toBe('2025-01-20..17:06:00:000');

			expect(game_set[1].get_id()).toBe('0000000018');
			expect(game_set[1].get_white()).toBe('e');
			expect(game_set[1].get_black()).toBe('f');
			expect(game_set[1].get_result()).toBe('draw');
			expect(game_set[1].get_time_control_id()).toBe('Blitz');
			expect(game_set[1].get_time_control_name()).toBe('Blitz (5 + 0)');
			expect(game_set[1].get_date()).toBe('2025-01-20..17:06:05:000');

			expect(game_set[2].get_id()).toBe('0000000011');
			expect(game_set[2].get_white()).toBe('c');
			expect(game_set[2].get_black()).toBe('d');
			expect(game_set[2].get_result()).toBe('black_wins');
			expect(game_set[2].get_time_control_id()).toBe('Blitz');
			expect(game_set[2].get_time_control_name()).toBe('Blitz (5 + 3)');
			expect(game_set[2].get_date()).toBe('2025-01-20..17:06:10:000');

			expect(game_set[3].get_id()).toBe('0000000019');
			expect(game_set[3].get_white()).toBe('c');
			expect(game_set[3].get_black()).toBe('d');
			expect(game_set[3].get_result()).toBe('white_wins');
			expect(game_set[3].get_time_control_id()).toBe('Blitz');
			expect(game_set[3].get_time_control_name()).toBe('Blitz (5 + 3)');
			expect(game_set[3].get_date()).toBe('2025-01-20..17:06:15:000');

			expect(game_set[4].get_id()).toBe('0000000010');
			expect(game_set[4].get_white()).toBe('e');
			expect(game_set[4].get_black()).toBe('f');
			expect(game_set[4].get_result()).toBe('draw');
			expect(game_set[4].get_time_control_id()).toBe('Blitz');
			expect(game_set[4].get_time_control_name()).toBe('Blitz (5 + 0)');
			expect(game_set[4].get_date()).toBe('2025-01-20..17:06:20:000');

			expect(game_set[5].get_id()).toBe('0000000017');
			expect(game_set[5].get_white()).toBe('a');
			expect(game_set[5].get_black()).toBe('f');
			expect(game_set[5].get_result()).toBe('draw');
			expect(game_set[5].get_time_control_id()).toBe('Blitz');
			expect(game_set[5].get_time_control_name()).toBe('Blitz (5 + 0)');
			expect(game_set[5].get_date()).toBe('2025-01-20..17:06:25:000');

			expect(game_set[6].get_id()).toBe('0000000009');
			expect(game_set[6].get_white()).toBe('a');
			expect(game_set[6].get_black()).toBe('f');
			expect(game_set[6].get_result()).toBe('draw');
			expect(game_set[6].get_time_control_id()).toBe('Blitz');
			expect(game_set[6].get_time_control_name()).toBe('Blitz (5 + 0)');
			expect(game_set[6].get_date()).toBe('2025-01-20..17:06:30:000');

			expect(a.get_games('Blitz')?.length).toBe(2);
			expect(b.get_games('Blitz')?.length).toBe(2);
			expect(c.get_games('Blitz')?.length).toBe(2);
			expect(d.get_games('Blitz')?.length).toBe(2);
			expect(e.get_games('Blitz')?.length).toBe(2);
			expect(f.get_games('Blitz')?.length).toBe(2);
			expect(a.get_games('Classical')?.length).toBe(2);
			expect(b.get_games('Classical')?.length).toBe(2);
			expect(c.get_games('Classical')?.length).toBe(2);
			expect(d.get_games('Classical')?.length).toBe(2);
			expect(e.get_games('Classical')?.length).toBe(2);
			expect(f.get_games('Classical')?.length).toBe(2);

			expect(a.get_rating('Blitz').num_won_drawn_lost()).toEqual([5, 2, 2, 1]);
			expect(b.get_rating('Blitz').num_won_drawn_lost()).toEqual([2, 0, 0, 2]);
			expect(c.get_rating('Blitz').num_won_drawn_lost()).toEqual([3, 1, 0, 2]);
			expect(d.get_rating('Blitz').num_won_drawn_lost()).toEqual([3, 2, 0, 1]);
			expect(e.get_rating('Blitz').num_won_drawn_lost()).toEqual([3, 0, 3, 0]);
			expect(f.get_rating('Blitz').num_won_drawn_lost()).toEqual([6, 1, 5, 0]);
			expect(a.get_rating('Classical').num_won_drawn_lost()).toEqual([4, 2, 1, 1]);
			expect(b.get_rating('Classical').num_won_drawn_lost()).toEqual([2, 0, 0, 2]);
			expect(c.get_rating('Classical').num_won_drawn_lost()).toEqual([2, 0, 0, 2]);
			expect(d.get_rating('Classical').num_won_drawn_lost()).toEqual([2, 2, 0, 0]);
			expect(e.get_rating('Classical').num_won_drawn_lost()).toEqual([2, 0, 2, 0]);
			expect(f.get_rating('Classical').num_won_drawn_lost()).toEqual([4, 1, 3, 0]);
		}

		game_add_new(u('a'), u('b'), 'black_wins', 'Blitz', 'Blitz (5 + 3)', '2025-01-20', '17:05:55:000');
		{
			const game_set = game_set_from_json(fs.readFileSync(path.join(blitz_dir, '2025-01-20'), 'utf8'));
			expect(game_set.length).toBe(8);

			expect(game_set[0].get_id()).toBe('0000000020');
			expect(game_set[0].get_white()).toBe('a');
			expect(game_set[0].get_black()).toBe('b');
			expect(game_set[0].get_result()).toBe('black_wins');
			expect(game_set[0].get_time_control_id()).toBe('Blitz');
			expect(game_set[0].get_time_control_name()).toBe('Blitz (5 + 3)');
			expect(game_set[0].get_date()).toBe('2025-01-20..17:05:55:000');

			expect(game_set[1].get_id()).toBe('0000000012');
			expect(game_set[1].get_white()).toBe('a');
			expect(game_set[1].get_black()).toBe('b');
			expect(game_set[1].get_result()).toBe('white_wins');
			expect(game_set[1].get_time_control_id()).toBe('Blitz');
			expect(game_set[1].get_time_control_name()).toBe('Blitz (5 + 3)');
			expect(game_set[1].get_date()).toBe('2025-01-20..17:06:00:000');

			expect(game_set[2].get_id()).toBe('0000000018');
			expect(game_set[2].get_white()).toBe('e');
			expect(game_set[2].get_black()).toBe('f');
			expect(game_set[2].get_result()).toBe('draw');
			expect(game_set[2].get_time_control_id()).toBe('Blitz');
			expect(game_set[2].get_time_control_name()).toBe('Blitz (5 + 0)');
			expect(game_set[2].get_date()).toBe('2025-01-20..17:06:05:000');

			expect(game_set[3].get_id()).toBe('0000000011');
			expect(game_set[3].get_white()).toBe('c');
			expect(game_set[3].get_black()).toBe('d');
			expect(game_set[3].get_result()).toBe('black_wins');
			expect(game_set[3].get_time_control_id()).toBe('Blitz');
			expect(game_set[3].get_time_control_name()).toBe('Blitz (5 + 3)');
			expect(game_set[3].get_date()).toBe('2025-01-20..17:06:10:000');

			expect(game_set[4].get_id()).toBe('0000000019');
			expect(game_set[4].get_white()).toBe('c');
			expect(game_set[4].get_black()).toBe('d');
			expect(game_set[4].get_result()).toBe('white_wins');
			expect(game_set[4].get_time_control_id()).toBe('Blitz');
			expect(game_set[4].get_time_control_name()).toBe('Blitz (5 + 3)');
			expect(game_set[4].get_date()).toBe('2025-01-20..17:06:15:000');

			expect(game_set[5].get_id()).toBe('0000000010');
			expect(game_set[5].get_white()).toBe('e');
			expect(game_set[5].get_black()).toBe('f');
			expect(game_set[5].get_result()).toBe('draw');
			expect(game_set[5].get_time_control_id()).toBe('Blitz');
			expect(game_set[5].get_time_control_name()).toBe('Blitz (5 + 0)');
			expect(game_set[5].get_date()).toBe('2025-01-20..17:06:20:000');

			expect(game_set[6].get_id()).toBe('0000000017');
			expect(game_set[6].get_white()).toBe('a');
			expect(game_set[6].get_black()).toBe('f');
			expect(game_set[6].get_result()).toBe('draw');
			expect(game_set[6].get_time_control_id()).toBe('Blitz');
			expect(game_set[6].get_time_control_name()).toBe('Blitz (5 + 0)');
			expect(game_set[6].get_date()).toBe('2025-01-20..17:06:25:000');

			expect(game_set[7].get_id()).toBe('0000000009');
			expect(game_set[7].get_white()).toBe('a');
			expect(game_set[7].get_black()).toBe('f');
			expect(game_set[7].get_result()).toBe('draw');
			expect(game_set[7].get_time_control_id()).toBe('Blitz');
			expect(game_set[7].get_time_control_name()).toBe('Blitz (5 + 0)');
			expect(game_set[7].get_date()).toBe('2025-01-20..17:06:30:000');

			expect(a.get_games('Blitz')?.length).toBe(2);
			expect(b.get_games('Blitz')?.length).toBe(2);
			expect(c.get_games('Blitz')?.length).toBe(2);
			expect(d.get_games('Blitz')?.length).toBe(2);
			expect(e.get_games('Blitz')?.length).toBe(2);
			expect(f.get_games('Blitz')?.length).toBe(2);
			expect(a.get_games('Classical')?.length).toBe(2);
			expect(b.get_games('Classical')?.length).toBe(2);
			expect(c.get_games('Classical')?.length).toBe(2);
			expect(d.get_games('Classical')?.length).toBe(2);
			expect(e.get_games('Classical')?.length).toBe(2);
			expect(f.get_games('Classical')?.length).toBe(2);

			expect(a.get_rating('Blitz').num_won_drawn_lost()).toEqual([6, 2, 2, 2]);
			expect(b.get_rating('Blitz').num_won_drawn_lost()).toEqual([3, 1, 0, 2]);
			expect(c.get_rating('Blitz').num_won_drawn_lost()).toEqual([3, 1, 0, 2]);
			expect(d.get_rating('Blitz').num_won_drawn_lost()).toEqual([3, 2, 0, 1]);
			expect(e.get_rating('Blitz').num_won_drawn_lost()).toEqual([3, 0, 3, 0]);
			expect(f.get_rating('Blitz').num_won_drawn_lost()).toEqual([6, 1, 5, 0]);
			expect(a.get_rating('Classical').num_won_drawn_lost()).toEqual([4, 2, 1, 1]);
			expect(b.get_rating('Classical').num_won_drawn_lost()).toEqual([2, 0, 0, 2]);
			expect(c.get_rating('Classical').num_won_drawn_lost()).toEqual([2, 0, 0, 2]);
			expect(d.get_rating('Classical').num_won_drawn_lost()).toEqual([2, 2, 0, 0]);
			expect(e.get_rating('Classical').num_won_drawn_lost()).toEqual([2, 0, 2, 0]);
			expect(f.get_rating('Classical').num_won_drawn_lost()).toEqual([4, 1, 3, 0]);
		}
	});

	test('Add "Classical" games', () => {
		const blitz_dir = EnvironmentManager.get_instance().get_dir_games_time_control('Classical');
		game_add_new(u('a'), u('f'), 'draw', 'Classical', 'Classical (90 + 30)', '2025-01-20', '17:06:25:000');
		{
			const game_set = game_set_from_json(fs.readFileSync(path.join(blitz_dir, '2025-01-20'), 'utf8'));
			expect(game_set.length).toBe(5);

			expect(game_set[0].get_id()).toBe('0000000016');
			expect(game_set[0].get_white()).toBe('a');
			expect(game_set[0].get_black()).toBe('b');
			expect(game_set[0].get_result()).toBe('white_wins');
			expect(game_set[0].get_time_control_id()).toBe('Classical');
			expect(game_set[0].get_time_control_name()).toBe('Classical (90 + 30)');
			expect(game_set[0].get_date()).toBe('2025-01-20..17:06:00:000');

			expect(game_set[1].get_id()).toBe('0000000015');
			expect(game_set[1].get_white()).toBe('c');
			expect(game_set[1].get_black()).toBe('d');
			expect(game_set[1].get_result()).toBe('black_wins');
			expect(game_set[1].get_time_control_id()).toBe('Classical');
			expect(game_set[1].get_time_control_name()).toBe('Classical (90 + 30)');
			expect(game_set[1].get_date()).toBe('2025-01-20..17:06:10:000');

			expect(game_set[2].get_id()).toBe('0000000014');
			expect(game_set[2].get_white()).toBe('e');
			expect(game_set[2].get_black()).toBe('f');
			expect(game_set[2].get_result()).toBe('draw');
			expect(game_set[2].get_time_control_id()).toBe('Classical');
			expect(game_set[2].get_time_control_name()).toBe('Classical (90 + 30)');
			expect(game_set[2].get_date()).toBe('2025-01-20..17:06:20:000');

			expect(game_set[3].get_id()).toBe('0000000021');
			expect(game_set[3].get_white()).toBe('a');
			expect(game_set[3].get_black()).toBe('f');
			expect(game_set[3].get_result()).toBe('draw');
			expect(game_set[3].get_time_control_id()).toBe('Classical');
			expect(game_set[3].get_time_control_name()).toBe('Classical (90 + 30)');
			expect(game_set[3].get_date()).toBe('2025-01-20..17:06:25:000');

			expect(game_set[4].get_id()).toBe('0000000013');
			expect(game_set[4].get_white()).toBe('a');
			expect(game_set[4].get_black()).toBe('f');
			expect(game_set[4].get_result()).toBe('draw');
			expect(game_set[4].get_time_control_id()).toBe('Classical');
			expect(game_set[4].get_time_control_name()).toBe('Classical (90 + 30)');
			expect(game_set[4].get_date()).toBe('2025-01-20..17:06:30:000');

			expect(a.get_games('Classical')?.length).toBe(2);
			expect(b.get_games('Classical')?.length).toBe(2);
			expect(c.get_games('Classical')?.length).toBe(2);
			expect(d.get_games('Classical')?.length).toBe(2);
			expect(e.get_games('Classical')?.length).toBe(2);
			expect(f.get_games('Classical')?.length).toBe(2);
			expect(a.get_games('Classical')?.length).toBe(2);
			expect(b.get_games('Classical')?.length).toBe(2);
			expect(c.get_games('Classical')?.length).toBe(2);
			expect(d.get_games('Classical')?.length).toBe(2);
			expect(e.get_games('Classical')?.length).toBe(2);
			expect(f.get_games('Classical')?.length).toBe(2);

			expect(a.get_rating('Blitz').num_won_drawn_lost()).toEqual([6, 2, 2, 2]);
			expect(b.get_rating('Blitz').num_won_drawn_lost()).toEqual([3, 1, 0, 2]);
			expect(c.get_rating('Blitz').num_won_drawn_lost()).toEqual([3, 1, 0, 2]);
			expect(d.get_rating('Blitz').num_won_drawn_lost()).toEqual([3, 2, 0, 1]);
			expect(e.get_rating('Blitz').num_won_drawn_lost()).toEqual([3, 0, 3, 0]);
			expect(f.get_rating('Blitz').num_won_drawn_lost()).toEqual([6, 1, 5, 0]);
			expect(a.get_rating('Classical').num_won_drawn_lost()).toEqual([5, 2, 2, 1]);
			expect(b.get_rating('Classical').num_won_drawn_lost()).toEqual([2, 0, 0, 2]);
			expect(c.get_rating('Classical').num_won_drawn_lost()).toEqual([2, 0, 0, 2]);
			expect(d.get_rating('Classical').num_won_drawn_lost()).toEqual([2, 2, 0, 0]);
			expect(e.get_rating('Classical').num_won_drawn_lost()).toEqual([2, 0, 2, 0]);
			expect(f.get_rating('Classical').num_won_drawn_lost()).toEqual([5, 1, 4, 0]);
		}

		game_add_new(u('e'), u('f'), 'draw', 'Classical', 'Classical (90 + 30)', '2025-01-20', '17:06:05:000');
		{
			const game_set = game_set_from_json(fs.readFileSync(path.join(blitz_dir, '2025-01-20'), 'utf8'));
			expect(game_set.length).toBe(6);

			expect(game_set[0].get_id()).toBe('0000000016');
			expect(game_set[0].get_white()).toBe('a');
			expect(game_set[0].get_black()).toBe('b');
			expect(game_set[0].get_result()).toBe('white_wins');
			expect(game_set[0].get_time_control_id()).toBe('Classical');
			expect(game_set[0].get_time_control_name()).toBe('Classical (90 + 30)');
			expect(game_set[0].get_date()).toBe('2025-01-20..17:06:00:000');

			expect(game_set[1].get_id()).toBe('0000000022');
			expect(game_set[1].get_white()).toBe('e');
			expect(game_set[1].get_black()).toBe('f');
			expect(game_set[1].get_result()).toBe('draw');
			expect(game_set[1].get_time_control_id()).toBe('Classical');
			expect(game_set[1].get_time_control_name()).toBe('Classical (90 + 30)');
			expect(game_set[1].get_date()).toBe('2025-01-20..17:06:05:000');

			expect(game_set[2].get_id()).toBe('0000000015');
			expect(game_set[2].get_white()).toBe('c');
			expect(game_set[2].get_black()).toBe('d');
			expect(game_set[2].get_result()).toBe('black_wins');
			expect(game_set[2].get_time_control_id()).toBe('Classical');
			expect(game_set[2].get_time_control_name()).toBe('Classical (90 + 30)');
			expect(game_set[2].get_date()).toBe('2025-01-20..17:06:10:000');

			expect(game_set[3].get_id()).toBe('0000000014');
			expect(game_set[3].get_white()).toBe('e');
			expect(game_set[3].get_black()).toBe('f');
			expect(game_set[3].get_result()).toBe('draw');
			expect(game_set[3].get_time_control_id()).toBe('Classical');
			expect(game_set[3].get_time_control_name()).toBe('Classical (90 + 30)');
			expect(game_set[3].get_date()).toBe('2025-01-20..17:06:20:000');

			expect(game_set[4].get_id()).toBe('0000000021');
			expect(game_set[4].get_white()).toBe('a');
			expect(game_set[4].get_black()).toBe('f');
			expect(game_set[4].get_result()).toBe('draw');
			expect(game_set[4].get_time_control_id()).toBe('Classical');
			expect(game_set[4].get_time_control_name()).toBe('Classical (90 + 30)');
			expect(game_set[4].get_date()).toBe('2025-01-20..17:06:25:000');

			expect(game_set[5].get_id()).toBe('0000000013');
			expect(game_set[5].get_white()).toBe('a');
			expect(game_set[5].get_black()).toBe('f');
			expect(game_set[5].get_result()).toBe('draw');
			expect(game_set[5].get_time_control_id()).toBe('Classical');
			expect(game_set[5].get_time_control_name()).toBe('Classical (90 + 30)');
			expect(game_set[5].get_date()).toBe('2025-01-20..17:06:30:000');

			expect(a.get_games('Classical')?.length).toBe(2);
			expect(b.get_games('Classical')?.length).toBe(2);
			expect(c.get_games('Classical')?.length).toBe(2);
			expect(d.get_games('Classical')?.length).toBe(2);
			expect(e.get_games('Classical')?.length).toBe(2);
			expect(f.get_games('Classical')?.length).toBe(2);
			expect(a.get_games('Classical')?.length).toBe(2);
			expect(b.get_games('Classical')?.length).toBe(2);
			expect(c.get_games('Classical')?.length).toBe(2);
			expect(d.get_games('Classical')?.length).toBe(2);
			expect(e.get_games('Classical')?.length).toBe(2);
			expect(f.get_games('Classical')?.length).toBe(2);

			expect(a.get_rating('Blitz').num_won_drawn_lost()).toEqual([6, 2, 2, 2]);
			expect(b.get_rating('Blitz').num_won_drawn_lost()).toEqual([3, 1, 0, 2]);
			expect(c.get_rating('Blitz').num_won_drawn_lost()).toEqual([3, 1, 0, 2]);
			expect(d.get_rating('Blitz').num_won_drawn_lost()).toEqual([3, 2, 0, 1]);
			expect(e.get_rating('Blitz').num_won_drawn_lost()).toEqual([3, 0, 3, 0]);
			expect(f.get_rating('Blitz').num_won_drawn_lost()).toEqual([6, 1, 5, 0]);
			expect(a.get_rating('Classical').num_won_drawn_lost()).toEqual([5, 2, 2, 1]);
			expect(b.get_rating('Classical').num_won_drawn_lost()).toEqual([2, 0, 0, 2]);
			expect(c.get_rating('Classical').num_won_drawn_lost()).toEqual([2, 0, 0, 2]);
			expect(d.get_rating('Classical').num_won_drawn_lost()).toEqual([2, 2, 0, 0]);
			expect(e.get_rating('Classical').num_won_drawn_lost()).toEqual([3, 0, 3, 0]);
			expect(f.get_rating('Classical').num_won_drawn_lost()).toEqual([6, 1, 5, 0]);
		}

		game_add_new(u('c'), u('d'), 'white_wins', 'Classical', 'Classical (90 + 30)', '2025-01-20', '17:06:15:000');
		{
			const game_set = game_set_from_json(fs.readFileSync(path.join(blitz_dir, '2025-01-20'), 'utf8'));
			expect(game_set.length).toBe(7);

			expect(game_set[0].get_id()).toBe('0000000016');
			expect(game_set[0].get_white()).toBe('a');
			expect(game_set[0].get_black()).toBe('b');
			expect(game_set[0].get_result()).toBe('white_wins');
			expect(game_set[0].get_time_control_id()).toBe('Classical');
			expect(game_set[0].get_time_control_name()).toBe('Classical (90 + 30)');
			expect(game_set[0].get_date()).toBe('2025-01-20..17:06:00:000');

			expect(game_set[1].get_id()).toBe('0000000022');
			expect(game_set[1].get_white()).toBe('e');
			expect(game_set[1].get_black()).toBe('f');
			expect(game_set[1].get_result()).toBe('draw');
			expect(game_set[1].get_time_control_id()).toBe('Classical');
			expect(game_set[1].get_time_control_name()).toBe('Classical (90 + 30)');
			expect(game_set[1].get_date()).toBe('2025-01-20..17:06:05:000');

			expect(game_set[2].get_id()).toBe('0000000015');
			expect(game_set[2].get_white()).toBe('c');
			expect(game_set[2].get_black()).toBe('d');
			expect(game_set[2].get_result()).toBe('black_wins');
			expect(game_set[2].get_time_control_id()).toBe('Classical');
			expect(game_set[2].get_time_control_name()).toBe('Classical (90 + 30)');
			expect(game_set[2].get_date()).toBe('2025-01-20..17:06:10:000');

			expect(game_set[3].get_id()).toBe('0000000023');
			expect(game_set[3].get_white()).toBe('c');
			expect(game_set[3].get_black()).toBe('d');
			expect(game_set[3].get_result()).toBe('white_wins');
			expect(game_set[3].get_time_control_id()).toBe('Classical');
			expect(game_set[3].get_time_control_name()).toBe('Classical (90 + 30)');
			expect(game_set[3].get_date()).toBe('2025-01-20..17:06:15:000');

			expect(game_set[4].get_id()).toBe('0000000014');
			expect(game_set[4].get_white()).toBe('e');
			expect(game_set[4].get_black()).toBe('f');
			expect(game_set[4].get_result()).toBe('draw');
			expect(game_set[4].get_time_control_id()).toBe('Classical');
			expect(game_set[4].get_time_control_name()).toBe('Classical (90 + 30)');
			expect(game_set[4].get_date()).toBe('2025-01-20..17:06:20:000');

			expect(game_set[5].get_id()).toBe('0000000021');
			expect(game_set[5].get_white()).toBe('a');
			expect(game_set[5].get_black()).toBe('f');
			expect(game_set[5].get_result()).toBe('draw');
			expect(game_set[5].get_time_control_id()).toBe('Classical');
			expect(game_set[5].get_time_control_name()).toBe('Classical (90 + 30)');
			expect(game_set[5].get_date()).toBe('2025-01-20..17:06:25:000');

			expect(game_set[6].get_id()).toBe('0000000013');
			expect(game_set[6].get_white()).toBe('a');
			expect(game_set[6].get_black()).toBe('f');
			expect(game_set[6].get_result()).toBe('draw');
			expect(game_set[6].get_time_control_id()).toBe('Classical');
			expect(game_set[6].get_time_control_name()).toBe('Classical (90 + 30)');
			expect(game_set[6].get_date()).toBe('2025-01-20..17:06:30:000');

			expect(a.get_games('Classical')?.length).toBe(2);
			expect(b.get_games('Classical')?.length).toBe(2);
			expect(c.get_games('Classical')?.length).toBe(2);
			expect(d.get_games('Classical')?.length).toBe(2);
			expect(e.get_games('Classical')?.length).toBe(2);
			expect(f.get_games('Classical')?.length).toBe(2);
			expect(a.get_games('Classical')?.length).toBe(2);
			expect(b.get_games('Classical')?.length).toBe(2);
			expect(c.get_games('Classical')?.length).toBe(2);
			expect(d.get_games('Classical')?.length).toBe(2);
			expect(e.get_games('Classical')?.length).toBe(2);
			expect(f.get_games('Classical')?.length).toBe(2);

			expect(a.get_rating('Blitz').num_won_drawn_lost()).toEqual([6, 2, 2, 2]);
			expect(b.get_rating('Blitz').num_won_drawn_lost()).toEqual([3, 1, 0, 2]);
			expect(c.get_rating('Blitz').num_won_drawn_lost()).toEqual([3, 1, 0, 2]);
			expect(d.get_rating('Blitz').num_won_drawn_lost()).toEqual([3, 2, 0, 1]);
			expect(e.get_rating('Blitz').num_won_drawn_lost()).toEqual([3, 0, 3, 0]);
			expect(f.get_rating('Blitz').num_won_drawn_lost()).toEqual([6, 1, 5, 0]);
			expect(a.get_rating('Classical').num_won_drawn_lost()).toEqual([5, 2, 2, 1]);
			expect(b.get_rating('Classical').num_won_drawn_lost()).toEqual([2, 0, 0, 2]);
			expect(c.get_rating('Classical').num_won_drawn_lost()).toEqual([3, 1, 0, 2]);
			expect(d.get_rating('Classical').num_won_drawn_lost()).toEqual([3, 2, 0, 1]);
			expect(e.get_rating('Classical').num_won_drawn_lost()).toEqual([3, 0, 3, 0]);
			expect(f.get_rating('Classical').num_won_drawn_lost()).toEqual([6, 1, 5, 0]);
		}

		game_add_new(u('a'), u('b'), 'black_wins', 'Classical', 'Classical (90 + 30)', '2025-01-20', '17:05:55:000');
		{
			const game_set = game_set_from_json(fs.readFileSync(path.join(blitz_dir, '2025-01-20'), 'utf8'));
			expect(game_set.length).toBe(8);

			expect(game_set[0].get_id()).toBe('0000000024');
			expect(game_set[0].get_white()).toBe('a');
			expect(game_set[0].get_black()).toBe('b');
			expect(game_set[0].get_result()).toBe('black_wins');
			expect(game_set[0].get_time_control_id()).toBe('Classical');
			expect(game_set[0].get_time_control_name()).toBe('Classical (90 + 30)');
			expect(game_set[0].get_date()).toBe('2025-01-20..17:05:55:000');

			expect(game_set[1].get_id()).toBe('0000000016');
			expect(game_set[1].get_white()).toBe('a');
			expect(game_set[1].get_black()).toBe('b');
			expect(game_set[1].get_result()).toBe('white_wins');
			expect(game_set[1].get_time_control_id()).toBe('Classical');
			expect(game_set[1].get_time_control_name()).toBe('Classical (90 + 30)');
			expect(game_set[1].get_date()).toBe('2025-01-20..17:06:00:000');

			expect(game_set[2].get_id()).toBe('0000000022');
			expect(game_set[2].get_white()).toBe('e');
			expect(game_set[2].get_black()).toBe('f');
			expect(game_set[2].get_result()).toBe('draw');
			expect(game_set[2].get_time_control_id()).toBe('Classical');
			expect(game_set[2].get_time_control_name()).toBe('Classical (90 + 30)');
			expect(game_set[2].get_date()).toBe('2025-01-20..17:06:05:000');

			expect(game_set[3].get_id()).toBe('0000000015');
			expect(game_set[3].get_white()).toBe('c');
			expect(game_set[3].get_black()).toBe('d');
			expect(game_set[3].get_result()).toBe('black_wins');
			expect(game_set[3].get_time_control_id()).toBe('Classical');
			expect(game_set[3].get_time_control_name()).toBe('Classical (90 + 30)');
			expect(game_set[3].get_date()).toBe('2025-01-20..17:06:10:000');

			expect(game_set[4].get_id()).toBe('0000000023');
			expect(game_set[4].get_white()).toBe('c');
			expect(game_set[4].get_black()).toBe('d');
			expect(game_set[4].get_result()).toBe('white_wins');
			expect(game_set[4].get_time_control_id()).toBe('Classical');
			expect(game_set[4].get_time_control_name()).toBe('Classical (90 + 30)');
			expect(game_set[4].get_date()).toBe('2025-01-20..17:06:15:000');

			expect(game_set[5].get_id()).toBe('0000000014');
			expect(game_set[5].get_white()).toBe('e');
			expect(game_set[5].get_black()).toBe('f');
			expect(game_set[5].get_result()).toBe('draw');
			expect(game_set[5].get_time_control_id()).toBe('Classical');
			expect(game_set[5].get_time_control_name()).toBe('Classical (90 + 30)');
			expect(game_set[5].get_date()).toBe('2025-01-20..17:06:20:000');

			expect(game_set[6].get_id()).toBe('0000000021');
			expect(game_set[6].get_white()).toBe('a');
			expect(game_set[6].get_black()).toBe('f');
			expect(game_set[6].get_result()).toBe('draw');
			expect(game_set[6].get_time_control_id()).toBe('Classical');
			expect(game_set[6].get_time_control_name()).toBe('Classical (90 + 30)');
			expect(game_set[6].get_date()).toBe('2025-01-20..17:06:25:000');

			expect(game_set[7].get_id()).toBe('0000000013');
			expect(game_set[7].get_white()).toBe('a');
			expect(game_set[7].get_black()).toBe('f');
			expect(game_set[7].get_result()).toBe('draw');
			expect(game_set[7].get_time_control_id()).toBe('Classical');
			expect(game_set[7].get_time_control_name()).toBe('Classical (90 + 30)');
			expect(game_set[7].get_date()).toBe('2025-01-20..17:06:30:000');

			expect(a.get_games('Classical')?.length).toBe(2);
			expect(b.get_games('Classical')?.length).toBe(2);
			expect(c.get_games('Classical')?.length).toBe(2);
			expect(d.get_games('Classical')?.length).toBe(2);
			expect(e.get_games('Classical')?.length).toBe(2);
			expect(f.get_games('Classical')?.length).toBe(2);
			expect(a.get_games('Classical')?.length).toBe(2);
			expect(b.get_games('Classical')?.length).toBe(2);
			expect(c.get_games('Classical')?.length).toBe(2);
			expect(d.get_games('Classical')?.length).toBe(2);
			expect(e.get_games('Classical')?.length).toBe(2);
			expect(f.get_games('Classical')?.length).toBe(2);

			expect(a.get_rating('Blitz').num_won_drawn_lost()).toEqual([6, 2, 2, 2]);
			expect(b.get_rating('Blitz').num_won_drawn_lost()).toEqual([3, 1, 0, 2]);
			expect(c.get_rating('Blitz').num_won_drawn_lost()).toEqual([3, 1, 0, 2]);
			expect(d.get_rating('Blitz').num_won_drawn_lost()).toEqual([3, 2, 0, 1]);
			expect(e.get_rating('Blitz').num_won_drawn_lost()).toEqual([3, 0, 3, 0]);
			expect(f.get_rating('Blitz').num_won_drawn_lost()).toEqual([6, 1, 5, 0]);
			expect(a.get_rating('Classical').num_won_drawn_lost()).toEqual([6, 2, 2, 2]);
			expect(b.get_rating('Classical').num_won_drawn_lost()).toEqual([3, 1, 0, 2]);
			expect(c.get_rating('Classical').num_won_drawn_lost()).toEqual([3, 1, 0, 2]);
			expect(d.get_rating('Classical').num_won_drawn_lost()).toEqual([3, 2, 0, 1]);
			expect(e.get_rating('Classical').num_won_drawn_lost()).toEqual([3, 0, 3, 0]);
			expect(f.get_rating('Classical').num_won_drawn_lost()).toEqual([6, 1, 5, 0]);
		}
	});
});

describe('Edition of game results', () => {
	test('Edit some "Blitz" games', () => {
		game_edit_result('0000000001', 'black_wins');

		expect(a.get_rating('Blitz').num_won_drawn_lost()).toEqual([6, 1, 2, 3]);
		expect(b.get_rating('Blitz').num_won_drawn_lost()).toEqual([3, 2, 0, 1]);
		expect(c.get_rating('Blitz').num_won_drawn_lost()).toEqual([3, 1, 0, 2]);
		expect(d.get_rating('Blitz').num_won_drawn_lost()).toEqual([3, 2, 0, 1]);
		expect(e.get_rating('Blitz').num_won_drawn_lost()).toEqual([3, 0, 3, 0]);
		expect(f.get_rating('Blitz').num_won_drawn_lost()).toEqual([6, 1, 5, 0]);
		expect(a.get_rating('Classical').num_won_drawn_lost()).toEqual([6, 2, 2, 2]);
		expect(b.get_rating('Classical').num_won_drawn_lost()).toEqual([3, 1, 0, 2]);
		expect(c.get_rating('Classical').num_won_drawn_lost()).toEqual([3, 1, 0, 2]);
		expect(d.get_rating('Classical').num_won_drawn_lost()).toEqual([3, 2, 0, 1]);
		expect(e.get_rating('Classical').num_won_drawn_lost()).toEqual([3, 0, 3, 0]);
		expect(f.get_rating('Classical').num_won_drawn_lost()).toEqual([6, 1, 5, 0]);

		game_edit_result('0000000001', 'draw');

		expect(a.get_rating('Blitz').num_won_drawn_lost()).toEqual([6, 1, 3, 2]);
		expect(b.get_rating('Blitz').num_won_drawn_lost()).toEqual([3, 1, 1, 1]);
		expect(c.get_rating('Blitz').num_won_drawn_lost()).toEqual([3, 1, 0, 2]);
		expect(d.get_rating('Blitz').num_won_drawn_lost()).toEqual([3, 2, 0, 1]);
		expect(e.get_rating('Blitz').num_won_drawn_lost()).toEqual([3, 0, 3, 0]);
		expect(f.get_rating('Blitz').num_won_drawn_lost()).toEqual([6, 1, 5, 0]);
		expect(a.get_rating('Classical').num_won_drawn_lost()).toEqual([6, 2, 2, 2]);
		expect(b.get_rating('Classical').num_won_drawn_lost()).toEqual([3, 1, 0, 2]);
		expect(c.get_rating('Classical').num_won_drawn_lost()).toEqual([3, 1, 0, 2]);
		expect(d.get_rating('Classical').num_won_drawn_lost()).toEqual([3, 2, 0, 1]);
		expect(e.get_rating('Classical').num_won_drawn_lost()).toEqual([3, 0, 3, 0]);
		expect(f.get_rating('Classical').num_won_drawn_lost()).toEqual([6, 1, 5, 0]);

		game_edit_result('0000000001', 'draw');

		expect(a.get_rating('Blitz').num_won_drawn_lost()).toEqual([6, 1, 3, 2]);
		expect(b.get_rating('Blitz').num_won_drawn_lost()).toEqual([3, 1, 1, 1]);
		expect(c.get_rating('Blitz').num_won_drawn_lost()).toEqual([3, 1, 0, 2]);
		expect(d.get_rating('Blitz').num_won_drawn_lost()).toEqual([3, 2, 0, 1]);
		expect(e.get_rating('Blitz').num_won_drawn_lost()).toEqual([3, 0, 3, 0]);
		expect(f.get_rating('Blitz').num_won_drawn_lost()).toEqual([6, 1, 5, 0]);
		expect(a.get_rating('Classical').num_won_drawn_lost()).toEqual([6, 2, 2, 2]);
		expect(b.get_rating('Classical').num_won_drawn_lost()).toEqual([3, 1, 0, 2]);
		expect(c.get_rating('Classical').num_won_drawn_lost()).toEqual([3, 1, 0, 2]);
		expect(d.get_rating('Classical').num_won_drawn_lost()).toEqual([3, 2, 0, 1]);
		expect(e.get_rating('Classical').num_won_drawn_lost()).toEqual([3, 0, 3, 0]);
		expect(f.get_rating('Classical').num_won_drawn_lost()).toEqual([6, 1, 5, 0]);

		game_edit_result('0000000002', 'draw');

		expect(a.get_rating('Blitz').num_won_drawn_lost()).toEqual([6, 1, 3, 2]);
		expect(b.get_rating('Blitz').num_won_drawn_lost()).toEqual([3, 1, 1, 1]);
		expect(c.get_rating('Blitz').num_won_drawn_lost()).toEqual([3, 1, 1, 1]);
		expect(d.get_rating('Blitz').num_won_drawn_lost()).toEqual([3, 1, 1, 1]);
		expect(e.get_rating('Blitz').num_won_drawn_lost()).toEqual([3, 0, 3, 0]);
		expect(f.get_rating('Blitz').num_won_drawn_lost()).toEqual([6, 1, 5, 0]);
		expect(a.get_rating('Classical').num_won_drawn_lost()).toEqual([6, 2, 2, 2]);
		expect(b.get_rating('Classical').num_won_drawn_lost()).toEqual([3, 1, 0, 2]);
		expect(c.get_rating('Classical').num_won_drawn_lost()).toEqual([3, 1, 0, 2]);
		expect(d.get_rating('Classical').num_won_drawn_lost()).toEqual([3, 2, 0, 1]);
		expect(e.get_rating('Classical').num_won_drawn_lost()).toEqual([3, 0, 3, 0]);
		expect(f.get_rating('Classical').num_won_drawn_lost()).toEqual([6, 1, 5, 0]);
	});

	test('Edit some "Classical" games', () => {
		game_edit_result('0000000013', 'black_wins');

		expect(a.get_rating('Blitz').num_won_drawn_lost()).toEqual([6, 1, 3, 2]);
		expect(b.get_rating('Blitz').num_won_drawn_lost()).toEqual([3, 1, 1, 1]);
		expect(c.get_rating('Blitz').num_won_drawn_lost()).toEqual([3, 1, 1, 1]);
		expect(d.get_rating('Blitz').num_won_drawn_lost()).toEqual([3, 1, 1, 1]);
		expect(e.get_rating('Blitz').num_won_drawn_lost()).toEqual([3, 0, 3, 0]);
		expect(f.get_rating('Blitz').num_won_drawn_lost()).toEqual([6, 1, 5, 0]);
		expect(a.get_rating('Classical').num_won_drawn_lost()).toEqual([6, 2, 1, 3]);
		expect(b.get_rating('Classical').num_won_drawn_lost()).toEqual([3, 1, 0, 2]);
		expect(c.get_rating('Classical').num_won_drawn_lost()).toEqual([3, 1, 0, 2]);
		expect(d.get_rating('Classical').num_won_drawn_lost()).toEqual([3, 2, 0, 1]);
		expect(e.get_rating('Classical').num_won_drawn_lost()).toEqual([3, 0, 3, 0]);
		expect(f.get_rating('Classical').num_won_drawn_lost()).toEqual([6, 2, 4, 0]);

		game_edit_result('0000000013', 'white_wins');

		expect(a.get_rating('Blitz').num_won_drawn_lost()).toEqual([6, 1, 3, 2]);
		expect(b.get_rating('Blitz').num_won_drawn_lost()).toEqual([3, 1, 1, 1]);
		expect(c.get_rating('Blitz').num_won_drawn_lost()).toEqual([3, 1, 1, 1]);
		expect(d.get_rating('Blitz').num_won_drawn_lost()).toEqual([3, 1, 1, 1]);
		expect(e.get_rating('Blitz').num_won_drawn_lost()).toEqual([3, 0, 3, 0]);
		expect(f.get_rating('Blitz').num_won_drawn_lost()).toEqual([6, 1, 5, 0]);
		expect(a.get_rating('Classical').num_won_drawn_lost()).toEqual([6, 3, 1, 2]);
		expect(b.get_rating('Classical').num_won_drawn_lost()).toEqual([3, 1, 0, 2]);
		expect(c.get_rating('Classical').num_won_drawn_lost()).toEqual([3, 1, 0, 2]);
		expect(d.get_rating('Classical').num_won_drawn_lost()).toEqual([3, 2, 0, 1]);
		expect(e.get_rating('Classical').num_won_drawn_lost()).toEqual([3, 0, 3, 0]);
		expect(f.get_rating('Classical').num_won_drawn_lost()).toEqual([6, 1, 4, 1]);

		game_edit_result('0000000013', 'white_wins');

		expect(a.get_rating('Blitz').num_won_drawn_lost()).toEqual([6, 1, 3, 2]);
		expect(b.get_rating('Blitz').num_won_drawn_lost()).toEqual([3, 1, 1, 1]);
		expect(c.get_rating('Blitz').num_won_drawn_lost()).toEqual([3, 1, 1, 1]);
		expect(d.get_rating('Blitz').num_won_drawn_lost()).toEqual([3, 1, 1, 1]);
		expect(e.get_rating('Blitz').num_won_drawn_lost()).toEqual([3, 0, 3, 0]);
		expect(f.get_rating('Blitz').num_won_drawn_lost()).toEqual([6, 1, 5, 0]);
		expect(a.get_rating('Classical').num_won_drawn_lost()).toEqual([6, 3, 1, 2]);
		expect(b.get_rating('Classical').num_won_drawn_lost()).toEqual([3, 1, 0, 2]);
		expect(c.get_rating('Classical').num_won_drawn_lost()).toEqual([3, 1, 0, 2]);
		expect(d.get_rating('Classical').num_won_drawn_lost()).toEqual([3, 2, 0, 1]);
		expect(e.get_rating('Classical').num_won_drawn_lost()).toEqual([3, 0, 3, 0]);
		expect(f.get_rating('Classical').num_won_drawn_lost()).toEqual([6, 1, 4, 1]);

		game_edit_result('0000000021', 'black_wins');

		expect(a.get_rating('Blitz').num_won_drawn_lost()).toEqual([6, 1, 3, 2]);
		expect(b.get_rating('Blitz').num_won_drawn_lost()).toEqual([3, 1, 1, 1]);
		expect(c.get_rating('Blitz').num_won_drawn_lost()).toEqual([3, 1, 1, 1]);
		expect(d.get_rating('Blitz').num_won_drawn_lost()).toEqual([3, 1, 1, 1]);
		expect(e.get_rating('Blitz').num_won_drawn_lost()).toEqual([3, 0, 3, 0]);
		expect(f.get_rating('Blitz').num_won_drawn_lost()).toEqual([6, 1, 5, 0]);
		expect(a.get_rating('Classical').num_won_drawn_lost()).toEqual([6, 3, 0, 3]);
		expect(b.get_rating('Classical').num_won_drawn_lost()).toEqual([3, 1, 0, 2]);
		expect(c.get_rating('Classical').num_won_drawn_lost()).toEqual([3, 1, 0, 2]);
		expect(d.get_rating('Classical').num_won_drawn_lost()).toEqual([3, 2, 0, 1]);
		expect(e.get_rating('Classical').num_won_drawn_lost()).toEqual([3, 0, 3, 0]);
		expect(f.get_rating('Classical').num_won_drawn_lost()).toEqual([6, 2, 3, 1]);
	});
});

describe('Look for a game', () => {
	test('"Blitz" games', () => {
		const game_dir = EnvironmentManager.get_instance().get_dir_games_time_control('Blitz');

		{
			const [game_record_set, game_file_path, game_set, game_record_set_idx, game_set_idx] = game_find_by_id(
				'0000000001'
			) as [DateStringShort[], string, Game[], number, number];

			expect(game_record_set).toEqual(fs.readdirSync(game_dir));
			expect(game_record_set[game_record_set_idx]).toEqual('2025-01-19');

			expect(game_file_path).toEqual(path.join(game_dir, '2025-01-19'));

			const game = game_set[game_set_idx];
			expect(game.get_id()).toEqual('0000000001');
			expect(game.get_white()).toEqual('a');
			expect(game.get_black()).toEqual('b');
			expect(game.get_result()).toEqual('draw');
			expect(game.get_time_control_id()).toEqual('Blitz');
			expect(game.get_time_control_name()).toEqual('Blitz (5 + 3)');
		}

		{
			const [game_record_set, game_file_path, game_set, game_record_set_idx, game_set_idx] = game_find_by_id(
				'0000000002'
			) as [DateStringShort[], string, Game[], number, number];

			expect(game_record_set).toEqual(fs.readdirSync(game_dir));
			expect(game_record_set[game_record_set_idx]).toEqual('2025-01-19');

			expect(game_file_path).toEqual(path.join(game_dir, '2025-01-19'));

			const game = game_set[game_set_idx];
			expect(game.get_id()).toEqual('0000000002');
			expect(game.get_white()).toEqual('c');
			expect(game.get_black()).toEqual('d');
			expect(game.get_result()).toEqual('draw');
			expect(game.get_time_control_id()).toEqual('Blitz');
			expect(game.get_time_control_name()).toEqual('Blitz (5 + 3)');
		}

		{
			const [game_record_set, game_file_path, game_set, game_record_set_idx, game_set_idx] = game_find_by_id(
				'0000000020'
			) as [DateStringShort[], string, Game[], number, number];

			expect(game_record_set).toEqual(fs.readdirSync(game_dir));
			expect(game_record_set[game_record_set_idx]).toEqual('2025-01-20');

			expect(game_file_path).toEqual(path.join(game_dir, '2025-01-20'));

			const game = game_set[game_set_idx];
			expect(game.get_id()).toEqual('0000000020');
			expect(game.get_white()).toEqual('a');
			expect(game.get_black()).toEqual('b');
			expect(game.get_result()).toEqual('black_wins');
			expect(game.get_time_control_id()).toEqual('Blitz');
			expect(game.get_time_control_name()).toEqual('Blitz (5 + 3)');
		}
	});

	test('"Classical" games', () => {
		const game_dir = EnvironmentManager.get_instance().get_dir_games_time_control('Classical');

		{
			const [game_record_set, game_file_path, game_set, game_record_set_idx, game_set_idx] = game_find_by_id(
				'0000000015'
			) as [DateStringShort[], string, Game[], number, number];

			expect(game_record_set).toEqual(fs.readdirSync(game_dir));
			expect(game_record_set[game_record_set_idx]).toEqual('2025-01-20');

			expect(game_file_path).toEqual(path.join(game_dir, '2025-01-20'));

			const game = game_set[game_set_idx];
			expect(game.get_id()).toEqual('0000000015');
			expect(game.get_white()).toEqual('c');
			expect(game.get_black()).toEqual('d');
			expect(game.get_result()).toEqual('black_wins');
			expect(game.get_time_control_id()).toEqual('Classical');
			expect(game.get_time_control_name()).toEqual('Classical (90 + 30)');
		}

		{
			const [game_record_set, game_file_path, game_set, game_record_set_idx, game_set_idx] = game_find_by_id(
				'0000000021'
			) as [DateStringShort[], string, Game[], number, number];

			expect(game_record_set).toEqual(fs.readdirSync(game_dir));
			expect(game_record_set[game_record_set_idx]).toEqual('2025-01-20');

			expect(game_file_path).toEqual(path.join(game_dir, '2025-01-20'));

			const game = game_set[game_set_idx];
			expect(game.get_id()).toEqual('0000000021');
			expect(game.get_white()).toEqual('a');
			expect(game.get_black()).toEqual('f');
			expect(game.get_result()).toEqual('black_wins');
			expect(game.get_time_control_id()).toEqual('Classical');
			expect(game.get_time_control_name()).toEqual('Classical (90 + 30)');
		}

		{
			const [game_record_set, game_file_path, game_set, game_record_set_idx, game_set_idx] = game_find_by_id(
				'0000000008'
			) as [DateStringShort[], string, Game[], number, number];

			expect(game_record_set).toEqual(fs.readdirSync(game_dir));
			expect(game_record_set[game_record_set_idx]).toEqual('2025-01-19');

			expect(game_file_path).toEqual(path.join(game_dir, '2025-01-19'));

			const game = game_set[game_set_idx];
			expect(game.get_id()).toEqual('0000000008');
			expect(game.get_white()).toEqual('a');
			expect(game.get_black()).toEqual('f');
			expect(game.get_result()).toEqual('black_wins');
			expect(game.get_time_control_id()).toEqual('Classical');
			expect(game.get_time_control_name()).toEqual('Classical (90 + 30)');
		}
	});
});
