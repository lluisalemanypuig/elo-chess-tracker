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

import { encrypt_password_for_user } from '@server/utils/encrypt';

const args = process.argv.slice(2);

const username_index = args.indexOf('--username');
if (username_index == -1) {
	console.log('Missing --username parameter');
	process.exit(1);
}

const password_index = args.indexOf('--password');
if (password_index == -1) {
	console.log('Missing --password parameter');
	process.exit(1);
}

const username = args[username_index + 1];
const password = args[password_index + 1];

console.log(`Username: '${username}'`);
console.log(`Psasword: '${password}'`);

let [encrypted_password, iv] = encrypt_password_for_user(username, password);

const result = {
	encrypted: `${encrypted_password}`,
	iv: `${iv}`
};

console.log(JSON.stringify(result));
