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

import { isDefined } from '@common/utils';
import { challenge_from_string } from '@server/io/challenge';

describe('IO conversion', () => {
	test('string', () => {
		const c = challenge_from_string(
			'{\
				"id": "000x1",\
				"title": "asdf",\
				"sent_by": "A",\
				"sent_to": "B",\
				"time_control_id": "blitz",\
				"time_control_name": "Blitz (5 + 3)",\
				"when_challenge_sent": "2024-12-29..17:10:00",\
				"when_challenge_accepted": "2024-12-29..17:10:01",\
				"result_was_set": true,\
				"when_result_set": "2024-12-29..17:10:02",\
				"result_set_by": "A",\
				"when_result_accepted": "2024-12-30..17:10:02",\
				"result_accepted_by": "B",\
				"white": "A",\
				"black": "B",\
				"result": "draw"\
			}'
		);

		expect(c).not.toBeNull();
		if (!isDefined(c)) {
			return;
		}
		expect(c.id).toBe('000x1');
		expect(c.title).toBe('asdf');
		expect(c.sent_by).toBe('A');
		expect(c.sent_to).toBe('B');
		expect(c.time_control_id).toBe('blitz');
		expect(c.time_control_name).toBe('Blitz (5 + 3)');
		expect(c.when_challenge_sent).toBe('2024-12-29..17:10:00');
		expect(c.when_challenge_accepted).toBe('2024-12-29..17:10:01');
		expect(c.result_was_set).toBe(true);
		expect(c.when_result_set).toBe('2024-12-29..17:10:02');
		expect(c.result_set_by).toBe('A');
		expect(c.when_result_accepted).toBe('2024-12-30..17:10:02');
		expect(c.result_accepted_by).toBe('B');
		expect(c.white).toBe('A');
		expect(c.black).toBe('B');
		expect(c.result).toBe('draw');
	});
});
