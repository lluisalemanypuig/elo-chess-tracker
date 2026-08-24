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

// roles used as string literals; no imports needed from user-role
import { toTimeControlId } from '@common/models/time-control';
import { isNotDefined } from '@common/utils/is-defined';
import { toDateMajor } from '@common/utils/time';
import { userFromString } from '@server/io/user';
import { initializeRatingFunctions } from '@server/managers/rating-system';

const Classical = toTimeControlId('classical');
const Rapid = toTimeControlId('rapid');
const Blitz = toTimeControlId('blitz');

describe('IO conversion (Elo)', () => {
	initializeRatingFunctions('Elo');

	test('string (1)', () => {
		const u = userFromString(
			'{\
				"username": "u",\
				"firstName": "f",\
				"lastName": "l",\
				"password": {\
					"encrypted": "a",\
					"iv": "b"\
				},\
				"roles": ["ADMIN"],\
				"games": [\
					{\
						"timeControl": "blitz",\
						"records": [\
							{ "record": "2024-12-31", "amount": 1 }\
						]\
					},\
					{\
						"timeControl": "rapid",\
						"records": [\
							{ "record": "2025-01-01", "amount": 1 }\
						]\
					}\
				],\
				"ratings": []\
			}',
		);

		expect(u).not.toBeNull();
		if (isNotDefined(u)) {
			return;
		}
		expect(u.username).toEqual('u');
		expect(u.firstName).toEqual('f');
		expect(u.lastName).toEqual('l');
		expect(u.password).toEqual({ encrypted: 'a', iv: 'b' });
		expect(u.roles).toEqual(['ADMIN']);
		expect(u.is('ADMIN')).toEqual(true);
		expect(u.getGames(Blitz)).toEqual([
			{ record: toDateMajor('2024-12-31'), amount: 1 },
		]);
		expect(u.getGames(Rapid)).toEqual([
			{ record: toDateMajor('2025-01-01'), amount: 1 },
		]);
		expect(u.ratings).toEqual([]);
		expect(u.ratings.length).toBe(0);
	});

	test('string (2)', () => {
		const u1 = userFromString(
			'{ "username": "u", "firstName": "f", "lastName": "l", "password": { "encrypted": "a", "iv": "b" }, "roles": ["ADMIN", "STUDENT"], "games": [ { "timeControl": "rapid", "records": [{ "record": "2025-01-01", "amount": 1 }] } ], "ratings": [] }',
		);

		expect(u1).not.toBeNull();
		if (isNotDefined(u1)) {
			return;
		}
		expect(u1.roles).toEqual(['ADMIN', 'STUDENT']);
		expect(u1.ratings.length).toBe(0);

		const u2 = userFromString(
			'{\
				"username": "u",\
				"firstName": "f",\
				"lastName": "l",\
				"password": {\
					"encrypted": "a",\
					"iv": "b"\
				},\
				"roles": ["STUDENT", "ADMIN"],\
				"games": [\
					{\
						"timeControl": "blitz",\
						"records": [\
							{ "record": "2024-12-31", "amount": 1 }\
						]\
					},\
					{\
						"timeControl": "rapid",\
						"records": [\
							{ "record": "2025-01-01", "amount": 1 }\
						]\
					}\
				],\
				"ratings": []\
			}',
		);
		expect(u2).not.toBeNull();
		if (isNotDefined(u2)) {
			return;
		}
		expect(u2.roles).toEqual(['STUDENT', 'ADMIN']);
		expect(u2.ratings.length).toBe(0);
	});

	test('string (3)', () => {
		const u = userFromString(
			'{ "username": "u", "firstName": "f", "lastName": "l", "password": { "encrypted": "a", "iv": "b" }, "roles": ["STUDENT", "ADMIN"], "games": [ {"timeControl": "blitz", "records": [{ "record": "2024-12-31", "amount": 1 }]}, {"timeControl": "rapid", "records": [{ "record": "2025-01-01", "amount": 1 }]} ], "ratings": [ { "timeControl": "blitz", "rating": { "rating": 1500, "numGames": 0, "won": 0, "drawn": 0, "lost": 0, "K": 40, "surpassed2400": false } }, { "timeControl": "classical", "rating": { "rating": 1700, "numGames": 0, "won": 0, "drawn": 0, "lost": 0, "K": 40, "surpassed2400": false } } ] }',
		);
		expect(u).not.toBeNull();
		if (isNotDefined(u)) {
			return;
		}
		expect(u.ratings.length).toBe(2);
		expect(u.hasRating(Classical)).toBe(true);
		expect(u.hasRating(Blitz)).toBe(true);
	});
});
