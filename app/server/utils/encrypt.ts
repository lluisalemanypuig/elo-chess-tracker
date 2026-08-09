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

import CryptoJS from 'crypto-js';
import { interleaveStrings } from '@server/utils/misc';
import { PlayerPrivateId } from '@common/models/player';
import { Password } from '@common/models/password';

// original allowedSymbols string:
// a!b·c$d%e&f/g(h)i=j?k¿l|m@n#o~p¬qr\'s[¡]t{u}v/w*x-y+zºAªB"C,D.E;F:GHIJKLMNOPQRSTUVWXYZ0123456789

// In case of accidental overwrite, use:
// '$ALLOWED-SYMBOLS-ENCRYPT'.normalize('NFC');
// (replace the dashes '-' with underscores '_')

// This string is randomized by the build script which the administrator must
// use in order to configure the webpage in their machine.
const allowedSymbols: string = '$ALLOWED_SYMBOLS_ENCRYPT'.normalize('NFC');

/// Logarithm of 'x' in base 'base'
function logBase(x: number, base: number): number {
	return Math.log(x) / Math.log(base);
}

/// Next power of 2
function nextPowerOf_2(n: number): number {
	return Math.pow(2, Math.floor(logBase(n, 2)) + 1);
}

/**
 * @brief Padds a string (to the right) until its length is a power of 2
 * @param str A string
 * @returns A longer string padded with random characters
 */
export function normalizeString(str: string): string {
	let newPassword = str.normalize('NFC');

	const currentLength = newPassword.length;
	const nextLength = (function () {
		if (newPassword.length < 4) {
			return nextPowerOf_2(nextPowerOf_2(currentLength));
		}
		return nextPowerOf_2(currentLength);
	})();

	for (let i = currentLength; i < nextLength; ++i) {
		const randIdx = (i - currentLength) % allowedSymbols.length;
		const randChar = allowedSymbols.charAt(randIdx);
		newPassword += randChar;
	}

	return newPassword;
}

/// Encrypts 'plainMsg' using password 'pwd'
export function encryptMessage(plainMsg: string, pwd: string): string {
	return CryptoJS.AES.encrypt(plainMsg, pwd).toString();
}

/// Decrypts 'encryptedMsg' using password 'pwd'
function decryptBytes(encryptedMsg: string, pwd: string) {
	return CryptoJS.AES.decrypt(encryptedMsg, pwd);
}

/// Decrypts 'encryptedMsg' using password 'pwd'
export function decryptMessage(encryptedMsg: string, pwd: string): string {
	try {
		return decryptBytes(encryptedMsg, pwd).toString(CryptoJS.enc.Utf8);
	} catch (error) {
		return '';
	}
}

/**
 * @brief Encrypts the password for a user.
 *
 * In order to store the password of a user in the 'database', it is not just the
 * password alone, but the password provided along with more data (the user name).
 * @param username User name.
 * @param password Password in plain text set by the user.
 * @returns A pair of strings: encrypted text, and random initialization vector of AES (length 16 bytes)
 */
export function encryptPasswordForUser(username: PlayerPrivateId, password: string): [string, string] {
	const normalizedPassword = normalizeString(password);
	const keyUsedToEncrypt = CryptoJS.SHA256(normalizedPassword);

	const actualPasswordToBeEncrypted = interleaveStrings(username, password);

	const iv = CryptoJS.lib.WordArray.random(16);

	const encrypted = CryptoJS.AES.encrypt(actualPasswordToBeEncrypted, keyUsedToEncrypt, {
		iv: iv,
		mode: CryptoJS.mode.CBC,
		padding: CryptoJS.pad.Pkcs7
	});

	return [encrypted.toString(), iv.toString(CryptoJS.enc.Base64)];
}

/**
 * @brief Decrypts @e encryptedMsg using @e password and @e iv.
 * @param encrypted Encrypted message.
 * @param password Password of user (this may not be the string you think it is!).
 * @param iv Initialization vector of AES.
 * @returns A string resulting of decrypting @e encryptedMsg.
 */
export function decryptPasswordForUser(password: string, { encrypted, iv }: Password): string {
	const normalizedPassword = normalizeString(password);
	const keyUsedToDecrypt = CryptoJS.SHA256(normalizedPassword);

	try {
		return CryptoJS.AES.decrypt(encrypted, keyUsedToDecrypt, {
			iv: CryptoJS.enc.Base64.parse(iv),
			mode: CryptoJS.mode.CBC,
			padding: CryptoJS.pad.Pkcs7
		}).toString(CryptoJS.enc.Utf8);
	} catch (e) {
		return '';
	}
}

/**
 * @brief Checks that @e password is the actual password of user @e username.
 *
 * Decrypts @e encryptedMsg with @e password and @e iv and checks
 * that the result is correct.
 * @param encryptedPassword Encrypted message
 * @param username Username of user
 * @param password Password of user
 * @param iv Initialization vector of AES
 * @returns True or false whether @e password is the actual password or not.
 */
export function isPasswordOfUserCorrect(
	username: PlayerPrivateId,
	password: string,
	actualPassword: Password
): boolean {
	const decrypted = decryptPasswordForUser(password, actualPassword);
	const interleave = interleaveStrings(username, password);
	return decrypted === interleave;
}
