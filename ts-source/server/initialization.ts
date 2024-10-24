/*
Elo rating for a Chess Club
Copyright (C) 2023  Lluís Alemany Puig

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
import { ServerMemory, ServerDirectories, RatingSystem } from "./configuration";
import { user_from_json } from '../models/user';
import { challenge_from_json } from '../models/challenge';
import { Game, game_set_from_json } from '../models/game';
import { ADMIN, MEMBER, STUDENT, TEACHER } from '../models/user_role';
import { UserRoleToUserAction } from '../models/user_role_action';
import { TimeControl } from '../models/time_control';

import { player_vs_player as Elo } from '../rating_system/Elo/formula';
import { Elo_rating_from_json, Elo_rating_set_from_json, Elo_rating_new } from '../rating_system/Elo/rating';

function initialize_sessions(): void {
	debug(log_now(), "Initialize sessions...");

	let memory = ServerMemory.get_instance();
	// Session ids. Empty
	memory.session_ids = [];
}

function initialize_users(): void {
	debug(log_now(), "Initialize users...");

	let rating_system = RatingSystem.get_instance();
	let memory = ServerMemory.get_instance();
	let dir = ServerDirectories.get_instance().users_directory;

	debug(log_now(), `    Reading directory '${dir}'`);
	let all_user_files = fs.readdirSync(dir);

	for (let i = 0; i < all_user_files.length; ++i) {
		let user_file = path.join(dir, all_user_files[i]);

		debug(log_now(), `        Reading file '${user_file}'`);
		let user_data = fs.readFileSync(user_file, 'utf8');
		let user = user_from_json(user_data);

		// make sure that all users have a rating for every time control
		for (let i = 0; i < rating_system.all_time_controls.length; ++i) {
			if (! user.has_rating(rating_system.all_time_controls[i].id)) {
				user.add_rating(
					rating_system.all_time_controls[i].id,
					rating_system.new_rating()
				);
			}
		}

		memory.users.push(user);
		memory.user_to_index.set(user.get_username(), i);
		debug(log_now(), `    User '${user.get_username()}' is at index '${i}'`);
	}
	debug(log_now(), `    Found ${memory.users.length} users.`);
}

function initialize_challenges(): void {
	debug(log_now(), "Initialize challenges...");

	let memory = ServerMemory.get_instance();
	let dir = ServerDirectories.get_instance().challenges_directory;

	debug(log_now(), `    Reading directory '${dir}'`);
	let all_challenges_files = fs.readdirSync(dir);

	for (let i = 0; i < all_challenges_files.length; ++i) {
		let challenge_file = path.join(dir, all_challenges_files[i]);

		debug(log_now(), `        Reading file '${challenge_file}'`);
		let challenge_data = fs.readFileSync(challenge_file, 'utf8');

		memory.challenges.push(challenge_from_json(challenge_data));
	}
	debug(log_now(), `    Found ${memory.challenges.length} challenges.`);
}

function initialize_games(): void {
	debug(log_now(), "Initialize games...");

	let memory = ServerMemory.get_instance();
	const dir = ServerDirectories.get_instance().games_directory;
	let num_games: number = 0;
	let max_game_id: number = 0;

	debug(log_now(), `    Reading directory '${dir}'`);
	let all_game_record_files = fs.readdirSync(dir);

	for (let i = 0; i < all_game_record_files.length; ++i) {
		const game_record_file = path.join(dir, all_game_record_files[i]);

		debug(log_now(), `        Reading file '${game_record_file}'`);
		const game_record_data = fs.readFileSync(game_record_file, 'utf8');
		const game_set = game_set_from_json(game_record_data);

		for (let j = 0; j < game_set.length; ++j) {
			const g = game_set[j] as Game;
			const game_id = parseInt( g.get_id(), 10 );
			max_game_id = max_game_id < game_id ? game_id : max_game_id;

			memory.game_id_to_record_file.set(g.get_id(), all_game_record_files[i]);
		}

		num_games += game_set.length;
	}

	memory.max_game_id = max_game_id;

	debug(log_now(), `    Found ${num_games} games.`);
	debug(log_now(), `    Maximum game id ${max_game_id}.`);
}

function initialize_permissions(permission_data: any): void {
	debug(log_now(), "Initialize permissions...");

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

function initialize_time_controls(time_control_array: any): void {
	debug(log_now(), "Initialize time controls...");
	
	let all_time_controls: TimeControl[] = [];
	for (var time_control in time_control_array) {
		let tc = time_control_array[time_control];
		all_time_controls.push( new TimeControl(tc.id, tc.name) );
	}
	
	RatingSystem.get_instance().set_time_controls(all_time_controls);

	debug(log_now(), `    Found '${all_time_controls.length}' rating types:`);
	for (let i = 0; i < all_time_controls.length; ++i) {
		debug(log_now(), `        * Id '${all_time_controls[i].id}'`);
		debug(log_now(), `          Name '${all_time_controls[i].name}'`);
	}
}

export function server_initialize_from_data(configuration_data: any): void {
	const base_directory = configuration_data.base_directory;
	debug(log_now(), `    Base directory: '${base_directory}'`);

	//
	// initialize directories

	const database_directory = path.join(base_directory, "/database");
	ServerDirectories.get_instance().set_database_base_directory(database_directory);
	
	debug(log_now(), `    Database directory: '${ServerDirectories.get_instance().database_directory}'`);
	debug(log_now(), `        Games directory: '${ServerDirectories.get_instance().games_directory}'`);
	debug(log_now(), `        Users directory: '${ServerDirectories.get_instance().users_directory}'`);
	debug(log_now(), `        Challenges directory: '${ServerDirectories.get_instance().challenges_directory}'`);

	const ssl_certificate_directory = path.join(base_directory, "/ssl");
	const public_key_file = configuration_data.ssl_certificate.public_key_file;
	const private_key_file = configuration_data.ssl_certificate.private_key_file;
	const passphrase_file = configuration_data.ssl_certificate.passphrase_file;
	ServerDirectories.get_instance().set_SSL_info(ssl_certificate_directory, public_key_file, private_key_file, passphrase_file);

	debug(log_now(), `    SSL base directory: '${ServerDirectories.get_instance().ssl_directory}'`);
	debug(log_now(), `        Public key file: '${ServerDirectories.get_instance().public_key_file}'`);
	debug(log_now(), `        Private key file: '${ServerDirectories.get_instance().private_key_file}'`);
	debug(log_now(), `        Passphrase: '${ServerDirectories.get_instance().passphrase_file}'`);

	// initialize rating system
	{
	const rating_type = configuration_data.rating_system;
	debug(log_now(), `    Rating system: '${rating_type}'`);
	let rating_system = RatingSystem.get_instance();
	if (rating_type == 'Elo') {
		rating_system.set_formula_function(Elo);
		rating_system.set_rating_from_JSON(Elo_rating_from_json);
		rating_system.set_rating_set_from_JSON(Elo_rating_set_from_json);
		rating_system.set_new_rating(Elo_rating_new);
	}
	else {
		debug(log_now(), `Invalid rating system '${rating_type}'`);
	}
	}

	initialize_permissions(configuration_data.permissions);
	initialize_time_controls(configuration_data.time_controls);
	initialize_sessions();
	initialize_users();
	initialize_challenges();
	initialize_games();
}

/// Initializes the server memory
export function server_initialize_from_configuration_file(configuration_file: string): void {
	debug(log_now(), `Reading configuration file '${configuration_file}'`);

	const data = fs.readFileSync(configuration_file, 'utf8');
	const json_data = JSON.parse(data);

	server_initialize_from_data(json_data);
}

export function server_initialize_from_default_configuration_file(args: string[]): void {

	let configuration_file: string = "";
	for (let i = 0; i < args.length; ++i) {
		if (args[i] == "configuration-file") {
			configuration_file = args[i + 1];
			++i;
		}
		else {
			debug(log_now(), "Error: invalid option '" + configuration_file + "'.");
		}
	}

	server_initialize_from_configuration_file(configuration_file);
}
