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
import { UsersManager } from '@server/managers/users-manager';
import { makeUser, TestError } from '@tests';

const a = 'a';
const b = 'b';
const c = 'c';
const d = 'd';

describe('Users Manager', () => {
	test('Empty manager', () => {
		let users = UsersManager.getInstance();
		users.clear();

		expect(users.numUsers()).toBe(0);
	});

	test('Add some users', () => {
		let users = UsersManager.getInstance();
		users.clear();

		const aU = makeUser({
			username: a,
			firstName: 'AA',
			lastName: 'aa',
			password: { encrypted: 'p', iv: 'w' },
		});
		const bU = makeUser({
			username: b,
			firstName: 'BB',
			lastName: 'bb',
			password: { encrypted: 'p', iv: 'w' },
		});
		const cU = makeUser({
			username: c,
			firstName: 'CC',
			lastName: 'cc',
			password: { encrypted: 'p', iv: 'w' },
		});

		users.addUser(aU);
		expect(users.numUsers()).toBe(1);

		users.addUser(bU);
		expect(users.numUsers()).toBe(2);

		users.addUser(cU);
		expect(users.numUsers()).toBe(3);

		expect(users.getAllUserDataAtSafeIdx(0).user).toEqual(aU);
		expect(users.getAllUserDataAtSafeIdx(1).user).toEqual(bU);
		expect(users.getAllUserDataAtSafeIdx(2).user).toEqual(cU);

		expect(users.getIndexByPrivateId(toPlayerPrivateId(a))).toBe(0);
		expect(users.getIndexByPrivateId(aU.username)).toBe(0);

		expect(users.getIndexByPrivateId(toPlayerPrivateId(b))).toBe(1);
		expect(users.getIndexByPrivateId(bU.username)).toBe(1);

		expect(users.getIndexByPrivateId(toPlayerPrivateId(c))).toBe(2);
		expect(users.getIndexByPrivateId(cU.username)).toBe(2);
	});

	test('Replace some users', () => {
		let users = UsersManager.getInstance();
		users.clear();

		const aU = makeUser({
			username: a,
			firstName: 'AA',
			lastName: 'aa',
			password: { encrypted: 'p', iv: 'w' },
		});
		const bU = makeUser({
			username: b,
			firstName: 'BB',
			lastName: 'bb',
			password: { encrypted: 'p', iv: 'w' },
		});
		const cU = makeUser({
			username: c,
			firstName: 'CC',
			lastName: 'cc',
			password: { encrypted: 'p', iv: 'w' },
		});

		users.addUser(aU);
		users.addUser(bU);
		users.addUser(cU);

		const dU = makeUser({
			username: d,
			firstName: 'DD',
			lastName: 'dd',
			password: { encrypted: 'p', iv: 'w' },
		});

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

		expect(users.getIndexByPrivateId(toPlayerPrivateId(a))).toBe(0);
		expect(users.getIndexByPrivateId(aU.username)).toBe(0);

		expect(users.getIndexByPrivateId(toPlayerPrivateId(b))).toBe(undefined);
		expect(users.getIndexByPrivateId(bU.username)).toBe(undefined);

		expect(users.getIndexByPrivateId(toPlayerPrivateId(d))).toBe(1);
		expect(users.getIndexByPrivateId(dU.username)).toBe(1);

		expect(users.getIndexByPrivateId(toPlayerPrivateId(c))).toBe(2);
		expect(users.getIndexByPrivateId(cU.username)).toBe(2);
	});
});
