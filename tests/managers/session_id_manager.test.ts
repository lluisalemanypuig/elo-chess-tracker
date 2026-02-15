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

import { SessionIDManager } from '../../src-server/managers/session_id_manager';
import { SessionID } from '../../src-server/models/session_id';

describe('Session ID Manager', () => {
	test('Add single sessions', () => {
		const s1 = new SessionID('1', 'user.1');
		const s2 = new SessionID('2', 'user.2');
		const s3 = new SessionID('3', 'user.3');
		const s4 = new SessionID('4', 'user.4');

		let sessions = SessionIDManager.get_instance();

		sessions.add_session_id(s1);
		expect(sessions.num_session_ids()).toBe(1);

		sessions.add_session_id(s2);
		expect(sessions.num_session_ids()).toBe(2);

		sessions.add_session_id(s3);
		expect(sessions.num_session_ids()).toBe(3);

		sessions.add_session_id(s4);
		expect(sessions.num_session_ids()).toBe(4);

		expect(sessions.has_session_id(s1)).toBe(true);
		expect(sessions.has_session_id(s2)).toBe(true);
		expect(sessions.has_session_id(s3)).toBe(true);
		expect(sessions.has_session_id(s4)).toBe(true);

		expect(sessions.index_session_id(s1)).toBe(0);
		expect(sessions.index_session_id(s2)).toBe(1);
		expect(sessions.index_session_id(s3)).toBe(2);
		expect(sessions.index_session_id(s4)).toBe(3);

		expect(sessions.has_session_id(new SessionID('1', 'user.2'))).toBe(false);
		expect(sessions.has_session_id(new SessionID('1', 'user.3'))).toBe(false);
		expect(sessions.has_session_id(new SessionID('1', 'user.4'))).toBe(false);
		expect(sessions.has_session_id(new SessionID('2', 'user.1'))).toBe(false);
		expect(sessions.has_session_id(new SessionID('2', 'user.3'))).toBe(false);
		expect(sessions.has_session_id(new SessionID('2', 'user.4'))).toBe(false);
		expect(sessions.has_session_id(new SessionID('3', 'user.1'))).toBe(false);
		expect(sessions.has_session_id(new SessionID('3', 'user.2'))).toBe(false);
		expect(sessions.has_session_id(new SessionID('3', 'user.4'))).toBe(false);
		expect(sessions.has_session_id(new SessionID('4', 'user.1'))).toBe(false);
		expect(sessions.has_session_id(new SessionID('4', 'user.2'))).toBe(false);
		expect(sessions.has_session_id(new SessionID('4', 'user.3'))).toBe(false);

		expect(sessions.index_session_id(new SessionID('1', 'user.2'))).toBe(-1);
		expect(sessions.index_session_id(new SessionID('1', 'user.3'))).toBe(-1);
		expect(sessions.index_session_id(new SessionID('1', 'user.4'))).toBe(-1);
		expect(sessions.index_session_id(new SessionID('2', 'user.1'))).toBe(-1);
		expect(sessions.index_session_id(new SessionID('2', 'user.3'))).toBe(-1);
		expect(sessions.index_session_id(new SessionID('2', 'user.4'))).toBe(-1);
		expect(sessions.index_session_id(new SessionID('3', 'user.1'))).toBe(-1);
		expect(sessions.index_session_id(new SessionID('3', 'user.2'))).toBe(-1);
		expect(sessions.index_session_id(new SessionID('3', 'user.4'))).toBe(-1);
		expect(sessions.index_session_id(new SessionID('4', 'user.1'))).toBe(-1);
		expect(sessions.index_session_id(new SessionID('4', 'user.2'))).toBe(-1);
		expect(sessions.index_session_id(new SessionID('4', 'user.3'))).toBe(-1);
	});

	test('Remove sessions', () => {
		const s1 = new SessionID('1', 'user.1');
		const s2 = new SessionID('2', 'user.2');
		const s3 = new SessionID('3', 'user.3');
		const s4 = new SessionID('4', 'user.4');

		let sessions = SessionIDManager.get_instance();

		sessions.remove_session_id(sessions.index_session_id(s3));
		expect(sessions.num_session_ids()).toBe(3);

		expect(sessions.has_session_id(s1)).toBe(true);
		expect(sessions.has_session_id(s2)).toBe(true);
		expect(sessions.has_session_id(s3)).toBe(false);
		expect(sessions.has_session_id(s4)).toBe(true);

		expect(sessions.index_session_id(s1)).toBe(0);
		expect(sessions.index_session_id(s2)).toBe(1);
		expect(sessions.index_session_id(s3)).toBe(-1);
		expect(sessions.index_session_id(s4)).toBe(2);

		expect(sessions.has_session_id(new SessionID('1', 'user.2'))).toBe(false);
		expect(sessions.has_session_id(new SessionID('1', 'user.3'))).toBe(false);
		expect(sessions.has_session_id(new SessionID('1', 'user.4'))).toBe(false);
		expect(sessions.has_session_id(new SessionID('2', 'user.1'))).toBe(false);
		expect(sessions.has_session_id(new SessionID('2', 'user.3'))).toBe(false);
		expect(sessions.has_session_id(new SessionID('2', 'user.4'))).toBe(false);
		expect(sessions.has_session_id(new SessionID('3', 'user.1'))).toBe(false);
		expect(sessions.has_session_id(new SessionID('3', 'user.2'))).toBe(false);
		expect(sessions.has_session_id(new SessionID('3', 'user.4'))).toBe(false);
		expect(sessions.has_session_id(new SessionID('4', 'user.1'))).toBe(false);
		expect(sessions.has_session_id(new SessionID('4', 'user.2'))).toBe(false);
		expect(sessions.has_session_id(new SessionID('4', 'user.3'))).toBe(false);

		expect(sessions.index_session_id(new SessionID('1', 'user.2'))).toBe(-1);
		expect(sessions.index_session_id(new SessionID('1', 'user.3'))).toBe(-1);
		expect(sessions.index_session_id(new SessionID('1', 'user.4'))).toBe(-1);
		expect(sessions.index_session_id(new SessionID('2', 'user.1'))).toBe(-1);
		expect(sessions.index_session_id(new SessionID('2', 'user.3'))).toBe(-1);
		expect(sessions.index_session_id(new SessionID('2', 'user.4'))).toBe(-1);
		expect(sessions.index_session_id(new SessionID('3', 'user.1'))).toBe(-1);
		expect(sessions.index_session_id(new SessionID('3', 'user.2'))).toBe(-1);
		expect(sessions.index_session_id(new SessionID('3', 'user.4'))).toBe(-1);
		expect(sessions.index_session_id(new SessionID('4', 'user.1'))).toBe(-1);
		expect(sessions.index_session_id(new SessionID('4', 'user.2'))).toBe(-1);
		expect(sessions.index_session_id(new SessionID('4', 'user.3'))).toBe(-1);

		sessions.remove_session_id(sessions.index_session_id(s1));
		expect(sessions.num_session_ids()).toBe(2);

		expect(sessions.has_session_id(s1)).toBe(false);
		expect(sessions.has_session_id(s2)).toBe(true);
		expect(sessions.has_session_id(s3)).toBe(false);
		expect(sessions.has_session_id(s4)).toBe(true);

		expect(sessions.index_session_id(s1)).toBe(-1);
		expect(sessions.index_session_id(s2)).toBe(0);
		expect(sessions.index_session_id(s3)).toBe(-1);
		expect(sessions.index_session_id(s4)).toBe(1);

		expect(sessions.has_session_id(new SessionID('1', 'user.2'))).toBe(false);
		expect(sessions.has_session_id(new SessionID('1', 'user.3'))).toBe(false);
		expect(sessions.has_session_id(new SessionID('1', 'user.4'))).toBe(false);
		expect(sessions.has_session_id(new SessionID('2', 'user.1'))).toBe(false);
		expect(sessions.has_session_id(new SessionID('2', 'user.3'))).toBe(false);
		expect(sessions.has_session_id(new SessionID('2', 'user.4'))).toBe(false);
		expect(sessions.has_session_id(new SessionID('3', 'user.1'))).toBe(false);
		expect(sessions.has_session_id(new SessionID('3', 'user.2'))).toBe(false);
		expect(sessions.has_session_id(new SessionID('3', 'user.4'))).toBe(false);
		expect(sessions.has_session_id(new SessionID('4', 'user.1'))).toBe(false);
		expect(sessions.has_session_id(new SessionID('4', 'user.2'))).toBe(false);
		expect(sessions.has_session_id(new SessionID('4', 'user.3'))).toBe(false);

		expect(sessions.index_session_id(new SessionID('1', 'user.2'))).toBe(-1);
		expect(sessions.index_session_id(new SessionID('1', 'user.3'))).toBe(-1);
		expect(sessions.index_session_id(new SessionID('1', 'user.4'))).toBe(-1);
		expect(sessions.index_session_id(new SessionID('2', 'user.1'))).toBe(-1);
		expect(sessions.index_session_id(new SessionID('2', 'user.3'))).toBe(-1);
		expect(sessions.index_session_id(new SessionID('2', 'user.4'))).toBe(-1);
		expect(sessions.index_session_id(new SessionID('3', 'user.1'))).toBe(-1);
		expect(sessions.index_session_id(new SessionID('3', 'user.2'))).toBe(-1);
		expect(sessions.index_session_id(new SessionID('3', 'user.4'))).toBe(-1);
		expect(sessions.index_session_id(new SessionID('4', 'user.1'))).toBe(-1);
		expect(sessions.index_session_id(new SessionID('4', 'user.2'))).toBe(-1);
		expect(sessions.index_session_id(new SessionID('4', 'user.3'))).toBe(-1);
	});

	test('Clear sessions', () => {
		let sessions = SessionIDManager.get_instance();
		sessions.clear();
		expect(sessions.num_session_ids()).toBe(0);
	});

	test('Add multiple sessions (sequential)', () => {
		const s11 = new SessionID('1', 'user.1');
		const s12 = new SessionID('2', 'user.1');
		const s13 = new SessionID('3', 'user.1');
		const s14 = new SessionID('4', 'user.1');
		const s21 = new SessionID('1', 'user.2');
		const s22 = new SessionID('2', 'user.2');
		const s23 = new SessionID('3', 'user.2');
		const s24 = new SessionID('4', 'user.2');
		const s31 = new SessionID('1', 'user.3');
		const s32 = new SessionID('2', 'user.3');
		const s33 = new SessionID('3', 'user.3');
		const s34 = new SessionID('4', 'user.3');
		const s41 = new SessionID('1', 'user.4');
		const s42 = new SessionID('2', 'user.4');
		const s43 = new SessionID('3', 'user.4');
		const s44 = new SessionID('4', 'user.4');

		let sessions = SessionIDManager.get_instance();
		sessions.add_session_id(s11);
		sessions.add_session_id(s12);
		sessions.add_session_id(s13);
		sessions.add_session_id(s14);
		sessions.add_session_id(s21);
		sessions.add_session_id(s22);
		sessions.add_session_id(s23);
		sessions.add_session_id(s24);
		sessions.add_session_id(s31);
		sessions.add_session_id(s32);
		sessions.add_session_id(s33);
		sessions.add_session_id(s34);
		sessions.add_session_id(s41);
		sessions.add_session_id(s42);
		sessions.add_session_id(s43);
		sessions.add_session_id(s44);
		expect(sessions.num_session_ids()).toBe(16);

		expect(sessions.has_session_id(s11)).toBe(true);
		expect(sessions.has_session_id(s12)).toBe(true);
		expect(sessions.has_session_id(s13)).toBe(true);
		expect(sessions.has_session_id(s14)).toBe(true);
		expect(sessions.has_session_id(s21)).toBe(true);
		expect(sessions.has_session_id(s22)).toBe(true);
		expect(sessions.has_session_id(s23)).toBe(true);
		expect(sessions.has_session_id(s24)).toBe(true);
		expect(sessions.has_session_id(s31)).toBe(true);
		expect(sessions.has_session_id(s32)).toBe(true);
		expect(sessions.has_session_id(s33)).toBe(true);
		expect(sessions.has_session_id(s34)).toBe(true);
		expect(sessions.has_session_id(s41)).toBe(true);
		expect(sessions.has_session_id(s42)).toBe(true);
		expect(sessions.has_session_id(s43)).toBe(true);
		expect(sessions.has_session_id(s44)).toBe(true);

		sessions.remove_user_sessions('user.1');
		expect(sessions.num_session_ids()).toBe(12);

		expect(sessions.has_session_id(s11)).toBe(false);
		expect(sessions.has_session_id(s12)).toBe(false);
		expect(sessions.has_session_id(s13)).toBe(false);
		expect(sessions.has_session_id(s14)).toBe(false);
		expect(sessions.has_session_id(s21)).toBe(true);
		expect(sessions.has_session_id(s22)).toBe(true);
		expect(sessions.has_session_id(s23)).toBe(true);
		expect(sessions.has_session_id(s24)).toBe(true);
		expect(sessions.has_session_id(s31)).toBe(true);
		expect(sessions.has_session_id(s32)).toBe(true);
		expect(sessions.has_session_id(s33)).toBe(true);
		expect(sessions.has_session_id(s34)).toBe(true);
		expect(sessions.has_session_id(s41)).toBe(true);
		expect(sessions.has_session_id(s42)).toBe(true);
		expect(sessions.has_session_id(s43)).toBe(true);
		expect(sessions.has_session_id(s44)).toBe(true);

		sessions.remove_user_sessions('user.4');
		expect(sessions.num_session_ids()).toBe(8);

		expect(sessions.has_session_id(s11)).toBe(false);
		expect(sessions.has_session_id(s12)).toBe(false);
		expect(sessions.has_session_id(s13)).toBe(false);
		expect(sessions.has_session_id(s14)).toBe(false);
		expect(sessions.has_session_id(s21)).toBe(true);
		expect(sessions.has_session_id(s22)).toBe(true);
		expect(sessions.has_session_id(s23)).toBe(true);
		expect(sessions.has_session_id(s24)).toBe(true);
		expect(sessions.has_session_id(s31)).toBe(true);
		expect(sessions.has_session_id(s32)).toBe(true);
		expect(sessions.has_session_id(s33)).toBe(true);
		expect(sessions.has_session_id(s34)).toBe(true);
		expect(sessions.has_session_id(s41)).toBe(false);
		expect(sessions.has_session_id(s42)).toBe(false);
		expect(sessions.has_session_id(s43)).toBe(false);
		expect(sessions.has_session_id(s44)).toBe(false);

		sessions.remove_user_sessions('user.2');
		expect(sessions.num_session_ids()).toBe(4);

		expect(sessions.has_session_id(s11)).toBe(false);
		expect(sessions.has_session_id(s12)).toBe(false);
		expect(sessions.has_session_id(s13)).toBe(false);
		expect(sessions.has_session_id(s14)).toBe(false);
		expect(sessions.has_session_id(s21)).toBe(false);
		expect(sessions.has_session_id(s22)).toBe(false);
		expect(sessions.has_session_id(s23)).toBe(false);
		expect(sessions.has_session_id(s24)).toBe(false);
		expect(sessions.has_session_id(s31)).toBe(true);
		expect(sessions.has_session_id(s32)).toBe(true);
		expect(sessions.has_session_id(s33)).toBe(true);
		expect(sessions.has_session_id(s34)).toBe(true);
		expect(sessions.has_session_id(s41)).toBe(false);
		expect(sessions.has_session_id(s42)).toBe(false);
		expect(sessions.has_session_id(s43)).toBe(false);
		expect(sessions.has_session_id(s44)).toBe(false);

		sessions.remove_user_sessions('user.3');
		expect(sessions.num_session_ids()).toBe(0);

		expect(sessions.has_session_id(s11)).toBe(false);
		expect(sessions.has_session_id(s12)).toBe(false);
		expect(sessions.has_session_id(s13)).toBe(false);
		expect(sessions.has_session_id(s14)).toBe(false);
		expect(sessions.has_session_id(s21)).toBe(false);
		expect(sessions.has_session_id(s22)).toBe(false);
		expect(sessions.has_session_id(s23)).toBe(false);
		expect(sessions.has_session_id(s24)).toBe(false);
		expect(sessions.has_session_id(s31)).toBe(false);
		expect(sessions.has_session_id(s32)).toBe(false);
		expect(sessions.has_session_id(s33)).toBe(false);
		expect(sessions.has_session_id(s34)).toBe(false);
		expect(sessions.has_session_id(s41)).toBe(false);
		expect(sessions.has_session_id(s42)).toBe(false);
		expect(sessions.has_session_id(s43)).toBe(false);
		expect(sessions.has_session_id(s44)).toBe(false);
	});

	test('Add multiple sessions (randomized)', () => {
		const s11 = new SessionID('1', 'user.1');
		const s12 = new SessionID('2', 'user.1');
		const s13 = new SessionID('3', 'user.1');
		const s14 = new SessionID('4', 'user.1');
		const s21 = new SessionID('1', 'user.2');
		const s22 = new SessionID('2', 'user.2');
		const s23 = new SessionID('3', 'user.2');
		const s24 = new SessionID('4', 'user.2');
		const s31 = new SessionID('1', 'user.3');
		const s32 = new SessionID('2', 'user.3');
		const s33 = new SessionID('3', 'user.3');
		const s34 = new SessionID('4', 'user.3');
		const s41 = new SessionID('1', 'user.4');
		const s42 = new SessionID('2', 'user.4');
		const s43 = new SessionID('3', 'user.4');
		const s44 = new SessionID('4', 'user.4');

		let sessions = SessionIDManager.get_instance();
		sessions.add_session_id(s11);
		sessions.add_session_id(s34);
		sessions.add_session_id(s13);
		sessions.add_session_id(s14);
		sessions.add_session_id(s41);
		sessions.add_session_id(s12);
		sessions.add_session_id(s23);
		sessions.add_session_id(s31);
		sessions.add_session_id(s24);
		sessions.add_session_id(s32);
		sessions.add_session_id(s43);
		sessions.add_session_id(s33);
		sessions.add_session_id(s42);
		sessions.add_session_id(s21);
		sessions.add_session_id(s22);
		sessions.add_session_id(s44);
		expect(sessions.num_session_ids()).toBe(16);

		expect(sessions.has_session_id(s11)).toBe(true);
		expect(sessions.has_session_id(s12)).toBe(true);
		expect(sessions.has_session_id(s13)).toBe(true);
		expect(sessions.has_session_id(s14)).toBe(true);
		expect(sessions.has_session_id(s21)).toBe(true);
		expect(sessions.has_session_id(s22)).toBe(true);
		expect(sessions.has_session_id(s23)).toBe(true);
		expect(sessions.has_session_id(s24)).toBe(true);
		expect(sessions.has_session_id(s31)).toBe(true);
		expect(sessions.has_session_id(s32)).toBe(true);
		expect(sessions.has_session_id(s33)).toBe(true);
		expect(sessions.has_session_id(s34)).toBe(true);
		expect(sessions.has_session_id(s41)).toBe(true);
		expect(sessions.has_session_id(s42)).toBe(true);
		expect(sessions.has_session_id(s43)).toBe(true);
		expect(sessions.has_session_id(s44)).toBe(true);

		sessions.remove_user_sessions('user.1');
		expect(sessions.num_session_ids()).toBe(12);

		expect(sessions.has_session_id(s11)).toBe(false);
		expect(sessions.has_session_id(s12)).toBe(false);
		expect(sessions.has_session_id(s13)).toBe(false);
		expect(sessions.has_session_id(s14)).toBe(false);
		expect(sessions.has_session_id(s21)).toBe(true);
		expect(sessions.has_session_id(s22)).toBe(true);
		expect(sessions.has_session_id(s23)).toBe(true);
		expect(sessions.has_session_id(s24)).toBe(true);
		expect(sessions.has_session_id(s31)).toBe(true);
		expect(sessions.has_session_id(s32)).toBe(true);
		expect(sessions.has_session_id(s33)).toBe(true);
		expect(sessions.has_session_id(s34)).toBe(true);
		expect(sessions.has_session_id(s41)).toBe(true);
		expect(sessions.has_session_id(s42)).toBe(true);
		expect(sessions.has_session_id(s43)).toBe(true);
		expect(sessions.has_session_id(s44)).toBe(true);

		sessions.remove_user_sessions('user.4');
		expect(sessions.num_session_ids()).toBe(8);

		expect(sessions.has_session_id(s11)).toBe(false);
		expect(sessions.has_session_id(s12)).toBe(false);
		expect(sessions.has_session_id(s13)).toBe(false);
		expect(sessions.has_session_id(s14)).toBe(false);
		expect(sessions.has_session_id(s21)).toBe(true);
		expect(sessions.has_session_id(s22)).toBe(true);
		expect(sessions.has_session_id(s23)).toBe(true);
		expect(sessions.has_session_id(s24)).toBe(true);
		expect(sessions.has_session_id(s31)).toBe(true);
		expect(sessions.has_session_id(s32)).toBe(true);
		expect(sessions.has_session_id(s33)).toBe(true);
		expect(sessions.has_session_id(s34)).toBe(true);
		expect(sessions.has_session_id(s41)).toBe(false);
		expect(sessions.has_session_id(s42)).toBe(false);
		expect(sessions.has_session_id(s43)).toBe(false);
		expect(sessions.has_session_id(s44)).toBe(false);

		sessions.remove_user_sessions('user.2');
		expect(sessions.num_session_ids()).toBe(4);

		expect(sessions.has_session_id(s11)).toBe(false);
		expect(sessions.has_session_id(s12)).toBe(false);
		expect(sessions.has_session_id(s13)).toBe(false);
		expect(sessions.has_session_id(s14)).toBe(false);
		expect(sessions.has_session_id(s21)).toBe(false);
		expect(sessions.has_session_id(s22)).toBe(false);
		expect(sessions.has_session_id(s23)).toBe(false);
		expect(sessions.has_session_id(s24)).toBe(false);
		expect(sessions.has_session_id(s31)).toBe(true);
		expect(sessions.has_session_id(s32)).toBe(true);
		expect(sessions.has_session_id(s33)).toBe(true);
		expect(sessions.has_session_id(s34)).toBe(true);
		expect(sessions.has_session_id(s41)).toBe(false);
		expect(sessions.has_session_id(s42)).toBe(false);
		expect(sessions.has_session_id(s43)).toBe(false);
		expect(sessions.has_session_id(s44)).toBe(false);

		sessions.remove_user_sessions('user.3');
		expect(sessions.num_session_ids()).toBe(0);

		expect(sessions.has_session_id(s11)).toBe(false);
		expect(sessions.has_session_id(s12)).toBe(false);
		expect(sessions.has_session_id(s13)).toBe(false);
		expect(sessions.has_session_id(s14)).toBe(false);
		expect(sessions.has_session_id(s21)).toBe(false);
		expect(sessions.has_session_id(s22)).toBe(false);
		expect(sessions.has_session_id(s23)).toBe(false);
		expect(sessions.has_session_id(s24)).toBe(false);
		expect(sessions.has_session_id(s31)).toBe(false);
		expect(sessions.has_session_id(s32)).toBe(false);
		expect(sessions.has_session_id(s33)).toBe(false);
		expect(sessions.has_session_id(s34)).toBe(false);
		expect(sessions.has_session_id(s41)).toBe(false);
		expect(sessions.has_session_id(s42)).toBe(false);
		expect(sessions.has_session_id(s43)).toBe(false);
		expect(sessions.has_session_id(s44)).toBe(false);
	});
});
