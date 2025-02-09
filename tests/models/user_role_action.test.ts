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

import {
	ASSIGN_ROLE_ADMIN,
	ASSIGN_ROLE_MEMBER,
	ASSIGN_ROLE_STUDENT,
	ASSIGN_ROLE_TEACHER,
	ASSIGN_ROLE_USER,
	CHALLENGE_ADMIN,
	CHALLENGE_MEMBER,
	CHALLENGE_STUDENT,
	CHALLENGE_TEACHER,
	CHALLENGE_USER,
	CREATE_GAMES,
	CREATE_USER,
	EDIT_ADMIN,
	EDIT_MEMBER,
	EDIT_STUDENT,
	EDIT_TEACHER,
	EDIT_USER,
	EDIT_GAMES_ADMIN,
	EDIT_GAMES_MEMBER,
	EDIT_GAMES_STUDENT,
	EDIT_GAMES_TEACHER,
	EDIT_GAMES_USER,
	SEE_GAMES_ADMIN,
	SEE_GAMES_MEMBER,
	SEE_GAMES_STUDENT,
	SEE_GAMES_TEACHER,
	SEE_GAMES_USER
} from '../../src-server/models/user_action';
import { ADMIN, MEMBER, STUDENT, TEACHER } from '../../src-server/models/user_role';
import { initialize_permissions, UserRoleToUserAction } from '../../src-server/models/user_role_action';

describe('Actions allowed per user (single role)', () => {
	test('Admin', () => {
		let rel = UserRoleToUserAction.get_instance();
		rel.clear();
		initialize_permissions({
			admin: [EDIT_TEACHER],
			teacher: [],
			student: [],
			member: []
		});

		expect(rel.role_includes_action(ADMIN, CREATE_USER)).toBe(false);
		expect(rel.role_includes_action(ADMIN, CREATE_GAMES)).toBe(false);
		expect(rel.role_includes_action(ADMIN, EDIT_USER)).toBe(true);
		expect(rel.role_includes_action(ADMIN, EDIT_ADMIN)).toBe(false);
		expect(rel.role_includes_action(ADMIN, EDIT_TEACHER)).toBe(true);
		expect(rel.role_includes_action(ADMIN, EDIT_MEMBER)).toBe(false);
		expect(rel.role_includes_action(ADMIN, EDIT_STUDENT)).toBe(false);
		expect(rel.role_includes_action(ADMIN, EDIT_GAMES_USER)).toBe(false);
		expect(rel.role_includes_action(ADMIN, EDIT_GAMES_ADMIN)).toBe(false);
		expect(rel.role_includes_action(ADMIN, EDIT_GAMES_TEACHER)).toBe(false);
		expect(rel.role_includes_action(ADMIN, EDIT_GAMES_MEMBER)).toBe(false);
		expect(rel.role_includes_action(ADMIN, EDIT_GAMES_STUDENT)).toBe(false);
		expect(rel.role_includes_action(ADMIN, ASSIGN_ROLE_USER)).toBe(false);
		expect(rel.role_includes_action(ADMIN, ASSIGN_ROLE_ADMIN)).toBe(false);
		expect(rel.role_includes_action(ADMIN, ASSIGN_ROLE_TEACHER)).toBe(false);
		expect(rel.role_includes_action(ADMIN, ASSIGN_ROLE_MEMBER)).toBe(false);
		expect(rel.role_includes_action(ADMIN, ASSIGN_ROLE_STUDENT)).toBe(false);
		expect(rel.role_includes_action(ADMIN, SEE_GAMES_USER)).toBe(false);
		expect(rel.role_includes_action(ADMIN, SEE_GAMES_ADMIN)).toBe(false);
		expect(rel.role_includes_action(ADMIN, SEE_GAMES_TEACHER)).toBe(false);
		expect(rel.role_includes_action(ADMIN, SEE_GAMES_MEMBER)).toBe(false);
		expect(rel.role_includes_action(ADMIN, SEE_GAMES_STUDENT)).toBe(false);
		expect(rel.role_includes_action(ADMIN, CHALLENGE_USER)).toBe(false);
		expect(rel.role_includes_action(ADMIN, CHALLENGE_ADMIN)).toBe(false);
		expect(rel.role_includes_action(ADMIN, CHALLENGE_MEMBER)).toBe(false);
		expect(rel.role_includes_action(ADMIN, CHALLENGE_TEACHER)).toBe(false);
		expect(rel.role_includes_action(ADMIN, CHALLENGE_STUDENT)).toBe(false);
	});

	test('Teacher', () => {
		let rel = UserRoleToUserAction.get_instance();
		rel.clear();
		initialize_permissions({
			admin: [],
			teacher: [ASSIGN_ROLE_MEMBER],
			student: [],
			member: []
		});

		expect(rel.role_includes_action(TEACHER, CREATE_USER)).toBe(false);
		expect(rel.role_includes_action(TEACHER, CREATE_GAMES)).toBe(false);
		expect(rel.role_includes_action(TEACHER, EDIT_USER)).toBe(false);
		expect(rel.role_includes_action(TEACHER, EDIT_ADMIN)).toBe(false);
		expect(rel.role_includes_action(TEACHER, EDIT_TEACHER)).toBe(false);
		expect(rel.role_includes_action(TEACHER, EDIT_MEMBER)).toBe(false);
		expect(rel.role_includes_action(TEACHER, EDIT_STUDENT)).toBe(false);
		expect(rel.role_includes_action(TEACHER, EDIT_GAMES_USER)).toBe(false);
		expect(rel.role_includes_action(TEACHER, EDIT_GAMES_ADMIN)).toBe(false);
		expect(rel.role_includes_action(TEACHER, EDIT_GAMES_TEACHER)).toBe(false);
		expect(rel.role_includes_action(TEACHER, EDIT_GAMES_MEMBER)).toBe(false);
		expect(rel.role_includes_action(TEACHER, EDIT_GAMES_STUDENT)).toBe(false);
		expect(rel.role_includes_action(TEACHER, ASSIGN_ROLE_USER)).toBe(true);
		expect(rel.role_includes_action(TEACHER, ASSIGN_ROLE_ADMIN)).toBe(false);
		expect(rel.role_includes_action(TEACHER, ASSIGN_ROLE_TEACHER)).toBe(false);
		expect(rel.role_includes_action(TEACHER, ASSIGN_ROLE_MEMBER)).toBe(true);
		expect(rel.role_includes_action(TEACHER, ASSIGN_ROLE_STUDENT)).toBe(false);
		expect(rel.role_includes_action(TEACHER, SEE_GAMES_USER)).toBe(false);
		expect(rel.role_includes_action(TEACHER, SEE_GAMES_ADMIN)).toBe(false);
		expect(rel.role_includes_action(TEACHER, SEE_GAMES_TEACHER)).toBe(false);
		expect(rel.role_includes_action(TEACHER, SEE_GAMES_MEMBER)).toBe(false);
		expect(rel.role_includes_action(TEACHER, SEE_GAMES_STUDENT)).toBe(false);
		expect(rel.role_includes_action(TEACHER, CHALLENGE_USER)).toBe(false);
		expect(rel.role_includes_action(TEACHER, CHALLENGE_ADMIN)).toBe(false);
		expect(rel.role_includes_action(TEACHER, CHALLENGE_MEMBER)).toBe(false);
		expect(rel.role_includes_action(TEACHER, CHALLENGE_TEACHER)).toBe(false);
		expect(rel.role_includes_action(TEACHER, CHALLENGE_STUDENT)).toBe(false);
	});

	test('Student', () => {
		let rel = UserRoleToUserAction.get_instance();
		rel.clear();
		initialize_permissions({
			admin: [],
			teacher: [],
			student: [CREATE_USER, CREATE_GAMES],
			member: []
		});

		expect(rel.role_includes_action(STUDENT, CREATE_USER)).toBe(true);
		expect(rel.role_includes_action(STUDENT, CREATE_GAMES)).toBe(true);
		expect(rel.role_includes_action(STUDENT, EDIT_USER)).toBe(false);
		expect(rel.role_includes_action(STUDENT, EDIT_ADMIN)).toBe(false);
		expect(rel.role_includes_action(STUDENT, EDIT_TEACHER)).toBe(false);
		expect(rel.role_includes_action(STUDENT, EDIT_MEMBER)).toBe(false);
		expect(rel.role_includes_action(STUDENT, EDIT_STUDENT)).toBe(false);
		expect(rel.role_includes_action(STUDENT, EDIT_GAMES_USER)).toBe(false);
		expect(rel.role_includes_action(STUDENT, EDIT_GAMES_ADMIN)).toBe(false);
		expect(rel.role_includes_action(STUDENT, EDIT_GAMES_TEACHER)).toBe(false);
		expect(rel.role_includes_action(STUDENT, EDIT_GAMES_MEMBER)).toBe(false);
		expect(rel.role_includes_action(STUDENT, EDIT_GAMES_STUDENT)).toBe(false);
		expect(rel.role_includes_action(STUDENT, ASSIGN_ROLE_USER)).toBe(false);
		expect(rel.role_includes_action(STUDENT, ASSIGN_ROLE_ADMIN)).toBe(false);
		expect(rel.role_includes_action(STUDENT, ASSIGN_ROLE_TEACHER)).toBe(false);
		expect(rel.role_includes_action(STUDENT, ASSIGN_ROLE_MEMBER)).toBe(false);
		expect(rel.role_includes_action(STUDENT, ASSIGN_ROLE_STUDENT)).toBe(false);
		expect(rel.role_includes_action(STUDENT, SEE_GAMES_USER)).toBe(false);
		expect(rel.role_includes_action(STUDENT, SEE_GAMES_ADMIN)).toBe(false);
		expect(rel.role_includes_action(STUDENT, SEE_GAMES_TEACHER)).toBe(false);
		expect(rel.role_includes_action(STUDENT, SEE_GAMES_MEMBER)).toBe(false);
		expect(rel.role_includes_action(STUDENT, SEE_GAMES_STUDENT)).toBe(false);
		expect(rel.role_includes_action(STUDENT, CHALLENGE_USER)).toBe(false);
		expect(rel.role_includes_action(STUDENT, CHALLENGE_ADMIN)).toBe(false);
		expect(rel.role_includes_action(STUDENT, CHALLENGE_MEMBER)).toBe(false);
		expect(rel.role_includes_action(STUDENT, CHALLENGE_TEACHER)).toBe(false);
		expect(rel.role_includes_action(STUDENT, CHALLENGE_STUDENT)).toBe(false);
	});

	test('Member', () => {
		let rel = UserRoleToUserAction.get_instance();
		rel.clear();
		initialize_permissions({
			admin: [],
			teacher: [],
			student: [],
			member: [CHALLENGE_ADMIN, CHALLENGE_STUDENT]
		});

		expect(rel.role_includes_action(MEMBER, CREATE_USER)).toBe(false);
		expect(rel.role_includes_action(MEMBER, CREATE_GAMES)).toBe(false);
		expect(rel.role_includes_action(MEMBER, EDIT_USER)).toBe(false);
		expect(rel.role_includes_action(MEMBER, EDIT_ADMIN)).toBe(false);
		expect(rel.role_includes_action(MEMBER, EDIT_TEACHER)).toBe(false);
		expect(rel.role_includes_action(MEMBER, EDIT_MEMBER)).toBe(false);
		expect(rel.role_includes_action(MEMBER, EDIT_STUDENT)).toBe(false);
		expect(rel.role_includes_action(MEMBER, EDIT_GAMES_USER)).toBe(false);
		expect(rel.role_includes_action(MEMBER, EDIT_GAMES_ADMIN)).toBe(false);
		expect(rel.role_includes_action(MEMBER, EDIT_GAMES_TEACHER)).toBe(false);
		expect(rel.role_includes_action(MEMBER, EDIT_GAMES_MEMBER)).toBe(false);
		expect(rel.role_includes_action(MEMBER, EDIT_GAMES_STUDENT)).toBe(false);
		expect(rel.role_includes_action(MEMBER, ASSIGN_ROLE_USER)).toBe(false);
		expect(rel.role_includes_action(MEMBER, ASSIGN_ROLE_ADMIN)).toBe(false);
		expect(rel.role_includes_action(MEMBER, ASSIGN_ROLE_TEACHER)).toBe(false);
		expect(rel.role_includes_action(MEMBER, ASSIGN_ROLE_MEMBER)).toBe(false);
		expect(rel.role_includes_action(MEMBER, ASSIGN_ROLE_STUDENT)).toBe(false);
		expect(rel.role_includes_action(MEMBER, SEE_GAMES_USER)).toBe(false);
		expect(rel.role_includes_action(MEMBER, SEE_GAMES_ADMIN)).toBe(false);
		expect(rel.role_includes_action(MEMBER, SEE_GAMES_TEACHER)).toBe(false);
		expect(rel.role_includes_action(MEMBER, SEE_GAMES_MEMBER)).toBe(false);
		expect(rel.role_includes_action(MEMBER, SEE_GAMES_STUDENT)).toBe(false);
		expect(rel.role_includes_action(MEMBER, CHALLENGE_USER)).toBe(true);
		expect(rel.role_includes_action(MEMBER, CHALLENGE_ADMIN)).toBe(true);
		expect(rel.role_includes_action(MEMBER, CHALLENGE_MEMBER)).toBe(false);
		expect(rel.role_includes_action(MEMBER, CHALLENGE_TEACHER)).toBe(false);
		expect(rel.role_includes_action(MEMBER, CHALLENGE_STUDENT)).toBe(true);
	});
});

describe('Actions allowed per user (multiple roles)', () => {
	test('Admin + Teacher', () => {
		let rel = UserRoleToUserAction.get_instance();
		rel.clear();
		initialize_permissions({
			admin: [EDIT_TEACHER],
			teacher: [],
			student: [CHALLENGE_STUDENT],
			member: []
		});

		expect(rel.role_includes_action(ADMIN, CREATE_USER)).toBe(false);
		expect(rel.role_includes_action(ADMIN, CREATE_GAMES)).toBe(false);
		expect(rel.role_includes_action(ADMIN, EDIT_USER)).toBe(true);
		expect(rel.role_includes_action(ADMIN, EDIT_ADMIN)).toBe(false);
		expect(rel.role_includes_action(ADMIN, EDIT_TEACHER)).toBe(true);
		expect(rel.role_includes_action(ADMIN, EDIT_MEMBER)).toBe(false);
		expect(rel.role_includes_action(ADMIN, EDIT_STUDENT)).toBe(false);
		expect(rel.role_includes_action(ADMIN, EDIT_GAMES_USER)).toBe(false);
		expect(rel.role_includes_action(ADMIN, EDIT_GAMES_ADMIN)).toBe(false);
		expect(rel.role_includes_action(ADMIN, EDIT_GAMES_TEACHER)).toBe(false);
		expect(rel.role_includes_action(ADMIN, EDIT_GAMES_MEMBER)).toBe(false);
		expect(rel.role_includes_action(ADMIN, EDIT_GAMES_STUDENT)).toBe(false);
		expect(rel.role_includes_action(ADMIN, ASSIGN_ROLE_USER)).toBe(false);
		expect(rel.role_includes_action(ADMIN, ASSIGN_ROLE_ADMIN)).toBe(false);
		expect(rel.role_includes_action(ADMIN, ASSIGN_ROLE_TEACHER)).toBe(false);
		expect(rel.role_includes_action(ADMIN, ASSIGN_ROLE_MEMBER)).toBe(false);
		expect(rel.role_includes_action(ADMIN, ASSIGN_ROLE_STUDENT)).toBe(false);
		expect(rel.role_includes_action(ADMIN, SEE_GAMES_USER)).toBe(false);
		expect(rel.role_includes_action(ADMIN, SEE_GAMES_ADMIN)).toBe(false);
		expect(rel.role_includes_action(ADMIN, SEE_GAMES_TEACHER)).toBe(false);
		expect(rel.role_includes_action(ADMIN, SEE_GAMES_MEMBER)).toBe(false);
		expect(rel.role_includes_action(ADMIN, SEE_GAMES_STUDENT)).toBe(false);
		expect(rel.role_includes_action(ADMIN, CHALLENGE_USER)).toBe(false);
		expect(rel.role_includes_action(ADMIN, CHALLENGE_ADMIN)).toBe(false);
		expect(rel.role_includes_action(ADMIN, CHALLENGE_MEMBER)).toBe(false);
		expect(rel.role_includes_action(ADMIN, CHALLENGE_TEACHER)).toBe(false);
		expect(rel.role_includes_action(ADMIN, CHALLENGE_STUDENT)).toBe(false);

		expect(rel.role_includes_action(STUDENT, CREATE_USER)).toBe(false);
		expect(rel.role_includes_action(STUDENT, CREATE_GAMES)).toBe(false);
		expect(rel.role_includes_action(STUDENT, EDIT_USER)).toBe(false);
		expect(rel.role_includes_action(STUDENT, EDIT_ADMIN)).toBe(false);
		expect(rel.role_includes_action(STUDENT, EDIT_TEACHER)).toBe(false);
		expect(rel.role_includes_action(STUDENT, EDIT_MEMBER)).toBe(false);
		expect(rel.role_includes_action(STUDENT, EDIT_STUDENT)).toBe(false);
		expect(rel.role_includes_action(STUDENT, EDIT_GAMES_USER)).toBe(false);
		expect(rel.role_includes_action(STUDENT, EDIT_GAMES_ADMIN)).toBe(false);
		expect(rel.role_includes_action(STUDENT, EDIT_GAMES_TEACHER)).toBe(false);
		expect(rel.role_includes_action(STUDENT, EDIT_GAMES_MEMBER)).toBe(false);
		expect(rel.role_includes_action(STUDENT, EDIT_GAMES_STUDENT)).toBe(false);
		expect(rel.role_includes_action(STUDENT, ASSIGN_ROLE_USER)).toBe(false);
		expect(rel.role_includes_action(STUDENT, ASSIGN_ROLE_ADMIN)).toBe(false);
		expect(rel.role_includes_action(STUDENT, ASSIGN_ROLE_TEACHER)).toBe(false);
		expect(rel.role_includes_action(STUDENT, ASSIGN_ROLE_MEMBER)).toBe(false);
		expect(rel.role_includes_action(STUDENT, ASSIGN_ROLE_STUDENT)).toBe(false);
		expect(rel.role_includes_action(STUDENT, SEE_GAMES_USER)).toBe(false);
		expect(rel.role_includes_action(STUDENT, SEE_GAMES_ADMIN)).toBe(false);
		expect(rel.role_includes_action(STUDENT, SEE_GAMES_TEACHER)).toBe(false);
		expect(rel.role_includes_action(STUDENT, SEE_GAMES_MEMBER)).toBe(false);
		expect(rel.role_includes_action(STUDENT, SEE_GAMES_STUDENT)).toBe(false);
		expect(rel.role_includes_action(STUDENT, CHALLENGE_USER)).toBe(true);
		expect(rel.role_includes_action(STUDENT, CHALLENGE_ADMIN)).toBe(false);
		expect(rel.role_includes_action(STUDENT, CHALLENGE_MEMBER)).toBe(false);
		expect(rel.role_includes_action(STUDENT, CHALLENGE_TEACHER)).toBe(false);
		expect(rel.role_includes_action(STUDENT, CHALLENGE_STUDENT)).toBe(true);
	});

	test('Teacher + Member', () => {
		let rel = UserRoleToUserAction.get_instance();
		rel.clear();
		initialize_permissions({
			admin: [],
			teacher: [ASSIGN_ROLE_STUDENT, SEE_GAMES_MEMBER],
			student: [],
			member: [CHALLENGE_STUDENT, CHALLENGE_TEACHER]
		});

		expect(rel.role_includes_action(TEACHER, CREATE_USER)).toBe(false);
		expect(rel.role_includes_action(TEACHER, CREATE_GAMES)).toBe(false);
		expect(rel.role_includes_action(TEACHER, EDIT_USER)).toBe(false);
		expect(rel.role_includes_action(TEACHER, EDIT_ADMIN)).toBe(false);
		expect(rel.role_includes_action(TEACHER, EDIT_TEACHER)).toBe(false);
		expect(rel.role_includes_action(TEACHER, EDIT_MEMBER)).toBe(false);
		expect(rel.role_includes_action(TEACHER, EDIT_STUDENT)).toBe(false);
		expect(rel.role_includes_action(TEACHER, EDIT_GAMES_USER)).toBe(false);
		expect(rel.role_includes_action(TEACHER, EDIT_GAMES_ADMIN)).toBe(false);
		expect(rel.role_includes_action(TEACHER, EDIT_GAMES_TEACHER)).toBe(false);
		expect(rel.role_includes_action(TEACHER, EDIT_GAMES_MEMBER)).toBe(false);
		expect(rel.role_includes_action(TEACHER, EDIT_GAMES_STUDENT)).toBe(false);
		expect(rel.role_includes_action(TEACHER, ASSIGN_ROLE_USER)).toBe(true);
		expect(rel.role_includes_action(TEACHER, ASSIGN_ROLE_ADMIN)).toBe(false);
		expect(rel.role_includes_action(TEACHER, ASSIGN_ROLE_TEACHER)).toBe(false);
		expect(rel.role_includes_action(TEACHER, ASSIGN_ROLE_MEMBER)).toBe(false);
		expect(rel.role_includes_action(TEACHER, ASSIGN_ROLE_STUDENT)).toBe(true);
		expect(rel.role_includes_action(TEACHER, SEE_GAMES_USER)).toBe(true);
		expect(rel.role_includes_action(TEACHER, SEE_GAMES_ADMIN)).toBe(false);
		expect(rel.role_includes_action(TEACHER, SEE_GAMES_TEACHER)).toBe(false);
		expect(rel.role_includes_action(TEACHER, SEE_GAMES_MEMBER)).toBe(true);
		expect(rel.role_includes_action(TEACHER, SEE_GAMES_STUDENT)).toBe(false);
		expect(rel.role_includes_action(TEACHER, CHALLENGE_USER)).toBe(false);
		expect(rel.role_includes_action(TEACHER, CHALLENGE_ADMIN)).toBe(false);
		expect(rel.role_includes_action(TEACHER, CHALLENGE_MEMBER)).toBe(false);
		expect(rel.role_includes_action(TEACHER, CHALLENGE_TEACHER)).toBe(false);
		expect(rel.role_includes_action(TEACHER, CHALLENGE_STUDENT)).toBe(false);

		expect(rel.role_includes_action(MEMBER, CREATE_USER)).toBe(false);
		expect(rel.role_includes_action(MEMBER, CREATE_GAMES)).toBe(false);
		expect(rel.role_includes_action(MEMBER, EDIT_USER)).toBe(false);
		expect(rel.role_includes_action(MEMBER, EDIT_ADMIN)).toBe(false);
		expect(rel.role_includes_action(MEMBER, EDIT_TEACHER)).toBe(false);
		expect(rel.role_includes_action(MEMBER, EDIT_MEMBER)).toBe(false);
		expect(rel.role_includes_action(MEMBER, EDIT_STUDENT)).toBe(false);
		expect(rel.role_includes_action(MEMBER, EDIT_GAMES_USER)).toBe(false);
		expect(rel.role_includes_action(MEMBER, EDIT_GAMES_ADMIN)).toBe(false);
		expect(rel.role_includes_action(MEMBER, EDIT_GAMES_TEACHER)).toBe(false);
		expect(rel.role_includes_action(MEMBER, EDIT_GAMES_MEMBER)).toBe(false);
		expect(rel.role_includes_action(MEMBER, EDIT_GAMES_STUDENT)).toBe(false);
		expect(rel.role_includes_action(MEMBER, ASSIGN_ROLE_USER)).toBe(false);
		expect(rel.role_includes_action(MEMBER, ASSIGN_ROLE_ADMIN)).toBe(false);
		expect(rel.role_includes_action(MEMBER, ASSIGN_ROLE_TEACHER)).toBe(false);
		expect(rel.role_includes_action(MEMBER, ASSIGN_ROLE_MEMBER)).toBe(false);
		expect(rel.role_includes_action(MEMBER, ASSIGN_ROLE_STUDENT)).toBe(false);
		expect(rel.role_includes_action(MEMBER, SEE_GAMES_USER)).toBe(false);
		expect(rel.role_includes_action(MEMBER, SEE_GAMES_ADMIN)).toBe(false);
		expect(rel.role_includes_action(MEMBER, SEE_GAMES_TEACHER)).toBe(false);
		expect(rel.role_includes_action(MEMBER, SEE_GAMES_MEMBER)).toBe(false);
		expect(rel.role_includes_action(MEMBER, SEE_GAMES_STUDENT)).toBe(false);
		expect(rel.role_includes_action(MEMBER, CHALLENGE_USER)).toBe(true);
		expect(rel.role_includes_action(MEMBER, CHALLENGE_ADMIN)).toBe(false);
		expect(rel.role_includes_action(MEMBER, CHALLENGE_MEMBER)).toBe(false);
		expect(rel.role_includes_action(MEMBER, CHALLENGE_TEACHER)).toBe(true);
		expect(rel.role_includes_action(MEMBER, CHALLENGE_STUDENT)).toBe(true);
	});
});
