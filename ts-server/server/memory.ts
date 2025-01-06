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
import { Challenge } from '../models/challenge';
import { SessionID } from '../models/session_id';

/**
 * @brief A singleton class to store data at runtime
 *
 * Stores things like users session ids.
 */
export class ServerUsers {
	/// The only instance of this class
	private static instance: ServerUsers;

	constructor() {
		if (ServerUsers.instance) {
			return ServerUsers.instance;
		}
		ServerUsers.instance = this;
	}

	static get_instance(): ServerUsers {
		ServerUsers.instance = ServerUsers.instance || new ServerUsers();
		return ServerUsers.instance;
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

export class ServerSessionID {
	/// The only instance of this class
	private static instance: ServerSessionID;

	constructor() {
		if (ServerSessionID.instance) {
			return ServerSessionID.instance;
		}
		ServerSessionID.instance = this;
	}

	static get_instance(): ServerSessionID {
		ServerSessionID.instance = ServerSessionID.instance || new ServerSessionID();
		return ServerSessionID.instance;
	}

	/// Session ids of the server.
	private session_ids: SessionID[] = [];

	clear(): void {
		this.session_ids = [];
	}

	add_session_id(id: SessionID): void {
		this.session_ids.push(id);
	}
	num_session_ids(): number {
		return this.session_ids.length;
	}
	index_session_id(session: SessionID): number {
		for (let i = 0; i < this.session_ids.length; ++i) {
			if (this.session_ids[i].id == session.id && this.session_ids[i].username == session.username) {
				return i;
			}
		}
		return -1;
	}
	has_session_id(session: SessionID): boolean {
		return this.index_session_id(session) != -1;
	}
	remove_session_id(i: number): void {
		this.session_ids.splice(i, 1);
	}
	clear_session_ids(): void {
		this.session_ids = [];
	}
	remove_user_sessions(username: string): void {
		for (let i = this.session_ids.length - 1; i >= 0; --i) {
			if (this.session_ids[i].username == username) {
				this.remove_session_id(i);
			}
		}
	}
}

export class ServerChallenges {
	/// The only instance of this class
	private static instance: ServerChallenges;

	constructor() {
		if (ServerChallenges.instance) {
			return ServerChallenges.instance;
		}
		ServerChallenges.instance = this;
	}

	static get_instance(): ServerChallenges {
		ServerChallenges.instance = ServerChallenges.instance || new ServerChallenges();
		return ServerChallenges.instance;
	}

	/// The challenges in the system
	private challenges: Challenge[] = [];

	clear(): void {
		this.challenges = [];
	}

	add_challenge(c: Challenge): void {
		this.challenges.push(c);
	}

	remove_challenge(c: Challenge): void {
		const idx = this.get_challenge_index(c);
		this.remove_challenge_index(idx);
	}
	remove_challenge_index(i: number): void {
		this.challenges.splice(i, 1);
	}

	num_challenges(): number {
		return this.challenges.length;
	}

	get_challenge(idx: number): Challenge | null {
		return idx != -1 ? this.challenges[idx] : null;
	}
	get_challenge_id(id: string): Challenge | null {
		return this.get_challenge(this.get_challenge_index_id(id));
	}

	get_challenge_index(c: Challenge): number {
		return this.get_challenge_index_id(c.get_id());
	}
	get_challenge_index_id(id: string): number {
		for (let i = 0; i < this.challenges.length; ++i) {
			if (this.challenges[i].get_id() == id) {
				return i;
			}
		}
		return -1;
	}

	last_challenge(): Challenge {
		return this.challenges[this.challenges.length - 1];
	}
	new_challenge_id(): number {
		return this.num_challenges() == 0 ? 1 : parseInt(this.last_challenge().get_id(), 10) + 1;
	}
}

export class ServerGames {
	/// The only instance of this class
	private static instance: ServerGames;

	constructor() {
		if (ServerGames.instance) {
			return ServerGames.instance;
		}
		ServerGames.instance = this;
	}

	static get_instance(): ServerGames {
		ServerGames.instance = ServerGames.instance || new ServerGames();
		return ServerGames.instance;
	}

	/// Number of games in the system
	private max_game_id: number = 0;
	/// Map from game ID to game record (file)
	private game_id_to_record_date: Map<string, string> = new Map();

	clear(): void {
		this.max_game_id = 0;
		this.game_id_to_record_date.clear();
	}

	/// Current maximum game ID
	get_max_game_id(): number {
		return this.max_game_id;
	}
	/// Sets the maximum game ID
	set_max_game_id(id: number): void {
		this.max_game_id = id;
	}
	/// Current maximum game ID
	new_max_game_id(): number {
		this.max_game_id += 1;
		return this.max_game_id;
	}

	/// Returns the date record file in which we find the game ID passed as parameter.
	get_game_id_record_date(game_id: string): string | undefined {
		return this.game_id_to_record_date.get(game_id);
	}
	// Sets the date record file 'when' in which we find the game ID passed as parameter.
	set_game_id_record_date(game_id: string, when: string): void {
		this.game_id_to_record_date.set(game_id, when);
	}
}
