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

import { User } from "../models/user";
import { Challenge } from '../models/challenge';
import { SessionID } from "./session_id";

/**
 * @brief A singleton class to store data at runtime
 * 
 * Stores things like users session ids.
 */
export class ServerMemory {

	/// The only instance of this class
	private static m_instance: ServerMemory;

	constructor() {
		if (ServerMemory.m_instance) {
			return ServerMemory.m_instance;
		}
		ServerMemory.m_instance = this;
	}

	static get_instance(): ServerMemory {
		ServerMemory.m_instance = ServerMemory.m_instance || new ServerMemory();
		return ServerMemory.m_instance;
	}

	/// Set of users
	private users: User[] = [];
	private user_to_index: Map<string, number> = new Map();

	add_user(u: User): void {
		this.users.push(u);
	}
	add_user_index(u: User, i: number): void {
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

	/// Session ids of the server.
	private session_ids: SessionID[] = [];

	add_session_id(id: SessionID): void {
		this.session_ids.push(id);
	}
	num_session_ids(): number {
		return this.session_ids.length;
	}
	index_session_id(id: string, username: string): number {
		if (id == undefined || username == undefined) { return -1; }
		for (let i = 0; i < this.session_ids.length; ++i) {
			if (this.session_ids[i].id == id &&
				this.session_ids[i].username == username
			)
			{
				return i;
			}
		}
		return -1;
	}
	has_session_id(id: string, username: string): boolean {
		return this.index_session_id(id, username) != -1;
	}
	remove_session_id(i: number): void {
		this.session_ids.splice(i, 1);
	}
	clear_session_ids(): void {
		this.session_ids = [];
	}

	/// The challenges in the system
	private challenges: Challenge[] = [];

	add_challenge(c: Challenge): void {
		this.challenges.push(c);
	}
	remove_challenge(i: number): void {
		this.challenges.splice(i, 1);
	}
	num_challenges(): number {
		return this.challenges.length;
	}
	get_challenge(i: number): Challenge {
		return this.challenges[i];
	}
	last_challenge(): Challenge {
		return this.challenges[this.challenges.length - 1];
	}

	/// Number of games in the system
	private max_game_id: number = 0;
	/// Map from game ID to game record (file)
	private game_id_to_record_date: Map<string, string> = new Map();

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
