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
import { TimeControlRating } from '../../src-server/models/time_control_rating';
import { TimeControlGames, User } from '../../src-server/models/user';
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
import { EloRating } from '../../src-server/rating_framework/Elo/rating';

describe('Elo', () => {
	//const bullet = new EloRating(1400, 0, 0, 0, 0, 40, false);
	const blitz = new EloRating(1500, 0, 0, 0, 0, 40, false);
	//const rapid = new EloRating(1600, 0, 0, 0, 0, 40, false);
	const classical = new EloRating(1700, 0, 0, 0, 0, 40, false);

	test('basic gets', () => {
		const u = new User(
			'user.name',
			'First',
			'Last',
			new Password('asdf', 'ivrandom'),
			[ADMIN, TEACHER],
			[new TimeControlGames('blitz', ['2024-12-24']), new TimeControlGames('rapid', ['2024-12-25'])],
			[new TimeControlRating('blitz', blitz), new TimeControlRating('classical', classical)]
		);

		expect(u.is(ADMIN)).toBe(true);
		expect(u.is(TEACHER)).toBe(true);
		expect(u.is(STUDENT)).toBe(false);
		expect(u.is(MEMBER)).toBe(false);

		expect(u.get_roles()).toEqual([ADMIN, TEACHER]);
		expect(u.get_roles()).not.toEqual([TEACHER, ADMIN]);

		expect(u.get_first_name()).toEqual('First');
		expect(u.get_last_name()).toEqual('Last');
		expect(u.get_full_name()).toEqual('First Last');
		expect(u.get_games('blitz')).toEqual(['2024-12-24']);
		expect(u.get_games('rapid')).toEqual(['2024-12-25']);
	});

	test('basic sets', () => {
		let u = new User(
			'user.name',
			'First',
			'Last',
			new Password('asdf', 'ivrandom'),
			[ADMIN, TEACHER],
			[new TimeControlGames('blitz', ['2024-12-24']), new TimeControlGames('rapid', ['2024-12-25'])],
			[new TimeControlRating('blitz', blitz), new TimeControlRating('classical', classical)]
		);

		expect(u.is(ADMIN)).toBe(true);
		expect(u.is(TEACHER)).toBe(true);
		expect(u.is(STUDENT)).toBe(false);
		expect(u.is(MEMBER)).toBe(false);

		expect(u.get_roles()).toEqual([ADMIN, TEACHER]);
		expect(u.get_roles()).not.toEqual([TEACHER, ADMIN]);

		u.set_first_name('Perico');
		u.set_last_name('Palotes');
		expect(u.get_first_name()).toEqual('Perico');
		expect(u.get_last_name()).toEqual('Palotes');
		expect(u.get_full_name()).toEqual('Perico Palotes');

		u.set_password(new Password('a', 'b'));
		expect(u.get_password()).toEqual(new Password('a', 'b'));
	});

	test('Adding games', () => {
		let u = new User(
			'user.name',
			'First',
			'Last',
			new Password('asdf', 'ivrandom'),
			[ADMIN, TEACHER],
			[new TimeControlGames('blitz', ['2024-12-24']), new TimeControlGames('rapid', ['2024-12-25'])],
			[new TimeControlRating('blitz', blitz), new TimeControlRating('classical', classical)]
		);

		expect(u.get_games('blitz')).toEqual(['2024-12-24']);
		expect(u.get_games('rapid')).toEqual(['2024-12-25']);

		u.add_game('blitz', '2024-12-31');
		expect(u.get_games('blitz')).toEqual(['2024-12-24', '2024-12-31']);

		u.add_game('rapid', '2024-12-28');
		expect(u.get_games('rapid')).toEqual(['2024-12-25', '2024-12-28']);

		u.add_game('blitz', '2024-12-01');
		expect(u.get_games('blitz')).toEqual(['2024-12-01', '2024-12-24', '2024-12-31']);

		u.add_game('rapid', '2019-12-31');
		expect(u.get_games('rapid')).toEqual(['2019-12-31', '2024-12-25', '2024-12-28']);
	});
});

describe('Actions allowed per user (single role)', () => {
	test('Admin', () => {
		UserRoleToUserAction.get_instance().clear();
		initialize_permissions({
			admin: [EDIT_TEACHER],
			teacher: [],
			student: [],
			member: []
		});

		const admin = new User('u', 'F', 'L', new Password('a', 'i'), [ADMIN], [], []);

		const actions = admin.get_actions();
		expect(actions.length).toBe(2);
		expect(actions.includes(EDIT_USER)).toBe(true);
		expect(actions.includes(EDIT_TEACHER)).toBe(true);

		expect(admin.can_do(CREATE_USER)).toBe(false);
		expect(admin.can_do(CREATE_GAMES)).toBe(false);
		expect(admin.can_do(EDIT_USER)).toBe(true);
		expect(admin.can_do(EDIT_ADMIN)).toBe(false);
		expect(admin.can_do(EDIT_TEACHER)).toBe(true);
		expect(admin.can_do(EDIT_MEMBER)).toBe(false);
		expect(admin.can_do(EDIT_STUDENT)).toBe(false);
		expect(admin.can_do(EDIT_GAMES_USER)).toBe(false);
		expect(admin.can_do(EDIT_GAMES_ADMIN)).toBe(false);
		expect(admin.can_do(EDIT_GAMES_TEACHER)).toBe(false);
		expect(admin.can_do(EDIT_GAMES_MEMBER)).toBe(false);
		expect(admin.can_do(EDIT_GAMES_STUDENT)).toBe(false);
		expect(admin.can_do(ASSIGN_ROLE_USER)).toBe(false);
		expect(admin.can_do(ASSIGN_ROLE_ADMIN)).toBe(false);
		expect(admin.can_do(ASSIGN_ROLE_TEACHER)).toBe(false);
		expect(admin.can_do(ASSIGN_ROLE_MEMBER)).toBe(false);
		expect(admin.can_do(ASSIGN_ROLE_STUDENT)).toBe(false);
		expect(admin.can_do(SEE_GAMES_USER)).toBe(false);
		expect(admin.can_do(SEE_GAMES_ADMIN)).toBe(false);
		expect(admin.can_do(SEE_GAMES_TEACHER)).toBe(false);
		expect(admin.can_do(SEE_GAMES_MEMBER)).toBe(false);
		expect(admin.can_do(SEE_GAMES_STUDENT)).toBe(false);
		expect(admin.can_do(CHALLENGE_USER)).toBe(false);
		expect(admin.can_do(CHALLENGE_ADMIN)).toBe(false);
		expect(admin.can_do(CHALLENGE_MEMBER)).toBe(false);
		expect(admin.can_do(CHALLENGE_TEACHER)).toBe(false);
		expect(admin.can_do(CHALLENGE_STUDENT)).toBe(false);
	});

	test('Teacher', () => {
		UserRoleToUserAction.get_instance().clear();
		initialize_permissions({
			admin: [],
			teacher: [ASSIGN_ROLE_MEMBER],
			student: [],
			member: []
		});

		const teacher = new User('u', 'F', 'L', new Password('a', 'i'), [TEACHER], [], []);

		const actions = teacher.get_actions();
		expect(actions.length).toBe(2);
		expect(actions.includes(ASSIGN_ROLE_MEMBER)).toBe(true);
		expect(actions.includes(ASSIGN_ROLE_USER)).toBe(true);

		expect(teacher.can_do(CREATE_USER)).toBe(false);
		expect(teacher.can_do(CREATE_GAMES)).toBe(false);
		expect(teacher.can_do(EDIT_USER)).toBe(false);
		expect(teacher.can_do(EDIT_ADMIN)).toBe(false);
		expect(teacher.can_do(EDIT_TEACHER)).toBe(false);
		expect(teacher.can_do(EDIT_MEMBER)).toBe(false);
		expect(teacher.can_do(EDIT_STUDENT)).toBe(false);
		expect(teacher.can_do(EDIT_GAMES_USER)).toBe(false);
		expect(teacher.can_do(EDIT_GAMES_ADMIN)).toBe(false);
		expect(teacher.can_do(EDIT_GAMES_TEACHER)).toBe(false);
		expect(teacher.can_do(EDIT_GAMES_MEMBER)).toBe(false);
		expect(teacher.can_do(EDIT_GAMES_STUDENT)).toBe(false);
		expect(teacher.can_do(ASSIGN_ROLE_USER)).toBe(true);
		expect(teacher.can_do(ASSIGN_ROLE_ADMIN)).toBe(false);
		expect(teacher.can_do(ASSIGN_ROLE_TEACHER)).toBe(false);
		expect(teacher.can_do(ASSIGN_ROLE_MEMBER)).toBe(true);
		expect(teacher.can_do(ASSIGN_ROLE_STUDENT)).toBe(false);
		expect(teacher.can_do(SEE_GAMES_USER)).toBe(false);
		expect(teacher.can_do(SEE_GAMES_ADMIN)).toBe(false);
		expect(teacher.can_do(SEE_GAMES_TEACHER)).toBe(false);
		expect(teacher.can_do(SEE_GAMES_MEMBER)).toBe(false);
		expect(teacher.can_do(SEE_GAMES_STUDENT)).toBe(false);
		expect(teacher.can_do(CHALLENGE_USER)).toBe(false);
		expect(teacher.can_do(CHALLENGE_ADMIN)).toBe(false);
		expect(teacher.can_do(CHALLENGE_MEMBER)).toBe(false);
		expect(teacher.can_do(CHALLENGE_TEACHER)).toBe(false);
		expect(teacher.can_do(CHALLENGE_STUDENT)).toBe(false);
	});

	test('Student', () => {
		UserRoleToUserAction.get_instance().clear();
		initialize_permissions({
			admin: [],
			teacher: [],
			student: [CREATE_USER, CREATE_GAMES],
			member: []
		});

		const student = new User('u', 'F', 'L', new Password('a', 'i'), [STUDENT], [], []);

		const actions = student.get_actions();
		expect(actions.length).toBe(2);
		expect(actions.includes(CREATE_GAMES)).toBe(true);
		expect(actions.includes(CREATE_USER)).toBe(true);

		expect(student.can_do(CREATE_USER)).toBe(true);
		expect(student.can_do(CREATE_GAMES)).toBe(true);
		expect(student.can_do(EDIT_USER)).toBe(false);
		expect(student.can_do(EDIT_ADMIN)).toBe(false);
		expect(student.can_do(EDIT_TEACHER)).toBe(false);
		expect(student.can_do(EDIT_MEMBER)).toBe(false);
		expect(student.can_do(EDIT_STUDENT)).toBe(false);
		expect(student.can_do(EDIT_GAMES_USER)).toBe(false);
		expect(student.can_do(EDIT_GAMES_ADMIN)).toBe(false);
		expect(student.can_do(EDIT_GAMES_TEACHER)).toBe(false);
		expect(student.can_do(EDIT_GAMES_MEMBER)).toBe(false);
		expect(student.can_do(EDIT_GAMES_STUDENT)).toBe(false);
		expect(student.can_do(ASSIGN_ROLE_USER)).toBe(false);
		expect(student.can_do(ASSIGN_ROLE_ADMIN)).toBe(false);
		expect(student.can_do(ASSIGN_ROLE_TEACHER)).toBe(false);
		expect(student.can_do(ASSIGN_ROLE_MEMBER)).toBe(false);
		expect(student.can_do(ASSIGN_ROLE_STUDENT)).toBe(false);
		expect(student.can_do(SEE_GAMES_USER)).toBe(false);
		expect(student.can_do(SEE_GAMES_ADMIN)).toBe(false);
		expect(student.can_do(SEE_GAMES_TEACHER)).toBe(false);
		expect(student.can_do(SEE_GAMES_MEMBER)).toBe(false);
		expect(student.can_do(SEE_GAMES_STUDENT)).toBe(false);
		expect(student.can_do(CHALLENGE_USER)).toBe(false);
		expect(student.can_do(CHALLENGE_ADMIN)).toBe(false);
		expect(student.can_do(CHALLENGE_MEMBER)).toBe(false);
		expect(student.can_do(CHALLENGE_TEACHER)).toBe(false);
		expect(student.can_do(CHALLENGE_STUDENT)).toBe(false);
	});

	test('Member', () => {
		UserRoleToUserAction.get_instance().clear();
		initialize_permissions({
			admin: [],
			teacher: [],
			student: [],
			member: [CHALLENGE_ADMIN, CHALLENGE_STUDENT]
		});

		const member = new User('u', 'F', 'L', new Password('a', 'i'), [MEMBER], [], []);

		const actions = member.get_actions();
		expect(actions.length).toBe(3);
		expect(actions.includes(CHALLENGE_STUDENT)).toBe(true);
		expect(actions.includes(CHALLENGE_USER)).toBe(true);
		expect(actions.includes(CHALLENGE_ADMIN)).toBe(true);

		expect(member.can_do(CREATE_USER)).toBe(false);
		expect(member.can_do(CREATE_GAMES)).toBe(false);
		expect(member.can_do(EDIT_USER)).toBe(false);
		expect(member.can_do(EDIT_ADMIN)).toBe(false);
		expect(member.can_do(EDIT_TEACHER)).toBe(false);
		expect(member.can_do(EDIT_MEMBER)).toBe(false);
		expect(member.can_do(EDIT_STUDENT)).toBe(false);
		expect(member.can_do(EDIT_GAMES_USER)).toBe(false);
		expect(member.can_do(EDIT_GAMES_ADMIN)).toBe(false);
		expect(member.can_do(EDIT_GAMES_TEACHER)).toBe(false);
		expect(member.can_do(EDIT_GAMES_MEMBER)).toBe(false);
		expect(member.can_do(EDIT_GAMES_STUDENT)).toBe(false);
		expect(member.can_do(ASSIGN_ROLE_USER)).toBe(false);
		expect(member.can_do(ASSIGN_ROLE_ADMIN)).toBe(false);
		expect(member.can_do(ASSIGN_ROLE_TEACHER)).toBe(false);
		expect(member.can_do(ASSIGN_ROLE_MEMBER)).toBe(false);
		expect(member.can_do(ASSIGN_ROLE_STUDENT)).toBe(false);
		expect(member.can_do(SEE_GAMES_USER)).toBe(false);
		expect(member.can_do(SEE_GAMES_ADMIN)).toBe(false);
		expect(member.can_do(SEE_GAMES_TEACHER)).toBe(false);
		expect(member.can_do(SEE_GAMES_MEMBER)).toBe(false);
		expect(member.can_do(SEE_GAMES_STUDENT)).toBe(false);
		expect(member.can_do(CHALLENGE_USER)).toBe(true);
		expect(member.can_do(CHALLENGE_ADMIN)).toBe(true);
		expect(member.can_do(CHALLENGE_MEMBER)).toBe(false);
		expect(member.can_do(CHALLENGE_TEACHER)).toBe(false);
		expect(member.can_do(CHALLENGE_STUDENT)).toBe(true);
	});
});

describe('Actions allowed per user (multiple roles)', () => {
	test('Admin + Teacher', () => {
		UserRoleToUserAction.get_instance().clear();
		initialize_permissions({
			admin: [EDIT_TEACHER],
			teacher: [],
			student: [CHALLENGE_STUDENT],
			member: []
		});

		const admin_teacher = new User('u', 'F', 'L', new Password('a', 'i'), [ADMIN, TEACHER], [], []);

		const actions = admin_teacher.get_actions();
		expect(actions.length).toBe(2);
		expect(actions.includes(EDIT_USER)).toBe(true);
		expect(actions.includes(EDIT_TEACHER)).toBe(true);
		expect(actions.includes(CHALLENGE_USER)).toBe(false);
		expect(actions.includes(CHALLENGE_STUDENT)).toBe(false);

		expect(admin_teacher.can_do(CREATE_USER)).toBe(false);
		expect(admin_teacher.can_do(CREATE_GAMES)).toBe(false);
		expect(admin_teacher.can_do(EDIT_USER)).toBe(true);
		expect(admin_teacher.can_do(EDIT_ADMIN)).toBe(false);
		expect(admin_teacher.can_do(EDIT_TEACHER)).toBe(true);
		expect(admin_teacher.can_do(EDIT_MEMBER)).toBe(false);
		expect(admin_teacher.can_do(EDIT_STUDENT)).toBe(false);
		expect(admin_teacher.can_do(EDIT_GAMES_USER)).toBe(false);
		expect(admin_teacher.can_do(EDIT_GAMES_ADMIN)).toBe(false);
		expect(admin_teacher.can_do(EDIT_GAMES_TEACHER)).toBe(false);
		expect(admin_teacher.can_do(EDIT_GAMES_MEMBER)).toBe(false);
		expect(admin_teacher.can_do(EDIT_GAMES_STUDENT)).toBe(false);
		expect(admin_teacher.can_do(ASSIGN_ROLE_USER)).toBe(false);
		expect(admin_teacher.can_do(ASSIGN_ROLE_ADMIN)).toBe(false);
		expect(admin_teacher.can_do(ASSIGN_ROLE_TEACHER)).toBe(false);
		expect(admin_teacher.can_do(ASSIGN_ROLE_MEMBER)).toBe(false);
		expect(admin_teacher.can_do(ASSIGN_ROLE_STUDENT)).toBe(false);
		expect(admin_teacher.can_do(SEE_GAMES_USER)).toBe(false);
		expect(admin_teacher.can_do(SEE_GAMES_ADMIN)).toBe(false);
		expect(admin_teacher.can_do(SEE_GAMES_TEACHER)).toBe(false);
		expect(admin_teacher.can_do(SEE_GAMES_MEMBER)).toBe(false);
		expect(admin_teacher.can_do(SEE_GAMES_STUDENT)).toBe(false);
		expect(admin_teacher.can_do(CHALLENGE_USER)).toBe(false);
		expect(admin_teacher.can_do(CHALLENGE_ADMIN)).toBe(false);
		expect(admin_teacher.can_do(CHALLENGE_MEMBER)).toBe(false);
		expect(admin_teacher.can_do(CHALLENGE_TEACHER)).toBe(false);
		expect(admin_teacher.can_do(CHALLENGE_STUDENT)).toBe(false);
	});

	test('Admin + Student', () => {
		UserRoleToUserAction.get_instance().clear();
		initialize_permissions({
			admin: [EDIT_TEACHER],
			teacher: [],
			student: [CHALLENGE_STUDENT],
			member: []
		});

		const admin_student = new User('u', 'F', 'L', new Password('a', 'i'), [ADMIN, STUDENT], [], []);

		const actions = admin_student.get_actions();
		expect(actions.length).toBe(4);
		expect(actions.includes(EDIT_USER)).toBe(true);
		expect(actions.includes(EDIT_TEACHER)).toBe(true);
		expect(actions.includes(CHALLENGE_USER)).toBe(true);
		expect(actions.includes(CHALLENGE_STUDENT)).toBe(true);

		expect(admin_student.can_do(CREATE_USER)).toBe(false);
		expect(admin_student.can_do(CREATE_GAMES)).toBe(false);
		expect(admin_student.can_do(EDIT_USER)).toBe(true);
		expect(admin_student.can_do(EDIT_ADMIN)).toBe(false);
		expect(admin_student.can_do(EDIT_TEACHER)).toBe(true);
		expect(admin_student.can_do(EDIT_MEMBER)).toBe(false);
		expect(admin_student.can_do(EDIT_STUDENT)).toBe(false);
		expect(admin_student.can_do(EDIT_GAMES_USER)).toBe(false);
		expect(admin_student.can_do(EDIT_GAMES_ADMIN)).toBe(false);
		expect(admin_student.can_do(EDIT_GAMES_TEACHER)).toBe(false);
		expect(admin_student.can_do(EDIT_GAMES_MEMBER)).toBe(false);
		expect(admin_student.can_do(EDIT_GAMES_STUDENT)).toBe(false);
		expect(admin_student.can_do(ASSIGN_ROLE_USER)).toBe(false);
		expect(admin_student.can_do(ASSIGN_ROLE_ADMIN)).toBe(false);
		expect(admin_student.can_do(ASSIGN_ROLE_TEACHER)).toBe(false);
		expect(admin_student.can_do(ASSIGN_ROLE_MEMBER)).toBe(false);
		expect(admin_student.can_do(ASSIGN_ROLE_STUDENT)).toBe(false);
		expect(admin_student.can_do(SEE_GAMES_USER)).toBe(false);
		expect(admin_student.can_do(SEE_GAMES_ADMIN)).toBe(false);
		expect(admin_student.can_do(SEE_GAMES_TEACHER)).toBe(false);
		expect(admin_student.can_do(SEE_GAMES_MEMBER)).toBe(false);
		expect(admin_student.can_do(SEE_GAMES_STUDENT)).toBe(false);
		expect(admin_student.can_do(CHALLENGE_USER)).toBe(true);
		expect(admin_student.can_do(CHALLENGE_ADMIN)).toBe(false);
		expect(admin_student.can_do(CHALLENGE_MEMBER)).toBe(false);
		expect(admin_student.can_do(CHALLENGE_TEACHER)).toBe(false);
		expect(admin_student.can_do(CHALLENGE_STUDENT)).toBe(true);
	});
});
