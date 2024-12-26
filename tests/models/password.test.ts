/*
Elo rating for a Chess Club
Copyright (C) 2023 - 2024  Lluís Alemany Puig

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

Contact:
	Lluís Alemany Puig
	https://github.com/lluisalemanypuig
*/

import { Password, password_from_json } from '../../ts-server/models/password';

describe('From JSON', () => {
	test('string', () => {
		expect(password_from_json('{"encrypted": "1234", "iv": "asdf"}')).toEqual(new Password('1234', 'asdf'));
	});

	test('JSON', () => {
		expect(password_from_json({ encrypted: '1234', iv: 'asdf' })).toEqual(new Password('1234', 'asdf'));
	});
});

describe('clone', () => {
	test('1', () => {
		let pass = new Password('1234', 'asdf');
		let pass2 = pass.clone();
		expect(pass).not.toBe(pass2);
		expect(pass).toEqual(pass2);
	});
});
