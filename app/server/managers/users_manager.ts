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

import { isDefined } from '@common/utils/is_defined';
import { User } from '@common/models/user';
import { search_linear_by_key } from '@server/utils/searching';
import { PlayerPrivateId, PlayerPublicId, toPlayerPublicId } from '@app/common/models/player';

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
	private public_ids: PlayerPublicId[] = [];

	all(): User[] {
		return this.users;
	}

	clear(): void {
		this.users = [];
		this.public_ids = [];
	}

	exists(username: PlayerPrivateId): boolean {
		return isDefined(this.get_user_by_username(username));
	}

	add_user(u: User): void {
		this.users.push(u);

		// stupid and slow way of generating a unique random id
		let new_randid = Math.floor(Math.random() * 10_000_000);
		while (new_randid in this.public_ids) {
			new_randid = Math.floor(Math.random() * 10_000_000);
		}
		this.public_ids.push(toPlayerPublicId(new_randid));
	}
	replace_user(u: User, idx: number): void {
		if (!(0 <= idx && idx < this.users.length)) {
			throw new Error('Index out of bounds');
		}
		delete this.users[idx];
		this.users[idx] = u;
	}

	get_user_by_username(username: PlayerPrivateId): User | undefined {
		const idx = search_linear_by_key(this.users, (u: User): boolean => {
			return u.username == username;
		});
		return idx != -1 ? this.get_user_at(idx) : undefined;
	}
	get_user_by_public_id(rid: PlayerPublicId): User | undefined {
		const idx = search_linear_by_key(this.public_ids, (id: PlayerPublicId): boolean => {
			return id == rid;
		});
		return idx != -1 ? this.get_user_at(idx) : undefined;
	}

	get_user_at(idx: number): User | undefined {
		return 0 <= idx && idx < this.users.length ? this.users[idx] : undefined;
	}
	get_user_public_id_at(idx: number): PlayerPublicId | undefined {
		return 0 <= idx && idx < this.public_ids.length ? this.public_ids[idx] : undefined;
	}

	get_user_index(u: User): number | undefined {
		return this.get_user_index_by_username(u.username);
	}
	get_user_index_by_username(username: PlayerPrivateId): number | undefined {
		const idx = search_linear_by_key(this.users, (u: User): boolean => {
			return u.username == username;
		});
		return idx != -1 ? idx : undefined;
	}

	num_users(): number {
		return this.users.length;
	}
}
