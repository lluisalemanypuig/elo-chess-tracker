/*
Elo rating for a Chess Club
Copyright (C) 2023 - 2024  Lluís Alemany Puig

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

import {
	ADMIN,
	all_user_roles,
	is_role_string_correct,
	MEMBER,
	STUDENT,
	TEACHER,
	user_role_to_string
} from '../../ts-server/models/user_role';

test('Array of all roles', () => {
	expect(all_user_roles.length).toBe(4);
});

test('Human-readable strings', () => {
	expect(user_role_to_string[ADMIN]).toEqual('Admin');
	expect(user_role_to_string['admin']).toEqual('Admin');

	expect(user_role_to_string[TEACHER]).toEqual('Teacher');
	expect(user_role_to_string['teacher']).toEqual('Teacher');

	expect(user_role_to_string[MEMBER]).toEqual('Member');
	expect(user_role_to_string['member']).toEqual('Member');

	expect(user_role_to_string[STUDENT]).toEqual('Student');
	expect(user_role_to_string['student']).toEqual('Student');
});

test('Correct roles', () => {
	expect(is_role_string_correct('admin')).toBe(true);
	expect(is_role_string_correct('admi')).toBe(false);
	expect(is_role_string_correct('admin!')).toBe(false);
	expect(is_role_string_correct('Admin')).toBe(false);

	expect(is_role_string_correct('teacher')).toBe(true);
	expect(is_role_string_correct('teach')).toBe(false);
	expect(is_role_string_correct('teacher!')).toBe(false);
	expect(is_role_string_correct('Teacher')).toBe(false);

	expect(is_role_string_correct('member')).toBe(true);
	expect(is_role_string_correct('memb')).toBe(false);
	expect(is_role_string_correct('memberi')).toBe(false);
	expect(is_role_string_correct('Member')).toBe(false);

	expect(is_role_string_correct('student')).toBe(true);
	expect(is_role_string_correct('stud')).toBe(false);
	expect(is_role_string_correct('student!')).toBe(false);
	expect(is_role_string_correct('Student')).toBe(false);
});
