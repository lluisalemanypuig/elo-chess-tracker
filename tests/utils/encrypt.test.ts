/*
Elo rating for a Chess Club
Copyright (C) 2023  Lluís Alemany Puig

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

import {
	decrypt_message,
	encrypt_message,
	encrypt_password_for_user,
	is_password_of_user_correct
} from '../../ts-server/utils/encrypt';

describe('Encrypt password for users', () => {
	test('admin - pass', () => {
		const user = 'admin';
		const pass = 'pass';
		const [encrypted, iv] = encrypt_password_for_user(user, pass);
		expect(is_password_of_user_correct(encrypted, user, pass, iv)).toBe(true);
	});

	test('admin - admin', () => {
		const user = 'admin';
		const pass = 'admin';
		const [encrypted, iv] = encrypt_password_for_user(user, pass);
		expect(is_password_of_user_correct(encrypted, user, pass, iv)).toBe(true);
	});

	test('admin - QQQQQQQ', () => {
		const user = 'admin';
		const pass = 'QQQQQQQ';
		const [encrypted, iv] = encrypt_password_for_user(user, pass);
		expect(is_password_of_user_correct(encrypted, user, pass, iv)).toBe(true);
	});

	test('Several users', () => {
		const user_array = ['a', 'asdf', 'qwer', 'admin', 'administrator', 'qwer ppp'];
		const pass = 'QQQQQQQ';
		for (const user of user_array) {
			const [encrypted, iv] = encrypt_password_for_user(user, pass);
			expect(is_password_of_user_correct(encrypted, user, pass, iv)).toBe(true);
		}
	});
});

describe('Encryption and decryption of messages with a (correct) plain password', () => {
	test('1', () => {
		const msg = '';
		const pass = 'admin';
		const enc = encrypt_message(msg, pass);
		expect(decrypt_message(enc, pass)).toBe(msg);
	});

	test('2', () => {
		const msg = 'as';
		const pass = 'admin';
		const enc = encrypt_message(msg, pass);
		expect(decrypt_message(enc, pass)).toBe(msg);
	});

	test('3', () => {
		const msg = 'asdf fqrfwrf';
		const pass = 'admin';
		const enc = encrypt_message(msg, pass);
		expect(decrypt_message(enc, pass)).toBe(msg);
	});

	test('4', () => {
		const msg = 'QW  2424guhgnj gk rfr';
		const pass = 'admin';
		const enc = encrypt_message(msg, pass);
		expect(decrypt_message(enc, pass)).toBe(msg);
	});
});

describe('Encryption and decryption with a (correct) plain password', () => {
	test('1', () => {
		const msg = '';
		const pass = 'admin';
		const enc = encrypt_message(msg, pass);
		expect(decrypt_message(enc, pass)).toBe(msg);
	});

	test('2.1', () => {
		const msg = 'a';
		const pass = 'admin';
		const enc = encrypt_message(msg, pass);
		expect(decrypt_message(enc, pass)).toBe(msg);
	});

	test('2', () => {
		const msg = 'as';
		const pass = 'admin';
		const enc = encrypt_message(msg, pass);
		expect(decrypt_message(enc, pass)).toBe(msg);
	});

	test('3', () => {
		const msg = 'asdf fqrfwrf';
		const pass = 'admin';
		const enc = encrypt_message(msg, pass);
		expect(decrypt_message(enc, pass)).toBe(msg);
	});

	test('4', () => {
		const msg = 'QW  2424guhgnj gk rfr';
		const pass = 'admin';
		const enc = encrypt_message(msg, pass);
		expect(decrypt_message(enc, pass)).toBe(msg);
	});
});

describe('Encryption and decryption with a (wrong) plain password', () => {
	test('1', () => {
		const msg = '';
		const pass = 'admin';
		const enc1 = encrypt_message(msg, pass);
		expect(decrypt_message(enc1, 'admin!')).toBe(msg);
		const enc2 = encrypt_message(msg, pass);
		expect(decrypt_message(enc2, 'admi')).toBe(msg);
	});

	test('2.1', () => {
		const msg = 'a';
		const pass = 'admin';
		const enc1 = encrypt_message(msg, pass);
		expect(decrypt_message(enc1, 'admin!')).not.toBe(msg);
		const enc2 = encrypt_message(msg, pass);
		expect(decrypt_message(enc2, 'admi')).not.toBe(msg);
	});

	test('2', () => {
		const msg = 'as';
		const pass = 'admin';
		const enc1 = encrypt_message(msg, pass);
		expect(decrypt_message(enc1, 'admin!')).not.toBe(msg);
		const enc2 = encrypt_message(msg, pass);
		expect(decrypt_message(enc2, 'admi')).not.toBe(msg);
	});

	test('3', () => {
		const msg = 'asdf fqrfwrf';
		const pass = 'admin';
		const enc1 = encrypt_message(msg, pass);
		expect(decrypt_message(enc1, 'admin!')).not.toBe(msg);
		const enc2 = encrypt_message(msg, pass);
		expect(decrypt_message(enc2, 'admi')).not.toBe(msg);
	});

	test('4', () => {
		const msg = 'QW  2424guhgnj gk rfr';
		const pass = 'admin';
		const enc1 = encrypt_message(msg, pass);
		expect(decrypt_message(enc1, 'admin!')).not.toBe(msg);
		const enc2 = encrypt_message(msg, pass);
		expect(decrypt_message(enc2, 'admi')).not.toBe(msg);
	});
});
