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

import { ADMIN, MEMBER, STUDENT, TEACHER, UserRole } from './user_role';

/// Can create users
export const CREATE_USER = 'create_user';

/// Can create games
export const GAMES_CREATE = 'create_games';
/// Can create games where a player is an admin
export const GAMES_CREATE_ADMIN = 'create_games_admin';
/// Can create games where a player is a teacher
export const GAMES_CREATE_TEACHER = 'create_games_teacher';
/// Can create games where a player is a member
export const GAMES_CREATE_MEMBER = 'create_games_member';
/// Can create games where a player is a student
export const GAMES_CREATE_STUDENT = 'create_games_student';

/// Can edit user games
export const GAMES_EDIT = 'edit_games';
/// Can edit admin games
export const GAMES_EDIT_ADMIN = 'edit_games_admin';
/// Can edit teacher games
export const GAMES_EDIT_TEACHER = 'edit_games_teacher';
/// Can edit member games
export const GAMES_EDIT_MEMBER = 'edit_games_member';
/// Can edit student games
export const GAMES_EDIT_STUDENT = 'edit_games_student';

/// Can delete user games
export const GAMES_DELETE = 'delete_games';
/// Can delete admin games
export const GAMES_DELETE_ADMIN = 'delete_games_admin';
/// Can delete teacher games
export const GAMES_DELETE_TEACHER = 'delete_games_teacher';
/// Can delete member games
export const GAMES_DELETE_MEMBER = 'delete_games_member';
/// Can delete student games
export const GAMES_DELETE_STUDENT = 'delete_games_student';

/// Can see a users games
export const GAMES_SEE = 'see_games';
/// Can see admin's games
export const GAMES_SEE_ADMIN = 'see_games_admin';
/// Can see teacher's games
export const GAMES_SEE_TEACHER = 'see_games_teacher';
/// Can see members' games
export const GAMES_SEE_MEMBER = 'see_games_member';
/// Can see student' games
export const GAMES_SEE_STUDENT = 'see_games_student';

/// Edit a user
export const USER_EDIT = 'edit_user';
/// Edit admin
export const USER_EDIT_ADMIN = 'edit_admin';
/// Edit teacher
export const USER_EDIT_TEACHER = 'edit_teacher';
/// Edit members
export const USER_EDIT_MEMBER = 'edit_member';
/// Edit students
export const USER_EDIT_STUDENT = 'edit_student';

/// Assign a role to a user
export const USER_ROLE_ASSIGN = 'assign_role_user';
/// Assign admin role
export const USER_ROLE_ASSIGN_ADMIN = 'assign_role_admin';
/// Assign teacher role
export const USER_ROLE_ASSIGN_TEACHER = 'assign_role_teacher';
/// Assign member role
export const USER_ROLE_ASSIGN_MEMBER = 'assign_role_member';
/// Assign student role
export const USER_ROLE_ASSIGN_STUDENT = 'assign_role_student';

/// Can see graphs
export const GRAPHS_SEE_USER = 'see_graphs';
/// Can see an admin's graphs
export const GRAPHS_SEE_ADMIN = 'see_graphs_admin';
/// Can see an teacher's graphs
export const GRAPHS_SEE_TEACHER = 'see_graphs_teacher';
/// Can see an member's graphs
export const GRAPHS_SEE_MEMBER = 'see_graphs_member';
/// Can see an student's graphs
export const GRAPHS_SEE_STUDENT = 'see_graphs_student';

/// Can challenge a user
export const USER_CHALLENGE = 'challenge_user';
/// Can see admin's games
export const USER_CHALLENGE_ADMIN = 'challenge_admin';
/// Can see teacher's games
export const USER_CHALLENGE_MEMBER = 'challenge_member';
/// Can see members' games
export const USER_CHALLENGE_TEACHER = 'challenge_teacher';
/// Can see student' games
export const USER_CHALLENGE_STUDENT = 'challenge_student';

/// All actions that can be performed in this web
export const all_actions = [
	CREATE_USER,

	GAMES_CREATE,
	GAMES_CREATE_ADMIN,
	GAMES_CREATE_TEACHER,
	GAMES_CREATE_MEMBER,
	GAMES_CREATE_STUDENT,

	GAMES_EDIT,
	GAMES_EDIT_ADMIN,
	GAMES_EDIT_TEACHER,
	GAMES_EDIT_MEMBER,
	GAMES_EDIT_STUDENT,

	GAMES_DELETE,
	GAMES_DELETE_ADMIN,
	GAMES_DELETE_TEACHER,
	GAMES_DELETE_MEMBER,
	GAMES_DELETE_STUDENT,

	GAMES_SEE,
	GAMES_SEE_ADMIN,
	GAMES_SEE_TEACHER,
	GAMES_SEE_MEMBER,
	GAMES_SEE_STUDENT,

	USER_EDIT,
	USER_EDIT_ADMIN,
	USER_EDIT_TEACHER,
	USER_EDIT_MEMBER,
	USER_EDIT_STUDENT,

	USER_ROLE_ASSIGN,
	USER_ROLE_ASSIGN_ADMIN,
	USER_ROLE_ASSIGN_TEACHER,
	USER_ROLE_ASSIGN_MEMBER,
	USER_ROLE_ASSIGN_STUDENT,

	GRAPHS_SEE_USER,
	GRAPHS_SEE_ADMIN,
	GRAPHS_SEE_TEACHER,
	GRAPHS_SEE_MEMBER,
	GRAPHS_SEE_STUDENT,

	USER_CHALLENGE,
	USER_CHALLENGE_ADMIN,
	USER_CHALLENGE_TEACHER,
	USER_CHALLENGE_MEMBER,
	USER_CHALLENGE_STUDENT
] as const;

/// All actions as type
export type UserAction = (typeof all_actions)[number];

// -----------------------------------------------------------------------------

export const GAMES_CREATE_ID = 'create_games';
export const GAMES_EDIT_ID = 'edit_games';
export const GAMES_DELETE_ID = 'delete_games';
export const GAMES_SEE_ID = 'see_games';
export const USER_EDIT_ID = 'edit_users';
export const USER_ROLE_ASSIGN_ID = 'assign_role';
export const USER_CHALLENGE_ID = 'challenge';
export const GRAPHS_SEE_ID = 'see_graphs';

/// All action ids that can be performed in this web
export const all_action_ids = [
	GAMES_CREATE_ID,
	GAMES_EDIT_ID,
	GAMES_DELETE_ID,
	USER_EDIT_ID,
	USER_ROLE_ASSIGN_ID,
	USER_CHALLENGE_ID,
	GAMES_SEE_ID,
	GRAPHS_SEE_ID
] as const;

/// All actions as type
export type UserActionID = (typeof all_action_ids)[number];

export function get_generic_role_action_name(id: UserActionID): UserAction {
	switch (id) {
		case GAMES_CREATE_ID:
			return GAMES_CREATE;
		case GAMES_EDIT_ID:
			return GAMES_EDIT;
		case GAMES_DELETE_ID:
			return GAMES_DELETE;
		case GAMES_SEE_ID:
			return GAMES_SEE;
		case USER_EDIT_ID:
			return USER_EDIT;
		case USER_ROLE_ASSIGN_ID:
			return USER_ROLE_ASSIGN;
		case USER_CHALLENGE_ID:
			return USER_CHALLENGE;
		case GRAPHS_SEE_ID:
			return GRAPHS_SEE_USER;
	}

	throw new Error(`Wrong action identifier ${id}`);
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
export function get_role_action_name(id: UserActionID, r: UserRole): UserAction {
	switch (id) {
		case GAMES_CREATE_ID:
			switch (r) {
				case ADMIN:
					return GAMES_CREATE_ADMIN;
				case TEACHER:
					return GAMES_CREATE_TEACHER;
				case MEMBER:
					return GAMES_CREATE_MEMBER;
				case STUDENT:
					return GAMES_CREATE_STUDENT;
			}
			throw new Error(`Unhandled user role ${r} in ${id}`);
		case GAMES_EDIT_ID:
			switch (r) {
				case ADMIN:
					return GAMES_EDIT_ADMIN;
				case TEACHER:
					return GAMES_EDIT_TEACHER;
				case MEMBER:
					return GAMES_EDIT_MEMBER;
				case STUDENT:
					return GAMES_EDIT_STUDENT;
			}
			throw new Error(`Unhandled user role ${r} in ${id}`);
		case GAMES_DELETE_ID:
			switch (r) {
				case ADMIN:
					return GAMES_DELETE_ADMIN;
				case TEACHER:
					return GAMES_DELETE_TEACHER;
				case MEMBER:
					return GAMES_DELETE_MEMBER;
				case STUDENT:
					return GAMES_DELETE_STUDENT;
			}
			throw new Error(`Unhandled user role ${r} in ${id}`);
		case GAMES_SEE_ID:
			switch (r) {
				case ADMIN:
					return GAMES_SEE_ADMIN;
				case TEACHER:
					return GAMES_SEE_TEACHER;
				case MEMBER:
					return GAMES_SEE_MEMBER;
				case STUDENT:
					return GAMES_SEE_STUDENT;
			}
			throw new Error(`Unhandled user role ${r} in ${id}`);
		case USER_EDIT_ID:
			switch (r) {
				case ADMIN:
					return USER_EDIT_ADMIN;
				case TEACHER:
					return USER_EDIT_TEACHER;
				case MEMBER:
					return USER_EDIT_MEMBER;
				case STUDENT:
					return USER_EDIT_STUDENT;
			}
			throw new Error(`Unhandled user role ${r} in ${id}`);
		case USER_ROLE_ASSIGN_ID:
			switch (r) {
				case ADMIN:
					return USER_ROLE_ASSIGN_ADMIN;
				case TEACHER:
					return USER_ROLE_ASSIGN_TEACHER;
				case MEMBER:
					return USER_ROLE_ASSIGN_MEMBER;
				case STUDENT:
					return USER_ROLE_ASSIGN_STUDENT;
			}
			throw new Error(`Unhandled user role ${r} in ${id}`);
		case USER_CHALLENGE_ID:
			switch (r) {
				case ADMIN:
					return USER_CHALLENGE_ADMIN;
				case TEACHER:
					return USER_CHALLENGE_TEACHER;
				case MEMBER:
					return USER_CHALLENGE_MEMBER;
				case STUDENT:
					return USER_CHALLENGE_STUDENT;
			}
			throw new Error(`Unhandled user role ${r} in ${id}`);
		case GRAPHS_SEE_ID:
			switch (r) {
				case ADMIN:
					return GRAPHS_SEE_ADMIN;
				case TEACHER:
					return GRAPHS_SEE_TEACHER;
				case MEMBER:
					return GRAPHS_SEE_MEMBER;
				case STUDENT:
					return GRAPHS_SEE_STUDENT;
			}
			throw new Error(`Unhandled user role ${r} in ${id}`);
	}

	throw new Error(`Wrong action identifier ${id}`);
}
