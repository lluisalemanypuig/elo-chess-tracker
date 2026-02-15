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

import { Password } from '../../src-server/models/password';
import { ADMIN, STUDENT } from '../../src-server/models/user_role';
import { initialize_rating_functions } from '../../src-server/managers/rating_system';
import { user_from_json } from '../../src-server/io/user';

describe('From JSON (Elo)', () => {
	initialize_rating_functions('Elo');

	test('string (1)', () => {
		const u = user_from_json(
			'{ "username": "u", "first_name": "f", "last_name": "l", "password": { "encrypted": "a", "iv": "b" }, "roles": ["admin"], "games": [ {"time_control": "blitz", "records": [{ "record": "2024-12-31", "amount": 1 }]}, {"time_control": "rapid", "records": [{ "record": "2025-01-01", "amount": 1 }] } ], "ratings": [] }'
		);

		expect(u.get_username()).toEqual('u');
		expect(u.get_first_name()).toEqual('f');
		expect(u.get_last_name()).toEqual('l');
		expect(u.get_password()).toEqual(new Password('a', 'b'));
		expect(u.get_roles()).toEqual([ADMIN]);
		expect(u.is(ADMIN)).toEqual(true);
		expect(u.get_games('blitz')).toEqual([{ record: '2024-12-31', amount: 1 }]);
		expect(u.get_games('rapid')).toEqual([{ record: '2025-01-01', amount: 1 }]);
		expect(u.get_all_ratings()).toEqual([]);
		expect(u.get_all_ratings().length).toBe(0);
	});

	test('string (2)', () => {
		const u1 = user_from_json(
			'{ "username": "u", "first_name": "f", "last_name": "l", "password": { "encrypted": "a", "iv": "b" }, "roles": ["admin", "student"], "games": [ { "time_control": "rapid", "records": [{ "record": "2025-01-01", "amount": 1 }] } ], "ratings": [] }'
		);

		expect(u1.get_roles()).toEqual([ADMIN, STUDENT]);
		expect(u1.get_all_ratings().length).toBe(0);

		const u2 = user_from_json(
			'{ "username": "u", "first_name": "f", "last_name": "l", "password": { "encrypted": "a", "iv": "b" }, "roles": ["student", "admin"], "games": [ {"time_control_id": "blitz", "records": [{ "record": "2024-12-31", "amount": 1 }] }, {"time_control_id": "rapid", "records": [{ "record": "2025-01-01", "amount": 1 }] } ], "ratings": [] }'
		);
		expect(u2.get_roles()).toEqual([STUDENT, ADMIN]);
		expect(u2.get_all_ratings().length).toBe(0);
	});

	test('string (3)', () => {
		const u = user_from_json(
			'{ "username": "u", "first_name": "f", "last_name": "l", "password": { "encrypted": "a", "iv": "b" }, "roles": ["student", "admin"], "games": [ {"time_control": "blitz", "records": [{ "record": "2024-12-31", "amount": 1 }]}, {"time_control": "rapid", "records": [{ "record": "2025-01-01", "amount": 1 }]} ], "ratings": [ { "time_control": "blitz", "rating": { "rating": 1500, "num_games": 0, "won": 0, "drawn": 0, "lost": 0, "K": 40, "surpassed_2400": false } }, { "time_control": "classical", "rating": { "rating": 1700, "num_games": 0, "won": 0, "drawn": 0, "lost": 0, "K": 40, "surpassed_2400": false } } ] }'
		);
		expect(u.get_all_ratings().length).toBe(2);
		expect(u.has_rating('classical')).toBe(true);
		expect(u.has_rating('blitz')).toBe(true);
	});

	test('JSON (1)', () => {
		const u = user_from_json({
			username: 'u',
			first_name: 'f',
			last_name: 'l',
			password: {
				encrypted: 'a',
				iv: 'b'
			},
			roles: [ADMIN],
			games: [
				{ time_control: 'blitz', records: [{ record: '2024-12-31', amount: 1 }] },
				{ time_control: 'rapid', records: [{ record: '2025-01-01', amount: 1 }] }
			],
			ratings: []
		});

		expect(u.get_username()).toEqual('u');
		expect(u.get_first_name()).toEqual('f');
		expect(u.get_last_name()).toEqual('l');
		expect(u.get_password()).toEqual(new Password('a', 'b'));
		expect(u.get_roles()).toEqual([ADMIN]);
		expect(u.is(ADMIN)).toEqual(true);
		expect(u.get_games('blitz')).toEqual([{ record: '2024-12-31', amount: 1 }]);
		expect(u.get_games('rapid')).toEqual([{ record: '2025-01-01', amount: 1 }]);
		expect(u.get_all_ratings()).toEqual([]);
		expect(u.get_all_ratings().length).toBe(0);
	});

	test('JSON (2)', () => {
		const u1 = user_from_json({
			username: 'u',
			first_name: 'f',
			last_name: 'l',
			password: {
				encrypted: 'a',
				iv: 'b'
			},
			roles: [ADMIN, STUDENT],
			games: [
				{ time_control: 'blitz', records: [{ record: '2024-12-31', amount: 1 }] },
				{ time_control: 'rapid', records: [{ record: '2025-01-01', amount: 1 }] }
			],
			ratings: []
		});
		expect(u1.get_roles()).toEqual([ADMIN, STUDENT]);
		expect(u1.is(ADMIN)).toEqual(true);
		expect(u1.is(STUDENT)).toEqual(true);
		expect(u1.get_all_ratings().length).toBe(0);

		const u2 = user_from_json({
			username: 'u',
			first_name: 'f',
			last_name: 'l',
			password: {
				encrypted: 'a',
				iv: 'b'
			},
			roles: [STUDENT, ADMIN],
			games: [
				{ time_control: 'blitz', records: [{ record: '2024-12-31', amount: 1 }] },
				{ time_control: 'rapid', records: [{ record: '2025-01-01', amount: 1 }] }
			],
			ratings: []
		});
		expect(u2.get_roles()).toEqual([STUDENT, ADMIN]);
		expect(u2.is(ADMIN)).toEqual(true);
		expect(u2.is(STUDENT)).toEqual(true);
		expect(u2.get_all_ratings().length).toBe(0);
	});

	test('JSON (3)', () => {
		const u = user_from_json({
			username: 'u',
			first_name: 'f',
			last_name: 'l',
			password: {
				encrypted: 'a',
				iv: 'b'
			},
			roles: [ADMIN, STUDENT],
			games: [
				{ time_control: 'blitz', records: [{ record: '2024-12-31', amount: 1 }] },
				{ time_control: 'rapid', records: [{ record: '2025-01-01', amount: 1 }] }
			],
			ratings: [
				{
					time_control: 'blitz',
					rating: {
						rating: 1500,
						num_games: 0,
						won: 0,
						drawn: 0,
						lost: 0,
						K: 40,
						surpassed_2400: false
					}
				},
				{
					time_control: 'classical',
					rating: {
						rating: 1700,
						num_games: 0,
						won: 0,
						drawn: 0,
						lost: 0,
						K: 40,
						surpassed_2400: false
					}
				}
			]
		});
		expect(u.get_all_ratings().length).toBe(2);
		expect(u.has_rating('classical')).toBe(true);
		expect(u.has_rating('blitz')).toBe(true);
	});
});
