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

/**
 * @brief A structure that encodes a session.
 *
 * It consists of an identifier string and a username
 */
export class SessionID {
	public readonly token: string;
	public readonly username: string;
	constructor(token: string, username: string) {
		this.token = token;
		this.username = username;
	}

	static get_field_token_name(): string {
		return 'token';
	}
	static get_field_username_name(): string {
		return 'username';
	}

	static from_cookie(cookie: any): SessionID {
		return new SessionID(cookie.token, cookie.username);
	}
}
