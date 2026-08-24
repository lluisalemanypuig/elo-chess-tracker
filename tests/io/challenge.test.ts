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

import { isNotDefined } from '@common/utils/is-defined';
import { challengeFromString } from '@server/io/challenge';

describe('IO conversion', () => {
	test('string', () => {
		const c = challengeFromString(
			'{\
				"id": "000x1",\
				"title": "asdf",\
				"sentBy": "A",\
				"sentTo": "B",\
				"timeControlId": "blitz",\
				"timeControlName": "Blitz (5 + 3)",\
				"whenChallengeSent": "2024-12-29..17:10:00",\
				"whenChallengeAccepted": "2024-12-29..17:10:01",\
				"whenResultSet": "2024-12-29..17:10:02",\
				"resultSetBy": "A",\
				"whenResultAccepted": "2024-12-30..17:10:02",\
				"resultAcceptedBy": "B",\
				"white": "A",\
				"black": "B",\
				"result": "draw",\
				"state": "PENDING_ACCEPT"\
			}',
		);
		expect(c).not.toBeNull();
		if (isNotDefined(c)) {
			return;
		}
		expect(c.id).toBe('000x1');
		expect(c.title).toBe('asdf');
		expect(c.sentBy).toBe('A');
		expect(c.sentTo).toBe('B');
		expect(c.timeControlId).toBe('blitz');
		expect(c.timeControlName).toBe('Blitz (5 + 3)');
		expect(c.whenChallengeSent).toBe('2024-12-29..17:10:00');
		expect(c.whenChallengeAccepted).toBe('2024-12-29..17:10:01');
		expect(c.whenResultSet).toBe('2024-12-29..17:10:02');
		expect(c.resultSetBy).toBe('A');
		expect(c.whenResultAccepted).toBe('2024-12-30..17:10:02');
		expect(c.resultAcceptedBy).toBe('B');
		expect(c.white).toBe('A');
		expect(c.black).toBe('B');
		expect(c.result).toBe('draw');
		expect(c.state).toBe('PENDING_ACCEPT');
	});
});
