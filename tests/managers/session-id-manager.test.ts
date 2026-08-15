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

import { toPlayerPublicId } from '@common/models/player-id';
import { SessionId } from '@common//models/session-id';
import { SessionIDManager } from '@server/managers/session-id-manager';

function makeSession(token: string, publicId: number): SessionId {
	return { token, publicId: toPlayerPublicId(publicId) };
}

describe('Session ID Manager', () => {
	test('Add single sessions', () => {
		const s1 = makeSession('1', 1111);
		const s2 = makeSession('2', 2222);
		const s3 = makeSession('3', 3333);
		const s4 = makeSession('4', 4444);

		let sessions = SessionIDManager.getInstance();

		sessions.addSessionId(s1);
		expect(sessions.numSessionIds()).toBe(1);

		sessions.addSessionId(s2);
		expect(sessions.numSessionIds()).toBe(2);

		sessions.addSessionId(s3);
		expect(sessions.numSessionIds()).toBe(3);

		sessions.addSessionId(s4);
		expect(sessions.numSessionIds()).toBe(4);

		expect(sessions.hasSessionId(s1)).toBe(true);
		expect(sessions.hasSessionId(s2)).toBe(true);
		expect(sessions.hasSessionId(s3)).toBe(true);
		expect(sessions.hasSessionId(s4)).toBe(true);

		expect(sessions.indexSessionId(s1)).toBe(0);
		expect(sessions.indexSessionId(s2)).toBe(1);
		expect(sessions.indexSessionId(s3)).toBe(2);
		expect(sessions.indexSessionId(s4)).toBe(3);

		expect(sessions.hasSessionId(makeSession('1', 2222))).toBe(false);
		expect(sessions.hasSessionId(makeSession('1', 3333))).toBe(false);
		expect(sessions.hasSessionId(makeSession('1', 4444))).toBe(false);
		expect(sessions.hasSessionId(makeSession('2', 1111))).toBe(false);
		expect(sessions.hasSessionId(makeSession('2', 3333))).toBe(false);
		expect(sessions.hasSessionId(makeSession('2', 4444))).toBe(false);
		expect(sessions.hasSessionId(makeSession('3', 1111))).toBe(false);
		expect(sessions.hasSessionId(makeSession('3', 2222))).toBe(false);
		expect(sessions.hasSessionId(makeSession('3', 4444))).toBe(false);
		expect(sessions.hasSessionId(makeSession('4', 1111))).toBe(false);
		expect(sessions.hasSessionId(makeSession('4', 2222))).toBe(false);
		expect(sessions.hasSessionId(makeSession('4', 3333))).toBe(false);

		expect(sessions.indexSessionId(makeSession('1', 2222))).toBe(-1);
		expect(sessions.indexSessionId(makeSession('1', 3333))).toBe(-1);
		expect(sessions.indexSessionId(makeSession('1', 4444))).toBe(-1);
		expect(sessions.indexSessionId(makeSession('2', 1111))).toBe(-1);
		expect(sessions.indexSessionId(makeSession('2', 3333))).toBe(-1);
		expect(sessions.indexSessionId(makeSession('2', 4444))).toBe(-1);
		expect(sessions.indexSessionId(makeSession('3', 1111))).toBe(-1);
		expect(sessions.indexSessionId(makeSession('3', 2222))).toBe(-1);
		expect(sessions.indexSessionId(makeSession('3', 4444))).toBe(-1);
		expect(sessions.indexSessionId(makeSession('4', 1111))).toBe(-1);
		expect(sessions.indexSessionId(makeSession('4', 2222))).toBe(-1);
		expect(sessions.indexSessionId(makeSession('4', 3333))).toBe(-1);
	});

	test('Remove sessions', () => {
		const s1 = makeSession('1', 1111);
		const s2 = makeSession('2', 2222);
		const s3 = makeSession('3', 3333);
		const s4 = makeSession('4', 4444);

		let sessions = SessionIDManager.getInstance();

		sessions.removeSessionId(sessions.indexSessionId(s3));
		expect(sessions.numSessionIds()).toBe(3);

		expect(sessions.hasSessionId(s1)).toBe(true);
		expect(sessions.hasSessionId(s2)).toBe(true);
		expect(sessions.hasSessionId(s3)).toBe(false);
		expect(sessions.hasSessionId(s4)).toBe(true);

		expect(sessions.indexSessionId(s1)).toBe(0);
		expect(sessions.indexSessionId(s2)).toBe(1);
		expect(sessions.indexSessionId(s3)).toBe(-1);
		expect(sessions.indexSessionId(s4)).toBe(2);

		expect(sessions.hasSessionId(makeSession('1', 2222))).toBe(false);
		expect(sessions.hasSessionId(makeSession('1', 3333))).toBe(false);
		expect(sessions.hasSessionId(makeSession('1', 4444))).toBe(false);
		expect(sessions.hasSessionId(makeSession('2', 1111))).toBe(false);
		expect(sessions.hasSessionId(makeSession('2', 3333))).toBe(false);
		expect(sessions.hasSessionId(makeSession('2', 4444))).toBe(false);
		expect(sessions.hasSessionId(makeSession('3', 1111))).toBe(false);
		expect(sessions.hasSessionId(makeSession('3', 2222))).toBe(false);
		expect(sessions.hasSessionId(makeSession('3', 4444))).toBe(false);
		expect(sessions.hasSessionId(makeSession('4', 1111))).toBe(false);
		expect(sessions.hasSessionId(makeSession('4', 2222))).toBe(false);
		expect(sessions.hasSessionId(makeSession('4', 3333))).toBe(false);

		expect(sessions.indexSessionId(makeSession('1', 2222))).toBe(-1);
		expect(sessions.indexSessionId(makeSession('1', 3333))).toBe(-1);
		expect(sessions.indexSessionId(makeSession('1', 4444))).toBe(-1);
		expect(sessions.indexSessionId(makeSession('2', 1111))).toBe(-1);
		expect(sessions.indexSessionId(makeSession('2', 3333))).toBe(-1);
		expect(sessions.indexSessionId(makeSession('2', 4444))).toBe(-1);
		expect(sessions.indexSessionId(makeSession('3', 1111))).toBe(-1);
		expect(sessions.indexSessionId(makeSession('3', 2222))).toBe(-1);
		expect(sessions.indexSessionId(makeSession('3', 4444))).toBe(-1);
		expect(sessions.indexSessionId(makeSession('4', 1111))).toBe(-1);
		expect(sessions.indexSessionId(makeSession('4', 2222))).toBe(-1);
		expect(sessions.indexSessionId(makeSession('4', 3333))).toBe(-1);

		sessions.removeSessionId(sessions.indexSessionId(s1));
		expect(sessions.numSessionIds()).toBe(2);

		expect(sessions.hasSessionId(s1)).toBe(false);
		expect(sessions.hasSessionId(s2)).toBe(true);
		expect(sessions.hasSessionId(s3)).toBe(false);
		expect(sessions.hasSessionId(s4)).toBe(true);

		expect(sessions.indexSessionId(s1)).toBe(-1);
		expect(sessions.indexSessionId(s2)).toBe(0);
		expect(sessions.indexSessionId(s3)).toBe(-1);
		expect(sessions.indexSessionId(s4)).toBe(1);

		expect(sessions.hasSessionId(makeSession('1', 2222))).toBe(false);
		expect(sessions.hasSessionId(makeSession('1', 3333))).toBe(false);
		expect(sessions.hasSessionId(makeSession('1', 4444))).toBe(false);
		expect(sessions.hasSessionId(makeSession('2', 1111))).toBe(false);
		expect(sessions.hasSessionId(makeSession('2', 3333))).toBe(false);
		expect(sessions.hasSessionId(makeSession('2', 4444))).toBe(false);
		expect(sessions.hasSessionId(makeSession('3', 1111))).toBe(false);
		expect(sessions.hasSessionId(makeSession('3', 2222))).toBe(false);
		expect(sessions.hasSessionId(makeSession('3', 4444))).toBe(false);
		expect(sessions.hasSessionId(makeSession('4', 1111))).toBe(false);
		expect(sessions.hasSessionId(makeSession('4', 2222))).toBe(false);
		expect(sessions.hasSessionId(makeSession('4', 3333))).toBe(false);

		expect(sessions.indexSessionId(makeSession('1', 2222))).toBe(-1);
		expect(sessions.indexSessionId(makeSession('1', 3333))).toBe(-1);
		expect(sessions.indexSessionId(makeSession('1', 4444))).toBe(-1);
		expect(sessions.indexSessionId(makeSession('2', 1111))).toBe(-1);
		expect(sessions.indexSessionId(makeSession('2', 3333))).toBe(-1);
		expect(sessions.indexSessionId(makeSession('2', 4444))).toBe(-1);
		expect(sessions.indexSessionId(makeSession('3', 1111))).toBe(-1);
		expect(sessions.indexSessionId(makeSession('3', 2222))).toBe(-1);
		expect(sessions.indexSessionId(makeSession('3', 4444))).toBe(-1);
		expect(sessions.indexSessionId(makeSession('4', 1111))).toBe(-1);
		expect(sessions.indexSessionId(makeSession('4', 2222))).toBe(-1);
		expect(sessions.indexSessionId(makeSession('4', 3333))).toBe(-1);
	});

	test('Clear sessions', () => {
		let sessions = SessionIDManager.getInstance();
		sessions.clear();
		expect(sessions.numSessionIds()).toBe(0);
	});

	test('Add multiple sessions (sequential)', () => {
		const s11 = makeSession('1', 1111);
		const s12 = makeSession('2', 1111);
		const s13 = makeSession('3', 1111);
		const s14 = makeSession('4', 1111);
		const s21 = makeSession('1', 2222);
		const s22 = makeSession('2', 2222);
		const s23 = makeSession('3', 2222);
		const s24 = makeSession('4', 2222);
		const s31 = makeSession('1', 3333);
		const s32 = makeSession('2', 3333);
		const s33 = makeSession('3', 3333);
		const s34 = makeSession('4', 3333);
		const s41 = makeSession('1', 4444);
		const s42 = makeSession('2', 4444);
		const s43 = makeSession('3', 4444);
		const s44 = makeSession('4', 4444);

		let sessions = SessionIDManager.getInstance();
		sessions.addSessionId(s11);
		sessions.addSessionId(s12);
		sessions.addSessionId(s13);
		sessions.addSessionId(s14);
		sessions.addSessionId(s21);
		sessions.addSessionId(s22);
		sessions.addSessionId(s23);
		sessions.addSessionId(s24);
		sessions.addSessionId(s31);
		sessions.addSessionId(s32);
		sessions.addSessionId(s33);
		sessions.addSessionId(s34);
		sessions.addSessionId(s41);
		sessions.addSessionId(s42);
		sessions.addSessionId(s43);
		sessions.addSessionId(s44);
		expect(sessions.numSessionIds()).toBe(16);

		expect(sessions.hasSessionId(s11)).toBe(true);
		expect(sessions.hasSessionId(s12)).toBe(true);
		expect(sessions.hasSessionId(s13)).toBe(true);
		expect(sessions.hasSessionId(s14)).toBe(true);
		expect(sessions.hasSessionId(s21)).toBe(true);
		expect(sessions.hasSessionId(s22)).toBe(true);
		expect(sessions.hasSessionId(s23)).toBe(true);
		expect(sessions.hasSessionId(s24)).toBe(true);
		expect(sessions.hasSessionId(s31)).toBe(true);
		expect(sessions.hasSessionId(s32)).toBe(true);
		expect(sessions.hasSessionId(s33)).toBe(true);
		expect(sessions.hasSessionId(s34)).toBe(true);
		expect(sessions.hasSessionId(s41)).toBe(true);
		expect(sessions.hasSessionId(s42)).toBe(true);
		expect(sessions.hasSessionId(s43)).toBe(true);
		expect(sessions.hasSessionId(s44)).toBe(true);

		sessions.removeUserSessions(toPlayerPublicId(1111));
		expect(sessions.numSessionIds()).toBe(12);

		expect(sessions.hasSessionId(s11)).toBe(false);
		expect(sessions.hasSessionId(s12)).toBe(false);
		expect(sessions.hasSessionId(s13)).toBe(false);
		expect(sessions.hasSessionId(s14)).toBe(false);
		expect(sessions.hasSessionId(s21)).toBe(true);
		expect(sessions.hasSessionId(s22)).toBe(true);
		expect(sessions.hasSessionId(s23)).toBe(true);
		expect(sessions.hasSessionId(s24)).toBe(true);
		expect(sessions.hasSessionId(s31)).toBe(true);
		expect(sessions.hasSessionId(s32)).toBe(true);
		expect(sessions.hasSessionId(s33)).toBe(true);
		expect(sessions.hasSessionId(s34)).toBe(true);
		expect(sessions.hasSessionId(s41)).toBe(true);
		expect(sessions.hasSessionId(s42)).toBe(true);
		expect(sessions.hasSessionId(s43)).toBe(true);
		expect(sessions.hasSessionId(s44)).toBe(true);

		sessions.removeUserSessions(toPlayerPublicId(4444));
		expect(sessions.numSessionIds()).toBe(8);

		expect(sessions.hasSessionId(s11)).toBe(false);
		expect(sessions.hasSessionId(s12)).toBe(false);
		expect(sessions.hasSessionId(s13)).toBe(false);
		expect(sessions.hasSessionId(s14)).toBe(false);
		expect(sessions.hasSessionId(s21)).toBe(true);
		expect(sessions.hasSessionId(s22)).toBe(true);
		expect(sessions.hasSessionId(s23)).toBe(true);
		expect(sessions.hasSessionId(s24)).toBe(true);
		expect(sessions.hasSessionId(s31)).toBe(true);
		expect(sessions.hasSessionId(s32)).toBe(true);
		expect(sessions.hasSessionId(s33)).toBe(true);
		expect(sessions.hasSessionId(s34)).toBe(true);
		expect(sessions.hasSessionId(s41)).toBe(false);
		expect(sessions.hasSessionId(s42)).toBe(false);
		expect(sessions.hasSessionId(s43)).toBe(false);
		expect(sessions.hasSessionId(s44)).toBe(false);

		sessions.removeUserSessions(toPlayerPublicId(2222));
		expect(sessions.numSessionIds()).toBe(4);

		expect(sessions.hasSessionId(s11)).toBe(false);
		expect(sessions.hasSessionId(s12)).toBe(false);
		expect(sessions.hasSessionId(s13)).toBe(false);
		expect(sessions.hasSessionId(s14)).toBe(false);
		expect(sessions.hasSessionId(s21)).toBe(false);
		expect(sessions.hasSessionId(s22)).toBe(false);
		expect(sessions.hasSessionId(s23)).toBe(false);
		expect(sessions.hasSessionId(s24)).toBe(false);
		expect(sessions.hasSessionId(s31)).toBe(true);
		expect(sessions.hasSessionId(s32)).toBe(true);
		expect(sessions.hasSessionId(s33)).toBe(true);
		expect(sessions.hasSessionId(s34)).toBe(true);
		expect(sessions.hasSessionId(s41)).toBe(false);
		expect(sessions.hasSessionId(s42)).toBe(false);
		expect(sessions.hasSessionId(s43)).toBe(false);
		expect(sessions.hasSessionId(s44)).toBe(false);

		sessions.removeUserSessions(toPlayerPublicId(3333));
		expect(sessions.numSessionIds()).toBe(0);

		expect(sessions.hasSessionId(s11)).toBe(false);
		expect(sessions.hasSessionId(s12)).toBe(false);
		expect(sessions.hasSessionId(s13)).toBe(false);
		expect(sessions.hasSessionId(s14)).toBe(false);
		expect(sessions.hasSessionId(s21)).toBe(false);
		expect(sessions.hasSessionId(s22)).toBe(false);
		expect(sessions.hasSessionId(s23)).toBe(false);
		expect(sessions.hasSessionId(s24)).toBe(false);
		expect(sessions.hasSessionId(s31)).toBe(false);
		expect(sessions.hasSessionId(s32)).toBe(false);
		expect(sessions.hasSessionId(s33)).toBe(false);
		expect(sessions.hasSessionId(s34)).toBe(false);
		expect(sessions.hasSessionId(s41)).toBe(false);
		expect(sessions.hasSessionId(s42)).toBe(false);
		expect(sessions.hasSessionId(s43)).toBe(false);
		expect(sessions.hasSessionId(s44)).toBe(false);
	});

	test('Add multiple sessions (randomized)', () => {
		const s11 = makeSession('1', 1111);
		const s12 = makeSession('2', 1111);
		const s13 = makeSession('3', 1111);
		const s14 = makeSession('4', 1111);
		const s21 = makeSession('1', 2222);
		const s22 = makeSession('2', 2222);
		const s23 = makeSession('3', 2222);
		const s24 = makeSession('4', 2222);
		const s31 = makeSession('1', 3333);
		const s32 = makeSession('2', 3333);
		const s33 = makeSession('3', 3333);
		const s34 = makeSession('4', 3333);
		const s41 = makeSession('1', 4444);
		const s42 = makeSession('2', 4444);
		const s43 = makeSession('3', 4444);
		const s44 = makeSession('4', 4444);

		let sessions = SessionIDManager.getInstance();
		sessions.addSessionId(s11);
		sessions.addSessionId(s34);
		sessions.addSessionId(s13);
		sessions.addSessionId(s14);
		sessions.addSessionId(s41);
		sessions.addSessionId(s12);
		sessions.addSessionId(s23);
		sessions.addSessionId(s31);
		sessions.addSessionId(s24);
		sessions.addSessionId(s32);
		sessions.addSessionId(s43);
		sessions.addSessionId(s33);
		sessions.addSessionId(s42);
		sessions.addSessionId(s21);
		sessions.addSessionId(s22);
		sessions.addSessionId(s44);
		expect(sessions.numSessionIds()).toBe(16);

		expect(sessions.hasSessionId(s11)).toBe(true);
		expect(sessions.hasSessionId(s12)).toBe(true);
		expect(sessions.hasSessionId(s13)).toBe(true);
		expect(sessions.hasSessionId(s14)).toBe(true);
		expect(sessions.hasSessionId(s21)).toBe(true);
		expect(sessions.hasSessionId(s22)).toBe(true);
		expect(sessions.hasSessionId(s23)).toBe(true);
		expect(sessions.hasSessionId(s24)).toBe(true);
		expect(sessions.hasSessionId(s31)).toBe(true);
		expect(sessions.hasSessionId(s32)).toBe(true);
		expect(sessions.hasSessionId(s33)).toBe(true);
		expect(sessions.hasSessionId(s34)).toBe(true);
		expect(sessions.hasSessionId(s41)).toBe(true);
		expect(sessions.hasSessionId(s42)).toBe(true);
		expect(sessions.hasSessionId(s43)).toBe(true);
		expect(sessions.hasSessionId(s44)).toBe(true);

		sessions.removeUserSessions(toPlayerPublicId(1111));
		expect(sessions.numSessionIds()).toBe(12);

		expect(sessions.hasSessionId(s11)).toBe(false);
		expect(sessions.hasSessionId(s12)).toBe(false);
		expect(sessions.hasSessionId(s13)).toBe(false);
		expect(sessions.hasSessionId(s14)).toBe(false);
		expect(sessions.hasSessionId(s21)).toBe(true);
		expect(sessions.hasSessionId(s22)).toBe(true);
		expect(sessions.hasSessionId(s23)).toBe(true);
		expect(sessions.hasSessionId(s24)).toBe(true);
		expect(sessions.hasSessionId(s31)).toBe(true);
		expect(sessions.hasSessionId(s32)).toBe(true);
		expect(sessions.hasSessionId(s33)).toBe(true);
		expect(sessions.hasSessionId(s34)).toBe(true);
		expect(sessions.hasSessionId(s41)).toBe(true);
		expect(sessions.hasSessionId(s42)).toBe(true);
		expect(sessions.hasSessionId(s43)).toBe(true);
		expect(sessions.hasSessionId(s44)).toBe(true);

		sessions.removeUserSessions(toPlayerPublicId(4444));
		expect(sessions.numSessionIds()).toBe(8);

		expect(sessions.hasSessionId(s11)).toBe(false);
		expect(sessions.hasSessionId(s12)).toBe(false);
		expect(sessions.hasSessionId(s13)).toBe(false);
		expect(sessions.hasSessionId(s14)).toBe(false);
		expect(sessions.hasSessionId(s21)).toBe(true);
		expect(sessions.hasSessionId(s22)).toBe(true);
		expect(sessions.hasSessionId(s23)).toBe(true);
		expect(sessions.hasSessionId(s24)).toBe(true);
		expect(sessions.hasSessionId(s31)).toBe(true);
		expect(sessions.hasSessionId(s32)).toBe(true);
		expect(sessions.hasSessionId(s33)).toBe(true);
		expect(sessions.hasSessionId(s34)).toBe(true);
		expect(sessions.hasSessionId(s41)).toBe(false);
		expect(sessions.hasSessionId(s42)).toBe(false);
		expect(sessions.hasSessionId(s43)).toBe(false);
		expect(sessions.hasSessionId(s44)).toBe(false);

		sessions.removeUserSessions(toPlayerPublicId(2222));
		expect(sessions.numSessionIds()).toBe(4);

		expect(sessions.hasSessionId(s11)).toBe(false);
		expect(sessions.hasSessionId(s12)).toBe(false);
		expect(sessions.hasSessionId(s13)).toBe(false);
		expect(sessions.hasSessionId(s14)).toBe(false);
		expect(sessions.hasSessionId(s21)).toBe(false);
		expect(sessions.hasSessionId(s22)).toBe(false);
		expect(sessions.hasSessionId(s23)).toBe(false);
		expect(sessions.hasSessionId(s24)).toBe(false);
		expect(sessions.hasSessionId(s31)).toBe(true);
		expect(sessions.hasSessionId(s32)).toBe(true);
		expect(sessions.hasSessionId(s33)).toBe(true);
		expect(sessions.hasSessionId(s34)).toBe(true);
		expect(sessions.hasSessionId(s41)).toBe(false);
		expect(sessions.hasSessionId(s42)).toBe(false);
		expect(sessions.hasSessionId(s43)).toBe(false);
		expect(sessions.hasSessionId(s44)).toBe(false);

		sessions.removeUserSessions(toPlayerPublicId(3333));
		expect(sessions.numSessionIds()).toBe(0);

		expect(sessions.hasSessionId(s11)).toBe(false);
		expect(sessions.hasSessionId(s12)).toBe(false);
		expect(sessions.hasSessionId(s13)).toBe(false);
		expect(sessions.hasSessionId(s14)).toBe(false);
		expect(sessions.hasSessionId(s21)).toBe(false);
		expect(sessions.hasSessionId(s22)).toBe(false);
		expect(sessions.hasSessionId(s23)).toBe(false);
		expect(sessions.hasSessionId(s24)).toBe(false);
		expect(sessions.hasSessionId(s31)).toBe(false);
		expect(sessions.hasSessionId(s32)).toBe(false);
		expect(sessions.hasSessionId(s33)).toBe(false);
		expect(sessions.hasSessionId(s34)).toBe(false);
		expect(sessions.hasSessionId(s41)).toBe(false);
		expect(sessions.hasSessionId(s42)).toBe(false);
		expect(sessions.hasSessionId(s43)).toBe(false);
		expect(sessions.hasSessionId(s44)).toBe(false);
	});
});
