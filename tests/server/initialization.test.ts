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

import { server_init_from_data } from '../../ts-server/server/initialization';
import { clear_server } from '../../ts-server/server/clear';
import { RatingSystem } from '../../ts-server/server/rating_system';
import { ServerConfiguration, ServerEnvironment } from '../../ts-server/server/environment';
import { ServerChallenges, ServerGames, ServerSessionID, ServerUsers } from '../../ts-server/server/memory';

const webpage_dir = 'tests/webpage';
const icons_dir = path.join(webpage_dir, 'icons');
const ssl_dir = path.join(webpage_dir, 'ssl');
const db_dir = path.join(webpage_dir, 'database');
const db_users_dir = path.join(db_dir, 'users');
const db_challenges_dir = path.join(db_dir, 'challenges');
const db_games_dir = path.join(db_dir, 'games');

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

describe('Configure server', () => {
	test('Load an empty server', () => {
		exec('./tests/initialize_empty.sh', (_, __, ___) => {
			server_init_from_data('tests/webpage', configuration);

			const rating_system = RatingSystem.get_instance();
			const server_users = ServerUsers.get_instance();
			const server_challenges = ServerChallenges.get_instance();
			const server_games = ServerGames.get_instance();
			const server_configuration = ServerConfiguration.get_instance();
			const server_session = ServerSessionID.get_instance();
			const server_environment = ServerEnvironment.get_instance();

			expect(rating_system.get_time_controls().length).toBe(4);
			expect(rating_system.get_unique_time_controls_ids().length).toBe(3);

			expect(server_users.num_users()).toBe(0);

			expect(server_challenges.num_challenges()).toBe(0);

			expect(server_games.get_max_game_id()).toBe(0);

			expect(server_configuration.get_port_http()).toBe('8080');
			expect(server_configuration.get_port_https()).toBe('8443');

			expect(server_session.num_session_ids()).toBe(0);

			expect(server_environment.get_dir_database()).toEqual(db_dir);
			expect(server_environment.get_dir_games()).toEqual(db_games_dir);
			expect(server_environment.get_dir_users()).toEqual(db_users_dir);
			expect(server_environment.get_dir_challenges()).toEqual(db_challenges_dir);

			expect(server_environment.get_dir_ssl()).toEqual(ssl_dir);
			expect(server_environment.get_ssl_public_key_file()).toEqual(path.join(ssl_dir, 'sadf'));
			expect(server_environment.get_ssl_private_key_file()).toEqual(path.join(ssl_dir, 'qwer'));
			expect(server_environment.get_ssl_passphrase_file()).toEqual(path.join(ssl_dir, 'kgj68'));

			expect(server_environment.get_dir_icons()).toEqual(icons_dir);
			expect(server_environment.get_icon_favicon()).toEqual(path.join(icons_dir, 'favicon.png'));
			expect(server_environment.get_icon_login_page()).toEqual(path.join(icons_dir, 'login.png'));
			expect(server_environment.get_icon_home_page()).toEqual(path.join(icons_dir, 'home.png'));

			expect(server_environment.get_title_login_page()).toEqual('Login title');
			expect(server_environment.get_title_home_page()).toEqual('Home title');
		});
	});

	test('Clear the server memory', () => {
		clear_server();

		const rating_system = RatingSystem.get_instance();
		const server_users = ServerUsers.get_instance();
		const server_challenges = ServerChallenges.get_instance();
		const server_games = ServerGames.get_instance();
		const server_configuration = ServerConfiguration.get_instance();
		const server_session = ServerSessionID.get_instance();
		const server_environment = ServerEnvironment.get_instance();

		expect(rating_system.get_time_controls().length).toBe(0);
		expect(rating_system.get_unique_time_controls_ids().length).toBe(0);

		expect(server_users.num_users()).toBe(0);

		expect(server_challenges.num_challenges()).toBe(0);

		expect(server_games.get_max_game_id()).toBe(0);

		expect(server_configuration.get_port_http()).toBe('');
		expect(server_configuration.get_port_https()).toBe('');

		expect(server_session.num_session_ids()).toBe(0);

		expect(server_environment.get_dir_database()).toEqual('');
		expect(server_environment.get_dir_games()).toEqual('');
		expect(server_environment.get_dir_users()).toEqual('');
		expect(server_environment.get_dir_challenges()).toEqual('');

		expect(server_environment.get_dir_ssl()).toEqual('');
		expect(server_environment.get_ssl_public_key_file()).toEqual('');
		expect(server_environment.get_ssl_private_key_file()).toEqual('');
		expect(server_environment.get_ssl_passphrase_file()).toEqual('');

		expect(server_environment.get_dir_icons()).toEqual('');
		expect(server_environment.get_icon_favicon()).toEqual('');
		expect(server_environment.get_icon_login_page()).toEqual('');
		expect(server_environment.get_icon_home_page()).toEqual('');

		expect(server_environment.get_title_login_page()).toEqual('');
		expect(server_environment.get_title_home_page()).toEqual('');
	});
});
