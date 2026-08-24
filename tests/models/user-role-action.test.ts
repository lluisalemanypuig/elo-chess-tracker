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

import {
	initializePermissions,
	UserRoleToUserAction,
} from '@server/managers/user-role-action';

describe('Actions allowed per user (single role)', () => {
	test('Admin', () => {
		let rel = UserRoleToUserAction.getInstance();
		rel.clear();
		initializePermissions({
			admin: ['EDIT_USER_TEACHER'],
			teacher: [],
			student: [],
			member: [],
		});

		expect(rel.roleIncludesAction('ADMIN', 'CREATE_USER')).toBe(false);
		expect(rel.roleIncludesAction('ADMIN', 'CREATE_GAMES')).toBe(false);
		expect(rel.roleIncludesAction('ADMIN', 'EDIT_USER')).toBe(true);
		expect(rel.roleIncludesAction('ADMIN', 'EDIT_USER_ADMIN')).toBe(false);
		expect(rel.roleIncludesAction('ADMIN', 'EDIT_USER_TEACHER')).toBe(true);
		expect(rel.roleIncludesAction('ADMIN', 'EDIT_USER_MEMBER')).toBe(false);
		expect(rel.roleIncludesAction('ADMIN', 'EDIT_USER_STUDENT')).toBe(false);
		expect(rel.roleIncludesAction('ADMIN', 'EDIT_GAMES')).toBe(false);
		expect(rel.roleIncludesAction('ADMIN', 'EDIT_GAMES_ADMIN')).toBe(false);
		expect(rel.roleIncludesAction('ADMIN', 'EDIT_GAMES_TEACHER')).toBe(false);
		expect(rel.roleIncludesAction('ADMIN', 'EDIT_GAMES_MEMBER')).toBe(false);
		expect(rel.roleIncludesAction('ADMIN', 'EDIT_GAMES_STUDENT')).toBe(false);
		expect(rel.roleIncludesAction('ADMIN', 'ASSIGN_ROLE')).toBe(false);
		expect(rel.roleIncludesAction('ADMIN', 'ASSIGN_ROLE_ADMIN')).toBe(false);
		expect(rel.roleIncludesAction('ADMIN', 'ASSIGN_ROLE_TEACHER')).toBe(false);
		expect(rel.roleIncludesAction('ADMIN', 'ASSIGN_ROLE_MEMBER')).toBe(false);
		expect(rel.roleIncludesAction('ADMIN', 'ASSIGN_ROLE_STUDENT')).toBe(false);
		expect(rel.roleIncludesAction('ADMIN', 'SEE_GAMES')).toBe(false);
		expect(rel.roleIncludesAction('ADMIN', 'SEE_GAMES_ADMIN')).toBe(false);
		expect(rel.roleIncludesAction('ADMIN', 'SEE_GAMES_TEACHER')).toBe(false);
		expect(rel.roleIncludesAction('ADMIN', 'SEE_GAMES_MEMBER')).toBe(false);
		expect(rel.roleIncludesAction('ADMIN', 'SEE_GAMES_STUDENT')).toBe(false);
		expect(rel.roleIncludesAction('ADMIN', 'CHALLENGE_USER')).toBe(false);
		expect(rel.roleIncludesAction('ADMIN', 'CHALLENGE_USER_ADMIN')).toBe(false);
		expect(rel.roleIncludesAction('ADMIN', 'CHALLENGE_USER_MEMBER')).toBe(
			false,
		);
		expect(rel.roleIncludesAction('ADMIN', 'CHALLENGE_USER_TEACHER')).toBe(
			false,
		);
		expect(rel.roleIncludesAction('ADMIN', 'CHALLENGE_USER_STUDENT')).toBe(
			false,
		);
	});

	test('Teacher', () => {
		let rel = UserRoleToUserAction.getInstance();
		rel.clear();
		initializePermissions({
			admin: [],
			teacher: ['ASSIGN_ROLE_MEMBER'],
			student: [],
			member: [],
		});

		expect(rel.roleIncludesAction('TEACHER', 'CREATE_USER')).toBe(false);
		expect(rel.roleIncludesAction('TEACHER', 'CREATE_GAMES')).toBe(false);
		expect(rel.roleIncludesAction('TEACHER', 'EDIT_USER')).toBe(false);
		expect(rel.roleIncludesAction('TEACHER', 'EDIT_USER_ADMIN')).toBe(false);
		expect(rel.roleIncludesAction('TEACHER', 'EDIT_USER_TEACHER')).toBe(false);
		expect(rel.roleIncludesAction('TEACHER', 'EDIT_USER_MEMBER')).toBe(false);
		expect(rel.roleIncludesAction('TEACHER', 'EDIT_USER_STUDENT')).toBe(false);
		expect(rel.roleIncludesAction('TEACHER', 'EDIT_GAMES')).toBe(false);
		expect(rel.roleIncludesAction('TEACHER', 'EDIT_GAMES_ADMIN')).toBe(false);
		expect(rel.roleIncludesAction('TEACHER', 'EDIT_GAMES_TEACHER')).toBe(false);
		expect(rel.roleIncludesAction('TEACHER', 'EDIT_GAMES_MEMBER')).toBe(false);
		expect(rel.roleIncludesAction('TEACHER', 'EDIT_GAMES_STUDENT')).toBe(false);
		expect(rel.roleIncludesAction('TEACHER', 'ASSIGN_ROLE')).toBe(true);
		expect(rel.roleIncludesAction('TEACHER', 'ASSIGN_ROLE_ADMIN')).toBe(false);
		expect(rel.roleIncludesAction('TEACHER', 'ASSIGN_ROLE_TEACHER')).toBe(
			false,
		);
		expect(rel.roleIncludesAction('TEACHER', 'ASSIGN_ROLE_MEMBER')).toBe(true);
		expect(rel.roleIncludesAction('TEACHER', 'ASSIGN_ROLE_STUDENT')).toBe(
			false,
		);
		expect(rel.roleIncludesAction('TEACHER', 'SEE_GAMES')).toBe(false);
		expect(rel.roleIncludesAction('TEACHER', 'SEE_GAMES_ADMIN')).toBe(false);
		expect(rel.roleIncludesAction('TEACHER', 'SEE_GAMES_TEACHER')).toBe(false);
		expect(rel.roleIncludesAction('TEACHER', 'SEE_GAMES_MEMBER')).toBe(false);
		expect(rel.roleIncludesAction('TEACHER', 'SEE_GAMES_STUDENT')).toBe(false);
		expect(rel.roleIncludesAction('TEACHER', 'CHALLENGE_USER')).toBe(false);
		expect(rel.roleIncludesAction('TEACHER', 'CHALLENGE_USER_ADMIN')).toBe(
			false,
		);
		expect(rel.roleIncludesAction('TEACHER', 'CHALLENGE_USER_MEMBER')).toBe(
			false,
		);
		expect(rel.roleIncludesAction('TEACHER', 'CHALLENGE_USER_TEACHER')).toBe(
			false,
		);
		expect(rel.roleIncludesAction('TEACHER', 'CHALLENGE_USER_STUDENT')).toBe(
			false,
		);
	});

	test('Student', () => {
		let rel = UserRoleToUserAction.getInstance();
		rel.clear();
		initializePermissions({
			admin: [],
			teacher: [],
			student: ['CREATE_USER', 'CREATE_GAMES'],
			member: [],
		});

		expect(rel.roleIncludesAction('STUDENT', 'CREATE_USER')).toBe(true);
		expect(rel.roleIncludesAction('STUDENT', 'CREATE_GAMES')).toBe(true);
		expect(rel.roleIncludesAction('STUDENT', 'EDIT_USER')).toBe(false);
		expect(rel.roleIncludesAction('STUDENT', 'EDIT_USER_ADMIN')).toBe(false);
		expect(rel.roleIncludesAction('STUDENT', 'EDIT_USER_TEACHER')).toBe(false);
		expect(rel.roleIncludesAction('STUDENT', 'EDIT_USER_MEMBER')).toBe(false);
		expect(rel.roleIncludesAction('STUDENT', 'EDIT_USER_STUDENT')).toBe(false);
		expect(rel.roleIncludesAction('STUDENT', 'EDIT_GAMES')).toBe(false);
		expect(rel.roleIncludesAction('STUDENT', 'EDIT_GAMES_ADMIN')).toBe(false);
		expect(rel.roleIncludesAction('STUDENT', 'EDIT_GAMES_TEACHER')).toBe(false);
		expect(rel.roleIncludesAction('STUDENT', 'EDIT_GAMES_MEMBER')).toBe(false);
		expect(rel.roleIncludesAction('STUDENT', 'EDIT_GAMES_STUDENT')).toBe(false);
		expect(rel.roleIncludesAction('STUDENT', 'ASSIGN_ROLE')).toBe(false);
		expect(rel.roleIncludesAction('STUDENT', 'ASSIGN_ROLE_ADMIN')).toBe(false);
		expect(rel.roleIncludesAction('STUDENT', 'ASSIGN_ROLE_TEACHER')).toBe(
			false,
		);
		expect(rel.roleIncludesAction('STUDENT', 'ASSIGN_ROLE_MEMBER')).toBe(false);
		expect(rel.roleIncludesAction('STUDENT', 'ASSIGN_ROLE_STUDENT')).toBe(
			false,
		);
		expect(rel.roleIncludesAction('STUDENT', 'SEE_GAMES')).toBe(false);
		expect(rel.roleIncludesAction('STUDENT', 'SEE_GAMES_ADMIN')).toBe(false);
		expect(rel.roleIncludesAction('STUDENT', 'SEE_GAMES_TEACHER')).toBe(false);
		expect(rel.roleIncludesAction('STUDENT', 'SEE_GAMES_MEMBER')).toBe(false);
		expect(rel.roleIncludesAction('STUDENT', 'SEE_GAMES_STUDENT')).toBe(false);
		expect(rel.roleIncludesAction('STUDENT', 'CHALLENGE_USER')).toBe(false);
		expect(rel.roleIncludesAction('STUDENT', 'CHALLENGE_USER_ADMIN')).toBe(
			false,
		);
		expect(rel.roleIncludesAction('STUDENT', 'CHALLENGE_USER_MEMBER')).toBe(
			false,
		);
		expect(rel.roleIncludesAction('STUDENT', 'CHALLENGE_USER_TEACHER')).toBe(
			false,
		);
		expect(rel.roleIncludesAction('STUDENT', 'CHALLENGE_USER_STUDENT')).toBe(
			false,
		);
	});

	test('Member', () => {
		let rel = UserRoleToUserAction.getInstance();
		rel.clear();
		initializePermissions({
			admin: [],
			teacher: [],
			student: [],
			member: ['CHALLENGE_USER_ADMIN', 'CHALLENGE_USER_STUDENT'],
		});

		expect(rel.roleIncludesAction('MEMBER', 'CREATE_USER')).toBe(false);
		expect(rel.roleIncludesAction('MEMBER', 'CREATE_GAMES')).toBe(false);
		expect(rel.roleIncludesAction('MEMBER', 'EDIT_USER')).toBe(false);
		expect(rel.roleIncludesAction('MEMBER', 'EDIT_USER_ADMIN')).toBe(false);
		expect(rel.roleIncludesAction('MEMBER', 'EDIT_USER_TEACHER')).toBe(false);
		expect(rel.roleIncludesAction('MEMBER', 'EDIT_USER_MEMBER')).toBe(false);
		expect(rel.roleIncludesAction('MEMBER', 'EDIT_USER_STUDENT')).toBe(false);
		expect(rel.roleIncludesAction('MEMBER', 'EDIT_GAMES')).toBe(false);
		expect(rel.roleIncludesAction('MEMBER', 'EDIT_GAMES_ADMIN')).toBe(false);
		expect(rel.roleIncludesAction('MEMBER', 'EDIT_GAMES_TEACHER')).toBe(false);
		expect(rel.roleIncludesAction('MEMBER', 'EDIT_GAMES_MEMBER')).toBe(false);
		expect(rel.roleIncludesAction('MEMBER', 'EDIT_GAMES_STUDENT')).toBe(false);
		expect(rel.roleIncludesAction('MEMBER', 'ASSIGN_ROLE')).toBe(false);
		expect(rel.roleIncludesAction('MEMBER', 'ASSIGN_ROLE_ADMIN')).toBe(false);
		expect(rel.roleIncludesAction('MEMBER', 'ASSIGN_ROLE_TEACHER')).toBe(false);
		expect(rel.roleIncludesAction('MEMBER', 'ASSIGN_ROLE_MEMBER')).toBe(false);
		expect(rel.roleIncludesAction('MEMBER', 'ASSIGN_ROLE_STUDENT')).toBe(false);
		expect(rel.roleIncludesAction('MEMBER', 'SEE_GAMES')).toBe(false);
		expect(rel.roleIncludesAction('MEMBER', 'SEE_GAMES_ADMIN')).toBe(false);
		expect(rel.roleIncludesAction('MEMBER', 'SEE_GAMES_TEACHER')).toBe(false);
		expect(rel.roleIncludesAction('MEMBER', 'SEE_GAMES_MEMBER')).toBe(false);
		expect(rel.roleIncludesAction('MEMBER', 'SEE_GAMES_STUDENT')).toBe(false);
		expect(rel.roleIncludesAction('MEMBER', 'CHALLENGE_USER')).toBe(true);
		expect(rel.roleIncludesAction('MEMBER', 'CHALLENGE_USER_ADMIN')).toBe(true);
		expect(rel.roleIncludesAction('MEMBER', 'CHALLENGE_USER_MEMBER')).toBe(
			false,
		);
		expect(rel.roleIncludesAction('MEMBER', 'CHALLENGE_USER_TEACHER')).toBe(
			false,
		);
		expect(rel.roleIncludesAction('MEMBER', 'CHALLENGE_USER_STUDENT')).toBe(
			true,
		);
	});
});

describe('Actions allowed per user (multiple roles)', () => {
	test('Admin + Teacher', () => {
		let rel = UserRoleToUserAction.getInstance();
		rel.clear();
		initializePermissions({
			admin: ['EDIT_USER_TEACHER'],
			teacher: [],
			student: ['CHALLENGE_USER_STUDENT'],
			member: [],
		});

		expect(rel.roleIncludesAction('ADMIN', 'CREATE_USER')).toBe(false);
		expect(rel.roleIncludesAction('ADMIN', 'CREATE_GAMES')).toBe(false);
		expect(rel.roleIncludesAction('ADMIN', 'EDIT_USER')).toBe(true);
		expect(rel.roleIncludesAction('ADMIN', 'EDIT_USER_ADMIN')).toBe(false);
		expect(rel.roleIncludesAction('ADMIN', 'EDIT_USER_TEACHER')).toBe(true);
		expect(rel.roleIncludesAction('ADMIN', 'EDIT_USER_MEMBER')).toBe(false);
		expect(rel.roleIncludesAction('ADMIN', 'EDIT_USER_STUDENT')).toBe(false);
		expect(rel.roleIncludesAction('ADMIN', 'EDIT_GAMES')).toBe(false);
		expect(rel.roleIncludesAction('ADMIN', 'EDIT_GAMES_ADMIN')).toBe(false);
		expect(rel.roleIncludesAction('ADMIN', 'EDIT_GAMES_TEACHER')).toBe(false);
		expect(rel.roleIncludesAction('ADMIN', 'EDIT_GAMES_MEMBER')).toBe(false);
		expect(rel.roleIncludesAction('ADMIN', 'EDIT_GAMES_STUDENT')).toBe(false);
		expect(rel.roleIncludesAction('ADMIN', 'ASSIGN_ROLE')).toBe(false);
		expect(rel.roleIncludesAction('ADMIN', 'ASSIGN_ROLE_ADMIN')).toBe(false);
		expect(rel.roleIncludesAction('ADMIN', 'ASSIGN_ROLE_TEACHER')).toBe(false);
		expect(rel.roleIncludesAction('ADMIN', 'ASSIGN_ROLE_MEMBER')).toBe(false);
		expect(rel.roleIncludesAction('ADMIN', 'ASSIGN_ROLE_STUDENT')).toBe(false);
		expect(rel.roleIncludesAction('ADMIN', 'SEE_GAMES')).toBe(false);
		expect(rel.roleIncludesAction('ADMIN', 'SEE_GAMES_ADMIN')).toBe(false);
		expect(rel.roleIncludesAction('ADMIN', 'SEE_GAMES_TEACHER')).toBe(false);
		expect(rel.roleIncludesAction('ADMIN', 'SEE_GAMES_MEMBER')).toBe(false);
		expect(rel.roleIncludesAction('ADMIN', 'SEE_GAMES_STUDENT')).toBe(false);
		expect(rel.roleIncludesAction('ADMIN', 'CHALLENGE_USER')).toBe(false);
		expect(rel.roleIncludesAction('ADMIN', 'CHALLENGE_USER_ADMIN')).toBe(false);
		expect(rel.roleIncludesAction('ADMIN', 'CHALLENGE_USER_MEMBER')).toBe(
			false,
		);
		expect(rel.roleIncludesAction('ADMIN', 'CHALLENGE_USER_TEACHER')).toBe(
			false,
		);
		expect(rel.roleIncludesAction('ADMIN', 'CHALLENGE_USER_STUDENT')).toBe(
			false,
		);

		expect(rel.roleIncludesAction('STUDENT', 'CREATE_USER')).toBe(false);
		expect(rel.roleIncludesAction('STUDENT', 'CREATE_GAMES')).toBe(false);
		expect(rel.roleIncludesAction('STUDENT', 'EDIT_USER')).toBe(false);
		expect(rel.roleIncludesAction('STUDENT', 'EDIT_USER_ADMIN')).toBe(false);
		expect(rel.roleIncludesAction('STUDENT', 'EDIT_USER_TEACHER')).toBe(false);
		expect(rel.roleIncludesAction('STUDENT', 'EDIT_USER_MEMBER')).toBe(false);
		expect(rel.roleIncludesAction('STUDENT', 'EDIT_USER_STUDENT')).toBe(false);
		expect(rel.roleIncludesAction('STUDENT', 'EDIT_GAMES')).toBe(false);
		expect(rel.roleIncludesAction('STUDENT', 'EDIT_GAMES_ADMIN')).toBe(false);
		expect(rel.roleIncludesAction('STUDENT', 'EDIT_GAMES_TEACHER')).toBe(false);
		expect(rel.roleIncludesAction('STUDENT', 'EDIT_GAMES_MEMBER')).toBe(false);
		expect(rel.roleIncludesAction('STUDENT', 'EDIT_GAMES_STUDENT')).toBe(false);
		expect(rel.roleIncludesAction('STUDENT', 'ASSIGN_ROLE')).toBe(false);
		expect(rel.roleIncludesAction('STUDENT', 'ASSIGN_ROLE_ADMIN')).toBe(false);
		expect(rel.roleIncludesAction('STUDENT', 'ASSIGN_ROLE_TEACHER')).toBe(
			false,
		);
		expect(rel.roleIncludesAction('STUDENT', 'ASSIGN_ROLE_MEMBER')).toBe(false);
		expect(rel.roleIncludesAction('STUDENT', 'ASSIGN_ROLE_STUDENT')).toBe(
			false,
		);
		expect(rel.roleIncludesAction('STUDENT', 'SEE_GAMES')).toBe(false);
		expect(rel.roleIncludesAction('STUDENT', 'SEE_GAMES_ADMIN')).toBe(false);
		expect(rel.roleIncludesAction('STUDENT', 'SEE_GAMES_TEACHER')).toBe(false);
		expect(rel.roleIncludesAction('STUDENT', 'SEE_GAMES_MEMBER')).toBe(false);
		expect(rel.roleIncludesAction('STUDENT', 'SEE_GAMES_STUDENT')).toBe(false);
		expect(rel.roleIncludesAction('STUDENT', 'CHALLENGE_USER')).toBe(true);
		expect(rel.roleIncludesAction('STUDENT', 'CHALLENGE_USER_ADMIN')).toBe(
			false,
		);
		expect(rel.roleIncludesAction('STUDENT', 'CHALLENGE_USER_MEMBER')).toBe(
			false,
		);
		expect(rel.roleIncludesAction('STUDENT', 'CHALLENGE_USER_TEACHER')).toBe(
			false,
		);
		expect(rel.roleIncludesAction('STUDENT', 'CHALLENGE_USER_STUDENT')).toBe(
			true,
		);
	});

	test('Teacher + Member', () => {
		let rel = UserRoleToUserAction.getInstance();
		rel.clear();
		initializePermissions({
			admin: [],
			teacher: ['ASSIGN_ROLE_STUDENT', 'SEE_GAMES_MEMBER'],
			student: [],
			member: ['CHALLENGE_USER_STUDENT', 'CHALLENGE_USER_TEACHER'],
		});

		expect(rel.roleIncludesAction('TEACHER', 'CREATE_USER')).toBe(false);
		expect(rel.roleIncludesAction('TEACHER', 'CREATE_GAMES')).toBe(false);
		expect(rel.roleIncludesAction('TEACHER', 'EDIT_USER')).toBe(false);
		expect(rel.roleIncludesAction('TEACHER', 'EDIT_USER_ADMIN')).toBe(false);
		expect(rel.roleIncludesAction('TEACHER', 'EDIT_USER_TEACHER')).toBe(false);
		expect(rel.roleIncludesAction('TEACHER', 'EDIT_USER_MEMBER')).toBe(false);
		expect(rel.roleIncludesAction('TEACHER', 'EDIT_USER_STUDENT')).toBe(false);
		expect(rel.roleIncludesAction('TEACHER', 'EDIT_GAMES')).toBe(false);
		expect(rel.roleIncludesAction('TEACHER', 'EDIT_GAMES_ADMIN')).toBe(false);
		expect(rel.roleIncludesAction('TEACHER', 'EDIT_GAMES_TEACHER')).toBe(false);
		expect(rel.roleIncludesAction('TEACHER', 'EDIT_GAMES_MEMBER')).toBe(false);
		expect(rel.roleIncludesAction('TEACHER', 'EDIT_GAMES_STUDENT')).toBe(false);
		expect(rel.roleIncludesAction('TEACHER', 'ASSIGN_ROLE')).toBe(true);
		expect(rel.roleIncludesAction('TEACHER', 'ASSIGN_ROLE_ADMIN')).toBe(false);
		expect(rel.roleIncludesAction('TEACHER', 'ASSIGN_ROLE_TEACHER')).toBe(
			false,
		);
		expect(rel.roleIncludesAction('TEACHER', 'ASSIGN_ROLE_MEMBER')).toBe(false);
		expect(rel.roleIncludesAction('TEACHER', 'ASSIGN_ROLE_STUDENT')).toBe(true);
		expect(rel.roleIncludesAction('TEACHER', 'SEE_GAMES')).toBe(true);
		expect(rel.roleIncludesAction('TEACHER', 'SEE_GAMES_ADMIN')).toBe(false);
		expect(rel.roleIncludesAction('TEACHER', 'SEE_GAMES_TEACHER')).toBe(false);
		expect(rel.roleIncludesAction('TEACHER', 'SEE_GAMES_MEMBER')).toBe(true);
		expect(rel.roleIncludesAction('TEACHER', 'SEE_GAMES_STUDENT')).toBe(false);
		expect(rel.roleIncludesAction('TEACHER', 'CHALLENGE_USER')).toBe(false);
		expect(rel.roleIncludesAction('TEACHER', 'CHALLENGE_USER_ADMIN')).toBe(
			false,
		);
		expect(rel.roleIncludesAction('TEACHER', 'CHALLENGE_USER_MEMBER')).toBe(
			false,
		);
		expect(rel.roleIncludesAction('TEACHER', 'CHALLENGE_USER_TEACHER')).toBe(
			false,
		);
		expect(rel.roleIncludesAction('TEACHER', 'CHALLENGE_USER_STUDENT')).toBe(
			false,
		);

		expect(rel.roleIncludesAction('MEMBER', 'CREATE_USER')).toBe(false);
		expect(rel.roleIncludesAction('MEMBER', 'CREATE_GAMES')).toBe(false);
		expect(rel.roleIncludesAction('MEMBER', 'EDIT_USER')).toBe(false);
		expect(rel.roleIncludesAction('MEMBER', 'EDIT_USER_ADMIN')).toBe(false);
		expect(rel.roleIncludesAction('MEMBER', 'EDIT_USER_TEACHER')).toBe(false);
		expect(rel.roleIncludesAction('MEMBER', 'EDIT_USER_MEMBER')).toBe(false);
		expect(rel.roleIncludesAction('MEMBER', 'EDIT_USER_STUDENT')).toBe(false);
		expect(rel.roleIncludesAction('MEMBER', 'EDIT_GAMES')).toBe(false);
		expect(rel.roleIncludesAction('MEMBER', 'EDIT_GAMES_ADMIN')).toBe(false);
		expect(rel.roleIncludesAction('MEMBER', 'EDIT_GAMES_TEACHER')).toBe(false);
		expect(rel.roleIncludesAction('MEMBER', 'EDIT_GAMES_MEMBER')).toBe(false);
		expect(rel.roleIncludesAction('MEMBER', 'EDIT_GAMES_STUDENT')).toBe(false);
		expect(rel.roleIncludesAction('MEMBER', 'ASSIGN_ROLE')).toBe(false);
		expect(rel.roleIncludesAction('MEMBER', 'ASSIGN_ROLE_ADMIN')).toBe(false);
		expect(rel.roleIncludesAction('MEMBER', 'ASSIGN_ROLE_TEACHER')).toBe(false);
		expect(rel.roleIncludesAction('MEMBER', 'ASSIGN_ROLE_MEMBER')).toBe(false);
		expect(rel.roleIncludesAction('MEMBER', 'ASSIGN_ROLE_STUDENT')).toBe(false);
		expect(rel.roleIncludesAction('MEMBER', 'SEE_GAMES')).toBe(false);
		expect(rel.roleIncludesAction('MEMBER', 'SEE_GAMES_ADMIN')).toBe(false);
		expect(rel.roleIncludesAction('MEMBER', 'SEE_GAMES_TEACHER')).toBe(false);
		expect(rel.roleIncludesAction('MEMBER', 'SEE_GAMES_MEMBER')).toBe(false);
		expect(rel.roleIncludesAction('MEMBER', 'SEE_GAMES_STUDENT')).toBe(false);
		expect(rel.roleIncludesAction('MEMBER', 'CHALLENGE_USER')).toBe(true);
		expect(rel.roleIncludesAction('MEMBER', 'CHALLENGE_USER_ADMIN')).toBe(
			false,
		);
		expect(rel.roleIncludesAction('MEMBER', 'CHALLENGE_USER_MEMBER')).toBe(
			false,
		);
		expect(rel.roleIncludesAction('MEMBER', 'CHALLENGE_USER_TEACHER')).toBe(
			true,
		);
		expect(rel.roleIncludesAction('MEMBER', 'CHALLENGE_USER_STUDENT')).toBe(
			true,
		);
	});
});
