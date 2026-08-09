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

import { UsersManager } from '@app/server/managers/users-manager';
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
		let users = UsersManager.get_instance();
		users.clear();

		expect(users.num_users()).toBe(0);
	});

	test('Add some users', () => {
		let users = UsersManager.get_instance();
		users.clear();

		const aU = new User(a, AA, aa, { encrypted: 'p', iv: 'w' }, [], [], []);
		const bU = new User(b, BB, bb, { encrypted: 'p', iv: 'w' }, [], [], []);
		const cU = new User(c, CC, cc, { encrypted: 'p', iv: 'w' }, [], [], []);

		users.add_user(aU);
		expect(users.num_users()).toBe(1);

		users.add_user(bU);
		expect(users.num_users()).toBe(2);

		users.add_user(cU);
		expect(users.num_users()).toBe(3);

		expect(users.get_user_at(0)).toEqual(aU);
		expect(users.get_user_at(1)).toEqual(bU);
		expect(users.get_user_at(2)).toEqual(cU);

		expect(users.get_user_index_by_username(a)).toBe(0);
		expect(users.get_user_index(aU)).toBe(0);

		expect(users.get_user_index_by_username(b)).toBe(1);
		expect(users.get_user_index(bU)).toBe(1);

		expect(users.get_user_index_by_username(c)).toBe(2);
		expect(users.get_user_index(cU)).toBe(2);
	});

	test('Replace some users', () => {
		let users = UsersManager.get_instance();
		users.clear();

		const aU = new User(a, AA, aa, { encrypted: 'p', iv: 'w' }, [], [], []);
		const bU = new User(b, BB, bb, { encrypted: 'p', iv: 'w' }, [], [], []);
		const cU = new User(c, CC, cc, { encrypted: 'p', iv: 'w' }, [], [], []);

		users.add_user(aU);
		users.add_user(bU);
		users.add_user(cU);

		const dU = new User(d, DD, dd, { encrypted: 'p', iv: 'w' }, [], [], []);

		users.replace_user(dU, users.get_user_index(bU) as number);

		expect(() => users.replace_user(bU, 500)).toThrow();

		expect(users.num_users()).toBe(3);

		expect(users.get_user_at(0)).toEqual(aU);
		expect(users.get_user_at(1)).toEqual(dU);
		expect(users.get_user_at(2)).toEqual(cU);

		expect(users.get_user_index_by_username(a)).toBe(0);
		expect(users.get_user_index(aU)).toBe(0);

		expect(users.get_user_index_by_username(b)).toBe(undefined);
		expect(users.get_user_index(bU)).toBe(undefined);

		expect(users.get_user_index_by_username(d)).toBe(1);
		expect(users.get_user_index(dU)).toBe(1);

		expect(users.get_user_index_by_username(c)).toBe(2);
		expect(users.get_user_index(cU)).toBe(2);
	});
});
