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

import { isDefined, isNotDefined } from '@common/utils/is-defined';
import { User } from '@common/models/user';
import { searchLinearByKey } from '@server/utils/searching';
import { PlayerPrivateId, PlayerPublicId, toPlayerPublicId } from '@common/models/player';

interface UserBundle {
	user: User;
	publicId: PlayerPublicId;
	index: number;
}

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

	static getInstance(): UsersManager {
		UsersManager.instance = UsersManager.instance || new UsersManager();
		return UsersManager.instance;
	}

	/// The list of users in the database
	private users: User[] = [];
	/// The list of random user IDS for every user.
	private publicIds: PlayerPublicId[] = [];

	all(): User[] {
		return this.users;
	}

	clear() {
		this.users = [];
		this.publicIds = [];
	}

	exists(username: PlayerPrivateId): boolean {
		return isDefined(this.getIndexByPrivateId(username));
	}

	addUser(u: User) {
		this.users.push(u);

		// stupid and slow way of generating a unique random id
		let publicId = Math.floor(Math.random() * 10_000_000);
		while (publicId in this.publicIds) {
			publicId = Math.floor(Math.random() * 10_000_000);
		}
		this.publicIds.push(toPlayerPublicId(publicId));
	}
	replaceUser(u: User, idx: number) {
		if (!(0 <= idx && idx < this.users.length)) {
			throw new Error('Index out of bounds');
		}
		delete this.users[idx];
		this.users[idx] = u;
	}

	getIndexByPrivateId(username: PlayerPrivateId): number | undefined {
		const idx = searchLinearByKey(this.users, (u: User): boolean => {
			return u.username === username;
		});
		return idx !== -1 ? idx : undefined;
	}
	getIndexByPublicId(publicId: PlayerPublicId): number | undefined {
		const idx = searchLinearByKey(this.publicIds, (n: number): boolean => {
			return n === publicId;
		});
		return idx !== -1 ? idx : undefined;
	}

	getAllUserDataByPublicId(publicId: PlayerPublicId): UserBundle | undefined {
		const idx = this.getIndexByPublicId(publicId);
		if (isNotDefined(idx)) {
			return undefined;
		}
		return this.getAllUserDataAtSafeIdx(idx);
	}
	getAllUserDataByPrivateId(username: PlayerPrivateId): UserBundle | undefined {
		const idx = this.getIndexByPrivateId(username);
		if (isNotDefined(idx)) {
			return undefined;
		}
		return this.getAllUserDataAtSafeIdx(idx);
	}
	getAllUserDataAtIdx(idx: number): UserBundle | undefined {
		if (!(0 <= idx && idx < this.publicIds.length)) {
			return undefined;
		}
		return this.getAllUserDataAtSafeIdx(idx);
	}
	getAllUserDataAtSafeIdx(idx: number): UserBundle {
		return {
			user: this.users[idx],
			publicId: this.publicIds[idx],
			index: idx
		};
	}

	numUsers(): number {
		return this.users.length;
	}
}
