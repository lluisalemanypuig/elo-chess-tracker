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
	USER_ROLE_ASSIGN_ADMIN,
	USER_ROLE_ASSIGN_MEMBER,
	USER_ROLE_ASSIGN_STUDENT,
	USER_ROLE_ASSIGN_TEACHER,
	USER_ROLE_ASSIGN,
	USER_CHALLENGE_ADMIN,
	USER_CHALLENGE_MEMBER,
	USER_CHALLENGE_STUDENT,
	USER_CHALLENGE_TEACHER,
	USER_CHALLENGE,
	GAMES_CREATE,
	CREATE_USER,
	USER_EDIT_ADMIN,
	USER_EDIT_MEMBER,
	USER_EDIT_STUDENT,
	USER_EDIT_TEACHER,
	USER_EDIT,
	GAMES_EDIT_ADMIN,
	GAMES_EDIT_MEMBER,
	GAMES_EDIT_STUDENT,
	GAMES_EDIT_TEACHER,
	GAMES_EDIT,
	GAMES_SEE_ADMIN,
	GAMES_SEE_MEMBER,
	GAMES_SEE_STUDENT,
	GAMES_SEE_TEACHER,
	GAMES_SEE
} from '@common/models/user-action';
import { ADMIN, MEMBER, STUDENT, TEACHER } from '@common/models/user-role';
import { initializePermissions, UserRoleToUserAction } from '@server/managers/user-role-action';

describe('Actions allowed per user (single role)', () => {
	test('Admin', () => {
		let rel = UserRoleToUserAction.getInstance();
		rel.clear();
		initializePermissions({
			admin: [USER_EDIT_TEACHER],
			teacher: [],
			student: [],
			member: []
		});

		expect(rel.roleIncludesAction(ADMIN, CREATE_USER)).toBe(false);
		expect(rel.roleIncludesAction(ADMIN, GAMES_CREATE)).toBe(false);
		expect(rel.roleIncludesAction(ADMIN, USER_EDIT)).toBe(true);
		expect(rel.roleIncludesAction(ADMIN, USER_EDIT_ADMIN)).toBe(false);
		expect(rel.roleIncludesAction(ADMIN, USER_EDIT_TEACHER)).toBe(true);
		expect(rel.roleIncludesAction(ADMIN, USER_EDIT_MEMBER)).toBe(false);
		expect(rel.roleIncludesAction(ADMIN, USER_EDIT_STUDENT)).toBe(false);
		expect(rel.roleIncludesAction(ADMIN, GAMES_EDIT)).toBe(false);
		expect(rel.roleIncludesAction(ADMIN, GAMES_EDIT_ADMIN)).toBe(false);
		expect(rel.roleIncludesAction(ADMIN, GAMES_EDIT_TEACHER)).toBe(false);
		expect(rel.roleIncludesAction(ADMIN, GAMES_EDIT_MEMBER)).toBe(false);
		expect(rel.roleIncludesAction(ADMIN, GAMES_EDIT_STUDENT)).toBe(false);
		expect(rel.roleIncludesAction(ADMIN, USER_ROLE_ASSIGN)).toBe(false);
		expect(rel.roleIncludesAction(ADMIN, USER_ROLE_ASSIGN_ADMIN)).toBe(false);
		expect(rel.roleIncludesAction(ADMIN, USER_ROLE_ASSIGN_TEACHER)).toBe(false);
		expect(rel.roleIncludesAction(ADMIN, USER_ROLE_ASSIGN_MEMBER)).toBe(false);
		expect(rel.roleIncludesAction(ADMIN, USER_ROLE_ASSIGN_STUDENT)).toBe(false);
		expect(rel.roleIncludesAction(ADMIN, GAMES_SEE)).toBe(false);
		expect(rel.roleIncludesAction(ADMIN, GAMES_SEE_ADMIN)).toBe(false);
		expect(rel.roleIncludesAction(ADMIN, GAMES_SEE_TEACHER)).toBe(false);
		expect(rel.roleIncludesAction(ADMIN, GAMES_SEE_MEMBER)).toBe(false);
		expect(rel.roleIncludesAction(ADMIN, GAMES_SEE_STUDENT)).toBe(false);
		expect(rel.roleIncludesAction(ADMIN, USER_CHALLENGE)).toBe(false);
		expect(rel.roleIncludesAction(ADMIN, USER_CHALLENGE_ADMIN)).toBe(false);
		expect(rel.roleIncludesAction(ADMIN, USER_CHALLENGE_MEMBER)).toBe(false);
		expect(rel.roleIncludesAction(ADMIN, USER_CHALLENGE_TEACHER)).toBe(false);
		expect(rel.roleIncludesAction(ADMIN, USER_CHALLENGE_STUDENT)).toBe(false);
	});

	test('Teacher', () => {
		let rel = UserRoleToUserAction.getInstance();
		rel.clear();
		initializePermissions({
			admin: [],
			teacher: [USER_ROLE_ASSIGN_MEMBER],
			student: [],
			member: []
		});

		expect(rel.roleIncludesAction(TEACHER, CREATE_USER)).toBe(false);
		expect(rel.roleIncludesAction(TEACHER, GAMES_CREATE)).toBe(false);
		expect(rel.roleIncludesAction(TEACHER, USER_EDIT)).toBe(false);
		expect(rel.roleIncludesAction(TEACHER, USER_EDIT_ADMIN)).toBe(false);
		expect(rel.roleIncludesAction(TEACHER, USER_EDIT_TEACHER)).toBe(false);
		expect(rel.roleIncludesAction(TEACHER, USER_EDIT_MEMBER)).toBe(false);
		expect(rel.roleIncludesAction(TEACHER, USER_EDIT_STUDENT)).toBe(false);
		expect(rel.roleIncludesAction(TEACHER, GAMES_EDIT)).toBe(false);
		expect(rel.roleIncludesAction(TEACHER, GAMES_EDIT_ADMIN)).toBe(false);
		expect(rel.roleIncludesAction(TEACHER, GAMES_EDIT_TEACHER)).toBe(false);
		expect(rel.roleIncludesAction(TEACHER, GAMES_EDIT_MEMBER)).toBe(false);
		expect(rel.roleIncludesAction(TEACHER, GAMES_EDIT_STUDENT)).toBe(false);
		expect(rel.roleIncludesAction(TEACHER, USER_ROLE_ASSIGN)).toBe(true);
		expect(rel.roleIncludesAction(TEACHER, USER_ROLE_ASSIGN_ADMIN)).toBe(false);
		expect(rel.roleIncludesAction(TEACHER, USER_ROLE_ASSIGN_TEACHER)).toBe(false);
		expect(rel.roleIncludesAction(TEACHER, USER_ROLE_ASSIGN_MEMBER)).toBe(true);
		expect(rel.roleIncludesAction(TEACHER, USER_ROLE_ASSIGN_STUDENT)).toBe(false);
		expect(rel.roleIncludesAction(TEACHER, GAMES_SEE)).toBe(false);
		expect(rel.roleIncludesAction(TEACHER, GAMES_SEE_ADMIN)).toBe(false);
		expect(rel.roleIncludesAction(TEACHER, GAMES_SEE_TEACHER)).toBe(false);
		expect(rel.roleIncludesAction(TEACHER, GAMES_SEE_MEMBER)).toBe(false);
		expect(rel.roleIncludesAction(TEACHER, GAMES_SEE_STUDENT)).toBe(false);
		expect(rel.roleIncludesAction(TEACHER, USER_CHALLENGE)).toBe(false);
		expect(rel.roleIncludesAction(TEACHER, USER_CHALLENGE_ADMIN)).toBe(false);
		expect(rel.roleIncludesAction(TEACHER, USER_CHALLENGE_MEMBER)).toBe(false);
		expect(rel.roleIncludesAction(TEACHER, USER_CHALLENGE_TEACHER)).toBe(false);
		expect(rel.roleIncludesAction(TEACHER, USER_CHALLENGE_STUDENT)).toBe(false);
	});

	test('Student', () => {
		let rel = UserRoleToUserAction.getInstance();
		rel.clear();
		initializePermissions({
			admin: [],
			teacher: [],
			student: [CREATE_USER, GAMES_CREATE],
			member: []
		});

		expect(rel.roleIncludesAction(STUDENT, CREATE_USER)).toBe(true);
		expect(rel.roleIncludesAction(STUDENT, GAMES_CREATE)).toBe(true);
		expect(rel.roleIncludesAction(STUDENT, USER_EDIT)).toBe(false);
		expect(rel.roleIncludesAction(STUDENT, USER_EDIT_ADMIN)).toBe(false);
		expect(rel.roleIncludesAction(STUDENT, USER_EDIT_TEACHER)).toBe(false);
		expect(rel.roleIncludesAction(STUDENT, USER_EDIT_MEMBER)).toBe(false);
		expect(rel.roleIncludesAction(STUDENT, USER_EDIT_STUDENT)).toBe(false);
		expect(rel.roleIncludesAction(STUDENT, GAMES_EDIT)).toBe(false);
		expect(rel.roleIncludesAction(STUDENT, GAMES_EDIT_ADMIN)).toBe(false);
		expect(rel.roleIncludesAction(STUDENT, GAMES_EDIT_TEACHER)).toBe(false);
		expect(rel.roleIncludesAction(STUDENT, GAMES_EDIT_MEMBER)).toBe(false);
		expect(rel.roleIncludesAction(STUDENT, GAMES_EDIT_STUDENT)).toBe(false);
		expect(rel.roleIncludesAction(STUDENT, USER_ROLE_ASSIGN)).toBe(false);
		expect(rel.roleIncludesAction(STUDENT, USER_ROLE_ASSIGN_ADMIN)).toBe(false);
		expect(rel.roleIncludesAction(STUDENT, USER_ROLE_ASSIGN_TEACHER)).toBe(false);
		expect(rel.roleIncludesAction(STUDENT, USER_ROLE_ASSIGN_MEMBER)).toBe(false);
		expect(rel.roleIncludesAction(STUDENT, USER_ROLE_ASSIGN_STUDENT)).toBe(false);
		expect(rel.roleIncludesAction(STUDENT, GAMES_SEE)).toBe(false);
		expect(rel.roleIncludesAction(STUDENT, GAMES_SEE_ADMIN)).toBe(false);
		expect(rel.roleIncludesAction(STUDENT, GAMES_SEE_TEACHER)).toBe(false);
		expect(rel.roleIncludesAction(STUDENT, GAMES_SEE_MEMBER)).toBe(false);
		expect(rel.roleIncludesAction(STUDENT, GAMES_SEE_STUDENT)).toBe(false);
		expect(rel.roleIncludesAction(STUDENT, USER_CHALLENGE)).toBe(false);
		expect(rel.roleIncludesAction(STUDENT, USER_CHALLENGE_ADMIN)).toBe(false);
		expect(rel.roleIncludesAction(STUDENT, USER_CHALLENGE_MEMBER)).toBe(false);
		expect(rel.roleIncludesAction(STUDENT, USER_CHALLENGE_TEACHER)).toBe(false);
		expect(rel.roleIncludesAction(STUDENT, USER_CHALLENGE_STUDENT)).toBe(false);
	});

	test('Member', () => {
		let rel = UserRoleToUserAction.getInstance();
		rel.clear();
		initializePermissions({
			admin: [],
			teacher: [],
			student: [],
			member: [USER_CHALLENGE_ADMIN, USER_CHALLENGE_STUDENT]
		});

		expect(rel.roleIncludesAction(MEMBER, CREATE_USER)).toBe(false);
		expect(rel.roleIncludesAction(MEMBER, GAMES_CREATE)).toBe(false);
		expect(rel.roleIncludesAction(MEMBER, USER_EDIT)).toBe(false);
		expect(rel.roleIncludesAction(MEMBER, USER_EDIT_ADMIN)).toBe(false);
		expect(rel.roleIncludesAction(MEMBER, USER_EDIT_TEACHER)).toBe(false);
		expect(rel.roleIncludesAction(MEMBER, USER_EDIT_MEMBER)).toBe(false);
		expect(rel.roleIncludesAction(MEMBER, USER_EDIT_STUDENT)).toBe(false);
		expect(rel.roleIncludesAction(MEMBER, GAMES_EDIT)).toBe(false);
		expect(rel.roleIncludesAction(MEMBER, GAMES_EDIT_ADMIN)).toBe(false);
		expect(rel.roleIncludesAction(MEMBER, GAMES_EDIT_TEACHER)).toBe(false);
		expect(rel.roleIncludesAction(MEMBER, GAMES_EDIT_MEMBER)).toBe(false);
		expect(rel.roleIncludesAction(MEMBER, GAMES_EDIT_STUDENT)).toBe(false);
		expect(rel.roleIncludesAction(MEMBER, USER_ROLE_ASSIGN)).toBe(false);
		expect(rel.roleIncludesAction(MEMBER, USER_ROLE_ASSIGN_ADMIN)).toBe(false);
		expect(rel.roleIncludesAction(MEMBER, USER_ROLE_ASSIGN_TEACHER)).toBe(false);
		expect(rel.roleIncludesAction(MEMBER, USER_ROLE_ASSIGN_MEMBER)).toBe(false);
		expect(rel.roleIncludesAction(MEMBER, USER_ROLE_ASSIGN_STUDENT)).toBe(false);
		expect(rel.roleIncludesAction(MEMBER, GAMES_SEE)).toBe(false);
		expect(rel.roleIncludesAction(MEMBER, GAMES_SEE_ADMIN)).toBe(false);
		expect(rel.roleIncludesAction(MEMBER, GAMES_SEE_TEACHER)).toBe(false);
		expect(rel.roleIncludesAction(MEMBER, GAMES_SEE_MEMBER)).toBe(false);
		expect(rel.roleIncludesAction(MEMBER, GAMES_SEE_STUDENT)).toBe(false);
		expect(rel.roleIncludesAction(MEMBER, USER_CHALLENGE)).toBe(true);
		expect(rel.roleIncludesAction(MEMBER, USER_CHALLENGE_ADMIN)).toBe(true);
		expect(rel.roleIncludesAction(MEMBER, USER_CHALLENGE_MEMBER)).toBe(false);
		expect(rel.roleIncludesAction(MEMBER, USER_CHALLENGE_TEACHER)).toBe(false);
		expect(rel.roleIncludesAction(MEMBER, USER_CHALLENGE_STUDENT)).toBe(true);
	});
});

describe('Actions allowed per user (multiple roles)', () => {
	test('Admin + Teacher', () => {
		let rel = UserRoleToUserAction.getInstance();
		rel.clear();
		initializePermissions({
			admin: [USER_EDIT_TEACHER],
			teacher: [],
			student: [USER_CHALLENGE_STUDENT],
			member: []
		});

		expect(rel.roleIncludesAction(ADMIN, CREATE_USER)).toBe(false);
		expect(rel.roleIncludesAction(ADMIN, GAMES_CREATE)).toBe(false);
		expect(rel.roleIncludesAction(ADMIN, USER_EDIT)).toBe(true);
		expect(rel.roleIncludesAction(ADMIN, USER_EDIT_ADMIN)).toBe(false);
		expect(rel.roleIncludesAction(ADMIN, USER_EDIT_TEACHER)).toBe(true);
		expect(rel.roleIncludesAction(ADMIN, USER_EDIT_MEMBER)).toBe(false);
		expect(rel.roleIncludesAction(ADMIN, USER_EDIT_STUDENT)).toBe(false);
		expect(rel.roleIncludesAction(ADMIN, GAMES_EDIT)).toBe(false);
		expect(rel.roleIncludesAction(ADMIN, GAMES_EDIT_ADMIN)).toBe(false);
		expect(rel.roleIncludesAction(ADMIN, GAMES_EDIT_TEACHER)).toBe(false);
		expect(rel.roleIncludesAction(ADMIN, GAMES_EDIT_MEMBER)).toBe(false);
		expect(rel.roleIncludesAction(ADMIN, GAMES_EDIT_STUDENT)).toBe(false);
		expect(rel.roleIncludesAction(ADMIN, USER_ROLE_ASSIGN)).toBe(false);
		expect(rel.roleIncludesAction(ADMIN, USER_ROLE_ASSIGN_ADMIN)).toBe(false);
		expect(rel.roleIncludesAction(ADMIN, USER_ROLE_ASSIGN_TEACHER)).toBe(false);
		expect(rel.roleIncludesAction(ADMIN, USER_ROLE_ASSIGN_MEMBER)).toBe(false);
		expect(rel.roleIncludesAction(ADMIN, USER_ROLE_ASSIGN_STUDENT)).toBe(false);
		expect(rel.roleIncludesAction(ADMIN, GAMES_SEE)).toBe(false);
		expect(rel.roleIncludesAction(ADMIN, GAMES_SEE_ADMIN)).toBe(false);
		expect(rel.roleIncludesAction(ADMIN, GAMES_SEE_TEACHER)).toBe(false);
		expect(rel.roleIncludesAction(ADMIN, GAMES_SEE_MEMBER)).toBe(false);
		expect(rel.roleIncludesAction(ADMIN, GAMES_SEE_STUDENT)).toBe(false);
		expect(rel.roleIncludesAction(ADMIN, USER_CHALLENGE)).toBe(false);
		expect(rel.roleIncludesAction(ADMIN, USER_CHALLENGE_ADMIN)).toBe(false);
		expect(rel.roleIncludesAction(ADMIN, USER_CHALLENGE_MEMBER)).toBe(false);
		expect(rel.roleIncludesAction(ADMIN, USER_CHALLENGE_TEACHER)).toBe(false);
		expect(rel.roleIncludesAction(ADMIN, USER_CHALLENGE_STUDENT)).toBe(false);

		expect(rel.roleIncludesAction(STUDENT, CREATE_USER)).toBe(false);
		expect(rel.roleIncludesAction(STUDENT, GAMES_CREATE)).toBe(false);
		expect(rel.roleIncludesAction(STUDENT, USER_EDIT)).toBe(false);
		expect(rel.roleIncludesAction(STUDENT, USER_EDIT_ADMIN)).toBe(false);
		expect(rel.roleIncludesAction(STUDENT, USER_EDIT_TEACHER)).toBe(false);
		expect(rel.roleIncludesAction(STUDENT, USER_EDIT_MEMBER)).toBe(false);
		expect(rel.roleIncludesAction(STUDENT, USER_EDIT_STUDENT)).toBe(false);
		expect(rel.roleIncludesAction(STUDENT, GAMES_EDIT)).toBe(false);
		expect(rel.roleIncludesAction(STUDENT, GAMES_EDIT_ADMIN)).toBe(false);
		expect(rel.roleIncludesAction(STUDENT, GAMES_EDIT_TEACHER)).toBe(false);
		expect(rel.roleIncludesAction(STUDENT, GAMES_EDIT_MEMBER)).toBe(false);
		expect(rel.roleIncludesAction(STUDENT, GAMES_EDIT_STUDENT)).toBe(false);
		expect(rel.roleIncludesAction(STUDENT, USER_ROLE_ASSIGN)).toBe(false);
		expect(rel.roleIncludesAction(STUDENT, USER_ROLE_ASSIGN_ADMIN)).toBe(false);
		expect(rel.roleIncludesAction(STUDENT, USER_ROLE_ASSIGN_TEACHER)).toBe(false);
		expect(rel.roleIncludesAction(STUDENT, USER_ROLE_ASSIGN_MEMBER)).toBe(false);
		expect(rel.roleIncludesAction(STUDENT, USER_ROLE_ASSIGN_STUDENT)).toBe(false);
		expect(rel.roleIncludesAction(STUDENT, GAMES_SEE)).toBe(false);
		expect(rel.roleIncludesAction(STUDENT, GAMES_SEE_ADMIN)).toBe(false);
		expect(rel.roleIncludesAction(STUDENT, GAMES_SEE_TEACHER)).toBe(false);
		expect(rel.roleIncludesAction(STUDENT, GAMES_SEE_MEMBER)).toBe(false);
		expect(rel.roleIncludesAction(STUDENT, GAMES_SEE_STUDENT)).toBe(false);
		expect(rel.roleIncludesAction(STUDENT, USER_CHALLENGE)).toBe(true);
		expect(rel.roleIncludesAction(STUDENT, USER_CHALLENGE_ADMIN)).toBe(false);
		expect(rel.roleIncludesAction(STUDENT, USER_CHALLENGE_MEMBER)).toBe(false);
		expect(rel.roleIncludesAction(STUDENT, USER_CHALLENGE_TEACHER)).toBe(false);
		expect(rel.roleIncludesAction(STUDENT, USER_CHALLENGE_STUDENT)).toBe(true);
	});

	test('Teacher + Member', () => {
		let rel = UserRoleToUserAction.getInstance();
		rel.clear();
		initializePermissions({
			admin: [],
			teacher: [USER_ROLE_ASSIGN_STUDENT, GAMES_SEE_MEMBER],
			student: [],
			member: [USER_CHALLENGE_STUDENT, USER_CHALLENGE_TEACHER]
		});

		expect(rel.roleIncludesAction(TEACHER, CREATE_USER)).toBe(false);
		expect(rel.roleIncludesAction(TEACHER, GAMES_CREATE)).toBe(false);
		expect(rel.roleIncludesAction(TEACHER, USER_EDIT)).toBe(false);
		expect(rel.roleIncludesAction(TEACHER, USER_EDIT_ADMIN)).toBe(false);
		expect(rel.roleIncludesAction(TEACHER, USER_EDIT_TEACHER)).toBe(false);
		expect(rel.roleIncludesAction(TEACHER, USER_EDIT_MEMBER)).toBe(false);
		expect(rel.roleIncludesAction(TEACHER, USER_EDIT_STUDENT)).toBe(false);
		expect(rel.roleIncludesAction(TEACHER, GAMES_EDIT)).toBe(false);
		expect(rel.roleIncludesAction(TEACHER, GAMES_EDIT_ADMIN)).toBe(false);
		expect(rel.roleIncludesAction(TEACHER, GAMES_EDIT_TEACHER)).toBe(false);
		expect(rel.roleIncludesAction(TEACHER, GAMES_EDIT_MEMBER)).toBe(false);
		expect(rel.roleIncludesAction(TEACHER, GAMES_EDIT_STUDENT)).toBe(false);
		expect(rel.roleIncludesAction(TEACHER, USER_ROLE_ASSIGN)).toBe(true);
		expect(rel.roleIncludesAction(TEACHER, USER_ROLE_ASSIGN_ADMIN)).toBe(false);
		expect(rel.roleIncludesAction(TEACHER, USER_ROLE_ASSIGN_TEACHER)).toBe(false);
		expect(rel.roleIncludesAction(TEACHER, USER_ROLE_ASSIGN_MEMBER)).toBe(false);
		expect(rel.roleIncludesAction(TEACHER, USER_ROLE_ASSIGN_STUDENT)).toBe(true);
		expect(rel.roleIncludesAction(TEACHER, GAMES_SEE)).toBe(true);
		expect(rel.roleIncludesAction(TEACHER, GAMES_SEE_ADMIN)).toBe(false);
		expect(rel.roleIncludesAction(TEACHER, GAMES_SEE_TEACHER)).toBe(false);
		expect(rel.roleIncludesAction(TEACHER, GAMES_SEE_MEMBER)).toBe(true);
		expect(rel.roleIncludesAction(TEACHER, GAMES_SEE_STUDENT)).toBe(false);
		expect(rel.roleIncludesAction(TEACHER, USER_CHALLENGE)).toBe(false);
		expect(rel.roleIncludesAction(TEACHER, USER_CHALLENGE_ADMIN)).toBe(false);
		expect(rel.roleIncludesAction(TEACHER, USER_CHALLENGE_MEMBER)).toBe(false);
		expect(rel.roleIncludesAction(TEACHER, USER_CHALLENGE_TEACHER)).toBe(false);
		expect(rel.roleIncludesAction(TEACHER, USER_CHALLENGE_STUDENT)).toBe(false);

		expect(rel.roleIncludesAction(MEMBER, CREATE_USER)).toBe(false);
		expect(rel.roleIncludesAction(MEMBER, GAMES_CREATE)).toBe(false);
		expect(rel.roleIncludesAction(MEMBER, USER_EDIT)).toBe(false);
		expect(rel.roleIncludesAction(MEMBER, USER_EDIT_ADMIN)).toBe(false);
		expect(rel.roleIncludesAction(MEMBER, USER_EDIT_TEACHER)).toBe(false);
		expect(rel.roleIncludesAction(MEMBER, USER_EDIT_MEMBER)).toBe(false);
		expect(rel.roleIncludesAction(MEMBER, USER_EDIT_STUDENT)).toBe(false);
		expect(rel.roleIncludesAction(MEMBER, GAMES_EDIT)).toBe(false);
		expect(rel.roleIncludesAction(MEMBER, GAMES_EDIT_ADMIN)).toBe(false);
		expect(rel.roleIncludesAction(MEMBER, GAMES_EDIT_TEACHER)).toBe(false);
		expect(rel.roleIncludesAction(MEMBER, GAMES_EDIT_MEMBER)).toBe(false);
		expect(rel.roleIncludesAction(MEMBER, GAMES_EDIT_STUDENT)).toBe(false);
		expect(rel.roleIncludesAction(MEMBER, USER_ROLE_ASSIGN)).toBe(false);
		expect(rel.roleIncludesAction(MEMBER, USER_ROLE_ASSIGN_ADMIN)).toBe(false);
		expect(rel.roleIncludesAction(MEMBER, USER_ROLE_ASSIGN_TEACHER)).toBe(false);
		expect(rel.roleIncludesAction(MEMBER, USER_ROLE_ASSIGN_MEMBER)).toBe(false);
		expect(rel.roleIncludesAction(MEMBER, USER_ROLE_ASSIGN_STUDENT)).toBe(false);
		expect(rel.roleIncludesAction(MEMBER, GAMES_SEE)).toBe(false);
		expect(rel.roleIncludesAction(MEMBER, GAMES_SEE_ADMIN)).toBe(false);
		expect(rel.roleIncludesAction(MEMBER, GAMES_SEE_TEACHER)).toBe(false);
		expect(rel.roleIncludesAction(MEMBER, GAMES_SEE_MEMBER)).toBe(false);
		expect(rel.roleIncludesAction(MEMBER, GAMES_SEE_STUDENT)).toBe(false);
		expect(rel.roleIncludesAction(MEMBER, USER_CHALLENGE)).toBe(true);
		expect(rel.roleIncludesAction(MEMBER, USER_CHALLENGE_ADMIN)).toBe(false);
		expect(rel.roleIncludesAction(MEMBER, USER_CHALLENGE_MEMBER)).toBe(false);
		expect(rel.roleIncludesAction(MEMBER, USER_CHALLENGE_TEACHER)).toBe(true);
		expect(rel.roleIncludesAction(MEMBER, USER_CHALLENGE_STUDENT)).toBe(true);
	});
});
