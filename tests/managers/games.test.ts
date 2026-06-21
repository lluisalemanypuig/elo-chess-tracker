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

import fs from 'fs';
import path from 'path';

import { game_add_new, game_edit_result, game_find_by_id, recalculate_all_ratings } from '@server/managers/games';
import { server_init_from_data } from '@server/managers/initialization';
import { user_add_new } from '@server/managers/users';
import { ADMIN } from '@common/models/user_role';
import { run_command } from '@tests/exec_utils';
import { EnvironmentManager } from '@server/managers/environment_manager';
import { Game } from '@common/models/game';
import { User } from '@common/models/user';
import { UsersManager } from '@server/managers/users_manager';
import { game_array_from_string } from '@common/io/game';
import { GamesIterator } from '@server/managers/games_iterator';
import { long_date_to_short_date } from '@server/utils/time';
import { clear_server } from '@server/managers/clear';
import { GraphsManager } from '@server/managers/graphs_manager';
import { Graph } from '@common/models/graph/graph';
import { EdgeMetadata } from '@common/models/graph/edge_metadata';
import { graph_from_string } from '@common/io/graph/graph';
import { recalculate_all_graphs } from '@server/managers/graphs';
import { Configuration } from '@common/models/configuration/configuration';
import { isDefined } from '@common/utils/is_defined';

const configuration: Configuration = {
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

		game_add_new('sample', u('a'), u('b'), 'white_wins', 'Blitz', 'Blitz (5 + 3)', '2025-01-19', '17:06:00:000');
		{
			const game_array = game_array_from_string(fs.readFileSync(path.join(blitz_dir, '2025-01-19'), 'utf8'));
			expect(game_array).not.toBeNull();
			if (!isDefined(game_array)) {
				return;
			}
			expect(game_array.length).toBe(1);

			expect(game_array[0].id).toBe('0000000001');
			expect(game_array[0].white).toBe('a');
			expect(game_array[0].black).toBe('b');
			expect(game_array[0].result).toBe('white_wins');
			expect(game_array[0].time_control_id).toBe('Blitz');
			expect(game_array[0].time_control_name).toBe('Blitz (5 + 3)');
			expect(game_array[0].when).toBe('2025-01-19..17:06:00:000');

			expect(a.get_games('Blitz').length).toBe(1);
			expect(b.get_games('Blitz').length).toBe(1);
			expect(c.get_games('Blitz').length).toBe(0);
			expect(d.get_games('Blitz').length).toBe(0);
			expect(e.get_games('Blitz').length).toBe(0);
			expect(f.get_games('Blitz').length).toBe(0);
			expect(a.get_games('Classical').length).toBe(0);
			expect(b.get_games('Classical').length).toBe(0);
			expect(c.get_games('Classical').length).toBe(0);
			expect(d.get_games('Classical').length).toBe(0);
			expect(e.get_games('Classical').length).toBe(0);
			expect(f.get_games('Classical').length).toBe(0);

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

		game_add_new('sample', u('c'), u('d'), 'black_wins', 'Blitz', 'Blitz (5 + 3)', '2025-01-19', '17:06:10:000');
		{
			const game_array = game_array_from_string(fs.readFileSync(path.join(blitz_dir, '2025-01-19'), 'utf8'));
			expect(game_array).not.toBeNull();
			if (!isDefined(game_array)) {
				return;
			}
			expect(game_array.length).toBe(2);

			expect(game_array[0].id).toBe('0000000001');
			expect(game_array[0].white).toBe('a');
			expect(game_array[0].black).toBe('b');
			expect(game_array[0].result).toBe('white_wins');
			expect(game_array[0].time_control_id).toBe('Blitz');
			expect(game_array[0].time_control_name).toBe('Blitz (5 + 3)');
			expect(game_array[0].when).toBe('2025-01-19..17:06:00:000');

			expect(game_array[1].id).toBe('0000000002');
			expect(game_array[1].white).toBe('c');
			expect(game_array[1].black).toBe('d');
			expect(game_array[1].result).toBe('black_wins');
			expect(game_array[1].time_control_id).toBe('Blitz');
			expect(game_array[1].time_control_name).toBe('Blitz (5 + 3)');
			expect(game_array[1].when).toBe('2025-01-19..17:06:10:000');

			expect(a.get_games('Blitz').length).toBe(1);
			expect(b.get_games('Blitz').length).toBe(1);
			expect(c.get_games('Blitz').length).toBe(1);
			expect(d.get_games('Blitz').length).toBe(1);
			expect(e.get_games('Blitz').length).toBe(0);
			expect(f.get_games('Blitz').length).toBe(0);
			expect(a.get_games('Classical').length).toBe(0);
			expect(b.get_games('Classical').length).toBe(0);
			expect(c.get_games('Classical').length).toBe(0);
			expect(d.get_games('Classical').length).toBe(0);
			expect(e.get_games('Classical').length).toBe(0);
			expect(f.get_games('Classical').length).toBe(0);

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

		game_add_new('sample', u('e'), u('f'), 'draw', 'Blitz', 'Blitz (5 + 3)', '2025-01-19', '17:06:20:000');
		{
			const game_array = game_array_from_string(fs.readFileSync(path.join(blitz_dir, '2025-01-19'), 'utf8'));
			expect(game_array).not.toBeNull();
			if (!isDefined(game_array)) {
				return;
			}
			expect(game_array.length).toBe(3);

			expect(game_array[0].id).toBe('0000000001');
			expect(game_array[0].white).toBe('a');
			expect(game_array[0].black).toBe('b');
			expect(game_array[0].result).toBe('white_wins');
			expect(game_array[0].time_control_id).toBe('Blitz');
			expect(game_array[0].time_control_name).toBe('Blitz (5 + 3)');
			expect(game_array[0].when).toBe('2025-01-19..17:06:00:000');

			expect(game_array[1].id).toBe('0000000002');
			expect(game_array[1].white).toBe('c');
			expect(game_array[1].black).toBe('d');
			expect(game_array[1].result).toBe('black_wins');
			expect(game_array[1].time_control_id).toBe('Blitz');
			expect(game_array[1].time_control_name).toBe('Blitz (5 + 3)');
			expect(game_array[1].when).toBe('2025-01-19..17:06:10:000');

			expect(game_array[2].id).toBe('0000000003');
			expect(game_array[2].white).toBe('e');
			expect(game_array[2].black).toBe('f');
			expect(game_array[2].result).toBe('draw');
			expect(game_array[2].time_control_id).toBe('Blitz');
			expect(game_array[2].time_control_name).toBe('Blitz (5 + 3)');
			expect(game_array[2].when).toBe('2025-01-19..17:06:20:000');

			expect(a.get_games('Blitz').length).toBe(1);
			expect(b.get_games('Blitz').length).toBe(1);
			expect(c.get_games('Blitz').length).toBe(1);
			expect(d.get_games('Blitz').length).toBe(1);
			expect(e.get_games('Blitz').length).toBe(1);
			expect(f.get_games('Blitz').length).toBe(1);
			expect(a.get_games('Classical').length).toBe(0);
			expect(b.get_games('Classical').length).toBe(0);
			expect(c.get_games('Classical').length).toBe(0);
			expect(d.get_games('Classical').length).toBe(0);
			expect(e.get_games('Classical').length).toBe(0);
			expect(f.get_games('Classical').length).toBe(0);

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

		game_add_new('sample', u('a'), u('f'), 'black_wins', 'Blitz', 'Blitz (5 + 3)', '2025-01-19', '17:06:30:000');
		{
			const game_array = game_array_from_string(fs.readFileSync(path.join(blitz_dir, '2025-01-19'), 'utf8'));
			expect(game_array).not.toBeNull();
			if (!isDefined(game_array)) {
				return;
			}
			expect(game_array.length).toBe(4);

			expect(game_array[0].id).toBe('0000000001');
			expect(game_array[0].white).toBe('a');
			expect(game_array[0].black).toBe('b');
			expect(game_array[0].result).toBe('white_wins');
			expect(game_array[0].time_control_id).toBe('Blitz');
			expect(game_array[0].time_control_name).toBe('Blitz (5 + 3)');
			expect(game_array[0].when).toBe('2025-01-19..17:06:00:000');

			expect(game_array[1].id).toBe('0000000002');
			expect(game_array[1].white).toBe('c');
			expect(game_array[1].black).toBe('d');
			expect(game_array[1].result).toBe('black_wins');
			expect(game_array[1].time_control_id).toBe('Blitz');
			expect(game_array[1].time_control_name).toBe('Blitz (5 + 3)');
			expect(game_array[1].when).toBe('2025-01-19..17:06:10:000');

			expect(game_array[2].id).toBe('0000000003');
			expect(game_array[2].white).toBe('e');
			expect(game_array[2].black).toBe('f');
			expect(game_array[2].result).toBe('draw');
			expect(game_array[2].time_control_id).toBe('Blitz');
			expect(game_array[2].time_control_name).toBe('Blitz (5 + 3)');
			expect(game_array[2].when).toBe('2025-01-19..17:06:20:000');

			expect(game_array[3].id).toBe('0000000004');
			expect(game_array[3].white).toBe('a');
			expect(game_array[3].black).toBe('f');
			expect(game_array[3].result).toBe('black_wins');
			expect(game_array[3].time_control_id).toBe('Blitz');
			expect(game_array[3].time_control_name).toBe('Blitz (5 + 3)');
			expect(game_array[3].when).toBe('2025-01-19..17:06:30:000');

			expect(a.get_games('Blitz').length).toBe(1);
			expect(b.get_games('Blitz').length).toBe(1);
			expect(c.get_games('Blitz').length).toBe(1);
			expect(d.get_games('Blitz').length).toBe(1);
			expect(e.get_games('Blitz').length).toBe(1);
			expect(f.get_games('Blitz').length).toBe(1);
			expect(a.get_games('Classical').length).toBe(0);
			expect(b.get_games('Classical').length).toBe(0);
			expect(c.get_games('Classical').length).toBe(0);
			expect(d.get_games('Classical').length).toBe(0);
			expect(e.get_games('Classical').length).toBe(0);
			expect(f.get_games('Classical').length).toBe(0);

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

		game_add_new(
			'sample',
			u('a'),
			u('b'),
			'white_wins',
			'Classical',
			'Classical (90 + 30)',
			'2025-01-09',
			'17:06:00:000'
		);
		{
			const game_array = game_array_from_string(fs.readFileSync(path.join(classical_dir, '2025-01-09'), 'utf8'));
			expect(game_array).not.toBeNull();
			if (!isDefined(game_array)) {
				return;
			}
			expect(game_array.length).toBe(1);

			expect(game_array[0].id).toBe('0000000005');
			expect(game_array[0].white).toBe('a');
			expect(game_array[0].black).toBe('b');
			expect(game_array[0].result).toBe('white_wins');
			expect(game_array[0].time_control_id).toBe('Classical');
			expect(game_array[0].time_control_name).toBe('Classical (90 + 30)');
			expect(game_array[0].when).toBe('2025-01-09..17:06:00:000');

			expect(a.get_games('Blitz').length).toBe(1);
			expect(b.get_games('Blitz').length).toBe(1);
			expect(c.get_games('Blitz').length).toBe(1);
			expect(d.get_games('Blitz').length).toBe(1);
			expect(e.get_games('Blitz').length).toBe(1);
			expect(f.get_games('Blitz').length).toBe(1);
			expect(a.get_games('Classical').length).toBe(1);
			expect(b.get_games('Classical').length).toBe(1);
			expect(c.get_games('Classical').length).toBe(0);
			expect(d.get_games('Classical').length).toBe(0);
			expect(e.get_games('Classical').length).toBe(0);
			expect(f.get_games('Classical').length).toBe(0);

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

		game_add_new(
			'sample',
			u('c'),
			u('d'),
			'black_wins',
			'Classical',
			'Classical (90 + 30)',
			'2025-01-09',
			'17:06:10:000'
		);
		{
			const game_array = game_array_from_string(fs.readFileSync(path.join(classical_dir, '2025-01-09'), 'utf8'));
			expect(game_array).not.toBeNull();
			if (!isDefined(game_array)) {
				return;
			}
			expect(game_array.length).toBe(2);

			expect(game_array[0].id).toBe('0000000005');
			expect(game_array[0].white).toBe('a');
			expect(game_array[0].black).toBe('b');
			expect(game_array[0].result).toBe('white_wins');
			expect(game_array[0].time_control_id).toBe('Classical');
			expect(game_array[0].time_control_name).toBe('Classical (90 + 30)');
			expect(game_array[0].when).toBe('2025-01-09..17:06:00:000');

			expect(game_array[1].id).toBe('0000000006');
			expect(game_array[1].white).toBe('c');
			expect(game_array[1].black).toBe('d');
			expect(game_array[1].result).toBe('black_wins');
			expect(game_array[1].time_control_id).toBe('Classical');
			expect(game_array[1].time_control_name).toBe('Classical (90 + 30)');
			expect(game_array[1].when).toBe('2025-01-09..17:06:10:000');

			expect(a.get_games('Blitz').length).toBe(1);
			expect(b.get_games('Blitz').length).toBe(1);
			expect(c.get_games('Blitz').length).toBe(1);
			expect(d.get_games('Blitz').length).toBe(1);
			expect(e.get_games('Blitz').length).toBe(1);
			expect(f.get_games('Blitz').length).toBe(1);
			expect(a.get_games('Classical').length).toBe(1);
			expect(b.get_games('Classical').length).toBe(1);
			expect(c.get_games('Classical').length).toBe(1);
			expect(d.get_games('Classical').length).toBe(1);
			expect(e.get_games('Classical').length).toBe(0);
			expect(f.get_games('Classical').length).toBe(0);

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

		game_add_new(
			'sample',
			u('e'),
			u('f'),
			'draw',
			'Classical',
			'Classical (90 + 30)',
			'2025-01-09',
			'17:06:20:000'
		);
		{
			const game_array = game_array_from_string(fs.readFileSync(path.join(classical_dir, '2025-01-09'), 'utf8'));
			expect(game_array).not.toBeNull();
			if (!isDefined(game_array)) {
				return;
			}
			expect(game_array.length).toBe(3);

			expect(game_array[0].id).toBe('0000000005');
			expect(game_array[0].white).toBe('a');
			expect(game_array[0].black).toBe('b');
			expect(game_array[0].result).toBe('white_wins');
			expect(game_array[0].time_control_id).toBe('Classical');
			expect(game_array[0].time_control_name).toBe('Classical (90 + 30)');
			expect(game_array[0].when).toBe('2025-01-09..17:06:00:000');

			expect(game_array[1].id).toBe('0000000006');
			expect(game_array[1].white).toBe('c');
			expect(game_array[1].black).toBe('d');
			expect(game_array[1].result).toBe('black_wins');
			expect(game_array[1].time_control_id).toBe('Classical');
			expect(game_array[1].time_control_name).toBe('Classical (90 + 30)');
			expect(game_array[1].when).toBe('2025-01-09..17:06:10:000');

			expect(game_array[2].id).toBe('0000000007');
			expect(game_array[2].white).toBe('e');
			expect(game_array[2].black).toBe('f');
			expect(game_array[2].result).toBe('draw');
			expect(game_array[2].time_control_id).toBe('Classical');
			expect(game_array[2].time_control_name).toBe('Classical (90 + 30)');
			expect(game_array[2].when).toBe('2025-01-09..17:06:20:000');

			expect(a.get_games('Blitz').length).toBe(1);
			expect(b.get_games('Blitz').length).toBe(1);
			expect(c.get_games('Blitz').length).toBe(1);
			expect(d.get_games('Blitz').length).toBe(1);
			expect(e.get_games('Blitz').length).toBe(1);
			expect(f.get_games('Blitz').length).toBe(1);
			expect(a.get_games('Classical').length).toBe(1);
			expect(b.get_games('Classical').length).toBe(1);
			expect(c.get_games('Classical').length).toBe(1);
			expect(d.get_games('Classical').length).toBe(1);
			expect(e.get_games('Classical').length).toBe(1);
			expect(f.get_games('Classical').length).toBe(1);

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

		game_add_new(
			'sample',
			u('a'),
			u('f'),
			'black_wins',
			'Classical',
			'Classical (90 + 30)',
			'2025-01-09',
			'17:06:30:000'
		);
		{
			const game_array = game_array_from_string(fs.readFileSync(path.join(classical_dir, '2025-01-09'), 'utf8'));
			expect(game_array).not.toBeNull();
			if (!isDefined(game_array)) {
				return;
			}
			expect(game_array.length).toBe(4);

			expect(game_array[0].id).toBe('0000000005');
			expect(game_array[0].white).toBe('a');
			expect(game_array[0].black).toBe('b');
			expect(game_array[0].result).toBe('white_wins');
			expect(game_array[0].time_control_id).toBe('Classical');
			expect(game_array[0].time_control_name).toBe('Classical (90 + 30)');
			expect(game_array[0].when).toBe('2025-01-09..17:06:00:000');

			expect(game_array[1].id).toBe('0000000006');
			expect(game_array[1].white).toBe('c');
			expect(game_array[1].black).toBe('d');
			expect(game_array[1].result).toBe('black_wins');
			expect(game_array[1].time_control_id).toBe('Classical');
			expect(game_array[1].time_control_name).toBe('Classical (90 + 30)');
			expect(game_array[1].when).toBe('2025-01-09..17:06:10:000');

			expect(game_array[2].id).toBe('0000000007');
			expect(game_array[2].white).toBe('e');
			expect(game_array[2].black).toBe('f');
			expect(game_array[2].result).toBe('draw');
			expect(game_array[2].time_control_id).toBe('Classical');
			expect(game_array[2].time_control_name).toBe('Classical (90 + 30)');
			expect(game_array[2].when).toBe('2025-01-09..17:06:20:000');

			expect(game_array[3].id).toBe('0000000008');
			expect(game_array[3].white).toBe('a');
			expect(game_array[3].black).toBe('f');
			expect(game_array[3].result).toBe('black_wins');
			expect(game_array[3].time_control_id).toBe('Classical');
			expect(game_array[3].time_control_name).toBe('Classical (90 + 30)');
			expect(game_array[3].when).toBe('2025-01-09..17:06:30:000');

			expect(a.get_games('Blitz').length).toBe(1);
			expect(b.get_games('Blitz').length).toBe(1);
			expect(c.get_games('Blitz').length).toBe(1);
			expect(d.get_games('Blitz').length).toBe(1);
			expect(e.get_games('Blitz').length).toBe(1);
			expect(f.get_games('Blitz').length).toBe(1);
			expect(a.get_games('Classical').length).toBe(1);
			expect(b.get_games('Classical').length).toBe(1);
			expect(c.get_games('Classical').length).toBe(1);
			expect(d.get_games('Classical').length).toBe(1);
			expect(e.get_games('Classical').length).toBe(1);
			expect(f.get_games('Classical').length).toBe(1);

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

		game_add_new('sample', u('a'), u('f'), 'draw', 'Blitz', 'Blitz (5 + 0)', '2025-01-20', '17:06:30:000');
		{
			const game_array = game_array_from_string(fs.readFileSync(path.join(blitz_dir, '2025-01-20'), 'utf8'));
			expect(game_array).not.toBeNull();
			if (!isDefined(game_array)) {
				return;
			}
			expect(game_array.length).toBe(1);

			expect(game_array[0].id).toBe('0000000009');
			expect(game_array[0].white).toBe('a');
			expect(game_array[0].black).toBe('f');
			expect(game_array[0].result).toBe('draw');
			expect(game_array[0].time_control_id).toBe('Blitz');
			expect(game_array[0].time_control_name).toBe('Blitz (5 + 0)');
			expect(game_array[0].when).toBe('2025-01-20..17:06:30:000');

			expect(a.get_games('Blitz').length).toBe(2);
			expect(b.get_games('Blitz').length).toBe(1);
			expect(c.get_games('Blitz').length).toBe(1);
			expect(d.get_games('Blitz').length).toBe(1);
			expect(e.get_games('Blitz').length).toBe(1);
			expect(f.get_games('Blitz').length).toBe(2);
			expect(a.get_games('Classical').length).toBe(1);
			expect(b.get_games('Classical').length).toBe(1);
			expect(c.get_games('Classical').length).toBe(1);
			expect(d.get_games('Classical').length).toBe(1);
			expect(e.get_games('Classical').length).toBe(1);
			expect(f.get_games('Classical').length).toBe(1);

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

		game_add_new('sample', u('e'), u('f'), 'draw', 'Blitz', 'Blitz (5 + 0)', '2025-01-20', '17:06:20:000');
		{
			const game_array = game_array_from_string(fs.readFileSync(path.join(blitz_dir, '2025-01-20'), 'utf8'));
			expect(game_array).not.toBeNull();
			if (!isDefined(game_array)) {
				return;
			}
			expect(game_array.length).toBe(2);

			expect(game_array[0].id).toBe('0000000010');
			expect(game_array[0].white).toBe('e');
			expect(game_array[0].black).toBe('f');
			expect(game_array[0].result).toBe('draw');
			expect(game_array[0].time_control_id).toBe('Blitz');
			expect(game_array[0].time_control_name).toBe('Blitz (5 + 0)');
			expect(game_array[0].when).toBe('2025-01-20..17:06:20:000');

			expect(game_array[1].id).toBe('0000000009');
			expect(game_array[1].white).toBe('a');
			expect(game_array[1].black).toBe('f');
			expect(game_array[1].result).toBe('draw');
			expect(game_array[1].time_control_id).toBe('Blitz');
			expect(game_array[1].time_control_name).toBe('Blitz (5 + 0)');
			expect(game_array[1].when).toBe('2025-01-20..17:06:30:000');

			expect(a.get_games('Blitz').length).toBe(2);
			expect(b.get_games('Blitz').length).toBe(1);
			expect(c.get_games('Blitz').length).toBe(1);
			expect(d.get_games('Blitz').length).toBe(1);
			expect(e.get_games('Blitz').length).toBe(2);
			expect(f.get_games('Blitz').length).toBe(2);
			expect(a.get_games('Classical').length).toBe(1);
			expect(b.get_games('Classical').length).toBe(1);
			expect(c.get_games('Classical').length).toBe(1);
			expect(d.get_games('Classical').length).toBe(1);
			expect(e.get_games('Classical').length).toBe(1);
			expect(f.get_games('Classical').length).toBe(1);

			expect(a.get_rating('Blitz').num_won_drawn_lost()).toEqual([3, 1, 1, 1]);
			expect(b.get_rating('Blitz').num_won_drawn_lost()).toEqual([1, 0, 0, 1]);
			expect(c.get_rating('Blitz').num_won_drawn_lost()).toEqual([1, 0, 0, 1]);
			expect(d.get_rating('Blitz').num_won_drawn_lost()).toEqual([1, 1, 0, 0]);
			expect(e.get_rating('Blitz').num_won_drawn_lost()).toEqual([2, 0, 2, 0]);
			expect(f.get_rating('Blitz').num_won_drawn_lost()).toEqual([4, 1, 3, 0]);
			/*
			expect(a.get_rating('Classical').num_won_drawn_lost()).toEqual([2, 1, 0, 1]);
			expect(b.get_rating('Classical').num_won_drawn_lost()).toEqual([1, 0, 0, 1]);
			expect(c.get_rating('Classical').num_won_drawn_lost()).toEqual([1, 0, 0, 1]);
			expect(d.get_rating('Classical').num_won_drawn_lost()).toEqual([1, 1, 0, 0]);
			expect(e.get_rating('Classical').num_won_drawn_lost()).toEqual([1, 0, 1, 0]);
			expect(f.get_rating('Classical').num_won_drawn_lost()).toEqual([2, 1, 1, 0]);
			*/
		}

		/*
		game_add_new('sample', u('c'), u('d'), 'black_wins', 'Blitz', 'Blitz (5 + 3)', '2025-01-20', '17:06:10:000');
		{
			const game_array = game_array_from_string(fs.readFileSync(path.join(blitz_dir, '2025-01-20'), 'utf8'));
			expect(game_array).not.toBeNull();
			if (!isDefined(game_array)) {
				return;
			}
			expect(game_array.length).toBe(3);

			expect(game_array[0].id).toBe('0000000011');
			expect(game_array[0].white).toBe('c');
			expect(game_array[0].black).toBe('d');
			expect(game_array[0].result).toBe('black_wins');
			expect(game_array[0].time_control_id).toBe('Blitz');
			expect(game_array[0].time_control_name).toBe('Blitz (5 + 3)');
			expect(game_array[0].when).toBe('2025-01-20..17:06:10:000');

			expect(game_array[1].id).toBe('0000000010');
			expect(game_array[1].white).toBe('e');
			expect(game_array[1].black).toBe('f');
			expect(game_array[1].result).toBe('draw');
			expect(game_array[1].time_control_id).toBe('Blitz');
			expect(game_array[1].time_control_name).toBe('Blitz (5 + 0)');
			expect(game_array[1].when).toBe('2025-01-20..17:06:20:000');

			expect(game_array[2].id).toBe('0000000009');
			expect(game_array[2].white).toBe('a');
			expect(game_array[2].black).toBe('f');
			expect(game_array[2].result).toBe('draw');
			expect(game_array[2].time_control_id).toBe('Blitz');
			expect(game_array[2].time_control_name).toBe('Blitz (5 + 0)');
			expect(game_array[2].when).toBe('2025-01-20..17:06:30:000');

			expect(a.get_games('Blitz').length).toBe(2);
			expect(b.get_games('Blitz').length).toBe(1);
			expect(c.get_games('Blitz').length).toBe(2);
			expect(d.get_games('Blitz').length).toBe(2);
			expect(e.get_games('Blitz').length).toBe(2);
			expect(f.get_games('Blitz').length).toBe(2);
			expect(a.get_games('Classical').length).toBe(1);
			expect(b.get_games('Classical').length).toBe(1);
			expect(c.get_games('Classical').length).toBe(1);
			expect(d.get_games('Classical').length).toBe(1);
			expect(e.get_games('Classical').length).toBe(1);
			expect(f.get_games('Classical').length).toBe(1);

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

		game_add_new('sample', u('a'), u('b'), 'white_wins', 'Blitz', 'Blitz (5 + 3)', '2025-01-20', '17:06:00:000');
		{
			const game_array = game_array_from_string(fs.readFileSync(path.join(blitz_dir, '2025-01-20'), 'utf8'));
			expect(game_array).not.toBeNull();
			if (!isDefined(game_array)) {
				return;
			}
			expect(game_array.length).toBe(4);

			expect(game_array[0].id).toBe('0000000012');
			expect(game_array[0].white).toBe('a');
			expect(game_array[0].black).toBe('b');
			expect(game_array[0].result).toBe('white_wins');
			expect(game_array[0].time_control_id).toBe('Blitz');
			expect(game_array[0].time_control_name).toBe('Blitz (5 + 3)');
			expect(game_array[0].when).toBe('2025-01-20..17:06:00:000');

			expect(game_array[1].id).toBe('0000000011');
			expect(game_array[1].white).toBe('c');
			expect(game_array[1].black).toBe('d');
			expect(game_array[1].result).toBe('black_wins');
			expect(game_array[1].time_control_id).toBe('Blitz');
			expect(game_array[1].time_control_name).toBe('Blitz (5 + 3)');
			expect(game_array[1].when).toBe('2025-01-20..17:06:10:000');

			expect(game_array[2].id).toBe('0000000010');
			expect(game_array[2].white).toBe('e');
			expect(game_array[2].black).toBe('f');
			expect(game_array[2].result).toBe('draw');
			expect(game_array[2].time_control_id).toBe('Blitz');
			expect(game_array[2].time_control_name).toBe('Blitz (5 + 0)');
			expect(game_array[2].when).toBe('2025-01-20..17:06:20:000');

			expect(game_array[3].id).toBe('0000000009');
			expect(game_array[3].white).toBe('a');
			expect(game_array[3].black).toBe('f');
			expect(game_array[3].result).toBe('draw');
			expect(game_array[3].time_control_id).toBe('Blitz');
			expect(game_array[3].time_control_name).toBe('Blitz (5 + 0)');
			expect(game_array[3].when).toBe('2025-01-20..17:06:30:000');

			expect(a.get_games('Blitz').length).toBe(2);
			expect(b.get_games('Blitz').length).toBe(2);
			expect(c.get_games('Blitz').length).toBe(2);
			expect(d.get_games('Blitz').length).toBe(2);
			expect(e.get_games('Blitz').length).toBe(2);
			expect(f.get_games('Blitz').length).toBe(2);
			expect(a.get_games('Classical').length).toBe(1);
			expect(b.get_games('Classical').length).toBe(1);
			expect(c.get_games('Classical').length).toBe(1);
			expect(d.get_games('Classical').length).toBe(1);
			expect(e.get_games('Classical').length).toBe(1);
			expect(f.get_games('Classical').length).toBe(1);

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
		*/
	});

	/*
	test('Add "Classical" games', () => {
		const classical_dir = EnvironmentManager.get_instance().get_dir_games_time_control('Classical');

		game_add_new(
			'sample',
			u('a'),
			u('f'),
			'draw',
			'Classical',
			'Classical (90 + 30)',
			'2025-01-10',
			'17:06:30:000'
		);
		{
			const game_array = game_array_from_string(fs.readFileSync(path.join(classical_dir, '2025-01-10'), 'utf8'));
			expect(game_array).not.toBeNull();
			if (!isDefined(game_array)) {
				return;
			}
			expect(game_array.length).toBe(1);

			expect(game_array[0].id).toBe('0000000013');
			expect(game_array[0].white).toBe('a');
			expect(game_array[0].black).toBe('f');
			expect(game_array[0].result).toBe('draw');
			expect(game_array[0].time_control_id).toBe('Classical');
			expect(game_array[0].time_control_name).toBe('Classical (90 + 30)');
			expect(game_array[0].when).toBe('2025-01-10..17:06:30:000');

			expect(a.get_games('Blitz').length).toBe(2);
			expect(b.get_games('Blitz').length).toBe(2);
			expect(c.get_games('Blitz').length).toBe(2);
			expect(d.get_games('Blitz').length).toBe(2);
			expect(e.get_games('Blitz').length).toBe(2);
			expect(f.get_games('Blitz').length).toBe(2);
			expect(a.get_games('Classical').length).toBe(2);
			expect(b.get_games('Classical').length).toBe(1);
			expect(c.get_games('Classical').length).toBe(1);
			expect(d.get_games('Classical').length).toBe(1);
			expect(e.get_games('Classical').length).toBe(1);
			expect(f.get_games('Classical').length).toBe(2);

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

		game_add_new(
			'sample',
			u('e'),
			u('f'),
			'draw',
			'Classical',
			'Classical (90 + 30)',
			'2025-01-10',
			'17:06:20:000'
		);
		{
			const game_array = game_array_from_string(fs.readFileSync(path.join(classical_dir, '2025-01-10'), 'utf8'));
			expect(game_array).not.toBeNull();
			if (!isDefined(game_array)) {
				return;
			}
			expect(game_array.length).toBe(2);

			expect(game_array[0].id).toBe('0000000014');
			expect(game_array[0].white).toBe('e');
			expect(game_array[0].black).toBe('f');
			expect(game_array[0].result).toBe('draw');
			expect(game_array[0].time_control_id).toBe('Classical');
			expect(game_array[0].time_control_name).toBe('Classical (90 + 30)');
			expect(game_array[0].when).toBe('2025-01-10..17:06:20:000');

			expect(game_array[1].id).toBe('0000000013');
			expect(game_array[1].white).toBe('a');
			expect(game_array[1].black).toBe('f');
			expect(game_array[1].result).toBe('draw');
			expect(game_array[1].time_control_id).toBe('Classical');
			expect(game_array[1].time_control_name).toBe('Classical (90 + 30)');
			expect(game_array[1].when).toBe('2025-01-10..17:06:30:000');

			expect(a.get_games('Blitz').length).toBe(2);
			expect(b.get_games('Blitz').length).toBe(2);
			expect(c.get_games('Blitz').length).toBe(2);
			expect(d.get_games('Blitz').length).toBe(2);
			expect(e.get_games('Blitz').length).toBe(2);
			expect(f.get_games('Blitz').length).toBe(2);
			expect(a.get_games('Classical').length).toBe(2);
			expect(b.get_games('Classical').length).toBe(1);
			expect(c.get_games('Classical').length).toBe(1);
			expect(d.get_games('Classical').length).toBe(1);
			expect(e.get_games('Classical').length).toBe(2);
			expect(f.get_games('Classical').length).toBe(2);

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

		game_add_new(
			'sample',
			u('c'),
			u('d'),
			'black_wins',
			'Classical',
			'Classical (90 + 30)',
			'2025-01-10',
			'17:06:10:000'
		);
		{
			const game_array = game_array_from_string(fs.readFileSync(path.join(classical_dir, '2025-01-10'), 'utf8'));
			expect(game_array).not.toBeNull();
			if (!isDefined(game_array)) {
				return;
			}
			expect(game_array.length).toBe(3);

			expect(game_array[0].id).toBe('0000000015');
			expect(game_array[0].white).toBe('c');
			expect(game_array[0].black).toBe('d');
			expect(game_array[0].result).toBe('black_wins');
			expect(game_array[0].time_control_id).toBe('Classical');
			expect(game_array[0].time_control_name).toBe('Classical (90 + 30)');
			expect(game_array[0].when).toBe('2025-01-10..17:06:10:000');

			expect(game_array[1].id).toBe('0000000014');
			expect(game_array[1].white).toBe('e');
			expect(game_array[1].black).toBe('f');
			expect(game_array[1].result).toBe('draw');
			expect(game_array[1].time_control_id).toBe('Classical');
			expect(game_array[1].time_control_name).toBe('Classical (90 + 30)');
			expect(game_array[1].when).toBe('2025-01-10..17:06:20:000');

			expect(game_array[2].id).toBe('0000000013');
			expect(game_array[2].white).toBe('a');
			expect(game_array[2].black).toBe('f');
			expect(game_array[2].result).toBe('draw');
			expect(game_array[2].time_control_id).toBe('Classical');
			expect(game_array[2].time_control_name).toBe('Classical (90 + 30)');
			expect(game_array[2].when).toBe('2025-01-10..17:06:30:000');

			expect(a.get_games('Blitz').length).toBe(2);
			expect(b.get_games('Blitz').length).toBe(2);
			expect(c.get_games('Blitz').length).toBe(2);
			expect(d.get_games('Blitz').length).toBe(2);
			expect(e.get_games('Blitz').length).toBe(2);
			expect(f.get_games('Blitz').length).toBe(2);
			expect(a.get_games('Classical').length).toBe(2);
			expect(b.get_games('Classical').length).toBe(1);
			expect(c.get_games('Classical').length).toBe(2);
			expect(d.get_games('Classical').length).toBe(2);
			expect(e.get_games('Classical').length).toBe(2);
			expect(f.get_games('Classical').length).toBe(2);

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

		game_add_new(
			'sample',
			u('a'),
			u('b'),
			'white_wins',
			'Classical',
			'Classical (90 + 30)',
			'2025-01-10',
			'17:06:00:000'
		);
		{
			const game_array = game_array_from_string(fs.readFileSync(path.join(classical_dir, '2025-01-10'), 'utf8'));
			expect(game_array).not.toBeNull();
			if (!isDefined(game_array)) {
				return;
			}
			expect(game_array.length).toBe(4);

			expect(game_array[0].id).toBe('0000000016');
			expect(game_array[0].white).toBe('a');
			expect(game_array[0].black).toBe('b');
			expect(game_array[0].result).toBe('white_wins');
			expect(game_array[0].time_control_id).toBe('Classical');
			expect(game_array[0].time_control_name).toBe('Classical (90 + 30)');
			expect(game_array[0].when).toBe('2025-01-10..17:06:00:000');

			expect(game_array[1].id).toBe('0000000015');
			expect(game_array[1].white).toBe('c');
			expect(game_array[1].black).toBe('d');
			expect(game_array[1].result).toBe('black_wins');
			expect(game_array[1].time_control_id).toBe('Classical');
			expect(game_array[1].time_control_name).toBe('Classical (90 + 30)');
			expect(game_array[1].when).toBe('2025-01-10..17:06:10:000');

			expect(game_array[2].id).toBe('0000000014');
			expect(game_array[2].white).toBe('e');
			expect(game_array[2].black).toBe('f');
			expect(game_array[2].result).toBe('draw');
			expect(game_array[2].time_control_id).toBe('Classical');
			expect(game_array[2].time_control_name).toBe('Classical (90 + 30)');
			expect(game_array[2].when).toBe('2025-01-10..17:06:20:000');

			expect(game_array[3].id).toBe('0000000013');
			expect(game_array[3].white).toBe('a');
			expect(game_array[3].black).toBe('f');
			expect(game_array[3].result).toBe('draw');
			expect(game_array[3].time_control_id).toBe('Classical');
			expect(game_array[3].time_control_name).toBe('Classical (90 + 30)');
			expect(game_array[3].when).toBe('2025-01-10..17:06:30:000');

			expect(a.get_games('Blitz').length).toBe(2);
			expect(b.get_games('Blitz').length).toBe(2);
			expect(c.get_games('Blitz').length).toBe(2);
			expect(d.get_games('Blitz').length).toBe(2);
			expect(e.get_games('Blitz').length).toBe(2);
			expect(f.get_games('Blitz').length).toBe(2);
			expect(a.get_games('Classical').length).toBe(2);
			expect(b.get_games('Classical').length).toBe(2);
			expect(c.get_games('Classical').length).toBe(2);
			expect(d.get_games('Classical').length).toBe(2);
			expect(e.get_games('Classical').length).toBe(2);
			expect(f.get_games('Classical').length).toBe(2);

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
	*/
});

/*
describe('Zig-zag game creation', () => {
	test('Add "Blitz" games', () => {
		const blitz_dir = EnvironmentManager.get_instance().get_dir_games_time_control('Blitz');
		game_add_new('sample', u('a'), u('f'), 'draw', 'Blitz', 'Blitz (5 + 0)', '2025-01-20', '17:06:25:000');
		{
			const game_array = game_array_from_string(fs.readFileSync(path.join(blitz_dir, '2025-01-20'), 'utf8'));
			expect(game_array).not.toBeNull();
			if (!isDefined(game_array)) {
				return;
			}
			expect(game_array.length).toBe(5);

			expect(game_array[0].id).toBe('0000000012');
			expect(game_array[0].white).toBe('a');
			expect(game_array[0].black).toBe('b');
			expect(game_array[0].result).toBe('white_wins');
			expect(game_array[0].time_control_id).toBe('Blitz');
			expect(game_array[0].time_control_name).toBe('Blitz (5 + 3)');
			expect(game_array[0].when).toBe('2025-01-20..17:06:00:000');

			expect(game_array[1].id).toBe('0000000011');
			expect(game_array[1].white).toBe('c');
			expect(game_array[1].black).toBe('d');
			expect(game_array[1].result).toBe('black_wins');
			expect(game_array[1].time_control_id).toBe('Blitz');
			expect(game_array[1].time_control_name).toBe('Blitz (5 + 3)');
			expect(game_array[1].when).toBe('2025-01-20..17:06:10:000');

			expect(game_array[2].id).toBe('0000000010');
			expect(game_array[2].white).toBe('e');
			expect(game_array[2].black).toBe('f');
			expect(game_array[2].result).toBe('draw');
			expect(game_array[2].time_control_id).toBe('Blitz');
			expect(game_array[2].time_control_name).toBe('Blitz (5 + 0)');
			expect(game_array[2].when).toBe('2025-01-20..17:06:20:000');

			expect(game_array[3].id).toBe('0000000017');
			expect(game_array[3].white).toBe('a');
			expect(game_array[3].black).toBe('f');
			expect(game_array[3].result).toBe('draw');
			expect(game_array[3].time_control_id).toBe('Blitz');
			expect(game_array[3].time_control_name).toBe('Blitz (5 + 0)');
			expect(game_array[3].when).toBe('2025-01-20..17:06:25:000');

			expect(game_array[4].id).toBe('0000000009');
			expect(game_array[4].white).toBe('a');
			expect(game_array[4].black).toBe('f');
			expect(game_array[4].result).toBe('draw');
			expect(game_array[4].time_control_id).toBe('Blitz');
			expect(game_array[4].time_control_name).toBe('Blitz (5 + 0)');
			expect(game_array[4].when).toBe('2025-01-20..17:06:30:000');

			expect(a.get_games('Blitz').length).toBe(2);
			expect(b.get_games('Blitz').length).toBe(2);
			expect(c.get_games('Blitz').length).toBe(2);
			expect(d.get_games('Blitz').length).toBe(2);
			expect(e.get_games('Blitz').length).toBe(2);
			expect(f.get_games('Blitz').length).toBe(2);
			expect(a.get_games('Classical').length).toBe(2);
			expect(b.get_games('Classical').length).toBe(2);
			expect(c.get_games('Classical').length).toBe(2);
			expect(d.get_games('Classical').length).toBe(2);
			expect(e.get_games('Classical').length).toBe(2);
			expect(f.get_games('Classical').length).toBe(2);

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

		game_add_new('sample', u('e'), u('f'), 'draw', 'Blitz', 'Blitz (5 + 0)', '2025-01-20', '17:06:05:000');
		{
			const game_array = game_array_from_string(fs.readFileSync(path.join(blitz_dir, '2025-01-20'), 'utf8'));
			expect(game_array).not.toBeNull();
			if (!isDefined(game_array)) {
				return;
			}
			expect(game_array.length).toBe(6);

			expect(game_array[0].id).toBe('0000000012');
			expect(game_array[0].white).toBe('a');
			expect(game_array[0].black).toBe('b');
			expect(game_array[0].result).toBe('white_wins');
			expect(game_array[0].time_control_id).toBe('Blitz');
			expect(game_array[0].time_control_name).toBe('Blitz (5 + 3)');
			expect(game_array[0].when).toBe('2025-01-20..17:06:00:000');

			expect(game_array[1].id).toBe('0000000018');
			expect(game_array[1].white).toBe('e');
			expect(game_array[1].black).toBe('f');
			expect(game_array[1].result).toBe('draw');
			expect(game_array[1].time_control_id).toBe('Blitz');
			expect(game_array[1].time_control_name).toBe('Blitz (5 + 0)');
			expect(game_array[1].when).toBe('2025-01-20..17:06:05:000');

			expect(game_array[2].id).toBe('0000000011');
			expect(game_array[2].white).toBe('c');
			expect(game_array[2].black).toBe('d');
			expect(game_array[2].result).toBe('black_wins');
			expect(game_array[2].time_control_id).toBe('Blitz');
			expect(game_array[2].time_control_name).toBe('Blitz (5 + 3)');
			expect(game_array[2].when).toBe('2025-01-20..17:06:10:000');

			expect(game_array[3].id).toBe('0000000010');
			expect(game_array[3].white).toBe('e');
			expect(game_array[3].black).toBe('f');
			expect(game_array[3].result).toBe('draw');
			expect(game_array[3].time_control_id).toBe('Blitz');
			expect(game_array[3].time_control_name).toBe('Blitz (5 + 0)');
			expect(game_array[3].when).toBe('2025-01-20..17:06:20:000');

			expect(game_array[4].id).toBe('0000000017');
			expect(game_array[4].white).toBe('a');
			expect(game_array[4].black).toBe('f');
			expect(game_array[4].result).toBe('draw');
			expect(game_array[4].time_control_id).toBe('Blitz');
			expect(game_array[4].time_control_name).toBe('Blitz (5 + 0)');
			expect(game_array[4].when).toBe('2025-01-20..17:06:25:000');

			expect(game_array[5].id).toBe('0000000009');
			expect(game_array[5].white).toBe('a');
			expect(game_array[5].black).toBe('f');
			expect(game_array[5].result).toBe('draw');
			expect(game_array[5].time_control_id).toBe('Blitz');
			expect(game_array[5].time_control_name).toBe('Blitz (5 + 0)');
			expect(game_array[5].when).toBe('2025-01-20..17:06:30:000');

			expect(a.get_games('Blitz').length).toBe(2);
			expect(b.get_games('Blitz').length).toBe(2);
			expect(c.get_games('Blitz').length).toBe(2);
			expect(d.get_games('Blitz').length).toBe(2);
			expect(e.get_games('Blitz').length).toBe(2);
			expect(f.get_games('Blitz').length).toBe(2);
			expect(a.get_games('Classical').length).toBe(2);
			expect(b.get_games('Classical').length).toBe(2);
			expect(c.get_games('Classical').length).toBe(2);
			expect(d.get_games('Classical').length).toBe(2);
			expect(e.get_games('Classical').length).toBe(2);
			expect(f.get_games('Classical').length).toBe(2);

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

		game_add_new('sample', u('c'), u('d'), 'white_wins', 'Blitz', 'Blitz (5 + 3)', '2025-01-20', '17:06:15:000');
		{
			const game_array = game_array_from_string(fs.readFileSync(path.join(blitz_dir, '2025-01-20'), 'utf8'));
			expect(game_array).not.toBeNull();
			if (!isDefined(game_array)) {
				return;
			}
			expect(game_array.length).toBe(7);

			expect(game_array[0].id).toBe('0000000012');
			expect(game_array[0].white).toBe('a');
			expect(game_array[0].black).toBe('b');
			expect(game_array[0].result).toBe('white_wins');
			expect(game_array[0].time_control_id).toBe('Blitz');
			expect(game_array[0].time_control_name).toBe('Blitz (5 + 3)');
			expect(game_array[0].when).toBe('2025-01-20..17:06:00:000');

			expect(game_array[1].id).toBe('0000000018');
			expect(game_array[1].white).toBe('e');
			expect(game_array[1].black).toBe('f');
			expect(game_array[1].result).toBe('draw');
			expect(game_array[1].time_control_id).toBe('Blitz');
			expect(game_array[1].time_control_name).toBe('Blitz (5 + 0)');
			expect(game_array[1].when).toBe('2025-01-20..17:06:05:000');

			expect(game_array[2].id).toBe('0000000011');
			expect(game_array[2].white).toBe('c');
			expect(game_array[2].black).toBe('d');
			expect(game_array[2].result).toBe('black_wins');
			expect(game_array[2].time_control_id).toBe('Blitz');
			expect(game_array[2].time_control_name).toBe('Blitz (5 + 3)');
			expect(game_array[2].when).toBe('2025-01-20..17:06:10:000');

			expect(game_array[3].id).toBe('0000000019');
			expect(game_array[3].white).toBe('c');
			expect(game_array[3].black).toBe('d');
			expect(game_array[3].result).toBe('white_wins');
			expect(game_array[3].time_control_id).toBe('Blitz');
			expect(game_array[3].time_control_name).toBe('Blitz (5 + 3)');
			expect(game_array[3].when).toBe('2025-01-20..17:06:15:000');

			expect(game_array[4].id).toBe('0000000010');
			expect(game_array[4].white).toBe('e');
			expect(game_array[4].black).toBe('f');
			expect(game_array[4].result).toBe('draw');
			expect(game_array[4].time_control_id).toBe('Blitz');
			expect(game_array[4].time_control_name).toBe('Blitz (5 + 0)');
			expect(game_array[4].when).toBe('2025-01-20..17:06:20:000');

			expect(game_array[5].id).toBe('0000000017');
			expect(game_array[5].white).toBe('a');
			expect(game_array[5].black).toBe('f');
			expect(game_array[5].result).toBe('draw');
			expect(game_array[5].time_control_id).toBe('Blitz');
			expect(game_array[5].time_control_name).toBe('Blitz (5 + 0)');
			expect(game_array[5].when).toBe('2025-01-20..17:06:25:000');

			expect(game_array[6].id).toBe('0000000009');
			expect(game_array[6].white).toBe('a');
			expect(game_array[6].black).toBe('f');
			expect(game_array[6].result).toBe('draw');
			expect(game_array[6].time_control_id).toBe('Blitz');
			expect(game_array[6].time_control_name).toBe('Blitz (5 + 0)');
			expect(game_array[6].when).toBe('2025-01-20..17:06:30:000');

			expect(a.get_games('Blitz').length).toBe(2);
			expect(b.get_games('Blitz').length).toBe(2);
			expect(c.get_games('Blitz').length).toBe(2);
			expect(d.get_games('Blitz').length).toBe(2);
			expect(e.get_games('Blitz').length).toBe(2);
			expect(f.get_games('Blitz').length).toBe(2);
			expect(a.get_games('Classical').length).toBe(2);
			expect(b.get_games('Classical').length).toBe(2);
			expect(c.get_games('Classical').length).toBe(2);
			expect(d.get_games('Classical').length).toBe(2);
			expect(e.get_games('Classical').length).toBe(2);
			expect(f.get_games('Classical').length).toBe(2);

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

		game_add_new('sample', u('a'), u('b'), 'black_wins', 'Blitz', 'Blitz (5 + 3)', '2025-01-20', '17:05:55:000');
		{
			const game_array = game_array_from_string(fs.readFileSync(path.join(blitz_dir, '2025-01-20'), 'utf8'));
			expect(game_array).not.toBeNull();
			if (!isDefined(game_array)) {
				return;
			}
			expect(game_array.length).toBe(8);

			expect(game_array[0].id).toBe('0000000020');
			expect(game_array[0].white).toBe('a');
			expect(game_array[0].black).toBe('b');
			expect(game_array[0].result).toBe('black_wins');
			expect(game_array[0].time_control_id).toBe('Blitz');
			expect(game_array[0].time_control_name).toBe('Blitz (5 + 3)');
			expect(game_array[0].when).toBe('2025-01-20..17:05:55:000');

			expect(game_array[1].id).toBe('0000000012');
			expect(game_array[1].white).toBe('a');
			expect(game_array[1].black).toBe('b');
			expect(game_array[1].result).toBe('white_wins');
			expect(game_array[1].time_control_id).toBe('Blitz');
			expect(game_array[1].time_control_name).toBe('Blitz (5 + 3)');
			expect(game_array[1].when).toBe('2025-01-20..17:06:00:000');

			expect(game_array[2].id).toBe('0000000018');
			expect(game_array[2].white).toBe('e');
			expect(game_array[2].black).toBe('f');
			expect(game_array[2].result).toBe('draw');
			expect(game_array[2].time_control_id).toBe('Blitz');
			expect(game_array[2].time_control_name).toBe('Blitz (5 + 0)');
			expect(game_array[2].when).toBe('2025-01-20..17:06:05:000');

			expect(game_array[3].id).toBe('0000000011');
			expect(game_array[3].white).toBe('c');
			expect(game_array[3].black).toBe('d');
			expect(game_array[3].result).toBe('black_wins');
			expect(game_array[3].time_control_id).toBe('Blitz');
			expect(game_array[3].time_control_name).toBe('Blitz (5 + 3)');
			expect(game_array[3].when).toBe('2025-01-20..17:06:10:000');

			expect(game_array[4].id).toBe('0000000019');
			expect(game_array[4].white).toBe('c');
			expect(game_array[4].black).toBe('d');
			expect(game_array[4].result).toBe('white_wins');
			expect(game_array[4].time_control_id).toBe('Blitz');
			expect(game_array[4].time_control_name).toBe('Blitz (5 + 3)');
			expect(game_array[4].when).toBe('2025-01-20..17:06:15:000');

			expect(game_array[5].id).toBe('0000000010');
			expect(game_array[5].white).toBe('e');
			expect(game_array[5].black).toBe('f');
			expect(game_array[5].result).toBe('draw');
			expect(game_array[5].time_control_id).toBe('Blitz');
			expect(game_array[5].time_control_name).toBe('Blitz (5 + 0)');
			expect(game_array[5].when).toBe('2025-01-20..17:06:20:000');

			expect(game_array[6].id).toBe('0000000017');
			expect(game_array[6].white).toBe('a');
			expect(game_array[6].black).toBe('f');
			expect(game_array[6].result).toBe('draw');
			expect(game_array[6].time_control_id).toBe('Blitz');
			expect(game_array[6].time_control_name).toBe('Blitz (5 + 0)');
			expect(game_array[6].when).toBe('2025-01-20..17:06:25:000');

			expect(game_array[7].id).toBe('0000000009');
			expect(game_array[7].white).toBe('a');
			expect(game_array[7].black).toBe('f');
			expect(game_array[7].result).toBe('draw');
			expect(game_array[7].time_control_id).toBe('Blitz');
			expect(game_array[7].time_control_name).toBe('Blitz (5 + 0)');
			expect(game_array[7].when).toBe('2025-01-20..17:06:30:000');

			expect(a.get_games('Blitz').length).toBe(2);
			expect(b.get_games('Blitz').length).toBe(2);
			expect(c.get_games('Blitz').length).toBe(2);
			expect(d.get_games('Blitz').length).toBe(2);
			expect(e.get_games('Blitz').length).toBe(2);
			expect(f.get_games('Blitz').length).toBe(2);
			expect(a.get_games('Classical').length).toBe(2);
			expect(b.get_games('Classical').length).toBe(2);
			expect(c.get_games('Classical').length).toBe(2);
			expect(d.get_games('Classical').length).toBe(2);
			expect(e.get_games('Classical').length).toBe(2);
			expect(f.get_games('Classical').length).toBe(2);

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
		game_add_new(
			'sample',
			u('a'),
			u('f'),
			'draw',
			'Classical',
			'Classical (90 + 30)',
			'2025-01-10',
			'17:06:25:000'
		);
		{
			const game_array = game_array_from_string(fs.readFileSync(path.join(blitz_dir, '2025-01-10'), 'utf8'));
			expect(game_array).not.toBeNull();
			if (!isDefined(game_array)) {
				return;
			}
			expect(game_array.length).toBe(5);

			expect(game_array[0].id).toBe('0000000016');
			expect(game_array[0].white).toBe('a');
			expect(game_array[0].black).toBe('b');
			expect(game_array[0].result).toBe('white_wins');
			expect(game_array[0].time_control_id).toBe('Classical');
			expect(game_array[0].time_control_name).toBe('Classical (90 + 30)');
			expect(game_array[0].when).toBe('2025-01-10..17:06:00:000');

			expect(game_array[1].id).toBe('0000000015');
			expect(game_array[1].white).toBe('c');
			expect(game_array[1].black).toBe('d');
			expect(game_array[1].result).toBe('black_wins');
			expect(game_array[1].time_control_id).toBe('Classical');
			expect(game_array[1].time_control_name).toBe('Classical (90 + 30)');
			expect(game_array[1].when).toBe('2025-01-10..17:06:10:000');

			expect(game_array[2].id).toBe('0000000014');
			expect(game_array[2].white).toBe('e');
			expect(game_array[2].black).toBe('f');
			expect(game_array[2].result).toBe('draw');
			expect(game_array[2].time_control_id).toBe('Classical');
			expect(game_array[2].time_control_name).toBe('Classical (90 + 30)');
			expect(game_array[2].when).toBe('2025-01-10..17:06:20:000');

			expect(game_array[3].id).toBe('0000000021');
			expect(game_array[3].white).toBe('a');
			expect(game_array[3].black).toBe('f');
			expect(game_array[3].result).toBe('draw');
			expect(game_array[3].time_control_id).toBe('Classical');
			expect(game_array[3].time_control_name).toBe('Classical (90 + 30)');
			expect(game_array[3].when).toBe('2025-01-10..17:06:25:000');

			expect(game_array[4].id).toBe('0000000013');
			expect(game_array[4].white).toBe('a');
			expect(game_array[4].black).toBe('f');
			expect(game_array[4].result).toBe('draw');
			expect(game_array[4].time_control_id).toBe('Classical');
			expect(game_array[4].time_control_name).toBe('Classical (90 + 30)');
			expect(game_array[4].when).toBe('2025-01-10..17:06:30:000');

			expect(a.get_games('Classical').length).toBe(2);
			expect(b.get_games('Classical').length).toBe(2);
			expect(c.get_games('Classical').length).toBe(2);
			expect(d.get_games('Classical').length).toBe(2);
			expect(e.get_games('Classical').length).toBe(2);
			expect(f.get_games('Classical').length).toBe(2);
			expect(a.get_games('Classical').length).toBe(2);
			expect(b.get_games('Classical').length).toBe(2);
			expect(c.get_games('Classical').length).toBe(2);
			expect(d.get_games('Classical').length).toBe(2);
			expect(e.get_games('Classical').length).toBe(2);
			expect(f.get_games('Classical').length).toBe(2);

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

		game_add_new(
			'sample',
			u('e'),
			u('f'),
			'draw',
			'Classical',
			'Classical (90 + 30)',
			'2025-01-10',
			'17:06:05:000'
		);
		{
			const game_array = game_array_from_string(fs.readFileSync(path.join(blitz_dir, '2025-01-10'), 'utf8'));
			expect(game_array).not.toBeNull();
			if (!isDefined(game_array)) {
				return;
			}
			expect(game_array.length).toBe(6);

			expect(game_array[0].id).toBe('0000000016');
			expect(game_array[0].white).toBe('a');
			expect(game_array[0].black).toBe('b');
			expect(game_array[0].result).toBe('white_wins');
			expect(game_array[0].time_control_id).toBe('Classical');
			expect(game_array[0].time_control_name).toBe('Classical (90 + 30)');
			expect(game_array[0].when).toBe('2025-01-10..17:06:00:000');

			expect(game_array[1].id).toBe('0000000022');
			expect(game_array[1].white).toBe('e');
			expect(game_array[1].black).toBe('f');
			expect(game_array[1].result).toBe('draw');
			expect(game_array[1].time_control_id).toBe('Classical');
			expect(game_array[1].time_control_name).toBe('Classical (90 + 30)');
			expect(game_array[1].when).toBe('2025-01-10..17:06:05:000');

			expect(game_array[2].id).toBe('0000000015');
			expect(game_array[2].white).toBe('c');
			expect(game_array[2].black).toBe('d');
			expect(game_array[2].result).toBe('black_wins');
			expect(game_array[2].time_control_id).toBe('Classical');
			expect(game_array[2].time_control_name).toBe('Classical (90 + 30)');
			expect(game_array[2].when).toBe('2025-01-10..17:06:10:000');

			expect(game_array[3].id).toBe('0000000014');
			expect(game_array[3].white).toBe('e');
			expect(game_array[3].black).toBe('f');
			expect(game_array[3].result).toBe('draw');
			expect(game_array[3].time_control_id).toBe('Classical');
			expect(game_array[3].time_control_name).toBe('Classical (90 + 30)');
			expect(game_array[3].when).toBe('2025-01-10..17:06:20:000');

			expect(game_array[4].id).toBe('0000000021');
			expect(game_array[4].white).toBe('a');
			expect(game_array[4].black).toBe('f');
			expect(game_array[4].result).toBe('draw');
			expect(game_array[4].time_control_id).toBe('Classical');
			expect(game_array[4].time_control_name).toBe('Classical (90 + 30)');
			expect(game_array[4].when).toBe('2025-01-10..17:06:25:000');

			expect(game_array[5].id).toBe('0000000013');
			expect(game_array[5].white).toBe('a');
			expect(game_array[5].black).toBe('f');
			expect(game_array[5].result).toBe('draw');
			expect(game_array[5].time_control_id).toBe('Classical');
			expect(game_array[5].time_control_name).toBe('Classical (90 + 30)');
			expect(game_array[5].when).toBe('2025-01-10..17:06:30:000');

			expect(a.get_games('Classical').length).toBe(2);
			expect(b.get_games('Classical').length).toBe(2);
			expect(c.get_games('Classical').length).toBe(2);
			expect(d.get_games('Classical').length).toBe(2);
			expect(e.get_games('Classical').length).toBe(2);
			expect(f.get_games('Classical').length).toBe(2);
			expect(a.get_games('Classical').length).toBe(2);
			expect(b.get_games('Classical').length).toBe(2);
			expect(c.get_games('Classical').length).toBe(2);
			expect(d.get_games('Classical').length).toBe(2);
			expect(e.get_games('Classical').length).toBe(2);
			expect(f.get_games('Classical').length).toBe(2);

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

		game_add_new(
			'sample',
			u('c'),
			u('d'),
			'white_wins',
			'Classical',
			'Classical (90 + 30)',
			'2025-01-10',
			'17:06:15:000'
		);
		{
			const game_array = game_array_from_string(fs.readFileSync(path.join(blitz_dir, '2025-01-10'), 'utf8'));
			expect(game_array).not.toBeNull();
			if (!isDefined(game_array)) {
				return;
			}
			expect(game_array.length).toBe(7);

			expect(game_array[0].id).toBe('0000000016');
			expect(game_array[0].white).toBe('a');
			expect(game_array[0].black).toBe('b');
			expect(game_array[0].result).toBe('white_wins');
			expect(game_array[0].time_control_id).toBe('Classical');
			expect(game_array[0].time_control_name).toBe('Classical (90 + 30)');
			expect(game_array[0].when).toBe('2025-01-10..17:06:00:000');

			expect(game_array[1].id).toBe('0000000022');
			expect(game_array[1].white).toBe('e');
			expect(game_array[1].black).toBe('f');
			expect(game_array[1].result).toBe('draw');
			expect(game_array[1].time_control_id).toBe('Classical');
			expect(game_array[1].time_control_name).toBe('Classical (90 + 30)');
			expect(game_array[1].when).toBe('2025-01-10..17:06:05:000');

			expect(game_array[2].id).toBe('0000000015');
			expect(game_array[2].white).toBe('c');
			expect(game_array[2].black).toBe('d');
			expect(game_array[2].result).toBe('black_wins');
			expect(game_array[2].time_control_id).toBe('Classical');
			expect(game_array[2].time_control_name).toBe('Classical (90 + 30)');
			expect(game_array[2].when).toBe('2025-01-10..17:06:10:000');

			expect(game_array[3].id).toBe('0000000023');
			expect(game_array[3].white).toBe('c');
			expect(game_array[3].black).toBe('d');
			expect(game_array[3].result).toBe('white_wins');
			expect(game_array[3].time_control_id).toBe('Classical');
			expect(game_array[3].time_control_name).toBe('Classical (90 + 30)');
			expect(game_array[3].when).toBe('2025-01-10..17:06:15:000');

			expect(game_array[4].id).toBe('0000000014');
			expect(game_array[4].white).toBe('e');
			expect(game_array[4].black).toBe('f');
			expect(game_array[4].result).toBe('draw');
			expect(game_array[4].time_control_id).toBe('Classical');
			expect(game_array[4].time_control_name).toBe('Classical (90 + 30)');
			expect(game_array[4].when).toBe('2025-01-10..17:06:20:000');

			expect(game_array[5].id).toBe('0000000021');
			expect(game_array[5].white).toBe('a');
			expect(game_array[5].black).toBe('f');
			expect(game_array[5].result).toBe('draw');
			expect(game_array[5].time_control_id).toBe('Classical');
			expect(game_array[5].time_control_name).toBe('Classical (90 + 30)');
			expect(game_array[5].when).toBe('2025-01-10..17:06:25:000');

			expect(game_array[6].id).toBe('0000000013');
			expect(game_array[6].white).toBe('a');
			expect(game_array[6].black).toBe('f');
			expect(game_array[6].result).toBe('draw');
			expect(game_array[6].time_control_id).toBe('Classical');
			expect(game_array[6].time_control_name).toBe('Classical (90 + 30)');
			expect(game_array[6].when).toBe('2025-01-10..17:06:30:000');

			expect(a.get_games('Classical').length).toBe(2);
			expect(b.get_games('Classical').length).toBe(2);
			expect(c.get_games('Classical').length).toBe(2);
			expect(d.get_games('Classical').length).toBe(2);
			expect(e.get_games('Classical').length).toBe(2);
			expect(f.get_games('Classical').length).toBe(2);
			expect(a.get_games('Classical').length).toBe(2);
			expect(b.get_games('Classical').length).toBe(2);
			expect(c.get_games('Classical').length).toBe(2);
			expect(d.get_games('Classical').length).toBe(2);
			expect(e.get_games('Classical').length).toBe(2);
			expect(f.get_games('Classical').length).toBe(2);

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

		game_add_new(
			'sample',
			u('a'),
			u('b'),
			'black_wins',
			'Classical',
			'Classical (90 + 30)',
			'2025-01-10',
			'17:05:55:000'
		);
		{
			const game_array = game_array_from_string(fs.readFileSync(path.join(blitz_dir, '2025-01-10'), 'utf8'));
			expect(game_array).not.toBeNull();
			if (!isDefined(game_array)) {
				return;
			}
			expect(game_array.length).toBe(8);

			expect(game_array[0].id).toBe('0000000024');
			expect(game_array[0].white).toBe('a');
			expect(game_array[0].black).toBe('b');
			expect(game_array[0].result).toBe('black_wins');
			expect(game_array[0].time_control_id).toBe('Classical');
			expect(game_array[0].time_control_name).toBe('Classical (90 + 30)');
			expect(game_array[0].when).toBe('2025-01-10..17:05:55:000');

			expect(game_array[1].id).toBe('0000000016');
			expect(game_array[1].white).toBe('a');
			expect(game_array[1].black).toBe('b');
			expect(game_array[1].result).toBe('white_wins');
			expect(game_array[1].time_control_id).toBe('Classical');
			expect(game_array[1].time_control_name).toBe('Classical (90 + 30)');
			expect(game_array[1].when).toBe('2025-01-10..17:06:00:000');

			expect(game_array[2].id).toBe('0000000022');
			expect(game_array[2].white).toBe('e');
			expect(game_array[2].black).toBe('f');
			expect(game_array[2].result).toBe('draw');
			expect(game_array[2].time_control_id).toBe('Classical');
			expect(game_array[2].time_control_name).toBe('Classical (90 + 30)');
			expect(game_array[2].when).toBe('2025-01-10..17:06:05:000');

			expect(game_array[3].id).toBe('0000000015');
			expect(game_array[3].white).toBe('c');
			expect(game_array[3].black).toBe('d');
			expect(game_array[3].result).toBe('black_wins');
			expect(game_array[3].time_control_id).toBe('Classical');
			expect(game_array[3].time_control_name).toBe('Classical (90 + 30)');
			expect(game_array[3].when).toBe('2025-01-10..17:06:10:000');

			expect(game_array[4].id).toBe('0000000023');
			expect(game_array[4].white).toBe('c');
			expect(game_array[4].black).toBe('d');
			expect(game_array[4].result).toBe('white_wins');
			expect(game_array[4].time_control_id).toBe('Classical');
			expect(game_array[4].time_control_name).toBe('Classical (90 + 30)');
			expect(game_array[4].when).toBe('2025-01-10..17:06:15:000');

			expect(game_array[5].id).toBe('0000000014');
			expect(game_array[5].white).toBe('e');
			expect(game_array[5].black).toBe('f');
			expect(game_array[5].result).toBe('draw');
			expect(game_array[5].time_control_id).toBe('Classical');
			expect(game_array[5].time_control_name).toBe('Classical (90 + 30)');
			expect(game_array[5].when).toBe('2025-01-10..17:06:20:000');

			expect(game_array[6].id).toBe('0000000021');
			expect(game_array[6].white).toBe('a');
			expect(game_array[6].black).toBe('f');
			expect(game_array[6].result).toBe('draw');
			expect(game_array[6].time_control_id).toBe('Classical');
			expect(game_array[6].time_control_name).toBe('Classical (90 + 30)');
			expect(game_array[6].when).toBe('2025-01-10..17:06:25:000');

			expect(game_array[7].id).toBe('0000000013');
			expect(game_array[7].white).toBe('a');
			expect(game_array[7].black).toBe('f');
			expect(game_array[7].result).toBe('draw');
			expect(game_array[7].time_control_id).toBe('Classical');
			expect(game_array[7].time_control_name).toBe('Classical (90 + 30)');
			expect(game_array[7].when).toBe('2025-01-10..17:06:30:000');

			expect(a.get_games('Classical').length).toBe(2);
			expect(b.get_games('Classical').length).toBe(2);
			expect(c.get_games('Classical').length).toBe(2);
			expect(d.get_games('Classical').length).toBe(2);
			expect(e.get_games('Classical').length).toBe(2);
			expect(f.get_games('Classical').length).toBe(2);
			expect(a.get_games('Classical').length).toBe(2);
			expect(b.get_games('Classical').length).toBe(2);
			expect(c.get_games('Classical').length).toBe(2);
			expect(d.get_games('Classical').length).toBe(2);
			expect(e.get_games('Classical').length).toBe(2);
			expect(f.get_games('Classical').length).toBe(2);

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

describe('Before-time inverse game creation', () => {
	test('Add "Blitz" games', () => {
		const blitz_dir = EnvironmentManager.get_instance().get_dir_games_time_control('Blitz');
		game_add_new('sample', u('a'), u('f'), 'draw', 'Blitz', 'Blitz (5 + 0)', '2023-01-20', '17:06:50:000');
		{
			const game_array = game_array_from_string(fs.readFileSync(path.join(blitz_dir, '2023-01-20'), 'utf8'));
			expect(game_array).not.toBeNull();
			if (!isDefined(game_array)) {
				return;
			}
			expect(game_array.length).toBe(1);

			expect(game_array[0].id).toBe('0000000025');
			expect(game_array[0].white).toBe('a');
			expect(game_array[0].black).toBe('f');
			expect(game_array[0].result).toBe('draw');
			expect(game_array[0].time_control_id).toBe('Blitz');
			expect(game_array[0].time_control_name).toBe('Blitz (5 + 0)');
			expect(game_array[0].when).toBe('2023-01-20..17:06:50:000');

			expect(a.get_games('Blitz').length).toBe(3);
			expect(b.get_games('Blitz').length).toBe(2);
			expect(c.get_games('Blitz').length).toBe(2);
			expect(d.get_games('Blitz').length).toBe(2);
			expect(e.get_games('Blitz').length).toBe(2);
			expect(f.get_games('Blitz').length).toBe(3);
			expect(a.get_games('Classical').length).toBe(2);
			expect(b.get_games('Classical').length).toBe(2);
			expect(c.get_games('Classical').length).toBe(2);
			expect(d.get_games('Classical').length).toBe(2);
			expect(e.get_games('Classical').length).toBe(2);
			expect(f.get_games('Classical').length).toBe(2);

			expect(a.get_rating('Blitz').num_won_drawn_lost()).toEqual([7, 2, 3, 2]);
			expect(b.get_rating('Blitz').num_won_drawn_lost()).toEqual([3, 1, 0, 2]);
			expect(c.get_rating('Blitz').num_won_drawn_lost()).toEqual([3, 1, 0, 2]);
			expect(d.get_rating('Blitz').num_won_drawn_lost()).toEqual([3, 2, 0, 1]);
			expect(e.get_rating('Blitz').num_won_drawn_lost()).toEqual([3, 0, 3, 0]);
			expect(f.get_rating('Blitz').num_won_drawn_lost()).toEqual([7, 1, 6, 0]);
			expect(a.get_rating('Classical').num_won_drawn_lost()).toEqual([6, 2, 2, 2]);
			expect(b.get_rating('Classical').num_won_drawn_lost()).toEqual([3, 1, 0, 2]);
			expect(c.get_rating('Classical').num_won_drawn_lost()).toEqual([3, 1, 0, 2]);
			expect(d.get_rating('Classical').num_won_drawn_lost()).toEqual([3, 2, 0, 1]);
			expect(e.get_rating('Classical').num_won_drawn_lost()).toEqual([3, 0, 3, 0]);
			expect(f.get_rating('Classical').num_won_drawn_lost()).toEqual([6, 1, 5, 0]);
		}

		game_add_new('sample', u('a'), u('c'), 'draw', 'Blitz', 'Blitz (5 + 0)', '2023-01-10', '17:06:40:000');
		{
			const game_array = game_array_from_string(fs.readFileSync(path.join(blitz_dir, '2023-01-10'), 'utf8'));
			expect(game_array).not.toBeNull();
			if (!isDefined(game_array)) {
				return;
			}
			expect(game_array.length).toBe(1);

			expect(game_array[0].id).toBe('0000000026');
			expect(game_array[0].white).toBe('a');
			expect(game_array[0].black).toBe('c');
			expect(game_array[0].result).toBe('draw');
			expect(game_array[0].time_control_id).toBe('Blitz');
			expect(game_array[0].time_control_name).toBe('Blitz (5 + 0)');
			expect(game_array[0].when).toBe('2023-01-10..17:06:40:000');

			expect(a.get_games('Blitz').length).toBe(4);
			expect(b.get_games('Blitz').length).toBe(2);
			expect(c.get_games('Blitz').length).toBe(3);
			expect(d.get_games('Blitz').length).toBe(2);
			expect(e.get_games('Blitz').length).toBe(2);
			expect(f.get_games('Blitz').length).toBe(3);
			expect(a.get_games('Classical').length).toBe(2);
			expect(b.get_games('Classical').length).toBe(2);
			expect(c.get_games('Classical').length).toBe(2);
			expect(d.get_games('Classical').length).toBe(2);
			expect(e.get_games('Classical').length).toBe(2);
			expect(f.get_games('Classical').length).toBe(2);

			expect(a.get_rating('Blitz').num_won_drawn_lost()).toEqual([8, 2, 4, 2]);
			expect(b.get_rating('Blitz').num_won_drawn_lost()).toEqual([3, 1, 0, 2]);
			expect(c.get_rating('Blitz').num_won_drawn_lost()).toEqual([4, 1, 1, 2]);
			expect(d.get_rating('Blitz').num_won_drawn_lost()).toEqual([3, 2, 0, 1]);
			expect(e.get_rating('Blitz').num_won_drawn_lost()).toEqual([3, 0, 3, 0]);
			expect(f.get_rating('Blitz').num_won_drawn_lost()).toEqual([7, 1, 6, 0]);
			expect(a.get_rating('Classical').num_won_drawn_lost()).toEqual([6, 2, 2, 2]);
			expect(b.get_rating('Classical').num_won_drawn_lost()).toEqual([3, 1, 0, 2]);
			expect(c.get_rating('Classical').num_won_drawn_lost()).toEqual([3, 1, 0, 2]);
			expect(d.get_rating('Classical').num_won_drawn_lost()).toEqual([3, 2, 0, 1]);
			expect(e.get_rating('Classical').num_won_drawn_lost()).toEqual([3, 0, 3, 0]);
			expect(f.get_rating('Classical').num_won_drawn_lost()).toEqual([6, 1, 5, 0]);
		}
	});
});

describe('Test graphs metadata before edition', () => {
	test('Check Blitz graph', () => {
		const graphs_manager = GraphsManager.get_instance();
		const g = graphs_manager.get_graph('Blitz') as Graph;
		expect(g.get_data_as_white('a', 'b')).toEqual(new EdgeMetadata(2, 0, 1));
		expect(g.get_data_as_white('a', 'c')).toEqual(new EdgeMetadata(0, 1, 0));
		expect(g.get_data_as_white('a', 'd')).toEqual(undefined);
		expect(g.get_data_as_white('a', 'e')).toEqual(undefined);
		expect(g.get_data_as_white('a', 'f')).toEqual(new EdgeMetadata(0, 3, 1));

		expect(g.get_data_as_white('b', 'a')).toEqual(undefined);
		expect(g.get_data_as_white('b', 'c')).toEqual(undefined);
		expect(g.get_data_as_white('b', 'd')).toEqual(undefined);
		expect(g.get_data_as_white('b', 'e')).toEqual(undefined);
		expect(g.get_data_as_white('b', 'f')).toEqual(undefined);

		expect(g.get_data_as_white('c', 'a')).toEqual(undefined);
		expect(g.get_data_as_white('c', 'b')).toEqual(undefined);
		expect(g.get_data_as_white('c', 'd')).toEqual(new EdgeMetadata(1, 0, 2));
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
		expect(g.get_data_as_white('e', 'f')).toEqual(new EdgeMetadata(0, 3, 0));

		expect(g.get_data_as_white('f', 'a')).toEqual(undefined);
		expect(g.get_data_as_white('f', 'b')).toEqual(undefined);
		expect(g.get_data_as_white('f', 'c')).toEqual(undefined);
		expect(g.get_data_as_white('f', 'd')).toEqual(undefined);
		expect(g.get_data_as_white('f', 'e')).toEqual(undefined);

		expect(g.get_data_as_black('a', 'b')).toEqual(undefined);
		expect(g.get_data_as_black('a', 'c')).toEqual(undefined);
		expect(g.get_data_as_black('a', 'd')).toEqual(undefined);
		expect(g.get_data_as_black('a', 'e')).toEqual(undefined);
		expect(g.get_data_as_black('a', 'f')).toEqual(undefined);

		expect(g.get_data_as_black('b', 'a')).toEqual(new EdgeMetadata(1, 0, 2));
		expect(g.get_data_as_black('b', 'c')).toEqual(undefined);
		expect(g.get_data_as_black('b', 'd')).toEqual(undefined);
		expect(g.get_data_as_black('b', 'e')).toEqual(undefined);
		expect(g.get_data_as_black('b', 'f')).toEqual(undefined);

		expect(g.get_data_as_black('c', 'a')).toEqual(new EdgeMetadata(0, 1, 0));
		expect(g.get_data_as_black('c', 'b')).toEqual(undefined);
		expect(g.get_data_as_black('c', 'd')).toEqual(undefined);
		expect(g.get_data_as_black('c', 'e')).toEqual(undefined);
		expect(g.get_data_as_black('c', 'f')).toEqual(undefined);

		expect(g.get_data_as_black('d', 'a')).toEqual(undefined);
		expect(g.get_data_as_black('d', 'b')).toEqual(undefined);
		expect(g.get_data_as_black('d', 'c')).toEqual(new EdgeMetadata(2, 0, 1));
		expect(g.get_data_as_black('d', 'e')).toEqual(undefined);
		expect(g.get_data_as_black('d', 'f')).toEqual(undefined);

		expect(g.get_data_as_black('e', 'a')).toEqual(undefined);
		expect(g.get_data_as_black('e', 'b')).toEqual(undefined);
		expect(g.get_data_as_black('e', 'c')).toEqual(undefined);
		expect(g.get_data_as_black('e', 'd')).toEqual(undefined);
		expect(g.get_data_as_black('e', 'f')).toEqual(undefined);

		expect(g.get_data_as_black('f', 'a')).toEqual(new EdgeMetadata(1, 3, 0));
		expect(g.get_data_as_black('f', 'b')).toEqual(undefined);
		expect(g.get_data_as_black('f', 'c')).toEqual(undefined);
		expect(g.get_data_as_black('f', 'd')).toEqual(undefined);
		expect(g.get_data_as_black('f', 'e')).toEqual(new EdgeMetadata(0, 3, 0));
	});

	test('Check Classical graph', () => {
		const graphs_manager = GraphsManager.get_instance();
		const g = graphs_manager.get_graph('Classical') as Graph;
		expect(g.get_data_as_white('a', 'b')).toEqual(new EdgeMetadata(2, 0, 1));
		expect(g.get_data_as_white('a', 'c')).toEqual(undefined);
		expect(g.get_data_as_white('a', 'd')).toEqual(undefined);
		expect(g.get_data_as_white('a', 'e')).toEqual(undefined);
		expect(g.get_data_as_white('a', 'f')).toEqual(new EdgeMetadata(0, 2, 1));

		expect(g.get_data_as_white('b', 'a')).toEqual(undefined);
		expect(g.get_data_as_white('b', 'c')).toEqual(undefined);
		expect(g.get_data_as_white('b', 'd')).toEqual(undefined);
		expect(g.get_data_as_white('b', 'e')).toEqual(undefined);
		expect(g.get_data_as_white('b', 'f')).toEqual(undefined);

		expect(g.get_data_as_white('c', 'a')).toEqual(undefined);
		expect(g.get_data_as_white('c', 'b')).toEqual(undefined);
		expect(g.get_data_as_white('c', 'd')).toEqual(new EdgeMetadata(1, 0, 2));
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
		expect(g.get_data_as_white('e', 'f')).toEqual(new EdgeMetadata(0, 3, 0));

		expect(g.get_data_as_white('f', 'a')).toEqual(undefined);
		expect(g.get_data_as_white('f', 'b')).toEqual(undefined);
		expect(g.get_data_as_white('f', 'c')).toEqual(undefined);
		expect(g.get_data_as_white('f', 'd')).toEqual(undefined);
		expect(g.get_data_as_white('f', 'e')).toEqual(undefined);

		expect(g.get_data_as_black('a', 'b')).toEqual(undefined);
		expect(g.get_data_as_black('a', 'c')).toEqual(undefined);
		expect(g.get_data_as_black('a', 'd')).toEqual(undefined);
		expect(g.get_data_as_black('a', 'e')).toEqual(undefined);
		expect(g.get_data_as_black('a', 'f')).toEqual(undefined);

		expect(g.get_data_as_black('b', 'a')).toEqual(new EdgeMetadata(1, 0, 2));
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
		expect(g.get_data_as_black('d', 'c')).toEqual(new EdgeMetadata(2, 0, 1));
		expect(g.get_data_as_black('d', 'e')).toEqual(undefined);
		expect(g.get_data_as_black('d', 'f')).toEqual(undefined);

		expect(g.get_data_as_black('e', 'a')).toEqual(undefined);
		expect(g.get_data_as_black('e', 'b')).toEqual(undefined);
		expect(g.get_data_as_black('e', 'c')).toEqual(undefined);
		expect(g.get_data_as_black('e', 'd')).toEqual(undefined);
		expect(g.get_data_as_black('e', 'f')).toEqual(undefined);

		expect(g.get_data_as_black('f', 'a')).toEqual(new EdgeMetadata(1, 2, 0));
		expect(g.get_data_as_black('f', 'b')).toEqual(undefined);
		expect(g.get_data_as_black('f', 'c')).toEqual(undefined);
		expect(g.get_data_as_black('f', 'd')).toEqual(undefined);
		expect(g.get_data_as_black('f', 'e')).toEqual(new EdgeMetadata(0, 3, 0));
	});
});

describe('Edition of game results', () => {
	test('Edit some "Blitz" games', () => {
		game_edit_result('0000000001', 'black_wins');

		expect(a.get_rating('Blitz').num_won_drawn_lost()).toEqual([8, 1, 4, 3]);
		expect(b.get_rating('Blitz').num_won_drawn_lost()).toEqual([3, 2, 0, 1]);
		expect(c.get_rating('Blitz').num_won_drawn_lost()).toEqual([4, 1, 1, 2]);
		expect(d.get_rating('Blitz').num_won_drawn_lost()).toEqual([3, 2, 0, 1]);
		expect(e.get_rating('Blitz').num_won_drawn_lost()).toEqual([3, 0, 3, 0]);
		expect(f.get_rating('Blitz').num_won_drawn_lost()).toEqual([7, 1, 6, 0]);
		expect(a.get_rating('Classical').num_won_drawn_lost()).toEqual([6, 2, 2, 2]);
		expect(b.get_rating('Classical').num_won_drawn_lost()).toEqual([3, 1, 0, 2]);
		expect(c.get_rating('Classical').num_won_drawn_lost()).toEqual([3, 1, 0, 2]);
		expect(d.get_rating('Classical').num_won_drawn_lost()).toEqual([3, 2, 0, 1]);
		expect(e.get_rating('Classical').num_won_drawn_lost()).toEqual([3, 0, 3, 0]);
		expect(f.get_rating('Classical').num_won_drawn_lost()).toEqual([6, 1, 5, 0]);

		game_edit_result('0000000001', 'draw');

		expect(a.get_rating('Blitz').num_won_drawn_lost()).toEqual([8, 1, 5, 2]);
		expect(b.get_rating('Blitz').num_won_drawn_lost()).toEqual([3, 1, 1, 1]);
		expect(c.get_rating('Blitz').num_won_drawn_lost()).toEqual([4, 1, 1, 2]);
		expect(d.get_rating('Blitz').num_won_drawn_lost()).toEqual([3, 2, 0, 1]);
		expect(e.get_rating('Blitz').num_won_drawn_lost()).toEqual([3, 0, 3, 0]);
		expect(f.get_rating('Blitz').num_won_drawn_lost()).toEqual([7, 1, 6, 0]);
		expect(a.get_rating('Classical').num_won_drawn_lost()).toEqual([6, 2, 2, 2]);
		expect(b.get_rating('Classical').num_won_drawn_lost()).toEqual([3, 1, 0, 2]);
		expect(c.get_rating('Classical').num_won_drawn_lost()).toEqual([3, 1, 0, 2]);
		expect(d.get_rating('Classical').num_won_drawn_lost()).toEqual([3, 2, 0, 1]);
		expect(e.get_rating('Classical').num_won_drawn_lost()).toEqual([3, 0, 3, 0]);
		expect(f.get_rating('Classical').num_won_drawn_lost()).toEqual([6, 1, 5, 0]);

		game_edit_result('0000000001', 'draw');

		expect(a.get_rating('Blitz').num_won_drawn_lost()).toEqual([8, 1, 5, 2]);
		expect(b.get_rating('Blitz').num_won_drawn_lost()).toEqual([3, 1, 1, 1]);
		expect(c.get_rating('Blitz').num_won_drawn_lost()).toEqual([4, 1, 1, 2]);
		expect(d.get_rating('Blitz').num_won_drawn_lost()).toEqual([3, 2, 0, 1]);
		expect(e.get_rating('Blitz').num_won_drawn_lost()).toEqual([3, 0, 3, 0]);
		expect(f.get_rating('Blitz').num_won_drawn_lost()).toEqual([7, 1, 6, 0]);
		expect(a.get_rating('Classical').num_won_drawn_lost()).toEqual([6, 2, 2, 2]);
		expect(b.get_rating('Classical').num_won_drawn_lost()).toEqual([3, 1, 0, 2]);
		expect(c.get_rating('Classical').num_won_drawn_lost()).toEqual([3, 1, 0, 2]);
		expect(d.get_rating('Classical').num_won_drawn_lost()).toEqual([3, 2, 0, 1]);
		expect(e.get_rating('Classical').num_won_drawn_lost()).toEqual([3, 0, 3, 0]);
		expect(f.get_rating('Classical').num_won_drawn_lost()).toEqual([6, 1, 5, 0]);

		game_edit_result('0000000002', 'draw');

		expect(a.get_rating('Blitz').num_won_drawn_lost()).toEqual([8, 1, 5, 2]);
		expect(b.get_rating('Blitz').num_won_drawn_lost()).toEqual([3, 1, 1, 1]);
		expect(c.get_rating('Blitz').num_won_drawn_lost()).toEqual([4, 1, 2, 1]);
		expect(d.get_rating('Blitz').num_won_drawn_lost()).toEqual([3, 1, 1, 1]);
		expect(e.get_rating('Blitz').num_won_drawn_lost()).toEqual([3, 0, 3, 0]);
		expect(f.get_rating('Blitz').num_won_drawn_lost()).toEqual([7, 1, 6, 0]);
		expect(a.get_rating('Classical').num_won_drawn_lost()).toEqual([6, 2, 2, 2]);
		expect(b.get_rating('Classical').num_won_drawn_lost()).toEqual([3, 1, 0, 2]);
		expect(c.get_rating('Classical').num_won_drawn_lost()).toEqual([3, 1, 0, 2]);
		expect(d.get_rating('Classical').num_won_drawn_lost()).toEqual([3, 2, 0, 1]);
		expect(e.get_rating('Classical').num_won_drawn_lost()).toEqual([3, 0, 3, 0]);
		expect(f.get_rating('Classical').num_won_drawn_lost()).toEqual([6, 1, 5, 0]);
	});

	test('Edit some "Classical" games', () => {
		game_edit_result('0000000013', 'black_wins');

		expect(a.get_rating('Blitz').num_won_drawn_lost()).toEqual([8, 1, 5, 2]);
		expect(b.get_rating('Blitz').num_won_drawn_lost()).toEqual([3, 1, 1, 1]);
		expect(c.get_rating('Blitz').num_won_drawn_lost()).toEqual([4, 1, 2, 1]);
		expect(d.get_rating('Blitz').num_won_drawn_lost()).toEqual([3, 1, 1, 1]);
		expect(e.get_rating('Blitz').num_won_drawn_lost()).toEqual([3, 0, 3, 0]);
		expect(f.get_rating('Blitz').num_won_drawn_lost()).toEqual([7, 1, 6, 0]);
		expect(a.get_rating('Classical').num_won_drawn_lost()).toEqual([6, 2, 1, 3]);
		expect(b.get_rating('Classical').num_won_drawn_lost()).toEqual([3, 1, 0, 2]);
		expect(c.get_rating('Classical').num_won_drawn_lost()).toEqual([3, 1, 0, 2]);
		expect(d.get_rating('Classical').num_won_drawn_lost()).toEqual([3, 2, 0, 1]);
		expect(e.get_rating('Classical').num_won_drawn_lost()).toEqual([3, 0, 3, 0]);
		expect(f.get_rating('Classical').num_won_drawn_lost()).toEqual([6, 2, 4, 0]);

		game_edit_result('0000000013', 'white_wins');

		expect(a.get_rating('Blitz').num_won_drawn_lost()).toEqual([8, 1, 5, 2]);
		expect(b.get_rating('Blitz').num_won_drawn_lost()).toEqual([3, 1, 1, 1]);
		expect(c.get_rating('Blitz').num_won_drawn_lost()).toEqual([4, 1, 2, 1]);
		expect(d.get_rating('Blitz').num_won_drawn_lost()).toEqual([3, 1, 1, 1]);
		expect(e.get_rating('Blitz').num_won_drawn_lost()).toEqual([3, 0, 3, 0]);
		expect(f.get_rating('Blitz').num_won_drawn_lost()).toEqual([7, 1, 6, 0]);
		expect(a.get_rating('Classical').num_won_drawn_lost()).toEqual([6, 3, 1, 2]);
		expect(b.get_rating('Classical').num_won_drawn_lost()).toEqual([3, 1, 0, 2]);
		expect(c.get_rating('Classical').num_won_drawn_lost()).toEqual([3, 1, 0, 2]);
		expect(d.get_rating('Classical').num_won_drawn_lost()).toEqual([3, 2, 0, 1]);
		expect(e.get_rating('Classical').num_won_drawn_lost()).toEqual([3, 0, 3, 0]);
		expect(f.get_rating('Classical').num_won_drawn_lost()).toEqual([6, 1, 4, 1]);

		game_edit_result('0000000013', 'draw');

		expect(a.get_rating('Blitz').num_won_drawn_lost()).toEqual([8, 1, 5, 2]);
		expect(b.get_rating('Blitz').num_won_drawn_lost()).toEqual([3, 1, 1, 1]);
		expect(c.get_rating('Blitz').num_won_drawn_lost()).toEqual([4, 1, 2, 1]);
		expect(d.get_rating('Blitz').num_won_drawn_lost()).toEqual([3, 1, 1, 1]);
		expect(e.get_rating('Blitz').num_won_drawn_lost()).toEqual([3, 0, 3, 0]);
		expect(f.get_rating('Blitz').num_won_drawn_lost()).toEqual([7, 1, 6, 0]);
		expect(a.get_rating('Classical').num_won_drawn_lost()).toEqual([6, 2, 2, 2]);
		expect(b.get_rating('Classical').num_won_drawn_lost()).toEqual([3, 1, 0, 2]);
		expect(c.get_rating('Classical').num_won_drawn_lost()).toEqual([3, 1, 0, 2]);
		expect(d.get_rating('Classical').num_won_drawn_lost()).toEqual([3, 2, 0, 1]);
		expect(e.get_rating('Classical').num_won_drawn_lost()).toEqual([3, 0, 3, 0]);
		expect(f.get_rating('Classical').num_won_drawn_lost()).toEqual([6, 1, 5, 0]);

		game_edit_result('0000000021', 'black_wins');

		expect(a.get_rating('Blitz').num_won_drawn_lost()).toEqual([8, 1, 5, 2]);
		expect(b.get_rating('Blitz').num_won_drawn_lost()).toEqual([3, 1, 1, 1]);
		expect(c.get_rating('Blitz').num_won_drawn_lost()).toEqual([4, 1, 2, 1]);
		expect(d.get_rating('Blitz').num_won_drawn_lost()).toEqual([3, 1, 1, 1]);
		expect(e.get_rating('Blitz').num_won_drawn_lost()).toEqual([3, 0, 3, 0]);
		expect(f.get_rating('Blitz').num_won_drawn_lost()).toEqual([7, 1, 6, 0]);
		expect(a.get_rating('Classical').num_won_drawn_lost()).toEqual([6, 2, 1, 3]);
		expect(b.get_rating('Classical').num_won_drawn_lost()).toEqual([3, 1, 0, 2]);
		expect(c.get_rating('Classical').num_won_drawn_lost()).toEqual([3, 1, 0, 2]);
		expect(d.get_rating('Classical').num_won_drawn_lost()).toEqual([3, 2, 0, 1]);
		expect(e.get_rating('Classical').num_won_drawn_lost()).toEqual([3, 0, 3, 0]);
		expect(f.get_rating('Classical').num_won_drawn_lost()).toEqual([6, 2, 4, 0]);
	});
});

const N = 2;
for (let i = 0; i < N; ++i) {
	describe(`(${i}) Test graphs`, () => {
		test('Check Blitz graph', () => {
			const graphs_manager = GraphsManager.get_instance();
			const g = graphs_manager.get_graph('Blitz') as Graph;
			expect(g.get_black_opponents('a')).toEqual(['b', 'c', 'f']);
			expect(g.get_black_opponents('b')).toEqual([]);
			expect(g.get_black_opponents('c')).toEqual(['d']);
			expect(g.get_black_opponents('d')).toEqual([]);
			expect(g.get_black_opponents('e')).toEqual(['f']);
			expect(g.get_black_opponents('f')).toEqual([]);

			expect(g.get_white_opponents('a')).toEqual([]);
			expect(g.get_white_opponents('b')).toEqual(['a']);
			expect(g.get_white_opponents('c')).toEqual(['a']);
			expect(g.get_white_opponents('d')).toEqual(['c']);
			expect(g.get_white_opponents('e')).toEqual([]);
			expect(g.get_white_opponents('f')).toEqual(['a', 'e']);
		});

		test('Check Classical graph', () => {
			const graphs_manager = GraphsManager.get_instance();
			const g = graphs_manager.get_graph('Classical') as Graph;
			expect(g.get_black_opponents('a')).toEqual(['b', 'f']);
			expect(g.get_black_opponents('b')).toEqual([]);
			expect(g.get_black_opponents('c')).toEqual(['d']);
			expect(g.get_black_opponents('d')).toEqual([]);
			expect(g.get_black_opponents('e')).toEqual(['f']);
			expect(g.get_black_opponents('f')).toEqual([]);

			expect(g.get_white_opponents('a')).toEqual([]);
			expect(g.get_white_opponents('b')).toEqual(['a']);
			expect(g.get_white_opponents('c')).toEqual([]);
			expect(g.get_white_opponents('d')).toEqual(['c']);
			expect(g.get_white_opponents('e')).toEqual([]);
			expect(g.get_white_opponents('f')).toEqual(['a', 'e']);
		});
	});

	describe(`(${i}) Test graphs metadata after edition`, () => {
		test('Check Blitz graph', () => {
			const graphs_manager = GraphsManager.get_instance();
			const g = graphs_manager.get_graph('Blitz') as Graph;
			expect(g.get_data_as_white('a', 'b')).toEqual(new EdgeMetadata(1, 1, 1));
			expect(g.get_data_as_white('a', 'c')).toEqual(new EdgeMetadata(0, 1, 0));
			expect(g.get_data_as_white('a', 'd')).toEqual(undefined);
			expect(g.get_data_as_white('a', 'e')).toEqual(undefined);
			expect(g.get_data_as_white('a', 'f')).toEqual(new EdgeMetadata(0, 3, 1));

			expect(g.get_data_as_white('b', 'a')).toEqual(undefined);
			expect(g.get_data_as_white('b', 'c')).toEqual(undefined);
			expect(g.get_data_as_white('b', 'd')).toEqual(undefined);
			expect(g.get_data_as_white('b', 'e')).toEqual(undefined);
			expect(g.get_data_as_white('b', 'f')).toEqual(undefined);

			expect(g.get_data_as_white('c', 'a')).toEqual(undefined);
			expect(g.get_data_as_white('c', 'b')).toEqual(undefined);
			expect(g.get_data_as_white('c', 'd')).toEqual(new EdgeMetadata(1, 1, 1));
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
			expect(g.get_data_as_white('e', 'f')).toEqual(new EdgeMetadata(0, 3, 0));

			expect(g.get_data_as_white('f', 'a')).toEqual(undefined);
			expect(g.get_data_as_white('f', 'b')).toEqual(undefined);
			expect(g.get_data_as_white('f', 'c')).toEqual(undefined);
			expect(g.get_data_as_white('f', 'd')).toEqual(undefined);
			expect(g.get_data_as_white('f', 'e')).toEqual(undefined);

			expect(g.get_data_as_black('a', 'b')).toEqual(undefined);
			expect(g.get_data_as_black('a', 'c')).toEqual(undefined);
			expect(g.get_data_as_black('a', 'd')).toEqual(undefined);
			expect(g.get_data_as_black('a', 'e')).toEqual(undefined);
			expect(g.get_data_as_black('a', 'f')).toEqual(undefined);

			expect(g.get_data_as_black('b', 'a')).toEqual(new EdgeMetadata(1, 1, 1));
			expect(g.get_data_as_black('b', 'c')).toEqual(undefined);
			expect(g.get_data_as_black('b', 'd')).toEqual(undefined);
			expect(g.get_data_as_black('b', 'e')).toEqual(undefined);
			expect(g.get_data_as_black('b', 'f')).toEqual(undefined);

			expect(g.get_data_as_black('c', 'a')).toEqual(new EdgeMetadata(0, 1, 0));
			expect(g.get_data_as_black('c', 'b')).toEqual(undefined);
			expect(g.get_data_as_black('c', 'd')).toEqual(undefined);
			expect(g.get_data_as_black('c', 'e')).toEqual(undefined);
			expect(g.get_data_as_black('c', 'f')).toEqual(undefined);

			expect(g.get_data_as_black('d', 'a')).toEqual(undefined);
			expect(g.get_data_as_black('d', 'b')).toEqual(undefined);
			expect(g.get_data_as_black('d', 'c')).toEqual(new EdgeMetadata(1, 1, 1));
			expect(g.get_data_as_black('d', 'e')).toEqual(undefined);
			expect(g.get_data_as_black('d', 'f')).toEqual(undefined);

			expect(g.get_data_as_black('e', 'a')).toEqual(undefined);
			expect(g.get_data_as_black('e', 'b')).toEqual(undefined);
			expect(g.get_data_as_black('e', 'c')).toEqual(undefined);
			expect(g.get_data_as_black('e', 'd')).toEqual(undefined);
			expect(g.get_data_as_black('e', 'f')).toEqual(undefined);

			expect(g.get_data_as_black('f', 'a')).toEqual(new EdgeMetadata(1, 3, 0));
			expect(g.get_data_as_black('f', 'b')).toEqual(undefined);
			expect(g.get_data_as_black('f', 'c')).toEqual(undefined);
			expect(g.get_data_as_black('f', 'd')).toEqual(undefined);
			expect(g.get_data_as_black('f', 'e')).toEqual(new EdgeMetadata(0, 3, 0));
		});

		test('Check Classical graph', () => {
			const graphs_manager = GraphsManager.get_instance();
			const g = graphs_manager.get_graph('Classical') as Graph;
			expect(g.get_data_as_white('a', 'b')).toEqual(new EdgeMetadata(2, 0, 1));
			expect(g.get_data_as_white('a', 'c')).toEqual(undefined);
			expect(g.get_data_as_white('a', 'd')).toEqual(undefined);
			expect(g.get_data_as_white('a', 'e')).toEqual(undefined);
			expect(g.get_data_as_white('a', 'f')).toEqual(new EdgeMetadata(0, 1, 2));

			expect(g.get_data_as_white('b', 'a')).toEqual(undefined);
			expect(g.get_data_as_white('b', 'c')).toEqual(undefined);
			expect(g.get_data_as_white('b', 'd')).toEqual(undefined);
			expect(g.get_data_as_white('b', 'e')).toEqual(undefined);
			expect(g.get_data_as_white('b', 'f')).toEqual(undefined);

			expect(g.get_data_as_white('c', 'a')).toEqual(undefined);
			expect(g.get_data_as_white('c', 'b')).toEqual(undefined);
			expect(g.get_data_as_white('c', 'd')).toEqual(new EdgeMetadata(1, 0, 2));
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
			expect(g.get_data_as_white('e', 'f')).toEqual(new EdgeMetadata(0, 3, 0));

			expect(g.get_data_as_white('f', 'a')).toEqual(undefined);
			expect(g.get_data_as_white('f', 'b')).toEqual(undefined);
			expect(g.get_data_as_white('f', 'c')).toEqual(undefined);
			expect(g.get_data_as_white('f', 'd')).toEqual(undefined);
			expect(g.get_data_as_white('f', 'e')).toEqual(undefined);

			expect(g.get_data_as_black('a', 'b')).toEqual(undefined);
			expect(g.get_data_as_black('a', 'c')).toEqual(undefined);
			expect(g.get_data_as_black('a', 'd')).toEqual(undefined);
			expect(g.get_data_as_black('a', 'e')).toEqual(undefined);
			expect(g.get_data_as_black('a', 'f')).toEqual(undefined);

			expect(g.get_data_as_black('b', 'a')).toEqual(new EdgeMetadata(1, 0, 2));
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
			expect(g.get_data_as_black('d', 'c')).toEqual(new EdgeMetadata(2, 0, 1));
			expect(g.get_data_as_black('d', 'e')).toEqual(undefined);
			expect(g.get_data_as_black('d', 'f')).toEqual(undefined);

			expect(g.get_data_as_black('e', 'a')).toEqual(undefined);
			expect(g.get_data_as_black('e', 'b')).toEqual(undefined);
			expect(g.get_data_as_black('e', 'c')).toEqual(undefined);
			expect(g.get_data_as_black('e', 'd')).toEqual(undefined);
			expect(g.get_data_as_black('e', 'f')).toEqual(undefined);

			expect(g.get_data_as_black('f', 'a')).toEqual(new EdgeMetadata(2, 1, 0));
			expect(g.get_data_as_black('f', 'b')).toEqual(undefined);
			expect(g.get_data_as_black('f', 'c')).toEqual(undefined);
			expect(g.get_data_as_black('f', 'd')).toEqual(undefined);
			expect(g.get_data_as_black('f', 'e')).toEqual(new EdgeMetadata(0, 3, 0));
		});
	});

	describe(`(${i}) Look for a game`, () => {
		test('"Blitz" games', () => {
			{
				const _game = game_find_by_id('0000000001');
				expect(_game).not.toBe(undefined);
				const game = _game as Game;
				expect(game.id).toEqual('0000000001');
				expect(game.white).toEqual('a');
				expect(game.black).toEqual('b');
				expect(game.result).toEqual('draw');
				expect(game.time_control_id).toEqual('Blitz');
				expect(game.time_control_name).toEqual('Blitz (5 + 3)');
			}

			{
				const _game = game_find_by_id('0000000002');
				expect(_game).not.toBe(undefined);
				const game = _game as Game;
				expect(game.id).toEqual('0000000002');
				expect(game.white).toEqual('c');
				expect(game.black).toEqual('d');
				expect(game.result).toEqual('draw');
				expect(game.time_control_id).toEqual('Blitz');
				expect(game.time_control_name).toEqual('Blitz (5 + 3)');
			}

			{
				const _game = game_find_by_id('0000000020');
				expect(_game).not.toBe(undefined);
				const game = _game as Game;
				expect(game.id).toEqual('0000000020');
				expect(game.white).toEqual('a');
				expect(game.black).toEqual('b');
				expect(game.result).toEqual('black_wins');
				expect(game.time_control_id).toEqual('Blitz');
				expect(game.time_control_name).toEqual('Blitz (5 + 3)');
			}
		});

		test('"Classical" games', () => {
			{
				const _game = game_find_by_id('0000000015');
				expect(_game).not.toBe(undefined);
				const game = _game as Game;
				expect(game.id).toEqual('0000000015');
				expect(game.white).toEqual('c');
				expect(game.black).toEqual('d');
				expect(game.result).toEqual('black_wins');
				expect(game.time_control_id).toEqual('Classical');
				expect(game.time_control_name).toEqual('Classical (90 + 30)');
			}

			{
				const _game = game_find_by_id('0000000021');
				expect(_game).not.toBe(undefined);
				const game = _game as Game;
				expect(game.id).toEqual('0000000021');
				expect(game.white).toEqual('a');
				expect(game.black).toEqual('f');
				expect(game.result).toEqual('black_wins');
				expect(game.time_control_id).toEqual('Classical');
				expect(game.time_control_name).toEqual('Classical (90 + 30)');
			}

			{
				const _game = game_find_by_id('0000000008');
				expect(_game).not.toBe(undefined);
				const game = _game as Game;
				expect(game.id).toEqual('0000000008');
				expect(game.white).toEqual('a');
				expect(game.black).toEqual('f');
				expect(game.result).toEqual('black_wins');
				expect(game.time_control_id).toEqual('Classical');
				expect(game.time_control_name).toEqual('Classical (90 + 30)');
			}
		});

		test('Nonexistent games', () => {
			{
				const _game = game_find_by_id('1200003433');
				expect(_game).toBe(undefined);
			}

			{
				const _game = game_find_by_id('1288883433');
				expect(_game).toBe(undefined);
			}

			{
				const _game = game_find_by_id('1299999433');
				expect(_game).toBe(undefined);
			}
		});
	});

	describe(`(${i}) Check all games are sorted by date`, () => {
		test('Blitz', () => {
			let all_games: Game[] = [];
			const game_dir = EnvironmentManager.get_instance().get_dir_games_time_control('Blitz');
			let games_iter = new GamesIterator(game_dir);
			while (!games_iter.end_record_list()) {
				all_games = all_games.concat(games_iter.get_current_game_array());
				games_iter.next_record();
			}

			expect(all_games.length).toBe(14);
			for (let i = 1; i < all_games.length; ++i) {
				const gi1 = all_games[i - 1];
				const gi = all_games[i];
				expect(gi1.when < gi.when).toBe(true);
			}
		});

		test('Classical', () => {
			let all_games: Game[] = [];
			const game_dir = EnvironmentManager.get_instance().get_dir_games_time_control('Classical');
			let games_iter = new GamesIterator(game_dir);
			while (!games_iter.end_record_list()) {
				all_games = all_games.concat(games_iter.get_current_game_array());
				games_iter.next_record();
			}

			expect(all_games.length).toBe(12);
			for (let i = 1; i < all_games.length; ++i) {
				const gi1 = all_games[i - 1];
				const gi = all_games[i];
				expect(gi1.when < gi.when).toBe(true);
			}
		});
	});

	describe(`(${i}) Check all games are located where they should be`, () => {
		test('Blitz', () => {
			const game_dir = EnvironmentManager.get_instance().get_dir_games_time_control('Blitz');
			let games_iter = new GamesIterator(game_dir);
			while (!games_iter.end_record_list()) {
				let current_games = games_iter.get_current_game_array();
				const current_record = games_iter.get_current_record_name();

				for (let i = 0; i < current_games.length; ++i) {
					const gi = current_games[i];
					expect(gi.time_control_id).toEqual('Blitz');
					expect(long_date_to_short_date(gi.when)).toEqual(current_record);
				}
				games_iter.next_record();
			}
		});

		test('Classical', () => {
			const game_dir = EnvironmentManager.get_instance().get_dir_games_time_control('Classical');
			let games_iter = new GamesIterator(game_dir);
			while (!games_iter.end_record_list()) {
				let current_games = games_iter.get_current_game_array();
				const current_record = games_iter.get_current_record_name();

				for (let i = 0; i < current_games.length; ++i) {
					const gi = current_games[i];
					expect(gi.time_control_id).toEqual('Classical');
					expect(long_date_to_short_date(gi.when)).toEqual(current_record);
				}
				games_iter.next_record();
			}
		});
	});

	describe(`(${i}) Recalculation of ratings`, () => {
		let blitz: Game[] = [];
		let classical: Game[] = [];

		test('Read Blitz', () => {
			const game_dir = EnvironmentManager.get_instance().get_dir_games_time_control('Blitz');
			let games_iter = new GamesIterator(game_dir);
			while (!games_iter.end_record_list()) {
				blitz = blitz.concat(games_iter.get_current_game_array());
				games_iter.next_record();
			}
		});
		test('Read Classical', () => {
			const game_dir = EnvironmentManager.get_instance().get_dir_games_time_control('Classical');
			let games_iter = new GamesIterator(game_dir);
			while (!games_iter.end_record_list()) {
				classical = classical.concat(games_iter.get_current_game_array());
				games_iter.next_record();
			}
		});

		test('Recalculate', () => {
			recalculate_all_ratings();
		});

		test('Read Blitz and compare', () => {
			let all_games: Game[] = [];
			const game_dir = EnvironmentManager.get_instance().get_dir_games_time_control('Blitz');
			let games_iter = new GamesIterator(game_dir);
			while (!games_iter.end_record_list()) {
				all_games = all_games.concat(games_iter.get_current_game_array());
				games_iter.next_record();
			}
			expect(all_games.length).toEqual(blitz.length);
			for (let i = 0; i < all_games.length; ++i) {
				expect(all_games[i]).toEqual(blitz[i]);
			}
		});
		test('Read Classical and compare', () => {
			let all_games: Game[] = [];
			const game_dir = EnvironmentManager.get_instance().get_dir_games_time_control('Classical');
			let games_iter = new GamesIterator(game_dir);
			while (!games_iter.end_record_list()) {
				all_games = all_games.concat(games_iter.get_current_game_array());
				games_iter.next_record();
			}
			expect(all_games.length).toEqual(classical.length);
			for (let i = 0; i < all_games.length; ++i) {
				expect(all_games[i]).toEqual(classical[i]);
			}
		});
	});

	describe(`(${i}) Recalculation of graphs`, () => {
		let blitz: Graph | null = null;
		let classical: Graph | null = null;

		test('Read Blitz', () => {
			const graph_dir = EnvironmentManager.get_instance().get_dir_graphs_time_control('Blitz');
			blitz = graph_from_string(graph_dir);
			expect(blitz).not.toBeNull();
			if (!isDefined(blitz)) {
				return;
			}
		});
		test('Read Classical', () => {
			const graph_dir = EnvironmentManager.get_instance().get_dir_graphs_time_control('Classical');
			classical = graph_from_string(graph_dir);
			expect(classical).not.toBeNull();
			if (!isDefined(classical)) {
				return;
			}
		});

		test('Recalculate', () => {
			recalculate_all_graphs();
		});

		test('Read Blitz and compare', () => {
			const graph_dir = EnvironmentManager.get_instance().get_dir_graphs_time_control('Blitz');
			const blitz2 = graph_from_string(graph_dir);
			expect(blitz).toEqual(blitz2);
		});
		test('Read Classical and compare', () => {
			const graph_dir = EnvironmentManager.get_instance().get_dir_graphs_time_control('Classical');
			const classical2 = graph_from_string(graph_dir);
			expect(classical).toEqual(classical2);
		});
	});

	if (i < N - 1) {
		describe(`(${i}) Turn the server off and on again`, () => {
			test('Clear the server memory', () => {
				expect(() => clear_server()).not.toThrow();
			});
			test('Reload server data', () => {
				expect(() => server_init_from_data('tests/webpage', configuration)).not.toThrow();
			});
		});
	}
}
*/
