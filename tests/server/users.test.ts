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

import { server_init_from_data } from '../../ts-server/server/initialization';
import {
	user_add_new,
	user_exists,
	user_get_all,
	user_get_all_names_and_usernames,
	user_retrieve
} from '../../ts-server/server/users';
import { user_from_json } from '../../ts-server/models/user';
import { ADMIN, TEACHER } from '../../ts-server/models/user_role';
import { clear_server } from '../../ts-server/server/clear';
import { run_command } from './exec_utils';

const webpage_dir = 'tests/webpage';
const db_dir = path.join(webpage_dir, 'database');
const db_users_dir = path.join(db_dir, 'users');

const configuration = {
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
		admin: ['challenge_user', 'challenge_admin', 'challenge_member', 'challenge_teacher', 'challenge_student'],
		teacher: ['challenge_user', 'challenge_admin', 'challenge_member', 'challenge_teacher', 'challenge_student'],
		member: ['challenge_user', 'challenge_admin', 'challenge_member', 'challenge_teacher', 'challenge_student'],
		student: ['challenge_user', 'challenge_admin', 'challenge_member', 'challenge_teacher', 'challenge_student']
	}
};

const configuration_bullet = {
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
		admin: ['challenge_user', 'challenge_admin', 'challenge_member', 'challenge_teacher', 'challenge_student'],
		teacher: ['challenge_user', 'challenge_admin', 'challenge_member', 'challenge_teacher', 'challenge_student'],
		member: ['challenge_user', 'challenge_admin', 'challenge_member', 'challenge_teacher', 'challenge_student'],
		student: ['challenge_user', 'challenge_admin', 'challenge_member', 'challenge_teacher', 'challenge_student']
	}
};

describe('Empty server', () => {
	test('Create a user in an empty server', async () => {
		await run_command('./tests/initialize_empty.sh');

		server_init_from_data('tests/webpage/', configuration);

		const u = user_add_new('user.name', 'First', 'Last', 'password', [ADMIN]);

		const user_file = path.join(db_users_dir, 'user.name');
		expect(fs.existsSync(user_file)).toBe(true);

		const u2 = user_from_json(fs.readFileSync(user_file, 'utf8'));
		expect(u).toEqual(u2);

		expect(user_exists('user.name')).toBe(true);

		const all_users = user_get_all();
		expect(all_users.length).toBe(1);
		expect(all_users[0]).toEqual(u);
		expect(all_users[0]).toEqual(u2);
		expect(user_retrieve('user.name')).toEqual(u);
		expect(user_retrieve('user.name')).toEqual(u2);

		expect(user_get_all_names_and_usernames()).toEqual([['First Last', 'user.name']]);
	});

	test('Create a user in an empty server', async () => {
		clear_server();
		server_init_from_data('tests/webpage/', configuration_bullet);

		{
			const user_file = path.join(db_users_dir, 'user.name');
			expect(fs.existsSync(user_file)).toBe(true);

			const all_users = user_get_all();
			expect(all_users.length).toBe(1);
			expect(all_users[0].get_first_name()).toEqual('First');
			expect(all_users[0].get_last_name()).toEqual('Last');
			expect(all_users[0].get_roles()).toEqual([ADMIN]);
			expect(user_get_all_names_and_usernames()).toEqual([['First Last', 'user.name']]);
		}

		{
			const u = user_add_new('user.name2', 'Perico', 'Palotes', 'password', [TEACHER]);

			const user_file = path.join(db_users_dir, 'user.name2');
			expect(fs.existsSync(user_file)).toBe(true);

			const all_users = user_get_all();
			expect(all_users.length).toBe(2);
			expect(all_users[1]).toEqual(u);
			expect(user_get_all_names_and_usernames()).toEqual([
				['First Last', 'user.name'],
				['Perico Palotes', 'user.name2']
			]);
		}
	});
});
