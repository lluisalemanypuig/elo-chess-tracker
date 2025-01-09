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

import { UsersManager } from '../../src-server/managers/users_manager';
import { Password } from '../../src-server/models/password';
import { User } from '../../src-server/models/user';

describe('Users Manager', () => {
	test('Empty manager', () => {
		let users = UsersManager.get_instance();
		users.clear();

		expect(users.num_users()).toBe(0);
	});

	test('Add some users', () => {
		let users = UsersManager.get_instance();
		users.clear();

		const a = new User('a', 'AA', 'aa', new Password('p', 'w'), [], new Map([]), []);
		const b = new User('b', 'BB', 'bb', new Password('p', 'w'), [], new Map([]), []);
		const c = new User('c', 'CC', 'cc', new Password('p', 'w'), [], new Map([]), []);

		users.add_user(a);
		expect(users.num_users()).toBe(1);

		users.add_user(b);
		expect(users.num_users()).toBe(2);

		users.add_user(c);
		expect(users.num_users()).toBe(3);

		expect(users.get_user_at(0)).toEqual(a);
		expect(users.get_user_at(1)).toEqual(b);
		expect(users.get_user_at(2)).toEqual(c);

		expect(users.get_user_index_by_username('a')).toBe(0);
		expect(users.get_user_index(a)).toBe(0);

		expect(users.get_user_index_by_username('b')).toBe(1);
		expect(users.get_user_index(b)).toBe(1);

		expect(users.get_user_index_by_username('c')).toBe(2);
		expect(users.get_user_index(c)).toBe(2);
	});

	test('Replace some users', () => {
		let users = UsersManager.get_instance();
		users.clear();

		const a = new User('a', 'AA', 'aa', new Password('p', 'w'), [], new Map([]), []);
		const b = new User('b', 'BB', 'bb', new Password('p', 'w'), [], new Map([]), []);
		const c = new User('c', 'CC', 'cc', new Password('p', 'w'), [], new Map([]), []);

		users.add_user(a);
		users.add_user(b);
		users.add_user(c);

		const d = new User('d', 'DD', 'dd', new Password('p', 'w'), [], new Map([]), []);

		users.replace_user(d, users.get_user_index(b));

		expect(() => users.replace_user(b, 500)).toThrow();

		expect(users.num_users()).toBe(3);

		expect(users.get_user_at(0)).toEqual(a);
		expect(users.get_user_at(1)).toEqual(d);
		expect(users.get_user_at(2)).toEqual(c);

		expect(users.get_user_index_by_username('a')).toBe(0);
		expect(users.get_user_index(a)).toBe(0);

		expect(users.get_user_index_by_username('b')).toBe(-1);
		expect(users.get_user_index(b)).toBe(-1);

		expect(users.get_user_index_by_username('d')).toBe(1);
		expect(users.get_user_index(d)).toBe(1);

		expect(users.get_user_index_by_username('c')).toBe(2);
		expect(users.get_user_index(c)).toBe(2);
	});
});
