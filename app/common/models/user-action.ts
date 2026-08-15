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

import { z } from 'zod';
import { UserRole } from '@common/models/user-role';
import { InternalError } from '@server/utils/error-types/internal-error';

/// All actions that can be performed in this web
export const ALL_ACTIONS = [
	'CREATE_USER',

	'CREATE_GAMES',
	'CREATE_GAMES_ADMIN',
	'CREATE_GAMES_TEACHER',
	'CREATE_GAMES_MEMBER',
	'CREATE_GAMES_STUDENT',

	'EDIT_GAMES',
	'EDIT_GAMES_ADMIN',
	'EDIT_GAMES_TEACHER',
	'EDIT_GAMES_MEMBER',
	'EDIT_GAMES_STUDENT',

	'DELETE_GAMES',
	'DELETE_GAMES_ADMIN',
	'DELETE_GAMES_TEACHER',
	'DELETE_GAMES_MEMBER',
	'DELETE_GAMES_STUDENT',

	'SEE_GAMES',
	'SEE_GAMES_ADMIN',
	'SEE_GAMES_TEACHER',
	'SEE_GAMES_MEMBER',
	'SEE_GAMES_STUDENT',

	'EDIT_USER',
	'EDIT_USER_ADMIN',
	'EDIT_USER_TEACHER',
	'EDIT_USER_MEMBER',
	'EDIT_USER_STUDENT',

	'ASSIGN_ROLE',
	'ASSIGN_ROLE_ADMIN',
	'ASSIGN_ROLE_TEACHER',
	'ASSIGN_ROLE_MEMBER',
	'ASSIGN_ROLE_STUDENT',

	'SEE_GRAPHS',
	'SEE_GRAPHS_ADMIN',
	'SEE_GRAPHS_TEACHER',
	'SEE_GRAPHS_MEMBER',
	'SEE_GRAPHS_STUDENT',

	'CHALLENGE_USER',
	'CHALLENGE_USER_ADMIN',
	'CHALLENGE_USER_TEACHER',
	'CHALLENGE_USER_MEMBER',
	'CHALLENGE_USER_STUDENT'
] as const;

/// All actions as type
export type UserAction = (typeof ALL_ACTIONS)[number];

export const UserActionSchema = z.enum(ALL_ACTIONS);

export const UserActionArraySchema = z.array(UserActionSchema);

// -----------------------------------------------------------------------------

export const ALL_ACTION_IDS = [
	'CREATE_GAMES',
	'EDIT_GAMES',
	'DELETE_GAMES',
	'EDIT_USERS',
	'ASSIGN_ROLE_USERS',
	'CHALLENGE_USERS',
	'SEE_GAMES',
	'SEE_GRAPHS'
] as const;

/// All actions as type
export type UserActionID = (typeof ALL_ACTION_IDS)[number];

export const UserActionIDSchema = z.enum(ALL_ACTION_IDS);

export function getGenericRoleActionName(id: UserActionID): UserAction {
	switch (id) {
		case 'CREATE_GAMES':
			return 'CREATE_GAMES';
		case 'EDIT_GAMES':
			return 'EDIT_GAMES';
		case 'DELETE_GAMES':
			return 'DELETE_GAMES';
		case 'SEE_GAMES':
			return 'SEE_GAMES';
		case 'EDIT_USERS':
			return 'EDIT_USER';
		case 'ASSIGN_ROLE_USERS':
			return 'ASSIGN_ROLE';
		case 'CHALLENGE_USERS':
			return 'CHALLENGE_USER';
		case 'SEE_GRAPHS':
			return 'SEE_GRAPHS';
	}

	throw new InternalError(`Wrong action identifier ${id}`);
}

/**
 * @brief Returns the 'concatenation' of role and action:
 *
 * Example:
 *    id: "edit" (action)
 *    r: ADMIN (role)
 *
 *    result: USER_EDIT_ADMIN (UserAction)
 */
export function getRoleActionName(id: UserActionID, r: UserRole): UserAction {
	switch (id) {
		case 'CREATE_GAMES':
			switch (r) {
				case 'ADMIN':
					return 'CREATE_GAMES_ADMIN';
				case 'TEACHER':
					return 'CREATE_GAMES_TEACHER';
				case 'MEMBER':
					return 'CREATE_GAMES_MEMBER';
				case 'STUDENT':
					return 'CREATE_GAMES_STUDENT';
			}
			throw new InternalError(`Unhandled user role ${r} in ${id}`);
		case 'EDIT_GAMES':
			switch (r) {
				case 'ADMIN':
					return 'EDIT_GAMES_ADMIN';
				case 'TEACHER':
					return 'EDIT_GAMES_TEACHER';
				case 'MEMBER':
					return 'EDIT_GAMES_MEMBER';
				case 'STUDENT':
					return 'EDIT_GAMES_STUDENT';
			}
			throw new InternalError(`Unhandled user role ${r} in ${id}`);
		case 'DELETE_GAMES':
			switch (r) {
				case 'ADMIN':
					return 'DELETE_GAMES_ADMIN';
				case 'TEACHER':
					return 'DELETE_GAMES_TEACHER';
				case 'MEMBER':
					return 'DELETE_GAMES_MEMBER';
				case 'STUDENT':
					return 'DELETE_GAMES_STUDENT';
			}
			throw new InternalError(`Unhandled user role ${r} in ${id}`);
		case 'SEE_GAMES':
			switch (r) {
				case 'ADMIN':
					return 'SEE_GAMES_ADMIN';
				case 'TEACHER':
					return 'SEE_GAMES_TEACHER';
				case 'MEMBER':
					return 'SEE_GAMES_MEMBER';
				case 'STUDENT':
					return 'SEE_GAMES_STUDENT';
			}
			throw new InternalError(`Unhandled user role ${r} in ${id}`);
		case 'EDIT_USERS':
			switch (r) {
				case 'ADMIN':
					return 'EDIT_USER_ADMIN';
				case 'TEACHER':
					return 'EDIT_USER_TEACHER';
				case 'MEMBER':
					return 'EDIT_USER_MEMBER';
				case 'STUDENT':
					return 'EDIT_USER_STUDENT';
			}
			throw new InternalError(`Unhandled user role ${r} in ${id}`);
		case 'ASSIGN_ROLE_USERS':
			switch (r) {
				case 'ADMIN':
					return 'ASSIGN_ROLE_ADMIN';
				case 'TEACHER':
					return 'ASSIGN_ROLE_TEACHER';
				case 'MEMBER':
					return 'ASSIGN_ROLE_MEMBER';
				case 'STUDENT':
					return 'ASSIGN_ROLE_STUDENT';
			}
			throw new InternalError(`Unhandled user role ${r} in ${id}`);
		case 'CHALLENGE_USERS':
			switch (r) {
				case 'ADMIN':
					return 'CHALLENGE_USER_ADMIN';
				case 'TEACHER':
					return 'CHALLENGE_USER_TEACHER';
				case 'MEMBER':
					return 'CHALLENGE_USER_MEMBER';
				case 'STUDENT':
					return 'CHALLENGE_USER_STUDENT';
			}
			throw new InternalError(`Unhandled user role ${r} in ${id}`);
		case 'SEE_GRAPHS':
			switch (r) {
				case 'ADMIN':
					return 'SEE_GRAPHS_ADMIN';
				case 'TEACHER':
					return 'SEE_GRAPHS_TEACHER';
				case 'MEMBER':
					return 'SEE_GRAPHS_MEMBER';
				case 'STUDENT':
					return 'SEE_GRAPHS_STUDENT';
			}
			throw new InternalError(`Unhandled user role ${r} in ${id}`);
	}

	throw new InternalError(`Wrong action identifier ${id}`);
}
