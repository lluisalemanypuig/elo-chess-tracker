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

import { isNotDefined } from '@common//utils/is-defined';
import { toPlayerPrivateId } from '@common/models/player-id';
import {
	toTimeControlId,
	toTimeControlName,
} from '@common/models/time-control';
import { toUserGivenName } from '@common/models/user-given-name';
import { toDateFull } from '@common/utils/time';
import {
	challengeAccept,
	challengeAgreeResult,
	challengeDisagreeResult,
	challengeSendNew,
	challengeSetResult,
	getChallengesBy,
} from '@server/managers/challenges';
import {
	ChallengesManager,
	numberToChallengeId,
} from '@server/managers/challenges-manager';
import { clearServer } from '@server/managers/memory/clear';
import { serverInitFromData } from '@server/managers/memory/initialization';
import { userAddNew } from '@server/managers/users';
import { UsersManager } from '@server/managers/users-manager';
import { User } from '@server/models/user';
import { makeConfiguration, runCommand, TestError } from '@tests';
const Classical = toTimeControlId('Classical');
const Classical90p30 = toTimeControlName('Classical (90 + 30)');

const Rapid = toTimeControlId('Rapid');
const Rapid12p5 = toTimeControlName('Rapid (12 + 5)');
const Rapid10p0 = toTimeControlName('Rapid (10 + 0)');

const Blitz = toTimeControlId('Blitz');
const Blitz5p3 = toTimeControlName('Blitz (5 + 3)');

const classical_rapid_blitz = makeConfiguration({
	timeControls: [
		{
			id: Classical,
			name: Classical90p30,
		},
		{
			id: Rapid,
			name: Rapid12p5,
		},
		{
			id: Rapid,
			name: Rapid10p0,
		},
		{
			id: Blitz,
			name: Blitz5p3,
		},
	],
	permissions: {
		admin: [
			'CREATE_USER',
			'ASSIGN_ROLE',
			'ASSIGN_ROLE_ADMIN',
			'ASSIGN_ROLE_REFEREE',
			'ASSIGN_ROLE_TEACHER',
			'ASSIGN_ROLE_MEMBER',
			'ASSIGN_ROLE_STUDENT',
			'CHALLENGE_USER_ADMIN',
			'CHALLENGE_USER_MEMBER',
			'CHALLENGE_USER_TEACHER',
			'CHALLENGE_USER_STUDENT',
		],
		referee: [
			'FORCE_CHALLENGE_ACCEPT_ADMIN',
			'FORCE_CHALLENGE_ACCEPT_REFEREE',
			'FORCE_CHALLENGE_ACCEPT_TEACHER',
			'FORCE_CHALLENGE_ACCEPT_STUDENT',
			'FORCE_CHALLENGE_SET_RESULT_ADMIN',
			'FORCE_CHALLENGE_SET_RESULT_REFEREE',
			'FORCE_CHALLENGE_SET_RESULT_TEACHER',
			'FORCE_CHALLENGE_SET_RESULT_STUDENT',
			'FORCE_CHALLENGE_ACCEPT_RESULT_ADMIN',
			'FORCE_CHALLENGE_ACCEPT_RESULT_REFEREE',
			'FORCE_CHALLENGE_ACCEPT_RESULT_TEACHER',
			'FORCE_CHALLENGE_ACCEPT_RESULT_STUDENT',
		],
		teacher: [
			'CHALLENGE_USER_ADMIN',
			'CHALLENGE_USER_MEMBER',
			'CHALLENGE_USER_TEACHER',
			'CHALLENGE_USER_STUDENT',
		],
		member: [
			'CHALLENGE_USER_ADMIN',
			'CHALLENGE_USER_MEMBER',
			'CHALLENGE_USER_TEACHER',
			'CHALLENGE_USER_STUDENT',
		],
		student: [
			'CHALLENGE_USER_ADMIN',
			'CHALLENGE_USER_MEMBER',
			'CHALLENGE_USER_TEACHER',
			'CHALLENGE_USER_STUDENT',
		],
	},
});

const aa = toPlayerPrivateId('aa');
const cc = toPlayerPrivateId('cc');
const dd = toPlayerPrivateId('dd');
const ee = toPlayerPrivateId('ee');
const ff = toPlayerPrivateId('ff');

const A = toUserGivenName('A');
const C = toUserGivenName('C');
const D = toUserGivenName('D');
const E = toUserGivenName('E');
const F = toUserGivenName('F');

let uA: User;
let uC: User;
let uD: User;
let uE: User;
let uF: User;

describe('Check initialization', () => {
	test('In an empty server', async () => {
		await runCommand('./tests/initialize-empty.sh');
		clearServer();
		serverInitFromData('tests/webpage/', classical_rapid_blitz);

		const challenges = ChallengesManager.getInstance();
		expect(challenges.numChallenges()).toBe(0);
		expect(challenges.getMaxChallengeId()).toBe(0);
		expect(getChallengesBy()).toEqual([]);
		expect(challenges.getChallengeById(numberToChallengeId(1))).toEqual(
			undefined,
		);
		expect(challenges.getChallengeById(numberToChallengeId(2))).toEqual(
			undefined,
		);
		expect(challenges.getChallengeIndexById(numberToChallengeId(1))).toEqual(
			-1,
		);
		expect(challenges.getChallengeIndexById(numberToChallengeId(2))).toEqual(
			-1,
		);
	});
});

describe('Check challenge communication', () => {
	test('Add users', () => {
		const admin = UsersManager.getInstance().getAllUserDataByPrivateId(
			toPlayerPrivateId('admin.default'),
		);
		if (isNotDefined(admin)) {
			throw new TestError('admin default user could not be retrieved');
		}
		uA = userAddNew(admin.user, {
			username: aa,
			firstName: A,
			lastName: A,
			password: 'pass_a',
			roles: ['ADMIN', 'REFEREE'],
		});
		uC = userAddNew(admin.user, {
			username: cc,
			firstName: C,
			lastName: C,
			password: 'pass_c',
			roles: ['MEMBER'],
		});
		uD = userAddNew(admin.user, {
			username: dd,
			firstName: D,
			lastName: D,
			password: 'pass_d',
			roles: ['MEMBER'],
		});
		uE = userAddNew(admin.user, {
			username: ee,
			firstName: E,
			lastName: E,
			password: 'pass_e',
			roles: ['STUDENT'],
		});
		uF = userAddNew(admin.user, {
			username: ff,
			firstName: F,
			lastName: F,
			password: 'pass_f',
			roles: ['STUDENT'],
		});
	});

	// accepting challenges

	test('Only the receiving player can accept a challenge', () => {
		const challenge = challengeSendNew(
			'sample',
			uE,
			uF,
			Blitz,
			Blitz5p3,
			toDateFull('2025-01-10..20:38:15:000'),
		);

		expect(() =>
			challengeAccept(challenge, {
				by: uE,
				when: toDateFull('2025-01-10..20:38:16:000'),
			}),
		).toThrow();

		expect(() =>
			challengeAccept(challenge, {
				by: uF,
				when: toDateFull('2025-01-10..20:38:17:000'),
			}),
		).not.toThrow();
		expect(challenge.challengeAcceptedBy).toBe(uF.username);
		expect(challenge.whenChallengeAccepted).toBe('2025-01-10..20:38:17:000');
		expect(challenge.state).toBe('PENDING_RESULT');
	});

	test('A referee can forcefully accept a challenge', () => {
		const challenge = challengeSendNew(
			'sample',
			uE,
			uF,
			Blitz,
			Blitz5p3,
			toDateFull('2025-01-10..20:38:18:000'),
		);

		expect(() =>
			challengeAccept(challenge, {
				by: uA,
				when: toDateFull('2025-01-10..20:38:19:000'),
			}),
		).not.toThrow();
		expect(challenge.challengeAcceptedBy).toBe(uA.username);
		expect(challenge.whenChallengeAccepted).toBe('2025-01-10..20:38:19:000');
		expect(challenge.state).toBe('PENDING_RESULT');
	});

	test('A referee cannot forcefully accept a member challenge', () => {
		const challenge = challengeSendNew(
			'sample',
			uC,
			uD,
			Blitz,
			Blitz5p3,
			toDateFull('2025-01-10..20:38:20:000'),
		);

		expect(() =>
			challengeAccept(challenge, {
				by: uA,
				when: toDateFull('2025-01-10..20:38:21:000'),
			}),
		).toThrow();
		expect(challenge.challengeAcceptedBy).toBe(undefined);
		expect(challenge.state).toBe('PENDING_ACCEPT');
	});

	test('A referee can accept a student-member challenge', () => {
		const challenge = challengeSendNew(
			'sample',
			uE,
			uC,
			Blitz,
			Blitz5p3,
			toDateFull('2025-01-10..20:39:03:000'),
		);

		expect(() =>
			challengeAccept(challenge, {
				by: uA,
				when: toDateFull('2025-01-10..20:39:04:000'),
			}),
		).not.toThrow();
	});

	// setting the result

	test('A referee can forcefully set a result that players cannot disagree with', () => {
		const challenge = challengeSendNew(
			'sample',
			uE,
			uF,
			Blitz,
			Blitz5p3,
			toDateFull('2025-01-10..20:38:22:000'),
		);

		challengeAccept(challenge, {
			by: uF,
			when: toDateFull('2025-01-10..20:38:23:000'),
		});

		expect(() =>
			challengeSetResult(challenge, {
				by: uA,
				when: toDateFull('2025-01-10..20:38:24:000'),
				white: uE.username,
				black: uF.username,
				result: 'white_wins',
			}),
		).not.toThrow();

		expect(() => challengeDisagreeResult(challenge, { by: uE })).toThrow();
		expect(() => challengeDisagreeResult(challenge, { by: uF })).toThrow();
	});

	test('Only the challenge players can set a result - sender', () => {
		const challenge = challengeSendNew(
			'sample',
			uE,
			uF,
			Blitz,
			Blitz5p3,
			toDateFull('2025-01-10..20:38:31:000'),
		);

		challengeAccept(challenge, {
			by: uF,
			when: toDateFull('2025-01-10..20:38:32:000'),
		});

		expect(() =>
			challengeSetResult(challenge, {
				by: uC,
				when: toDateFull('2025-01-10..20:38:33:000'),
				white: uE.username,
				black: uF.username,
				result: 'white_wins',
			}),
		).toThrow();

		expect(() =>
			challengeSetResult(challenge, {
				by: uE,
				when: toDateFull('2025-01-10..20:38:34:000'),
				white: uE.username,
				black: uF.username,
				result: 'white_wins',
			}),
		).not.toThrow();
	});

	test('Only the challenge players can set a result - receiver', () => {
		const challenge = challengeSendNew(
			'sample',
			uE,
			uF,
			Blitz,
			Blitz5p3,
			toDateFull('2025-01-10..20:38:35:000'),
		);

		challengeAccept(challenge, {
			by: uF,
			when: toDateFull('2025-01-10..20:38:36:000'),
		});

		expect(() =>
			challengeSetResult(challenge, {
				by: uD,
				when: toDateFull('2025-01-10..20:38:37:000'),
				white: uE.username,
				black: uF.username,
				result: 'white_wins',
			}),
		).toThrow();

		expect(() =>
			challengeSetResult(challenge, {
				by: uF,
				when: toDateFull('2025-01-10..20:38:38:000'),
				white: uE.username,
				black: uF.username,
				result: 'white_wins',
			}),
		).not.toThrow();
	});

	test('A referee can set a student-member challenge result', () => {
		const challenge = challengeSendNew(
			'sample',
			uE,
			uC,
			Blitz,
			Blitz5p3,
			toDateFull('2025-01-10..20:39:05:000'),
		);

		challengeAccept(challenge, {
			by: uC,
			when: toDateFull('2025-01-10..20:39:06:000'),
		});

		expect(() =>
			challengeSetResult(challenge, {
				by: uA,
				when: toDateFull('2025-01-10..20:39:07:000'),
				white: uE.username,
				black: uC.username,
				result: 'white_wins',
			}),
		).not.toThrow();
	});

	test('A referee cannot set a result for a member challenge', () => {
		const challenge = challengeSendNew(
			'sample',
			uC,
			uD,
			Blitz,
			Blitz5p3,
			toDateFull('2025-01-10..20:38:53:000'),
		);

		challengeAccept(challenge, {
			by: uD,
			when: toDateFull('2025-01-10..20:38:54:000'),
		});

		expect(() =>
			challengeSetResult(challenge, {
				by: uA,
				when: toDateFull('2025-01-10..20:38:55:000'),
				white: uC.username,
				black: uD.username,
				result: 'white_wins',
			}),
		).toThrow();
	});

	// accepting a result

	test('Only the other player can accept a sender-set result', () => {
		const challenge = challengeSendNew(
			'sample',
			uE,
			uF,
			Blitz,
			Blitz5p3,
			toDateFull('2025-01-10..20:38:39:000'),
		);

		challengeAccept(challenge, {
			by: uF,
			when: toDateFull('2025-01-10..20:38:40:000'),
		});
		challengeSetResult(challenge, {
			by: uE,
			when: toDateFull('2025-01-10..20:38:41:000'),
			white: uE.username,
			black: uF.username,
			result: 'white_wins',
		});

		expect(() =>
			challengeAgreeResult(challenge, {
				by: uC,
				when: toDateFull('2025-01-10..20:38:42:000'),
			}),
		).toThrow();
		expect(() =>
			challengeAgreeResult(challenge, {
				by: uE,
				when: toDateFull('2025-01-10..20:38:42:000'),
			}),
		).toThrow();
		expect(() =>
			challengeAgreeResult(challenge, {
				by: uF,
				when: toDateFull('2025-01-10..20:38:43:000'),
			}),
		).not.toThrow();
	});

	test('Only the other player can accept a receiver-set result', () => {
		const challenge = challengeSendNew(
			'sample',
			uE,
			uF,
			Blitz,
			Blitz5p3,
			toDateFull('2025-01-10..20:38:44:000'),
		);

		challengeAccept(challenge, {
			by: uF,
			when: toDateFull('2025-01-10..20:38:45:000'),
		});
		challengeSetResult(challenge, {
			by: uF,
			when: toDateFull('2025-01-10..20:38:46:000'),
			white: uE.username,
			black: uF.username,
			result: 'white_wins',
		});

		expect(() =>
			challengeAgreeResult(challenge, {
				by: uD,
				when: toDateFull('2025-01-10..20:38:47:000'),
			}),
		).toThrow();
		expect(() =>
			challengeAgreeResult(challenge, {
				by: uF,
				when: toDateFull('2025-01-10..20:38:47:000'),
			}),
		).toThrow();
		expect(() =>
			challengeAgreeResult(challenge, {
				by: uE,
				when: toDateFull('2025-01-10..20:38:48:000'),
			}),
		).not.toThrow();
	});

	test('A referee can forcefully accept a player-set result', () => {
		const challenge = challengeSendNew(
			'sample',
			uE,
			uF,
			Blitz,
			Blitz5p3,
			toDateFull('2025-01-10..20:38:49:000'),
		);

		challengeAccept(challenge, {
			by: uF,
			when: toDateFull('2025-01-10..20:38:50:000'),
		});
		challengeSetResult(challenge, {
			by: uF,
			when: toDateFull('2025-01-10..20:38:51:000'),
			white: uE.username,
			black: uF.username,
			result: 'white_wins',
		});

		expect(() =>
			challengeAgreeResult(challenge, {
				by: uA,
				when: toDateFull('2025-01-10..20:38:52:000'),
			}),
		).not.toThrow();
		expect(challenge.resultAcceptedBy).toEqual(uA.username);
	});

	test('A referee cannot accept a member player result', () => {
		const challenge = challengeSendNew(
			'sample',
			uC,
			uD,
			Blitz,
			Blitz5p3,
			toDateFull('2025-01-10..20:38:56:000'),
		);

		challengeAccept(challenge, {
			by: uD,
			when: toDateFull('2025-01-10..20:38:57:000'),
		});
		challengeSetResult(challenge, {
			by: uC,
			when: toDateFull('2025-01-10..20:38:58:000'),
			white: uC.username,
			black: uD.username,
			result: 'white_wins',
		});

		expect(() =>
			challengeAgreeResult(challenge, {
				by: uA,
				when: toDateFull('2025-01-10..20:38:59:000'),
			}),
		).toThrow();
	});

	test('A referee can accept a student-member result', () => {
		const challenge = challengeSendNew(
			'sample',
			uE,
			uC,
			Blitz,
			Blitz5p3,
			toDateFull('2025-01-10..20:39:08:000'),
		);

		challengeAccept(challenge, {
			by: uC,
			when: toDateFull('2025-01-10..20:39:09:000'),
		});
		challengeSetResult(challenge, {
			by: uE,
			when: toDateFull('2025-01-10..20:39:10:000'),
			white: uE.username,
			black: uC.username,
			result: 'white_wins',
		});

		expect(() =>
			challengeAgreeResult(challenge, {
				by: uA,
				when: toDateFull('2025-01-10..20:39:11:000'),
			}),
		).not.toThrow();
	});

	// disagreeing to a result

	test('The result setter cannot disagree, but the other player can', () => {
		const challenge = challengeSendNew(
			'sample',
			uE,
			uF,
			Blitz,
			Blitz5p3,
			toDateFull('2025-01-10..20:38:25:000'),
		);

		challengeAccept(challenge, {
			by: uF,
			when: toDateFull('2025-01-10..20:38:26:000'),
		});

		expect(() =>
			challengeSetResult(challenge, {
				by: uF,
				when: toDateFull('2025-01-10..20:38:27:000'),
				white: uE.username,
				black: uF.username,
				result: 'white_wins',
			}),
		).not.toThrow();

		expect(() => challengeDisagreeResult(challenge, { by: uF })).toThrow();
		expect(() => challengeDisagreeResult(challenge, { by: uE })).not.toThrow();
		expect(challenge.state).toBe('PENDING_RESULT');
	});

	test('A referee can disagree with a player-set result', () => {
		const challenge = challengeSendNew(
			'sample',
			uE,
			uF,
			Blitz,
			Blitz5p3,
			toDateFull('2025-01-10..20:38:28:000'),
		);

		challengeAccept(challenge, {
			by: uF,
			when: toDateFull('2025-01-10..20:38:29:000'),
		});

		expect(() =>
			challengeSetResult(challenge, {
				by: uF,
				when: toDateFull('2025-01-10..20:38:30:000'),
				white: uE.username,
				black: uF.username,
				result: 'white_wins',
			}),
		).not.toThrow();

		expect(() => challengeDisagreeResult(challenge, { by: uF })).toThrow();
		expect(() => challengeDisagreeResult(challenge, { by: uA })).not.toThrow();
		expect(challenge.state).toBe('PENDING_RESULT');
	});

	test('A referee cannot disagree with a member player result', () => {
		const challenge = challengeSendNew(
			'sample',
			uC,
			uD,
			Blitz,
			Blitz5p3,
			toDateFull('2025-01-10..20:39:00:000'),
		);

		challengeAccept(challenge, {
			by: uD,
			when: toDateFull('2025-01-10..20:39:01:000'),
		});
		challengeSetResult(challenge, {
			by: uC,
			when: toDateFull('2025-01-10..20:39:02:000'),
			white: uC.username,
			black: uD.username,
			result: 'white_wins',
		});

		expect(() => challengeDisagreeResult(challenge, { by: uA })).toThrow();
	});

	test('A referee can disagree with a student-member result', () => {
		const challenge = challengeSendNew(
			'sample',
			uE,
			uC,
			Blitz,
			Blitz5p3,
			toDateFull('2025-01-10..20:39:12:000'),
		);

		challengeAccept(challenge, {
			by: uC,
			when: toDateFull('2025-01-10..20:39:13:000'),
		});
		challengeSetResult(challenge, {
			by: uE,
			when: toDateFull('2025-01-10..20:39:14:000'),
			white: uE.username,
			black: uC.username,
			result: 'white_wins',
		});

		expect(() => challengeDisagreeResult(challenge, { by: uA })).not.toThrow();
	});
});
