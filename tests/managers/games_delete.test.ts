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

import { game_add_new, game_delete } from '@server/managers/games';
import { server_init_from_data } from '@server/managers/memory/initialization';
import { user_add_new } from '@server/managers/users';
import { ADMIN } from '@common/models/user_role';
import { run_command } from '@tests/exec_utils';
import { toUserGivenName, User } from '@common/models/user';
import { GamesManager } from '@server/managers/games_manager';
import { EnvironmentManager } from '@server/managers/environment_manager';
import { EdgeMetadata } from '@common/models/graph/edge_metadata';
import { GraphsManager } from '@server/managers/graphs_manager';
import { Graph } from '@common/models/graph/graph';
import { Configuration } from '@common/models/configuration/configuration';
import { toPlayerPrivateId } from '@common/models/player';
import { toGameId } from '@common/models/game';
import { toTimeControlId, toTimeControlName } from '@common/models/time_control';
import { toDateYYYYMMDD, toDateHHmmssSSS } from '@server/utils/time';

const Classical = toTimeControlId('Classical');
const Classical90p30 = toTimeControlName('Classical (90 + 30)');

const Rapid = toTimeControlId('Rapid');
const Rapid12p5 = toTimeControlName('Rapid (12 + 5)');
const Rapid10p0 = toTimeControlName('Rapid (10 + 0)');

const Blitz = toTimeControlId('Blitz');
const Blitz5p3 = toTimeControlName('Blitz (5 + 3)');

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
		domain_name: '$DOMAIN_NAME',
		ports: {
			http: '8080',
			https: '8443'
		}
	},
	rating_system: 'Elo',
	time_controls: [
		{
			id: Classical,
			name: Classical90p30
		},
		{
			id: Rapid,
			name: Rapid12p5
		},
		{
			id: Rapid,
			name: Rapid10p0
		},
		{
			id: Blitz,
			name: Blitz5p3
		}
	],
	behavior: {
		challenges: {
			higher_rated_player_can_decline_challenge_from_lower_rated_player: false
		}
	},
	permissions: {
		admin: [],
		teacher: [],
		member: [],
		student: []
	}
};

let aU: User;
let bU: User;
let cU: User;
let dU: User;
let eU: User;
let fU: User;

const a = toPlayerPrivateId('a');
const b = toPlayerPrivateId('b');
const c = toPlayerPrivateId('c');
const d = toPlayerPrivateId('d');
const e = toPlayerPrivateId('e');
const f = toPlayerPrivateId('f');

const A = toUserGivenName('A');
const B = toUserGivenName('B');
const C = toUserGivenName('C');
const D = toUserGivenName('D');
const E = toUserGivenName('E');
const F = toUserGivenName('F');

const aa = toUserGivenName('aa');
const bb = toUserGivenName('bb');
const cc = toUserGivenName('cc');
const dd = toUserGivenName('dd');
const ee = toUserGivenName('ee');
const ff = toUserGivenName('ff');

describe('Server setup', () => {
	test('Fill an empty server', async () => {
		await run_command('./tests/initialize_empty.sh');
		expect(() => server_init_from_data('tests/webpage', configuration)).not.toThrow();

		aU = user_add_new(a, A, aa, 'aaaa', [ADMIN]);
		bU = user_add_new(b, B, bb, 'dddd', [ADMIN]);
		cU = user_add_new(c, C, cc, 'cccc', [ADMIN]);
		dU = user_add_new(d, D, dd, 'dddd', [ADMIN]);
		eU = user_add_new(e, E, ee, 'eeee', [ADMIN]);
		fU = user_add_new(f, F, ff, 'ffff', [ADMIN]);
	});
});

describe('Sequential game creation', () => {
	test('Add "Blitz" games', () => {
		game_add_new(
			'sample',
			aU,
			bU,
			'white_wins',
			Blitz,
			Blitz5p3,
			toDateYYYYMMDD('2025-01-19'),
			toDateHHmmssSSS('17:06:00:000')
		);
		game_add_new(
			'sample',
			cU,
			dU,
			'black_wins',
			Blitz,
			Blitz5p3,
			toDateYYYYMMDD('2025-01-19'),
			toDateHHmmssSSS('17:06:10:000')
		);
		game_add_new(
			'sample',
			eU,
			fU,
			'draw',
			Blitz,
			Blitz5p3,
			toDateYYYYMMDD('2025-01-19'),
			toDateHHmmssSSS('17:06:20:000')
		);
		game_add_new(
			'sample',
			aU,
			fU,
			'black_wins',
			Blitz,
			Blitz5p3,
			toDateYYYYMMDD('2025-01-19'),
			toDateHHmmssSSS('17:06:30:000')
		);
		game_add_new(
			'sample',
			bU,
			aU,
			'white_wins',
			Blitz,
			Blitz5p3,
			toDateYYYYMMDD('2025-01-19'),
			toDateHHmmssSSS('17:06:40:000')
		);

		expect(aU.get_games(Blitz).length).toBe(1);
		expect(bU.get_games(Blitz).length).toBe(1);
		expect(cU.get_games(Blitz).length).toBe(1);
		expect(dU.get_games(Blitz).length).toBe(1);
		expect(eU.get_games(Blitz).length).toBe(1);
		expect(fU.get_games(Blitz).length).toBe(1);

		expect(aU.get_rating(Blitz).num_won_drawn_lost()).toEqual([3, 1, 0, 2]);
		expect(bU.get_rating(Blitz).num_won_drawn_lost()).toEqual([2, 1, 0, 1]);
		expect(cU.get_rating(Blitz).num_won_drawn_lost()).toEqual([1, 0, 0, 1]);
		expect(dU.get_rating(Blitz).num_won_drawn_lost()).toEqual([1, 1, 0, 0]);
		expect(eU.get_rating(Blitz).num_won_drawn_lost()).toEqual([1, 0, 1, 0]);
		expect(fU.get_rating(Blitz).num_won_drawn_lost()).toEqual([2, 1, 1, 0]);
	});

	test('Check "Blitz" graph', () => {
		const graphs_manager = GraphsManager.get_instance();
		const g = graphs_manager.get_graph(Blitz) as Graph;

		// white

		expect(g.get_data_as_white(a, b)).toEqual(new EdgeMetadata(1, 0, 0));
		expect(g.get_data_as_white(a, c)).toEqual(undefined);
		expect(g.get_data_as_white(a, d)).toEqual(undefined);
		expect(g.get_data_as_white(a, e)).toEqual(undefined);
		expect(g.get_data_as_white(a, f)).toEqual(new EdgeMetadata(0, 0, 1));

		expect(g.get_data_as_white(b, a)).toEqual(new EdgeMetadata(1, 0, 0));
		expect(g.get_data_as_white(b, c)).toEqual(undefined);
		expect(g.get_data_as_white(b, d)).toEqual(undefined);
		expect(g.get_data_as_white(b, e)).toEqual(undefined);
		expect(g.get_data_as_white(b, f)).toEqual(undefined);

		expect(g.get_data_as_white(c, a)).toEqual(undefined);
		expect(g.get_data_as_white(c, b)).toEqual(undefined);
		expect(g.get_data_as_white(c, d)).toEqual(new EdgeMetadata(0, 0, 1));
		expect(g.get_data_as_white(c, e)).toEqual(undefined);
		expect(g.get_data_as_white(c, f)).toEqual(undefined);

		expect(g.get_data_as_white(d, a)).toEqual(undefined);
		expect(g.get_data_as_white(d, b)).toEqual(undefined);
		expect(g.get_data_as_white(d, c)).toEqual(undefined);
		expect(g.get_data_as_white(d, e)).toEqual(undefined);
		expect(g.get_data_as_white(d, f)).toEqual(undefined);

		expect(g.get_data_as_white(e, a)).toEqual(undefined);
		expect(g.get_data_as_white(e, b)).toEqual(undefined);
		expect(g.get_data_as_white(e, c)).toEqual(undefined);
		expect(g.get_data_as_white(e, d)).toEqual(undefined);
		expect(g.get_data_as_white(e, f)).toEqual(new EdgeMetadata(0, 1, 0));

		expect(g.get_data_as_white(f, a)).toEqual(undefined);
		expect(g.get_data_as_white(f, b)).toEqual(undefined);
		expect(g.get_data_as_white(f, c)).toEqual(undefined);
		expect(g.get_data_as_white(f, d)).toEqual(undefined);
		expect(g.get_data_as_white(f, e)).toEqual(undefined);

		// black

		expect(g.get_data_as_black(a, b)).toEqual(new EdgeMetadata(0, 0, 1));
		expect(g.get_data_as_black(a, c)).toEqual(undefined);
		expect(g.get_data_as_black(a, d)).toEqual(undefined);
		expect(g.get_data_as_black(a, e)).toEqual(undefined);
		expect(g.get_data_as_black(a, f)).toEqual(undefined);

		expect(g.get_data_as_black(b, a)).toEqual(new EdgeMetadata(0, 0, 1));
		expect(g.get_data_as_black(b, c)).toEqual(undefined);
		expect(g.get_data_as_black(b, d)).toEqual(undefined);
		expect(g.get_data_as_black(b, e)).toEqual(undefined);
		expect(g.get_data_as_black(b, f)).toEqual(undefined);

		expect(g.get_data_as_black(c, a)).toEqual(undefined);
		expect(g.get_data_as_black(c, b)).toEqual(undefined);
		expect(g.get_data_as_black(c, d)).toEqual(undefined);
		expect(g.get_data_as_black(c, e)).toEqual(undefined);
		expect(g.get_data_as_black(c, f)).toEqual(undefined);

		expect(g.get_data_as_black(d, a)).toEqual(undefined);
		expect(g.get_data_as_black(d, b)).toEqual(undefined);
		expect(g.get_data_as_black(d, c)).toEqual(new EdgeMetadata(1, 0, 0));
		expect(g.get_data_as_black(d, e)).toEqual(undefined);
		expect(g.get_data_as_black(d, f)).toEqual(undefined);

		expect(g.get_data_as_black(e, a)).toEqual(undefined);
		expect(g.get_data_as_black(e, b)).toEqual(undefined);
		expect(g.get_data_as_black(e, c)).toEqual(undefined);
		expect(g.get_data_as_black(e, d)).toEqual(undefined);
		expect(g.get_data_as_black(e, f)).toEqual(undefined);

		expect(g.get_data_as_black(f, a)).toEqual(new EdgeMetadata(1, 0, 0));
		expect(g.get_data_as_black(f, b)).toEqual(undefined);
		expect(g.get_data_as_black(f, c)).toEqual(undefined);
		expect(g.get_data_as_black(f, d)).toEqual(undefined);
		expect(g.get_data_as_black(f, e)).toEqual(new EdgeMetadata(0, 1, 0));

		const blitz_dir = EnvironmentManager.get_instance().get_dir_graphs_time_control(Blitz);
		expect(fs.existsSync(path.join(blitz_dir, 'a'))).toBe(true);
		expect(fs.existsSync(path.join(blitz_dir, 'b'))).toBe(true);
		expect(fs.existsSync(path.join(blitz_dir, 'c'))).toBe(true);
		expect(fs.existsSync(path.join(blitz_dir, 'e'))).toBe(true);
	});

	const id0000000001 = toGameId('0000000001');
	const id0000000002 = toGameId('0000000002');
	const id0000000003 = toGameId('0000000003');
	const id0000000004 = toGameId('0000000004');
	const id0000000005 = toGameId('0000000005');

	test('Delete game 0000000001', () => {
		expect(() => game_delete(id0000000001)).not.toThrow();

		let man = GamesManager.get_instance();
		expect(man.game_exists(id0000000001)).toBe(false);
		expect(man.game_exists(id0000000002)).toBe(true);
		expect(man.game_exists(id0000000003)).toBe(true);
		expect(man.game_exists(id0000000004)).toBe(true);
		expect(man.game_exists(id0000000005)).toBe(true);

		expect(aU.get_games(Blitz).length).toBe(1);
		expect(bU.get_games(Blitz).length).toBe(1);
		expect(cU.get_games(Blitz).length).toBe(1);
		expect(dU.get_games(Blitz).length).toBe(1);
		expect(eU.get_games(Blitz).length).toBe(1);
		expect(fU.get_games(Blitz).length).toBe(1);

		expect(aU.get_rating(Blitz).num_won_drawn_lost()).toEqual([2, 0, 0, 2]);
		expect(bU.get_rating(Blitz).num_won_drawn_lost()).toEqual([1, 1, 0, 0]);
		expect(cU.get_rating(Blitz).num_won_drawn_lost()).toEqual([1, 0, 0, 1]);
		expect(dU.get_rating(Blitz).num_won_drawn_lost()).toEqual([1, 1, 0, 0]);
		expect(eU.get_rating(Blitz).num_won_drawn_lost()).toEqual([1, 0, 1, 0]);
		expect(fU.get_rating(Blitz).num_won_drawn_lost()).toEqual([2, 1, 1, 0]);

		const blitz_dir = EnvironmentManager.get_instance().get_dir_games_time_control(Blitz);
		expect(fs.existsSync(path.join(blitz_dir, '2025-01-19'))).toBe(true);
	});

	test('Check "Blitz" graph', () => {
		const graphs_manager = GraphsManager.get_instance();
		const g = graphs_manager.get_graph(Blitz) as Graph;

		// white

		expect(g.get_data_as_white(a, b)).toEqual(undefined);
		expect(g.get_data_as_white(a, c)).toEqual(undefined);
		expect(g.get_data_as_white(a, d)).toEqual(undefined);
		expect(g.get_data_as_white(a, e)).toEqual(undefined);
		expect(g.get_data_as_white(a, f)).toEqual(new EdgeMetadata(0, 0, 1));

		expect(g.get_data_as_white(b, a)).toEqual(new EdgeMetadata(1, 0, 0));
		expect(g.get_data_as_white(b, c)).toEqual(undefined);
		expect(g.get_data_as_white(b, d)).toEqual(undefined);
		expect(g.get_data_as_white(b, e)).toEqual(undefined);
		expect(g.get_data_as_white(b, f)).toEqual(undefined);

		expect(g.get_data_as_white(c, a)).toEqual(undefined);
		expect(g.get_data_as_white(c, b)).toEqual(undefined);
		expect(g.get_data_as_white(c, d)).toEqual(new EdgeMetadata(0, 0, 1));
		expect(g.get_data_as_white(c, e)).toEqual(undefined);
		expect(g.get_data_as_white(c, f)).toEqual(undefined);

		expect(g.get_data_as_white(d, a)).toEqual(undefined);
		expect(g.get_data_as_white(d, b)).toEqual(undefined);
		expect(g.get_data_as_white(d, c)).toEqual(undefined);
		expect(g.get_data_as_white(d, e)).toEqual(undefined);
		expect(g.get_data_as_white(d, f)).toEqual(undefined);

		expect(g.get_data_as_white(e, a)).toEqual(undefined);
		expect(g.get_data_as_white(e, b)).toEqual(undefined);
		expect(g.get_data_as_white(e, c)).toEqual(undefined);
		expect(g.get_data_as_white(e, d)).toEqual(undefined);
		expect(g.get_data_as_white(e, f)).toEqual(new EdgeMetadata(0, 1, 0));

		expect(g.get_data_as_white(f, a)).toEqual(undefined);
		expect(g.get_data_as_white(f, b)).toEqual(undefined);
		expect(g.get_data_as_white(f, c)).toEqual(undefined);
		expect(g.get_data_as_white(f, d)).toEqual(undefined);
		expect(g.get_data_as_white(f, e)).toEqual(undefined);

		// black

		expect(g.get_data_as_black(a, b)).toEqual(new EdgeMetadata(0, 0, 1));
		expect(g.get_data_as_black(a, c)).toEqual(undefined);
		expect(g.get_data_as_black(a, d)).toEqual(undefined);
		expect(g.get_data_as_black(a, e)).toEqual(undefined);
		expect(g.get_data_as_black(a, f)).toEqual(undefined);

		expect(g.get_data_as_black(b, a)).toEqual(undefined);
		expect(g.get_data_as_black(b, c)).toEqual(undefined);
		expect(g.get_data_as_black(b, d)).toEqual(undefined);
		expect(g.get_data_as_black(b, e)).toEqual(undefined);
		expect(g.get_data_as_black(b, f)).toEqual(undefined);

		expect(g.get_data_as_black(c, a)).toEqual(undefined);
		expect(g.get_data_as_black(c, b)).toEqual(undefined);
		expect(g.get_data_as_black(c, d)).toEqual(undefined);
		expect(g.get_data_as_black(c, e)).toEqual(undefined);
		expect(g.get_data_as_black(c, f)).toEqual(undefined);

		expect(g.get_data_as_black(d, a)).toEqual(undefined);
		expect(g.get_data_as_black(d, b)).toEqual(undefined);
		expect(g.get_data_as_black(d, c)).toEqual(new EdgeMetadata(1, 0, 0));
		expect(g.get_data_as_black(d, e)).toEqual(undefined);
		expect(g.get_data_as_black(d, f)).toEqual(undefined);

		expect(g.get_data_as_black(e, a)).toEqual(undefined);
		expect(g.get_data_as_black(e, b)).toEqual(undefined);
		expect(g.get_data_as_black(e, c)).toEqual(undefined);
		expect(g.get_data_as_black(e, d)).toEqual(undefined);
		expect(g.get_data_as_black(e, f)).toEqual(undefined);

		expect(g.get_data_as_black(f, a)).toEqual(new EdgeMetadata(1, 0, 0));
		expect(g.get_data_as_black(f, b)).toEqual(undefined);
		expect(g.get_data_as_black(f, c)).toEqual(undefined);
		expect(g.get_data_as_black(f, d)).toEqual(undefined);
		expect(g.get_data_as_black(f, e)).toEqual(new EdgeMetadata(0, 1, 0));

		const blitz_dir = EnvironmentManager.get_instance().get_dir_graphs_time_control(Blitz);
		expect(fs.existsSync(path.join(blitz_dir, 'a'))).toBe(true);
		expect(fs.existsSync(path.join(blitz_dir, 'b'))).toBe(true);
		expect(fs.existsSync(path.join(blitz_dir, 'c'))).toBe(true);
		expect(fs.existsSync(path.join(blitz_dir, 'e'))).toBe(true);
	});

	test('Delete game 0000000004', () => {
		expect(() => game_delete(id0000000004)).not.toThrow();

		let man = GamesManager.get_instance();
		expect(man.game_exists(id0000000001)).toBe(false);
		expect(man.game_exists(id0000000002)).toBe(true);
		expect(man.game_exists(id0000000003)).toBe(true);
		expect(man.game_exists(id0000000004)).toBe(false);
		expect(man.game_exists(id0000000005)).toBe(true);

		expect(aU.get_games(Blitz).length).toBe(1);
		expect(bU.get_games(Blitz).length).toBe(1);
		expect(cU.get_games(Blitz).length).toBe(1);
		expect(dU.get_games(Blitz).length).toBe(1);
		expect(eU.get_games(Blitz).length).toBe(1);
		expect(fU.get_games(Blitz).length).toBe(1);

		expect(aU.get_rating(Blitz).num_won_drawn_lost()).toEqual([1, 0, 0, 1]);
		expect(bU.get_rating(Blitz).num_won_drawn_lost()).toEqual([1, 1, 0, 0]);
		expect(cU.get_rating(Blitz).num_won_drawn_lost()).toEqual([1, 0, 0, 1]);
		expect(dU.get_rating(Blitz).num_won_drawn_lost()).toEqual([1, 1, 0, 0]);
		expect(eU.get_rating(Blitz).num_won_drawn_lost()).toEqual([1, 0, 1, 0]);
		expect(fU.get_rating(Blitz).num_won_drawn_lost()).toEqual([1, 0, 1, 0]);

		const blitz_dir = EnvironmentManager.get_instance().get_dir_games_time_control(Blitz);
		expect(fs.existsSync(path.join(blitz_dir, '2025-01-19'))).toBe(true);
	});

	test('Check "Blitz" graph', () => {
		const graphs_manager = GraphsManager.get_instance();
		const g = graphs_manager.get_graph(Blitz) as Graph;

		// white

		expect(g.get_data_as_white(a, b)).toEqual(undefined);
		expect(g.get_data_as_white(a, c)).toEqual(undefined);
		expect(g.get_data_as_white(a, d)).toEqual(undefined);
		expect(g.get_data_as_white(a, e)).toEqual(undefined);
		expect(g.get_data_as_white(a, f)).toEqual(undefined);

		expect(g.get_data_as_white(b, a)).toEqual(new EdgeMetadata(1, 0, 0));
		expect(g.get_data_as_white(b, c)).toEqual(undefined);
		expect(g.get_data_as_white(b, d)).toEqual(undefined);
		expect(g.get_data_as_white(b, e)).toEqual(undefined);
		expect(g.get_data_as_white(b, f)).toEqual(undefined);

		expect(g.get_data_as_white(c, a)).toEqual(undefined);
		expect(g.get_data_as_white(c, b)).toEqual(undefined);
		expect(g.get_data_as_white(c, d)).toEqual(new EdgeMetadata(0, 0, 1));
		expect(g.get_data_as_white(c, e)).toEqual(undefined);
		expect(g.get_data_as_white(c, f)).toEqual(undefined);

		expect(g.get_data_as_white(d, a)).toEqual(undefined);
		expect(g.get_data_as_white(d, b)).toEqual(undefined);
		expect(g.get_data_as_white(d, c)).toEqual(undefined);
		expect(g.get_data_as_white(d, e)).toEqual(undefined);
		expect(g.get_data_as_white(d, f)).toEqual(undefined);

		expect(g.get_data_as_white(e, a)).toEqual(undefined);
		expect(g.get_data_as_white(e, b)).toEqual(undefined);
		expect(g.get_data_as_white(e, c)).toEqual(undefined);
		expect(g.get_data_as_white(e, d)).toEqual(undefined);
		expect(g.get_data_as_white(e, f)).toEqual(new EdgeMetadata(0, 1, 0));

		expect(g.get_data_as_white(f, a)).toEqual(undefined);
		expect(g.get_data_as_white(f, b)).toEqual(undefined);
		expect(g.get_data_as_white(f, c)).toEqual(undefined);
		expect(g.get_data_as_white(f, d)).toEqual(undefined);
		expect(g.get_data_as_white(f, e)).toEqual(undefined);

		// black

		expect(g.get_data_as_black(a, b)).toEqual(new EdgeMetadata(0, 0, 1));
		expect(g.get_data_as_black(a, c)).toEqual(undefined);
		expect(g.get_data_as_black(a, d)).toEqual(undefined);
		expect(g.get_data_as_black(a, e)).toEqual(undefined);
		expect(g.get_data_as_black(a, f)).toEqual(undefined);

		expect(g.get_data_as_black(b, a)).toEqual(undefined);
		expect(g.get_data_as_black(b, c)).toEqual(undefined);
		expect(g.get_data_as_black(b, d)).toEqual(undefined);
		expect(g.get_data_as_black(b, e)).toEqual(undefined);
		expect(g.get_data_as_black(b, f)).toEqual(undefined);

		expect(g.get_data_as_black(c, a)).toEqual(undefined);
		expect(g.get_data_as_black(c, b)).toEqual(undefined);
		expect(g.get_data_as_black(c, d)).toEqual(undefined);
		expect(g.get_data_as_black(c, e)).toEqual(undefined);
		expect(g.get_data_as_black(c, f)).toEqual(undefined);

		expect(g.get_data_as_black(d, a)).toEqual(undefined);
		expect(g.get_data_as_black(d, b)).toEqual(undefined);
		expect(g.get_data_as_black(d, c)).toEqual(new EdgeMetadata(1, 0, 0));
		expect(g.get_data_as_black(d, e)).toEqual(undefined);
		expect(g.get_data_as_black(d, f)).toEqual(undefined);

		expect(g.get_data_as_black(e, a)).toEqual(undefined);
		expect(g.get_data_as_black(e, b)).toEqual(undefined);
		expect(g.get_data_as_black(e, c)).toEqual(undefined);
		expect(g.get_data_as_black(e, d)).toEqual(undefined);
		expect(g.get_data_as_black(e, f)).toEqual(undefined);

		expect(g.get_data_as_black(f, a)).toEqual(undefined);
		expect(g.get_data_as_black(f, b)).toEqual(undefined);
		expect(g.get_data_as_black(f, c)).toEqual(undefined);
		expect(g.get_data_as_black(f, d)).toEqual(undefined);
		expect(g.get_data_as_black(f, e)).toEqual(new EdgeMetadata(0, 1, 0));

		const blitz_dir = EnvironmentManager.get_instance().get_dir_graphs_time_control(Blitz);
		expect(fs.existsSync(path.join(blitz_dir, 'a'))).toBe(false);
		expect(fs.existsSync(path.join(blitz_dir, 'b'))).toBe(true);
		expect(fs.existsSync(path.join(blitz_dir, 'c'))).toBe(true);
		expect(fs.existsSync(path.join(blitz_dir, 'e'))).toBe(true);
	});

	test('Delete game 0000000003', () => {
		expect(() => game_delete(id0000000003)).not.toThrow();

		let man = GamesManager.get_instance();
		expect(man.game_exists(id0000000001)).toBe(false);
		expect(man.game_exists(id0000000002)).toBe(true);
		expect(man.game_exists(id0000000003)).toBe(false);
		expect(man.game_exists(id0000000004)).toBe(false);
		expect(man.game_exists(id0000000005)).toBe(true);

		expect(aU.get_games(Blitz).length).toBe(1);
		expect(bU.get_games(Blitz).length).toBe(1);
		expect(cU.get_games(Blitz).length).toBe(1);
		expect(dU.get_games(Blitz).length).toBe(1);
		expect(eU.get_games(Blitz).length).toBe(0);
		expect(fU.get_games(Blitz).length).toBe(0);

		expect(aU.get_rating(Blitz).num_won_drawn_lost()).toEqual([1, 0, 0, 1]);
		expect(bU.get_rating(Blitz).num_won_drawn_lost()).toEqual([1, 1, 0, 0]);
		expect(cU.get_rating(Blitz).num_won_drawn_lost()).toEqual([1, 0, 0, 1]);
		expect(dU.get_rating(Blitz).num_won_drawn_lost()).toEqual([1, 1, 0, 0]);
		expect(eU.get_rating(Blitz).num_won_drawn_lost()).toEqual([0, 0, 0, 0]);
		expect(fU.get_rating(Blitz).num_won_drawn_lost()).toEqual([0, 0, 0, 0]);

		const blitz_dir = EnvironmentManager.get_instance().get_dir_games_time_control(Blitz);
		expect(fs.existsSync(path.join(blitz_dir, '2025-01-19'))).toBe(true);
	});

	test('Check "Blitz" graph', () => {
		const graphs_manager = GraphsManager.get_instance();
		const g = graphs_manager.get_graph(Blitz) as Graph;

		// white

		expect(g.get_data_as_white(a, b)).toEqual(undefined);
		expect(g.get_data_as_white(a, c)).toEqual(undefined);
		expect(g.get_data_as_white(a, d)).toEqual(undefined);
		expect(g.get_data_as_white(a, e)).toEqual(undefined);
		expect(g.get_data_as_white(a, f)).toEqual(undefined);

		expect(g.get_data_as_white(b, a)).toEqual(new EdgeMetadata(1, 0, 0));
		expect(g.get_data_as_white(b, c)).toEqual(undefined);
		expect(g.get_data_as_white(b, d)).toEqual(undefined);
		expect(g.get_data_as_white(b, e)).toEqual(undefined);
		expect(g.get_data_as_white(b, f)).toEqual(undefined);

		expect(g.get_data_as_white(c, a)).toEqual(undefined);
		expect(g.get_data_as_white(c, b)).toEqual(undefined);
		expect(g.get_data_as_white(c, d)).toEqual(new EdgeMetadata(0, 0, 1));
		expect(g.get_data_as_white(c, e)).toEqual(undefined);
		expect(g.get_data_as_white(c, f)).toEqual(undefined);

		expect(g.get_data_as_white(d, a)).toEqual(undefined);
		expect(g.get_data_as_white(d, b)).toEqual(undefined);
		expect(g.get_data_as_white(d, c)).toEqual(undefined);
		expect(g.get_data_as_white(d, e)).toEqual(undefined);
		expect(g.get_data_as_white(d, f)).toEqual(undefined);

		expect(g.get_data_as_white(e, a)).toEqual(undefined);
		expect(g.get_data_as_white(e, b)).toEqual(undefined);
		expect(g.get_data_as_white(e, c)).toEqual(undefined);
		expect(g.get_data_as_white(e, d)).toEqual(undefined);
		expect(g.get_data_as_white(e, f)).toEqual(undefined);

		expect(g.get_data_as_white(f, a)).toEqual(undefined);
		expect(g.get_data_as_white(f, b)).toEqual(undefined);
		expect(g.get_data_as_white(f, c)).toEqual(undefined);
		expect(g.get_data_as_white(f, d)).toEqual(undefined);
		expect(g.get_data_as_white(f, e)).toEqual(undefined);

		// black

		expect(g.get_data_as_black(a, b)).toEqual(new EdgeMetadata(0, 0, 1));
		expect(g.get_data_as_black(a, c)).toEqual(undefined);
		expect(g.get_data_as_black(a, d)).toEqual(undefined);
		expect(g.get_data_as_black(a, e)).toEqual(undefined);
		expect(g.get_data_as_black(a, f)).toEqual(undefined);

		expect(g.get_data_as_black(b, a)).toEqual(undefined);
		expect(g.get_data_as_black(b, c)).toEqual(undefined);
		expect(g.get_data_as_black(b, d)).toEqual(undefined);
		expect(g.get_data_as_black(b, e)).toEqual(undefined);
		expect(g.get_data_as_black(b, f)).toEqual(undefined);

		expect(g.get_data_as_black(c, a)).toEqual(undefined);
		expect(g.get_data_as_black(c, b)).toEqual(undefined);
		expect(g.get_data_as_black(c, d)).toEqual(undefined);
		expect(g.get_data_as_black(c, e)).toEqual(undefined);
		expect(g.get_data_as_black(c, f)).toEqual(undefined);

		expect(g.get_data_as_black(d, a)).toEqual(undefined);
		expect(g.get_data_as_black(d, b)).toEqual(undefined);
		expect(g.get_data_as_black(d, c)).toEqual(new EdgeMetadata(1, 0, 0));
		expect(g.get_data_as_black(d, e)).toEqual(undefined);
		expect(g.get_data_as_black(d, f)).toEqual(undefined);

		expect(g.get_data_as_black(e, a)).toEqual(undefined);
		expect(g.get_data_as_black(e, b)).toEqual(undefined);
		expect(g.get_data_as_black(e, c)).toEqual(undefined);
		expect(g.get_data_as_black(e, d)).toEqual(undefined);
		expect(g.get_data_as_black(e, f)).toEqual(undefined);

		expect(g.get_data_as_black(f, a)).toEqual(undefined);
		expect(g.get_data_as_black(f, b)).toEqual(undefined);
		expect(g.get_data_as_black(f, c)).toEqual(undefined);
		expect(g.get_data_as_black(f, d)).toEqual(undefined);
		expect(g.get_data_as_black(f, e)).toEqual(undefined);

		const blitz_dir = EnvironmentManager.get_instance().get_dir_graphs_time_control(Blitz);
		expect(fs.existsSync(path.join(blitz_dir, 'a'))).toBe(false);
		expect(fs.existsSync(path.join(blitz_dir, 'b'))).toBe(true);
		expect(fs.existsSync(path.join(blitz_dir, 'c'))).toBe(true);
		expect(fs.existsSync(path.join(blitz_dir, 'e'))).toBe(false);
	});

	test('Delete game 0000000002', () => {
		expect(() => game_delete(id0000000002)).not.toThrow();

		let man = GamesManager.get_instance();
		expect(man.game_exists(id0000000001)).toBe(false);
		expect(man.game_exists(id0000000002)).toBe(false);
		expect(man.game_exists(id0000000003)).toBe(false);
		expect(man.game_exists(id0000000004)).toBe(false);
		expect(man.game_exists(id0000000005)).toBe(true);

		expect(aU.get_games(Blitz).length).toBe(1);
		expect(bU.get_games(Blitz).length).toBe(1);
		expect(cU.get_games(Blitz).length).toBe(0);
		expect(dU.get_games(Blitz).length).toBe(0);
		expect(eU.get_games(Blitz).length).toBe(0);
		expect(fU.get_games(Blitz).length).toBe(0);

		expect(aU.get_rating(Blitz).num_won_drawn_lost()).toEqual([1, 0, 0, 1]);
		expect(bU.get_rating(Blitz).num_won_drawn_lost()).toEqual([1, 1, 0, 0]);
		expect(cU.get_rating(Blitz).num_won_drawn_lost()).toEqual([0, 0, 0, 0]);
		expect(dU.get_rating(Blitz).num_won_drawn_lost()).toEqual([0, 0, 0, 0]);
		expect(eU.get_rating(Blitz).num_won_drawn_lost()).toEqual([0, 0, 0, 0]);
		expect(fU.get_rating(Blitz).num_won_drawn_lost()).toEqual([0, 0, 0, 0]);

		const blitz_dir = EnvironmentManager.get_instance().get_dir_games_time_control(Blitz);
		expect(fs.existsSync(path.join(blitz_dir, '2025-01-19'))).toBe(true);
	});

	test('Check "Blitz" graph', () => {
		const graphs_manager = GraphsManager.get_instance();
		const g = graphs_manager.get_graph(Blitz) as Graph;

		// white

		expect(g.get_data_as_white(a, b)).toEqual(undefined);
		expect(g.get_data_as_white(a, c)).toEqual(undefined);
		expect(g.get_data_as_white(a, d)).toEqual(undefined);
		expect(g.get_data_as_white(a, e)).toEqual(undefined);
		expect(g.get_data_as_white(a, f)).toEqual(undefined);

		expect(g.get_data_as_white(b, a)).toEqual(new EdgeMetadata(1, 0, 0));
		expect(g.get_data_as_white(b, c)).toEqual(undefined);
		expect(g.get_data_as_white(b, d)).toEqual(undefined);
		expect(g.get_data_as_white(b, e)).toEqual(undefined);
		expect(g.get_data_as_white(b, f)).toEqual(undefined);

		expect(g.get_data_as_white(c, a)).toEqual(undefined);
		expect(g.get_data_as_white(c, b)).toEqual(undefined);
		expect(g.get_data_as_white(c, d)).toEqual(undefined);
		expect(g.get_data_as_white(c, e)).toEqual(undefined);
		expect(g.get_data_as_white(c, f)).toEqual(undefined);

		expect(g.get_data_as_white(d, a)).toEqual(undefined);
		expect(g.get_data_as_white(d, b)).toEqual(undefined);
		expect(g.get_data_as_white(d, c)).toEqual(undefined);
		expect(g.get_data_as_white(d, e)).toEqual(undefined);
		expect(g.get_data_as_white(d, f)).toEqual(undefined);

		expect(g.get_data_as_white(e, a)).toEqual(undefined);
		expect(g.get_data_as_white(e, b)).toEqual(undefined);
		expect(g.get_data_as_white(e, c)).toEqual(undefined);
		expect(g.get_data_as_white(e, d)).toEqual(undefined);
		expect(g.get_data_as_white(e, f)).toEqual(undefined);

		expect(g.get_data_as_white(f, a)).toEqual(undefined);
		expect(g.get_data_as_white(f, b)).toEqual(undefined);
		expect(g.get_data_as_white(f, c)).toEqual(undefined);
		expect(g.get_data_as_white(f, d)).toEqual(undefined);
		expect(g.get_data_as_white(f, e)).toEqual(undefined);

		// black

		expect(g.get_data_as_black(a, b)).toEqual(new EdgeMetadata(0, 0, 1));
		expect(g.get_data_as_black(a, c)).toEqual(undefined);
		expect(g.get_data_as_black(a, d)).toEqual(undefined);
		expect(g.get_data_as_black(a, e)).toEqual(undefined);
		expect(g.get_data_as_black(a, f)).toEqual(undefined);

		expect(g.get_data_as_black(b, a)).toEqual(undefined);
		expect(g.get_data_as_black(b, c)).toEqual(undefined);
		expect(g.get_data_as_black(b, d)).toEqual(undefined);
		expect(g.get_data_as_black(b, e)).toEqual(undefined);
		expect(g.get_data_as_black(b, f)).toEqual(undefined);

		expect(g.get_data_as_black(c, a)).toEqual(undefined);
		expect(g.get_data_as_black(c, b)).toEqual(undefined);
		expect(g.get_data_as_black(c, d)).toEqual(undefined);
		expect(g.get_data_as_black(c, e)).toEqual(undefined);
		expect(g.get_data_as_black(c, f)).toEqual(undefined);

		expect(g.get_data_as_black(d, a)).toEqual(undefined);
		expect(g.get_data_as_black(d, b)).toEqual(undefined);
		expect(g.get_data_as_black(d, c)).toEqual(undefined);
		expect(g.get_data_as_black(d, e)).toEqual(undefined);
		expect(g.get_data_as_black(d, f)).toEqual(undefined);

		expect(g.get_data_as_black(e, a)).toEqual(undefined);
		expect(g.get_data_as_black(e, b)).toEqual(undefined);
		expect(g.get_data_as_black(e, c)).toEqual(undefined);
		expect(g.get_data_as_black(e, d)).toEqual(undefined);
		expect(g.get_data_as_black(e, f)).toEqual(undefined);

		expect(g.get_data_as_black(f, a)).toEqual(undefined);
		expect(g.get_data_as_black(f, b)).toEqual(undefined);
		expect(g.get_data_as_black(f, c)).toEqual(undefined);
		expect(g.get_data_as_black(f, d)).toEqual(undefined);
		expect(g.get_data_as_black(f, e)).toEqual(undefined);

		const blitz_dir = EnvironmentManager.get_instance().get_dir_graphs_time_control(Blitz);
		expect(fs.existsSync(path.join(blitz_dir, 'a'))).toBe(false);
		expect(fs.existsSync(path.join(blitz_dir, 'b'))).toBe(true);
		expect(fs.existsSync(path.join(blitz_dir, 'c'))).toBe(false);
		expect(fs.existsSync(path.join(blitz_dir, 'e'))).toBe(false);
	});

	test('Delete game 0000000005', () => {
		expect(() => game_delete(id0000000005)).not.toThrow();

		let man = GamesManager.get_instance();
		expect(man.game_exists(id0000000001)).toBe(false);
		expect(man.game_exists(id0000000002)).toBe(false);
		expect(man.game_exists(id0000000003)).toBe(false);
		expect(man.game_exists(id0000000004)).toBe(false);
		expect(man.game_exists(id0000000005)).toBe(false);

		expect(aU.get_games(Blitz).length).toBe(0);
		expect(bU.get_games(Blitz).length).toBe(0);
		expect(cU.get_games(Blitz).length).toBe(0);
		expect(dU.get_games(Blitz).length).toBe(0);
		expect(eU.get_games(Blitz).length).toBe(0);
		expect(fU.get_games(Blitz).length).toBe(0);

		expect(aU.get_rating(Blitz).num_won_drawn_lost()).toEqual([0, 0, 0, 0]);
		expect(bU.get_rating(Blitz).num_won_drawn_lost()).toEqual([0, 0, 0, 0]);
		expect(cU.get_rating(Blitz).num_won_drawn_lost()).toEqual([0, 0, 0, 0]);
		expect(dU.get_rating(Blitz).num_won_drawn_lost()).toEqual([0, 0, 0, 0]);
		expect(eU.get_rating(Blitz).num_won_drawn_lost()).toEqual([0, 0, 0, 0]);
		expect(fU.get_rating(Blitz).num_won_drawn_lost()).toEqual([0, 0, 0, 0]);

		const blitz_dir = EnvironmentManager.get_instance().get_dir_games_time_control(Blitz);
		expect(fs.existsSync(path.join(blitz_dir, '2025-01-19'))).toBe(false);
	});

	test('Check "Blitz" graph', () => {
		const graphs_manager = GraphsManager.get_instance();
		const g = graphs_manager.get_graph(Blitz) as Graph;

		// white

		expect(g.get_data_as_white(a, b)).toEqual(undefined);
		expect(g.get_data_as_white(a, c)).toEqual(undefined);
		expect(g.get_data_as_white(a, d)).toEqual(undefined);
		expect(g.get_data_as_white(a, e)).toEqual(undefined);
		expect(g.get_data_as_white(a, f)).toEqual(undefined);

		expect(g.get_data_as_white(b, a)).toEqual(undefined);
		expect(g.get_data_as_white(b, c)).toEqual(undefined);
		expect(g.get_data_as_white(b, d)).toEqual(undefined);
		expect(g.get_data_as_white(b, e)).toEqual(undefined);
		expect(g.get_data_as_white(b, f)).toEqual(undefined);

		expect(g.get_data_as_white(c, a)).toEqual(undefined);
		expect(g.get_data_as_white(c, b)).toEqual(undefined);
		expect(g.get_data_as_white(c, d)).toEqual(undefined);
		expect(g.get_data_as_white(c, e)).toEqual(undefined);
		expect(g.get_data_as_white(c, f)).toEqual(undefined);

		expect(g.get_data_as_white(d, a)).toEqual(undefined);
		expect(g.get_data_as_white(d, b)).toEqual(undefined);
		expect(g.get_data_as_white(d, c)).toEqual(undefined);
		expect(g.get_data_as_white(d, e)).toEqual(undefined);
		expect(g.get_data_as_white(d, f)).toEqual(undefined);

		expect(g.get_data_as_white(e, a)).toEqual(undefined);
		expect(g.get_data_as_white(e, b)).toEqual(undefined);
		expect(g.get_data_as_white(e, c)).toEqual(undefined);
		expect(g.get_data_as_white(e, d)).toEqual(undefined);
		expect(g.get_data_as_white(e, f)).toEqual(undefined);

		expect(g.get_data_as_white(f, a)).toEqual(undefined);
		expect(g.get_data_as_white(f, b)).toEqual(undefined);
		expect(g.get_data_as_white(f, c)).toEqual(undefined);
		expect(g.get_data_as_white(f, d)).toEqual(undefined);
		expect(g.get_data_as_white(f, e)).toEqual(undefined);

		// black

		expect(g.get_data_as_black(a, b)).toEqual(undefined);
		expect(g.get_data_as_black(a, c)).toEqual(undefined);
		expect(g.get_data_as_black(a, d)).toEqual(undefined);
		expect(g.get_data_as_black(a, e)).toEqual(undefined);
		expect(g.get_data_as_black(a, f)).toEqual(undefined);

		expect(g.get_data_as_black(b, a)).toEqual(undefined);
		expect(g.get_data_as_black(b, c)).toEqual(undefined);
		expect(g.get_data_as_black(b, d)).toEqual(undefined);
		expect(g.get_data_as_black(b, e)).toEqual(undefined);
		expect(g.get_data_as_black(b, f)).toEqual(undefined);

		expect(g.get_data_as_black(c, a)).toEqual(undefined);
		expect(g.get_data_as_black(c, b)).toEqual(undefined);
		expect(g.get_data_as_black(c, d)).toEqual(undefined);
		expect(g.get_data_as_black(c, e)).toEqual(undefined);
		expect(g.get_data_as_black(c, f)).toEqual(undefined);

		expect(g.get_data_as_black(d, a)).toEqual(undefined);
		expect(g.get_data_as_black(d, b)).toEqual(undefined);
		expect(g.get_data_as_black(d, c)).toEqual(undefined);
		expect(g.get_data_as_black(d, e)).toEqual(undefined);
		expect(g.get_data_as_black(d, f)).toEqual(undefined);

		expect(g.get_data_as_black(e, a)).toEqual(undefined);
		expect(g.get_data_as_black(e, b)).toEqual(undefined);
		expect(g.get_data_as_black(e, c)).toEqual(undefined);
		expect(g.get_data_as_black(e, d)).toEqual(undefined);
		expect(g.get_data_as_black(e, f)).toEqual(undefined);

		expect(g.get_data_as_black(f, a)).toEqual(undefined);
		expect(g.get_data_as_black(f, b)).toEqual(undefined);
		expect(g.get_data_as_black(f, c)).toEqual(undefined);
		expect(g.get_data_as_black(f, d)).toEqual(undefined);
		expect(g.get_data_as_black(f, e)).toEqual(undefined);

		const blitz_dir = EnvironmentManager.get_instance().get_dir_graphs_time_control(Blitz);
		expect(fs.existsSync(path.join(blitz_dir, 'a'))).toBe(false);
		expect(fs.existsSync(path.join(blitz_dir, 'b'))).toBe(false);
		expect(fs.existsSync(path.join(blitz_dir, 'c'))).toBe(false);
		expect(fs.existsSync(path.join(blitz_dir, 'e'))).toBe(false);
	});
});
