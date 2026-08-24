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
	encryptPasswordForUser,
	isPasswordOfUserCorrect,
	normalizeString,
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
		expect(normalizeString('1234567890123456')).toBe(
			'1234567890123456$ALLOWED_SYMBOLS',
		);
		expect(
			normalizeString(
				'1234567890123456789012345678901234567890123456789012345678901234',
			),
		).toBe(
			'1234567890123456789012345678901234567890123456789012345678901234$ALLOWED_SYMBOLS_ENCRYPT$ALLOWED_SYMBOLS_ENCRYPT$ALLOWED_SYMBOLS',
		);
		expect(
			normalizeString(
				'12345678901234567890123456789012345678901234567890123456789012345678901234567890123456789012345678901234567890123456789012345678',
			),
		).toBe(
			'12345678901234567890123456789012345678901234567890123456789012345678901234567890123456789012345678901234567890123456789012345678$ALLOWED_SYMBOLS_ENCRYPT$ALLOWED_SYMBOLS_ENCRYPT$ALLOWED_SYMBOLS_ENCRYPT$ALLOWED_SYMBOLS_ENCRYPT$ALLOWED_SYMBOLS_ENCRYPT$ALLOWED',
		);
	});

	test('3', () => {
		expect(normalizeString('星星星星')).toBe('星星星星$ALL');
	});
});

function checkEncryptUserPassword(user: PlayerPrivateId, pass: string) {
	const [encrypted, iv] = encryptPasswordForUser(user, pass);
	expect(isPasswordOfUserCorrect(user, pass, { encrypted, iv })).toBe(true);
}

describe('Encrypt password for users', () => {
	const admin = toPlayerPrivateId('admin');

	test('admin - pass', () => {
		checkEncryptUserPassword(admin, 'pass');
	});

	test('admin - admin', () => {
		checkEncryptUserPassword(admin, 'admin');
	});

	test('admin - QQQQQQQ', () => {
		checkEncryptUserPassword(admin, 'QQQQQQQ');
	});

	test('admin - Q', () => {
		checkEncryptUserPassword(admin, 'Q');
	});

	test('admin - ·', () => {
		checkEncryptUserPassword(admin, '·');
	});

	test('admin - a·', () => {
		checkEncryptUserPassword(admin, 'a·');
	});

	test('Several users', () => {
		const user_array = [
			'a',
			'asdf',
			'qwer',
			'admin',
			'administrator',
			'qwer ppp',
		].map((s: string) => toPlayerPrivateId(s));
		for (const user of user_array) {
			checkEncryptUserPassword(user, 'QQQQQQQ');
		}
	});

	test('Use Kanji - 1', () => {
		checkEncryptUserPassword(admin, 'QQQQQQQ');
		checkEncryptUserPassword(admin, 'QQQ Q Q QQ');
		checkEncryptUserPassword(admin, ' QQQ QQQQ ');
	});

	test('Use Kanji - 2', () => {
		checkEncryptUserPassword(admin, '星');
		checkEncryptUserPassword(admin, ' 星');
		checkEncryptUserPassword(admin, '星 ');
		checkEncryptUserPassword(admin, ' 星 ');
	});

	test('Use Kanji - 3', () => {
		checkEncryptUserPassword(admin, '山田');
		checkEncryptUserPassword(admin, '山 田');
		checkEncryptUserPassword(admin, ' 山 田 ');
	});

	test('Use Kanji - 4', () => {
		checkEncryptUserPassword(admin, '私は一番有名な人です');
		checkEncryptUserPassword(admin, '私は 一番有 名な人で す');
		checkEncryptUserPassword(admin, '私 は 一 番 有 名 な 人 で す');
	});

	test('Use Kanji - 5', () => {
		checkEncryptUserPassword(admin, '私');
	});

	const yamada = toPlayerPrivateId('山田');
	test('Use Kanji - 6', () => {
		checkEncryptUserPassword(yamada, 'QQQQQQQ');
		checkEncryptUserPassword(yamada, 'QQQ Q Q QQ');
		checkEncryptUserPassword(yamada, ' QQQ QQQQ ');
	});

	test('Use Kanji - 7', () => {
		checkEncryptUserPassword(yamada, '星');
		checkEncryptUserPassword(yamada, ' 星');
		checkEncryptUserPassword(yamada, '星 ');
		checkEncryptUserPassword(yamada, ' 星 ');
	});

	test('Use Kanji - 8', () => {
		checkEncryptUserPassword(yamada, '山田');
		checkEncryptUserPassword(yamada, '山 田');
		checkEncryptUserPassword(yamada, ' 山 田 ');
	});

	test('Use Kanji - 9', () => {
		checkEncryptUserPassword(yamada, '私は一番有名な人です');
		checkEncryptUserPassword(yamada, '私は 一番有 名な人で す');
		checkEncryptUserPassword(yamada, '私 は 一 番 有 名 な 人 で す');
	});

	test('Use Kanji - 10', () => {
		checkEncryptUserPassword(yamada, '私');
	});
});
