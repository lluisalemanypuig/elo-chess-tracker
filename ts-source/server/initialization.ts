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
import { ServerMemory, ServerDirectories, RatingFormula } from "./configuration";
import { user_from_json } from '../models/user';
import { challenge_from_json } from '../models/challenge';
import { test_player_vs_player } from '../rating_system/test_system';
import { game_set_from_json } from '../models/game';

function initialize_sessions(): void {
	let memory = ServerMemory.get_instance();
	// Session ids. Empty
	memory.session_ids = [];
}

function initialize_users(): void {
	let memory = ServerMemory.get_instance();
	let dir = ServerDirectories.get_instance().users_directory;

	debug(log_now(), `Reading directory '${dir}'`);
	let all_user_files = fs.readdirSync(dir);

	for (let i = 0; i < all_user_files.length; ++i) {
		let user_file = path.join(dir, all_user_files[i]);

		debug(log_now(), `    Reading file '${user_file}'`);
		let user_data = fs.readFileSync(user_file, 'utf8');
		let user = user_from_json(user_data);

		memory.users.push(user);
		memory.user_to_index.set(user.get_username(), i);
		debug(log_now(), `    User '${user.get_username()}' is at index '${i}'`);
	}
	debug(log_now(), `    Found ${memory.users.length} users.`);
}

function initialize_challenges(): void {
	let memory = ServerMemory.get_instance();
	let dir = ServerDirectories.get_instance().challenges_directory;

	debug(log_now(), `Reading directory '${dir}'`);
	let all_challenges_files = fs.readdirSync(dir);

	for (let i = 0; i < all_challenges_files.length; ++i) {
		let challenge_file = path.join(dir, all_challenges_files[i]);

		debug(log_now(), `    Reading file '${challenge_file}'`);
		let challenge_data = fs.readFileSync(challenge_file, 'utf8');

		memory.challenges.push(challenge_from_json(challenge_data));
	}
	debug(log_now(), `    Found ${memory.challenges.length} challenges.`);
}

function initialize_games(): void {
	let memory = ServerMemory.get_instance();
	let dir = ServerDirectories.get_instance().games_directory;

	debug(log_now(), `Reading directory '${dir}'`);
	let all_game_record_files = fs.readdirSync(dir);

	for (let i = 0; i < all_game_record_files.length; ++i) {
		let game_record_file = path.join(dir, all_game_record_files[i]);

		debug(log_now(), `    Reading file '${game_record_file}'`);
		let game_record_data = fs.readFileSync(game_record_file, 'utf8');
		let game_set = game_set_from_json(game_record_data);

		memory.num_games += game_set.length;
	}
	debug(log_now(), `    Found ${memory.num_games} games.`);
}

/// Initializes the server memory
export function server_initialize(base_dir: string = path.join(__dirname, "../../database")): void {

	ServerDirectories.initialize(base_dir);
	RatingFormula.initialize(test_player_vs_player);

	debug(log_now(), `Base directory: '${ServerDirectories.get_instance().base_directory}'`);
	debug(log_now(), `    Games directory: '${ServerDirectories.get_instance().games_directory}'`);
	debug(log_now(), `    Users directory: '${ServerDirectories.get_instance().users_directory}'`);
	debug(log_now(), `    Challenges directory: '${ServerDirectories.get_instance().challenges_directory}'`);

	initialize_sessions();
	initialize_users();
	initialize_challenges();
	initialize_games();
}
