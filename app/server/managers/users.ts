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

import { Player, PlayerPrivateId } from '@common/models/player';
import { UserGivenName, TimeControlGame, User } from '@common/models/user';
import { EnvironmentManager } from '@server/managers/environment-manager';
import { UsersManager } from '@server/managers/users-manager';
import { UserRole } from '@common/models/user-role';
import { encryptPasswordForUser } from '@server/utils/encrypt';
import { RatingSystemManager } from '@server/managers/rating-system-manager';
import { TimeControlRating } from '@common/models/time-control-rating';
import { logNow } from '@common/utils/time';
import { UserThin } from '@common/models/user-thin';
import { isNotDefined } from '@common/utils/is-defined';
import { TimeControlId } from '@common/models/time-control';

/// Dump the data in user @e u into its corresponding file.
export function userOverwrite(user: User): void {
	const user_dir = EnvironmentManager.getInstance().getDirUsers();
	const user_file = path.join(user_dir, user.username);
	fs.writeFileSync(user_file, JSON.stringify(user, null, 4));
}

/// Overwrites user data
export function userRenameAndReassignRoles(
	username: PlayerPrivateId,
	firstName: UserGivenName,
	lastName: UserGivenName,
	roles: UserRole[]
): User {
	let user = UsersManager.getInstance().getUserByUsername(username) as User;
	user.firstName = firstName;
	user.lastName = lastName;
	user.roles = roles;
	userOverwrite(user);
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
export function userAddNew(
	username: PlayerPrivateId,
	firstname: UserGivenName,
	lastname: UserGivenName,
	pass: string,
	roles: UserRole[]
): User {
	const ratingSystem = RatingSystemManager.getInstance();

	let games: TimeControlGame[] = [];
	let ratings: TimeControlRating[] = [];
	ratingSystem.getUniqueTimeControlsIds().forEach((id: TimeControlId) => {
		ratings.push(new TimeControlRating(id, ratingSystem.getNewRating()));
		games.push({ timeControl: id, records: [] });
	});

	const password = encryptPasswordForUser(username, pass);

	const user = new User(
		username,
		firstname,
		lastname,
		{ encrypted: password[0], iv: password[1] },
		roles,
		games,
		ratings
	);

	const user_dir = EnvironmentManager.getInstance().getDirUsers();
	const user_file = path.join(user_dir, user.username);

	fs.writeFileSync(user_file, JSON.stringify(user, null, 4));

	UsersManager.getInstance().addUser(user);

	return user;
}

/// Returns the list of all (full) names and usernames
export function userGetAllNamePublicId(): UserThin[] {
	let res: UserThin[] = [];

	const mem = UsersManager.getInstance();
	for (let i = 0; i < mem.numUsers(); ++i) {
		const user = mem.getUserAt(i) as User;
		const random_id = mem.getUserPublicIdAt(i);
		if (isNotDefined(random_id)) {
			throw new Error(`Public id for user is not defined.`);
		}
		res.push({ name: user.getFullName(), id: random_id });
	}
	return res;
}

/**
 * @brief Updates all user information using data from "players"
 * @param players Set of players to be updated.
 * @post Users in the server (memory and database) are updated.
 */
export function userUpdateFromPlayerData(players: Player[]): void {
	const users_directory = EnvironmentManager.getInstance().getDirUsers();
	let manager = UsersManager.getInstance();
	let mem = UsersManager.getInstance();

	debug(logNow(), 'Updating users...');
	for (const player of players) {
		const username = player.username;

		let u: User = manager.getUserByUsername(username) as User;

		const ratings_player = player.ratings;
		for (const rating of ratings_player) {
			u.setRating(rating.timeControl, rating.rating);
		}

		const user_filename = path.join(users_directory, username);

		// update player file
		debug(logNow(), `    User file '${user_filename}'...`);
		fs.writeFileSync(user_filename, JSON.stringify(u, null, 4));
		debug(logNow(), `        User file '${user_filename}' written.`);

		debug(logNow(), '    Server memory...');
		const u_idx = mem.getUserIndex(u) as number;
		debug(logNow(), `        User '${u.username}' is at index '${u_idx}'`);
		mem.replace_user(u, u_idx);
	}
}
