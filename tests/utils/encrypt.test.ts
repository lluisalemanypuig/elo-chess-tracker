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
	is_password_of_user_correct,
	normalize_string
} from '../../ts-server/utils/encrypt';

describe('Password normalization', () => {
	test('1', () => {
		const password = 'q';
		const normalized = normalize_string(password);
		expect(password).toBe('q');
		expect(normalized).toBe('qa!b');
	});

	test('2', () => {
		const password = 'qw';
		const normalized = normalize_string(password);
		expect(password).toBe('qw');
		expect(normalized).toBe('qwa!b·c$');
	});

	test('3', () => {
		const password = 'qwt';
		const normalized = normalize_string(password);
		expect(password).toBe('qwt');
		expect(normalized).toBe('qwta!b·c');
	});

	test('4', () => {
		const password = 'asdf';
		const normalized = normalize_string(password);
		expect(password).toBe('asdf');
		expect(normalized).toBe('asdfa!b·');
	});

	test('5', () => {
		const password = 'AAAAA';
		const normalized = normalize_string(password);
		expect(password).toBe('AAAAA');
		expect(normalized).toBe('AAAAAa!b');
	});
});

function check_decrypt_good_password(msg: string, pass: string) {
	const enc = encrypt_message(msg, pass);
	expect(decrypt_message(enc, pass)).toBe(msg);
}

describe('Encryption and decryption of messages with a (correct) plain password', () => {
	test('1', () => {
		check_decrypt_good_password('', 'admin');
	});

	test('2', () => {
		check_decrypt_good_password('as', 'admin');
	});

	test('3', () => {
		check_decrypt_good_password('asdf fqrfwrf', 'admin');
	});

	test('4', () => {
		check_decrypt_good_password('QW  2424guhgnj gk rfr', 'admin');
	});

	test('5', () => {
		check_decrypt_good_password('admin', '星');
	});

	test('6', () => {
		check_decrypt_good_password('山田', '星');
	});

	test('7', () => {
		check_decrypt_good_password('山田', '山田');
	});
});

function check_decrypt_wrong_password(msg: string, pass1: string, pass2: string) {
	const enc = encrypt_message(msg, pass1);
	expect(decrypt_message(enc, pass2)).not.toBe(msg);
}

describe('Encryption and decryption with a (wrong) plain password', () => {
	test('1', () => {
		const enc1 = encrypt_message('', 'admin');

		expect(decrypt_message(enc1, 'admin!')).toBe('');
		expect(decrypt_message(enc1, 'admi')).toBe('');
	});

	test('2', () => {
		check_decrypt_wrong_password('a', 'admin', 'admin!');
		check_decrypt_wrong_password('a', 'admin', 'admi');
	});

	test('3', () => {
		check_decrypt_wrong_password('as', 'admin', 'admin!');
		check_decrypt_wrong_password('as', 'admin', 'admi');
	});

	test('4', () => {
		check_decrypt_wrong_password('asdf fqrfwrf', 'admin', 'admin!');
		check_decrypt_wrong_password('asdf fqrfwrf', 'admin', 'admi');
	});

	test('5', () => {
		check_decrypt_wrong_password('QW  2424guhgnj gk rfr', 'admin', 'admin!');
		check_decrypt_wrong_password('QW  2424guhgnj gk rfr', 'admin', 'admi');
	});

	test('5', () => {
		check_decrypt_wrong_password('QW  2424guhgnj gk rfr', 'admin', '山田');
		check_decrypt_wrong_password('QW  2424guhgnj gk rfr', 'admin', '星');
	});
});

function check_encrypt_user_password(user: string, pass: string) {
	const [encrypted, iv] = encrypt_password_for_user(user, pass);
	expect(is_password_of_user_correct(encrypted, user, pass, iv)).toBe(true);
}

describe('Encrypt password for users', () => {
	test('admin - pass', () => {
		check_encrypt_user_password('admin', 'pass');
	});

	test('admin - admin', () => {
		check_encrypt_user_password('admin', 'admin');
	});

	test('admin - QQQQQQQ', () => {
		check_encrypt_user_password('admin', 'QQQQQQQ');
	});

	test('admin - Q', () => {
		check_encrypt_user_password('admin', 'Q');
	});

	test('admin - ·', () => {
		check_encrypt_user_password('admin', '·');
	});

	test('admin - a·', () => {
		check_encrypt_user_password('admin', 'a·');
	});

	test('Several users', () => {
		const user_array = ['a', 'asdf', 'qwer', 'admin', 'administrator', 'qwer ppp'];
		for (const user of user_array) {
			check_encrypt_user_password(user, 'QQQQQQQ');
		}
	});

	test('Use Kanji - 1', () => {
		check_encrypt_user_password('山田', 'QQQQQQQ');
	});

	test('Use Kanji - 2', () => {
		check_encrypt_user_password('admin', '星');
	});

	test('Use Kanji - 3', () => {
		check_encrypt_user_password('admin', '山田');
	});

	test('Use Kanji - 4', () => {
		check_encrypt_user_password('admin', '私は一番有名な人です');
	});

	test('Use Kanji - 5', () => {
		check_encrypt_user_password('admin', '私');
	});
});
