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

import { toChallengeId } from '@common/models/challenge-id';
import { toPlayerPrivateId } from '@common/models/player-id';
import { toTimeControlId, toTimeControlName } from '@common/models/time-control';
import { toDateFull } from '@common/utils/time';
import { agreeResult, disagreeResult, newChallenge, setResult } from '@server/models/challenge';

const Blitz = toTimeControlId('Blitz');
const Blitz5p3 = toTimeControlName('Blitz (5 + 3)');

const A = toPlayerPrivateId('A');
const a = toPlayerPrivateId('a');

const B = toPlayerPrivateId('B');
const b = toPlayerPrivateId('b');

const id000x1 = toChallengeId('000x1');

describe('Sets and gets', () => {
	test('Constructor', () => {
		const c = newChallenge(id000x1, 'asdf', A, B, Blitz, Blitz5p3, toDateFull('2024-12-29..14:00:00'));

		expect(c.id).toBe('000x1');
		expect(c.sentBy).toBe('A');
		expect(c.sentTo).toBe('B');
		expect(c.whenChallengeSent).toBe('2024-12-29..14:00:00');
	});

	test('Set fields - 1', () => {
		let c = newChallenge(id000x1, 'asdf', A, B, Blitz, Blitz5p3, toDateFull('2024-12-29..14:00:00'));

		expect(c.id).toBe('000x1');
		expect(c.sentBy).toBe('A');
		expect(c.sentTo).toBe('B');
		expect(c.whenChallengeSent).toBe('2024-12-29..14:00:00');

		c.whenChallengeAccepted = toDateFull('2024-12-29..14:00:01');

		expect(c.whenChallengeAccepted).toBe('2024-12-29..14:00:01');

		setResult(c, {
			by: A,
			when: toDateFull('2024-12-29..14:00:02'),
			white: A,
			black: B,
			result: 'black_wins',
		});

		expect(c.resultSetBy).toBe('A');
		expect(c.whenResultSet).toBe('2024-12-29..14:00:02');
		expect(c.white).toBe('A');
		expect(c.black).toBe('B');
		expect(c.result).toBe('black_wins');
		expect(c.timeControlId).toBe(Blitz);
		expect(c.timeControlName).toBe('Blitz (5 + 3)');

		agreeResult(c, { by: B, when: toDateFull('2024-12-29..14:00:03') });

		expect(c.whenResultAccepted).toBe('2024-12-29..14:00:03');
		expect(c.resultAcceptedBy).toBe('B');
		expect(c.resultAcceptedBy).not.toBe('A');
	});

	test('Set fields - 2', () => {
		let c = newChallenge(id000x1, 'asdf', A, B, Blitz, Blitz5p3, toDateFull('2024-12-29..14:00:00'));

		expect(c.id).toBe('000x1');
		expect(c.sentBy).toBe('A');
		expect(c.sentTo).toBe('B');
		expect(c.whenChallengeSent).toBe('2024-12-29..14:00:00');

		c.whenChallengeAccepted = toDateFull('2024-12-29..14:00:01');

		expect(c.whenChallengeAccepted).toBe('2024-12-29..14:00:01');

		setResult(c, {
			by: A,
			when: toDateFull('2024-12-29..14:00:02'),
			white: B,
			black: A,
			result: 'draw',
		});

		expect(c.resultSetBy).toBe('A');
		expect(c.whenResultSet).toBe('2024-12-29..14:00:02');
		expect(c.white).toBe('B');
		expect(c.black).toBe('A');
		expect(c.result).toBe('draw');
		expect(c.timeControlId).toBe(Blitz);
		expect(c.timeControlName).toBe('Blitz (5 + 3)');

		agreeResult(c, { by: B, when: toDateFull('2024-12-29..14:00:03') });

		expect(c.whenResultAccepted).toBe('2024-12-29..14:00:03');
		expect(c.resultAcceptedBy).toBe('B');
		expect(c.resultAcceptedBy).not.toBe('A');
	});

	test('Set fields - 3', () => {
		let c = newChallenge(id000x1, 'asdf', A, B, Blitz, Blitz5p3, toDateFull('2024-12-29..14:00:00'));

		expect(c.id).toBe('000x1');
		expect(c.sentBy).toBe('A');
		expect(c.sentTo).toBe('B');
		expect(c.whenChallengeSent).toBe('2024-12-29..14:00:00');

		c.whenChallengeAccepted = toDateFull('2024-12-29..14:00:01');

		expect(c.whenChallengeAccepted).toBe('2024-12-29..14:00:01');

		setResult(c, {
			by: A,
			when: toDateFull('2024-12-29..14:00:02'),
			white: B,
			black: A,
			result: 'draw',
		});

		expect(c.resultSetBy).toBe('A');
		expect(c.whenResultSet).toBe('2024-12-29..14:00:02');
		expect(c.white).toBe('B');
		expect(c.black).toBe('A');
		expect(c.result).toBe('draw');
		expect(c.timeControlId).toBe(Blitz);
		expect(c.timeControlName).toBe('Blitz (5 + 3)');

		agreeResult(c, { by: A, when: toDateFull('2024-12-29..14:00:03') });

		expect(c.whenResultAccepted).toBe('2024-12-29..14:00:03');
		expect(c.resultAcceptedBy).toBe(A);
	});

	test('Set fields - 4', () => {
		let c = newChallenge(id000x1, 'asdf', A, B, Blitz, Blitz5p3, toDateFull('2024-12-29..14:00:00'));

		expect(c.id).toBe('000x1');
		expect(c.sentBy).toBe('A');
		expect(c.sentTo).toBe('B');
		expect(c.whenChallengeSent).toBe('2024-12-29..14:00:00');

		c.whenChallengeAccepted = toDateFull('2024-12-29..14:00:01');

		expect(c.whenChallengeAccepted).toBe('2024-12-29..14:00:01');

		agreeResult(c, { by: A, when: toDateFull('2024-12-29..14:00:03') });

		expect(c.whenResultAccepted).toBe('2024-12-29..14:00:03');
		expect(c.resultAcceptedBy).toBe(A);
	});

	test('Set fields - 5', () => {
		let c = newChallenge(id000x1, 'asdf', A, B, Blitz, Blitz5p3, toDateFull('2024-12-29..14:00:00'));

		expect(c.id).toBe('000x1');
		expect(c.sentBy).toBe('A');
		expect(c.sentTo).toBe('B');
		expect(c.whenChallengeSent).toBe('2024-12-29..14:00:00');

		c.whenChallengeAccepted = toDateFull('2024-12-29..14:00:01');

		expect(c.whenChallengeAccepted).toBe('2024-12-29..14:00:01');

		setResult(c, {
			by: a,
			when: toDateFull('2024-12-29..14:00:02'),
			white: A,
			black: B,
			result: 'black_wins',
		});
		setResult(c, {
			by: A,
			when: toDateFull('2024-12-29..14:00:02'),
			white: a,
			black: B,
			result: 'black_wins',
		});
		setResult(c, {
			by: A,
			when: toDateFull('2024-12-29..14:00:02'),
			white: A,
			black: b,
			result: 'black_wins',
		});

		expect(c.resultSetBy).toBe(A);
		expect(c.whenResultSet).toBe('2024-12-29..14:00:02');
		expect(c.white).toBe(A);
		expect(c.black).toBe(b);
		expect(c.result).toBe('black_wins');
		expect(c.timeControlId).toBe(Blitz);
		expect(c.timeControlName).toBe('Blitz (5 + 3)');
	});

	test('Set fields - 6', () => {
		let c = newChallenge(id000x1, 'asdf', A, B, Blitz, Blitz5p3, toDateFull('2024-12-29..14:00:00'));

		expect(c.id).toBe('000x1');
		expect(c.sentBy).toBe('A');
		expect(c.sentTo).toBe('B');
		expect(c.whenChallengeSent).toBe('2024-12-29..14:00:00');

		c.whenChallengeAccepted = toDateFull('2024-12-29..14:00:01');

		expect(c.whenChallengeAccepted).toBe('2024-12-29..14:00:01');

		setResult(c, {
			by: A,
			when: toDateFull('2024-12-29..14:00:02'),
			white: A,
			black: B,
			result: 'black_wins',
		});

		expect(c.resultSetBy).toBe('A');
		expect(c.whenResultSet).toBe('2024-12-29..14:00:02');
		expect(c.white).toBe('A');
		expect(c.black).toBe('B');
		expect(c.result).toBe('black_wins');
		expect(c.timeControlId).toBe(Blitz);
		expect(c.timeControlName).toBe('Blitz (5 + 3)');

		disagreeResult(c);

		expect(c.resultSetBy).toBe(undefined);
		expect(c.whenResultSet).toBe(undefined);
		expect(c.white).toBe(undefined);
		expect(c.black).toBe(undefined);
		expect(c.result).toBe(undefined);
		expect(c.timeControlId).toBe(Blitz);
		expect(c.timeControlName).toBe('Blitz (5 + 3)');
	});
});
