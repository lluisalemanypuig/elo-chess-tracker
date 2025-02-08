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

import { Challenge, ChallengeID } from '../models/challenge';
import { number_to_string } from '../utils/misc';

/**
 * @brief Challenges Manager singleton class.
 *
 * This class stores all challenges in memory for fast retrieval. A large number
 * of challenges is never expected.
 */
export class ChallengesManager {
	/// The only instance of this class
	private static instance: ChallengesManager;

	constructor() {
		if (ChallengesManager.instance) {
			return ChallengesManager.instance;
		}
		ChallengesManager.instance = this;
	}

	static get_instance(): ChallengesManager {
		ChallengesManager.instance = ChallengesManager.instance || new ChallengesManager();
		return ChallengesManager.instance;
	}

	/// Number of games in the system
	private max_challenge_id: number = 0;
	/// The challenges in the system
	private challenges: Challenge[] = [];

	clear(): void {
		this.max_challenge_id = 0;
		this.challenges = [];
	}

	add_challenge(c: Challenge): void {
		this.challenges.push(c);
	}

	remove_challenge(c: Challenge): void {
		const idx = this.get_challenge_index(c);
		this.remove_challenge_index(idx);
	}
	remove_challenge_index(idx: number): void {
		this.challenges.splice(idx, 1);
		if (this.challenges.length == 0) {
			this.max_challenge_id = 0;
		}
	}

	num_challenges(): number {
		return this.challenges.length;
	}

	get_challenge_at(idx: number): Challenge | undefined {
		return 0 <= idx && idx < this.challenges.length ? this.challenges[idx] : undefined;
	}
	get_challenge_by_id(id: ChallengeID): Challenge | undefined {
		return this.get_challenge_at(this.get_challenge_index_by_id(id));
	}

	get_challenge_index(c: Challenge): number {
		return this.get_challenge_index_by_id(c.get_id());
	}
	get_challenge_index_by_id(id: ChallengeID): number {
		for (let i = 0; i < this.challenges.length; ++i) {
			if (this.challenges[i].get_id() == id) {
				return i;
			}
		}
		return -1;
	}

	/// Current maximum challenge ID
	get_max_challenge_id(): number {
		return this.max_challenge_id;
	}
	/// Sets the maximum challenge ID
	set_max_challenge_id(id: number): void {
		this.max_challenge_id = id;
	}
	/// Increase current maximum challenge ID
	new_challenge_id(): ChallengeID {
		this.max_challenge_id += 1;
		return number_to_string(this.max_challenge_id);
	}
}
