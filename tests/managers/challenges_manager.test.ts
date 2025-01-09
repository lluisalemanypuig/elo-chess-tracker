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

import { ChallengesManager } from '../../src-server/managers/challenges_manager';
import { Challenge } from '../../src-server/models/challenge';
import { number_to_string } from '../../src-server/utils/misc';

describe('Challenges Manager', () => {
	test('Empty manager', () => {
		let challenges = ChallengesManager.get_instance();
		challenges.clear();

		expect(challenges.get_max_challenge_id()).toBe(0);
		expect(challenges.num_challenges()).toBe(0);

		const c = new Challenge('00001', 'a', 'b', '2025-01-07..17:49:20:000');
		expect(challenges.get_challenge_index(c)).toBe(-1);
		expect(challenges.get_challenge_index_by_id('00001')).toBe(-1);
		expect(challenges.get_challenge_index_by_id('00002')).toBe(-1);
		expect(challenges.get_challenge_by_id('00001')).toBe(null);
		expect(challenges.get_challenge_by_id('00002')).toBe(null);
		expect(challenges.get_challenge_at(0)).toBe(null);
		expect(challenges.get_challenge_at(1)).toBe(null);
	});

	test('Set maximum challenge id', () => {
		let challenges = ChallengesManager.get_instance();
		challenges.clear();

		challenges.set_max_challenge_id(3);
		expect(challenges.get_max_challenge_id()).toBe(3);

		challenges.increase_max_challenge_id();
		expect(challenges.get_max_challenge_id()).toBe(4);
	});

	test('Add some challenges', () => {
		let challenges = ChallengesManager.get_instance();
		challenges.clear();

		challenges.increase_max_challenge_id();
		expect(challenges.get_max_challenge_id()).toBe(1);
		const yesterday = new Challenge(number_to_string(challenges.get_max_challenge_id()), 'a', 'b', 'yesterday');

		challenges.increase_max_challenge_id();
		expect(challenges.get_max_challenge_id()).toBe(2);
		const today = new Challenge(number_to_string(challenges.get_max_challenge_id()), 'a', 'b', 'today__');

		challenges.increase_max_challenge_id();
		expect(challenges.get_max_challenge_id()).toBe(3);
		const tomorrow = new Challenge(number_to_string(challenges.get_max_challenge_id()), 'a', 'b', 'tomorrow');

		challenges.add_challenge(yesterday);
		expect(challenges.num_challenges()).toBe(1);
		challenges.add_challenge(today);
		expect(challenges.num_challenges()).toBe(2);
		challenges.add_challenge(tomorrow);
		expect(challenges.num_challenges()).toBe(3);

		expect(challenges.get_challenge_index(yesterday)).toBe(0);
		expect(challenges.get_challenge_index_by_id(yesterday.get_id())).toBe(0);
		expect(challenges.get_challenge_by_id(yesterday.get_id())).toEqual(yesterday);
		expect(challenges.get_challenge_at(0)).toEqual(yesterday);

		expect(challenges.get_challenge_index(today)).toBe(1);
		expect(challenges.get_challenge_index_by_id(today.get_id())).toBe(1);
		expect(challenges.get_challenge_by_id(today.get_id())).toEqual(today);
		expect(challenges.get_challenge_at(1)).toEqual(today);

		expect(challenges.get_challenge_index(tomorrow)).toBe(2);
		expect(challenges.get_challenge_index_by_id(tomorrow.get_id())).toBe(2);
		expect(challenges.get_challenge_by_id(tomorrow.get_id())).toEqual(tomorrow);
		expect(challenges.get_challenge_at(2)).toEqual(tomorrow);
	});

	test('Remove some challenges', () => {
		let challenges = ChallengesManager.get_instance();
		challenges.clear();

		challenges.increase_max_challenge_id();
		expect(challenges.get_max_challenge_id()).toBe(1);
		const yesterday = new Challenge(number_to_string(challenges.get_max_challenge_id()), 'a', 'b', 'yesterday');

		challenges.increase_max_challenge_id();
		expect(challenges.get_max_challenge_id()).toBe(2);
		const today = new Challenge(number_to_string(challenges.get_max_challenge_id()), 'a', 'b', 'today__');

		challenges.increase_max_challenge_id();
		expect(challenges.get_max_challenge_id()).toBe(3);
		const tomorrow = new Challenge(number_to_string(challenges.get_max_challenge_id()), 'a', 'b', 'tomorrow');

		challenges.increase_max_challenge_id();
		expect(challenges.get_max_challenge_id()).toBe(4);
		const day_after_tomorrow = new Challenge(
			number_to_string(challenges.get_max_challenge_id()),
			'a',
			'b',
			'day_after_tomorrow'
		);

		challenges.add_challenge(yesterday);
		challenges.add_challenge(today);
		challenges.add_challenge(tomorrow);

		// ------------------------------------------------------------------------
		challenges.remove_challenge(yesterday);
		expect(challenges.num_challenges()).toBe(2);
		expect(challenges.get_max_challenge_id()).toBe(4);

		expect(challenges.get_challenge_index(yesterday)).toBe(-1);
		expect(challenges.get_challenge_index_by_id(yesterday.get_id())).toBe(-1);
		expect(challenges.get_challenge_by_id(yesterday.get_id())).toEqual(null);

		expect(challenges.get_challenge_index(today)).toBe(0);
		expect(challenges.get_challenge_index_by_id(today.get_id())).toBe(0);
		expect(challenges.get_challenge_by_id(today.get_id())).toEqual(today);

		expect(challenges.get_challenge_index(tomorrow)).toBe(1);
		expect(challenges.get_challenge_index_by_id(tomorrow.get_id())).toBe(1);
		expect(challenges.get_challenge_by_id(tomorrow.get_id())).toEqual(tomorrow);

		expect(challenges.get_challenge_at(0)).toEqual(today);
		expect(challenges.get_challenge_at(1)).toEqual(tomorrow);
		expect(challenges.get_challenge_at(2)).toEqual(null);
		expect(challenges.get_challenge_at(3)).toEqual(null);

		// ------------------------------------------------------------------------
		challenges.add_challenge(day_after_tomorrow);
		expect(challenges.num_challenges()).toBe(3);
		expect(challenges.get_max_challenge_id()).toBe(4);

		expect(challenges.get_challenge_index(yesterday)).toBe(-1);
		expect(challenges.get_challenge_index_by_id(yesterday.get_id())).toBe(-1);
		expect(challenges.get_challenge_by_id(yesterday.get_id())).toEqual(null);

		expect(challenges.get_challenge_index(today)).toBe(0);
		expect(challenges.get_challenge_index_by_id(today.get_id())).toBe(0);
		expect(challenges.get_challenge_by_id(today.get_id())).toEqual(today);

		expect(challenges.get_challenge_index(tomorrow)).toBe(1);
		expect(challenges.get_challenge_index_by_id(tomorrow.get_id())).toBe(1);
		expect(challenges.get_challenge_by_id(tomorrow.get_id())).toEqual(tomorrow);

		expect(challenges.get_challenge_index(day_after_tomorrow)).toBe(2);
		expect(challenges.get_challenge_index_by_id(day_after_tomorrow.get_id())).toBe(2);
		expect(challenges.get_challenge_by_id(day_after_tomorrow.get_id())).toEqual(day_after_tomorrow);

		expect(challenges.get_challenge_at(0)).toEqual(today);
		expect(challenges.get_challenge_at(1)).toEqual(tomorrow);
		expect(challenges.get_challenge_at(2)).toEqual(day_after_tomorrow);
		expect(challenges.get_challenge_at(3)).toEqual(null);

		// ------------------------------------------------------------------------
		challenges.remove_challenge(tomorrow);
		expect(challenges.num_challenges()).toBe(2);
		expect(challenges.get_max_challenge_id()).toBe(4);

		expect(challenges.get_challenge_index(yesterday)).toBe(-1);
		expect(challenges.get_challenge_index_by_id(yesterday.get_id())).toBe(-1);
		expect(challenges.get_challenge_by_id(yesterday.get_id())).toEqual(null);

		expect(challenges.get_challenge_index(today)).toBe(0);
		expect(challenges.get_challenge_index_by_id(today.get_id())).toBe(0);
		expect(challenges.get_challenge_by_id(today.get_id())).toEqual(today);

		expect(challenges.get_challenge_index(tomorrow)).toBe(-1);
		expect(challenges.get_challenge_index_by_id(tomorrow.get_id())).toBe(-1);
		expect(challenges.get_challenge_by_id(tomorrow.get_id())).toEqual(null);

		expect(challenges.get_challenge_index(day_after_tomorrow)).toBe(1);
		expect(challenges.get_challenge_index_by_id(day_after_tomorrow.get_id())).toBe(1);
		expect(challenges.get_challenge_by_id(day_after_tomorrow.get_id())).toEqual(day_after_tomorrow);

		expect(challenges.get_challenge_at(0)).toEqual(today);
		expect(challenges.get_challenge_at(1)).toEqual(day_after_tomorrow);
		expect(challenges.get_challenge_at(2)).toEqual(null);
		expect(challenges.get_challenge_at(3)).toEqual(null);

		// ------------------------------------------------------------------------
		challenges.remove_challenge(today);
		expect(challenges.num_challenges()).toBe(1);
		expect(challenges.get_max_challenge_id()).toBe(4);

		expect(challenges.get_challenge_index(yesterday)).toBe(-1);
		expect(challenges.get_challenge_index_by_id(yesterday.get_id())).toBe(-1);
		expect(challenges.get_challenge_by_id(yesterday.get_id())).toEqual(null);

		expect(challenges.get_challenge_index(today)).toBe(-1);
		expect(challenges.get_challenge_index_by_id(today.get_id())).toBe(-1);
		expect(challenges.get_challenge_by_id(today.get_id())).toEqual(null);

		expect(challenges.get_challenge_index(tomorrow)).toBe(-1);
		expect(challenges.get_challenge_index_by_id(tomorrow.get_id())).toBe(-1);
		expect(challenges.get_challenge_by_id(tomorrow.get_id())).toEqual(null);

		expect(challenges.get_challenge_index(day_after_tomorrow)).toBe(0);
		expect(challenges.get_challenge_index_by_id(day_after_tomorrow.get_id())).toBe(0);
		expect(challenges.get_challenge_by_id(day_after_tomorrow.get_id())).toEqual(day_after_tomorrow);

		expect(challenges.get_challenge_at(0)).toEqual(day_after_tomorrow);
		expect(challenges.get_challenge_at(1)).toEqual(null);
		expect(challenges.get_challenge_at(2)).toEqual(null);
		expect(challenges.get_challenge_at(3)).toEqual(null);

		// ------------------------------------------------------------------------
		challenges.remove_challenge(day_after_tomorrow);
		expect(challenges.num_challenges()).toBe(0);
		expect(challenges.get_max_challenge_id()).toBe(0);

		expect(challenges.get_challenge_index(yesterday)).toBe(-1);
		expect(challenges.get_challenge_index_by_id(yesterday.get_id())).toBe(-1);
		expect(challenges.get_challenge_by_id(yesterday.get_id())).toEqual(null);

		expect(challenges.get_challenge_index(today)).toBe(-1);
		expect(challenges.get_challenge_index_by_id(today.get_id())).toBe(-1);
		expect(challenges.get_challenge_by_id(today.get_id())).toEqual(null);

		expect(challenges.get_challenge_index(tomorrow)).toBe(-1);
		expect(challenges.get_challenge_index_by_id(tomorrow.get_id())).toBe(-1);
		expect(challenges.get_challenge_by_id(tomorrow.get_id())).toEqual(null);

		expect(challenges.get_challenge_index(day_after_tomorrow)).toBe(-1);
		expect(challenges.get_challenge_index_by_id(day_after_tomorrow.get_id())).toBe(-1);
		expect(challenges.get_challenge_by_id(day_after_tomorrow.get_id())).toEqual(null);

		expect(challenges.get_challenge_at(0)).toEqual(null);
		expect(challenges.get_challenge_at(1)).toEqual(null);
		expect(challenges.get_challenge_at(2)).toEqual(null);
		expect(challenges.get_challenge_at(3)).toEqual(null);
	});
});
