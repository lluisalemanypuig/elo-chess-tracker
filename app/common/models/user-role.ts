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
import { isNotDefined } from '@common/utils/is-defined';

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
export const ALL_USER_ROLES = [ADMIN, TEACHER, MEMBER, STUDENT] as const;

/// All roles as type
export type UserRole = (typeof ALL_USER_ROLES)[number];

export const UserRoleSchema = z.enum(ALL_USER_ROLES);

export const UserRoleArraySchema = z.array(UserRoleSchema);

/// Relate each user role to a readable string
export const USER_ROLE_TO_STRING: { [key in UserRole]: string } = {
	admin: 'Admin',
	teacher: 'Teacher',
	member: 'Member',
	student: 'Student'
};

/// Does the string parameter encode a valid user role?
export function isRoleStringCorrect(r: string): boolean {
	return ALL_USER_ROLES.includes(r as UserRole);
}

export function stringToRole(r: string): UserRole | undefined {
	if (r == ADMIN) {
		return ADMIN;
	}
	if (r == TEACHER) {
		return TEACHER;
	}
	if (r == MEMBER) {
		return MEMBER;
	}
	if (r == STUDENT) {
		return STUDENT;
	}
	return undefined;
}

export function arrayStringToRoles(roles: string[]): UserRole[] | undefined {
	let actual_roles: UserRole[] = [];
	for (const role_str of roles) {
		const res = stringToRole(role_str);
		if (isNotDefined(res)) {
			return undefined;
		}
		actual_roles.push(res);
	}
	return actual_roles;
}
