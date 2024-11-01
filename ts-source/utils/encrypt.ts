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

import CryptoJS from 'crypto-js';
import { interleave_strings } from './misc';

/// Encrypts 'plain_msg' using password 'pwd'
export function encrypt_message(plain_msg: string, pwd: string): string {
	return CryptoJS.AES.encrypt(plain_msg, pwd).toString();
}

/// Decrypts 'encrypted_msg' using password 'pwd'
function decrypt_bytes(encrypted_msg: string, pwd: string): any {
	return CryptoJS.AES.decrypt(encrypted_msg, pwd);
}

/// Decrypts 'encrypted_msg' using password 'pwd'
export function decrypt_message(encrypted_msg: string, pwd: string): string {
	return decrypt_bytes(encrypted_msg, pwd).toString(CryptoJS.enc.Utf8);
}

/// Logarithm of 'x' in base 'base'
function log_base(x: number, base: number): number {
	return Math.log(x)/Math.log(base);
};

/// Is a number a power of 2?
function is_power_of_2(n: number): boolean {
	if (n == 0) { return false; }
	if (n <= 2) { return true; }
	return Math.pow( 2, Math.floor(log_base(n, 2)) ) == n;
}

/// Next power of 2
function next_power_of_2(n: number): number {
	return Math.pow( 2, Math.floor(log_base(n, 2)) + 1 );
}

/**
 * @brief Padds a string (password) until its length is a power of 2
 * @param password A string
 * @returns A longer string padded with random characters
 */
function normalize_password(password: string): string {
	let next_length = 0;
	if (password.length < 4) {
		next_length = next_power_of_2(next_power_of_2(password.length));
	}
	else {
		next_length = next_power_of_2(password.length);
	}

	const allowed_symbols = "a!b·c$d%e&f/g(h)i=j?k¿l|m@n#o~p¬qr's[¡]t{u}v/w*x-y+zºAªB\"C,D.E;F:G_HIJKLMNOPQRSTUVWXYZ0123456789 ";
	for (let i = password.length; i < next_length; ++i) {
		const rand_idx = (i - password.length)%allowed_symbols.length;
		const rand_char = allowed_symbols.charAt(rand_idx);
		password += rand_char;
	}

	return password;
}

/**
 * @brief Encrypts a password for a user
 * @param username User name
 * @param password Password in plain text
 * @returns A pair of strings: encrypted text, and random initialization vector of AES (length 32 bytes)
 */
export function encrypt_password_for_user(
	username: string,
	password: string
):
[string, string]
{
	const text = interleave_strings(username, password);

	password = normalize_password(password);
	const key = CryptoJS.enc.Utf8.parse(password);

	const iv = CryptoJS.lib.WordArray.random(16);

	const encrypted = CryptoJS.AES.encrypt(
		text,
		key,
		{
			iv: iv,
			mode: CryptoJS.mode.CBC,
			padding: CryptoJS.pad.Pkcs7
		}
	);
	return [encrypted.toString(), iv.toString(CryptoJS.enc.Base64)];
}

/**
 * @brief Decrypts @e encrypted_msg using @e password and @e iv.
 * @param encrypted_msg Encrypted message
 * @param password Password of user
 * @param iv Initialization vector of AES
 * @returns A string resulting of decrypting @e encrypted_msg.
 */
export function decrypt_password_for_user(
	encrypted_msg: string,
	password: string,
	iv: string
):
string
{
	password = normalize_password(password);
	const key = CryptoJS.enc.Utf8.parse(password);
	
	let dec = CryptoJS.AES.decrypt(
		encrypted_msg,
		key,
		{
			iv: CryptoJS.enc.Base64.parse(iv),
			mode: CryptoJS.mode.CBC,
    		padding: CryptoJS.pad.Pkcs7
		}
	);

	let result: string;
	try {
		result = dec.toString(CryptoJS.enc.Utf8);
	}
	catch (exception) {
		result = "";
	}
	return result;
}

/**
 * @brief Checks that @e password is the actual password of user @e username.
 * 
 * Decrypts @e encrypted_msg with @e password and @e iv and checks
 * that the result is correct.
 * @param encrypted_msg Encrypted message
 * @param username Username of user
 * @param password Password of user
 * @param iv Initialization vector of AES
 * @returns True or false whether @e password is the actual password or not.
 */
export function is_password_of_user_correct(
	encrypted_msg: string,
	username: string,
	password: string,
	iv: string
):
boolean
{
	const decr = decrypt_password_for_user(encrypted_msg, password, iv);
	return decr == interleave_strings(username, password);
}
