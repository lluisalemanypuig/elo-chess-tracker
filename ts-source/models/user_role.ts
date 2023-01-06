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

/// Create a new user
export const CREATE_NEW_USER = 'create_new_user';
/// Edit an existing user
export const EDIT_EXISTING_USER = 'edit_existing_user';
/// Edit every member
export const EDIT_EVERYONE = 'edit_everyone';
/// Edit a student
export const EDIT_STUDENT = 'edit_student';

/// All actions that can be performed in this web
export const all_actions = [
	CREATE_NEW_USER,
	EDIT_EXISTING_USER,
	EDIT_EVERYONE,
	EDIT_STUDENT

] as const;

/// All actions as type
export type Action = typeof all_actions[number];

/// Relate each user role to a readable string
export const user_role_to_action: { [key in UserRole]: Action[] } = {
	admin: [
		CREATE_NEW_USER,
		EDIT_EXISTING_USER,
		EDIT_EVERYONE,
	],
	
	teacher: [
		EDIT_EXISTING_USER,
		EDIT_STUDENT,
	],

	member: [

	],

	student: [

	],
}
