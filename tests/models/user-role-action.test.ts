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

import { ALL_USER_ROLES } from '@app/common/models/user-role';
import { roleActionNames, userActionIdToUserAction } from '@common/models/user-action';
import { initializePermissions, UserRoleToUserAction } from '@server/managers/user-role-action';

describe('Actions allowed per user (single role)', () => {
	test('Admin', () => {
		let rel = UserRoleToUserAction.getInstance();
		rel.clear();
		initializePermissions({
			admin: ['EDIT_USER_TEACHER'],
			referee: [],
			teacher: [],
			student: [],
			member: [],
		});

		expect(rel.roleHasAction('ADMIN', 'CREATE_USER')).toBe(false);
		expect(rel.roleHasAction('ADMIN', 'CREATE_GAMES')).toBe(false);
		expect(rel.roleHasAction('ADMIN', 'CREATE_GAMES_REFEREE')).toBe(false);
		expect(rel.roleHasAction('ADMIN', 'EDIT_USER')).toBe(true);
		expect(rel.roleHasAction('ADMIN', 'EDIT_USER_ADMIN')).toBe(false);
		expect(rel.roleHasAction('ADMIN', 'EDIT_USER_REFEREE')).toBe(false);
		expect(rel.roleHasAction('ADMIN', 'EDIT_USER_TEACHER')).toBe(true);
		expect(rel.roleHasAction('ADMIN', 'EDIT_USER_MEMBER')).toBe(false);
		expect(rel.roleHasAction('ADMIN', 'EDIT_USER_STUDENT')).toBe(false);
		expect(rel.roleHasAction('ADMIN', 'EDIT_GAMES')).toBe(false);
		expect(rel.roleHasAction('ADMIN', 'EDIT_GAMES_ADMIN')).toBe(false);
		expect(rel.roleHasAction('ADMIN', 'EDIT_GAMES_REFEREE')).toBe(false);
		expect(rel.roleHasAction('ADMIN', 'EDIT_GAMES_TEACHER')).toBe(false);
		expect(rel.roleHasAction('ADMIN', 'EDIT_GAMES_MEMBER')).toBe(false);
		expect(rel.roleHasAction('ADMIN', 'EDIT_GAMES_STUDENT')).toBe(false);
		expect(rel.roleHasAction('ADMIN', 'ASSIGN_ROLE')).toBe(false);
		expect(rel.roleHasAction('ADMIN', 'ASSIGN_ROLE_ADMIN')).toBe(false);
		expect(rel.roleHasAction('ADMIN', 'ASSIGN_ROLE_TEACHER')).toBe(false);
		expect(rel.roleHasAction('ADMIN', 'ASSIGN_ROLE_MEMBER')).toBe(false);
		expect(rel.roleHasAction('ADMIN', 'ASSIGN_ROLE_STUDENT')).toBe(false);
		expect(rel.roleHasAction('ADMIN', 'SEE_GAMES')).toBe(false);
		expect(rel.roleHasAction('ADMIN', 'SEE_GAMES_ADMIN')).toBe(false);
		expect(rel.roleHasAction('ADMIN', 'SEE_GAMES_REFEREE')).toBe(false);
		expect(rel.roleHasAction('ADMIN', 'SEE_GAMES_TEACHER')).toBe(false);
		expect(rel.roleHasAction('ADMIN', 'SEE_GAMES_MEMBER')).toBe(false);
		expect(rel.roleHasAction('ADMIN', 'SEE_GAMES_STUDENT')).toBe(false);
		expect(rel.roleHasAction('ADMIN', 'CHALLENGE_USER')).toBe(false);
		expect(rel.roleHasAction('ADMIN', 'CHALLENGE_USER_ADMIN')).toBe(false);
		expect(rel.roleHasAction('ADMIN', 'CHALLENGE_USER_REFEREE')).toBe(false);
		expect(rel.roleHasAction('ADMIN', 'CHALLENGE_USER_MEMBER')).toBe(false);
		expect(rel.roleHasAction('ADMIN', 'CHALLENGE_USER_TEACHER')).toBe(false);
		expect(rel.roleHasAction('ADMIN', 'CHALLENGE_USER_STUDENT')).toBe(false);
		expect(rel.roleHasAction('ADMIN', 'DELETE_GAMES_REFEREE')).toBe(false);
		expect(rel.roleHasAction('ADMIN', 'SEE_GRAPHS_REFEREE')).toBe(false);
		expect(rel.roleHasAction('ADMIN', 'FORCE_CHALLENGE_ACCEPT')).toBe(false);
		expect(rel.roleHasAction('ADMIN', 'FORCE_CHALLENGE_ACCEPT_ADMIN')).toBe(false);
		expect(rel.roleHasAction('ADMIN', 'FORCE_CHALLENGE_ACCEPT_REFEREE')).toBe(false);
		expect(rel.roleHasAction('ADMIN', 'FORCE_CHALLENGE_ACCEPT_TEACHER')).toBe(false);
		expect(rel.roleHasAction('ADMIN', 'FORCE_CHALLENGE_ACCEPT_MEMBER')).toBe(false);
		expect(rel.roleHasAction('ADMIN', 'FORCE_CHALLENGE_ACCEPT_STUDENT')).toBe(false);
		expect(rel.roleHasAction('ADMIN', 'FORCE_CHALLENGE_SET_RESULT')).toBe(false);
		expect(rel.roleHasAction('ADMIN', 'FORCE_CHALLENGE_SET_RESULT_ADMIN')).toBe(false);
		expect(rel.roleHasAction('ADMIN', 'FORCE_CHALLENGE_SET_RESULT_REFEREE')).toBe(false);
		expect(rel.roleHasAction('ADMIN', 'FORCE_CHALLENGE_SET_RESULT_TEACHER')).toBe(false);
		expect(rel.roleHasAction('ADMIN', 'FORCE_CHALLENGE_SET_RESULT_MEMBER')).toBe(false);
		expect(rel.roleHasAction('ADMIN', 'FORCE_CHALLENGE_SET_RESULT_STUDENT')).toBe(false);
		expect(rel.roleHasAction('ADMIN', 'FORCE_CHALLENGE_ACCEPT_RESULT')).toBe(false);
		expect(rel.roleHasAction('ADMIN', 'FORCE_CHALLENGE_ACCEPT_RESULT_ADMIN')).toBe(false);
		expect(rel.roleHasAction('ADMIN', 'FORCE_CHALLENGE_ACCEPT_RESULT_REFEREE')).toBe(false);
		expect(rel.roleHasAction('ADMIN', 'FORCE_CHALLENGE_ACCEPT_RESULT_TEACHER')).toBe(false);
		expect(rel.roleHasAction('ADMIN', 'FORCE_CHALLENGE_ACCEPT_RESULT_MEMBER')).toBe(false);
		expect(rel.roleHasAction('ADMIN', 'FORCE_CHALLENGE_ACCEPT_RESULT_STUDENT')).toBe(false);
	});

	test('Teacher', () => {
		let rel = UserRoleToUserAction.getInstance();
		rel.clear();
		initializePermissions({
			admin: [],
			referee: [],
			teacher: ['ASSIGN_ROLE_MEMBER'],
			student: [],
			member: [],
		});

		expect(rel.roleHasAction('TEACHER', 'CREATE_USER')).toBe(false);
		expect(rel.roleHasAction('TEACHER', 'CREATE_GAMES')).toBe(false);
		expect(rel.roleHasAction('TEACHER', 'CREATE_GAMES_REFEREE')).toBe(false);
		expect(rel.roleHasAction('TEACHER', 'EDIT_USER')).toBe(false);
		expect(rel.roleHasAction('TEACHER', 'EDIT_USER_ADMIN')).toBe(false);
		expect(rel.roleHasAction('TEACHER', 'EDIT_USER_REFEREE')).toBe(false);
		expect(rel.roleHasAction('TEACHER', 'EDIT_USER_TEACHER')).toBe(false);
		expect(rel.roleHasAction('TEACHER', 'EDIT_USER_MEMBER')).toBe(false);
		expect(rel.roleHasAction('TEACHER', 'EDIT_USER_STUDENT')).toBe(false);
		expect(rel.roleHasAction('TEACHER', 'EDIT_GAMES')).toBe(false);
		expect(rel.roleHasAction('TEACHER', 'EDIT_GAMES_ADMIN')).toBe(false);
		expect(rel.roleHasAction('TEACHER', 'EDIT_GAMES_REFEREE')).toBe(false);
		expect(rel.roleHasAction('TEACHER', 'EDIT_GAMES_TEACHER')).toBe(false);
		expect(rel.roleHasAction('TEACHER', 'EDIT_GAMES_MEMBER')).toBe(false);
		expect(rel.roleHasAction('TEACHER', 'EDIT_GAMES_STUDENT')).toBe(false);
		expect(rel.roleHasAction('TEACHER', 'ASSIGN_ROLE')).toBe(true);
		expect(rel.roleHasAction('TEACHER', 'ASSIGN_ROLE_ADMIN')).toBe(false);
		expect(rel.roleHasAction('TEACHER', 'ASSIGN_ROLE_TEACHER')).toBe(false);
		expect(rel.roleHasAction('TEACHER', 'ASSIGN_ROLE_MEMBER')).toBe(true);
		expect(rel.roleHasAction('TEACHER', 'ASSIGN_ROLE_STUDENT')).toBe(false);
		expect(rel.roleHasAction('TEACHER', 'SEE_GAMES')).toBe(false);
		expect(rel.roleHasAction('TEACHER', 'SEE_GAMES_ADMIN')).toBe(false);
		expect(rel.roleHasAction('TEACHER', 'SEE_GAMES_REFEREE')).toBe(false);
		expect(rel.roleHasAction('TEACHER', 'SEE_GAMES_TEACHER')).toBe(false);
		expect(rel.roleHasAction('TEACHER', 'SEE_GAMES_MEMBER')).toBe(false);
		expect(rel.roleHasAction('TEACHER', 'SEE_GAMES_STUDENT')).toBe(false);
		expect(rel.roleHasAction('TEACHER', 'CHALLENGE_USER')).toBe(false);
		expect(rel.roleHasAction('TEACHER', 'CHALLENGE_USER_ADMIN')).toBe(false);
		expect(rel.roleHasAction('TEACHER', 'CHALLENGE_USER_REFEREE')).toBe(false);
		expect(rel.roleHasAction('TEACHER', 'CHALLENGE_USER_MEMBER')).toBe(false);
		expect(rel.roleHasAction('TEACHER', 'CHALLENGE_USER_TEACHER')).toBe(false);
		expect(rel.roleHasAction('TEACHER', 'CHALLENGE_USER_STUDENT')).toBe(false);
		expect(rel.roleHasAction('TEACHER', 'DELETE_GAMES_REFEREE')).toBe(false);
		expect(rel.roleHasAction('TEACHER', 'SEE_GRAPHS_REFEREE')).toBe(false);
		expect(rel.roleHasAction('TEACHER', 'FORCE_CHALLENGE_ACCEPT')).toBe(false);
		expect(rel.roleHasAction('TEACHER', 'FORCE_CHALLENGE_ACCEPT_ADMIN')).toBe(false);
		expect(rel.roleHasAction('TEACHER', 'FORCE_CHALLENGE_ACCEPT_REFEREE')).toBe(false);
		expect(rel.roleHasAction('TEACHER', 'FORCE_CHALLENGE_ACCEPT_TEACHER')).toBe(false);
		expect(rel.roleHasAction('TEACHER', 'FORCE_CHALLENGE_ACCEPT_MEMBER')).toBe(false);
		expect(rel.roleHasAction('TEACHER', 'FORCE_CHALLENGE_ACCEPT_STUDENT')).toBe(false);
		expect(rel.roleHasAction('TEACHER', 'FORCE_CHALLENGE_SET_RESULT')).toBe(false);
		expect(rel.roleHasAction('TEACHER', 'FORCE_CHALLENGE_SET_RESULT_ADMIN')).toBe(false);
		expect(rel.roleHasAction('TEACHER', 'FORCE_CHALLENGE_SET_RESULT_REFEREE')).toBe(false);
		expect(rel.roleHasAction('TEACHER', 'FORCE_CHALLENGE_SET_RESULT_TEACHER')).toBe(false);
		expect(rel.roleHasAction('TEACHER', 'FORCE_CHALLENGE_SET_RESULT_MEMBER')).toBe(false);
		expect(rel.roleHasAction('TEACHER', 'FORCE_CHALLENGE_SET_RESULT_STUDENT')).toBe(false);
		expect(rel.roleHasAction('TEACHER', 'FORCE_CHALLENGE_ACCEPT_RESULT')).toBe(false);
		expect(rel.roleHasAction('TEACHER', 'FORCE_CHALLENGE_ACCEPT_RESULT_ADMIN')).toBe(false);
		expect(rel.roleHasAction('TEACHER', 'FORCE_CHALLENGE_ACCEPT_RESULT_REFEREE')).toBe(false);
		expect(rel.roleHasAction('TEACHER', 'FORCE_CHALLENGE_ACCEPT_RESULT_TEACHER')).toBe(false);
		expect(rel.roleHasAction('TEACHER', 'FORCE_CHALLENGE_ACCEPT_RESULT_MEMBER')).toBe(false);
		expect(rel.roleHasAction('TEACHER', 'FORCE_CHALLENGE_ACCEPT_RESULT_STUDENT')).toBe(false);
	});

	test('Student', () => {
		let rel = UserRoleToUserAction.getInstance();
		rel.clear();
		initializePermissions({
			admin: [],
			referee: [],
			teacher: [],
			student: ['CREATE_USER', 'CREATE_GAMES'],
			member: [],
		});

		expect(rel.roleHasAction('STUDENT', 'CREATE_USER')).toBe(true);
		expect(rel.roleHasAction('STUDENT', 'CREATE_GAMES')).toBe(true);
		expect(rel.roleHasAction('STUDENT', 'CREATE_GAMES_REFEREE')).toBe(false);
		expect(rel.roleHasAction('STUDENT', 'EDIT_USER')).toBe(false);
		expect(rel.roleHasAction('STUDENT', 'EDIT_USER_ADMIN')).toBe(false);
		expect(rel.roleHasAction('STUDENT', 'EDIT_USER_REFEREE')).toBe(false);
		expect(rel.roleHasAction('STUDENT', 'EDIT_USER_TEACHER')).toBe(false);
		expect(rel.roleHasAction('STUDENT', 'EDIT_USER_MEMBER')).toBe(false);
		expect(rel.roleHasAction('STUDENT', 'EDIT_USER_STUDENT')).toBe(false);
		expect(rel.roleHasAction('STUDENT', 'EDIT_GAMES')).toBe(false);
		expect(rel.roleHasAction('STUDENT', 'EDIT_GAMES_ADMIN')).toBe(false);
		expect(rel.roleHasAction('STUDENT', 'EDIT_GAMES_REFEREE')).toBe(false);
		expect(rel.roleHasAction('STUDENT', 'EDIT_GAMES_TEACHER')).toBe(false);
		expect(rel.roleHasAction('STUDENT', 'EDIT_GAMES_MEMBER')).toBe(false);
		expect(rel.roleHasAction('STUDENT', 'EDIT_GAMES_STUDENT')).toBe(false);
		expect(rel.roleHasAction('STUDENT', 'ASSIGN_ROLE')).toBe(false);
		expect(rel.roleHasAction('STUDENT', 'ASSIGN_ROLE_ADMIN')).toBe(false);
		expect(rel.roleHasAction('STUDENT', 'ASSIGN_ROLE_TEACHER')).toBe(false);
		expect(rel.roleHasAction('STUDENT', 'ASSIGN_ROLE_MEMBER')).toBe(false);
		expect(rel.roleHasAction('STUDENT', 'ASSIGN_ROLE_STUDENT')).toBe(false);
		expect(rel.roleHasAction('STUDENT', 'SEE_GAMES')).toBe(false);
		expect(rel.roleHasAction('STUDENT', 'SEE_GAMES_ADMIN')).toBe(false);
		expect(rel.roleHasAction('STUDENT', 'SEE_GAMES_REFEREE')).toBe(false);
		expect(rel.roleHasAction('STUDENT', 'SEE_GAMES_TEACHER')).toBe(false);
		expect(rel.roleHasAction('STUDENT', 'SEE_GAMES_MEMBER')).toBe(false);
		expect(rel.roleHasAction('STUDENT', 'SEE_GAMES_STUDENT')).toBe(false);
		expect(rel.roleHasAction('STUDENT', 'CHALLENGE_USER')).toBe(false);
		expect(rel.roleHasAction('STUDENT', 'CHALLENGE_USER_ADMIN')).toBe(false);
		expect(rel.roleHasAction('STUDENT', 'CHALLENGE_USER_REFEREE')).toBe(false);
		expect(rel.roleHasAction('STUDENT', 'CHALLENGE_USER_MEMBER')).toBe(false);
		expect(rel.roleHasAction('STUDENT', 'CHALLENGE_USER_TEACHER')).toBe(false);
		expect(rel.roleHasAction('STUDENT', 'CHALLENGE_USER_STUDENT')).toBe(false);
		expect(rel.roleHasAction('STUDENT', 'DELETE_GAMES_REFEREE')).toBe(false);
		expect(rel.roleHasAction('STUDENT', 'SEE_GRAPHS_REFEREE')).toBe(false);
		expect(rel.roleHasAction('STUDENT', 'FORCE_CHALLENGE_ACCEPT')).toBe(false);
		expect(rel.roleHasAction('STUDENT', 'FORCE_CHALLENGE_ACCEPT_ADMIN')).toBe(false);
		expect(rel.roleHasAction('STUDENT', 'FORCE_CHALLENGE_ACCEPT_REFEREE')).toBe(false);
		expect(rel.roleHasAction('STUDENT', 'FORCE_CHALLENGE_ACCEPT_TEACHER')).toBe(false);
		expect(rel.roleHasAction('STUDENT', 'FORCE_CHALLENGE_ACCEPT_MEMBER')).toBe(false);
		expect(rel.roleHasAction('STUDENT', 'FORCE_CHALLENGE_ACCEPT_STUDENT')).toBe(false);
		expect(rel.roleHasAction('STUDENT', 'FORCE_CHALLENGE_SET_RESULT')).toBe(false);
		expect(rel.roleHasAction('STUDENT', 'FORCE_CHALLENGE_SET_RESULT_ADMIN')).toBe(false);
		expect(rel.roleHasAction('STUDENT', 'FORCE_CHALLENGE_SET_RESULT_REFEREE')).toBe(false);
		expect(rel.roleHasAction('STUDENT', 'FORCE_CHALLENGE_SET_RESULT_TEACHER')).toBe(false);
		expect(rel.roleHasAction('STUDENT', 'FORCE_CHALLENGE_SET_RESULT_MEMBER')).toBe(false);
		expect(rel.roleHasAction('STUDENT', 'FORCE_CHALLENGE_SET_RESULT_STUDENT')).toBe(false);
		expect(rel.roleHasAction('STUDENT', 'FORCE_CHALLENGE_ACCEPT_RESULT')).toBe(false);
		expect(rel.roleHasAction('STUDENT', 'FORCE_CHALLENGE_ACCEPT_RESULT_ADMIN')).toBe(false);
		expect(rel.roleHasAction('STUDENT', 'FORCE_CHALLENGE_ACCEPT_RESULT_REFEREE')).toBe(false);
		expect(rel.roleHasAction('STUDENT', 'FORCE_CHALLENGE_ACCEPT_RESULT_TEACHER')).toBe(false);
		expect(rel.roleHasAction('STUDENT', 'FORCE_CHALLENGE_ACCEPT_RESULT_MEMBER')).toBe(false);
		expect(rel.roleHasAction('STUDENT', 'FORCE_CHALLENGE_ACCEPT_RESULT_STUDENT')).toBe(false);
	});

	test('Member', () => {
		let rel = UserRoleToUserAction.getInstance();
		rel.clear();
		initializePermissions({
			admin: [],
			referee: [],
			teacher: [],
			student: [],
			member: ['CHALLENGE_USER_ADMIN', 'CHALLENGE_USER_STUDENT'],
		});

		expect(rel.roleHasAction('MEMBER', 'CREATE_USER')).toBe(false);
		expect(rel.roleHasAction('MEMBER', 'CREATE_GAMES')).toBe(false);
		expect(rel.roleHasAction('MEMBER', 'EDIT_USER')).toBe(false);
		expect(rel.roleHasAction('MEMBER', 'EDIT_USER_ADMIN')).toBe(false);
		expect(rel.roleHasAction('MEMBER', 'EDIT_USER_TEACHER')).toBe(false);
		expect(rel.roleHasAction('MEMBER', 'EDIT_USER_MEMBER')).toBe(false);
		expect(rel.roleHasAction('MEMBER', 'EDIT_USER_STUDENT')).toBe(false);
		expect(rel.roleHasAction('MEMBER', 'EDIT_GAMES')).toBe(false);
		expect(rel.roleHasAction('MEMBER', 'EDIT_GAMES_ADMIN')).toBe(false);
		expect(rel.roleHasAction('MEMBER', 'EDIT_GAMES_TEACHER')).toBe(false);
		expect(rel.roleHasAction('MEMBER', 'EDIT_GAMES_MEMBER')).toBe(false);
		expect(rel.roleHasAction('MEMBER', 'EDIT_GAMES_STUDENT')).toBe(false);
		expect(rel.roleHasAction('MEMBER', 'ASSIGN_ROLE')).toBe(false);
		expect(rel.roleHasAction('MEMBER', 'ASSIGN_ROLE_ADMIN')).toBe(false);
		expect(rel.roleHasAction('MEMBER', 'ASSIGN_ROLE_TEACHER')).toBe(false);
		expect(rel.roleHasAction('MEMBER', 'ASSIGN_ROLE_MEMBER')).toBe(false);
		expect(rel.roleHasAction('MEMBER', 'ASSIGN_ROLE_STUDENT')).toBe(false);
		expect(rel.roleHasAction('MEMBER', 'SEE_GAMES')).toBe(false);
		expect(rel.roleHasAction('MEMBER', 'SEE_GAMES_ADMIN')).toBe(false);
		expect(rel.roleHasAction('MEMBER', 'SEE_GAMES_TEACHER')).toBe(false);
		expect(rel.roleHasAction('MEMBER', 'SEE_GAMES_MEMBER')).toBe(false);
		expect(rel.roleHasAction('MEMBER', 'SEE_GAMES_STUDENT')).toBe(false);
		expect(rel.roleHasAction('MEMBER', 'CHALLENGE_USER')).toBe(true);
		expect(rel.roleHasAction('MEMBER', 'CHALLENGE_USER_ADMIN')).toBe(true);
		expect(rel.roleHasAction('MEMBER', 'CHALLENGE_USER_MEMBER')).toBe(false);
		expect(rel.roleHasAction('MEMBER', 'CHALLENGE_USER_TEACHER')).toBe(false);
		expect(rel.roleHasAction('MEMBER', 'CHALLENGE_USER_STUDENT')).toBe(true);
	});
});

describe('Actions allowed per user (multiple roles)', () => {
	test('Admin + Teacher', () => {
		let rel = UserRoleToUserAction.getInstance();
		rel.clear();
		initializePermissions({
			admin: ['EDIT_USER_TEACHER'],
			referee: [],
			teacher: [],
			student: ['CHALLENGE_USER_STUDENT'],
			member: [],
		});

		expect(rel.roleHasAction('ADMIN', 'CREATE_USER')).toBe(false);
		expect(rel.roleHasAction('ADMIN', 'CREATE_GAMES')).toBe(false);
		expect(rel.roleHasAction('ADMIN', 'EDIT_USER')).toBe(true);
		expect(rel.roleHasAction('ADMIN', 'EDIT_USER_ADMIN')).toBe(false);
		expect(rel.roleHasAction('ADMIN', 'EDIT_USER_TEACHER')).toBe(true);
		expect(rel.roleHasAction('ADMIN', 'EDIT_USER_MEMBER')).toBe(false);
		expect(rel.roleHasAction('ADMIN', 'EDIT_USER_STUDENT')).toBe(false);
		expect(rel.roleHasAction('ADMIN', 'EDIT_GAMES')).toBe(false);
		expect(rel.roleHasAction('ADMIN', 'EDIT_GAMES_ADMIN')).toBe(false);
		expect(rel.roleHasAction('ADMIN', 'EDIT_GAMES_TEACHER')).toBe(false);
		expect(rel.roleHasAction('ADMIN', 'EDIT_GAMES_MEMBER')).toBe(false);
		expect(rel.roleHasAction('ADMIN', 'EDIT_GAMES_STUDENT')).toBe(false);
		expect(rel.roleHasAction('ADMIN', 'ASSIGN_ROLE')).toBe(false);
		expect(rel.roleHasAction('ADMIN', 'ASSIGN_ROLE_ADMIN')).toBe(false);
		expect(rel.roleHasAction('ADMIN', 'ASSIGN_ROLE_TEACHER')).toBe(false);
		expect(rel.roleHasAction('ADMIN', 'ASSIGN_ROLE_MEMBER')).toBe(false);
		expect(rel.roleHasAction('ADMIN', 'ASSIGN_ROLE_STUDENT')).toBe(false);
		expect(rel.roleHasAction('ADMIN', 'SEE_GAMES')).toBe(false);
		expect(rel.roleHasAction('ADMIN', 'SEE_GAMES_ADMIN')).toBe(false);
		expect(rel.roleHasAction('ADMIN', 'SEE_GAMES_TEACHER')).toBe(false);
		expect(rel.roleHasAction('ADMIN', 'SEE_GAMES_MEMBER')).toBe(false);
		expect(rel.roleHasAction('ADMIN', 'SEE_GAMES_STUDENT')).toBe(false);
		expect(rel.roleHasAction('ADMIN', 'CHALLENGE_USER')).toBe(false);
		expect(rel.roleHasAction('ADMIN', 'CHALLENGE_USER_ADMIN')).toBe(false);
		expect(rel.roleHasAction('ADMIN', 'CHALLENGE_USER_MEMBER')).toBe(false);
		expect(rel.roleHasAction('ADMIN', 'CHALLENGE_USER_TEACHER')).toBe(false);
		expect(rel.roleHasAction('ADMIN', 'CHALLENGE_USER_STUDENT')).toBe(false);

		expect(rel.roleHasAction('STUDENT', 'CREATE_USER')).toBe(false);
		expect(rel.roleHasAction('STUDENT', 'CREATE_GAMES')).toBe(false);
		expect(rel.roleHasAction('STUDENT', 'EDIT_USER')).toBe(false);
		expect(rel.roleHasAction('STUDENT', 'EDIT_USER_ADMIN')).toBe(false);
		expect(rel.roleHasAction('STUDENT', 'EDIT_USER_TEACHER')).toBe(false);
		expect(rel.roleHasAction('STUDENT', 'EDIT_USER_MEMBER')).toBe(false);
		expect(rel.roleHasAction('STUDENT', 'EDIT_USER_STUDENT')).toBe(false);
		expect(rel.roleHasAction('STUDENT', 'EDIT_GAMES')).toBe(false);
		expect(rel.roleHasAction('STUDENT', 'EDIT_GAMES_ADMIN')).toBe(false);
		expect(rel.roleHasAction('STUDENT', 'EDIT_GAMES_TEACHER')).toBe(false);
		expect(rel.roleHasAction('STUDENT', 'EDIT_GAMES_MEMBER')).toBe(false);
		expect(rel.roleHasAction('STUDENT', 'EDIT_GAMES_STUDENT')).toBe(false);
		expect(rel.roleHasAction('STUDENT', 'ASSIGN_ROLE')).toBe(false);
		expect(rel.roleHasAction('STUDENT', 'ASSIGN_ROLE_ADMIN')).toBe(false);
		expect(rel.roleHasAction('STUDENT', 'ASSIGN_ROLE_TEACHER')).toBe(false);
		expect(rel.roleHasAction('STUDENT', 'ASSIGN_ROLE_MEMBER')).toBe(false);
		expect(rel.roleHasAction('STUDENT', 'ASSIGN_ROLE_STUDENT')).toBe(false);
		expect(rel.roleHasAction('STUDENT', 'SEE_GAMES')).toBe(false);
		expect(rel.roleHasAction('STUDENT', 'SEE_GAMES_ADMIN')).toBe(false);
		expect(rel.roleHasAction('STUDENT', 'SEE_GAMES_TEACHER')).toBe(false);
		expect(rel.roleHasAction('STUDENT', 'SEE_GAMES_MEMBER')).toBe(false);
		expect(rel.roleHasAction('STUDENT', 'SEE_GAMES_STUDENT')).toBe(false);
		expect(rel.roleHasAction('STUDENT', 'CHALLENGE_USER')).toBe(true);
		expect(rel.roleHasAction('STUDENT', 'CHALLENGE_USER_ADMIN')).toBe(false);
		expect(rel.roleHasAction('STUDENT', 'CHALLENGE_USER_MEMBER')).toBe(false);
		expect(rel.roleHasAction('STUDENT', 'CHALLENGE_USER_TEACHER')).toBe(false);
		expect(rel.roleHasAction('STUDENT', 'CHALLENGE_USER_STUDENT')).toBe(true);
	});

	test('Teacher + Member', () => {
		let rel = UserRoleToUserAction.getInstance();
		rel.clear();
		initializePermissions({
			admin: [],
			referee: [],
			teacher: ['ASSIGN_ROLE_STUDENT', 'SEE_GAMES_MEMBER'],
			student: [],
			member: ['CHALLENGE_USER_STUDENT', 'CHALLENGE_USER_TEACHER'],
		});

		expect(rel.roleHasAction('TEACHER', 'CREATE_USER')).toBe(false);
		expect(rel.roleHasAction('TEACHER', 'CREATE_GAMES')).toBe(false);
		expect(rel.roleHasAction('TEACHER', 'EDIT_USER')).toBe(false);
		expect(rel.roleHasAction('TEACHER', 'EDIT_USER_ADMIN')).toBe(false);
		expect(rel.roleHasAction('TEACHER', 'EDIT_USER_TEACHER')).toBe(false);
		expect(rel.roleHasAction('TEACHER', 'EDIT_USER_MEMBER')).toBe(false);
		expect(rel.roleHasAction('TEACHER', 'EDIT_USER_STUDENT')).toBe(false);
		expect(rel.roleHasAction('TEACHER', 'EDIT_GAMES')).toBe(false);
		expect(rel.roleHasAction('TEACHER', 'EDIT_GAMES_ADMIN')).toBe(false);
		expect(rel.roleHasAction('TEACHER', 'EDIT_GAMES_TEACHER')).toBe(false);
		expect(rel.roleHasAction('TEACHER', 'EDIT_GAMES_MEMBER')).toBe(false);
		expect(rel.roleHasAction('TEACHER', 'EDIT_GAMES_STUDENT')).toBe(false);
		expect(rel.roleHasAction('TEACHER', 'ASSIGN_ROLE')).toBe(true);
		expect(rel.roleHasAction('TEACHER', 'ASSIGN_ROLE_ADMIN')).toBe(false);
		expect(rel.roleHasAction('TEACHER', 'ASSIGN_ROLE_TEACHER')).toBe(false);
		expect(rel.roleHasAction('TEACHER', 'ASSIGN_ROLE_MEMBER')).toBe(false);
		expect(rel.roleHasAction('TEACHER', 'ASSIGN_ROLE_STUDENT')).toBe(true);
		expect(rel.roleHasAction('TEACHER', 'SEE_GAMES')).toBe(true);
		expect(rel.roleHasAction('TEACHER', 'SEE_GAMES_ADMIN')).toBe(false);
		expect(rel.roleHasAction('TEACHER', 'SEE_GAMES_TEACHER')).toBe(false);
		expect(rel.roleHasAction('TEACHER', 'SEE_GAMES_MEMBER')).toBe(true);
		expect(rel.roleHasAction('TEACHER', 'SEE_GAMES_STUDENT')).toBe(false);
		expect(rel.roleHasAction('TEACHER', 'CHALLENGE_USER')).toBe(false);
		expect(rel.roleHasAction('TEACHER', 'CHALLENGE_USER_ADMIN')).toBe(false);
		expect(rel.roleHasAction('TEACHER', 'CHALLENGE_USER_MEMBER')).toBe(false);
		expect(rel.roleHasAction('TEACHER', 'CHALLENGE_USER_TEACHER')).toBe(false);
		expect(rel.roleHasAction('TEACHER', 'CHALLENGE_USER_STUDENT')).toBe(false);

		expect(rel.roleHasAction('MEMBER', 'CREATE_USER')).toBe(false);
		expect(rel.roleHasAction('MEMBER', 'CREATE_GAMES')).toBe(false);
		expect(rel.roleHasAction('MEMBER', 'EDIT_USER')).toBe(false);
		expect(rel.roleHasAction('MEMBER', 'EDIT_USER_ADMIN')).toBe(false);
		expect(rel.roleHasAction('MEMBER', 'EDIT_USER_TEACHER')).toBe(false);
		expect(rel.roleHasAction('MEMBER', 'EDIT_USER_MEMBER')).toBe(false);
		expect(rel.roleHasAction('MEMBER', 'EDIT_USER_STUDENT')).toBe(false);
		expect(rel.roleHasAction('MEMBER', 'EDIT_GAMES')).toBe(false);
		expect(rel.roleHasAction('MEMBER', 'EDIT_GAMES_ADMIN')).toBe(false);
		expect(rel.roleHasAction('MEMBER', 'EDIT_GAMES_TEACHER')).toBe(false);
		expect(rel.roleHasAction('MEMBER', 'EDIT_GAMES_MEMBER')).toBe(false);
		expect(rel.roleHasAction('MEMBER', 'EDIT_GAMES_STUDENT')).toBe(false);
		expect(rel.roleHasAction('MEMBER', 'ASSIGN_ROLE')).toBe(false);
		expect(rel.roleHasAction('MEMBER', 'ASSIGN_ROLE_ADMIN')).toBe(false);
		expect(rel.roleHasAction('MEMBER', 'ASSIGN_ROLE_TEACHER')).toBe(false);
		expect(rel.roleHasAction('MEMBER', 'ASSIGN_ROLE_MEMBER')).toBe(false);
		expect(rel.roleHasAction('MEMBER', 'ASSIGN_ROLE_STUDENT')).toBe(false);
		expect(rel.roleHasAction('MEMBER', 'SEE_GAMES')).toBe(false);
		expect(rel.roleHasAction('MEMBER', 'SEE_GAMES_ADMIN')).toBe(false);
		expect(rel.roleHasAction('MEMBER', 'SEE_GAMES_TEACHER')).toBe(false);
		expect(rel.roleHasAction('MEMBER', 'SEE_GAMES_MEMBER')).toBe(false);
		expect(rel.roleHasAction('MEMBER', 'SEE_GAMES_STUDENT')).toBe(false);
		expect(rel.roleHasAction('MEMBER', 'CHALLENGE_USER')).toBe(true);
		expect(rel.roleHasAction('MEMBER', 'CHALLENGE_USER_ADMIN')).toBe(false);
		expect(rel.roleHasAction('MEMBER', 'CHALLENGE_USER_MEMBER')).toBe(false);
		expect(rel.roleHasAction('MEMBER', 'CHALLENGE_USER_TEACHER')).toBe(true);
		expect(rel.roleHasAction('MEMBER', 'CHALLENGE_USER_STUDENT')).toBe(true);
	});
});

describe('Force challenge actions', () => {
	test('Each role can perform its force challenge actions', () => {
		let rel = UserRoleToUserAction.getInstance();
		rel.clear();
		initializePermissions({
			admin: [
				'FORCE_CHALLENGE_ACCEPT_ADMIN',
				'FORCE_CHALLENGE_SET_RESULT_ADMIN',
				'FORCE_CHALLENGE_ACCEPT_RESULT_ADMIN',
			],
			referee: [
				'FORCE_CHALLENGE_ACCEPT_REFEREE',
				'FORCE_CHALLENGE_SET_RESULT_REFEREE',
				'FORCE_CHALLENGE_ACCEPT_RESULT_REFEREE',
			],
			teacher: [
				'FORCE_CHALLENGE_ACCEPT_TEACHER',
				'FORCE_CHALLENGE_SET_RESULT_TEACHER',
				'FORCE_CHALLENGE_ACCEPT_RESULT_TEACHER',
			],
			student: [
				'FORCE_CHALLENGE_ACCEPT_STUDENT',
				'FORCE_CHALLENGE_SET_RESULT_STUDENT',
				'FORCE_CHALLENGE_ACCEPT_RESULT_STUDENT',
			],
			member: [
				'FORCE_CHALLENGE_ACCEPT_MEMBER',
				'FORCE_CHALLENGE_SET_RESULT_MEMBER',
				'FORCE_CHALLENGE_ACCEPT_RESULT_MEMBER',
			],
		});

		expect(rel.roleHasAction('ADMIN', 'FORCE_CHALLENGE_ACCEPT_ADMIN')).toBe(true);
		expect(rel.roleHasAction('ADMIN', 'FORCE_CHALLENGE_SET_RESULT_ADMIN')).toBe(true);
		expect(rel.roleHasAction('ADMIN', 'FORCE_CHALLENGE_ACCEPT_RESULT_ADMIN')).toBe(true);
		expect(rel.roleCanDo('ADMIN', 'FORCE_CHALLENGE_ACCEPT')).toBe(true);
		expect(rel.roleCanDo('ADMIN', 'FORCE_CHALLENGE_SET_RESULT')).toBe(true);
		expect(rel.roleCanDo('ADMIN', 'FORCE_CHALLENGE_ACCEPT_RESULT')).toBe(true);

		expect(rel.roleHasAction('REFEREE', 'FORCE_CHALLENGE_ACCEPT_REFEREE')).toBe(true);
		expect(rel.roleHasAction('REFEREE', 'FORCE_CHALLENGE_SET_RESULT_REFEREE')).toBe(true);
		expect(rel.roleHasAction('REFEREE', 'FORCE_CHALLENGE_ACCEPT_RESULT_REFEREE')).toBe(true);
		expect(rel.roleCanDo('REFEREE', 'FORCE_CHALLENGE_ACCEPT')).toBe(true);
		expect(rel.roleCanDo('REFEREE', 'FORCE_CHALLENGE_SET_RESULT')).toBe(true);
		expect(rel.roleCanDo('REFEREE', 'FORCE_CHALLENGE_ACCEPT_RESULT')).toBe(true);

		expect(rel.roleHasAction('TEACHER', 'FORCE_CHALLENGE_ACCEPT_TEACHER')).toBe(true);
		expect(rel.roleHasAction('TEACHER', 'FORCE_CHALLENGE_SET_RESULT_TEACHER')).toBe(true);
		expect(rel.roleHasAction('TEACHER', 'FORCE_CHALLENGE_ACCEPT_RESULT_TEACHER')).toBe(true);
		expect(rel.roleCanDo('TEACHER', 'FORCE_CHALLENGE_ACCEPT')).toBe(true);
		expect(rel.roleCanDo('TEACHER', 'FORCE_CHALLENGE_SET_RESULT')).toBe(true);
		expect(rel.roleCanDo('TEACHER', 'FORCE_CHALLENGE_ACCEPT_RESULT')).toBe(true);

		expect(rel.roleHasAction('STUDENT', 'FORCE_CHALLENGE_ACCEPT_STUDENT')).toBe(true);
		expect(rel.roleHasAction('STUDENT', 'FORCE_CHALLENGE_SET_RESULT_STUDENT')).toBe(true);
		expect(rel.roleHasAction('STUDENT', 'FORCE_CHALLENGE_ACCEPT_RESULT_STUDENT')).toBe(true);
		expect(rel.roleCanDo('STUDENT', 'FORCE_CHALLENGE_ACCEPT')).toBe(true);
		expect(rel.roleCanDo('STUDENT', 'FORCE_CHALLENGE_SET_RESULT')).toBe(true);
		expect(rel.roleCanDo('STUDENT', 'FORCE_CHALLENGE_ACCEPT_RESULT')).toBe(true);

		expect(rel.roleHasAction('MEMBER', 'FORCE_CHALLENGE_ACCEPT_MEMBER')).toBe(true);
		expect(rel.roleHasAction('MEMBER', 'FORCE_CHALLENGE_SET_RESULT_MEMBER')).toBe(true);
		expect(rel.roleHasAction('MEMBER', 'FORCE_CHALLENGE_ACCEPT_RESULT_MEMBER')).toBe(true);
		expect(rel.roleCanDo('MEMBER', 'FORCE_CHALLENGE_ACCEPT')).toBe(true);
		expect(rel.roleCanDo('MEMBER', 'FORCE_CHALLENGE_SET_RESULT')).toBe(true);
		expect(rel.roleCanDo('MEMBER', 'FORCE_CHALLENGE_ACCEPT_RESULT')).toBe(true);

		const remainingActionIds = [
			'CREATE_GAMES',
			'EDIT_GAMES',
			'DELETE_GAMES',
			'EDIT_USERS',
			'ASSIGN_ROLE_USERS',
			'CHALLENGE_USERS',
			'SEE_GAMES',
			'SEE_GRAPHS',
		] as const;

		for (const role of ALL_USER_ROLES) {
			for (const actionId of remainingActionIds) {
				expect(rel.roleCanDo(role, actionId)).toBe(false);
				expect(rel.roleHasAction(role, userActionIdToUserAction[actionId])).toBe(false);

				for (const otherRole of ALL_USER_ROLES) {
					expect(rel.roleHasAction(role, roleActionNames[actionId][otherRole])).toBe(false);
				}
			}
		}
	});
});
