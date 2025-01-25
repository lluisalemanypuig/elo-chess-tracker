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

import { server_init_from_data } from '../../src-server/managers/initialization';
import { clear_server } from '../../src-server/managers/clear';
import { RatingSystemManager } from '../../src-server/managers/rating_system_manager';
import { EnvironmentManager } from '../../src-server/managers/environment_manager';
import { ConfigurationManager } from '../../src-server/managers/configuration_manager';
import { ChallengesManager } from '../../src-server/managers/challenges_manager';
import { GamesManager } from '../../src-server/managers/games_manager';
import { SessionIDManager } from '../../src-server/managers/session_id_manager';
import { UsersManager } from '../../src-server/managers/users_manager';
import { run_command } from './exec_utils';

const webpage_dir = 'tests/webpage';
const icons_dir = path.join(webpage_dir, 'icons');
const ssl_dir = path.join(webpage_dir, 'ssl');
const db_dir = path.join(webpage_dir, 'database');
const db_users_dir = path.join(db_dir, 'users');
const db_challenges_dir = path.join(db_dir, 'challenges');
const db_games_dir = path.join(db_dir, 'games');
const db_games_Classical_dir = path.join(db_games_dir, 'Classical');
const db_games_Rapid_dir = path.join(db_games_dir, 'Rapid');
const db_games_Blitz_dir = path.join(db_games_dir, 'Blitz');

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
	test('Load an empty server', async () => {
		await run_command('./tests/initialize_empty.sh');
		expect(() => server_init_from_data('tests/webpage', configuration)).not.toThrow();
	});

	test('Check RatingSystemManager', () => {
		const rating_system_manager = RatingSystemManager.get_instance();

		expect(rating_system_manager.is_time_control_id_valid('Classical')).toBe(true);
		expect(rating_system_manager.is_time_control_id_valid('classical')).toBe(false);
		expect(rating_system_manager.is_time_control_id_valid('Rapid')).toBe(true);
		expect(rating_system_manager.is_time_control_id_valid('rapid')).toBe(false);
		expect(rating_system_manager.is_time_control_id_valid('Blitz')).toBe(true);
		expect(rating_system_manager.is_time_control_id_valid('blitz')).toBe(false);

		const unique_ids = rating_system_manager.get_unique_time_controls_ids();
		expect(
			unique_ids.find((val: string): boolean => {
				return val == 'Rapid';
			})
		).toEqual('Rapid');

		expect(
			unique_ids.find((val: string): boolean => {
				return val == 'Blitz';
			})
		).toEqual('Blitz');

		expect(rating_system_manager.get_time_controls().length).toBe(4);
		expect(rating_system_manager.get_unique_time_controls_ids().length).toBe(3);
	});

	test('Check UsersManager', () => {
		const users_manager = UsersManager.get_instance();
		expect(users_manager.num_users()).toBe(0);
	});

	test('Check ChallengesManager', () => {
		const challenges_manager = ChallengesManager.get_instance();
		expect(challenges_manager.num_challenges()).toBe(0);
	});

	test('Check GamesManager', () => {
		const games_manager = GamesManager.get_instance();
		expect(games_manager.get_max_game_id()).toBe('0000000000');
	});

	test('Check ConfigurationManager', () => {
		const configuration_manager = ConfigurationManager.get_instance();
		expect(configuration_manager.get_port_http()).toBe('8080');
		expect(configuration_manager.get_port_https()).toBe('8443');
	});

	test('Check SessionIDManager', () => {
		const session_manager = SessionIDManager.get_instance();
		expect(session_manager.num_session_ids()).toBe(0);
	});

	test('Check Environmentmanager', () => {
		const environment_manager = EnvironmentManager.get_instance();

		expect(environment_manager.get_dir_database()).toEqual(db_dir);
		expect(environment_manager.get_dir_games()).toEqual(db_games_dir);
		expect(environment_manager.get_dir_games_time_control('Classical')).toEqual(db_games_Classical_dir);
		expect(environment_manager.get_dir_games_time_control('Rapid')).toEqual(db_games_Rapid_dir);
		expect(environment_manager.get_dir_games_time_control('Blitz')).toEqual(db_games_Blitz_dir);
		expect(environment_manager.get_dir_users()).toEqual(db_users_dir);
		expect(environment_manager.get_dir_challenges()).toEqual(db_challenges_dir);

		expect(fs.existsSync(db_games_Classical_dir)).toBe(true);
		expect(fs.existsSync(db_games_Rapid_dir)).toBe(true);
		expect(fs.existsSync(db_games_Blitz_dir)).toBe(true);

		expect(environment_manager.get_dir_ssl()).toEqual(ssl_dir);
		expect(environment_manager.get_ssl_public_key_file()).toEqual(path.join(ssl_dir, 'sadf'));
		expect(environment_manager.get_ssl_private_key_file()).toEqual(path.join(ssl_dir, 'qwer'));
		expect(environment_manager.get_ssl_passphrase_file()).toEqual(path.join(ssl_dir, 'kgj68'));

		expect(environment_manager.get_dir_icons()).toEqual(icons_dir);
		expect(environment_manager.get_icon_favicon()).toEqual(path.join(icons_dir, 'favicon.png'));
		expect(environment_manager.get_icon_login_page()).toEqual(path.join(icons_dir, 'login.png'));
		expect(environment_manager.get_icon_home_page()).toEqual(path.join(icons_dir, 'home.png'));

		expect(environment_manager.get_title_login_page()).toEqual('Login title');
		expect(environment_manager.get_title_home_page()).toEqual('Home title');
	});

	test('Clear the server memory', () => {
		expect(() => clear_server()).not.toThrow();
	});

	test('Check RatingSystemManager', () => {
		const rating_system_manager = RatingSystemManager.get_instance();

		expect(rating_system_manager.is_time_control_id_valid('Classical')).toBe(false);
		expect(rating_system_manager.is_time_control_id_valid('classical')).toBe(false);
		expect(rating_system_manager.is_time_control_id_valid('Rapid')).toBe(false);
		expect(rating_system_manager.is_time_control_id_valid('rapid')).toBe(false);
		expect(rating_system_manager.is_time_control_id_valid('Blitz')).toBe(false);
		expect(rating_system_manager.is_time_control_id_valid('blitz')).toBe(false);

		const unique_ids = rating_system_manager.get_unique_time_controls_ids();
		expect(
			unique_ids.find((val: string): boolean => {
				return val == 'Rapid';
			})
		).toEqual(undefined);

		expect(
			unique_ids.find((val: string): boolean => {
				return val == 'Blitz';
			})
		).toEqual(undefined);

		expect(rating_system_manager.get_time_controls().length).toBe(0);
		expect(rating_system_manager.get_unique_time_controls_ids().length).toBe(0);
	});

	test('Check UsersManager', () => {
		const users_manager = UsersManager.get_instance();
		expect(users_manager.num_users()).toBe(0);
	});

	test('Check ChallengesManager', () => {
		const challenges_manager = ChallengesManager.get_instance();
		expect(challenges_manager.num_challenges()).toBe(0);
	});

	test('Check GamesManager', () => {
		const games_manager = GamesManager.get_instance();
		expect(games_manager.get_max_game_id()).toBe('0000000000');
	});

	test('Check ConfigurationManager', () => {
		const configuration_manager = ConfigurationManager.get_instance();
		expect(configuration_manager.get_port_http()).toBe('');
		expect(configuration_manager.get_port_https()).toBe('');
	});

	test('Check SessionIDManager', () => {
		const session_manager = SessionIDManager.get_instance();
		expect(session_manager.num_session_ids()).toBe(0);
	});

	test('Check Environmentmanager', () => {
		const environment_manager = EnvironmentManager.get_instance();

		expect(environment_manager.get_dir_database()).toEqual('');
		expect(environment_manager.get_dir_games()).toEqual('');
		expect(environment_manager.get_dir_users()).toEqual('');
		expect(environment_manager.get_dir_challenges()).toEqual('');

		expect(environment_manager.get_dir_ssl()).toEqual('');
		expect(environment_manager.get_ssl_public_key_file()).toEqual('');
		expect(environment_manager.get_ssl_private_key_file()).toEqual('');
		expect(environment_manager.get_ssl_passphrase_file()).toEqual('');

		expect(environment_manager.get_dir_icons()).toEqual('');
		expect(environment_manager.get_icon_favicon()).toEqual('');
		expect(environment_manager.get_icon_login_page()).toEqual('');
		expect(environment_manager.get_icon_home_page()).toEqual('');

		expect(environment_manager.get_title_login_page()).toEqual('');
		expect(environment_manager.get_title_home_page()).toEqual('');
	});
});
