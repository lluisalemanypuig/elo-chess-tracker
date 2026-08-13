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

import { ALL_USER_ROLES, isRoleStringCorrect, USER_ROLE_TO_STRING } from '@common/models/user-role';

test('Array of all roles', () => {
	expect(ALL_USER_ROLES.length).toBe(4);
});

test('Human-readable strings', () => {
	expect(USER_ROLE_TO_STRING['ADMIN']).toEqual('Admin');
	expect(USER_ROLE_TO_STRING['TEACHER']).toEqual('Teacher');
	expect(USER_ROLE_TO_STRING['MEMBER']).toEqual('Member');
	expect(USER_ROLE_TO_STRING['STUDENT']).toEqual('Student');
});

test('Correct roles', () => {
	expect(isRoleStringCorrect('ADMIN')).toBe(true);
	expect(isRoleStringCorrect('admin')).toBe(false);
	expect(isRoleStringCorrect('admi')).toBe(false);
	expect(isRoleStringCorrect('admin!')).toBe(false);
	expect(isRoleStringCorrect('Admin')).toBe(false);

	expect(isRoleStringCorrect('TEACHER')).toBe(true);
	expect(isRoleStringCorrect('teacher')).toBe(false);
	expect(isRoleStringCorrect('teach')).toBe(false);
	expect(isRoleStringCorrect('teacher!')).toBe(false);
	expect(isRoleStringCorrect('Teacher')).toBe(false);

	expect(isRoleStringCorrect('MEMBER')).toBe(true);
	expect(isRoleStringCorrect('member')).toBe(false);
	expect(isRoleStringCorrect('memb')).toBe(false);
	expect(isRoleStringCorrect('memberi')).toBe(false);
	expect(isRoleStringCorrect('Member')).toBe(false);

	expect(isRoleStringCorrect('STUDENT')).toBe(true);
	expect(isRoleStringCorrect('student')).toBe(false);
	expect(isRoleStringCorrect('stud')).toBe(false);
	expect(isRoleStringCorrect('student!')).toBe(false);
	expect(isRoleStringCorrect('Student')).toBe(false);
});
