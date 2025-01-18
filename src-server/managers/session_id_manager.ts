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

import { SessionID } from '../models/session_id';
import { search_linear_by_key } from '../utils/searching';

export class SessionIDManager {
	/// The only instance of this class
	private static instance: SessionIDManager;

	constructor() {
		if (SessionIDManager.instance) {
			return SessionIDManager.instance;
		}
		SessionIDManager.instance = this;
	}

	static get_instance(): SessionIDManager {
		SessionIDManager.instance = SessionIDManager.instance || new SessionIDManager();
		return SessionIDManager.instance;
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
		return search_linear_by_key(this.session_ids, (s: SessionID): boolean => {
			return s.token == session.token && s.username == session.username;
		});
	}
	has_session_id(session: SessionID): boolean {
		return this.index_session_id(session) != -1;
	}
	clear_session_ids(): void {
		this.session_ids = [];
	}
	remove_session_id(idx: number): void {
		this.session_ids.splice(idx, 1);
	}
	remove_user_sessions(username: string): void {
		for (let i = this.session_ids.length - 1; i >= 0; --i) {
			if (this.session_ids[i].username == username) {
				this.remove_session_id(i);
			}
		}
	}
}
