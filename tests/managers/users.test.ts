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
import { toTimeControlId, toTimeControlName } from '@common/models/time-control';
import { toUserGivenName } from '@common/models/user-given-name';
import { UserRole } from '@common/models/user-role';
import { UserThin } from '@common/models/user-thin';
import { isNotDefined } from '@common/utils/is-defined';
import { userFromString } from '@server/io/user';
import { clearServer } from '@server/managers/memory/clear';
import { serverInitFromData } from '@server/managers/memory/initialization';
import { userAddNew, userEdit, userGetAllNamePublicId, userUpdateFromPlayerData } from '@server/managers/users';
import { UsersManager } from '@server/managers/users-manager';
import { Configuration } from '@server/models/configuration/configuration';
import { Player } from '@server/models/player';
import { EloRating } from '@server/models/rating-framework/Elo/rating';
import { TimeControlRating } from '@server/models/time-control-rating';
import { User } from '@server/models/user';
import { runCommand, TestError } from '@tests';
import fs from 'fs';
import path from 'path';

const Classical = toTimeControlId('Classical');
const Classical90p30 = toTimeControlName('Classical (90 + 30)');

const Rapid = toTimeControlId('Rapid');
const Rapid12p5 = toTimeControlName('Rapid (12 + 5)');
const Rapid10p0 = toTimeControlName('Rapid (10 + 0)');

const Blitz = toTimeControlId('Blitz');
const Blitz5p3 = toTimeControlName('Blitz (5 + 3)');

const Bullet = toTimeControlId('Bullet');
const Bullet2p1 = toTimeControlName('Bullet (2 + 1)');

const webpage_dir = 'tests/webpage';
const db_dir = path.join(webpage_dir, 'database');
const db_users_dir = path.join(db_dir, 'users');

const classical_rapid_blitz: Configuration = {
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
			'EDIT_USER',
			'EDIT_USER_ADMIN',
			'EDIT_USER_TEACHER',
			'EDIT_USER_MEMBER',
			'EDIT_USER_STUDENT',
		],
		teacher: [],
		member: [],
		student: [],
	},
};

const classical_rapid_blitz_bullet: Configuration = {
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
		{
			id: Bullet,
			name: Bullet2p1,
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
			'EDIT_USER',
			'EDIT_USER_ADMIN',
			'EDIT_USER_TEACHER',
			'EDIT_USER_MEMBER',
			'EDIT_USER_STUDENT',
		],
		teacher: [],
		member: [],
		student: [],
	},
};

const classical: Configuration = {
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
			'EDIT_USER',
			'EDIT_USER_ADMIN',
			'EDIT_USER_TEACHER',
			'EDIT_USER_MEMBER',
			'EDIT_USER_STUDENT',
		],
		teacher: [],
		member: [],
		student: [],
	},
};

function testUserExists(username: string): boolean {
	return UsersManager.getInstance().exists(toPlayerPrivateId(username));
}

function testUserRetrieve(username: string): User | undefined {
	const d = UsersManager.getInstance().getAllUserDataByPrivateId(toPlayerPrivateId(username));
	if (isNotDefined(d)) {
		throw new TestError(`Could not find user ${username}`);
	}
	return d.user;
}

function testUserGetAll(): User[] {
	return UsersManager.getInstance().all();
}

function testUserAddNew(username: string, firstName: string, lastName: string, password: string, roles: UserRole[]) {
	const admin = UsersManager.getInstance().getAllUserDataByPrivateId(toPlayerPrivateId('admin.default'));
	if (isNotDefined(admin)) {
		throw new TestError('admin default user could not be retrieved');
	}
	return userAddNew(admin.user, {
		username: toPlayerPrivateId(username),
		firstName: toUserGivenName(firstName),
		lastName: toUserGivenName(lastName),
		password,
		roles,
	});
}

function testUserEdit(username: string, firstName: string, lastName: string, roles: UserRole[]) {
	const manager = UsersManager.getInstance();
	const admin = manager.getAllUserDataByPrivateId(toPlayerPrivateId('admin.default'));
	if (isNotDefined(admin)) {
		throw new TestError('admin default user could not be retrieved');
	}
	const edited = manager.getAllUserDataByPrivateId(toPlayerPrivateId(username));
	if (isNotDefined(edited)) {
		throw new TestError(`Cannot find user ${username}`);
	}
	userEdit(admin.user, edited.user, {
		firstName: toUserGivenName(firstName),
		lastName: toUserGivenName(lastName),
		roles,
	});
	return manager.getAllUserDataByPrivateId(toPlayerPrivateId(username))?.user;
}

const aa = toPlayerPrivateId('aa');
const bb = toPlayerPrivateId('bb');
const cc = toPlayerPrivateId('cc');
const dd = toPlayerPrivateId('dd');
const ee = toPlayerPrivateId('ee');
const ff = toPlayerPrivateId('ff');

describe('Create users', () => {
	test('In an empty server', async () => {
		await runCommand('./tests/initialize-empty.sh');
		clearServer();
		serverInitFromData('tests/webpage/', classical_rapid_blitz);

		const newUser = testUserAddNew('asdf', 'First', 'Last', 'password', ['ADMIN']);

		{
			const asdf_user_file = path.join(db_users_dir, 'asdf');
			expect(fs.existsSync(asdf_user_file)).toBe(true);
			const u = userFromString(fs.readFileSync(asdf_user_file, 'utf8'));
			expect(u).toBeDefined();
			if (isNotDefined(u)) {
				return;
			}
			expect(newUser).toEqual(u);
			expect(u.ratings.length).toBe(3);
		}

		expect(testUserExists('asdf')).toBe(true);

		const allUsers = testUserGetAll();
		expect(allUsers.length).toBe(1 + 1);
		expect(allUsers[1 + 0]).toEqual(newUser);
		expect(allUsers[1 + 0].ratings.length).toEqual(3);
		expect(testUserRetrieve('asdf')).toEqual(newUser);

		expect(
			userGetAllNamePublicId().map((d: UserThin): string => {
				return d.name;
			}),
		).toEqual(['Admin Default', 'First Last']);
	});

	test('In a non-empty server with different configuration', async () => {
		clearServer();
		serverInitFromData('tests/webpage/', classical_rapid_blitz_bullet);

		{
			const allUsers = testUserGetAll();
			expect(allUsers.length).toBe(1 + 1);
			expect(allUsers[1 + 0].firstName).toEqual('First');
			expect(allUsers[1 + 0].lastName).toEqual('Last');
			expect(allUsers[1 + 0].roles).toEqual(['ADMIN']);
			expect(allUsers[1 + 0].ratings.length).toBe(4);
			expect(
				userGetAllNamePublicId().map((d: UserThin): string => {
					return d.name;
				}),
			).toEqual(['Admin Default', 'First Last']);

			// check that the user file was updated with the new rating
			const asdfUserFile = path.join(db_users_dir, 'asdf');
			expect(fs.existsSync(asdfUserFile)).toBe(true);
			const u = userFromString(fs.readFileSync(asdfUserFile, 'utf8'));
			expect(u).toBeDefined();
			if (isNotDefined(u)) {
				return;
			}
			expect(u.ratings.length).toBe(4);
		}

		const newUser = testUserAddNew('qwer', 'Perico', 'Palotes', 'password', ['TEACHER']);

		const qwerUserFile = path.join(db_users_dir, 'qwer');
		expect(fs.existsSync(qwerUserFile)).toBe(true);
		const u = userFromString(fs.readFileSync(qwerUserFile, 'utf8'));
		expect(u).toBeDefined();
		if (isNotDefined(u)) {
			return;
		}
		expect(u.ratings.length).toBe(4);

		expect(testUserRetrieve('qwer')).toEqual(newUser);

		const allUsers = testUserGetAll();

		expect(allUsers.length).toBe(1 + 2);
		expect(allUsers[1 + 1]).toEqual(newUser);
		expect(
			userGetAllNamePublicId().map((d: UserThin): string => {
				return d.name;
			}),
		).toEqual(['Admin Default', 'First Last', 'Perico Palotes']);

		expect(
			allUsers
				.map((u: User): boolean => {
					return u.ratings.length === 4;
				})
				.reduce((pre: boolean, cur: boolean): boolean => {
					return pre && cur;
				}, true),
		).toEqual(true);

		expect(testUserExists(toPlayerPrivateId('asdf'))).toBe(true);
		expect(testUserExists(toPlayerPrivateId('qwer'))).toBe(true);
	});

	test('Check users with extra ratings', async () => {
		clearServer();
		serverInitFromData('tests/webpage/', classical);

		const allUsers = testUserGetAll();

		expect(
			allUsers
				.map((u: User): boolean => {
					return u.ratings.length === 4;
				})
				.reduce((pre: boolean, cur: boolean): boolean => {
					return pre && cur;
				}, true),
		).toEqual(true);

		expect(testUserExists(toPlayerPrivateId('asdf'))).toBe(true);
		expect(testUserExists(toPlayerPrivateId('qwer'))).toBe(true);
	});
});

describe('Modify existing users', () => {
	test('Newly created user', async () => {
		await runCommand('./tests/initialize-empty.sh');

		clearServer();
		serverInitFromData('tests/webpage/', classical_rapid_blitz);

		const newUser = testUserAddNew('asdf', 'First', 'Last', 'password', ['ADMIN']);

		const asdfUserFile = path.join(db_users_dir, 'asdf');

		{
			expect(fs.existsSync(asdfUserFile)).toBe(true);
			const u = userFromString(fs.readFileSync(asdfUserFile, 'utf8'));
			expect(newUser).toEqual(u);
		}

		const modifiedUser = testUserEdit('asdf', 'QQQ', 'WWW', ['TEACHER']);

		expect(testUserRetrieve('asdf')).toEqual(modifiedUser);
		expect(testUserExists('asdf')).toBe(true);
		expect(
			userGetAllNamePublicId().map((d: UserThin): string => {
				return d.name;
			}),
		).toEqual(['Admin Default', 'QQQ WWW']);

		{
			expect(fs.existsSync(asdfUserFile)).toBe(true);
			const u = userFromString(fs.readFileSync(asdfUserFile, 'utf8'));
			expect(u).not.toBeNull();
			if (isNotDefined(u)) {
				return;
			}
			expect(modifiedUser).toEqual(u);
			expect(u.firstName).toEqual('QQQ');
			expect(u.lastName).toEqual('WWW');
			expect(u.roles).toEqual(['TEACHER']);
		}
	});

	test('Already existing user', () => {
		clearServer();
		serverInitFromData('tests/webpage/', classical_rapid_blitz);

		const modifiedUser = testUserEdit('asdf', 'FFF', 'GGG', ['ADMIN', 'MEMBER']);

		const asdfUserFile = path.join(db_users_dir, 'asdf');
		expect(fs.existsSync(asdfUserFile)).toBe(true);
		const u = userFromString(fs.readFileSync(asdfUserFile, 'utf8'));
		expect(u).toBeDefined();
		if (isNotDefined(u)) {
			return;
		}
		expect(modifiedUser).toEqual(u);
		expect(u.firstName).toEqual('FFF');
		expect(u.lastName).toEqual('GGG');
		expect(u.roles).toEqual(['ADMIN', 'MEMBER']);

		expect(testUserRetrieve('asdf')).toEqual(modifiedUser);
		expect(testUserExists('asdf')).toBe(true);
		expect(
			userGetAllNamePublicId().map((d: UserThin): string => {
				return d.name;
			}),
		).toEqual(['Admin Default', 'FFF GGG']);
	});

	test('Modify users in bulk (', () => {
		clearServer();
		serverInitFromData('tests/webpage/', classical_rapid_blitz);

		testUserAddNew(aa, 'A', 'a', 'pass_a', ['ADMIN']);
		testUserAddNew(bb, 'B', 'b', 'pass_b', ['MEMBER']);
		testUserAddNew(cc, 'C', 'c', 'pass_c', ['MEMBER']);
		testUserAddNew(dd, 'D', 'd', 'pass_d', ['STUDENT']);
		testUserAddNew(ee, 'E', 'e', 'pass_e', ['STUDENT']);
		testUserAddNew(ff, 'F', 'f', 'pass_f', ['STUDENT']);

		const aa_Classical = new TimeControlRating(Classical, new EloRating(2000, 10, 10, 0, 0, 40, false));
		const aa_Blitz = new TimeControlRating(Blitz, new EloRating(300, 100, 0, 0, 100, 40, false));
		const aa_Rapid = new TimeControlRating(Rapid, new EloRating(1000, 100, 0, 50, 50, 40, false));
		const rating_aa = [aa_Classical, aa_Blitz, aa_Rapid];

		const bb_Classical = new TimeControlRating(Classical, new EloRating(2500, 2000, 1999, 0, 1, 10, true));
		const bb_Blitz = new TimeControlRating(Blitz, new EloRating(2000, 10, 10, 0, 0, 40, false));
		const bb_Rapid = new TimeControlRating(Rapid, new EloRating(1000, 100, 0, 0, 100, 40, false));
		const rating_bb = [bb_Classical, bb_Blitz, bb_Rapid];

		const cc_Classical = new TimeControlRating(Classical, new EloRating(2000, 10, 10, 0, 0, 40, false));
		const cc_Blitz = new TimeControlRating(Blitz, new EloRating(300, 100, 0, 0, 100, 40, false));
		const cc_Rapid = new TimeControlRating(Rapid, new EloRating(2000, 10, 10, 0, 0, 40, false));
		const rating_cc = [cc_Classical, cc_Blitz, cc_Rapid];

		const dd_Classical = new TimeControlRating(Classical, new EloRating(2500, 2000, 1999, 0, 1, 10, true));
		const dd_Rapid = new TimeControlRating(Rapid, new EloRating(1000, 100, 0, 0, 100, 40, false));
		const rating_dd = [dd_Classical, dd_Rapid];

		const ee_Blitz = new TimeControlRating(Blitz, new EloRating(300, 100, 0, 0, 100, 40, false));
		const ee_Rapid = new TimeControlRating(Rapid, new EloRating(2000, 10, 10, 0, 0, 40, false));
		const rating_ee = [ee_Blitz, ee_Rapid];

		const ff_Classical = new TimeControlRating(Classical, new EloRating(2500, 2000, 1999, 0, 1, 10, true));
		const ff_Blitz = new TimeControlRating(Blitz, new EloRating(2000, 10, 10, 0, 0, 40, false));
		const rating_ff = [ff_Classical, ff_Blitz];

		userUpdateFromPlayerData([
			new Player(aa, rating_aa),
			new Player(bb, rating_bb),
			new Player(cc, rating_cc),
			new Player(dd, rating_dd),
			new Player(ee, rating_ee),
			new Player(ff, rating_ff),
		]);

		const user_aa = testUserRetrieve(aa) as User;
		expect(user_aa.getRating(Blitz)).toEqual(aa_Blitz.rating);
		expect(user_aa.getRating(Classical)).toEqual(aa_Classical.rating);
		expect(user_aa.getRating(Rapid)).toEqual(aa_Rapid.rating);
		{
			const user_file = path.join(db_users_dir, 'aa');
			expect(fs.existsSync(user_file)).toBe(true);
			const u = userFromString(fs.readFileSync(user_file, 'utf8'));
			expect(u).toBeDefined();
			if (isNotDefined(u)) {
				return;
			}
			expect(u.getRating(Blitz)).toEqual(aa_Blitz.rating);
			expect(u.getRating(Classical)).toEqual(aa_Classical.rating);
			expect(u.getRating(Rapid)).toEqual(aa_Rapid.rating);
		}

		const user_bb = testUserRetrieve(bb) as User;
		expect(user_bb.getRating(Blitz)).toEqual(bb_Blitz.rating);
		expect(user_bb.getRating(Classical)).toEqual(bb_Classical.rating);
		expect(user_bb.getRating(Rapid)).toEqual(bb_Rapid.rating);
		{
			const user_file = path.join(db_users_dir, 'bb');
			expect(fs.existsSync(user_file)).toBe(true);
			const u = userFromString(fs.readFileSync(user_file, 'utf8'));
			expect(u).toBeDefined();
			if (isNotDefined(u)) {
				return;
			}
			expect(u.getRating(Blitz)).toEqual(bb_Blitz.rating);
			expect(u.getRating(Classical)).toEqual(bb_Classical.rating);
			expect(u.getRating(Rapid)).toEqual(bb_Rapid.rating);
		}

		const user_cc = testUserRetrieve(cc) as User;
		expect(user_cc.getRating(Blitz)).toEqual(cc_Blitz.rating);
		expect(user_cc.getRating(Classical)).toEqual(cc_Classical.rating);
		expect(user_cc.getRating(Rapid)).toEqual(cc_Rapid.rating);
		{
			const user_file = path.join(db_users_dir, 'cc');
			expect(fs.existsSync(user_file)).toBe(true);
			const u = userFromString(fs.readFileSync(user_file, 'utf8'));
			expect(u).toBeDefined();
			if (isNotDefined(u)) {
				return;
			}
			expect(u.getRating(Blitz)).toEqual(cc_Blitz.rating);
			expect(u.getRating(Classical)).toEqual(cc_Classical.rating);
			expect(u.getRating(Rapid)).toEqual(cc_Rapid.rating);
		}

		const user_dd = testUserRetrieve(dd) as User;
		expect(user_dd.getRating(Classical)).toEqual(dd_Classical.rating);
		expect(user_dd.getRating(Rapid)).toEqual(dd_Rapid.rating);
		{
			const user_file = path.join(db_users_dir, 'dd');
			expect(fs.existsSync(user_file)).toBe(true);
			const u = userFromString(fs.readFileSync(user_file, 'utf8'));
			expect(u).toBeDefined();
			if (isNotDefined(u)) {
				return;
			}
			expect(u.getRating(Classical)).toEqual(dd_Classical.rating);
			expect(u.getRating(Rapid)).toEqual(dd_Rapid.rating);
		}

		const user_ee = testUserRetrieve(ee) as User;
		expect(user_ee.getRating(Blitz)).toEqual(ee_Blitz.rating);
		expect(user_ee.getRating(Rapid)).toEqual(ee_Rapid.rating);
		{
			const user_file = path.join(db_users_dir, 'ee');
			expect(fs.existsSync(user_file)).toBe(true);
			const u = userFromString(fs.readFileSync(user_file, 'utf8'));
			expect(u).toBeDefined();
			if (isNotDefined(u)) {
				return;
			}
			expect(u.getRating(Blitz)).toEqual(ee_Blitz.rating);
			expect(u.getRating(Rapid)).toEqual(ee_Rapid.rating);
		}

		const user_ff = testUserRetrieve(ff) as User;
		expect(user_ff.getRating(Blitz)).toEqual(ff_Blitz.rating);
		expect(user_ff.getRating(Classical)).toEqual(ff_Classical.rating);
		{
			const user_file = path.join(db_users_dir, 'ff');
			expect(fs.existsSync(user_file)).toBe(true);
			const u = userFromString(fs.readFileSync(user_file, 'utf8'));
			expect(u).toBeDefined();
			if (isNotDefined(u)) {
				return;
			}
			expect(u.getRating(Blitz)).toEqual(ff_Blitz.rating);
			expect(u.getRating(Classical)).toEqual(ff_Classical.rating);
		}
	});
});
