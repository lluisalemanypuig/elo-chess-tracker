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

import { UsersManager } from '@server/managers/users-manager';
import { toUserGivenName, User } from '@common/models/user';
import { toPlayerPrivateId } from '@common/models/player';

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

		expect(users.getUserAt(0)).toEqual(aU);
		expect(users.getUserAt(1)).toEqual(bU);
		expect(users.getUserAt(2)).toEqual(cU);

		expect(users.getUserIndexByUsername(a)).toBe(0);
		expect(users.getUserIndex(aU)).toBe(0);

		expect(users.getUserIndexByUsername(b)).toBe(1);
		expect(users.getUserIndex(bU)).toBe(1);

		expect(users.getUserIndexByUsername(c)).toBe(2);
		expect(users.getUserIndex(cU)).toBe(2);
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

		users.replace_user(dU, users.getUserIndex(bU) as number);

		expect(() => users.replace_user(bU, 500)).toThrow();

		expect(users.numUsers()).toBe(3);

		expect(users.getUserAt(0)).toEqual(aU);
		expect(users.getUserAt(1)).toEqual(dU);
		expect(users.getUserAt(2)).toEqual(cU);

		expect(users.getUserIndexByUsername(a)).toBe(0);
		expect(users.getUserIndex(aU)).toBe(0);

		expect(users.getUserIndexByUsername(b)).toBe(undefined);
		expect(users.getUserIndex(bU)).toBe(undefined);

		expect(users.getUserIndexByUsername(d)).toBe(1);
		expect(users.getUserIndex(dU)).toBe(1);

		expect(users.getUserIndexByUsername(c)).toBe(2);
		expect(users.getUserIndex(cU)).toBe(2);
	});
});
