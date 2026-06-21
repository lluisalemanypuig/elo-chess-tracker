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

import { time_control_from_string, time_control_array_from_string } from '@common/io/time_control';

describe('IO conversion', () => {
	test('string to TimeControl', () => {
		expect(time_control_from_string('{ "id": "A", "name": "B" }')).toEqual({ id: 'A', name: 'B' });
		expect(time_control_from_string('{ "id": "", "name": "" }')).toEqual({ id: '', name: '' });
	});

	test('string to TimeControl[]', () => {
		expect(time_control_array_from_string('[{ "id": "A", "name": "B" }]')).toEqual([{ id: 'A', name: 'B' }]);
		expect(time_control_array_from_string('[{ "id": "", "name": "" }]')).toEqual([{ id: '', name: '' }]);
		expect(time_control_array_from_string('[{ "id": "A", "name": "B" }, { "id": "", "name": "" }]')).toEqual([
			{ id: 'A', name: 'B' },
			{ id: '', name: '' }
		]);
	});
});
