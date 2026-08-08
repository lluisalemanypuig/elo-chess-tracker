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

import { toPlayerPrivateId } from '@common/models/player';
import { new_challenge, set_result, unset_result, set_result_accepted, toChallengeId } from '@common/models/challenge';
import { toTimeControlId, toTimeControlName } from '@common/models/time_control';
import { toDateYYYYMMDDHHmmssSSS } from '@server/utils/time';

const Blitz = toTimeControlId('Blitz');
const Blitz5p3 = toTimeControlName('Blitz (5 + 3)');

const A = toPlayerPrivateId('A');
const a = toPlayerPrivateId('a');
const B = toPlayerPrivateId('B');
const b = toPlayerPrivateId('b');
const id000x1 = toChallengeId('000x1');

describe('Sets and gets', () => {
	test('Constructor', () => {
		const c = new_challenge(
			id000x1,
			'asdf',
			A,
			B,
			Blitz,
			Blitz5p3,
			toDateYYYYMMDDHHmmssSSS('2024-12-29..14:00:00')
		);

		expect(c.id).toBe('000x1');
		expect(c.sent_by).toBe('A');
		expect(c.sent_to).toBe('B');
		expect(c.when_challenge_sent).toBe('2024-12-29..14:00:00');
	});

	test('Set fields - 1', () => {
		let c = new_challenge(id000x1, 'asdf', A, B, Blitz, Blitz5p3, toDateYYYYMMDDHHmmssSSS('2024-12-29..14:00:00'));

		expect(c.id).toBe('000x1');
		expect(c.sent_by).toBe('A');
		expect(c.sent_to).toBe('B');
		expect(c.when_challenge_sent).toBe('2024-12-29..14:00:00');

		c.when_challenge_accepted = toDateYYYYMMDDHHmmssSSS('2024-12-29..14:00:01');

		expect(c.when_challenge_accepted).toBe('2024-12-29..14:00:01');
		expect(c.result_was_set).toBe(false);

		expect(() =>
			set_result(c, {
				by: A,
				when: toDateYYYYMMDDHHmmssSSS('2024-12-29..14:00:02'),
				white: A,
				black: B,
				result: 'black_wins'
			})
		).not.toThrow();

		expect(c.result_was_set).toBe(true);
		expect(c.result_set_by).toBe('A');
		expect(c.when_result_set).toBe('2024-12-29..14:00:02');
		expect(c.white).toBe('A');
		expect(c.black).toBe('B');
		expect(c.result).toBe('black_wins');
		expect(c.time_control_id).toBe(Blitz);
		expect(c.time_control_name).toBe('Blitz (5 + 3)');

		expect(() => set_result_accepted(c, 'B', toDateYYYYMMDDHHmmssSSS('2024-12-29..14:00:03'))).not.toThrow();

		expect(c.when_result_accepted).toBe('2024-12-29..14:00:03');
		expect(c.result_accepted_by).toBe('B');
		expect(c.result_accepted_by).not.toBe('A');
	});

	test('Set fields - 2', () => {
		let c = new_challenge(id000x1, 'asdf', A, B, Blitz, Blitz5p3, toDateYYYYMMDDHHmmssSSS('2024-12-29..14:00:00'));

		expect(c.id).toBe('000x1');
		expect(c.sent_by).toBe('A');
		expect(c.sent_to).toBe('B');
		expect(c.when_challenge_sent).toBe('2024-12-29..14:00:00');

		c.when_challenge_accepted = toDateYYYYMMDDHHmmssSSS('2024-12-29..14:00:01');

		expect(c.when_challenge_accepted).toBe('2024-12-29..14:00:01');
		expect(c.result_was_set).toBe(false);

		expect(() =>
			set_result(c, {
				by: A,
				when: toDateYYYYMMDDHHmmssSSS('2024-12-29..14:00:02'),
				white: B,
				black: A,
				result: 'draw'
			})
		).not.toThrow();

		expect(c.result_was_set).toBe(true);
		expect(c.result_set_by).toBe('A');
		expect(c.when_result_set).toBe('2024-12-29..14:00:02');
		expect(c.white).toBe('B');
		expect(c.black).toBe('A');
		expect(c.result).toBe('draw');
		expect(c.time_control_id).toBe(Blitz);
		expect(c.time_control_name).toBe('Blitz (5 + 3)');

		expect(() => set_result_accepted(c, 'B', toDateYYYYMMDDHHmmssSSS('2024-12-29..14:00:03'))).not.toThrow();

		expect(c.when_result_accepted).toBe('2024-12-29..14:00:03');
		expect(c.result_accepted_by).toBe('B');
		expect(c.result_accepted_by).not.toBe('A');
	});

	test('Set fields - 3', () => {
		let c = new_challenge(id000x1, 'asdf', A, B, Blitz, Blitz5p3, toDateYYYYMMDDHHmmssSSS('2024-12-29..14:00:00'));

		expect(c.id).toBe('000x1');
		expect(c.sent_by).toBe('A');
		expect(c.sent_to).toBe('B');
		expect(c.when_challenge_sent).toBe('2024-12-29..14:00:00');

		c.when_challenge_accepted = toDateYYYYMMDDHHmmssSSS('2024-12-29..14:00:01');

		expect(c.when_challenge_accepted).toBe('2024-12-29..14:00:01');
		expect(c.result_was_set).toBe(false);

		expect(() =>
			set_result(c, {
				by: A,
				when: toDateYYYYMMDDHHmmssSSS('2024-12-29..14:00:02'),
				white: B,
				black: A,
				result: 'draw'
			})
		).not.toThrow();

		expect(c.result_was_set).toBe(true);
		expect(c.result_set_by).toBe('A');
		expect(c.when_result_set).toBe('2024-12-29..14:00:02');
		expect(c.white).toBe('B');
		expect(c.black).toBe('A');
		expect(c.result).toBe('draw');
		expect(c.time_control_id).toBe(Blitz);
		expect(c.time_control_name).toBe('Blitz (5 + 3)');

		expect(() => set_result_accepted(c, 'A', toDateYYYYMMDDHHmmssSSS('2024-12-29..14:00:03'))).toThrow();

		expect(c.when_result_accepted).toBe(undefined);
		expect(c.result_accepted_by).toBe(undefined);
	});

	test('Set fields - 4', () => {
		let c = new_challenge(id000x1, 'asdf', A, B, Blitz, Blitz5p3, toDateYYYYMMDDHHmmssSSS('2024-12-29..14:00:00'));

		expect(c.id).toBe('000x1');
		expect(c.sent_by).toBe('A');
		expect(c.sent_to).toBe('B');
		expect(c.when_challenge_sent).toBe('2024-12-29..14:00:00');

		c.when_challenge_accepted = toDateYYYYMMDDHHmmssSSS('2024-12-29..14:00:01');

		expect(c.when_challenge_accepted).toBe('2024-12-29..14:00:01');
		expect(c.result_was_set).toBe(false);

		expect(() => set_result_accepted(c, 'A', toDateYYYYMMDDHHmmssSSS('2024-12-29..14:00:03'))).toThrow();

		expect(c.when_result_accepted).toBe(undefined);
		expect(c.result_accepted_by).toBe(undefined);
	});

	test('Set fields - 5', () => {
		let c = new_challenge(id000x1, 'asdf', A, B, Blitz, Blitz5p3, toDateYYYYMMDDHHmmssSSS('2024-12-29..14:00:00'));

		expect(c.id).toBe('000x1');
		expect(c.sent_by).toBe('A');
		expect(c.sent_to).toBe('B');
		expect(c.when_challenge_sent).toBe('2024-12-29..14:00:00');

		c.when_challenge_accepted = toDateYYYYMMDDHHmmssSSS('2024-12-29..14:00:01');

		expect(c.when_challenge_accepted).toBe('2024-12-29..14:00:01');
		expect(c.result_was_set).toBe(false);

		expect(() =>
			set_result(c, {
				by: a,
				when: toDateYYYYMMDDHHmmssSSS('2024-12-29..14:00:02'),
				white: A,
				black: B,
				result: 'black_wins'
			})
		).toThrow();
		expect(() =>
			set_result(c, {
				by: A,
				when: toDateYYYYMMDDHHmmssSSS('2024-12-29..14:00:02'),
				white: a,
				black: B,
				result: 'black_wins'
			})
		).toThrow();
		expect(() =>
			set_result(c, {
				by: A,
				when: toDateYYYYMMDDHHmmssSSS('2024-12-29..14:00:02'),
				white: A,
				black: b,
				result: 'black_wins'
			})
		).toThrow();

		expect(c.result_was_set).toBe(false);
		expect(c.result_set_by).toBe(undefined);
		expect(c.when_result_set).toBe(undefined);
		expect(c.white).toBe(undefined);
		expect(c.black).toBe(undefined);
		expect(c.result).toBe(undefined);
		expect(c.time_control_id).toBe(Blitz);
		expect(c.time_control_name).toBe('Blitz (5 + 3)');
	});

	test('Set fields - 6', () => {
		let c = new_challenge(id000x1, 'asdf', A, B, Blitz, Blitz5p3, toDateYYYYMMDDHHmmssSSS('2024-12-29..14:00:00'));

		expect(c.id).toBe('000x1');
		expect(c.sent_by).toBe('A');
		expect(c.sent_to).toBe('B');
		expect(c.when_challenge_sent).toBe('2024-12-29..14:00:00');

		c.when_challenge_accepted = toDateYYYYMMDDHHmmssSSS('2024-12-29..14:00:01');

		expect(c.when_challenge_accepted).toBe('2024-12-29..14:00:01');
		expect(c.result_was_set).toBe(false);

		expect(() =>
			set_result(c, {
				by: A,
				when: toDateYYYYMMDDHHmmssSSS('2024-12-29..14:00:02'),
				white: A,
				black: B,
				result: 'black_wins'
			})
		).not.toThrow();

		expect(c.result_was_set).toBe(true);
		expect(c.result_set_by).toBe('A');
		expect(c.when_result_set).toBe('2024-12-29..14:00:02');
		expect(c.white).toBe('A');
		expect(c.black).toBe('B');
		expect(c.result).toBe('black_wins');
		expect(c.time_control_id).toBe(Blitz);
		expect(c.time_control_name).toBe('Blitz (5 + 3)');

		unset_result(c);

		expect(c.result_was_set).toBe(false);
		expect(c.result_set_by).toBe(undefined);
		expect(c.when_result_set).toBe(undefined);
		expect(c.white).toBe(undefined);
		expect(c.black).toBe(undefined);
		expect(c.result).toBe(undefined);
		expect(c.time_control_id).toBe(Blitz);
		expect(c.time_control_name).toBe('Blitz (5 + 3)');
	});
});
