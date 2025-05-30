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

import { TimeControl } from '../../src-server/models/time_control';

import { time_control_from_json, time_control_set_from_json } from '../../src-server/io/time_control';

describe('JSON conversion', () => {
	test('From JSON to TimeControl', () => {
		expect(time_control_from_json({ id: 'A', name: 'B' })).toEqual(new TimeControl('A', 'B'));
		expect(time_control_from_json({ id: '', name: '' })).toEqual(new TimeControl('', ''));

		expect(time_control_from_json('{ "id": "A", "name": "B" }')).toEqual(new TimeControl('A', 'B'));
		expect(time_control_from_json('{ "id": "", "name": "" }')).toEqual(new TimeControl('', ''));
	});

	test('From JSON to TimeControl set', () => {
		expect(time_control_set_from_json([{ id: 'A', name: 'B' }])).toEqual([new TimeControl('A', 'B')]);
		expect(time_control_set_from_json([{ id: '', name: '' }])).toEqual([new TimeControl('', '')]);
		expect(
			time_control_set_from_json([
				{ id: 'A', name: 'B' },
				{ id: '', name: '' }
			])
		).toEqual([new TimeControl('A', 'B'), new TimeControl('', '')]);

		expect(time_control_set_from_json('[{ "id": "A", "name": "B" }]')).toEqual([new TimeControl('A', 'B')]);
		expect(time_control_set_from_json('[{ "id": "", "name": "" }]')).toEqual([new TimeControl('', '')]);
		expect(time_control_set_from_json('[{ "id": "A", "name": "B" }, { "id": "", "name": "" }]')).toEqual([
			new TimeControl('A', 'B'),
			new TimeControl('', '')
		]);
	});
});
