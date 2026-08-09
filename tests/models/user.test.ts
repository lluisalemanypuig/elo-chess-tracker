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

import { TimeControlRating } from '@common/models/time-control-rating';
import { toUserGivenName, User } from '@common/models/user';
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
import { initializePermissions, UserRoleToUserAction } from '@app/server/managers/user-role-action';
import { EloRating } from '@common/models/rating-framework/Elo/rating';
import { toPlayerPrivateId } from '@common/models/player';
import { toTimeControlId } from '@common/models/time-control';
import { toDateMajor } from '@common/utils/time';

const Classical = toTimeControlId('Classical');
const Rapid = toTimeControlId('Rapid');
const Blitz = toTimeControlId('Blitz');

describe('Elo', () => {
	//const bullet = new EloRating(1400, 0, 0, 0, 0, 40, false);
	const blitz = new EloRating(1500, 0, 0, 0, 0, 40, false);
	//const rapid = new EloRating(1600, 0, 0, 0, 0, 40, false);
	const classical = new EloRating(1700, 0, 0, 0, 0, 40, false);

	test('basic gets', () => {
		const u = new User(
			toPlayerPrivateId('user.name'),
			toUserGivenName('First'),
			toUserGivenName('Last'),
			{ encrypted: 'asdf', iv: 'ivrandom' },
			[ADMIN, TEACHER],
			[
				{ timeControl: Blitz, records: [{ record: toDateMajor('2024-12-24'), amount: 1 }] },
				{ timeControl: Rapid, records: [{ record: toDateMajor('2024-12-25'), amount: 1 }] }
			],
			[new TimeControlRating(Blitz, blitz), new TimeControlRating(Classical, classical)]
		);

		expect(u.is(ADMIN)).toBe(true);
		expect(u.is(TEACHER)).toBe(true);
		expect(u.is(STUDENT)).toBe(false);
		expect(u.is(MEMBER)).toBe(false);

		expect(u.roles).toEqual([ADMIN, TEACHER]);
		expect(u.roles).not.toEqual([TEACHER, ADMIN]);

		expect(u.firstName).toEqual('First');
		expect(u.lastName).toEqual('Last');
		expect(u.getFullName()).toEqual('First Last');
		expect(u.getGames(Blitz)).toEqual([{ record: toDateMajor('2024-12-24'), amount: 1 }]);
		expect(u.getGames(Rapid)).toEqual([{ record: toDateMajor('2024-12-25'), amount: 1 }]);
	});

	test('basic sets', () => {
		let u = new User(
			toPlayerPrivateId('user.name'),
			toUserGivenName('First'),
			toUserGivenName('Last'),
			{ encrypted: 'asdf', iv: 'ivrandom' },
			[ADMIN, TEACHER],
			[
				{ timeControl: Blitz, records: [{ record: toDateMajor('2024-12-24'), amount: 1 }] },
				{ timeControl: Rapid, records: [{ record: toDateMajor('2024-12-25'), amount: 1 }] }
			],
			[new TimeControlRating(Blitz, blitz), new TimeControlRating(Classical, classical)]
		);

		expect(u.is(ADMIN)).toBe(true);
		expect(u.is(TEACHER)).toBe(true);
		expect(u.is(STUDENT)).toBe(false);
		expect(u.is(MEMBER)).toBe(false);

		expect(u.roles).toEqual([ADMIN, TEACHER]);
		expect(u.roles).not.toEqual([TEACHER, ADMIN]);

		u.firstName = toUserGivenName('Perico');
		u.lastName = toUserGivenName('Palotes');
		expect(u.firstName).toEqual('Perico');
		expect(u.lastName).toEqual('Palotes');
		expect(u.getFullName()).toEqual('Perico Palotes');

		u.password = { encrypted: 'a', iv: 'b' };
		expect(u.password).toEqual({ encrypted: 'a', iv: 'b' });
	});

	test('Adding games', () => {
		let u = new User(
			toPlayerPrivateId('user.name'),
			toUserGivenName('First'),
			toUserGivenName('Last'),
			{ encrypted: 'asdf', iv: 'ivrandom' },
			[ADMIN, TEACHER],
			[
				{ timeControl: Blitz, records: [{ record: toDateMajor('2024-12-24'), amount: 1 }] },
				{ timeControl: Rapid, records: [{ record: toDateMajor('2024-12-25'), amount: 1 }] }
			],
			[new TimeControlRating(Blitz, blitz), new TimeControlRating(Classical, classical)]
		);

		// blitz

		expect(u.getGames(Blitz)).toEqual([{ record: '2024-12-24', amount: 1 }]);

		u.addGame(Blitz, toDateMajor('2024-12-31'));
		expect(u.getGames(Blitz)).toEqual([
			{ record: toDateMajor('2024-12-24'), amount: 1 },
			{ record: toDateMajor('2024-12-31'), amount: 1 }
		]);

		u.addGame(Blitz, toDateMajor('2024-12-01'));
		expect(u.getGames(Blitz)).toEqual([
			{ record: toDateMajor('2024-12-01'), amount: 1 },
			{ record: toDateMajor('2024-12-24'), amount: 1 },
			{ record: toDateMajor('2024-12-31'), amount: 1 }
		]);

		u.addGame(Blitz, toDateMajor('2024-12-31'));
		expect(u.getGames(Blitz)).toEqual([
			{ record: toDateMajor('2024-12-01'), amount: 1 },
			{ record: toDateMajor('2024-12-24'), amount: 1 },
			{ record: toDateMajor('2024-12-31'), amount: 2 }
		]);

		u.addGame(Blitz, toDateMajor('2024-12-31'));
		expect(u.getGames(Blitz)).toEqual([
			{ record: toDateMajor('2024-12-01'), amount: 1 },
			{ record: toDateMajor('2024-12-24'), amount: 1 },
			{ record: toDateMajor('2024-12-31'), amount: 3 }
		]);

		u.addGame(Blitz, toDateMajor('2024-12-01'));
		expect(u.getGames(Blitz)).toEqual([
			{ record: toDateMajor('2024-12-01'), amount: 2 },
			{ record: toDateMajor('2024-12-24'), amount: 1 },
			{ record: toDateMajor('2024-12-31'), amount: 3 }
		]);

		// rapid

		expect(u.getGames(Rapid)).toEqual([{ record: '2024-12-25', amount: 1 }]);

		u.addGame(Rapid, toDateMajor('2024-12-28'));
		expect(u.getGames(Rapid)).toEqual([
			{ record: toDateMajor('2024-12-25'), amount: 1 },
			{ record: toDateMajor('2024-12-28'), amount: 1 }
		]);

		u.addGame(Rapid, toDateMajor('2019-12-31'));
		expect(u.getGames(Rapid)).toEqual([
			{ record: toDateMajor('2019-12-31'), amount: 1 },
			{ record: toDateMajor('2024-12-25'), amount: 1 },
			{ record: toDateMajor('2024-12-28'), amount: 1 }
		]);

		u.addGame(Rapid, toDateMajor('2019-12-31'));
		expect(u.getGames(Rapid)).toEqual([
			{ record: toDateMajor('2019-12-31'), amount: 2 },
			{ record: toDateMajor('2024-12-25'), amount: 1 },
			{ record: toDateMajor('2024-12-28'), amount: 1 }
		]);

		u.addGame(Rapid, toDateMajor('2024-12-28'));
		expect(u.getGames(Rapid)).toEqual([
			{ record: toDateMajor('2019-12-31'), amount: 2 },
			{ record: toDateMajor('2024-12-25'), amount: 1 },
			{ record: toDateMajor('2024-12-28'), amount: 2 }
		]);

		u.addGame(Rapid, toDateMajor('2024-12-28'));
		expect(u.getGames(Rapid)).toEqual([
			{ record: toDateMajor('2019-12-31'), amount: 2 },
			{ record: toDateMajor('2024-12-25'), amount: 1 },
			{ record: toDateMajor('2024-12-28'), amount: 3 }
		]);
	});
});

const u = toPlayerPrivateId('u');

describe('Actions allowed per user (single role)', () => {
	test('Admin', () => {
		UserRoleToUserAction.getInstance().clear();
		initializePermissions({
			admin: [USER_EDIT_TEACHER],
			teacher: [],
			student: [],
			member: []
		});

		const admin = new User(
			u,
			toUserGivenName('F'),
			toUserGivenName('L'),
			{ encrypted: 'a', iv: 'i' },
			[ADMIN],
			[],
			[]
		);

		const actions = admin.getActions();
		expect(actions.length).toBe(2);
		expect(actions.includes(USER_EDIT)).toBe(true);
		expect(actions.includes(USER_EDIT_TEACHER)).toBe(true);

		expect(admin.canDo(CREATE_USER)).toBe(false);
		expect(admin.canDo(GAMES_CREATE)).toBe(false);
		expect(admin.canDo(USER_EDIT)).toBe(true);
		expect(admin.canDo(USER_EDIT_ADMIN)).toBe(false);
		expect(admin.canDo(USER_EDIT_TEACHER)).toBe(true);
		expect(admin.canDo(USER_EDIT_MEMBER)).toBe(false);
		expect(admin.canDo(USER_EDIT_STUDENT)).toBe(false);
		expect(admin.canDo(GAMES_EDIT)).toBe(false);
		expect(admin.canDo(GAMES_EDIT_ADMIN)).toBe(false);
		expect(admin.canDo(GAMES_EDIT_TEACHER)).toBe(false);
		expect(admin.canDo(GAMES_EDIT_MEMBER)).toBe(false);
		expect(admin.canDo(GAMES_EDIT_STUDENT)).toBe(false);
		expect(admin.canDo(USER_ROLE_ASSIGN)).toBe(false);
		expect(admin.canDo(USER_ROLE_ASSIGN_ADMIN)).toBe(false);
		expect(admin.canDo(USER_ROLE_ASSIGN_TEACHER)).toBe(false);
		expect(admin.canDo(USER_ROLE_ASSIGN_MEMBER)).toBe(false);
		expect(admin.canDo(USER_ROLE_ASSIGN_STUDENT)).toBe(false);
		expect(admin.canDo(GAMES_SEE)).toBe(false);
		expect(admin.canDo(GAMES_SEE_ADMIN)).toBe(false);
		expect(admin.canDo(GAMES_SEE_TEACHER)).toBe(false);
		expect(admin.canDo(GAMES_SEE_MEMBER)).toBe(false);
		expect(admin.canDo(GAMES_SEE_STUDENT)).toBe(false);
		expect(admin.canDo(USER_CHALLENGE)).toBe(false);
		expect(admin.canDo(USER_CHALLENGE_ADMIN)).toBe(false);
		expect(admin.canDo(USER_CHALLENGE_MEMBER)).toBe(false);
		expect(admin.canDo(USER_CHALLENGE_TEACHER)).toBe(false);
		expect(admin.canDo(USER_CHALLENGE_STUDENT)).toBe(false);
	});

	test('Teacher', () => {
		UserRoleToUserAction.getInstance().clear();
		initializePermissions({
			admin: [],
			teacher: [USER_ROLE_ASSIGN_MEMBER],
			student: [],
			member: []
		});

		const teacher = new User(
			u,
			toUserGivenName('F'),
			toUserGivenName('L'),
			{ encrypted: 'a', iv: 'i' },
			[TEACHER],
			[],
			[]
		);

		const actions = teacher.getActions();
		expect(actions.length).toBe(2);
		expect(actions.includes(USER_ROLE_ASSIGN_MEMBER)).toBe(true);
		expect(actions.includes(USER_ROLE_ASSIGN)).toBe(true);

		expect(teacher.canDo(CREATE_USER)).toBe(false);
		expect(teacher.canDo(GAMES_CREATE)).toBe(false);
		expect(teacher.canDo(USER_EDIT)).toBe(false);
		expect(teacher.canDo(USER_EDIT_ADMIN)).toBe(false);
		expect(teacher.canDo(USER_EDIT_TEACHER)).toBe(false);
		expect(teacher.canDo(USER_EDIT_MEMBER)).toBe(false);
		expect(teacher.canDo(USER_EDIT_STUDENT)).toBe(false);
		expect(teacher.canDo(GAMES_EDIT)).toBe(false);
		expect(teacher.canDo(GAMES_EDIT_ADMIN)).toBe(false);
		expect(teacher.canDo(GAMES_EDIT_TEACHER)).toBe(false);
		expect(teacher.canDo(GAMES_EDIT_MEMBER)).toBe(false);
		expect(teacher.canDo(GAMES_EDIT_STUDENT)).toBe(false);
		expect(teacher.canDo(USER_ROLE_ASSIGN)).toBe(true);
		expect(teacher.canDo(USER_ROLE_ASSIGN_ADMIN)).toBe(false);
		expect(teacher.canDo(USER_ROLE_ASSIGN_TEACHER)).toBe(false);
		expect(teacher.canDo(USER_ROLE_ASSIGN_MEMBER)).toBe(true);
		expect(teacher.canDo(USER_ROLE_ASSIGN_STUDENT)).toBe(false);
		expect(teacher.canDo(GAMES_SEE)).toBe(false);
		expect(teacher.canDo(GAMES_SEE_ADMIN)).toBe(false);
		expect(teacher.canDo(GAMES_SEE_TEACHER)).toBe(false);
		expect(teacher.canDo(GAMES_SEE_MEMBER)).toBe(false);
		expect(teacher.canDo(GAMES_SEE_STUDENT)).toBe(false);
		expect(teacher.canDo(USER_CHALLENGE)).toBe(false);
		expect(teacher.canDo(USER_CHALLENGE_ADMIN)).toBe(false);
		expect(teacher.canDo(USER_CHALLENGE_MEMBER)).toBe(false);
		expect(teacher.canDo(USER_CHALLENGE_TEACHER)).toBe(false);
		expect(teacher.canDo(USER_CHALLENGE_STUDENT)).toBe(false);
	});

	test('Student', () => {
		UserRoleToUserAction.getInstance().clear();
		initializePermissions({
			admin: [],
			teacher: [],
			student: [CREATE_USER, GAMES_CREATE],
			member: []
		});

		const student = new User(
			u,
			toUserGivenName('F'),
			toUserGivenName('L'),
			{ encrypted: 'a', iv: 'i' },
			[STUDENT],
			[],
			[]
		);

		const actions = student.getActions();
		expect(actions.length).toBe(2);
		expect(actions.includes(GAMES_CREATE)).toBe(true);
		expect(actions.includes(CREATE_USER)).toBe(true);

		expect(student.canDo(CREATE_USER)).toBe(true);
		expect(student.canDo(GAMES_CREATE)).toBe(true);
		expect(student.canDo(USER_EDIT)).toBe(false);
		expect(student.canDo(USER_EDIT_ADMIN)).toBe(false);
		expect(student.canDo(USER_EDIT_TEACHER)).toBe(false);
		expect(student.canDo(USER_EDIT_MEMBER)).toBe(false);
		expect(student.canDo(USER_EDIT_STUDENT)).toBe(false);
		expect(student.canDo(GAMES_EDIT)).toBe(false);
		expect(student.canDo(GAMES_EDIT_ADMIN)).toBe(false);
		expect(student.canDo(GAMES_EDIT_TEACHER)).toBe(false);
		expect(student.canDo(GAMES_EDIT_MEMBER)).toBe(false);
		expect(student.canDo(GAMES_EDIT_STUDENT)).toBe(false);
		expect(student.canDo(USER_ROLE_ASSIGN)).toBe(false);
		expect(student.canDo(USER_ROLE_ASSIGN_ADMIN)).toBe(false);
		expect(student.canDo(USER_ROLE_ASSIGN_TEACHER)).toBe(false);
		expect(student.canDo(USER_ROLE_ASSIGN_MEMBER)).toBe(false);
		expect(student.canDo(USER_ROLE_ASSIGN_STUDENT)).toBe(false);
		expect(student.canDo(GAMES_SEE)).toBe(false);
		expect(student.canDo(GAMES_SEE_ADMIN)).toBe(false);
		expect(student.canDo(GAMES_SEE_TEACHER)).toBe(false);
		expect(student.canDo(GAMES_SEE_MEMBER)).toBe(false);
		expect(student.canDo(GAMES_SEE_STUDENT)).toBe(false);
		expect(student.canDo(USER_CHALLENGE)).toBe(false);
		expect(student.canDo(USER_CHALLENGE_ADMIN)).toBe(false);
		expect(student.canDo(USER_CHALLENGE_MEMBER)).toBe(false);
		expect(student.canDo(USER_CHALLENGE_TEACHER)).toBe(false);
		expect(student.canDo(USER_CHALLENGE_STUDENT)).toBe(false);
	});

	test('Member', () => {
		UserRoleToUserAction.getInstance().clear();
		initializePermissions({
			admin: [],
			teacher: [],
			student: [],
			member: [USER_CHALLENGE_ADMIN, USER_CHALLENGE_STUDENT]
		});

		const member = new User(
			u,
			toUserGivenName('F'),
			toUserGivenName('L'),
			{ encrypted: 'a', iv: 'i' },
			[MEMBER],
			[],
			[]
		);

		const actions = member.getActions();
		expect(actions.length).toBe(3);
		expect(actions.includes(USER_CHALLENGE_STUDENT)).toBe(true);
		expect(actions.includes(USER_CHALLENGE)).toBe(true);
		expect(actions.includes(USER_CHALLENGE_ADMIN)).toBe(true);

		expect(member.canDo(CREATE_USER)).toBe(false);
		expect(member.canDo(GAMES_CREATE)).toBe(false);
		expect(member.canDo(USER_EDIT)).toBe(false);
		expect(member.canDo(USER_EDIT_ADMIN)).toBe(false);
		expect(member.canDo(USER_EDIT_TEACHER)).toBe(false);
		expect(member.canDo(USER_EDIT_MEMBER)).toBe(false);
		expect(member.canDo(USER_EDIT_STUDENT)).toBe(false);
		expect(member.canDo(GAMES_EDIT)).toBe(false);
		expect(member.canDo(GAMES_EDIT_ADMIN)).toBe(false);
		expect(member.canDo(GAMES_EDIT_TEACHER)).toBe(false);
		expect(member.canDo(GAMES_EDIT_MEMBER)).toBe(false);
		expect(member.canDo(GAMES_EDIT_STUDENT)).toBe(false);
		expect(member.canDo(USER_ROLE_ASSIGN)).toBe(false);
		expect(member.canDo(USER_ROLE_ASSIGN_ADMIN)).toBe(false);
		expect(member.canDo(USER_ROLE_ASSIGN_TEACHER)).toBe(false);
		expect(member.canDo(USER_ROLE_ASSIGN_MEMBER)).toBe(false);
		expect(member.canDo(USER_ROLE_ASSIGN_STUDENT)).toBe(false);
		expect(member.canDo(GAMES_SEE)).toBe(false);
		expect(member.canDo(GAMES_SEE_ADMIN)).toBe(false);
		expect(member.canDo(GAMES_SEE_TEACHER)).toBe(false);
		expect(member.canDo(GAMES_SEE_MEMBER)).toBe(false);
		expect(member.canDo(GAMES_SEE_STUDENT)).toBe(false);
		expect(member.canDo(USER_CHALLENGE)).toBe(true);
		expect(member.canDo(USER_CHALLENGE_ADMIN)).toBe(true);
		expect(member.canDo(USER_CHALLENGE_MEMBER)).toBe(false);
		expect(member.canDo(USER_CHALLENGE_TEACHER)).toBe(false);
		expect(member.canDo(USER_CHALLENGE_STUDENT)).toBe(true);
	});
});

describe('Actions allowed per user (multiple roles)', () => {
	test('Admin + Teacher', () => {
		UserRoleToUserAction.getInstance().clear();
		initializePermissions({
			admin: [USER_EDIT_TEACHER],
			teacher: [],
			student: [USER_CHALLENGE_STUDENT],
			member: []
		});

		const admin_teacher = new User(
			u,
			toUserGivenName('F'),
			toUserGivenName('L'),
			{ encrypted: 'a', iv: 'i' },
			[ADMIN, TEACHER],
			[],
			[]
		);

		const actions = admin_teacher.getActions();
		expect(actions.length).toBe(2);
		expect(actions.includes(USER_EDIT)).toBe(true);
		expect(actions.includes(USER_EDIT_TEACHER)).toBe(true);
		expect(actions.includes(USER_CHALLENGE)).toBe(false);
		expect(actions.includes(USER_CHALLENGE_STUDENT)).toBe(false);

		expect(admin_teacher.canDo(CREATE_USER)).toBe(false);
		expect(admin_teacher.canDo(GAMES_CREATE)).toBe(false);
		expect(admin_teacher.canDo(USER_EDIT)).toBe(true);
		expect(admin_teacher.canDo(USER_EDIT_ADMIN)).toBe(false);
		expect(admin_teacher.canDo(USER_EDIT_TEACHER)).toBe(true);
		expect(admin_teacher.canDo(USER_EDIT_MEMBER)).toBe(false);
		expect(admin_teacher.canDo(USER_EDIT_STUDENT)).toBe(false);
		expect(admin_teacher.canDo(GAMES_EDIT)).toBe(false);
		expect(admin_teacher.canDo(GAMES_EDIT_ADMIN)).toBe(false);
		expect(admin_teacher.canDo(GAMES_EDIT_TEACHER)).toBe(false);
		expect(admin_teacher.canDo(GAMES_EDIT_MEMBER)).toBe(false);
		expect(admin_teacher.canDo(GAMES_EDIT_STUDENT)).toBe(false);
		expect(admin_teacher.canDo(USER_ROLE_ASSIGN)).toBe(false);
		expect(admin_teacher.canDo(USER_ROLE_ASSIGN_ADMIN)).toBe(false);
		expect(admin_teacher.canDo(USER_ROLE_ASSIGN_TEACHER)).toBe(false);
		expect(admin_teacher.canDo(USER_ROLE_ASSIGN_MEMBER)).toBe(false);
		expect(admin_teacher.canDo(USER_ROLE_ASSIGN_STUDENT)).toBe(false);
		expect(admin_teacher.canDo(GAMES_SEE)).toBe(false);
		expect(admin_teacher.canDo(GAMES_SEE_ADMIN)).toBe(false);
		expect(admin_teacher.canDo(GAMES_SEE_TEACHER)).toBe(false);
		expect(admin_teacher.canDo(GAMES_SEE_MEMBER)).toBe(false);
		expect(admin_teacher.canDo(GAMES_SEE_STUDENT)).toBe(false);
		expect(admin_teacher.canDo(USER_CHALLENGE)).toBe(false);
		expect(admin_teacher.canDo(USER_CHALLENGE_ADMIN)).toBe(false);
		expect(admin_teacher.canDo(USER_CHALLENGE_MEMBER)).toBe(false);
		expect(admin_teacher.canDo(USER_CHALLENGE_TEACHER)).toBe(false);
		expect(admin_teacher.canDo(USER_CHALLENGE_STUDENT)).toBe(false);
	});

	test('Admin + Student', () => {
		UserRoleToUserAction.getInstance().clear();
		initializePermissions({
			admin: [USER_EDIT_TEACHER],
			teacher: [],
			student: [USER_CHALLENGE_STUDENT],
			member: []
		});

		const admin_student = new User(
			u,
			toUserGivenName('F'),
			toUserGivenName('L'),
			{ encrypted: 'a', iv: 'i' },
			[ADMIN, STUDENT],
			[],
			[]
		);

		const actions = admin_student.getActions();
		expect(actions.length).toBe(4);
		expect(actions.includes(USER_EDIT)).toBe(true);
		expect(actions.includes(USER_EDIT_TEACHER)).toBe(true);
		expect(actions.includes(USER_CHALLENGE)).toBe(true);
		expect(actions.includes(USER_CHALLENGE_STUDENT)).toBe(true);

		expect(admin_student.canDo(CREATE_USER)).toBe(false);
		expect(admin_student.canDo(GAMES_CREATE)).toBe(false);
		expect(admin_student.canDo(USER_EDIT)).toBe(true);
		expect(admin_student.canDo(USER_EDIT_ADMIN)).toBe(false);
		expect(admin_student.canDo(USER_EDIT_TEACHER)).toBe(true);
		expect(admin_student.canDo(USER_EDIT_MEMBER)).toBe(false);
		expect(admin_student.canDo(USER_EDIT_STUDENT)).toBe(false);
		expect(admin_student.canDo(GAMES_EDIT)).toBe(false);
		expect(admin_student.canDo(GAMES_EDIT_ADMIN)).toBe(false);
		expect(admin_student.canDo(GAMES_EDIT_TEACHER)).toBe(false);
		expect(admin_student.canDo(GAMES_EDIT_MEMBER)).toBe(false);
		expect(admin_student.canDo(GAMES_EDIT_STUDENT)).toBe(false);
		expect(admin_student.canDo(USER_ROLE_ASSIGN)).toBe(false);
		expect(admin_student.canDo(USER_ROLE_ASSIGN_ADMIN)).toBe(false);
		expect(admin_student.canDo(USER_ROLE_ASSIGN_TEACHER)).toBe(false);
		expect(admin_student.canDo(USER_ROLE_ASSIGN_MEMBER)).toBe(false);
		expect(admin_student.canDo(USER_ROLE_ASSIGN_STUDENT)).toBe(false);
		expect(admin_student.canDo(GAMES_SEE)).toBe(false);
		expect(admin_student.canDo(GAMES_SEE_ADMIN)).toBe(false);
		expect(admin_student.canDo(GAMES_SEE_TEACHER)).toBe(false);
		expect(admin_student.canDo(GAMES_SEE_MEMBER)).toBe(false);
		expect(admin_student.canDo(GAMES_SEE_STUDENT)).toBe(false);
		expect(admin_student.canDo(USER_CHALLENGE)).toBe(true);
		expect(admin_student.canDo(USER_CHALLENGE_ADMIN)).toBe(false);
		expect(admin_student.canDo(USER_CHALLENGE_MEMBER)).toBe(false);
		expect(admin_student.canDo(USER_CHALLENGE_TEACHER)).toBe(false);
		expect(admin_student.canDo(USER_CHALLENGE_STUDENT)).toBe(true);
	});
});
