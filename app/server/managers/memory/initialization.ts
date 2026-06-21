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
import Debug from 'debug';
const debug = Debug('ELO_CHESS_TRACKER:managers/initialization');

import { log_now } from '@server/utils/time';
import { EnvironmentManager } from '@server/managers/environment_manager';
import { ConfigurationManager } from '@server/managers/configuration_manager';
import { ChallengesManager } from '@server/managers/challenges_manager';
import { GamesManager } from '@server/managers/games_manager';
import { UsersManager } from '@server/managers/users_manager';
import { initialize_rating_time_controls, initialize_rating_functions } from '@server/managers/rating_system';
import { RatingSystemManager } from '@server/managers/rating_system_manager';
import { Game, GameID } from '@common/models/game';
import { TimeControl, TimeControlArray } from '@common/models/time_control';
import { Graph } from '@common/models/graph/graph';
import { GraphsManager } from '@server/managers/graphs_manager';
import { game_array_from_string } from '@common/io/game';
import { challenge_from_string } from '@common/io/challenge';
import { user_from_string } from '@common/io/user';
import { graph_from_string } from '@common/io/graph/graph';
import { UsersBehavior } from '@server/managers/users_behavior';
import { read_directory } from '@server/utils/read_directory';
import { isDefined } from '@common/utils/is_defined';
import { RatingFrameworkType } from '@common/models/rating_framework/rating_framework_type';
import { configuration_from_string } from '@common/io/configuration';
import { Configuration } from '@common/models/configuration/configuration';
import { Behavior, ChallengesBehavior } from '@common/models/configuration/behavior';
import { Environment, SSLCertificate } from '@common/models/configuration/environment';
import { Ports, ServerConfiguration } from '@common/models/configuration/server';
import { UserPermissions } from '@common/models/configuration/permissions';
import { clear_server } from '@server/managers/memory/clear';
import { initialize_permissions } from '@server/managers/user_role_action';

function init_environment_directories(base_directory: string, execution_directory: string): void {
	let server_env = EnvironmentManager.get_instance();
	server_env.set_database_base_directory(path.join(base_directory, '/database'));
	debug(log_now(), `    Database directory: '${server_env.get_dir_database()}'`);
	debug(log_now(), `        Games directory: '${server_env.get_dir_games()}'`);
	debug(log_now(), `        Users directory: '${server_env.get_dir_users()}'`);
	debug(log_now(), `        Challenges directory: '${server_env.get_dir_challenges()}'`);
	debug(log_now(), `        Graphs directory: '${server_env.get_dir_graphs()}'`);

	server_env.set_execution_environment(execution_directory);
}

function init_environment_SSL(base_directory: string, ssl: SSLCertificate): void {
	let env = EnvironmentManager.get_instance();
	env.set_SSL_info(path.join(base_directory, '/ssl'), ssl);
	debug(log_now(), `    SSL base directory: '${env.get_dir_ssl()}'`);
	debug(log_now(), `        Public key file: '${env.get_ssl_public_key_file()}'`);
	debug(log_now(), `        Private key file: '${env.get_ssl_private_key_file()}'`);
	debug(log_now(), `        Passphrase: '${env.get_ssl_passphrase_file()}'`);
}

function init_environment_icon_file_paths(base_directory: string, env: Environment): void {
	EnvironmentManager.get_instance().set_icons_info(path.join(base_directory, '/icons'), env);
}

function init_environment_page_titles(env: Environment): void {
	EnvironmentManager.get_instance().set_titles_info(env.login_page.title, env.home_page.title);
}

function init_environment(base_directory: string, env: Environment): void {
	const execution_directory = process.cwd();
	init_environment_directories(base_directory, execution_directory);
	init_environment_SSL(base_directory, env.ssl_certificate);
	init_environment_page_titles(env);
	init_environment_icon_file_paths(base_directory, env);
}

function init_server_ports(ports: Ports): void {
	let server_conf = ConfigurationManager.get_instance();
	server_conf.set_port_http(ports.http);
	server_conf.set_port_https(ports.https);
	debug(log_now(), `    Configuration parameters:`);
	debug(log_now(), `        HTTP : ${server_conf.get_port_http()}`);
	debug(log_now(), `        HTTPS: ${server_conf.get_port_https()}`);
}

function init_server(conf: ServerConfiguration): void {
	let server_conf = ConfigurationManager.get_instance();

	server_conf.set_domain_name(conf.domain_name);
	debug(log_now(), `        Domain name: ${server_conf.get_domain_name()}`);

	init_server_ports(conf.ports);
}

function init_user_permissions(permissions: UserPermissions): void {
	debug(log_now(), 'Initialize permissions...');

	initialize_permissions(permissions);
}

function init_rating_framework(rating_type: RatingFrameworkType): void {
	debug(log_now(), `    Rating system: '${rating_type}'`);

	initialize_rating_functions(rating_type);
}

function init_time_controls(time_controls: TimeControlArray): void {
	debug(log_now(), 'Initialize time controls...');

	debug(log_now(), `    Found '${time_controls.length}' rating types:`);

	let all_time_controls: TimeControl[] = [];
	for (let tc of time_controls) {
		all_time_controls.push({ id: tc.id, name: tc.name });

		debug(log_now(), `        * Id '${tc.id}'`);
		debug(log_now(), `          Name '${tc.name}'`);
	}

	initialize_rating_time_controls(all_time_controls);

	// create directories for the time controls in the 'games' directory
	const games_dir = EnvironmentManager.get_instance().get_dir_games();
	for (let i = 0; i < all_time_controls.length; ++i) {
		const id_dir = path.join(games_dir, all_time_controls[i].id);
		if (!fs.existsSync(id_dir)) {
			fs.mkdirSync(id_dir);
		}
	}
}

function init_behavior_challenges(challenges: ChallengesBehavior): void {
	let behavior = UsersBehavior.get_instance();
	behavior.set_higher_rated_decline_challenge_lower_rated(
		challenges.higher_rated_player_can_decline_challenge_from_lower_rated_player
	);
}

function init_behavior(behavior: Behavior): void {
	debug(log_now(), 'Initialize behaviours...');

	init_behavior_challenges(behavior.challenges);
}

function init_user_session_ids(): void {
	debug(log_now(), 'Initialize sessions...');
}

function init_users(): void {
	debug(log_now(), 'Initialize users...');

	const rating_system = RatingSystemManager.get_instance();
	const unique_time_controls_ids = rating_system.get_unique_time_controls_ids();
	const new_rating = rating_system.get_new_rating();
	const users_dir = EnvironmentManager.get_instance().get_dir_users();
	let user_manager = UsersManager.get_instance();

	debug(log_now(), `    Reading directory '${users_dir}'`);
	const all_user_files = read_directory(users_dir);

	for (let i = 0; i < all_user_files.length; ++i) {
		const user_file = path.join(users_dir, all_user_files[i]);

		debug(log_now(), `        Reading file '${user_file}'`);
		const user_str = fs.readFileSync(user_file, 'utf8');
		const user = user_from_string(user_str);
		if (!isDefined(user)) {
			throw new Error(`Could not parse user at index '${i}', at file '${user_file}'.`);
			continue;
		}
		debug(log_now(), `        User '${user.username}' is at index '${i}'`);

		// maybe the file the user was read from has to be updated
		let update_user_file: boolean = false;
		// make sure that all users have a rating for every time control
		for (let i = 0; i < unique_time_controls_ids.length; ++i) {
			if (!user.has_rating(unique_time_controls_ids[i])) {
				user.add_rating(unique_time_controls_ids[i], new_rating.clone());
				update_user_file = true;
			}
		}

		user_manager.add_user(user);
		if (update_user_file) {
			debug(log_now(), `Overwriting file '${user_file}' of user '${user.username}'`);
			fs.writeFileSync(user_file, JSON.stringify(user, null, 4));
		}
	}
	debug(log_now(), `    Found ${user_manager.num_users()} users.`);
}

function init_challenges(): void {
	debug(log_now(), 'Initialize challenges...');

	const challenges_dir = EnvironmentManager.get_instance().get_dir_challenges();
	let challenges = ChallengesManager.get_instance();
	let max_challenge_id: string = '0';

	debug(log_now(), `    Reading directory '${challenges_dir}'`);
	const all_challenges_files = read_directory(challenges_dir);

	for (let i = 0; i < all_challenges_files.length; ++i) {
		const challenge_file = path.join(challenges_dir, all_challenges_files[i]);

		debug(log_now(), `        Reading file '${challenge_file}'`);
		const challenge_data = fs.readFileSync(challenge_file, 'utf8');
		const c = challenge_from_string(challenge_data);
		if (!isDefined(c)) {
			throw new Error(`Challenge at index '${i}' could not be parsed.`);
			continue;
		}
		challenges.add_challenge(c);

		max_challenge_id = max_challenge_id < c.id ? c.id : max_challenge_id;
	}

	challenges.set_max_challenge_id(parseInt(max_challenge_id));

	debug(log_now(), `    Found ${challenges.num_challenges()} challenges.`);
	debug(log_now(), `    Maximum challenge id ${max_challenge_id}.`);
}

function init_games(): void {
	debug(log_now(), 'Initialize games...');

	const ratings = RatingSystemManager.get_instance();
	let games = GamesManager.get_instance();
	let num_games: number = 0;
	let max_game_id: GameID = '0';

	for (const id of ratings.get_unique_time_controls_ids()) {
		const games_dir = EnvironmentManager.get_instance().get_dir_games_time_control(id);

		debug(log_now(), `    Reading directory '${games_dir}'`);
		const all_date_record_files = read_directory(games_dir);

		for (let i = 0; i < all_date_record_files.length; ++i) {
			const game_record_file = path.join(games_dir, all_date_record_files[i]);

			debug(log_now(), `        Reading file '${game_record_file}'`);
			const game_record_data = fs.readFileSync(game_record_file, 'utf8');
			const game_set = game_array_from_string(game_record_data);
			if (!isDefined(game_set)) {
				throw new Error(`File '${game_record_file}' could not be parsed.`);
			}

			for (let j = 0; j < game_set.length; ++j) {
				const g = game_set[j] as Game;
				const game_id = g.id;
				max_game_id = max_game_id < game_id ? game_id : max_game_id;

				games.add_game(g.id, all_date_record_files[i], g.time_control_id);
			}

			num_games += game_set.length;
		}
	}

	games.set_max_game_id(parseInt(max_game_id));

	debug(log_now(), `    Found ${num_games} games.`);
	debug(log_now(), `    Maximum game id ${max_game_id}.`);
}

function init_graphs(): void {
	debug(log_now(), 'Initialize graphs...');

	const ratings = RatingSystemManager.get_instance();
	let graph_manager = GraphsManager.get_instance();

	for (const id of ratings.get_unique_time_controls_ids()) {
		const graphs_dir = EnvironmentManager.get_instance().get_dir_graphs_time_control(id);

		if (!fs.existsSync(graphs_dir)) {
			fs.mkdirSync(graphs_dir);
			graph_manager.add_graph(id, new Graph());
		} else {
			debug(log_now(), `    Found directory ${graphs_dir}`);
			const g_id = graph_from_string(graphs_dir);
			if (!isDefined(g_id)) {
				throw new Error(`Could not read graph from directory '${graphs_dir}'.`);
			}
			graph_manager.add_graph(id, g_id);
		}
	}
}

export function server_init_from_data(base_directory: string, configuration: Configuration): void {
	debug(log_now(), `    Webpage base directory: '${base_directory}'`);

	clear_server();

	init_environment(base_directory, configuration.environment);
	init_server(configuration.server);
	init_user_permissions(configuration.permissions);
	init_rating_framework(configuration.rating_system);
	init_time_controls(configuration.time_controls);

	init_behavior(configuration.behavior);

	init_user_session_ids();
	init_users();
	init_challenges();
	init_games();
	init_graphs();
}

/// Initializes the server memory
export function server_init_from_configuration_file(configuration_file: string): void {
	debug(log_now(), `Reading configuration file '${configuration_file}'`);

	const data = fs.readFileSync(configuration_file, 'utf8');
	const configuration = configuration_from_string(data);
	if (!isDefined(configuration)) {
		debug(log_now(), `Configuration file '${configuration_file}' not found.`);
		return;
	}

	const base_path = configuration_file.substring(0, configuration_file.lastIndexOf('/'));
	server_init_from_data(base_path, configuration);
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
