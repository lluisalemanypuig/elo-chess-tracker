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

import { encrypt_password_for_user } from '../src-server/utils/encrypt';

const args = process.argv.slice(2);

const admin_username = args[args.indexOf('--admin-username') + 1];
const admin_password = args[args.indexOf('--admin-password') + 1];

let [encrypted_admin_password, admin_iv] = encrypt_password_for_user(admin_username, admin_password);

const result = {
	admin_password: `${encrypted_admin_password}`,
	admin_iv: `${admin_iv}`
};

console.log(JSON.stringify(result));
