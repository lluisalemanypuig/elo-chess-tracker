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
const debug = Debug('ELO_TRACKER:server_game_history');

import { Player } from '../models/player';
import { User } from '../models/user';
import { ServerDirectories, ServerMemory } from './configuration';
import { log_now, where_should_be_inserted } from '../utils/misc';
import { assert } from 'console';
import { UserRole } from '../models/user_role';

/**
 * @brief Returns a User object from a username.
 * @param username Username of the player.
 * @param server_conf Directories of the database.
 * @returns Null or a User if the user exists.
 */
export function user_retrieve(username: string): (User | null) {
	let memory = ServerMemory.get_instance();
	for (let i = 0; i < memory.users.length; ++i) {
		const user: User = memory.users[i];
		if (user.get_username() == username) { return user; }
	}
	return null;
}

/// Overwrites user data
export function user_overwrite(
	username: string,
	first_name: string,
	last_name: string,
	roles: UserRole[]

): void {

	let user = user_retrieve(username) as User;
	user.set_first_name(first_name);
	user.set_last_name(last_name);
	user.set_roles(roles);

	let user_dir = ServerDirectories.get_instance().users_directory;
	let user_file = path.join(user_dir, user.get_username());

	debug(log_now(), `Overwriting file '${user_file}' of user '${user.get_username()}'`);
	fs.writeFileSync(user_file, JSON.stringify(user, null, 4));
}

/// Does a user exist?
export function user_exists(username: string): boolean {
	let memory = ServerMemory.get_instance();
	for (let i = 0; i < memory.users.length; ++i) {
		const user: User = memory.users[i];
		if (user.get_username() == username) { return true; }
	}
	return false;
}

/// Returns a copy of all users
export function user_get_all(): User[] {
	let users = ServerMemory.get_instance().users;
	let all_users: User[] = [];
	for (let i = 0; i < users.length; ++i) {
		all_users.push(users[i].clone());
	}
	return all_users;
}

/**
 * @brief Creates a new user.
 * @param u New user
 * @post Server is updated:
 * - New file for user
 * - ServerMemory contains user (list of users is not sorted)
 * - ServerMemory relates the new user to its position in the list of users
 */
export function user_add_new(u: User): void
{
	let user_dir = ServerDirectories.get_instance().users_directory;
	let user_file = path.join(user_dir, u.get_username());

	debug(log_now(), `Writing file '${user_file}' of new user '${u.get_username()}'`);
	fs.writeFileSync(user_file, JSON.stringify(u, null, 4));

	debug(log_now(), `Adding user to memory`);
	let memory = ServerMemory.get_instance();
	memory.users.push(u);
	memory.user_to_index.set(u.get_username(), memory.users.length - 1);
}

/// Returns the list of all names and usernames
export function user_get_all_names_and_usernames(): [string,string][] {
	let res: [string,string][] = [];
	let users = ServerMemory.get_instance().users;
	for (let i = 0; i < users.length; ++i) {
		res.push([ users[i].get_full_name(), users[i].get_username() ]);
	}
	return res;
}

/**
 * @brief Updates all user information using data from Players
 * @param players Set of players to be updated
 * @post Users in the server (memory and database) are updated.
 */
export function user_update_from_players_data(players: Player[]): void {
	let server_dirs = ServerDirectories.get_instance();

	let users_to_update: User[] = [];

	debug(log_now(), "Updating users in the server...");
	for (let i = 0; i < players.length; ++i) {
		let u = user_retrieve(players[i].get_username()) as User;
		
		// update 'u' only if necessary
		u.copy_player_data(players[i]);
		users_to_update.push(u);
	}
	
	// lengths must be equal
	assert(users_to_update.length == players.length);

	let memory = ServerMemory.get_instance();

	debug(log_now(), "Updating users...");
	for (let i = 0; i < users_to_update.length; ++i) {
		let u = users_to_update[i];
		let user_filename = path.join(server_dirs.users_directory, u.get_username());

		// update player file
		debug(log_now(), `    User file '${user_filename}'...`);
		fs.writeFileSync(user_filename, JSON.stringify(u, null, 4), { flag: 'w' });
		debug(log_now(), `        User file '${user_filename}' written.`);

		debug(log_now(), "    Server memory...");
		let u_idx = memory.user_to_index.get(u.get_username()) as number;
		debug(log_now(), `        User '${u.get_username()}' is at index '${u_idx}'`);
		delete memory.users[u_idx];
		memory.users[u_idx] = u;
	}
}
