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
import Debug from 'debug';
const debug = Debug('ELO_TRACKER:server_initialization');

import { log_now } from '../utils/misc';
import { ServerChallenges, ServerGames, ServerUsers, ServerSessionID } from './memory';
import { ServerConfiguration, ServerEnvironment } from './environment';
import { initialize_rating_time_controls, RatingSystem } from './rating_system';
import { user_from_json } from '../models/user';
import { challenge_from_json } from '../models/challenge';
import { Game, game_set_from_json } from '../models/game';
import { initialize_permissions } from '../models/user_role_action';
import { TimeControl } from '../models/time_control';
import { initialize_rating_functions } from './rating_system';

function init_directories(base_directory: string): void {
	let server_env = ServerEnvironment.get_instance();
	server_env.set_database_base_directory(path.join(base_directory, '/database'));
	debug(log_now(), `    Database directory: '${server_env.get_dir_database()}'`);
	debug(log_now(), `        Games directory: '${server_env.get_dir_games()}'`);
	debug(log_now(), `        Users directory: '${server_env.get_dir_users()}'`);
	debug(log_now(), `        Challenges directory: '${server_env.get_dir_challenges()}'`);
}

function init_SSL_files(base_directory: string, configuration_data: any): void {
	let env = ServerEnvironment.get_instance();
	env.set_SSL_info(
		path.join(base_directory, '/ssl'),
		configuration_data.ssl_certificate.public_key_file,
		configuration_data.ssl_certificate.private_key_file,
		configuration_data.ssl_certificate.passphrase_file
	);
	debug(log_now(), `    SSL base directory: '${env.get_dir_ssl()}'`);
	debug(log_now(), `        Public key file: '${env.get_ssl_public_key_file()}'`);
	debug(log_now(), `        Private key file: '${env.get_ssl_private_key_file()}'`);
	debug(log_now(), `        Passphrase: '${env.get_ssl_passphrase_file()}'`);
}

function init_server_ports(configuration_data: any): void {
	let server_conf = ServerConfiguration.get_instance();
	server_conf.set_port_http(configuration_data.ports.http);
	server_conf.set_port_https(configuration_data.ports.https);
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

	initialize_permissions(permission_data);
}

function init_rating_framework(rating_type: string): void {
	debug(log_now(), `    Rating system: '${rating_type}'`);
	const res = initialize_rating_functions(rating_type);
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

	ServerSessionID.get_instance().clear_session_ids();
}

function init_users(): void {
	debug(log_now(), 'Initialize users...');

	const rating_system = RatingSystem.get_instance();
	const users_dir = ServerEnvironment.get_instance().get_dir_users();
	let memory = ServerUsers.get_instance();

	debug(log_now(), `    Reading directory '${users_dir}'`);
	const all_user_files = fs.readdirSync(users_dir);

	for (let i = 0; i < all_user_files.length; ++i) {
		const user_file = path.join(users_dir, all_user_files[i]);

		debug(log_now(), `        Reading file '${user_file}'`);
		const user_data = fs.readFileSync(user_file, 'utf8');
		let user = user_from_json(user_data);

		// maybe the file the user was read from has to be updated
		let update_user_file: boolean = false;
		// make sure that all users have a rating for every time control
		const all_time_controls = rating_system.get_time_controls();
		for (let i = 0; i < all_time_controls.length; ++i) {
			if (!user.has_rating(all_time_controls[i].id)) {
				user.add_rating(all_time_controls[i].id, rating_system.get_new_rating());
				update_user_file = true;
			}
		}

		memory.add_user_index(user, i);
		if (update_user_file) {
			fs.writeFileSync(user_file, JSON.stringify(user, null, 4));
		}
		debug(log_now(), `    User '${user.get_username()}' is at index '${i}'`);
	}
	debug(log_now(), `    Found ${memory.num_users()} users.`);
}

function init_challenges(): void {
	debug(log_now(), 'Initialize challenges...');

	const challenges_dir = ServerEnvironment.get_instance().get_dir_challenges();
	let challenges = ServerChallenges.get_instance();

	debug(log_now(), `    Reading directory '${challenges_dir}'`);
	const all_challenges_files = fs.readdirSync(challenges_dir);

	for (let i = 0; i < all_challenges_files.length; ++i) {
		const challenge_file = path.join(challenges_dir, all_challenges_files[i]);

		debug(log_now(), `        Reading file '${challenge_file}'`);
		const challenge_data = fs.readFileSync(challenge_file, 'utf8');
		challenges.add_challenge(challenge_from_json(challenge_data));
	}
	debug(log_now(), `    Found ${challenges.num_challenges()} challenges.`);
}

function init_games(): void {
	debug(log_now(), 'Initialize games...');

	const games_dir = ServerEnvironment.get_instance().get_dir_games();
	let games = ServerGames.get_instance();
	let num_games: number = 0;
	let max_game_id: number = 0;

	debug(log_now(), `    Reading directory '${games_dir}'`);
	const all_date_record_files = fs.readdirSync(games_dir);

	for (let i = 0; i < all_date_record_files.length; ++i) {
		const game_record_file = path.join(games_dir, all_date_record_files[i]);

		debug(log_now(), `        Reading file '${game_record_file}'`);
		const game_record_data = fs.readFileSync(game_record_file, 'utf8');
		const game_set = game_set_from_json(game_record_data);

		for (let j = 0; j < game_set.length; ++j) {
			const g = game_set[j] as Game;
			const game_id = parseInt(g.get_id(), 10);
			max_game_id = max_game_id < game_id ? game_id : max_game_id;

			games.set_game_id_record_date(g.get_id(), all_date_record_files[i]);
		}

		num_games += game_set.length;
	}

	games.set_max_game_id(max_game_id);

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
