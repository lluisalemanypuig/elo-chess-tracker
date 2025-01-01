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

import { Password } from '../../ts-server/models/password';
import { User } from '../../ts-server/models/user';
import { EDIT_STUDENT, EDIT_TEACHER, EDIT_USER } from '../../ts-server/models/user_action';
import { ADMIN, MEMBER, STUDENT, TEACHER } from '../../ts-server/models/user_role';
import { UserRoleToUserAction } from '../../ts-server/models/user_role_action';
import { initialize_permissions } from '../../ts-server/models/user_role_action';
import { can_user_edit } from '../../ts-server/utils/user_relationships';

const editor_admin = new User('un', 'f', 'l', new Password('a', 'b'), [ADMIN], ['2025-01-01'], []);
const editor_teacher = new User('un', 'f', 'l', new Password('a', 'b'), [TEACHER], ['2025-01-01'], []);
const editor_member = new User('un', 'f', 'l', new Password('a', 'b'), [MEMBER], ['2025-01-01'], []);
const editor_student = new User('un', 'f', 'l', new Password('a', 'b'), [STUDENT], ['2025-01-01'], []);

const edited_admin = new User('un', 'f', 'l', new Password('a', 'b'), [ADMIN], ['2024-01-01'], []);
const edited_teacher = new User('un', 'f', 'l', new Password('a', 'b'), [TEACHER], ['2023-01-01'], []);
const edited_member = new User('un', 'f', 'l', new Password('a', 'b'), [MEMBER], ['2022-01-01'], []);
const edited_student = new User('un', 'f', 'l', new Password('a', 'b'), [STUDENT], ['2021-01-01'], []);

describe('Can an ADMIN edit another user?', () => {
	test('Teacher', () => {
		let rel = UserRoleToUserAction.get_instance();
		rel.clear();
		initialize_permissions({
			admin: [EDIT_USER, EDIT_TEACHER],
			teacher: [],
			student: [],
			member: []
		});

		expect(can_user_edit(editor_admin, edited_admin)).toBe(false);
		expect(can_user_edit(editor_admin, edited_teacher)).toBe(true);
		expect(can_user_edit(editor_admin, edited_member)).toBe(false);
		expect(can_user_edit(editor_admin, edited_student)).toBe(false);
	});

	test('Teacher + Student', () => {
		let rel = UserRoleToUserAction.get_instance();
		rel.clear();
		initialize_permissions({
			admin: [EDIT_USER, EDIT_TEACHER, EDIT_STUDENT],
			teacher: [],
			student: [],
			member: []
		});

		expect(can_user_edit(editor_admin, edited_admin)).toBe(false);
		expect(can_user_edit(editor_admin, edited_teacher)).toBe(true);
		expect(can_user_edit(editor_admin, edited_member)).toBe(false);
		expect(can_user_edit(editor_admin, edited_student)).toBe(true);
	});

	test('Teacher + Student (no EDIT_USER permission)', () => {
		let rel = UserRoleToUserAction.get_instance();
		rel.clear();
		initialize_permissions({
			admin: [EDIT_TEACHER, EDIT_STUDENT],
			teacher: [],
			student: [],
			member: []
		});

		expect(can_user_edit(editor_admin, edited_admin)).toBe(false);
		expect(can_user_edit(editor_admin, edited_teacher)).toBe(false);
		expect(can_user_edit(editor_admin, edited_member)).toBe(false);
		expect(can_user_edit(editor_admin, edited_student)).toBe(false);
	});
});

describe('Can a TEACHER edit another user?', () => {
	test('Teacher', () => {
		let rel = UserRoleToUserAction.get_instance();
		rel.clear();
		initialize_permissions({
			admin: [],
			teacher: [EDIT_USER, EDIT_TEACHER],
			student: [],
			member: []
		});

		expect(can_user_edit(editor_teacher, edited_admin)).toBe(false);
		expect(can_user_edit(editor_teacher, edited_teacher)).toBe(true);
		expect(can_user_edit(editor_teacher, edited_member)).toBe(false);
		expect(can_user_edit(editor_teacher, edited_student)).toBe(false);
	});

	test('Teacher + Student', () => {
		let rel = UserRoleToUserAction.get_instance();
		rel.clear();
		initialize_permissions({
			admin: [],
			teacher: [EDIT_USER, EDIT_TEACHER, EDIT_STUDENT],
			student: [],
			member: []
		});

		expect(can_user_edit(editor_teacher, edited_admin)).toBe(false);
		expect(can_user_edit(editor_teacher, edited_teacher)).toBe(true);
		expect(can_user_edit(editor_teacher, edited_member)).toBe(false);
		expect(can_user_edit(editor_teacher, edited_student)).toBe(true);
	});

	test('Teacher + Student (no EDIT_USER permission)', () => {
		let rel = UserRoleToUserAction.get_instance();
		rel.clear();
		initialize_permissions({
			admin: [],
			teacher: [EDIT_TEACHER, EDIT_STUDENT],
			student: [],
			member: []
		});

		expect(can_user_edit(editor_teacher, edited_admin)).toBe(false);
		expect(can_user_edit(editor_teacher, edited_teacher)).toBe(false);
		expect(can_user_edit(editor_teacher, edited_member)).toBe(false);
		expect(can_user_edit(editor_teacher, edited_student)).toBe(false);
	});
});

describe('Can a STUDENT edit another user?', () => {
	test('Teacher', () => {
		let rel = UserRoleToUserAction.get_instance();
		rel.clear();
		initialize_permissions({
			admin: [],
			teacher: [],
			student: [EDIT_USER, EDIT_TEACHER],
			member: []
		});

		expect(can_user_edit(editor_student, edited_admin)).toBe(false);
		expect(can_user_edit(editor_student, edited_teacher)).toBe(true);
		expect(can_user_edit(editor_student, edited_member)).toBe(false);
		expect(can_user_edit(editor_student, edited_student)).toBe(false);
	});

	test('Teacher + Student', () => {
		let rel = UserRoleToUserAction.get_instance();
		rel.clear();
		initialize_permissions({
			admin: [],
			teacher: [],
			student: [EDIT_USER, EDIT_TEACHER, EDIT_STUDENT],
			member: []
		});

		expect(can_user_edit(editor_student, edited_admin)).toBe(false);
		expect(can_user_edit(editor_student, edited_teacher)).toBe(true);
		expect(can_user_edit(editor_student, edited_member)).toBe(false);
		expect(can_user_edit(editor_student, edited_student)).toBe(true);
	});

	test('Teacher + Student (no EDIT_USER permission)', () => {
		let rel = UserRoleToUserAction.get_instance();
		rel.clear();
		initialize_permissions({
			admin: [],
			teacher: [],
			student: [EDIT_TEACHER, EDIT_STUDENT],
			member: []
		});

		expect(can_user_edit(editor_student, edited_admin)).toBe(false);
		expect(can_user_edit(editor_student, edited_teacher)).toBe(false);
		expect(can_user_edit(editor_student, edited_member)).toBe(false);
		expect(can_user_edit(editor_student, edited_student)).toBe(false);
	});
});

describe('Can a MEMBER edit another user?', () => {
	test('Teacher', () => {
		let rel = UserRoleToUserAction.get_instance();
		rel.clear();
		initialize_permissions({
			admin: [],
			teacher: [],
			student: [],
			member: [EDIT_USER, EDIT_TEACHER]
		});

		expect(can_user_edit(editor_member, edited_admin)).toBe(false);
		expect(can_user_edit(editor_member, edited_teacher)).toBe(true);
		expect(can_user_edit(editor_member, edited_member)).toBe(false);
		expect(can_user_edit(editor_member, edited_student)).toBe(false);
	});

	test('Teacher + Student', () => {
		let rel = UserRoleToUserAction.get_instance();
		rel.clear();
		initialize_permissions({
			admin: [],
			teacher: [],
			student: [],
			member: [EDIT_USER, EDIT_TEACHER, EDIT_STUDENT]
		});

		expect(can_user_edit(editor_member, edited_admin)).toBe(false);
		expect(can_user_edit(editor_member, edited_teacher)).toBe(true);
		expect(can_user_edit(editor_member, edited_member)).toBe(false);
		expect(can_user_edit(editor_member, edited_student)).toBe(true);
	});

	test('Teacher + Student (no EDIT_USER permission)', () => {
		let rel = UserRoleToUserAction.get_instance();
		rel.clear();
		initialize_permissions({
			admin: [],
			teacher: [],
			student: [],
			member: [EDIT_TEACHER, EDIT_STUDENT]
		});

		expect(can_user_edit(editor_member, edited_admin)).toBe(false);
		expect(can_user_edit(editor_member, edited_teacher)).toBe(false);
		expect(can_user_edit(editor_member, edited_member)).toBe(false);
		expect(can_user_edit(editor_member, edited_student)).toBe(false);
	});
});
