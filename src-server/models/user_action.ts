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

import { ADMIN, MEMBER, STUDENT, TEACHER, UserRole } from './user_role';

/// Can create users
export const CREATE_USER = 'create_user';

/// Can create games
export const CREATE_GAMES = 'create_games';
/// Can create games where a player is an admin
export const CREATE_GAMES_ADMIN = 'create_games_admin';
/// Can create games where a player is a teacher
export const CREATE_GAMES_TEACHER = 'create_games_teacher';
/// Can create games where a player is a member
export const CREATE_GAMES_MEMBER = 'create_games_member';
/// Can create games where a player is a student
export const CREATE_GAMES_STUDENT = 'create_games_student';

/// Edit a user
export const EDIT_USER = 'edit_user';
/// Edit admin
export const EDIT_ADMIN = 'edit_admin';
/// Edit teacher
export const EDIT_TEACHER = 'edit_teacher';
/// Edit members
export const EDIT_MEMBER = 'edit_member';
/// Edit students
export const EDIT_STUDENT = 'edit_student';

/// Can edit user games
export const EDIT_GAMES_USER = 'edit_games_user';
/// Can edit admin games
export const EDIT_GAMES_ADMIN = 'edit_games_admin';
/// Can edit teacher games
export const EDIT_GAMES_TEACHER = 'edit_games_teacher';
/// Can edit member games
export const EDIT_GAMES_MEMBER = 'edit_games_member';
/// Can edit student games
export const EDIT_GAMES_STUDENT = 'edit_games_student';

/// Assign a role to a user
export const ASSIGN_ROLE_USER = 'assign_role_user';
/// Assign admin role
export const ASSIGN_ROLE_ADMIN = 'assign_role_admin';
/// Assign teacher role
export const ASSIGN_ROLE_TEACHER = 'assign_role_teacher';
/// Assign member role
export const ASSIGN_ROLE_MEMBER = 'assign_role_member';
/// Assign student role
export const ASSIGN_ROLE_STUDENT = 'assign_role_student';

/// Can see a users games
export const SEE_GAMES_USER = 'see_games_user';
/// Can see admin's games
export const SEE_GAMES_ADMIN = 'see_games_admin';
/// Can see teacher's games
export const SEE_GAMES_TEACHER = 'see_games_teacher';
/// Can see members' games
export const SEE_GAMES_MEMBER = 'see_games_member';
/// Can see student' games
export const SEE_GAMES_STUDENT = 'see_games_student';

/// Can see graphs
export const SEE_GRAPHS_USER = 'see_graphs_user';
/// Can see an admin's graphs
export const SEE_GRAPHS_ADMIN = 'see_graphs_admin';
/// Can see an teacher's graphs
export const SEE_GRAPHS_TEACHER = 'see_graphs_teacher';
/// Can see an member's graphs
export const SEE_GRAPHS_MEMBER = 'see_graphs_member';
/// Can see an student's graphs
export const SEE_GRAPHS_STUDENT = 'see_graphs_student';

/// Can challenge a user
export const CHALLENGE_USER = 'challenge_user';
/// Can see admin's games
export const CHALLENGE_ADMIN = 'challenge_admin';
/// Can see teacher's games
export const CHALLENGE_MEMBER = 'challenge_member';
/// Can see members' games
export const CHALLENGE_TEACHER = 'challenge_teacher';
/// Can see student' games
export const CHALLENGE_STUDENT = 'challenge_student';

/// All actions that can be performed in this web
export const all_actions = [
	CREATE_USER,

	CREATE_GAMES,
	CREATE_GAMES_ADMIN,
	CREATE_GAMES_TEACHER,
	CREATE_GAMES_MEMBER,
	CREATE_GAMES_STUDENT,

	EDIT_USER,
	EDIT_ADMIN,
	EDIT_TEACHER,
	EDIT_MEMBER,
	EDIT_STUDENT,

	EDIT_GAMES_USER,
	EDIT_GAMES_ADMIN,
	EDIT_GAMES_TEACHER,
	EDIT_GAMES_MEMBER,
	EDIT_GAMES_STUDENT,

	ASSIGN_ROLE_USER,
	ASSIGN_ROLE_ADMIN,
	ASSIGN_ROLE_TEACHER,
	ASSIGN_ROLE_MEMBER,
	ASSIGN_ROLE_STUDENT,

	SEE_GAMES_USER,
	SEE_GAMES_ADMIN,
	SEE_GAMES_TEACHER,
	SEE_GAMES_MEMBER,
	SEE_GAMES_STUDENT,

	SEE_GRAPHS_USER,
	SEE_GRAPHS_ADMIN,
	SEE_GRAPHS_TEACHER,
	SEE_GRAPHS_MEMBER,
	SEE_GRAPHS_STUDENT,

	CHALLENGE_USER,
	CHALLENGE_ADMIN,
	CHALLENGE_TEACHER,
	CHALLENGE_MEMBER,
	CHALLENGE_STUDENT
] as const;

/// All actions as type
export type UserAction = (typeof all_actions)[number];

// -----------------------------------------------------------------------------

export const CREATE_GAME_ID = 'create_game';
export const EDIT_USERS_ID = 'edit_users';
export const EDIT_GAMES_ID = 'edit_games';
export const ASSIGN_ROLE_ID = 'assign_role';
export const SEE_GAMES_ID = 'see_games';
export const SEE_GRAPHS_ID = 'see_graphs';
export const CHALLENGE_ID = 'challenge';

/// All action ids that can be performed in this web
export const all_action_ids = [
	CREATE_GAME_ID,
	EDIT_USERS_ID,
	EDIT_GAMES_ID,
	ASSIGN_ROLE_ID,
	SEE_GAMES_ID,
	SEE_GRAPHS_ID,
	CHALLENGE_ID
] as const;

/// All actions as type
export type UserActionID = (typeof all_action_ids)[number];

export function get_generic_role_action_name(id: UserActionID): UserAction {
	switch (id) {
		case CREATE_GAME_ID:
			return CREATE_GAMES;
		case EDIT_USERS_ID:
			return EDIT_USER;
		case EDIT_GAMES_ID:
			return EDIT_GAMES_USER;
		case ASSIGN_ROLE_ID:
			return ASSIGN_ROLE_USER;
		case SEE_GAMES_ID:
			return SEE_GAMES_USER;
		case SEE_GRAPHS_ID:
			return SEE_GRAPHS_USER;
		case CHALLENGE_ID:
			return CHALLENGE_USER;
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
 *    result: EDIT_ADMIN (UserAction)
 */
export function get_role_action_name(id: UserActionID, r: UserRole): UserAction {
	switch (id) {
		case CREATE_GAME_ID:
			switch (r) {
				case ADMIN:
					return CREATE_GAMES_ADMIN;
				case TEACHER:
					return CREATE_GAMES_TEACHER;
				case MEMBER:
					return CREATE_GAMES_MEMBER;
				case STUDENT:
					return CREATE_GAMES_STUDENT;
			}
			throw new Error(`Unhandled user role ${r} in ${id}`);
		case EDIT_USERS_ID:
			switch (r) {
				case ADMIN:
					return EDIT_ADMIN;
				case TEACHER:
					return EDIT_TEACHER;
				case MEMBER:
					return EDIT_MEMBER;
				case STUDENT:
					return EDIT_STUDENT;
			}
			throw new Error(`Unhandled user role ${r} in ${id}`);
		case EDIT_GAMES_ID:
			switch (r) {
				case ADMIN:
					return EDIT_GAMES_ADMIN;
				case TEACHER:
					return EDIT_GAMES_TEACHER;
				case MEMBER:
					return EDIT_GAMES_MEMBER;
				case STUDENT:
					return EDIT_GAMES_STUDENT;
			}
			throw new Error(`Unhandled user role ${r} in ${id}`);
		case ASSIGN_ROLE_ID:
			switch (r) {
				case ADMIN:
					return ASSIGN_ROLE_ADMIN;
				case TEACHER:
					return ASSIGN_ROLE_TEACHER;
				case MEMBER:
					return ASSIGN_ROLE_MEMBER;
				case STUDENT:
					return ASSIGN_ROLE_STUDENT;
			}
			throw new Error(`Unhandled user role ${r} in ${id}`);
		case SEE_GAMES_ID:
			switch (r) {
				case ADMIN:
					return SEE_GAMES_ADMIN;
				case TEACHER:
					return SEE_GAMES_TEACHER;
				case MEMBER:
					return SEE_GAMES_MEMBER;
				case STUDENT:
					return SEE_GAMES_STUDENT;
			}
			throw new Error(`Unhandled user role ${r} in ${id}`);
		case SEE_GRAPHS_ID:
			switch (r) {
				case ADMIN:
					return SEE_GRAPHS_ADMIN;
				case TEACHER:
					return SEE_GRAPHS_TEACHER;
				case MEMBER:
					return SEE_GRAPHS_MEMBER;
				case STUDENT:
					return SEE_GRAPHS_STUDENT;
			}
			throw new Error(`Unhandled user role ${r} in ${id}`);
		case CHALLENGE_ID:
			switch (r) {
				case ADMIN:
					return CHALLENGE_ADMIN;
				case TEACHER:
					return CHALLENGE_TEACHER;
				case MEMBER:
					return CHALLENGE_MEMBER;
				case STUDENT:
					return CHALLENGE_STUDENT;
			}
			throw new Error(`Unhandled user role ${r} in ${id}`);
	}

	throw new Error(`Wrong action identifier ${id}`);
}
