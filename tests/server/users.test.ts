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

import { exec } from 'child_process';
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
import { User, user_from_json } from '../../ts-server/models/user';
import { Password } from '../../ts-server/models/password';
import { ADMIN } from '../../ts-server/models/user_role';
import { encrypt_password_for_user } from '../../ts-server/utils/encrypt';
import { RatingSystem } from '../../ts-server/server/rating_system';

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

describe('Empty server', () => {
	test('Create a single admin user', () => {
		exec('./tests/initialize_empty.sh', (_, __, ___) => {
			server_init_from_data('tests/webpage/', configuration);

			const rating_system = RatingSystem.get_instance();

			const u = (() => {
				const [pass, iv] = encrypt_password_for_user('user.name', 'password');
				let user = new User('user.name', 'First', 'Last', new Password(pass, iv), [ADMIN], [], []);
				const all_time_controls = rating_system.get_time_controls();
				for (let i = 0; i < all_time_controls.length; ++i) {
					if (!user.has_rating(all_time_controls[i].id)) {
						user.add_rating(all_time_controls[i].id, rating_system.get_new_rating());
					}
				}
				return user;
			})();

			user_add_new(u);

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
	});
});
