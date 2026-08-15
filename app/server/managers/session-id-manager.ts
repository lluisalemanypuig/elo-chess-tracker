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

import { PlayerPublicId } from '@common/models/player-id';
import { SessionId } from '@common/models/session-id';
import { searchLinearByKey } from '@server/utils/searching';

/**
 * @brief Session ID Manager singleton class
 *
 * This class stores in memory the session IDs of all the users who logged into
 * the webpage.
 */
export class SessionIDManager {
	/// The only instance of this class
	private static instance: SessionIDManager;

	constructor() {
		if (SessionIDManager.instance) {
			return SessionIDManager.instance;
		}
		SessionIDManager.instance = this;
	}

	static getInstance(): SessionIDManager {
		SessionIDManager.instance = SessionIDManager.instance || new SessionIDManager();
		return SessionIDManager.instance;
	}

	/// Session ids of the server.
	private sessionIds: SessionId[] = [];

	clear() {
		this.sessionIds = [];
	}

	addSessionId(id: SessionId) {
		this.sessionIds.push(id);
	}
	numSessionIds(): number {
		return this.sessionIds.length;
	}
	indexSessionId(session: SessionId): number {
		return searchLinearByKey(this.sessionIds, (s: SessionId): boolean => {
			return s.token === session.token && s.publicId === session.publicId;
		});
	}
	hasSessionId(session: SessionId): boolean {
		return this.indexSessionId(session) !== -1;
	}
	removeSessionId(idx: number) {
		this.sessionIds.splice(idx, 1);
	}
	removeUserSessions(publicId: PlayerPublicId) {
		for (let i = this.sessionIds.length - 1; i >= 0; --i) {
			if (this.sessionIds[i].publicId === publicId) {
				this.removeSessionId(i);
			}
		}
	}
}
