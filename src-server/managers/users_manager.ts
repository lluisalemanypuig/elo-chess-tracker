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

import { User, UserRandomID } from '../models/user';
import { search_linear_by_key } from '../utils/searching';

/**
 * @brief Users Manager singleton class
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

	/// The list of users in the database
	private users: User[] = [];
	/// The list of random user IDS for every user.
	private random_ids: UserRandomID[] = [];

	all(): User[] {
		return this.users;
	}

	clear(): void {
		this.users = [];
		this.random_ids = [];
	}

	exists(username: string): boolean {
		return this.get_user_by_username(username) != undefined;
	}

	add_user(u: User): void {
		this.users.push(u);

		const new_randid = Math.floor(Math.random() * 1000000);
		this.random_ids.push(new_randid);
	}
	replace_user(u: User, idx: number): void {
		if (!(0 <= idx && idx < this.users.length)) {
			throw new Error('Index out of bounds');
		}
		delete this.users[idx];
		this.users[idx] = u;
	}

	get_user_by_username(username: string): User | undefined {
		const idx = search_linear_by_key(this.users, (u: User): boolean => {
			return u.get_username() == username;
		});
		return idx != -1 ? this.get_user_at(idx) : undefined;
	}
	get_user_by_random_id(rid: UserRandomID): User | undefined {
		const idx = search_linear_by_key(this.random_ids, (id: UserRandomID): boolean => {
			return id == rid;
		});
		return idx != -1 ? this.get_user_at(idx) : undefined;
	}

	get_user_at(idx: number): User | undefined {
		return 0 <= idx && idx < this.users.length ? this.users[idx] : undefined;
	}
	get_user_random_ID_at(idx: number): UserRandomID | undefined {
		return 0 <= idx && idx < this.random_ids.length ? this.random_ids[idx] : undefined;
	}

	get_user_index(u: User): number | undefined {
		return this.get_user_index_by_username(u.get_username());
	}
	get_user_index_by_username(username: string): number | undefined {
		const idx = search_linear_by_key(this.users, (u: User): boolean => {
			return u.get_username() == username;
		});
		return idx != -1 ? idx : undefined;
	}

	num_users(): number {
		return this.users.length;
	}
}
