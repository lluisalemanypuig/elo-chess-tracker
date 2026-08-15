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

import { TestError } from '@tests';
import { UsersManager } from '@server/managers/users-manager';
import { toUserGivenName, User } from '@common/models/user';
import { toPlayerPrivateId } from '@common/models/player';
import { isNotDefined } from '@common//utils/is-defined';

const a = toPlayerPrivateId('a');
const b = toPlayerPrivateId('b');
const c = toPlayerPrivateId('c');
const d = toPlayerPrivateId('d');

const AA = toUserGivenName('AA');
const BB = toUserGivenName('BB');
const CC = toUserGivenName('CC');
const DD = toUserGivenName('DD');

const aa = toUserGivenName('aa');
const bb = toUserGivenName('bb');
const cc = toUserGivenName('cc');
const dd = toUserGivenName('dd');

describe('Users Manager', () => {
	test('Empty manager', () => {
		let users = UsersManager.getInstance();
		users.clear();

		expect(users.numUsers()).toBe(0);
	});

	test('Add some users', () => {
		let users = UsersManager.getInstance();
		users.clear();

		const aU = new User(a, AA, aa, { encrypted: 'p', iv: 'w' }, [], [], []);
		const bU = new User(b, BB, bb, { encrypted: 'p', iv: 'w' }, [], [], []);
		const cU = new User(c, CC, cc, { encrypted: 'p', iv: 'w' }, [], [], []);

		users.addUser(aU);
		expect(users.numUsers()).toBe(1);

		users.addUser(bU);
		expect(users.numUsers()).toBe(2);

		users.addUser(cU);
		expect(users.numUsers()).toBe(3);

		expect(users.getAllUserDataAtSafeIdx(0).user).toEqual(aU);
		expect(users.getAllUserDataAtSafeIdx(1).user).toEqual(bU);
		expect(users.getAllUserDataAtSafeIdx(2).user).toEqual(cU);

		expect(users.getIndexByPrivateId(a)).toBe(0);
		expect(users.getIndexByPrivateId(aU.username)).toBe(0);

		expect(users.getIndexByPrivateId(b)).toBe(1);
		expect(users.getIndexByPrivateId(bU.username)).toBe(1);

		expect(users.getIndexByPrivateId(c)).toBe(2);
		expect(users.getIndexByPrivateId(cU.username)).toBe(2);
	});

	test('Replace some users', () => {
		let users = UsersManager.getInstance();
		users.clear();

		const aU = new User(a, AA, aa, { encrypted: 'p', iv: 'w' }, [], [], []);
		const bU = new User(b, BB, bb, { encrypted: 'p', iv: 'w' }, [], [], []);
		const cU = new User(c, CC, cc, { encrypted: 'p', iv: 'w' }, [], [], []);

		users.addUser(aU);
		users.addUser(bU);
		users.addUser(cU);

		const dU = new User(d, DD, dd, { encrypted: 'p', iv: 'w' }, [], [], []);

		const idx = users.getIndexByPrivateId(bU.username);
		expect(idx).not.toBeNull();
		if (isNotDefined(idx)) {
			throw new TestError(`Error in test`);
		}
		users.replaceUser(dU, idx);

		expect(() => users.replaceUser(bU, 500)).toThrow();

		expect(users.numUsers()).toBe(3);

		expect(users.getAllUserDataAtSafeIdx(0).user).toEqual(aU);
		expect(users.getAllUserDataAtSafeIdx(1).user).toEqual(dU);
		expect(users.getAllUserDataAtSafeIdx(2).user).toEqual(cU);

		expect(users.getIndexByPrivateId(a)).toBe(0);
		expect(users.getIndexByPrivateId(aU.username)).toBe(0);

		expect(users.getIndexByPrivateId(b)).toBe(undefined);
		expect(users.getIndexByPrivateId(bU.username)).toBe(undefined);

		expect(users.getIndexByPrivateId(d)).toBe(1);
		expect(users.getIndexByPrivateId(dU.username)).toBe(1);

		expect(users.getIndexByPrivateId(c)).toBe(2);
		expect(users.getIndexByPrivateId(cU.username)).toBe(2);
	});
});
