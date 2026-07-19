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
const debug = Debug('ELO_CHESS_TRACKER:managers/users');

import { Player } from '@common/models/player';
import { TimeControlGame, User, UserRandomID } from '@common/models/user';
import { EnvironmentManager } from '@server/managers/environment_manager';
import { UsersManager } from '@server/managers/users_manager';
import { UserRole } from '@common/models/user_role';
import { encrypt_password_for_user } from '@server/utils/encrypt';
import { RatingSystemManager } from '@server/managers/rating_system_manager';
import { TimeControlRating } from '@common/models/time_control_rating';
import { log_now } from '@server/utils/time';
import { UserThin } from '@common/models/user_thin';

/// Dump the data in user @e u into its corresponding file.
export function user_overwrite(user: User): void {
	const user_dir = EnvironmentManager.get_instance().get_dir_users();
	const user_file = path.join(user_dir, user.username);
	fs.writeFileSync(user_file, JSON.stringify(user, null, 4));
}

/// Overwrites user data
export function user_rename_and_reassign_roles(
	username: string,
	first_name: string,
	last_name: string,
	roles: UserRole[]
): User {
	let user = UsersManager.get_instance().get_user_by_username(username) as User;
	user.first_name = first_name;
	user.last_name = last_name;
	user.roles = roles;
	user_overwrite(user);
	return user;
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

	let games: TimeControlGame[] = [];
	let ratings: TimeControlRating[] = [];
	rating_system.get_unique_time_controls_ids().forEach((id: string) => {
		ratings.push(new TimeControlRating(id, rating_system.get_new_rating()));
		games.push({ time_control: id, records: [] });
	});

	const password = encrypt_password_for_user(username, pass);

	const user = new User(
		username,
		firstname,
		lastname,
		{ encrypted: password[0], iv: password[1] },
		roles,
		games,
		ratings
	);

	const user_dir = EnvironmentManager.get_instance().get_dir_users();
	const user_file = path.join(user_dir, user.username);

	fs.writeFileSync(user_file, JSON.stringify(user, null, 4));

	UsersManager.get_instance().add_user(user);

	return user;
}

/// Returns the list of all (full) names and usernames
export function user_get_all_name_randid(): UserThin[] {
	let res: UserThin[] = [];

	const mem = UsersManager.get_instance();
	for (let i = 0; i < mem.num_users(); ++i) {
		const user = mem.get_user_at(i) as User;
		const random_id = mem.get_user_random_ID_at(i) as UserRandomID;
		res.push({ name: user.get_full_name(), id: random_id });
	}
	return res;
}

/**
 * @brief Updates all user information using data from "players"
 * @param players Set of players to be updated.
 * @post Users in the server (memory and database) are updated.
 */
export function user_update_from_player_data(players: Player[]): void {
	const users_directory = EnvironmentManager.get_instance().get_dir_users();
	let manager = UsersManager.get_instance();
	let mem = UsersManager.get_instance();

	debug(log_now(), 'Updating users...');
	for (const player of players) {
		const username = player.username;

		let u: User = manager.get_user_by_username(username) as User;

		const ratings_player = player.ratings;
		for (const rating of ratings_player) {
			u.set_rating(rating.time_control, rating.rating);
		}

		const user_filename = path.join(users_directory, username);

		// update player file
		debug(log_now(), `    User file '${user_filename}'...`);
		fs.writeFileSync(user_filename, JSON.stringify(u, null, 4));
		debug(log_now(), `        User file '${user_filename}' written.`);

		debug(log_now(), '    Server memory...');
		const u_idx = mem.get_user_index(u) as number;
		debug(log_now(), `        User '${u.username}' is at index '${u_idx}'`);
		mem.replace_user(u, u_idx);
	}
}
