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

import path from 'path';
import fs from 'fs';

import { server_init_from_data } from '../../src-server/managers/initialization';
import {
	user_add_new,
	user_get_all__name_randid,
	user_rename_and_reassign_roles,
	user_update_from_players_data
} from '../../src-server/managers/users';
import { User } from '../../src-server/models/user';
import { ADMIN, MEMBER, STUDENT, TEACHER } from '../../src-server/models/user_role';
import { clear_server } from '../../src-server/managers/clear';
import { run_command } from './exec_utils';
import { Player } from '../../src-server/models/player';
import { TimeControlRating } from '../../src-server/models/time_control_rating';
import { EloRating } from '../../src-server/rating_framework/Elo/rating';
import { user_from_json } from '../../src-server/io/user';
import { UsersManager } from '../../src-server/managers/users_manager';

const webpage_dir = 'tests/webpage';
const db_dir = path.join(webpage_dir, 'database');
const db_users_dir = path.join(db_dir, 'users');

const classical_rapid_blitz = {
	ssl_certificate: {
		public_key_file: '',
		private_key_file: '',
		passphrase_file: ''
	},
	ports: {
		http: '',
		https: ''
	},
	favicon: '',
	login_page: {
		title: '',
		icon: ''
	},
	home_page: {
		title: '',
		icon: ''
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

const classical_rapid_blitz_bullet = {
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
		},
		{
			id: 'Bulet',
			name: 'Bullet (2 + 1)'
		}
	],
	permissions: {
		admin: [],
		teacher: [],
		member: [],
		student: []
	}
};

const classical = {
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
		}
	],
	permissions: {
		admin: [],
		teacher: [],
		member: [],
		student: []
	}
};

function user_exists(username: string): boolean {
	return UsersManager.get_instance().exists(username);
}

function user_retrieve(username: string): User | undefined {
	return UsersManager.get_instance().get_user_by_username(username);
}

function user_get_all(): User[] {
	return UsersManager.get_instance().all();
}

describe('Create users', () => {
	test('In an empty server', async () => {
		await run_command('./tests/initialize_empty.sh');
		clear_server();
		server_init_from_data('tests/webpage/', classical_rapid_blitz);

		const new_user = user_add_new('asdf', 'First', 'Last', 'password', [ADMIN]);

		{
			const asdf_user_file = path.join(db_users_dir, 'asdf');
			expect(fs.existsSync(asdf_user_file)).toBe(true);
			const u = user_from_json(fs.readFileSync(asdf_user_file, 'utf8'));
			expect(new_user).toEqual(u);
			expect(u.get_all_ratings().length).toBe(3);
		}

		expect(user_exists('asdf')).toBe(true);

		const all_users = user_get_all();
		expect(all_users.length).toBe(1);
		expect(all_users[0]).toEqual(new_user);
		expect(all_users[0].get_all_ratings().length).toEqual(3);
		expect(user_retrieve('asdf')).toEqual(new_user);

		expect(
			user_get_all__name_randid().map((d: [string, number]): string => {
				return d[0];
			})
		).toEqual(['First Last']);
	});

	test('In a non-empty server with different configuration', async () => {
		clear_server();
		server_init_from_data('tests/webpage/', classical_rapid_blitz_bullet);

		{
			const all_users = user_get_all();
			expect(all_users.length).toBe(1);
			expect(all_users[0].get_first_name()).toEqual('First');
			expect(all_users[0].get_last_name()).toEqual('Last');
			expect(all_users[0].get_roles()).toEqual([ADMIN]);
			expect(all_users[0].get_all_ratings().length).toBe(4);
			expect(
				user_get_all__name_randid().map((d: [string, number]): string => {
					return d[0];
				})
			).toEqual(['First Last']);

			// check that the user file was updated with the new rating
			const asdf_user_file = path.join(db_users_dir, 'asdf');
			expect(fs.existsSync(asdf_user_file)).toBe(true);
			const u = user_from_json(fs.readFileSync(asdf_user_file, 'utf8'));
			expect(u.get_all_ratings().length).toBe(4);
		}

		const new_user = user_add_new('qwer', 'Perico', 'Palotes', 'password', [TEACHER]);

		const qwer_user_file = path.join(db_users_dir, 'qwer');
		expect(fs.existsSync(qwer_user_file)).toBe(true);
		const u = user_from_json(fs.readFileSync(qwer_user_file, 'utf8'));
		expect(u.get_all_ratings().length).toBe(4);

		expect(user_retrieve('qwer')).toEqual(new_user);

		const all_users = user_get_all();

		expect(all_users.length).toBe(2);
		expect(all_users[1]).toEqual(new_user);
		expect(
			user_get_all__name_randid().map((d: [string, number]): string => {
				return d[0];
			})
		).toEqual(['First Last', 'Perico Palotes']);

		expect(
			all_users
				.map((u: User): boolean => {
					return u.get_all_ratings().length == 4;
				})
				.reduce((pre: boolean, cur: boolean): boolean => {
					return pre && cur;
				}, true)
		).toEqual(true);

		expect(user_exists('asdf')).toBe(true);
		expect(user_exists('qwer')).toBe(true);
	});

	test('Check users with extra ratings', async () => {
		clear_server();
		server_init_from_data('tests/webpage/', classical);

		const all_users = user_get_all();

		expect(
			all_users
				.map((u: User): boolean => {
					return u.get_all_ratings().length == 4;
				})
				.reduce((pre: boolean, cur: boolean): boolean => {
					return pre && cur;
				}, true)
		).toEqual(true);

		expect(user_exists('asdf')).toBe(true);
		expect(user_exists('qwer')).toBe(true);
	});
});

describe('Modify existing users', () => {
	test('Newly created user', async () => {
		await run_command('./tests/initialize_empty.sh');

		clear_server();
		server_init_from_data('tests/webpage/', classical_rapid_blitz);

		const new_user = user_add_new('asdf', 'First', 'Last', 'password', [ADMIN]);

		const asdf_user_file = path.join(db_users_dir, 'asdf');

		{
			expect(fs.existsSync(asdf_user_file)).toBe(true);
			const u = user_from_json(fs.readFileSync(asdf_user_file, 'utf8'));
			expect(new_user).toEqual(u);
		}

		const modified_user = user_rename_and_reassign_roles('asdf', 'QQQ', 'WWW', [TEACHER]);

		expect(user_retrieve('asdf')).toEqual(modified_user);
		expect(user_exists('asdf')).toBe(true);
		expect(
			user_get_all__name_randid().map((d: [string, number]): string => {
				return d[0];
			})
		).toEqual(['QQQ WWW']);

		{
			expect(fs.existsSync(asdf_user_file)).toBe(true);
			const u = user_from_json(fs.readFileSync(asdf_user_file, 'utf8'));
			expect(modified_user).toEqual(u);
			expect(u.get_first_name()).toEqual('QQQ');
			expect(u.get_last_name()).toEqual('WWW');
			expect(u.get_roles()).toEqual([TEACHER]);
		}
	});

	test('Already existing user', () => {
		clear_server();
		server_init_from_data('tests/webpage/', classical_rapid_blitz);

		const modified_user = user_rename_and_reassign_roles('asdf', 'FFF', 'GGG', [ADMIN, MEMBER]);

		const asdf_user_file = path.join(db_users_dir, 'asdf');
		expect(fs.existsSync(asdf_user_file)).toBe(true);
		const u = user_from_json(fs.readFileSync(asdf_user_file, 'utf8'));
		expect(modified_user).toEqual(u);
		expect(u.get_first_name()).toEqual('FFF');
		expect(u.get_last_name()).toEqual('GGG');
		expect(u.get_roles()).toEqual([ADMIN, MEMBER]);

		expect(user_retrieve('asdf')).toEqual(modified_user);
		expect(user_exists('asdf')).toBe(true);
		expect(
			user_get_all__name_randid().map((d: [string, number]): string => {
				return d[0];
			})
		).toEqual(['FFF GGG']);
	});

	test('Modify users in bulk (', () => {
		clear_server();
		server_init_from_data('tests/webpage/', classical_rapid_blitz);

		user_add_new('aa', 'A', 'a', 'pass_a', [ADMIN]);
		user_add_new('bb', 'B', 'b', 'pass_b', [MEMBER]);
		user_add_new('cc', 'C', 'c', 'pass_c', [MEMBER]);
		user_add_new('dd', 'D', 'd', 'pass_d', [STUDENT]);
		user_add_new('ee', 'E', 'e', 'pass_e', [STUDENT]);
		user_add_new('ff', 'F', 'f', 'pass_f', [STUDENT]);

		const aa_Classical = new TimeControlRating('Classical', new EloRating(2000, 10, 10, 0, 0, 40, false));
		const aa_Blitz = new TimeControlRating('Blitz', new EloRating(300, 100, 0, 0, 100, 40, false));
		const aa_Rapid = new TimeControlRating('Rapid', new EloRating(1000, 100, 0, 50, 50, 40, false));
		const rating_aa = [aa_Classical, aa_Blitz, aa_Rapid];

		const bb_Classical = new TimeControlRating('Classical', new EloRating(2500, 2000, 1999, 0, 1, 10, true));
		const bb_Blitz = new TimeControlRating('Blitz', new EloRating(2000, 10, 10, 0, 0, 40, false));
		const bb_Rapid = new TimeControlRating('Rapid', new EloRating(1000, 100, 0, 0, 100, 40, false));
		const rating_bb = [bb_Classical, bb_Blitz, bb_Rapid];

		const cc_Classical = new TimeControlRating('Classical', new EloRating(2000, 10, 10, 0, 0, 40, false));
		const cc_Blitz = new TimeControlRating('Blitz', new EloRating(300, 100, 0, 0, 100, 40, false));
		const cc_Rapid = new TimeControlRating('Rapid', new EloRating(2000, 10, 10, 0, 0, 40, false));
		const rating_cc = [cc_Classical, cc_Blitz, cc_Rapid];

		const dd_Classical = new TimeControlRating('Classical', new EloRating(2500, 2000, 1999, 0, 1, 10, true));
		const dd_Rapid = new TimeControlRating('Rapid', new EloRating(1000, 100, 0, 0, 100, 40, false));
		const rating_dd = [dd_Classical, dd_Rapid];

		const ee_Blitz = new TimeControlRating('Blitz', new EloRating(300, 100, 0, 0, 100, 40, false));
		const ee_Rapid = new TimeControlRating('Rapid', new EloRating(2000, 10, 10, 0, 0, 40, false));
		const rating_ee = [ee_Blitz, ee_Rapid];

		const ff_Classical = new TimeControlRating('Classical', new EloRating(2500, 2000, 1999, 0, 1, 10, true));
		const ff_Blitz = new TimeControlRating('Blitz', new EloRating(2000, 10, 10, 0, 0, 40, false));
		const rating_ff = [ff_Classical, ff_Blitz];

		user_update_from_players_data([
			new Player('aa', rating_aa),
			new Player('bb', rating_bb),
			new Player('cc', rating_cc),
			new Player('dd', rating_dd),
			new Player('ee', rating_ee),
			new Player('ff', rating_ff)
		]);

		const user_aa = user_retrieve('aa') as User;
		expect(user_aa.get_rating('Blitz')).toEqual(aa_Blitz.rating);
		expect(user_aa.get_rating('Classical')).toEqual(aa_Classical.rating);
		expect(user_aa.get_rating('Rapid')).toEqual(aa_Rapid.rating);
		{
			const user_file = path.join(db_users_dir, 'aa');
			expect(fs.existsSync(user_file)).toBe(true);
			const u = user_from_json(fs.readFileSync(user_file, 'utf8'));
			expect(u.get_rating('Blitz')).toEqual(aa_Blitz.rating);
			expect(u.get_rating('Classical')).toEqual(aa_Classical.rating);
			expect(u.get_rating('Rapid')).toEqual(aa_Rapid.rating);
		}

		const user_bb = user_retrieve('bb') as User;
		expect(user_bb.get_rating('Blitz')).toEqual(bb_Blitz.rating);
		expect(user_bb.get_rating('Classical')).toEqual(bb_Classical.rating);
		expect(user_bb.get_rating('Rapid')).toEqual(bb_Rapid.rating);
		{
			const user_file = path.join(db_users_dir, 'bb');
			expect(fs.existsSync(user_file)).toBe(true);
			const u = user_from_json(fs.readFileSync(user_file, 'utf8'));
			expect(u.get_rating('Blitz')).toEqual(bb_Blitz.rating);
			expect(u.get_rating('Classical')).toEqual(bb_Classical.rating);
			expect(u.get_rating('Rapid')).toEqual(bb_Rapid.rating);
		}

		const user_cc = user_retrieve('cc') as User;
		expect(user_cc.get_rating('Blitz')).toEqual(cc_Blitz.rating);
		expect(user_cc.get_rating('Classical')).toEqual(cc_Classical.rating);
		expect(user_cc.get_rating('Rapid')).toEqual(cc_Rapid.rating);
		{
			const user_file = path.join(db_users_dir, 'cc');
			expect(fs.existsSync(user_file)).toBe(true);
			const u = user_from_json(fs.readFileSync(user_file, 'utf8'));
			expect(u.get_rating('Blitz')).toEqual(cc_Blitz.rating);
			expect(u.get_rating('Classical')).toEqual(cc_Classical.rating);
			expect(u.get_rating('Rapid')).toEqual(cc_Rapid.rating);
		}

		const user_dd = user_retrieve('dd') as User;
		expect(user_dd.get_rating('Classical')).toEqual(dd_Classical.rating);
		expect(user_dd.get_rating('Rapid')).toEqual(dd_Rapid.rating);
		{
			const user_file = path.join(db_users_dir, 'dd');
			expect(fs.existsSync(user_file)).toBe(true);
			const u = user_from_json(fs.readFileSync(user_file, 'utf8'));
			expect(u.get_rating('Classical')).toEqual(dd_Classical.rating);
			expect(u.get_rating('Rapid')).toEqual(dd_Rapid.rating);
		}

		const user_ee = user_retrieve('ee') as User;
		expect(user_ee.get_rating('Blitz')).toEqual(ee_Blitz.rating);
		expect(user_ee.get_rating('Rapid')).toEqual(ee_Rapid.rating);
		{
			const user_file = path.join(db_users_dir, 'ee');
			expect(fs.existsSync(user_file)).toBe(true);
			const u = user_from_json(fs.readFileSync(user_file, 'utf8'));
			expect(u.get_rating('Blitz')).toEqual(ee_Blitz.rating);
			expect(u.get_rating('Rapid')).toEqual(ee_Rapid.rating);
		}

		const user_ff = user_retrieve('ff') as User;
		expect(user_ff.get_rating('Blitz')).toEqual(ff_Blitz.rating);
		expect(user_ff.get_rating('Classical')).toEqual(ff_Classical.rating);
		{
			const user_file = path.join(db_users_dir, 'ff');
			expect(fs.existsSync(user_file)).toBe(true);
			const u = user_from_json(fs.readFileSync(user_file, 'utf8'));
			expect(u.get_rating('Blitz')).toEqual(ff_Blitz.rating);
			expect(u.get_rating('Classical')).toEqual(ff_Classical.rating);
		}
	});
});
