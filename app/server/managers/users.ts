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

import { Player } from '@server/models/player';
import { TimeControlGame, User } from '@server/models/user';
import { EnvironmentManager } from '@server/managers/environment-manager';
import { UsersManager } from '@server/managers/users-manager';
import { UserRole } from '@common/models/user-role';
import { encryptPasswordForUser, isPasswordOfUserCorrect } from '@server/utils/encrypt';
import { RatingSystemManager } from '@server/managers/rating-system-manager';
import { TimeControlRating } from '@server/models/time-control-rating';
import { logNow } from '@common/utils/time';
import { UserThin } from '@common/models/user-thin';
import { isNotDefined } from '@common/utils/is-defined';
import { TimeControlId } from '@common/models/time-control';
import { canUserEditUser } from '@server/managers/user-relationships';
import { getRoleActionName } from '@common/models/user-action';
import { sessionUserDeleteAll } from '@server/managers/session';
import { SessionId } from '@common/models/session-id';
import { PublicError } from '@server/models/error-types/public-error';
import { UserGivenName } from '@common/models/user-given-name';
import { PlayerPrivateId } from '@common/models/player-id';

export function writeUserToFile(filename: string, u: User) {
	fs.writeFileSync(filename, JSON.stringify(u, null, 4));
}

function userOverwrite(user: User) {
	const userDir = EnvironmentManager.getInstance().getDirUsers();
	const userFile = path.join(userDir, user.username);
	writeUserToFile(userFile, user);
}

interface UserEdit {
	firstName: UserGivenName;
	lastName: UserGivenName;
	roles: UserRole[];
}

export function userEdit(editor: User, edited: User, { firstName, lastName, roles }: UserEdit) {
	debug(logNow(), `User '${editor.username}' is trying to modify user '${edited.username}'`);

	if (!canUserEditUser(editor, edited)) {
		debug(logNow(), `User '${editor.username}' cannot modify user '${edited.username}'`);
		throw new PublicError('You do not have enough permissions to edit this user.');
	}

	debug(logNow(), `    First name: '${firstName}'`);
	debug(logNow(), `    Last name: '${lastName}'`);
	debug(logNow(), `    Roles: '${roles}'`);

	for (const role of roles) {
		const action = getRoleActionName('ASSIGN_ROLE_USERS', role);
		if (!editor.canDo(action)) {
			throw new PublicError(`You do not have enough permissions to assign role '${role}'.`);
		}
	}

	edited.firstName = firstName;
	edited.lastName = lastName;
	edited.roles = roles;
	userOverwrite(edited);
}

interface UserAddNew {
	username: PlayerPrivateId;
	firstName: UserGivenName;
	lastName: UserGivenName;
	password: string;
	roles: UserRole[];
}

export function userAddNew(
	registerer: User,
	{ username, firstName, lastName, password: pass, roles }: UserAddNew
): User {
	if (!registerer.canDo('CREATE_USER')) {
		debug(logNow(), `User '${registerer.username}' cannot create users.`);
		throw new PublicError('You cannot create users.');
	}
	if (!registerer.canDo('ASSIGN_ROLE')) {
		debug(logNow(), `User '${registerer.username}' cannot assign roles to users.`);
		throw new PublicError(`You cannot assign roles and thus cannot create users.`);
	}
	for (const r of roles) {
		const action = getRoleActionName('ASSIGN_ROLE_USERS', r);
		if (!registerer.canDo(action)) {
			throw new PublicError(`You cannot assign role ${r} to users.`);
		}
	}

	const manager = UsersManager.getInstance();
	if (manager.exists(username)) {
		throw new PublicError(`This user already exists`);
	}

	const ratingSystem = RatingSystemManager.getInstance();

	const games: TimeControlGame[] = [];
	const ratings: TimeControlRating[] = [];
	ratingSystem.getUniqueTimeControlsIds().forEach((id: TimeControlId) => {
		ratings.push(new TimeControlRating(id, ratingSystem.getNewRating()));
		games.push({ timeControl: id, records: [] });
	});

	const password = encryptPasswordForUser(username, pass);

	const user = new User(
		username,
		firstName,
		lastName,
		{ encrypted: password[0], iv: password[1] },
		roles,
		games,
		ratings
	);

	const userDir = EnvironmentManager.getInstance().getDirUsers();
	const userFile = path.join(userDir, user.username);

	writeUserToFile(userFile, user);

	manager.addUser(user);

	return user;
}

export function userGetAllNamePublicId(): UserThin[] {
	let res: UserThin[] = [];

	const mem = UsersManager.getInstance();
	for (let i = 0; i < mem.numUsers(); ++i) {
		const userData = mem.getAllUserDataAtSafeIdx(i);
		res.push({ name: userData.user.getFullName(), id: userData.publicId });
	}
	return res;
}

export function userUpdateFromPlayerData(players: Player[]) {
	const usersDirectory = EnvironmentManager.getInstance().getDirUsers();
	let manager = UsersManager.getInstance();
	let mem = UsersManager.getInstance();

	debug(logNow(), 'Updating users...');
	for (const player of players) {
		const username = player.username;

		const u = manager.getAllUserDataByPrivateId(username);
		if (isNotDefined(u)) {
			throw new PublicError(`Username is not correct`);
		}

		const ratingsPlayer = player.ratings;
		for (const rating of ratingsPlayer) {
			u.user.setRating(rating.timeControl, rating.rating);
		}

		const userFile = path.join(usersDirectory, username);

		// update player file
		debug(logNow(), `    User file '${userFile}'...`);
		writeUserToFile(userFile, u.user);
		debug(logNow(), `        User file '${userFile}' written.`);

		debug(logNow(), '    Server memory...');
		debug(logNow(), `        User '${u.user.username}' is at index '${u.index}'`);
		mem.replaceUser(u.user, u.index);
	}
}

interface UserSelfChangePassword {
	session: SessionId;
	oldPassword: string;
	newPassword: string;
}

export function userSelfChangePassword(user: User, { session, oldPassword, newPassword }: UserSelfChangePassword) {
	// check if password is correct
	const oldPwd = user.password;
	const isPasswordCorrect = isPasswordOfUserCorrect(user.username, oldPassword, oldPwd);

	// is the password correct?
	if (!isPasswordCorrect) {
		debug(logNow(), `    Password for '${user.username}' is incorrect`);
		throw new PublicError('Old password is not correct.');
		return;
	}

	// delete all session ids of this user
	sessionUserDeleteAll(session);

	// make new password
	const pass = encryptPasswordForUser(user.username, newPassword);
	user.password = { encrypted: pass[0], iv: pass[1] };

	// overwrite user data
	userOverwrite(user);
}
