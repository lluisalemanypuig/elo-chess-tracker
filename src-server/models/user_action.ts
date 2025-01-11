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
export const CREATE_GAME = 'create_game';

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
export const EDIT_USER_GAMES = 'edit_user_games';
/// Can edit admin games
export const EDIT_ADMIN_GAMES = 'edit_admin_games';
/// Can edit teacher games
export const EDIT_TEACHER_GAMES = 'edit_teacher_games';
/// Can edit member games
export const EDIT_MEMBER_GAMES = 'edit_member_games';
/// Can edit student games
export const EDIT_STUDENT_GAMES = 'edit_student_games';

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
export const SEE_USER_GAMES = 'see_user_games';
/// Can see admin's games
export const SEE_ADMIN_GAMES = 'see_admin_games';
/// Can see teacher's games
export const SEE_TEACHER_GAMES = 'see_teacher_games';
/// Can see members' games
export const SEE_MEMBER_GAMES = 'see_member_games';
/// Can see student' games
export const SEE_STUDENT_GAMES = 'see_student_games';

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
	CREATE_GAME,

	EDIT_USER,
	EDIT_ADMIN,
	EDIT_TEACHER,
	EDIT_MEMBER,
	EDIT_STUDENT,

	EDIT_USER_GAMES,
	EDIT_ADMIN_GAMES,
	EDIT_TEACHER_GAMES,
	EDIT_MEMBER_GAMES,
	EDIT_STUDENT_GAMES,

	ASSIGN_ROLE_USER,
	ASSIGN_ROLE_ADMIN,
	ASSIGN_ROLE_TEACHER,
	ASSIGN_ROLE_MEMBER,
	ASSIGN_ROLE_STUDENT,

	SEE_USER_GAMES,
	SEE_ADMIN_GAMES,
	SEE_TEACHER_GAMES,
	SEE_MEMBER_GAMES,
	SEE_STUDENT_GAMES,

	CHALLENGE_USER,
	CHALLENGE_ADMIN,
	CHALLENGE_TEACHER,
	CHALLENGE_MEMBER,
	CHALLENGE_STUDENT
] as const;

/// All actions as type
export type UserAction = (typeof all_actions)[number];

// -----------------------------------------------------------------------------

export const EDIT_ID = 'edit';
export const EDIT_GAMES_ID = 'edit_games';
export const ASSIGN_ROLE_ID = 'assign';
export const SEE_ID = 'see';
export const CHALLENGE_ID = 'challenge';

/// All action ids that can be performed in this web
export const all_action_ids = [EDIT_ID, EDIT_GAMES_ID, ASSIGN_ROLE_ID, SEE_ID, CHALLENGE_ID] as const;

/// All actions as type
export type UserActionID = (typeof all_action_ids)[number];

export function get_generic_role_action_name(id: UserActionID): UserAction {
	switch (id) {
		case EDIT_ID:
			return EDIT_USER;
		case EDIT_GAMES_ID:
			return EDIT_USER_GAMES;
		case ASSIGN_ROLE_ID:
			return ASSIGN_ROLE_USER;
		case SEE_ID:
			return SEE_USER_GAMES;
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
		case EDIT_ID:
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
					return EDIT_ADMIN_GAMES;
				case TEACHER:
					return EDIT_TEACHER_GAMES;
				case MEMBER:
					return EDIT_MEMBER_GAMES;
				case STUDENT:
					return EDIT_STUDENT_GAMES;
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
		case SEE_ID:
			switch (r) {
				case ADMIN:
					return SEE_ADMIN_GAMES;
				case TEACHER:
					return SEE_TEACHER_GAMES;
				case MEMBER:
					return SEE_MEMBER_GAMES;
				case STUDENT:
					return SEE_STUDENT_GAMES;
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
