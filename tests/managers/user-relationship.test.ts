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

import { toUserGivenName, User } from '@common/models/user';
import { UserRoleToUserAction } from '@server/managers/user-role-action';
import { initializePermissions } from '@server/managers/user-role-action';
import {
	canUserEdit,
	canUserEditGame,
	canUserCreateGame,
	canUserSeeGame,
	canUserSendChallenge,
	canUserSeeGraph
} from '@server/managers/user-relationships';
import { toPlayerPrivateId } from '@common/models/player';

const un = toPlayerPrivateId('un');
const firstName = toUserGivenName('f');
const lastName = toUserGivenName('l');

describe('Edition', () => {
	const editor_admin = new User(un, firstName, lastName, { encrypted: 'a', iv: 'b' }, ['ADMIN'], [], []);
	const editor_teacher = new User(un, firstName, lastName, { encrypted: 'a', iv: 'b' }, ['TEACHER'], [], []);
	const editor_member = new User(un, firstName, lastName, { encrypted: 'a', iv: 'b' }, ['MEMBER'], [], []);
	const editor_student = new User(un, firstName, lastName, { encrypted: 'a', iv: 'b' }, ['STUDENT'], [], []);

	const edited_admin = new User(un, firstName, lastName, { encrypted: 'a', iv: 'b' }, ['ADMIN'], [], []);
	const edited_teacher = new User(un, firstName, lastName, { encrypted: 'a', iv: 'b' }, ['TEACHER'], [], []);
	const edited_member = new User(un, firstName, lastName, { encrypted: 'a', iv: 'b' }, ['MEMBER'], [], []);
	const edited_student = new User(un, firstName, lastName, { encrypted: 'a', iv: 'b' }, ['STUDENT'], [], []);

	test('Admin -> Teacher', () => {
		let rel = UserRoleToUserAction.getInstance();
		rel.clear();
		initializePermissions({
			admin: ['EDIT_USER_TEACHER'],
			teacher: [],
			student: [],
			member: []
		});

		expect(canUserEdit(editor_admin, edited_admin)).toBe(false);
		expect(canUserEdit(editor_admin, edited_teacher)).toBe(true);
		expect(canUserEdit(editor_admin, edited_member)).toBe(false);
		expect(canUserEdit(editor_admin, edited_student)).toBe(false);
	});

	test('Admin -> Teacher + Student', () => {
		let rel = UserRoleToUserAction.getInstance();
		rel.clear();
		initializePermissions({
			admin: ['EDIT_USER_TEACHER', 'EDIT_USER_STUDENT'],
			teacher: [],
			student: [],
			member: []
		});

		expect(canUserEdit(editor_admin, edited_admin)).toBe(false);
		expect(canUserEdit(editor_admin, edited_teacher)).toBe(true);
		expect(canUserEdit(editor_admin, edited_member)).toBe(false);
		expect(canUserEdit(editor_admin, edited_student)).toBe(true);
	});

	test('Teacher -> Teacher', () => {
		let rel = UserRoleToUserAction.getInstance();
		rel.clear();
		initializePermissions({
			admin: [],
			teacher: ['EDIT_USER_TEACHER'],
			student: [],
			member: []
		});

		expect(canUserEdit(editor_teacher, edited_admin)).toBe(false);
		expect(canUserEdit(editor_teacher, edited_teacher)).toBe(true);
		expect(canUserEdit(editor_teacher, edited_member)).toBe(false);
		expect(canUserEdit(editor_teacher, edited_student)).toBe(false);
	});

	test('Teacher -> Teacher + Student', () => {
		let rel = UserRoleToUserAction.getInstance();
		rel.clear();
		initializePermissions({
			admin: [],
			teacher: ['EDIT_USER_TEACHER', 'EDIT_USER_STUDENT'],
			student: [],
			member: []
		});

		expect(canUserEdit(editor_teacher, edited_admin)).toBe(false);
		expect(canUserEdit(editor_teacher, edited_teacher)).toBe(true);
		expect(canUserEdit(editor_teacher, edited_member)).toBe(false);
		expect(canUserEdit(editor_teacher, edited_student)).toBe(true);
	});

	test('Student -> Teacher', () => {
		let rel = UserRoleToUserAction.getInstance();
		rel.clear();
		initializePermissions({
			admin: [],
			teacher: [],
			student: ['EDIT_USER_TEACHER'],
			member: []
		});

		expect(canUserEdit(editor_student, edited_admin)).toBe(false);
		expect(canUserEdit(editor_student, edited_teacher)).toBe(true);
		expect(canUserEdit(editor_student, edited_member)).toBe(false);
		expect(canUserEdit(editor_student, edited_student)).toBe(false);
	});

	test('Student -> Teacher + Student', () => {
		let rel = UserRoleToUserAction.getInstance();
		rel.clear();
		initializePermissions({
			admin: [],
			teacher: [],
			student: ['EDIT_USER_TEACHER', 'EDIT_USER_STUDENT'],
			member: []
		});

		expect(canUserEdit(editor_student, edited_admin)).toBe(false);
		expect(canUserEdit(editor_student, edited_teacher)).toBe(true);
		expect(canUserEdit(editor_student, edited_member)).toBe(false);
		expect(canUserEdit(editor_student, edited_student)).toBe(true);
	});

	test('Member -> Teacher', () => {
		let rel = UserRoleToUserAction.getInstance();
		rel.clear();
		initializePermissions({
			admin: [],
			teacher: [],
			student: [],
			member: ['EDIT_USER_TEACHER']
		});

		expect(canUserEdit(editor_member, edited_admin)).toBe(false);
		expect(canUserEdit(editor_member, edited_teacher)).toBe(true);
		expect(canUserEdit(editor_member, edited_member)).toBe(false);
		expect(canUserEdit(editor_member, edited_student)).toBe(false);
	});

	test('Member -> Teacher + Student', () => {
		let rel = UserRoleToUserAction.getInstance();
		rel.clear();
		initializePermissions({
			admin: [],
			teacher: [],
			student: [],
			member: ['EDIT_USER_TEACHER', 'EDIT_USER_STUDENT']
		});

		expect(canUserEdit(editor_member, edited_admin)).toBe(false);
		expect(canUserEdit(editor_member, edited_teacher)).toBe(true);
		expect(canUserEdit(editor_member, edited_member)).toBe(false);
		expect(canUserEdit(editor_member, edited_student)).toBe(true);
	});
});

describe('Can a user see a game?', () => {
	const admin = new User(un, firstName, lastName, { encrypted: 'a', iv: 'b' }, ['ADMIN'], [], []);
	const teacher = new User(un, firstName, lastName, { encrypted: 'a', iv: 'b' }, ['TEACHER'], [], []);
	const member = new User(un, firstName, lastName, { encrypted: 'a', iv: 'b' }, ['MEMBER'], [], []);
	const student = new User(un, firstName, lastName, { encrypted: 'a', iv: 'b' }, ['STUDENT'], [], []);

	test('Admin', () => {
		let rel = UserRoleToUserAction.getInstance();
		rel.clear();
		initializePermissions({
			admin: ['SEE_GAMES_ADMIN', 'SEE_GAMES_MEMBER'],
			teacher: [],
			student: [],
			member: []
		});

		expect(canUserSeeGame(admin, teacher, member)).toBe(true);
		expect(canUserSeeGame(admin, teacher, student)).toBe(false);
		expect(canUserSeeGame(admin, student, member)).toBe(true);
		expect(canUserSeeGame(admin, admin, member)).toBe(true);
	});

	test('Teacher', () => {
		let rel = UserRoleToUserAction.getInstance();
		rel.clear();
		initializePermissions({
			admin: [],
			teacher: ['SEE_GAMES_ADMIN', 'SEE_GAMES_STUDENT'],
			student: [],
			member: []
		});

		expect(canUserSeeGame(teacher, teacher, member)).toBe(false);
		expect(canUserSeeGame(teacher, teacher, student)).toBe(true);
		expect(canUserSeeGame(teacher, student, member)).toBe(true);
		expect(canUserSeeGame(teacher, admin, member)).toBe(true);
	});
});

describe('Can a user edit a game?', () => {
	const admin = new User(un, firstName, lastName, { encrypted: 'a', iv: 'b' }, ['ADMIN'], [], []);
	const teacher = new User(un, firstName, lastName, { encrypted: 'a', iv: 'b' }, ['TEACHER'], [], []);
	const member = new User(un, firstName, lastName, { encrypted: 'a', iv: 'b' }, ['MEMBER'], [], []);
	const student = new User(un, firstName, lastName, { encrypted: 'a', iv: 'b' }, ['STUDENT'], [], []);

	test('Admin', () => {
		let rel = UserRoleToUserAction.getInstance();
		rel.clear();
		initializePermissions({
			admin: ['EDIT_GAMES_ADMIN', 'EDIT_GAMES_MEMBER'],
			teacher: [],
			student: [],
			member: []
		});

		expect(canUserEditGame(admin, teacher, member)).toBe(true);
		expect(canUserEditGame(admin, teacher, student)).toBe(false);
		expect(canUserEditGame(admin, student, member)).toBe(true);
		expect(canUserEditGame(admin, admin, member)).toBe(true);
	});

	test('Teacher (1)', () => {
		let rel = UserRoleToUserAction.getInstance();
		rel.clear();
		initializePermissions({
			admin: [],
			teacher: ['EDIT_GAMES_ADMIN', 'EDIT_GAMES_STUDENT'],
			student: [],
			member: []
		});

		expect(canUserEditGame(teacher, teacher, member)).toBe(false);
		expect(canUserEditGame(teacher, teacher, student)).toBe(true);
		expect(canUserEditGame(teacher, student, member)).toBe(true);
		expect(canUserEditGame(teacher, admin, member)).toBe(true);
	});

	test('Teacher (2)', () => {
		let rel = UserRoleToUserAction.getInstance();
		rel.clear();
		initializePermissions({
			admin: [],
			teacher: ['EDIT_GAMES_ADMIN', 'EDIT_GAMES_TEACHER'],
			student: [],
			member: []
		});

		expect(canUserEditGame(teacher, teacher, member)).toBe(true);
		expect(canUserEditGame(teacher, teacher, student)).toBe(true);
		expect(canUserEditGame(teacher, student, member)).toBe(false);
		expect(canUserEditGame(teacher, admin, member)).toBe(true);
	});
});

describe('Can a user create a game?', () => {
	const admin = new User(un, firstName, lastName, { encrypted: 'a', iv: 'b' }, ['ADMIN'], [], []);
	const teacher = new User(un, firstName, lastName, { encrypted: 'a', iv: 'b' }, ['TEACHER'], [], []);
	const member = new User(un, firstName, lastName, { encrypted: 'a', iv: 'b' }, ['MEMBER'], [], []);
	const student = new User(un, firstName, lastName, { encrypted: 'a', iv: 'b' }, ['STUDENT'], [], []);

	test('Admin', () => {
		let rel = UserRoleToUserAction.getInstance();
		rel.clear();
		initializePermissions({
			admin: ['CREATE_GAMES_ADMIN', 'CREATE_GAMES_MEMBER'],
			teacher: [],
			student: [],
			member: []
		});

		expect(canUserCreateGame(admin, teacher, member)).toBe(true);
		expect(canUserCreateGame(admin, teacher, student)).toBe(false);
		expect(canUserCreateGame(admin, student, member)).toBe(true);
		expect(canUserCreateGame(admin, admin, member)).toBe(true);
	});

	test('Teacher (1)', () => {
		let rel = UserRoleToUserAction.getInstance();
		rel.clear();
		initializePermissions({
			admin: [],
			teacher: ['CREATE_GAMES_ADMIN', 'CREATE_GAMES_STUDENT'],
			student: [],
			member: []
		});

		expect(canUserCreateGame(teacher, teacher, member)).toBe(false);
		expect(canUserCreateGame(teacher, teacher, student)).toBe(true);
		expect(canUserCreateGame(teacher, student, member)).toBe(true);
		expect(canUserCreateGame(teacher, admin, member)).toBe(true);
	});

	test('Teacher (2)', () => {
		let rel = UserRoleToUserAction.getInstance();
		rel.clear();
		initializePermissions({
			admin: [],
			teacher: ['CREATE_GAMES_ADMIN', 'CREATE_GAMES_TEACHER'],
			student: [],
			member: []
		});

		expect(canUserCreateGame(teacher, teacher, member)).toBe(true);
		expect(canUserCreateGame(teacher, teacher, student)).toBe(true);
		expect(canUserCreateGame(teacher, student, member)).toBe(false);
		expect(canUserCreateGame(teacher, admin, member)).toBe(true);
	});
});

describe('Can a user challenge?', () => {
	const admin = new User(un, firstName, lastName, { encrypted: 'a', iv: 'b' }, ['ADMIN'], [], []);
	const teacher = new User(un, firstName, lastName, { encrypted: 'a', iv: 'b' }, ['TEACHER'], [], []);
	const member = new User(un, firstName, lastName, { encrypted: 'a', iv: 'b' }, ['MEMBER'], [], []);
	const student = new User(un, firstName, lastName, { encrypted: 'a', iv: 'b' }, ['STUDENT'], [], []);

	test('Admin', () => {
		let rel = UserRoleToUserAction.getInstance();
		rel.clear();
		initializePermissions({
			admin: ['CHALLENGE_USER_ADMIN', 'CHALLENGE_USER_STUDENT'],
			teacher: [],
			student: [],
			member: []
		});

		expect(canUserSendChallenge(admin, admin)).toBe(true);
		expect(canUserSendChallenge(admin, teacher)).toBe(false);
		expect(canUserSendChallenge(admin, student)).toBe(true);
		expect(canUserSendChallenge(admin, member)).toBe(false);
	});

	test('Teacher (1)', () => {
		let rel = UserRoleToUserAction.getInstance();
		rel.clear();
		initializePermissions({
			admin: [],
			teacher: ['CHALLENGE_USER_ADMIN', 'CHALLENGE_USER_STUDENT'],
			student: [],
			member: []
		});

		expect(canUserSendChallenge(teacher, admin)).toBe(true);
		expect(canUserSendChallenge(teacher, teacher)).toBe(false);
		expect(canUserSendChallenge(teacher, student)).toBe(true);
		expect(canUserSendChallenge(teacher, member)).toBe(false);
	});

	test('Teacher (2)', () => {
		let rel = UserRoleToUserAction.getInstance();
		rel.clear();
		initializePermissions({
			admin: [],
			teacher: ['CHALLENGE_USER_ADMIN', 'CHALLENGE_USER_STUDENT', 'CHALLENGE_USER_MEMBER'],
			student: [],
			member: []
		});

		expect(canUserSendChallenge(teacher, admin)).toBe(true);
		expect(canUserSendChallenge(teacher, teacher)).toBe(false);
		expect(canUserSendChallenge(teacher, student)).toBe(true);
		expect(canUserSendChallenge(teacher, member)).toBe(true);
	});
});

describe('Can a user see a graph?', () => {
	const admin = new User(un, firstName, lastName, { encrypted: 'a', iv: 'b' }, ['ADMIN'], [], []);
	const teacher = new User(un, firstName, lastName, { encrypted: 'a', iv: 'b' }, ['TEACHER'], [], []);
	const member = new User(un, firstName, lastName, { encrypted: 'a', iv: 'b' }, ['MEMBER'], [], []);
	const student = new User(un, firstName, lastName, { encrypted: 'a', iv: 'b' }, ['STUDENT'], [], []);

	test('Admin', () => {
		let rel = UserRoleToUserAction.getInstance();
		rel.clear();
		initializePermissions({
			admin: ['SEE_GRAPHS_ADMIN', 'SEE_GRAPHS_STUDENT'],
			teacher: [],
			student: [],
			member: []
		});

		expect(canUserSeeGraph(admin, admin)).toBe(true);
		expect(canUserSeeGraph(admin, teacher)).toBe(false);
		expect(canUserSeeGraph(admin, student)).toBe(true);
		expect(canUserSeeGraph(admin, member)).toBe(false);
	});

	test('Teacher (1)', () => {
		let rel = UserRoleToUserAction.getInstance();
		rel.clear();
		initializePermissions({
			admin: [],
			teacher: ['SEE_GRAPHS_ADMIN', 'SEE_GRAPHS_STUDENT'],
			student: [],
			member: []
		});

		expect(canUserSeeGraph(teacher, admin)).toBe(true);
		expect(canUserSeeGraph(teacher, teacher)).toBe(false);
		expect(canUserSeeGraph(teacher, student)).toBe(true);
		expect(canUserSeeGraph(teacher, member)).toBe(false);
	});

	test('Teacher (2)', () => {
		let rel = UserRoleToUserAction.getInstance();
		rel.clear();
		initializePermissions({
			admin: [],
			teacher: ['SEE_GRAPHS_ADMIN', 'SEE_GRAPHS_STUDENT', 'SEE_GRAPHS_MEMBER'],
			student: [],
			member: []
		});

		expect(canUserSeeGraph(teacher, admin)).toBe(true);
		expect(canUserSeeGraph(teacher, teacher)).toBe(false);
		expect(canUserSeeGraph(teacher, student)).toBe(true);
		expect(canUserSeeGraph(teacher, member)).toBe(true);
	});
});
