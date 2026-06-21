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

import { ADMIN, STUDENT } from '@server/models/user_role';
import { initialize_rating_functions } from '@server/managers/rating_system';
import { user_from_string } from '@server/io/user';
import { isDefined } from '@common/utils';

describe('IO conversion (Elo)', () => {
	initialize_rating_functions('Elo');

	test('string (1)', () => {
		const u = user_from_string(
			'{\
				"username": "u",\
				"first_name": "f",\
				"last_name": "l",\
				"password": {\
					"encrypted": "a",\
					"iv": "b"\
				},\
				"roles": ["admin"],\
				"games": [\
					{\
						"time_control": "blitz",\
						"records": [\
							{ "record": "2024-12-31", "amount": 1 }\
						]\
					},\
					{\
						"time_control": "rapid",\
						"records": [\
							{ "record": "2025-01-01", "amount": 1 }\
						]\
					}\
				],\
				"ratings": []\
			}'
		);

		expect(u).not.toBeNull();
		if (!isDefined(u)) {
			return;
		}
		expect(u.username).toEqual('u');
		expect(u.first_name).toEqual('f');
		expect(u.last_name).toEqual('l');
		expect(u.password).toEqual({ encrypted: 'a', iv: 'b' });
		expect(u.roles).toEqual([ADMIN]);
		expect(u.is(ADMIN)).toEqual(true);
		expect(u.get_games('blitz')).toEqual([{ record: '2024-12-31', amount: 1 }]);
		expect(u.get_games('rapid')).toEqual([{ record: '2025-01-01', amount: 1 }]);
		expect(u.ratings).toEqual([]);
		expect(u.ratings.length).toBe(0);
	});

	test('string (2)', () => {
		const u1 = user_from_string(
			'{ "username": "u", "first_name": "f", "last_name": "l", "password": { "encrypted": "a", "iv": "b" }, "roles": ["admin", "student"], "games": [ { "time_control": "rapid", "records": [{ "record": "2025-01-01", "amount": 1 }] } ], "ratings": [] }'
		);

		expect(u1).not.toBeNull();
		if (!isDefined(u1)) {
			return;
		}
		expect(u1.roles).toEqual([ADMIN, STUDENT]);
		expect(u1.ratings.length).toBe(0);

		const u2 = user_from_string(
			'{\
				"username": "u",\
				"first_name": "f",\
				"last_name": "l",\
				"password": {\
					"encrypted": "a",\
					"iv": "b"\
				},\
				"roles": ["student", "admin"],\
				"games": [\
					{\
						"time_control": "blitz",\
						"records": [\
							{ "record": "2024-12-31", "amount": 1 }\
						]\
					},\
					{\
						"time_control": "rapid",\
						"records": [\
							{ "record": "2025-01-01", "amount": 1 }\
						]\
					}\
				],\
				"ratings": []\
			}'
		);
		expect(u2).not.toBeNull();
		if (!isDefined(u2)) {
			return;
		}
		expect(u2.roles).toEqual([STUDENT, ADMIN]);
		expect(u2.ratings.length).toBe(0);
	});

	test('string (3)', () => {
		const u = user_from_string(
			'{ "username": "u", "first_name": "f", "last_name": "l", "password": { "encrypted": "a", "iv": "b" }, "roles": ["student", "admin"], "games": [ {"time_control": "blitz", "records": [{ "record": "2024-12-31", "amount": 1 }]}, {"time_control": "rapid", "records": [{ "record": "2025-01-01", "amount": 1 }]} ], "ratings": [ { "time_control": "blitz", "rating": { "rating": 1500, "num_games": 0, "won": 0, "drawn": 0, "lost": 0, "K": 40, "surpassed_2400": false } }, { "time_control": "classical", "rating": { "rating": 1700, "num_games": 0, "won": 0, "drawn": 0, "lost": 0, "K": 40, "surpassed_2400": false } } ] }'
		);
		expect(u).not.toBeNull();
		if (!isDefined(u)) {
			return;
		}
		expect(u.ratings.length).toBe(2);
		expect(u.has_rating('classical')).toBe(true);
		expect(u.has_rating('blitz')).toBe(true);
	});
});
