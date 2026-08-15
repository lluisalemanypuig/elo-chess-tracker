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

import { PlayerPrivateId, toPlayerPrivateId } from '@common/models/player-id';
import {
	decryptMessage,
	encryptMessage,
	encryptPasswordForUser,
	isPasswordOfUserCorrect,
	normalizeString
} from '@server/utils/encrypt';

describe('Password normalization', () => {
	test('1', () => {
		expect(normalizeString('q')).toBe('q$AL');
		expect(normalizeString('qw')).toBe('qw$ALLOW');
		expect(normalizeString('qwt')).toBe('qwt$ALLO');
		expect(normalizeString('asdf')).toBe('asdf$ALL');
		expect(normalizeString('AAAAA')).toBe('AAAAA$AL');
	});

	test('2', () => {
		expect(normalizeString('12345678')).toBe('12345678$ALLOWED');
		expect(normalizeString('1234567890123456')).toBe('1234567890123456$ALLOWED_SYMBOLS');
		expect(normalizeString('1234567890123456789012345678901234567890123456789012345678901234')).toBe(
			'1234567890123456789012345678901234567890123456789012345678901234$ALLOWED_SYMBOLS_ENCRYPT$ALLOWED_SYMBOLS_ENCRYPT$ALLOWED_SYMBOLS'
		);
		expect(
			normalizeString(
				'12345678901234567890123456789012345678901234567890123456789012345678901234567890123456789012345678901234567890123456789012345678'
			)
		).toBe(
			'12345678901234567890123456789012345678901234567890123456789012345678901234567890123456789012345678901234567890123456789012345678$ALLOWED_SYMBOLS_ENCRYPT$ALLOWED_SYMBOLS_ENCRYPT$ALLOWED_SYMBOLS_ENCRYPT$ALLOWED_SYMBOLS_ENCRYPT$ALLOWED_SYMBOLS_ENCRYPT$ALLOWED'
		);
	});

	test('3', () => {
		expect(normalizeString('星星星星')).toBe('星星星星$ALL');
	});
});

function check_decrypt_good_password(msg: string, pass: string) {
	const enc = encryptMessage(msg, pass);
	expect(decryptMessage(enc, pass)).toBe(msg);
}

describe('Encryption and decryption of messages with a (correct) plain password', () => {
	const admin = toPlayerPrivateId('admin');

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
		check_decrypt_good_password(admin, '星');
	});

	test('6', () => {
		check_decrypt_good_password('山田', '星');
	});

	test('7', () => {
		check_decrypt_good_password('山田', '山田');
	});
});

function check_decrypt_wrong_password(msg: string, pass1: string, pass2: string) {
	const enc = encryptMessage(msg, pass1);
	expect(decryptMessage(enc, pass2)).not.toBe(msg);
}

describe('Encryption and decryption with a (wrong) plain password', () => {
	test('1', () => {
		const enc1 = encryptMessage('', 'admin');

		expect(decryptMessage(enc1, 'admin!')).toBe('');
		expect(decryptMessage(enc1, 'admi')).toBe('');
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

function check_encrypt_user_password(user: PlayerPrivateId, pass: string) {
	const [encrypted, iv] = encryptPasswordForUser(user, pass);
	expect(isPasswordOfUserCorrect(user, pass, { encrypted, iv })).toBe(true);
}

describe('Encrypt password for users', () => {
	const admin = toPlayerPrivateId('admin');

	test('admin - pass', () => {
		check_encrypt_user_password(admin, 'pass');
	});

	test('admin - admin', () => {
		check_encrypt_user_password(admin, 'admin');
	});

	test('admin - QQQQQQQ', () => {
		check_encrypt_user_password(admin, 'QQQQQQQ');
	});

	test('admin - Q', () => {
		check_encrypt_user_password(admin, 'Q');
	});

	test('admin - ·', () => {
		check_encrypt_user_password(admin, '·');
	});

	test('admin - a·', () => {
		check_encrypt_user_password(admin, 'a·');
	});

	test('Several users', () => {
		const user_array = ['a', 'asdf', 'qwer', 'admin', 'administrator', 'qwer ppp'].map((s: string) =>
			toPlayerPrivateId(s)
		);
		for (const user of user_array) {
			check_encrypt_user_password(user, 'QQQQQQQ');
		}
	});

	const yamada = toPlayerPrivateId('山田');
	test('Use Kanji - 1', () => {
		check_encrypt_user_password(yamada, 'QQQQQQQ');
	});

	test('Use Kanji - 2', () => {
		check_encrypt_user_password(admin, '星');
	});

	test('Use Kanji - 3', () => {
		check_encrypt_user_password(admin, '山田');
	});

	test('Use Kanji - 4', () => {
		check_encrypt_user_password(admin, '私は一番有名な人です');
	});

	test('Use Kanji - 5', () => {
		check_encrypt_user_password(admin, '私');
	});
});
