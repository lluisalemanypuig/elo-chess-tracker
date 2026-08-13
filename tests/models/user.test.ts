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
import { ADMIN, MEMBER, STUDENT, TEACHER } from '@common/models/user-role';
import { initializePermissions, UserRoleToUserAction } from '@server/managers/user-role-action';
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
			admin: ['EDIT_USER_TEACHER'],
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
		expect(actions.includes('EDIT_USER')).toBe(true);
		expect(actions.includes('EDIT_USER_TEACHER')).toBe(true);

		expect(admin.canDo('CREATE_USER')).toBe(false);
		expect(admin.canDo('CREATE_GAMES')).toBe(false);
		expect(admin.canDo('EDIT_USER')).toBe(true);
		expect(admin.canDo('EDIT_USER_ADMIN')).toBe(false);
		expect(admin.canDo('EDIT_USER_TEACHER')).toBe(true);
		expect(admin.canDo('EDIT_USER_MEMBER')).toBe(false);
		expect(admin.canDo('EDIT_USER_STUDENT')).toBe(false);
		expect(admin.canDo('EDIT_GAMES')).toBe(false);
		expect(admin.canDo('EDIT_GAMES_ADMIN')).toBe(false);
		expect(admin.canDo('EDIT_GAMES_TEACHER')).toBe(false);
		expect(admin.canDo('EDIT_GAMES_MEMBER')).toBe(false);
		expect(admin.canDo('EDIT_GAMES_STUDENT')).toBe(false);
		expect(admin.canDo('ASSIGN_ROLE')).toBe(false);
		expect(admin.canDo('ASSIGN_ROLE_ADMIN')).toBe(false);
		expect(admin.canDo('ASSIGN_ROLE_TEACHER')).toBe(false);
		expect(admin.canDo('ASSIGN_ROLE_MEMBER')).toBe(false);
		expect(admin.canDo('ASSIGN_ROLE_STUDENT')).toBe(false);
		expect(admin.canDo('SEE_GAMES')).toBe(false);
		expect(admin.canDo('SEE_GAMES_ADMIN')).toBe(false);
		expect(admin.canDo('SEE_GAMES_TEACHER')).toBe(false);
		expect(admin.canDo('SEE_GAMES_MEMBER')).toBe(false);
		expect(admin.canDo('SEE_GAMES_STUDENT')).toBe(false);
		expect(admin.canDo('CHALLENGE_USER')).toBe(false);
		expect(admin.canDo('CHALLENGE_USER_ADMIN')).toBe(false);
		expect(admin.canDo('CHALLENGE_USER_MEMBER')).toBe(false);
		expect(admin.canDo('CHALLENGE_USER_TEACHER')).toBe(false);
		expect(admin.canDo('CHALLENGE_USER_STUDENT')).toBe(false);
	});

	test('Teacher', () => {
		UserRoleToUserAction.getInstance().clear();
		initializePermissions({
			admin: [],
			teacher: ['ASSIGN_ROLE_MEMBER'],
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
		expect(actions.includes('ASSIGN_ROLE_MEMBER')).toBe(true);
		expect(actions.includes('ASSIGN_ROLE')).toBe(true);

		expect(teacher.canDo('CREATE_USER')).toBe(false);
		expect(teacher.canDo('CREATE_GAMES')).toBe(false);
		expect(teacher.canDo('EDIT_USER')).toBe(false);
		expect(teacher.canDo('EDIT_USER_ADMIN')).toBe(false);
		expect(teacher.canDo('EDIT_USER_TEACHER')).toBe(false);
		expect(teacher.canDo('EDIT_USER_MEMBER')).toBe(false);
		expect(teacher.canDo('EDIT_USER_STUDENT')).toBe(false);
		expect(teacher.canDo('EDIT_GAMES')).toBe(false);
		expect(teacher.canDo('EDIT_GAMES_ADMIN')).toBe(false);
		expect(teacher.canDo('EDIT_GAMES_TEACHER')).toBe(false);
		expect(teacher.canDo('EDIT_GAMES_MEMBER')).toBe(false);
		expect(teacher.canDo('EDIT_GAMES_STUDENT')).toBe(false);
		expect(teacher.canDo('ASSIGN_ROLE')).toBe(true);
		expect(teacher.canDo('ASSIGN_ROLE_ADMIN')).toBe(false);
		expect(teacher.canDo('ASSIGN_ROLE_TEACHER')).toBe(false);
		expect(teacher.canDo('ASSIGN_ROLE_MEMBER')).toBe(true);
		expect(teacher.canDo('ASSIGN_ROLE_STUDENT')).toBe(false);
		expect(teacher.canDo('SEE_GAMES')).toBe(false);
		expect(teacher.canDo('SEE_GAMES_ADMIN')).toBe(false);
		expect(teacher.canDo('SEE_GAMES_TEACHER')).toBe(false);
		expect(teacher.canDo('SEE_GAMES_MEMBER')).toBe(false);
		expect(teacher.canDo('SEE_GAMES_STUDENT')).toBe(false);
		expect(teacher.canDo('CHALLENGE_USER')).toBe(false);
		expect(teacher.canDo('CHALLENGE_USER_ADMIN')).toBe(false);
		expect(teacher.canDo('CHALLENGE_USER_MEMBER')).toBe(false);
		expect(teacher.canDo('CHALLENGE_USER_TEACHER')).toBe(false);
		expect(teacher.canDo('CHALLENGE_USER_STUDENT')).toBe(false);
	});

	test('Student', () => {
		UserRoleToUserAction.getInstance().clear();
		initializePermissions({
			admin: [],
			teacher: [],
			student: ['CREATE_USER', 'CREATE_GAMES'],
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
		expect(actions.includes('CREATE_GAMES')).toBe(true);
		expect(actions.includes('CREATE_USER')).toBe(true);

		expect(student.canDo('CREATE_USER')).toBe(true);
		expect(student.canDo('CREATE_GAMES')).toBe(true);
		expect(student.canDo('EDIT_USER')).toBe(false);
		expect(student.canDo('EDIT_USER_ADMIN')).toBe(false);
		expect(student.canDo('EDIT_USER_TEACHER')).toBe(false);
		expect(student.canDo('EDIT_USER_MEMBER')).toBe(false);
		expect(student.canDo('EDIT_USER_STUDENT')).toBe(false);
		expect(student.canDo('EDIT_GAMES')).toBe(false);
		expect(student.canDo('EDIT_GAMES_ADMIN')).toBe(false);
		expect(student.canDo('EDIT_GAMES_TEACHER')).toBe(false);
		expect(student.canDo('EDIT_GAMES_MEMBER')).toBe(false);
		expect(student.canDo('EDIT_GAMES_STUDENT')).toBe(false);
		expect(student.canDo('ASSIGN_ROLE')).toBe(false);
		expect(student.canDo('ASSIGN_ROLE_ADMIN')).toBe(false);
		expect(student.canDo('ASSIGN_ROLE_TEACHER')).toBe(false);
		expect(student.canDo('ASSIGN_ROLE_MEMBER')).toBe(false);
		expect(student.canDo('ASSIGN_ROLE_STUDENT')).toBe(false);
		expect(student.canDo('SEE_GAMES')).toBe(false);
		expect(student.canDo('SEE_GAMES_ADMIN')).toBe(false);
		expect(student.canDo('SEE_GAMES_TEACHER')).toBe(false);
		expect(student.canDo('SEE_GAMES_MEMBER')).toBe(false);
		expect(student.canDo('SEE_GAMES_STUDENT')).toBe(false);
		expect(student.canDo('CHALLENGE_USER')).toBe(false);
		expect(student.canDo('CHALLENGE_USER_ADMIN')).toBe(false);
		expect(student.canDo('CHALLENGE_USER_MEMBER')).toBe(false);
		expect(student.canDo('CHALLENGE_USER_TEACHER')).toBe(false);
		expect(student.canDo('CHALLENGE_USER_STUDENT')).toBe(false);
	});

	test('Member', () => {
		UserRoleToUserAction.getInstance().clear();
		initializePermissions({
			admin: [],
			teacher: [],
			student: [],
			member: ['CHALLENGE_USER_ADMIN', 'CHALLENGE_USER_STUDENT']
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
		expect(actions.includes('CHALLENGE_USER_STUDENT')).toBe(true);
		expect(actions.includes('CHALLENGE_USER')).toBe(true);
		expect(actions.includes('CHALLENGE_USER_ADMIN')).toBe(true);

		expect(member.canDo('CREATE_USER')).toBe(false);
		expect(member.canDo('CREATE_GAMES')).toBe(false);
		expect(member.canDo('EDIT_USER')).toBe(false);
		expect(member.canDo('EDIT_USER_ADMIN')).toBe(false);
		expect(member.canDo('EDIT_USER_TEACHER')).toBe(false);
		expect(member.canDo('EDIT_USER_MEMBER')).toBe(false);
		expect(member.canDo('EDIT_USER_STUDENT')).toBe(false);
		expect(member.canDo('EDIT_GAMES')).toBe(false);
		expect(member.canDo('EDIT_GAMES_ADMIN')).toBe(false);
		expect(member.canDo('EDIT_GAMES_TEACHER')).toBe(false);
		expect(member.canDo('EDIT_GAMES_MEMBER')).toBe(false);
		expect(member.canDo('EDIT_GAMES_STUDENT')).toBe(false);
		expect(member.canDo('ASSIGN_ROLE')).toBe(false);
		expect(member.canDo('ASSIGN_ROLE_ADMIN')).toBe(false);
		expect(member.canDo('ASSIGN_ROLE_TEACHER')).toBe(false);
		expect(member.canDo('ASSIGN_ROLE_MEMBER')).toBe(false);
		expect(member.canDo('ASSIGN_ROLE_STUDENT')).toBe(false);
		expect(member.canDo('SEE_GAMES')).toBe(false);
		expect(member.canDo('SEE_GAMES_ADMIN')).toBe(false);
		expect(member.canDo('SEE_GAMES_TEACHER')).toBe(false);
		expect(member.canDo('SEE_GAMES_MEMBER')).toBe(false);
		expect(member.canDo('SEE_GAMES_STUDENT')).toBe(false);
		expect(member.canDo('CHALLENGE_USER')).toBe(true);
		expect(member.canDo('CHALLENGE_USER_ADMIN')).toBe(true);
		expect(member.canDo('CHALLENGE_USER_MEMBER')).toBe(false);
		expect(member.canDo('CHALLENGE_USER_TEACHER')).toBe(false);
		expect(member.canDo('CHALLENGE_USER_STUDENT')).toBe(true);
	});
});

describe('Actions allowed per user (multiple roles)', () => {
	test('Admin + Teacher', () => {
		UserRoleToUserAction.getInstance().clear();
		initializePermissions({
			admin: ['EDIT_USER_TEACHER'],
			teacher: [],
			student: ['CHALLENGE_USER_STUDENT'],
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
		expect(actions.includes('EDIT_USER')).toBe(true);
		expect(actions.includes('EDIT_USER_TEACHER')).toBe(true);
		expect(actions.includes('CHALLENGE_USER')).toBe(false);
		expect(actions.includes('CHALLENGE_USER_STUDENT')).toBe(false);

		expect(admin_teacher.canDo('CREATE_USER')).toBe(false);
		expect(admin_teacher.canDo('CREATE_GAMES')).toBe(false);
		expect(admin_teacher.canDo('EDIT_USER')).toBe(true);
		expect(admin_teacher.canDo('EDIT_USER_ADMIN')).toBe(false);
		expect(admin_teacher.canDo('EDIT_USER_TEACHER')).toBe(true);
		expect(admin_teacher.canDo('EDIT_USER_MEMBER')).toBe(false);
		expect(admin_teacher.canDo('EDIT_USER_STUDENT')).toBe(false);
		expect(admin_teacher.canDo('EDIT_GAMES')).toBe(false);
		expect(admin_teacher.canDo('EDIT_GAMES_ADMIN')).toBe(false);
		expect(admin_teacher.canDo('EDIT_GAMES_TEACHER')).toBe(false);
		expect(admin_teacher.canDo('EDIT_GAMES_MEMBER')).toBe(false);
		expect(admin_teacher.canDo('EDIT_GAMES_STUDENT')).toBe(false);
		expect(admin_teacher.canDo('ASSIGN_ROLE')).toBe(false);
		expect(admin_teacher.canDo('ASSIGN_ROLE_ADMIN')).toBe(false);
		expect(admin_teacher.canDo('ASSIGN_ROLE_TEACHER')).toBe(false);
		expect(admin_teacher.canDo('ASSIGN_ROLE_MEMBER')).toBe(false);
		expect(admin_teacher.canDo('ASSIGN_ROLE_STUDENT')).toBe(false);
		expect(admin_teacher.canDo('SEE_GAMES')).toBe(false);
		expect(admin_teacher.canDo('SEE_GAMES_ADMIN')).toBe(false);
		expect(admin_teacher.canDo('SEE_GAMES_TEACHER')).toBe(false);
		expect(admin_teacher.canDo('SEE_GAMES_MEMBER')).toBe(false);
		expect(admin_teacher.canDo('SEE_GAMES_STUDENT')).toBe(false);
		expect(admin_teacher.canDo('CHALLENGE_USER')).toBe(false);
		expect(admin_teacher.canDo('CHALLENGE_USER_ADMIN')).toBe(false);
		expect(admin_teacher.canDo('CHALLENGE_USER_MEMBER')).toBe(false);
		expect(admin_teacher.canDo('CHALLENGE_USER_TEACHER')).toBe(false);
		expect(admin_teacher.canDo('CHALLENGE_USER_STUDENT')).toBe(false);
	});

	test('Admin + Student', () => {
		UserRoleToUserAction.getInstance().clear();
		initializePermissions({
			admin: ['EDIT_USER_TEACHER'],
			teacher: [],
			student: ['CHALLENGE_USER_STUDENT'],
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
		expect(actions.includes('EDIT_USER')).toBe(true);
		expect(actions.includes('EDIT_USER_TEACHER')).toBe(true);
		expect(actions.includes('CHALLENGE_USER')).toBe(true);
		expect(actions.includes('CHALLENGE_USER_STUDENT')).toBe(true);

		expect(admin_student.canDo('CREATE_USER')).toBe(false);
		expect(admin_student.canDo('CREATE_GAMES')).toBe(false);
		expect(admin_student.canDo('EDIT_USER')).toBe(true);
		expect(admin_student.canDo('EDIT_USER_ADMIN')).toBe(false);
		expect(admin_student.canDo('EDIT_USER_TEACHER')).toBe(true);
		expect(admin_student.canDo('EDIT_USER_MEMBER')).toBe(false);
		expect(admin_student.canDo('EDIT_USER_STUDENT')).toBe(false);
		expect(admin_student.canDo('EDIT_GAMES')).toBe(false);
		expect(admin_student.canDo('EDIT_GAMES_ADMIN')).toBe(false);
		expect(admin_student.canDo('EDIT_GAMES_TEACHER')).toBe(false);
		expect(admin_student.canDo('EDIT_GAMES_MEMBER')).toBe(false);
		expect(admin_student.canDo('EDIT_GAMES_STUDENT')).toBe(false);
		expect(admin_student.canDo('ASSIGN_ROLE')).toBe(false);
		expect(admin_student.canDo('ASSIGN_ROLE_ADMIN')).toBe(false);
		expect(admin_student.canDo('ASSIGN_ROLE_TEACHER')).toBe(false);
		expect(admin_student.canDo('ASSIGN_ROLE_MEMBER')).toBe(false);
		expect(admin_student.canDo('ASSIGN_ROLE_STUDENT')).toBe(false);
		expect(admin_student.canDo('SEE_GAMES')).toBe(false);
		expect(admin_student.canDo('SEE_GAMES_ADMIN')).toBe(false);
		expect(admin_student.canDo('SEE_GAMES_TEACHER')).toBe(false);
		expect(admin_student.canDo('SEE_GAMES_MEMBER')).toBe(false);
		expect(admin_student.canDo('SEE_GAMES_STUDENT')).toBe(false);
		expect(admin_student.canDo('CHALLENGE_USER')).toBe(true);
		expect(admin_student.canDo('CHALLENGE_USER_ADMIN')).toBe(false);
		expect(admin_student.canDo('CHALLENGE_USER_MEMBER')).toBe(false);
		expect(admin_student.canDo('CHALLENGE_USER_TEACHER')).toBe(false);
		expect(admin_student.canDo('CHALLENGE_USER_STUDENT')).toBe(true);
	});
});
