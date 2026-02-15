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

import { Challenge } from '../../src-server/models/challenge';

describe('Sets and gets', () => {
	test('Constructor', () => {
		const c = new Challenge('000x1', 'A', 'B', 'blitz', 'Blitz (5 + 3)', '2024-12-29..14:00:00');

		expect(c.get_id()).toBe('000x1');
		expect(c.get_sent_by()).toBe('A');
		expect(c.get_sent_to()).toBe('B');
		expect(c.get_when_challenge_sent()).toBe('2024-12-29..14:00:00');
	});

	test('Set fields - 1', () => {
		let c = new Challenge('000x1', 'A', 'B', 'blitz', 'Blitz (5 + 3)', '2024-12-29..14:00:00');

		expect(c.get_id()).toBe('000x1');
		expect(c.get_sent_by()).toBe('A');
		expect(c.get_sent_to()).toBe('B');
		expect(c.get_when_challenge_sent()).toBe('2024-12-29..14:00:00');

		c.set_challenge_accepted('2024-12-29..14:00:01');

		expect(c.get_when_challenge_accepted()).toBe('2024-12-29..14:00:01');
		expect(c.was_result_set()).toBe(false);

		expect(() => c.set_result('A', '2024-12-29..14:00:02', 'A', 'B', 'black_wins')).not.toThrow();

		expect(c.was_result_set()).toBe(true);
		expect(c.get_result_set_by()).toBe('A');
		expect(c.get_when_result_set()).toBe('2024-12-29..14:00:02');
		expect(c.get_white()).toBe('A');
		expect(c.get_black()).toBe('B');
		expect(c.get_result()).toBe('black_wins');
		expect(c.get_time_control_id()).toBe('blitz');
		expect(c.get_time_control_name()).toBe('Blitz (5 + 3)');

		expect(() => c.set_result_accepted('B', '2024-12-29..14:00:03')).not.toThrow();

		expect(c.get_when_result_accepted()).toBe('2024-12-29..14:00:03');
		expect(c.get_result_accepted_by()).toBe('B');
		expect(c.get_result_accepted_by()).not.toBe('A');
	});

	test('Set fields - 2', () => {
		let c = new Challenge('000x1', 'A', 'B', 'blitz', 'Blitz (5 + 3)', '2024-12-29..14:00:00');

		expect(c.get_id()).toBe('000x1');
		expect(c.get_sent_by()).toBe('A');
		expect(c.get_sent_to()).toBe('B');
		expect(c.get_when_challenge_sent()).toBe('2024-12-29..14:00:00');

		c.set_challenge_accepted('2024-12-29..14:00:01');

		expect(c.get_when_challenge_accepted()).toBe('2024-12-29..14:00:01');
		expect(c.was_result_set()).toBe(false);

		expect(() => c.set_result('A', '2024-12-29..14:00:02', 'B', 'A', 'draw')).not.toThrow();

		expect(c.was_result_set()).toBe(true);
		expect(c.get_result_set_by()).toBe('A');
		expect(c.get_when_result_set()).toBe('2024-12-29..14:00:02');
		expect(c.get_white()).toBe('B');
		expect(c.get_black()).toBe('A');
		expect(c.get_result()).toBe('draw');
		expect(c.get_time_control_id()).toBe('blitz');
		expect(c.get_time_control_name()).toBe('Blitz (5 + 3)');

		expect(() => c.set_result_accepted('B', '2024-12-29..14:00:03')).not.toThrow();

		expect(c.get_when_result_accepted()).toBe('2024-12-29..14:00:03');
		expect(c.get_result_accepted_by()).toBe('B');
		expect(c.get_result_accepted_by()).not.toBe('A');
	});

	test('Set fields - 3', () => {
		let c = new Challenge('000x1', 'A', 'B', 'blitz', 'Blitz (5 + 3)', '2024-12-29..14:00:00');

		expect(c.get_id()).toBe('000x1');
		expect(c.get_sent_by()).toBe('A');
		expect(c.get_sent_to()).toBe('B');
		expect(c.get_when_challenge_sent()).toBe('2024-12-29..14:00:00');

		c.set_challenge_accepted('2024-12-29..14:00:01');

		expect(c.get_when_challenge_accepted()).toBe('2024-12-29..14:00:01');
		expect(c.was_result_set()).toBe(false);

		expect(() => c.set_result('A', '2024-12-29..14:00:02', 'B', 'A', 'draw')).not.toThrow();

		expect(c.was_result_set()).toBe(true);
		expect(c.get_result_set_by()).toBe('A');
		expect(c.get_when_result_set()).toBe('2024-12-29..14:00:02');
		expect(c.get_white()).toBe('B');
		expect(c.get_black()).toBe('A');
		expect(c.get_result()).toBe('draw');
		expect(c.get_time_control_id()).toBe('blitz');
		expect(c.get_time_control_name()).toBe('Blitz (5 + 3)');

		expect(() => c.set_result_accepted('A', '2024-12-29..14:00:03')).toThrow();

		expect(c.get_when_result_accepted()).toBe(undefined);
		expect(c.get_result_accepted_by()).toBe(undefined);
	});

	test('Set fields - 4', () => {
		let c = new Challenge('000x1', 'A', 'B', 'blitz', 'Blitz (5 + 3)', '2024-12-29..14:00:00');

		expect(c.get_id()).toBe('000x1');
		expect(c.get_sent_by()).toBe('A');
		expect(c.get_sent_to()).toBe('B');
		expect(c.get_when_challenge_sent()).toBe('2024-12-29..14:00:00');

		c.set_challenge_accepted('2024-12-29..14:00:01');

		expect(c.get_when_challenge_accepted()).toBe('2024-12-29..14:00:01');
		expect(c.was_result_set()).toBe(false);

		expect(() => c.set_result_accepted('A', '2024-12-29..14:00:03')).toThrow();

		expect(c.get_when_result_accepted()).toBe(undefined);
		expect(c.get_result_accepted_by()).toBe(undefined);
	});

	test('Set fields - 5', () => {
		let c = new Challenge('000x1', 'A', 'B', 'blitz', 'Blitz (5 + 3)', '2024-12-29..14:00:00');

		expect(c.get_id()).toBe('000x1');
		expect(c.get_sent_by()).toBe('A');
		expect(c.get_sent_to()).toBe('B');
		expect(c.get_when_challenge_sent()).toBe('2024-12-29..14:00:00');

		c.set_challenge_accepted('2024-12-29..14:00:01');

		expect(c.get_when_challenge_accepted()).toBe('2024-12-29..14:00:01');
		expect(c.was_result_set()).toBe(false);

		expect(() => c.set_result('a', '2024-12-29..14:00:02', 'A', 'B', 'black_wins')).toThrow();
		expect(() => c.set_result('A', '2024-12-29..14:00:02', 'a', 'B', 'black_wins')).toThrow();
		expect(() => c.set_result('A', '2024-12-29..14:00:02', 'A', 'b', 'black_wins')).toThrow();

		expect(c.was_result_set()).toBe(false);
		expect(c.get_result_set_by()).toBe(undefined);
		expect(c.get_when_result_set()).toBe(undefined);
		expect(c.get_white()).toBe(undefined);
		expect(c.get_black()).toBe(undefined);
		expect(c.get_result()).toBe(undefined);
		expect(c.get_time_control_id()).toBe('blitz');
		expect(c.get_time_control_name()).toBe('Blitz (5 + 3)');
	});

	test('Set fields - 6', () => {
		let c = new Challenge('000x1', 'A', 'B', 'blitz', 'Blitz (5 + 3)', '2024-12-29..14:00:00');

		expect(c.get_id()).toBe('000x1');
		expect(c.get_sent_by()).toBe('A');
		expect(c.get_sent_to()).toBe('B');
		expect(c.get_when_challenge_sent()).toBe('2024-12-29..14:00:00');

		c.set_challenge_accepted('2024-12-29..14:00:01');

		expect(c.get_when_challenge_accepted()).toBe('2024-12-29..14:00:01');
		expect(c.was_result_set()).toBe(false);

		expect(() => c.set_result('A', '2024-12-29..14:00:02', 'A', 'B', 'black_wins')).not.toThrow();

		expect(c.was_result_set()).toBe(true);
		expect(c.get_result_set_by()).toBe('A');
		expect(c.get_when_result_set()).toBe('2024-12-29..14:00:02');
		expect(c.get_white()).toBe('A');
		expect(c.get_black()).toBe('B');
		expect(c.get_result()).toBe('black_wins');
		expect(c.get_time_control_id()).toBe('blitz');
		expect(c.get_time_control_name()).toBe('Blitz (5 + 3)');

		c.unset_result();

		expect(c.was_result_set()).toBe(false);
		expect(c.get_result_set_by()).toBe(undefined);
		expect(c.get_when_result_set()).toBe(undefined);
		expect(c.get_white()).toBe(undefined);
		expect(c.get_black()).toBe(undefined);
		expect(c.get_result()).toBe(undefined);
		expect(c.get_time_control_id()).toBe('blitz');
		expect(c.get_time_control_name()).toBe('Blitz (5 + 3)');
	});
});
