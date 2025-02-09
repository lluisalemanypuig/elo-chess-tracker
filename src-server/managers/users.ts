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
const debug = Debug('ELO_TRACKER:server_users');

import { Player } from '../models/player';
import { TimeControlGames, User, UserRandomID } from '../models/user';
import { EnvironmentManager } from './environment_manager';
import { UsersManager } from './users_manager';
import { UserRole } from '../models/user_role';
import { Password } from '../models/password';
import { encrypt_password_for_user } from '../utils/encrypt';
import { RatingSystemManager } from './rating_system_manager';
import { TimeControlRating } from '../models/time_control_rating';
import { log_now } from '../utils/time';

/**
 * @brief Returns a User object from a username.
 * @param username Username of the player.
 * @param server_conf Directories of the database.
 * @returns Undefined or a User if the user exists.
 */
export function user_retrieve(username: string): User | undefined {
	let mem = UsersManager.get_instance();
	for (let i = 0; i < mem.num_users(); ++i) {
		const user = mem.get_user_at(i) as User;
		if (user.get_username() == username) {
			return user;
		}
	}
	return undefined;
}

/// Dump the data in user @e u into its corresponding file.
export function user_overwrite(user: User): void {
	const user_dir = EnvironmentManager.get_instance().get_dir_users();
	const user_file = path.join(user_dir, user.get_username());
	fs.writeFileSync(user_file, JSON.stringify(user, null, 4));
}

/// Overwrites user data
export function user_rename_and_reassign_roles(
	username: string,
	first_name: string,
	last_name: string,
	roles: UserRole[]
): User {
	let user = user_retrieve(username) as User;
	user.set_first_name(first_name);
	user.set_last_name(last_name);
	user.set_roles(roles);
	user_overwrite(user);
	return user;
}

/// Does a user exist?
export function user_exists(username: string): boolean {
	return user_retrieve(username) != undefined;
}

/// Returns a copy of all users
export function user_get_all(): User[] {
	let all_users: User[] = [];
	let mem = UsersManager.get_instance();
	for (let i = 0; i < mem.num_users(); ++i) {
		all_users.push((mem.get_user_at(i) as User).clone());
	}
	return all_users;
}

/**
 * @brief Creates a new user.
 * @param username User name of the new user.
 * @param firstname First name of the new user.
 * @param lastname Last name of the new user.
 * @param pass Plain text password.
 * @param roles List of roles of the new user.
 * @post Server is updated:
 * - New file for user.
 * - Server is updated to contain the new user.
 * @returns The new user created.
 */
export function user_add_new(
	username: string,
	firstname: string,
	lastname: string,
	pass: string,
	roles: UserRole[]
): User {
	const rating_system = RatingSystemManager.get_instance();

	let game_list: TimeControlGames[] = [];
	let ratings: TimeControlRating[] = [];
	rating_system.get_unique_time_controls_ids().forEach((id: string) => {
		ratings.push(new TimeControlRating(id, rating_system.get_new_rating()));
		game_list.push(new TimeControlGames(id, []));
	});

	const password = encrypt_password_for_user(username, pass);

	const user = new User(
		username,
		firstname,
		lastname,
		new Password(password[0], password[1]),
		roles,
		game_list,
		ratings
	);

	const user_dir = EnvironmentManager.get_instance().get_dir_users();
	const user_file = path.join(user_dir, user.get_username());

	fs.writeFileSync(user_file, JSON.stringify(user, null, 4));

	UsersManager.get_instance().add_user(user);

	return user;
}

/// Returns the list of all (full) names and usernames
export function user_get_all__name_randid(): [string, number][] {
	let res: [string, number][] = [];

	let mem = UsersManager.get_instance();
	for (let i = 0; i < mem.num_users(); ++i) {
		const user = mem.get_user_at(i) as User;
		const random_id = mem.get_user_random_ID_at(i) as UserRandomID;
		res.push([user.get_full_name(), random_id]);
	}
	return res;
}

/**
 * @brief Updates all user information using data from "players"
 * @param players Set of players to be updated.
 * @post Users in the server (memory and database) are updated.
 */
export function user_update_from_players_data(players: Player[]): void {
	const server_dirs = EnvironmentManager.get_instance();

	let users_to_update: User[] = [];

	debug(log_now(), 'Updating users in the server...');
	for (let i = 0; i < players.length; ++i) {
		let u = user_retrieve(players[i].get_username()) as User;

		const all_ratings_u = players[i].get_all_ratings();
		for (let j = 0; j < all_ratings_u.length; ++j) {
			u.set_rating(all_ratings_u[j].time_control, all_ratings_u[j].rating);
		}

		users_to_update.push(u);
	}

	// lengths must be equal
	if (users_to_update.length != players.length) {
		throw new Error("Lengths of 'users_to_update' and 'players' is not the same.");
	}

	let mem = UsersManager.get_instance();

	debug(log_now(), 'Updating users...');
	for (let i = 0; i < users_to_update.length; ++i) {
		let u = users_to_update[i];
		const user_filename = path.join(server_dirs.get_dir_users(), u.get_username());

		// update player file
		debug(log_now(), `    User file '${user_filename}'...`);
		fs.writeFileSync(user_filename, JSON.stringify(u, null, 4));
		debug(log_now(), `        User file '${user_filename}' written.`);

		debug(log_now(), '    Server memory...');
		const u_idx = mem.get_user_index(u) as number;
		debug(log_now(), `        User '${u.get_username()}' is at index '${u_idx}'`);
		mem.replace_user(u, u_idx);
	}
}
