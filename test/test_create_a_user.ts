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

import {
	decrypt_password_for_user,
	encrypt_password_for_user,
	is_password_of_user_correct
} from '../ts-source/utils/encrypt';

let username = '';
let password = '';

console.log('-------------------');
console.log(`Username: '${username}'`);

let encrypted = encrypt_password_for_user(username, password);

const encrypted_password = encrypted[0];
const iv = encrypted[1];
console.log(`Encrypted text: '${encrypted_password}'`);
console.log(`IV: '${iv}'`);

let decrypted = decrypt_password_for_user(encrypted_password, password, iv);
console.log(`Decrypted: '${decrypted}'`);

console.log('Is password correct?', is_password_of_user_correct(encrypted_password, username, password, iv));
