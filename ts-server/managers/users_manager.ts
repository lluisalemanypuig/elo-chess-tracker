/*
Elo rating for a Chess Club
Copyright (C) 2023 - 2025  Lluís Alemany Puig

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

import { User } from '../models/user';

/**
 * @brief A singleton class to store data at runtime
 *
 * Stores things like users session ids.
 */
export class UsersManager {
	/// The only instance of this class
	private static instance: UsersManager;

	constructor() {
		if (UsersManager.instance) {
			return UsersManager.instance;
		}
		UsersManager.instance = this;
	}

	static get_instance(): UsersManager {
		UsersManager.instance = UsersManager.instance || new UsersManager();
		return UsersManager.instance;
	}

	/// Set of users
	private users: User[] = [];
	private user_to_index: Map<string, number> = new Map();

	clear(): void {
		this.users = [];
		this.user_to_index.clear();
	}

	add_user(u: User): void {
		const i = this.users.length;
		this.users.push(u);
		this.user_to_index.set(u.get_username(), i);
	}
	replace_user(u: User, i: number): void {
		delete this.users[i];
		this.users[i] = u;
	}
	get_user(i: number): User {
		return this.users[i];
	}
	get_user_index(username: string): number | undefined {
		return this.user_to_index.get(username);
	}
	num_users(): number {
		return this.users.length;
	}
}
