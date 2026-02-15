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

/**
 * @brief Users Behavior singleton class
 *
 * Stores optional behaviors in the chess club that are not entirely attached to
 * user roles.
 */
export class UsersBehavior {
	/// The only instance of this class
	private static instance: UsersBehavior;

	constructor() {
		if (UsersBehavior.instance) {
			return UsersBehavior.instance;
		}
		UsersBehavior.instance = this;
	}

	static get_instance(): UsersBehavior {
		UsersBehavior.instance = UsersBehavior.instance || new UsersBehavior();
		return UsersBehavior.instance;
	}

	/// Higher rated player can decline challenge from a lower rated player
	private hrp_decline_challenge_lrt: boolean = false;

	set_higher_rated_decline_challenge_lower_rated(v: boolean): void {
		this.hrp_decline_challenge_lrt = v;
	}

	can_higher_rated_decline_challenge_lower_rated(): boolean {
		return this.hrp_decline_challenge_lrt;
	}

	// -------

	clear() {
		this.hrp_decline_challenge_lrt = false;
	}
}
