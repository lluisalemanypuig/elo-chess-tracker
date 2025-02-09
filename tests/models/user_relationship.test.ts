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

import { Password } from '../../src-server/models/password';
import { User } from '../../src-server/models/user';
import {
	EDIT_STUDENT,
	EDIT_TEACHER,
	EDIT_ADMIN_GAMES,
	EDIT_STUDENT_GAMES,
	EDIT_TEACHER_GAMES,
	EDIT_MEMBER_GAMES,
	SEE_ADMIN_GAMES,
	SEE_MEMBER_GAMES,
	SEE_STUDENT_GAMES
} from '../../src-server/models/user_action';
import { ADMIN, MEMBER, STUDENT, TEACHER } from '../../src-server/models/user_role';
import { UserRoleToUserAction } from '../../src-server/models/user_role_action';
import { initialize_permissions } from '../../src-server/models/user_role_action';
import { can_user_edit, can_user_edit_a_game, can_user_see_a_game } from '../../src-server/utils/user_relationships';

describe('Edition', () => {
	const editor_admin = new User('un', 'f', 'l', new Password('a', 'b'), [ADMIN], [], []);
	const editor_teacher = new User('un', 'f', 'l', new Password('a', 'b'), [TEACHER], [], []);
	const editor_member = new User('un', 'f', 'l', new Password('a', 'b'), [MEMBER], [], []);
	const editor_student = new User('un', 'f', 'l', new Password('a', 'b'), [STUDENT], [], []);

	const edited_admin = new User('un', 'f', 'l', new Password('a', 'b'), [ADMIN], [], []);
	const edited_teacher = new User('un', 'f', 'l', new Password('a', 'b'), [TEACHER], [], []);
	const edited_member = new User('un', 'f', 'l', new Password('a', 'b'), [MEMBER], [], []);
	const edited_student = new User('un', 'f', 'l', new Password('a', 'b'), [STUDENT], [], []);

	test('Admin -> Teacher', () => {
		let rel = UserRoleToUserAction.get_instance();
		rel.clear();
		initialize_permissions({
			admin: [EDIT_TEACHER],
			teacher: [],
			student: [],
			member: []
		});

		expect(can_user_edit(editor_admin, edited_admin)).toBe(false);
		expect(can_user_edit(editor_admin, edited_teacher)).toBe(true);
		expect(can_user_edit(editor_admin, edited_member)).toBe(false);
		expect(can_user_edit(editor_admin, edited_student)).toBe(false);
	});

	test('Admin -> Teacher + Student', () => {
		let rel = UserRoleToUserAction.get_instance();
		rel.clear();
		initialize_permissions({
			admin: [EDIT_TEACHER, EDIT_STUDENT],
			teacher: [],
			student: [],
			member: []
		});

		expect(can_user_edit(editor_admin, edited_admin)).toBe(false);
		expect(can_user_edit(editor_admin, edited_teacher)).toBe(true);
		expect(can_user_edit(editor_admin, edited_member)).toBe(false);
		expect(can_user_edit(editor_admin, edited_student)).toBe(true);
	});

	test('Teacher -> Teacher', () => {
		let rel = UserRoleToUserAction.get_instance();
		rel.clear();
		initialize_permissions({
			admin: [],
			teacher: [EDIT_TEACHER],
			student: [],
			member: []
		});

		expect(can_user_edit(editor_teacher, edited_admin)).toBe(false);
		expect(can_user_edit(editor_teacher, edited_teacher)).toBe(true);
		expect(can_user_edit(editor_teacher, edited_member)).toBe(false);
		expect(can_user_edit(editor_teacher, edited_student)).toBe(false);
	});

	test('Teacher -> Teacher + Student', () => {
		let rel = UserRoleToUserAction.get_instance();
		rel.clear();
		initialize_permissions({
			admin: [],
			teacher: [EDIT_TEACHER, EDIT_STUDENT],
			student: [],
			member: []
		});

		expect(can_user_edit(editor_teacher, edited_admin)).toBe(false);
		expect(can_user_edit(editor_teacher, edited_teacher)).toBe(true);
		expect(can_user_edit(editor_teacher, edited_member)).toBe(false);
		expect(can_user_edit(editor_teacher, edited_student)).toBe(true);
	});

	test('Student -> Teacher', () => {
		let rel = UserRoleToUserAction.get_instance();
		rel.clear();
		initialize_permissions({
			admin: [],
			teacher: [],
			student: [EDIT_TEACHER],
			member: []
		});

		expect(can_user_edit(editor_student, edited_admin)).toBe(false);
		expect(can_user_edit(editor_student, edited_teacher)).toBe(true);
		expect(can_user_edit(editor_student, edited_member)).toBe(false);
		expect(can_user_edit(editor_student, edited_student)).toBe(false);
	});

	test('Student -> Teacher + Student', () => {
		let rel = UserRoleToUserAction.get_instance();
		rel.clear();
		initialize_permissions({
			admin: [],
			teacher: [],
			student: [EDIT_TEACHER, EDIT_STUDENT],
			member: []
		});

		expect(can_user_edit(editor_student, edited_admin)).toBe(false);
		expect(can_user_edit(editor_student, edited_teacher)).toBe(true);
		expect(can_user_edit(editor_student, edited_member)).toBe(false);
		expect(can_user_edit(editor_student, edited_student)).toBe(true);
	});

	test('Member -> Teacher', () => {
		let rel = UserRoleToUserAction.get_instance();
		rel.clear();
		initialize_permissions({
			admin: [],
			teacher: [],
			student: [],
			member: [EDIT_TEACHER]
		});

		expect(can_user_edit(editor_member, edited_admin)).toBe(false);
		expect(can_user_edit(editor_member, edited_teacher)).toBe(true);
		expect(can_user_edit(editor_member, edited_member)).toBe(false);
		expect(can_user_edit(editor_member, edited_student)).toBe(false);
	});

	test('Member -> Teacher + Student', () => {
		let rel = UserRoleToUserAction.get_instance();
		rel.clear();
		initialize_permissions({
			admin: [],
			teacher: [],
			student: [],
			member: [EDIT_TEACHER, EDIT_STUDENT]
		});

		expect(can_user_edit(editor_member, edited_admin)).toBe(false);
		expect(can_user_edit(editor_member, edited_teacher)).toBe(true);
		expect(can_user_edit(editor_member, edited_member)).toBe(false);
		expect(can_user_edit(editor_member, edited_student)).toBe(true);
	});
});

describe('Can a user see a game?', () => {
	const admin = new User('un', 'f', 'l', new Password('a', 'b'), [ADMIN], [], []);
	const teacher = new User('un', 'f', 'l', new Password('a', 'b'), [TEACHER], [], []);
	const member = new User('un', 'f', 'l', new Password('a', 'b'), [MEMBER], [], []);
	const student = new User('un', 'f', 'l', new Password('a', 'b'), [STUDENT], [], []);

	test('Admin', () => {
		let rel = UserRoleToUserAction.get_instance();
		rel.clear();
		initialize_permissions({
			admin: [SEE_ADMIN_GAMES, SEE_MEMBER_GAMES],
			teacher: [],
			student: [],
			member: []
		});

		expect(can_user_see_a_game(admin, teacher, member)).toBe(true);
		expect(can_user_see_a_game(admin, teacher, student)).toBe(false);
		expect(can_user_see_a_game(admin, student, member)).toBe(true);
		expect(can_user_see_a_game(admin, admin, member)).toBe(true);
	});

	test('Teacher', () => {
		let rel = UserRoleToUserAction.get_instance();
		rel.clear();
		initialize_permissions({
			admin: [],
			teacher: [SEE_ADMIN_GAMES, SEE_STUDENT_GAMES],
			student: [],
			member: []
		});

		expect(can_user_see_a_game(teacher, teacher, member)).toBe(false);
		expect(can_user_see_a_game(teacher, teacher, student)).toBe(true);
		expect(can_user_see_a_game(teacher, student, member)).toBe(true);
		expect(can_user_see_a_game(teacher, admin, member)).toBe(true);
	});
});

describe('Can a user edit a game?', () => {
	const admin = new User('un', 'f', 'l', new Password('a', 'b'), [ADMIN], [], []);
	const teacher = new User('un', 'f', 'l', new Password('a', 'b'), [TEACHER], [], []);
	const member = new User('un', 'f', 'l', new Password('a', 'b'), [MEMBER], [], []);
	const student = new User('un', 'f', 'l', new Password('a', 'b'), [STUDENT], [], []);

	test('Admin', () => {
		let rel = UserRoleToUserAction.get_instance();
		rel.clear();
		initialize_permissions({
			admin: [EDIT_ADMIN_GAMES, EDIT_MEMBER_GAMES],
			teacher: [],
			student: [],
			member: []
		});

		expect(can_user_edit_a_game(admin, teacher, member)).toBe(true);
		expect(can_user_edit_a_game(admin, teacher, student)).toBe(false);
		expect(can_user_edit_a_game(admin, student, member)).toBe(true);
		expect(can_user_edit_a_game(admin, admin, member)).toBe(true);
	});

	test('Teacher (1)', () => {
		let rel = UserRoleToUserAction.get_instance();
		rel.clear();
		initialize_permissions({
			admin: [],
			teacher: [EDIT_ADMIN_GAMES, EDIT_STUDENT_GAMES],
			student: [],
			member: []
		});

		expect(can_user_edit_a_game(teacher, teacher, member)).toBe(false);
		expect(can_user_edit_a_game(teacher, teacher, student)).toBe(true);
		expect(can_user_edit_a_game(teacher, student, member)).toBe(true);
		expect(can_user_edit_a_game(teacher, admin, member)).toBe(true);
	});

	test('Teacher (2)', () => {
		let rel = UserRoleToUserAction.get_instance();
		rel.clear();
		initialize_permissions({
			admin: [],
			teacher: [EDIT_ADMIN_GAMES, EDIT_TEACHER_GAMES],
			student: [],
			member: []
		});

		expect(can_user_edit_a_game(teacher, teacher, member)).toBe(true);
		expect(can_user_edit_a_game(teacher, teacher, student)).toBe(true);
		expect(can_user_edit_a_game(teacher, student, member)).toBe(false);
		expect(can_user_edit_a_game(teacher, admin, member)).toBe(true);
	});
});
