/*
Elo rating for a Chess Club
Copyright (C) 2023 - 2024  Lluís Alemany Puig

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

Contact:
	Lluís Alemany Puig
	https://github.com/lluisalemanypuig
*/

import fs from 'fs';
import path from 'path';
import Debug from 'debug';
const debug = Debug('ELO_TRACKER:server_initialization');

import { log_now } from '../utils/misc';
import { ServerMemory } from './memory';
import { ServerConfiguration, ServerEnvironment } from './environment';
import { initialize_rating_time_controls, RatingSystem } from './rating_system';
import { user_from_json } from '../models/user';
import { challenge_from_json } from '../models/challenge';
import { Game, game_set_from_json } from '../models/game';
import { ADMIN, MEMBER, STUDENT, TEACHER } from '../models/user_role';
import { UserRoleToUserAction } from '../models/user_role_action';
import { TimeControl } from '../models/time_control';
import { initialize_rating_formulas } from './rating_system';

function init_directories(base_directory: string): void {
	ServerEnvironment.get_instance().set_database_base_directory(path.join(base_directory, '/database'));
	debug(log_now(), `    Database directory: '${ServerEnvironment.get_instance().get_dir_database()}'`);
	debug(log_now(), `        Games directory: '${ServerEnvironment.get_instance().get_dir_games()}'`);
	debug(log_now(), `        Users directory: '${ServerEnvironment.get_instance().get_dir_users()}'`);
	debug(log_now(), `        Challenges directory: '${ServerEnvironment.get_instance().get_dir_challenges()}'`);
}

function init_SSL_files(base_directory: string, configuration_data: any): void {
	ServerEnvironment.get_instance().set_SSL_info(
		path.join(base_directory, '/ssl'),
		configuration_data.ssl_certificate.public_key_file,
		configuration_data.ssl_certificate.private_key_file,
		configuration_data.ssl_certificate.passphrase_file
	);
	debug(log_now(), `    SSL base directory: '${ServerEnvironment.get_instance().get_dir_ssl()}'`);
	debug(log_now(), `        Public key file: '${ServerEnvironment.get_instance().get_ssl_public_key_file()}'`);
	debug(log_now(), `        Private key file: '${ServerEnvironment.get_instance().get_ssl_private_key_file()}'`);
	debug(log_now(), `        Passphrase: '${ServerEnvironment.get_instance().get_ssl_passphrase_file()}'`);
}

function init_server_ports(configuration_data: any): void {
	let server_configuration = ServerConfiguration.get_instance();
	server_configuration.set_port_http(configuration_data.ports.http);
	server_configuration.set_port_https(configuration_data.ports.https);
}

function init_icon_file_paths(base_directory: string, configuration_data: any): void {
	ServerEnvironment.get_instance().set_icons_info(
		path.join(base_directory, '/icons'),
		'/' + configuration_data.favicon,
		'/' + configuration_data.login_page.icon,
		'/' + configuration_data.home_page.icon
	);
}

function init_page_titles(configuration_data: any): void {
	ServerEnvironment.get_instance().set_titles_info(
		configuration_data.login_page.title,
		configuration_data.home_page.title
	);
}

function init_permissions(permission_data: any): void {
	debug(log_now(), 'Initialize permissions...');

	let actions = UserRoleToUserAction.get_instance();

	// ADMIN
	for (let i = 0; i < permission_data.admin.length; ++i) {
		actions.add_to_role(ADMIN, permission_data.admin[i]);
	}
	// TEACHER
	for (let i = 0; i < permission_data.teacher.length; ++i) {
		actions.add_to_role(TEACHER, permission_data.teacher[i]);
	}
	// MEMBER
	for (let i = 0; i < permission_data.member.length; ++i) {
		actions.add_to_role(MEMBER, permission_data.member[i]);
	}
	// STUDENT
	for (let i = 0; i < permission_data.student.length; ++i) {
		actions.add_to_role(STUDENT, permission_data.student[i]);
	}
}

function init_rating_framework(rating_type: string): void {
	debug(log_now(), `    Rating system: '${rating_type}'`);
	const res = initialize_rating_formulas(rating_type);
	if (!res) {
		debug(log_now(), `Invalid rating system '${rating_type}'`);
	}
}

function init_time_controls(time_control_array: any): void {
	debug(log_now(), 'Initialize time controls...');

	let all_time_controls: TimeControl[] = [];
	for (var time_control in time_control_array) {
		const tc = time_control_array[time_control];
		all_time_controls.push(new TimeControl(tc.id, tc.name));
	}

	debug(log_now(), `    Found '${all_time_controls.length}' rating types:`);
	for (let i = 0; i < all_time_controls.length; ++i) {
		debug(log_now(), `        * Id '${all_time_controls[i].id}'`);
		debug(log_now(), `          Name '${all_time_controls[i].name}'`);
	}

	initialize_rating_time_controls(all_time_controls);
}

function init_sessions(): void {
	debug(log_now(), 'Initialize sessions...');

	let memory = ServerMemory.get_instance();
	// Session ids. Empty
	memory.clear_session_ids();
}

function init_users(): void {
	debug(log_now(), 'Initialize users...');

	let rating_system = RatingSystem.get_instance();
	let memory = ServerMemory.get_instance();
	let dir = ServerEnvironment.get_instance().get_dir_users();

	debug(log_now(), `    Reading directory '${dir}'`);
	let all_user_files = fs.readdirSync(dir);

	for (let i = 0; i < all_user_files.length; ++i) {
		let user_file = path.join(dir, all_user_files[i]);

		debug(log_now(), `        Reading file '${user_file}'`);
		let user_data = fs.readFileSync(user_file, 'utf8');
		let user = user_from_json(user_data);

		// make sure that all users have a rating for every time control
		const all_time_controls = rating_system.get_time_controls();
		for (let i = 0; i < all_time_controls.length; ++i) {
			if (!user.has_rating(all_time_controls[i].id)) {
				user.add_rating(all_time_controls[i].id, rating_system.get_new_rating());
			}
		}

		memory.add_user_index(user, i);
		debug(log_now(), `    User '${user.get_username()}' is at index '${i}'`);
	}
	debug(log_now(), `    Found ${memory.num_users()} users.`);
}

function init_challenges(): void {
	debug(log_now(), 'Initialize challenges...');

	let memory = ServerMemory.get_instance();
	let dir = ServerEnvironment.get_instance().get_dir_challenges();

	debug(log_now(), `    Reading directory '${dir}'`);
	let all_challenges_files = fs.readdirSync(dir);

	for (let i = 0; i < all_challenges_files.length; ++i) {
		let challenge_file = path.join(dir, all_challenges_files[i]);

		debug(log_now(), `        Reading file '${challenge_file}'`);
		let challenge_data = fs.readFileSync(challenge_file, 'utf8');

		memory.add_challenge(challenge_from_json(challenge_data));
	}
	debug(log_now(), `    Found ${memory.num_challenges()} challenges.`);
}

function init_games(): void {
	debug(log_now(), 'Initialize games...');

	let mem = ServerMemory.get_instance();
	const dir = ServerEnvironment.get_instance().get_dir_games();
	let num_games: number = 0;
	let max_game_id: number = 0;

	debug(log_now(), `    Reading directory '${dir}'`);
	let all_date_record_files = fs.readdirSync(dir);

	for (let i = 0; i < all_date_record_files.length; ++i) {
		const game_record_file = path.join(dir, all_date_record_files[i]);

		debug(log_now(), `        Reading file '${game_record_file}'`);
		const game_record_data = fs.readFileSync(game_record_file, 'utf8');
		const game_set = game_set_from_json(game_record_data);

		for (let j = 0; j < game_set.length; ++j) {
			const g = game_set[j] as Game;
			const game_id = parseInt(g.get_id(), 10);
			max_game_id = max_game_id < game_id ? game_id : max_game_id;

			mem.set_game_id_record_date(g.get_id(), all_date_record_files[i]);
		}

		num_games += game_set.length;
	}

	mem.set_max_game_id(max_game_id);

	debug(log_now(), `    Found ${num_games} games.`);
	debug(log_now(), `    Maximum game id ${max_game_id}.`);
}

export function server_init_from_data(base_directory: string, configuration_data: any): void {
	debug(log_now(), `    Base directory: '${base_directory}'`);

	init_directories(base_directory);
	init_SSL_files(base_directory, configuration_data);
	init_server_ports(configuration_data);
	init_icon_file_paths(base_directory, configuration_data);
	init_page_titles(configuration_data);
	init_permissions(configuration_data.permissions);
	init_rating_framework(configuration_data.rating_system);
	init_time_controls(configuration_data.time_controls);

	init_sessions();
	init_users();
	init_challenges();
	init_games();
}

/// Initializes the server memory
export function server_init_from_configuration_file(configuration_file: string): void {
	debug(log_now(), `Reading configuration file '${configuration_file}'`);

	const data = fs.readFileSync(configuration_file, 'utf8');
	const json_data = JSON.parse(data);

	const base_path = configuration_file.substring(0, configuration_file.lastIndexOf('/'));
	server_init_from_data(base_path, json_data);
}

export function server_init_from_parameters(args: string[]): void {
	let configuration_file: string = '';
	for (let i = 0; i < args.length; ++i) {
		if (args[i] == 'configuration-file') {
			configuration_file = args[i + 1];
			++i;
		} else {
			debug(log_now(), "Error: invalid option '" + configuration_file + "'.");
		}
	}

	if (configuration_file == '') {
		debug(log_now(), 'Error: configuration file parameter is missing');
		return;
	}

	server_init_from_configuration_file(configuration_file);
}
