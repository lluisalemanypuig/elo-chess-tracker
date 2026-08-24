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

import { toPlayerPrivateId } from '@common/models/player-id';
import { SessionId } from '@common/models/session-id';
import { toTimeControlId, toTimeControlName } from '@common/models/time-control';
import { toUserGivenName } from '@common/models/user-given-name';
import { isNotDefined } from '@common/utils/is-defined';
import { clearServer } from '@server/managers/memory/clear';
import { serverInitFromData } from '@server/managers/memory/initialization';
import { isUserLoggedIn, sessionIdAdd, sessionIdDelete, sessionUserDeleteAll } from '@server/managers/session';
import { SessionIDManager } from '@server/managers/session-id-manager';
import { userAddNew } from '@server/managers/users';
import { UsersManager } from '@server/managers/users-manager';
import { Configuration } from '@server/models/configuration/configuration';
import { runCommand, TestError } from '@tests';

const Classical = toTimeControlId('Classical');
const Classical90p30 = toTimeControlName('Classical (90 + 30)');

const Rapid = toTimeControlId('Rapid');
const Rapid12p5 = toTimeControlName('Rapid (12 + 5)');
const Rapid10p0 = toTimeControlName('Rapid (10 + 0)');

const Blitz = toTimeControlId('Blitz');
const Blitz5p3 = toTimeControlName('Blitz (5 + 3)');

const configuration: Configuration = {
	environment: {
		sslCertificate: {
			publicKeyFile: 'sadf',
			privateKeyFile: 'qwer',
			passphraseFile: 'kgj68',
		},
		favicon: 'favicon.png',
		loginPage: {
			title: 'Login title',
			icon: 'login.png',
		},
		homePage: {
			title: 'Home title',
			icon: 'home.png',
		},
	},
	server: {
		domainName: '',
		ports: {
			http: '8080',
			https: '8443',
		},
	},
	ratingSystem: 'Elo',
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
	behavior: {
		challenges: {
			higherRatedPlayerCanDeclineChallengeFromLowerRatedPlayer: false,
		},
	},
	permissions: {
		admin: [
			'CREATE_USER',
			'ASSIGN_ROLE',
			'ASSIGN_ROLE_ADMIN',
			'ASSIGN_ROLE_TEACHER',
			'ASSIGN_ROLE_MEMBER',
			'ASSIGN_ROLE_STUDENT',
			'CHALLENGE_USER',
			'CHALLENGE_USER_ADMIN',
			'CHALLENGE_USER_MEMBER',
			'CHALLENGE_USER_TEACHER',
			'CHALLENGE_USER_STUDENT',
		],
		teacher: [
			'CHALLENGE_USER',
			'CHALLENGE_USER_ADMIN',
			'CHALLENGE_USER_MEMBER',
			'CHALLENGE_USER_TEACHER',
			'CHALLENGE_USER_STUDENT',
		],
		member: [
			'CHALLENGE_USER',
			'CHALLENGE_USER_ADMIN',
			'CHALLENGE_USER_MEMBER',
			'CHALLENGE_USER_TEACHER',
			'CHALLENGE_USER_STUDENT',
		],
		student: [
			'CHALLENGE_USER',
			'CHALLENGE_USER_ADMIN',
			'CHALLENGE_USER_MEMBER',
			'CHALLENGE_USER_TEACHER',
			'CHALLENGE_USER_STUDENT',
		],
	},
};

const aa = toPlayerPrivateId('aa');
const bb = toPlayerPrivateId('bb');
const cc = toPlayerPrivateId('cc');
const dd = toPlayerPrivateId('dd');
const ee = toPlayerPrivateId('ee');
const ff = toPlayerPrivateId('ff');

const A = toUserGivenName('A');
const B = toUserGivenName('B');
const C = toUserGivenName('C');
const D = toUserGivenName('D');
const E = toUserGivenName('E');
const F = toUserGivenName('F');

const a = toUserGivenName('a');
const b = toUserGivenName('b');
const c = toUserGivenName('c');
const d = toUserGivenName('d');
const e = toUserGivenName('e');
const f = toUserGivenName('f');

describe('Session management via functions', () => {
	test('Load an empty server', async () => {
		await runCommand('./tests/initialize-empty.sh');
		clearServer();
		expect(() => serverInitFromData('tests/webpage', configuration)).not.toThrow();

		const admin = UsersManager.getInstance().getAllUserDataByPrivateId(toPlayerPrivateId('admin.default'));
		if (isNotDefined(admin)) {
			throw new TestError('admin default user could not be retrieved');
		}

		userAddNew(admin.user, { username: aa, firstName: A, lastName: a, password: 'pass_a', roles: ['ADMIN'] });
		userAddNew(admin.user, { username: bb, firstName: B, lastName: b, password: 'pass_b', roles: ['MEMBER'] });
		userAddNew(admin.user, { username: cc, firstName: C, lastName: c, password: 'pass_c', roles: ['MEMBER'] });
		userAddNew(admin.user, {
			username: dd,
			firstName: D,
			lastName: d,
			password: 'pass_d',
			roles: ['STUDENT'],
		});
		userAddNew(admin.user, {
			username: ee,
			firstName: E,
			lastName: e,
			password: 'pass_e',
			roles: ['STUDENT'],
		});
		userAddNew(admin.user, {
			username: ff,
			firstName: F,
			lastName: f,
			password: 'pass_f',
			roles: ['STUDENT'],
		});
	});

	let session_aa_1: SessionId;
	let session_aa_2: SessionId;
	let session_bb_1: SessionId;
	let session_bb_2: SessionId;
	let session_cc_1: SessionId;
	let session_cc_2: SessionId;
	let session_dd_1: SessionId;
	let session_dd_2: SessionId;
	let session_ee_1: SessionId;
	let session_ee_2: SessionId;
	let session_ff_1: SessionId;
	let session_ff_2: SessionId;

	test('Add a few sessions', () => {
		const manager = SessionIDManager.getInstance();

		session_aa_1 = sessionIdAdd(aa);
		{
			const log = isUserLoggedIn(session_aa_1);
			expect(log[0]).toBe(true);
			expect(log[2]?.username).toBe('aa');
		}
		expect(manager.numSessionIds()).toBe(1);

		session_bb_1 = sessionIdAdd(bb);
		{
			const log = isUserLoggedIn(session_aa_1);
			expect(log[0]).toBe(true);
			expect(log[2]?.username).toBe('aa');
		}
		{
			const log = isUserLoggedIn(session_bb_1);
			expect(log[0]).toBe(true);
			expect(log[2]?.username).toBe('bb');
		}
		expect(manager.numSessionIds()).toBe(2);

		session_cc_1 = sessionIdAdd(cc);
		{
			const log = isUserLoggedIn(session_aa_1);
			expect(log[0]).toBe(true);
			expect(log[2]?.username).toBe('aa');
		}
		{
			const log = isUserLoggedIn(session_bb_1);
			expect(log[0]).toBe(true);
			expect(log[2]?.username).toBe('bb');
		}
		{
			const log = isUserLoggedIn(session_cc_1);
			expect(log[0]).toBe(true);
			expect(log[2]?.username).toBe('cc');
		}
		expect(manager.numSessionIds()).toBe(3);

		session_dd_1 = sessionIdAdd(dd);
		{
			const log = isUserLoggedIn(session_aa_1);
			expect(log[0]).toBe(true);
			expect(log[2]?.username).toBe('aa');
		}
		{
			const log = isUserLoggedIn(session_bb_1);
			expect(log[0]).toBe(true);
			expect(log[2]?.username).toBe('bb');
		}
		{
			const log = isUserLoggedIn(session_cc_1);
			expect(log[0]).toBe(true);
			expect(log[2]?.username).toBe('cc');
		}
		{
			const log = isUserLoggedIn(session_dd_1);
			expect(log[0]).toBe(true);
			expect(log[2]?.username).toBe('dd');
		}
		expect(manager.numSessionIds()).toBe(4);

		session_ee_1 = sessionIdAdd(ee);
		{
			const log = isUserLoggedIn(session_aa_1);
			expect(log[0]).toBe(true);
			expect(log[2]?.username).toBe('aa');
		}
		{
			const log = isUserLoggedIn(session_bb_1);
			expect(log[0]).toBe(true);
			expect(log[2]?.username).toBe('bb');
		}
		{
			const log = isUserLoggedIn(session_cc_1);
			expect(log[0]).toBe(true);
			expect(log[2]?.username).toBe('cc');
		}
		{
			const log = isUserLoggedIn(session_dd_1);
			expect(log[0]).toBe(true);
			expect(log[2]?.username).toBe('dd');
		}
		{
			const log = isUserLoggedIn(session_ee_1);
			expect(log[0]).toBe(true);
			expect(log[2]?.username).toBe('ee');
		}
		expect(manager.numSessionIds()).toBe(5);

		session_ff_1 = sessionIdAdd(ff);
		{
			const log = isUserLoggedIn(session_aa_1);
			expect(log[0]).toBe(true);
			expect(log[2]?.username).toBe('aa');
		}
		{
			const log = isUserLoggedIn(session_bb_1);
			expect(log[0]).toBe(true);
			expect(log[2]?.username).toBe('bb');
		}
		{
			const log = isUserLoggedIn(session_cc_1);
			expect(log[0]).toBe(true);
			expect(log[2]?.username).toBe('cc');
		}
		{
			const log = isUserLoggedIn(session_dd_1);
			expect(log[0]).toBe(true);
			expect(log[2]?.username).toBe('dd');
		}
		{
			const log = isUserLoggedIn(session_ee_1);
			expect(log[0]).toBe(true);
			expect(log[2]?.username).toBe('ee');
		}
		{
			const log = isUserLoggedIn(session_ff_1);
			expect(log[0]).toBe(true);
			expect(log[2]?.username).toBe('ff');
		}
		expect(manager.numSessionIds()).toBe(6);
	});

	test('Add repeated sessions', () => {
		const manager = SessionIDManager.getInstance();

		session_aa_2 = sessionIdAdd(aa);
		{
			const log = isUserLoggedIn(session_aa_1);
			expect(log[0]).toBe(true);
			expect(log[2]?.username).toBe('aa');
		}
		{
			const log = isUserLoggedIn(session_bb_1);
			expect(log[0]).toBe(true);
			expect(log[2]?.username).toBe('bb');
		}
		{
			const log = isUserLoggedIn(session_cc_1);
			expect(log[0]).toBe(true);
			expect(log[2]?.username).toBe('cc');
		}
		{
			const log = isUserLoggedIn(session_dd_1);
			expect(log[0]).toBe(true);
			expect(log[2]?.username).toBe('dd');
		}
		{
			const log = isUserLoggedIn(session_ee_1);
			expect(log[0]).toBe(true);
			expect(log[2]?.username).toBe('ee');
		}
		{
			const log = isUserLoggedIn(session_ff_1);
			expect(log[0]).toBe(true);
			expect(log[2]?.username).toBe('ff');
		}
		{
			const log = isUserLoggedIn(session_aa_2);
			expect(log[0]).toBe(true);
			expect(log[2]?.username).toBe('aa');
		}
		expect(manager.numSessionIds()).toBe(7);

		session_bb_2 = sessionIdAdd(bb);
		{
			const log = isUserLoggedIn(session_aa_1);
			expect(log[0]).toBe(true);
			expect(log[2]?.username).toBe('aa');
		}
		{
			const log = isUserLoggedIn(session_bb_1);
			expect(log[0]).toBe(true);
			expect(log[2]?.username).toBe('bb');
		}
		{
			const log = isUserLoggedIn(session_cc_1);
			expect(log[0]).toBe(true);
			expect(log[2]?.username).toBe('cc');
		}
		{
			const log = isUserLoggedIn(session_dd_1);
			expect(log[0]).toBe(true);
			expect(log[2]?.username).toBe('dd');
		}
		{
			const log = isUserLoggedIn(session_ee_1);
			expect(log[0]).toBe(true);
			expect(log[2]?.username).toBe('ee');
		}
		{
			const log = isUserLoggedIn(session_ff_1);
			expect(log[0]).toBe(true);
			expect(log[2]?.username).toBe('ff');
		}
		{
			const log = isUserLoggedIn(session_aa_2);
			expect(log[0]).toBe(true);
			expect(log[2]?.username).toBe('aa');
		}
		{
			const log = isUserLoggedIn(session_bb_2);
			expect(log[0]).toBe(true);
			expect(log[2]?.username).toBe('bb');
		}
		expect(manager.numSessionIds()).toBe(8);

		session_cc_2 = sessionIdAdd(cc);
		{
			const log = isUserLoggedIn(session_aa_1);
			expect(log[0]).toBe(true);
			expect(log[2]?.username).toBe('aa');
		}
		{
			const log = isUserLoggedIn(session_bb_1);
			expect(log[0]).toBe(true);
			expect(log[2]?.username).toBe('bb');
		}
		{
			const log = isUserLoggedIn(session_cc_1);
			expect(log[0]).toBe(true);
			expect(log[2]?.username).toBe('cc');
		}
		{
			const log = isUserLoggedIn(session_dd_1);
			expect(log[0]).toBe(true);
			expect(log[2]?.username).toBe('dd');
		}
		{
			const log = isUserLoggedIn(session_ee_1);
			expect(log[0]).toBe(true);
			expect(log[2]?.username).toBe('ee');
		}
		{
			const log = isUserLoggedIn(session_ff_1);
			expect(log[0]).toBe(true);
			expect(log[2]?.username).toBe('ff');
		}
		{
			const log = isUserLoggedIn(session_aa_2);
			expect(log[0]).toBe(true);
			expect(log[2]?.username).toBe('aa');
		}
		{
			const log = isUserLoggedIn(session_bb_2);
			expect(log[0]).toBe(true);
			expect(log[2]?.username).toBe('bb');
		}
		{
			const log = isUserLoggedIn(session_cc_2);
			expect(log[0]).toBe(true);
			expect(log[2]?.username).toBe('cc');
		}
		expect(manager.numSessionIds()).toBe(9);

		session_dd_2 = sessionIdAdd(dd);
		{
			const log = isUserLoggedIn(session_aa_1);
			expect(log[0]).toBe(true);
			expect(log[2]?.username).toBe('aa');
		}
		{
			const log = isUserLoggedIn(session_bb_1);
			expect(log[0]).toBe(true);
			expect(log[2]?.username).toBe('bb');
		}
		{
			const log = isUserLoggedIn(session_cc_1);
			expect(log[0]).toBe(true);
			expect(log[2]?.username).toBe('cc');
		}
		{
			const log = isUserLoggedIn(session_dd_1);
			expect(log[0]).toBe(true);
			expect(log[2]?.username).toBe('dd');
		}
		{
			const log = isUserLoggedIn(session_ee_1);
			expect(log[0]).toBe(true);
			expect(log[2]?.username).toBe('ee');
		}
		{
			const log = isUserLoggedIn(session_ff_1);
			expect(log[0]).toBe(true);
			expect(log[2]?.username).toBe('ff');
		}
		{
			const log = isUserLoggedIn(session_aa_2);
			expect(log[0]).toBe(true);
			expect(log[2]?.username).toBe('aa');
		}
		{
			const log = isUserLoggedIn(session_bb_2);
			expect(log[0]).toBe(true);
			expect(log[2]?.username).toBe('bb');
		}
		{
			const log = isUserLoggedIn(session_cc_2);
			expect(log[0]).toBe(true);
			expect(log[2]?.username).toBe('cc');
		}
		{
			const log = isUserLoggedIn(session_dd_2);
			expect(log[0]).toBe(true);
			expect(log[2]?.username).toBe('dd');
		}
		expect(manager.numSessionIds()).toBe(10);

		session_ee_2 = sessionIdAdd(ee);
		{
			const log = isUserLoggedIn(session_aa_1);
			expect(log[0]).toBe(true);
			expect(log[2]?.username).toBe('aa');
		}
		{
			const log = isUserLoggedIn(session_bb_1);
			expect(log[0]).toBe(true);
			expect(log[2]?.username).toBe('bb');
		}
		{
			const log = isUserLoggedIn(session_cc_1);
			expect(log[0]).toBe(true);
			expect(log[2]?.username).toBe('cc');
		}
		{
			const log = isUserLoggedIn(session_dd_1);
			expect(log[0]).toBe(true);
			expect(log[2]?.username).toBe('dd');
		}
		{
			const log = isUserLoggedIn(session_ee_1);
			expect(log[0]).toBe(true);
			expect(log[2]?.username).toBe('ee');
		}
		{
			const log = isUserLoggedIn(session_ff_1);
			expect(log[0]).toBe(true);
			expect(log[2]?.username).toBe('ff');
		}
		{
			const log = isUserLoggedIn(session_aa_2);
			expect(log[0]).toBe(true);
			expect(log[2]?.username).toBe('aa');
		}
		{
			const log = isUserLoggedIn(session_bb_2);
			expect(log[0]).toBe(true);
			expect(log[2]?.username).toBe('bb');
		}
		{
			const log = isUserLoggedIn(session_cc_2);
			expect(log[0]).toBe(true);
			expect(log[2]?.username).toBe('cc');
		}
		{
			const log = isUserLoggedIn(session_dd_2);
			expect(log[0]).toBe(true);
			expect(log[2]?.username).toBe('dd');
		}
		{
			const log = isUserLoggedIn(session_ee_2);
			expect(log[0]).toBe(true);
			expect(log[2]?.username).toBe('ee');
		}
		expect(manager.numSessionIds()).toBe(11);

		session_ff_2 = sessionIdAdd(ff);
		{
			const log = isUserLoggedIn(session_aa_1);
			expect(log[0]).toBe(true);
			expect(log[2]?.username).toBe('aa');
		}
		{
			const log = isUserLoggedIn(session_bb_1);
			expect(log[0]).toBe(true);
			expect(log[2]?.username).toBe('bb');
		}
		{
			const log = isUserLoggedIn(session_cc_1);
			expect(log[0]).toBe(true);
			expect(log[2]?.username).toBe('cc');
		}
		{
			const log = isUserLoggedIn(session_dd_1);
			expect(log[0]).toBe(true);
			expect(log[2]?.username).toBe('dd');
		}
		{
			const log = isUserLoggedIn(session_ee_1);
			expect(log[0]).toBe(true);
			expect(log[2]?.username).toBe('ee');
		}
		{
			const log = isUserLoggedIn(session_ff_1);
			expect(log[0]).toBe(true);
			expect(log[2]?.username).toBe('ff');
		}
		{
			const log = isUserLoggedIn(session_aa_2);
			expect(log[0]).toBe(true);
			expect(log[2]?.username).toBe('aa');
		}
		{
			const log = isUserLoggedIn(session_bb_2);
			expect(log[0]).toBe(true);
			expect(log[2]?.username).toBe('bb');
		}
		{
			const log = isUserLoggedIn(session_cc_2);
			expect(log[0]).toBe(true);
			expect(log[2]?.username).toBe('cc');
		}
		{
			const log = isUserLoggedIn(session_dd_2);
			expect(log[0]).toBe(true);
			expect(log[2]?.username).toBe('dd');
		}
		{
			const log = isUserLoggedIn(session_ee_2);
			expect(log[0]).toBe(true);
			expect(log[2]?.username).toBe('ee');
		}
		{
			const log = isUserLoggedIn(session_ff_2);
			expect(log[0]).toBe(true);
			expect(log[2]?.username).toBe('ff');
		}
		expect(manager.numSessionIds()).toBe(12);
	});

	test('A user logs out of a device', () => {
		const manager = SessionIDManager.getInstance();

		sessionIdDelete(session_aa_1);
		{
			const log = isUserLoggedIn(session_aa_1);
			expect(log[0]).toBe(false);
			expect(log[1]).toBe('Forbidden access. <a href="/">Go home</a>.');
			expect(log[2]).toBe(undefined);
		}
		{
			const log = isUserLoggedIn(session_bb_1);
			expect(log[0]).toBe(true);
			expect(log[2]?.username).toBe('bb');
		}
		{
			const log = isUserLoggedIn(session_cc_1);
			expect(log[0]).toBe(true);
			expect(log[2]?.username).toBe('cc');
		}
		{
			const log = isUserLoggedIn(session_dd_1);
			expect(log[0]).toBe(true);
			expect(log[2]?.username).toBe('dd');
		}
		{
			const log = isUserLoggedIn(session_ee_1);
			expect(log[0]).toBe(true);
			expect(log[2]?.username).toBe('ee');
		}
		{
			const log = isUserLoggedIn(session_ff_1);
			expect(log[0]).toBe(true);
			expect(log[2]?.username).toBe('ff');
		}
		{
			const log = isUserLoggedIn(session_aa_2);
			expect(log[0]).toBe(true);
			expect(log[2]?.username).toBe('aa');
		}
		{
			const log = isUserLoggedIn(session_bb_2);
			expect(log[0]).toBe(true);
			expect(log[2]?.username).toBe('bb');
		}
		{
			const log = isUserLoggedIn(session_cc_2);
			expect(log[0]).toBe(true);
			expect(log[2]?.username).toBe('cc');
		}
		{
			const log = isUserLoggedIn(session_dd_2);
			expect(log[0]).toBe(true);
			expect(log[2]?.username).toBe('dd');
		}
		{
			const log = isUserLoggedIn(session_ee_2);
			expect(log[0]).toBe(true);
			expect(log[2]?.username).toBe('ee');
		}
		{
			const log = isUserLoggedIn(session_ff_2);
			expect(log[0]).toBe(true);
			expect(log[2]?.username).toBe('ff');
		}
		expect(manager.numSessionIds()).toBe(11);

		sessionIdDelete(session_ff_1);
		{
			const log = isUserLoggedIn(session_aa_1);
			expect(log[0]).toBe(false);
			expect(log[1]).toBe('Forbidden access. <a href="/">Go home</a>.');
			expect(log[2]).toBe(undefined);
		}
		{
			const log = isUserLoggedIn(session_bb_1);
			expect(log[0]).toBe(true);
			expect(log[2]?.username).toBe('bb');
		}
		{
			const log = isUserLoggedIn(session_cc_1);
			expect(log[0]).toBe(true);
			expect(log[2]?.username).toBe('cc');
		}
		{
			const log = isUserLoggedIn(session_dd_1);
			expect(log[0]).toBe(true);
			expect(log[2]?.username).toBe('dd');
		}
		{
			const log = isUserLoggedIn(session_ee_1);
			expect(log[0]).toBe(true);
			expect(log[2]?.username).toBe('ee');
		}
		{
			const log = isUserLoggedIn(session_ff_1);
			expect(log[0]).toBe(false);
			expect(log[1]).toBe('Forbidden access. <a href="/">Go home</a>.');
			expect(log[2]).toBe(undefined);
		}
		{
			const log = isUserLoggedIn(session_aa_2);
			expect(log[0]).toBe(true);
			expect(log[2]?.username).toBe('aa');
		}
		{
			const log = isUserLoggedIn(session_bb_2);
			expect(log[0]).toBe(true);
			expect(log[2]?.username).toBe('bb');
		}
		{
			const log = isUserLoggedIn(session_cc_2);
			expect(log[0]).toBe(true);
			expect(log[2]?.username).toBe('cc');
		}
		{
			const log = isUserLoggedIn(session_dd_2);
			expect(log[0]).toBe(true);
			expect(log[2]?.username).toBe('dd');
		}
		{
			const log = isUserLoggedIn(session_ee_2);
			expect(log[0]).toBe(true);
			expect(log[2]?.username).toBe('ee');
		}
		{
			const log = isUserLoggedIn(session_ff_2);
			expect(log[0]).toBe(true);
			expect(log[2]?.username).toBe('ff');
		}
		expect(manager.numSessionIds()).toBe(10);

		sessionIdDelete(session_ee_1);
		{
			const log = isUserLoggedIn(session_aa_1);
			expect(log[0]).toBe(false);
			expect(log[1]).toBe('Forbidden access. <a href="/">Go home</a>.');
			expect(log[2]).toBe(undefined);
		}
		{
			const log = isUserLoggedIn(session_bb_1);
			expect(log[0]).toBe(true);
			expect(log[2]?.username).toBe('bb');
		}
		{
			const log = isUserLoggedIn(session_cc_1);
			expect(log[0]).toBe(true);
			expect(log[2]?.username).toBe('cc');
		}
		{
			const log = isUserLoggedIn(session_dd_1);
			expect(log[0]).toBe(true);
			expect(log[2]?.username).toBe('dd');
		}
		{
			const log = isUserLoggedIn(session_ee_1);
			expect(log[0]).toBe(false);
			expect(log[1]).toBe('Forbidden access. <a href="/">Go home</a>.');
			expect(log[2]).toBe(undefined);
		}
		{
			const log = isUserLoggedIn(session_ff_1);
			expect(log[0]).toBe(false);
			expect(log[1]).toBe('Forbidden access. <a href="/">Go home</a>.');
			expect(log[2]).toBe(undefined);
		}
		{
			const log = isUserLoggedIn(session_aa_2);
			expect(log[0]).toBe(true);
			expect(log[2]?.username).toBe('aa');
		}
		{
			const log = isUserLoggedIn(session_bb_2);
			expect(log[0]).toBe(true);
			expect(log[2]?.username).toBe('bb');
		}
		{
			const log = isUserLoggedIn(session_cc_2);
			expect(log[0]).toBe(true);
			expect(log[2]?.username).toBe('cc');
		}
		{
			const log = isUserLoggedIn(session_dd_2);
			expect(log[0]).toBe(true);
			expect(log[2]?.username).toBe('dd');
		}
		{
			const log = isUserLoggedIn(session_ee_2);
			expect(log[0]).toBe(true);
			expect(log[2]?.username).toBe('ee');
		}
		{
			const log = isUserLoggedIn(session_ff_2);
			expect(log[0]).toBe(true);
			expect(log[2]?.username).toBe('ff');
		}
		expect(manager.numSessionIds()).toBe(9);
	});

	test('A user has all its sessions deleted', () => {
		const manager = SessionIDManager.getInstance();

		sessionUserDeleteAll(session_aa_2);
		{
			const log = isUserLoggedIn(session_aa_1);
			expect(log[0]).toBe(false);
			expect(log[1]).toBe('Forbidden access. <a href="/">Go home</a>.');
			expect(log[2]).toBe(undefined);
		}
		{
			const log = isUserLoggedIn(session_bb_1);
			expect(log[0]).toBe(true);
			expect(log[2]?.username).toBe('bb');
		}
		{
			const log = isUserLoggedIn(session_cc_1);
			expect(log[0]).toBe(true);
			expect(log[2]?.username).toBe('cc');
		}
		{
			const log = isUserLoggedIn(session_dd_1);
			expect(log[0]).toBe(true);
			expect(log[2]?.username).toBe('dd');
		}
		{
			const log = isUserLoggedIn(session_ee_1);
			expect(log[0]).toBe(false);
			expect(log[1]).toBe('Forbidden access. <a href="/">Go home</a>.');
			expect(log[2]).toBe(undefined);
		}
		{
			const log = isUserLoggedIn(session_ff_1);
			expect(log[0]).toBe(false);
			expect(log[1]).toBe('Forbidden access. <a href="/">Go home</a>.');
			expect(log[2]).toBe(undefined);
		}
		{
			const log = isUserLoggedIn(session_aa_2);
			expect(log[0]).toBe(false);
			expect(log[1]).toBe('Forbidden access. <a href="/">Go home</a>.');
			expect(log[2]).toBe(undefined);
		}
		{
			const log = isUserLoggedIn(session_bb_2);
			expect(log[0]).toBe(true);
			expect(log[2]?.username).toBe('bb');
		}
		{
			const log = isUserLoggedIn(session_cc_2);
			expect(log[0]).toBe(true);
			expect(log[2]?.username).toBe('cc');
		}
		{
			const log = isUserLoggedIn(session_dd_2);
			expect(log[0]).toBe(true);
			expect(log[2]?.username).toBe('dd');
		}
		{
			const log = isUserLoggedIn(session_ee_2);
			expect(log[0]).toBe(true);
			expect(log[2]?.username).toBe('ee');
		}
		{
			const log = isUserLoggedIn(session_ff_2);
			expect(log[0]).toBe(true);
			expect(log[2]?.username).toBe('ff');
		}
		expect(manager.numSessionIds()).toBe(8);

		sessionUserDeleteAll(session_bb_2);
		{
			const log = isUserLoggedIn(session_aa_1);
			expect(log[0]).toBe(false);
			expect(log[1]).toBe('Forbidden access. <a href="/">Go home</a>.');
			expect(log[2]).toBe(undefined);
		}
		{
			const log = isUserLoggedIn(session_bb_1);
			expect(log[0]).toBe(false);
			expect(log[1]).toBe('Forbidden access. <a href="/">Go home</a>.');
			expect(log[2]).toBe(undefined);
		}
		{
			const log = isUserLoggedIn(session_cc_1);
			expect(log[0]).toBe(true);
			expect(log[2]?.username).toBe('cc');
		}
		{
			const log = isUserLoggedIn(session_dd_1);
			expect(log[0]).toBe(true);
			expect(log[2]?.username).toBe('dd');
		}
		{
			const log = isUserLoggedIn(session_ee_1);
			expect(log[0]).toBe(false);
			expect(log[1]).toBe('Forbidden access. <a href="/">Go home</a>.');
			expect(log[2]).toBe(undefined);
		}
		{
			const log = isUserLoggedIn(session_ff_1);
			expect(log[0]).toBe(false);
			expect(log[1]).toBe('Forbidden access. <a href="/">Go home</a>.');
			expect(log[2]).toBe(undefined);
		}
		{
			const log = isUserLoggedIn(session_aa_2);
			expect(log[0]).toBe(false);
			expect(log[1]).toBe('Forbidden access. <a href="/">Go home</a>.');
			expect(log[2]).toBe(undefined);
		}
		{
			const log = isUserLoggedIn(session_bb_2);
			expect(log[0]).toBe(false);
			expect(log[1]).toBe('Forbidden access. <a href="/">Go home</a>.');
			expect(log[2]).toBe(undefined);
		}
		{
			const log = isUserLoggedIn(session_cc_2);
			expect(log[0]).toBe(true);
			expect(log[2]?.username).toBe('cc');
		}
		{
			const log = isUserLoggedIn(session_dd_2);
			expect(log[0]).toBe(true);
			expect(log[2]?.username).toBe('dd');
		}
		{
			const log = isUserLoggedIn(session_ee_2);
			expect(log[0]).toBe(true);
			expect(log[2]?.username).toBe('ee');
		}
		{
			const log = isUserLoggedIn(session_ff_2);
			expect(log[0]).toBe(true);
			expect(log[2]?.username).toBe('ff');
		}
		expect(manager.numSessionIds()).toBe(6);

		sessionUserDeleteAll(session_cc_1);
		{
			const log = isUserLoggedIn(session_aa_1);
			expect(log[0]).toBe(false);
			expect(log[1]).toBe('Forbidden access. <a href="/">Go home</a>.');
			expect(log[2]).toBe(undefined);
		}
		{
			const log = isUserLoggedIn(session_bb_1);
			expect(log[0]).toBe(false);
			expect(log[1]).toBe('Forbidden access. <a href="/">Go home</a>.');
			expect(log[2]).toBe(undefined);
		}
		{
			const log = isUserLoggedIn(session_cc_1);
			expect(log[0]).toBe(false);
			expect(log[1]).toBe('Forbidden access. <a href="/">Go home</a>.');
			expect(log[2]).toBe(undefined);
		}
		{
			const log = isUserLoggedIn(session_dd_1);
			expect(log[0]).toBe(true);
			expect(log[2]?.username).toBe('dd');
		}
		{
			const log = isUserLoggedIn(session_ee_1);
			expect(log[0]).toBe(false);
			expect(log[1]).toBe('Forbidden access. <a href="/">Go home</a>.');
			expect(log[2]).toBe(undefined);
		}
		{
			const log = isUserLoggedIn(session_ff_1);
			expect(log[0]).toBe(false);
			expect(log[1]).toBe('Forbidden access. <a href="/">Go home</a>.');
			expect(log[2]).toBe(undefined);
		}
		{
			const log = isUserLoggedIn(session_aa_2);
			expect(log[0]).toBe(false);
			expect(log[1]).toBe('Forbidden access. <a href="/">Go home</a>.');
			expect(log[2]).toBe(undefined);
		}
		{
			const log = isUserLoggedIn(session_bb_2);
			expect(log[0]).toBe(false);
			expect(log[1]).toBe('Forbidden access. <a href="/">Go home</a>.');
			expect(log[2]).toBe(undefined);
		}
		{
			const log = isUserLoggedIn(session_cc_2);
			expect(log[0]).toBe(false);
			expect(log[1]).toBe('Forbidden access. <a href="/">Go home</a>.');
			expect(log[2]).toBe(undefined);
		}
		{
			const log = isUserLoggedIn(session_dd_2);
			expect(log[0]).toBe(true);
			expect(log[2]?.username).toBe('dd');
		}
		{
			const log = isUserLoggedIn(session_ee_2);
			expect(log[0]).toBe(true);
			expect(log[2]?.username).toBe('ee');
		}
		{
			const log = isUserLoggedIn(session_ff_2);
			expect(log[0]).toBe(true);
			expect(log[2]?.username).toBe('ff');
		}
		expect(manager.numSessionIds()).toBe(4);

		sessionUserDeleteAll(session_ff_1);
		{
			const log = isUserLoggedIn(session_aa_1);
			expect(log[0]).toBe(false);
			expect(log[1]).toBe('Forbidden access. <a href="/">Go home</a>.');
			expect(log[2]).toBe(undefined);
		}
		{
			const log = isUserLoggedIn(session_bb_1);
			expect(log[0]).toBe(false);
			expect(log[1]).toBe('Forbidden access. <a href="/">Go home</a>.');
			expect(log[2]).toBe(undefined);
		}
		{
			const log = isUserLoggedIn(session_cc_1);
			expect(log[0]).toBe(false);
			expect(log[1]).toBe('Forbidden access. <a href="/">Go home</a>.');
			expect(log[2]).toBe(undefined);
		}
		{
			const log = isUserLoggedIn(session_dd_1);
			expect(log[0]).toBe(true);
			expect(log[2]?.username).toBe('dd');
		}
		{
			const log = isUserLoggedIn(session_ee_1);
			expect(log[0]).toBe(false);
			expect(log[1]).toBe('Forbidden access. <a href="/">Go home</a>.');
			expect(log[2]).toBe(undefined);
		}
		{
			const log = isUserLoggedIn(session_ff_1);
			expect(log[0]).toBe(false);
			expect(log[1]).toBe('Forbidden access. <a href="/">Go home</a>.');
			expect(log[2]).toBe(undefined);
		}
		{
			const log = isUserLoggedIn(session_aa_2);
			expect(log[0]).toBe(false);
			expect(log[1]).toBe('Forbidden access. <a href="/">Go home</a>.');
			expect(log[2]).toBe(undefined);
		}
		{
			const log = isUserLoggedIn(session_bb_2);
			expect(log[0]).toBe(false);
			expect(log[1]).toBe('Forbidden access. <a href="/">Go home</a>.');
			expect(log[2]).toBe(undefined);
		}
		{
			const log = isUserLoggedIn(session_cc_2);
			expect(log[0]).toBe(false);
			expect(log[1]).toBe('Forbidden access. <a href="/">Go home</a>.');
			expect(log[2]).toBe(undefined);
		}
		{
			const log = isUserLoggedIn(session_dd_2);
			expect(log[0]).toBe(true);
			expect(log[2]?.username).toBe('dd');
		}
		{
			const log = isUserLoggedIn(session_ee_2);
			expect(log[0]).toBe(true);
			expect(log[2]?.username).toBe('ee');
		}
		{
			const log = isUserLoggedIn(session_ff_2);
			expect(log[0]).toBe(false);
			expect(log[1]).toBe('Forbidden access. <a href="/">Go home</a>.');
			expect(log[2]).toBe(undefined);
		}
		expect(manager.numSessionIds()).toBe(3);

		sessionUserDeleteAll(session_dd_2);
		{
			const log = isUserLoggedIn(session_aa_1);
			expect(log[0]).toBe(false);
			expect(log[1]).toBe('Forbidden access. <a href="/">Go home</a>.');
			expect(log[2]).toBe(undefined);
		}
		{
			const log = isUserLoggedIn(session_bb_1);
			expect(log[0]).toBe(false);
			expect(log[1]).toBe('Forbidden access. <a href="/">Go home</a>.');
			expect(log[2]).toBe(undefined);
		}
		{
			const log = isUserLoggedIn(session_cc_1);
			expect(log[0]).toBe(false);
			expect(log[1]).toBe('Forbidden access. <a href="/">Go home</a>.');
			expect(log[2]).toBe(undefined);
		}
		{
			const log = isUserLoggedIn(session_dd_1);
			expect(log[0]).toBe(false);
			expect(log[1]).toBe('Forbidden access. <a href="/">Go home</a>.');
			expect(log[2]).toBe(undefined);
		}
		{
			const log = isUserLoggedIn(session_ee_1);
			expect(log[0]).toBe(false);
			expect(log[1]).toBe('Forbidden access. <a href="/">Go home</a>.');
			expect(log[2]).toBe(undefined);
		}
		{
			const log = isUserLoggedIn(session_ff_1);
			expect(log[0]).toBe(false);
			expect(log[1]).toBe('Forbidden access. <a href="/">Go home</a>.');
			expect(log[2]).toBe(undefined);
		}
		{
			const log = isUserLoggedIn(session_aa_2);
			expect(log[0]).toBe(false);
			expect(log[1]).toBe('Forbidden access. <a href="/">Go home</a>.');
			expect(log[2]).toBe(undefined);
		}
		{
			const log = isUserLoggedIn(session_bb_2);
			expect(log[0]).toBe(false);
			expect(log[1]).toBe('Forbidden access. <a href="/">Go home</a>.');
			expect(log[2]).toBe(undefined);
		}
		{
			const log = isUserLoggedIn(session_cc_2);
			expect(log[0]).toBe(false);
			expect(log[1]).toBe('Forbidden access. <a href="/">Go home</a>.');
			expect(log[2]).toBe(undefined);
		}
		{
			const log = isUserLoggedIn(session_dd_2);
			expect(log[0]).toBe(false);
			expect(log[1]).toBe('Forbidden access. <a href="/">Go home</a>.');
			expect(log[2]).toBe(undefined);
		}
		{
			const log = isUserLoggedIn(session_ee_2);
			expect(log[0]).toBe(true);
			expect(log[2]?.username).toBe('ee');
		}
		{
			const log = isUserLoggedIn(session_ff_2);
			expect(log[0]).toBe(false);
			expect(log[1]).toBe('Forbidden access. <a href="/">Go home</a>.');
			expect(log[2]).toBe(undefined);
		}
		expect(manager.numSessionIds()).toBe(1);

		sessionUserDeleteAll(session_ee_2);
		{
			const log = isUserLoggedIn(session_aa_1);
			expect(log[0]).toBe(false);
			expect(log[1]).toBe('Forbidden access. <a href="/">Go home</a>.');
			expect(log[2]).toBe(undefined);
		}
		{
			const log = isUserLoggedIn(session_bb_1);
			expect(log[0]).toBe(false);
			expect(log[1]).toBe('Forbidden access. <a href="/">Go home</a>.');
			expect(log[2]).toBe(undefined);
		}
		{
			const log = isUserLoggedIn(session_cc_1);
			expect(log[0]).toBe(false);
			expect(log[1]).toBe('Forbidden access. <a href="/">Go home</a>.');
			expect(log[2]).toBe(undefined);
		}
		{
			const log = isUserLoggedIn(session_dd_1);
			expect(log[0]).toBe(false);
			expect(log[1]).toBe('Forbidden access. <a href="/">Go home</a>.');
			expect(log[2]).toBe(undefined);
		}
		{
			const log = isUserLoggedIn(session_ee_1);
			expect(log[0]).toBe(false);
			expect(log[1]).toBe('Forbidden access. <a href="/">Go home</a>.');
			expect(log[2]).toBe(undefined);
		}
		{
			const log = isUserLoggedIn(session_ff_1);
			expect(log[0]).toBe(false);
			expect(log[1]).toBe('Forbidden access. <a href="/">Go home</a>.');
			expect(log[2]).toBe(undefined);
		}
		{
			const log = isUserLoggedIn(session_aa_2);
			expect(log[0]).toBe(false);
			expect(log[1]).toBe('Forbidden access. <a href="/">Go home</a>.');
			expect(log[2]).toBe(undefined);
		}
		{
			const log = isUserLoggedIn(session_bb_2);
			expect(log[0]).toBe(false);
			expect(log[1]).toBe('Forbidden access. <a href="/">Go home</a>.');
			expect(log[2]).toBe(undefined);
		}
		{
			const log = isUserLoggedIn(session_cc_2);
			expect(log[0]).toBe(false);
			expect(log[1]).toBe('Forbidden access. <a href="/">Go home</a>.');
			expect(log[2]).toBe(undefined);
		}
		{
			const log = isUserLoggedIn(session_dd_2);
			expect(log[0]).toBe(false);
			expect(log[1]).toBe('Forbidden access. <a href="/">Go home</a>.');
			expect(log[2]).toBe(undefined);
		}
		{
			const log = isUserLoggedIn(session_ee_2);
			expect(log[0]).toBe(false);
			expect(log[1]).toBe('Forbidden access. <a href="/">Go home</a>.');
			expect(log[2]).toBe(undefined);
		}
		{
			const log = isUserLoggedIn(session_ff_2);
			expect(log[0]).toBe(false);
			expect(log[1]).toBe('Forbidden access. <a href="/">Go home</a>.');
			expect(log[2]).toBe(undefined);
		}
		expect(manager.numSessionIds()).toBe(0);
	});
});
