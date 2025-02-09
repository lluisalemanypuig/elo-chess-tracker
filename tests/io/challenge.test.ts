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

import { challenge_from_json } from '../../src-server/io/challenge';

describe('From JSON', () => {
	test('string', () => {
		const c = challenge_from_json(
			'{ "id": "000x1", "sent_by": "A", "sent_to": "B", "when_challenge_sent": "2024-12-29..17:10:00", "when_challenge_accepted": "2024-12-29..17:10:01", "result_set_by": "A", "when_result_set": "2024-12-29..17:10:02", "white": "A", "black": "B", "result": "draw", "time_control_id": "blitz", "time_control_name": "Blitz (5 + 3)" }'
		);

		expect(c.get_id()).toBe('000x1');
		expect(c.get_sent_by()).toBe('A');
		expect(c.get_sent_to()).toBe('B');
		expect(c.get_when_challenge_sent()).toBe('2024-12-29..17:10:00');
		expect(c.get_when_challenge_accepted()).toBe('2024-12-29..17:10:01');
		expect(c.was_result_set()).toBe(true);
		expect(c.get_result_set_by()).toBe('A');
		expect(c.get_when_result_set()).toBe('2024-12-29..17:10:02');
		expect(c.get_white()).toBe('A');
		expect(c.get_black()).toBe('B');
		expect(c.get_result()).toBe('draw');
		expect(c.get_time_control_id()).toBe('blitz');
		expect(c.get_time_control_name()).toBe('Blitz (5 + 3)');
	});

	test('JSON', () => {
		const c = challenge_from_json({
			id: '000x1',
			sent_by: 'A',
			sent_to: 'B',
			when_challenge_sent: '2024-12-29..17:10:00',
			when_challenge_accepted: '2024-12-29..17:10:01',
			result_set_by: 'A',
			when_result_set: '2024-12-29..17:10:02',
			white: 'A',
			black: 'B',
			result: 'draw',
			time_control_id: 'blitz',
			time_control_name: 'Blitz (5 + 3)'
		});

		expect(c.get_id()).toBe('000x1');
		expect(c.get_sent_by()).toBe('A');
		expect(c.get_sent_to()).toBe('B');
		expect(c.get_when_challenge_sent()).toBe('2024-12-29..17:10:00');
		expect(c.get_when_challenge_accepted()).toBe('2024-12-29..17:10:01');
		expect(c.was_result_set()).toBe(true);
		expect(c.get_result_set_by()).toBe('A');
		expect(c.get_when_result_set()).toBe('2024-12-29..17:10:02');
		expect(c.get_white()).toBe('A');
		expect(c.get_black()).toBe('B');
		expect(c.get_result()).toBe('draw');
		expect(c.get_time_control_id()).toBe('blitz');
		expect(c.get_time_control_name()).toBe('Blitz (5 + 3)');
	});
});
