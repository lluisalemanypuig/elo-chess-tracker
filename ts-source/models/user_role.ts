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

/// Administrator
export const ADMIN = 'admin';
/// Teacher
export const TEACHER = 'teacher';
/// Member
export const MEMBER = 'member';
/// Student
export const STUDENT = 'student';

/**
 * @brief All roles of users as strings.
 * 
 * See below for details on
 */
export const all_user_roles = [
	ADMIN,
	TEACHER,
	MEMBER,
	STUDENT,
];

/// All roles as type
export type UserRole = typeof all_user_roles[number];

/// Relate each user role to a readable string
export const user_role_to_string: { [key in UserRole]: string } = {
	admin: 'Admin',
	teacher: 'Teacher',
	member: 'Member',
	student: 'Student',
}

/// Does the string parameter encode a valid user role?
export function is_role_string_correct(r: string): boolean {
	return all_user_roles.includes(r);
}

// ----------------------------------------------------------------------------

/// Can create users
export const CREATE_USER = 'create_user';

/// Edit a users
export const EDIT_USER = 'edit_user';
/// Edit admin
export const EDIT_ADMIN = 'edit_admin';
/// Edit teacher
export const EDIT_TEACHER = 'edit_teacher';
/// Edit members
export const EDIT_MEMBER = 'edit_member';
/// Edit students
export const EDIT_STUDENT = 'edit_student';

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

/// All actions that can be performed in this web
export const all_actions = [
	CREATE_USER,
	EDIT_USER,
	EDIT_ADMIN,
	EDIT_TEACHER,
	EDIT_MEMBER,
	EDIT_STUDENT,
	ASSIGN_ROLE_ADMIN,
	ASSIGN_ROLE_TEACHER,
	ASSIGN_ROLE_MEMBER,
	ASSIGN_ROLE_STUDENT,
	SEE_USER_GAMES,
	SEE_ADMIN_GAMES,
	SEE_TEACHER_GAMES,
	SEE_MEMBER_GAMES,
	SEE_STUDENT_GAMES,

] as const;

/// All actions as type
export type Action = typeof all_actions[number];

/// Relate each user role to a readable string
export class UserRoleToAction {

	/// The data structure that relates user roles to actions
	private relate: { [key in UserRole]: Action[] } = {};

	/// The only instance of this class
	private static instance: UserRoleToAction;

	constructor() {
		if (UserRoleToAction.instance) {
			return UserRoleToAction.instance;
		}

		this.relate = {
			admin: [],
			teacher: [],
			member: [],
			student: [],
		};

		UserRoleToAction.instance = this;
	}

	/**
	 * @brief Returns the only instance of this class
	 * @returns The only instance of this class
	 * @pre Method @ref initialize must have been called before
	 */
	static get_instance(): UserRoleToAction {
		UserRoleToAction.instance = UserRoleToAction.instance || new UserRoleToAction();
		return UserRoleToAction.instance;
	}

	/// Add action 'action' to role 'role'
	add_to_role(role: UserRole, action: Action): void {
		this.relate[role].push(action);
	}

	/// Return all actions for role 'role'
	get_actions_role(role: UserRole): Action[] {
		return this.relate[role];
	}
}
