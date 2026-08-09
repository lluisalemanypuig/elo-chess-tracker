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

import { Challenge, ChallengeId, toChallengeId } from '@common/models/challenge';
import { numberToString } from '@server/utils/misc';

export const CHALLENGEIDLENGTH = 10;

export function numberToChallengeId(n: number): ChallengeId {
	const s = numberToString(n, CHALLENGEIDLENGTH);
	return toChallengeId(s);
}

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

	static getInstance(): ChallengesManager {
		ChallengesManager.instance = ChallengesManager.instance || new ChallengesManager();
		return ChallengesManager.instance;
	}

	/// Number of games in the system
	private maxChallengeId: number = 0;
	/// The challenges in the system
	private challenges: Challenge[] = [];

	clear(): void {
		this.maxChallengeId = 0;
		this.challenges = [];
	}

	addChallenge(c: Challenge): void {
		this.challenges.push(c);
	}

	removeChallenge(c: Challenge): void {
		const idx = this.getChallengeIndex(c);
		this.removeChallengeIndex(idx);
	}
	removeChallengeIndex(idx: number): void {
		this.challenges.splice(idx, 1);
		if (this.challenges.length === 0) {
			this.maxChallengeId = 0;
		}
	}

	numChallenges(): number {
		return this.challenges.length;
	}

	getChallengeAt(idx: number): Challenge | undefined {
		return 0 <= idx && idx < this.challenges.length ? this.challenges[idx] : undefined;
	}
	getChallengeById(id: ChallengeId): Challenge | undefined {
		return this.getChallengeAt(this.getChallengeIndexById(id));
	}

	getChallengeIndex(c: Challenge): number {
		return this.getChallengeIndexById(c.id);
	}
	getChallengeIndexById(id: ChallengeId): number {
		for (let i = 0; i < this.challenges.length; ++i) {
			if (this.challenges[i].id === id) {
				return i;
			}
		}
		return -1;
	}

	/// Current maximum challenge ID
	getMaxChallengeId(): number {
		return this.maxChallengeId;
	}
	/// Sets the maximum challenge ID
	setMaxChallengeId(id: number): void {
		this.maxChallengeId = id;
	}
	/// Increase current maximum challenge ID
	newChallengeId(): ChallengeId {
		this.maxChallengeId += 1;
		const strId = numberToString(this.maxChallengeId, CHALLENGEIDLENGTH);
		return toChallengeId(strId);
	}
}
