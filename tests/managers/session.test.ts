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

import { clear_server } from '../../src-server/managers/clear';
import { server_init_from_data } from '../../src-server/managers/initialization';
import {
	is_user_logged_in,
	session_id_add,
	session_id_delete,
	session_user_delete_all
} from '../../src-server/managers/session';
import { SessionIDManager } from '../../src-server/managers/session_id_manager';
import { user_add_new } from '../../src-server/managers/users';
import { SessionID } from '../../src-server/models/session_id';
import { ADMIN, MEMBER, STUDENT } from '../../src-server/models/user_role';
import { run_command } from './exec_utils';

const configuration = {
	ssl_certificate: {
		public_key_file: 'sadf',
		private_key_file: 'qwer',
		passphrase_file: 'kgj68'
	},
	ports: {
		http: '8080',
		https: '8443'
	},
	favicon: 'favicon.png',
	login_page: {
		title: 'Login title',
		icon: 'login.png'
	},
	home_page: {
		title: 'Home title',
		icon: 'home.png'
	},
	rating_system: 'Elo',
	time_controls: [
		{
			id: 'Classical',
			name: 'Classical (90 + 30)'
		},
		{
			id: 'Rapid',
			name: 'Rapid (12 + 5)'
		},
		{
			id: 'Rapid',
			name: 'Rapid (10 + 0)'
		},
		{
			id: 'Blitz',
			name: 'Blitz (5 + 3)'
		}
	],
	permissions: {
		admin: ['challenge_user', 'challenge_admin', 'challenge_member', 'challenge_teacher', 'challenge_student'],
		teacher: ['challenge_user', 'challenge_admin', 'challenge_member', 'challenge_teacher', 'challenge_student'],
		member: ['challenge_user', 'challenge_admin', 'challenge_member', 'challenge_teacher', 'challenge_student'],
		student: ['challenge_user', 'challenge_admin', 'challenge_member', 'challenge_teacher', 'challenge_student']
	}
};

describe('Session management via functions', () => {
	test('Load an empty server', async () => {
		await run_command('./tests/initialize_empty.sh');
		clear_server();
		expect(() => server_init_from_data('tests/webpage', configuration)).not.toThrow();

		user_add_new('aa', 'A', 'a', 'pass_a', [ADMIN]);
		user_add_new('bb', 'B', 'b', 'pass_b', [MEMBER]);
		user_add_new('cc', 'C', 'c', 'pass_c', [MEMBER]);
		user_add_new('dd', 'D', 'd', 'pass_d', [STUDENT]);
		user_add_new('ee', 'E', 'e', 'pass_e', [STUDENT]);
		user_add_new('ff', 'F', 'f', 'pass_f', [STUDENT]);
	});

	let session_aa_1: SessionID;
	let session_aa_2: SessionID;
	let session_bb_1: SessionID;
	let session_bb_2: SessionID;
	let session_cc_1: SessionID;
	let session_cc_2: SessionID;
	let session_dd_1: SessionID;
	let session_dd_2: SessionID;
	let session_ee_1: SessionID;
	let session_ee_2: SessionID;
	let session_ff_1: SessionID;
	let session_ff_2: SessionID;

	test('Add a few sessions', () => {
		const manager = SessionIDManager.get_instance();

		const token_aa = session_id_add('aa');
		session_aa_1 = new SessionID(token_aa, 'aa');
		{
			const log = is_user_logged_in(session_aa_1);
			expect(log[0]).toBe(true);
			expect(log[2]?.get_username()).toBe('aa');
		}
		expect(manager.num_session_ids()).toBe(1);

		const token_bb = session_id_add('bb');
		session_bb_1 = new SessionID(token_bb, 'bb');
		{
			const log = is_user_logged_in(session_aa_1);
			expect(log[0]).toBe(true);
			expect(log[2]?.get_username()).toBe('aa');
		}
		{
			const log = is_user_logged_in(session_bb_1);
			expect(log[0]).toBe(true);
			expect(log[2]?.get_username()).toBe('bb');
		}
		expect(manager.num_session_ids()).toBe(2);

		const token_cc = session_id_add('cc');
		session_cc_1 = new SessionID(token_cc, 'cc');
		{
			const log = is_user_logged_in(session_aa_1);
			expect(log[0]).toBe(true);
			expect(log[2]?.get_username()).toBe('aa');
		}
		{
			const log = is_user_logged_in(session_bb_1);
			expect(log[0]).toBe(true);
			expect(log[2]?.get_username()).toBe('bb');
		}
		{
			const log = is_user_logged_in(session_cc_1);
			expect(log[0]).toBe(true);
			expect(log[2]?.get_username()).toBe('cc');
		}
		expect(manager.num_session_ids()).toBe(3);

		const token_dd = session_id_add('dd');
		session_dd_1 = new SessionID(token_dd, 'dd');
		{
			const log = is_user_logged_in(session_aa_1);
			expect(log[0]).toBe(true);
			expect(log[2]?.get_username()).toBe('aa');
		}
		{
			const log = is_user_logged_in(session_bb_1);
			expect(log[0]).toBe(true);
			expect(log[2]?.get_username()).toBe('bb');
		}
		{
			const log = is_user_logged_in(session_cc_1);
			expect(log[0]).toBe(true);
			expect(log[2]?.get_username()).toBe('cc');
		}
		{
			const log = is_user_logged_in(session_dd_1);
			expect(log[0]).toBe(true);
			expect(log[2]?.get_username()).toBe('dd');
		}
		expect(manager.num_session_ids()).toBe(4);

		const token_ee = session_id_add('ee');
		session_ee_1 = new SessionID(token_ee, 'ee');
		{
			const log = is_user_logged_in(session_aa_1);
			expect(log[0]).toBe(true);
			expect(log[2]?.get_username()).toBe('aa');
		}
		{
			const log = is_user_logged_in(session_bb_1);
			expect(log[0]).toBe(true);
			expect(log[2]?.get_username()).toBe('bb');
		}
		{
			const log = is_user_logged_in(session_cc_1);
			expect(log[0]).toBe(true);
			expect(log[2]?.get_username()).toBe('cc');
		}
		{
			const log = is_user_logged_in(session_dd_1);
			expect(log[0]).toBe(true);
			expect(log[2]?.get_username()).toBe('dd');
		}
		{
			const log = is_user_logged_in(session_ee_1);
			expect(log[0]).toBe(true);
			expect(log[2]?.get_username()).toBe('ee');
		}
		expect(manager.num_session_ids()).toBe(5);

		const token_ff = session_id_add('ff');
		session_ff_1 = new SessionID(token_ff, 'ff');
		{
			const log = is_user_logged_in(session_aa_1);
			expect(log[0]).toBe(true);
			expect(log[2]?.get_username()).toBe('aa');
		}
		{
			const log = is_user_logged_in(session_bb_1);
			expect(log[0]).toBe(true);
			expect(log[2]?.get_username()).toBe('bb');
		}
		{
			const log = is_user_logged_in(session_cc_1);
			expect(log[0]).toBe(true);
			expect(log[2]?.get_username()).toBe('cc');
		}
		{
			const log = is_user_logged_in(session_dd_1);
			expect(log[0]).toBe(true);
			expect(log[2]?.get_username()).toBe('dd');
		}
		{
			const log = is_user_logged_in(session_ee_1);
			expect(log[0]).toBe(true);
			expect(log[2]?.get_username()).toBe('ee');
		}
		{
			const log = is_user_logged_in(session_ff_1);
			expect(log[0]).toBe(true);
			expect(log[2]?.get_username()).toBe('ff');
		}
		expect(manager.num_session_ids()).toBe(6);
	});

	test('Add repeated sessions', () => {
		const manager = SessionIDManager.get_instance();

		const token_aa = session_id_add('aa');
		session_aa_2 = new SessionID(token_aa, 'aa');
		{
			const log = is_user_logged_in(session_aa_1);
			expect(log[0]).toBe(true);
			expect(log[2]?.get_username()).toBe('aa');
		}
		{
			const log = is_user_logged_in(session_bb_1);
			expect(log[0]).toBe(true);
			expect(log[2]?.get_username()).toBe('bb');
		}
		{
			const log = is_user_logged_in(session_cc_1);
			expect(log[0]).toBe(true);
			expect(log[2]?.get_username()).toBe('cc');
		}
		{
			const log = is_user_logged_in(session_dd_1);
			expect(log[0]).toBe(true);
			expect(log[2]?.get_username()).toBe('dd');
		}
		{
			const log = is_user_logged_in(session_ee_1);
			expect(log[0]).toBe(true);
			expect(log[2]?.get_username()).toBe('ee');
		}
		{
			const log = is_user_logged_in(session_ff_1);
			expect(log[0]).toBe(true);
			expect(log[2]?.get_username()).toBe('ff');
		}
		{
			const log = is_user_logged_in(session_aa_2);
			expect(log[0]).toBe(true);
			expect(log[2]?.get_username()).toBe('aa');
		}
		expect(manager.num_session_ids()).toBe(7);

		const token_bb = session_id_add('bb');
		session_bb_2 = new SessionID(token_bb, 'bb');
		{
			const log = is_user_logged_in(session_aa_1);
			expect(log[0]).toBe(true);
			expect(log[2]?.get_username()).toBe('aa');
		}
		{
			const log = is_user_logged_in(session_bb_1);
			expect(log[0]).toBe(true);
			expect(log[2]?.get_username()).toBe('bb');
		}
		{
			const log = is_user_logged_in(session_cc_1);
			expect(log[0]).toBe(true);
			expect(log[2]?.get_username()).toBe('cc');
		}
		{
			const log = is_user_logged_in(session_dd_1);
			expect(log[0]).toBe(true);
			expect(log[2]?.get_username()).toBe('dd');
		}
		{
			const log = is_user_logged_in(session_ee_1);
			expect(log[0]).toBe(true);
			expect(log[2]?.get_username()).toBe('ee');
		}
		{
			const log = is_user_logged_in(session_ff_1);
			expect(log[0]).toBe(true);
			expect(log[2]?.get_username()).toBe('ff');
		}
		{
			const log = is_user_logged_in(session_aa_2);
			expect(log[0]).toBe(true);
			expect(log[2]?.get_username()).toBe('aa');
		}
		{
			const log = is_user_logged_in(session_bb_2);
			expect(log[0]).toBe(true);
			expect(log[2]?.get_username()).toBe('bb');
		}
		expect(manager.num_session_ids()).toBe(8);

		const token_cc = session_id_add('cc');
		session_cc_2 = new SessionID(token_cc, 'cc');
		{
			const log = is_user_logged_in(session_aa_1);
			expect(log[0]).toBe(true);
			expect(log[2]?.get_username()).toBe('aa');
		}
		{
			const log = is_user_logged_in(session_bb_1);
			expect(log[0]).toBe(true);
			expect(log[2]?.get_username()).toBe('bb');
		}
		{
			const log = is_user_logged_in(session_cc_1);
			expect(log[0]).toBe(true);
			expect(log[2]?.get_username()).toBe('cc');
		}
		{
			const log = is_user_logged_in(session_dd_1);
			expect(log[0]).toBe(true);
			expect(log[2]?.get_username()).toBe('dd');
		}
		{
			const log = is_user_logged_in(session_ee_1);
			expect(log[0]).toBe(true);
			expect(log[2]?.get_username()).toBe('ee');
		}
		{
			const log = is_user_logged_in(session_ff_1);
			expect(log[0]).toBe(true);
			expect(log[2]?.get_username()).toBe('ff');
		}
		{
			const log = is_user_logged_in(session_aa_2);
			expect(log[0]).toBe(true);
			expect(log[2]?.get_username()).toBe('aa');
		}
		{
			const log = is_user_logged_in(session_bb_2);
			expect(log[0]).toBe(true);
			expect(log[2]?.get_username()).toBe('bb');
		}
		{
			const log = is_user_logged_in(session_cc_2);
			expect(log[0]).toBe(true);
			expect(log[2]?.get_username()).toBe('cc');
		}
		expect(manager.num_session_ids()).toBe(9);

		const token_dd = session_id_add('dd');
		session_dd_2 = new SessionID(token_dd, 'dd');
		{
			const log = is_user_logged_in(session_aa_1);
			expect(log[0]).toBe(true);
			expect(log[2]?.get_username()).toBe('aa');
		}
		{
			const log = is_user_logged_in(session_bb_1);
			expect(log[0]).toBe(true);
			expect(log[2]?.get_username()).toBe('bb');
		}
		{
			const log = is_user_logged_in(session_cc_1);
			expect(log[0]).toBe(true);
			expect(log[2]?.get_username()).toBe('cc');
		}
		{
			const log = is_user_logged_in(session_dd_1);
			expect(log[0]).toBe(true);
			expect(log[2]?.get_username()).toBe('dd');
		}
		{
			const log = is_user_logged_in(session_ee_1);
			expect(log[0]).toBe(true);
			expect(log[2]?.get_username()).toBe('ee');
		}
		{
			const log = is_user_logged_in(session_ff_1);
			expect(log[0]).toBe(true);
			expect(log[2]?.get_username()).toBe('ff');
		}
		{
			const log = is_user_logged_in(session_aa_2);
			expect(log[0]).toBe(true);
			expect(log[2]?.get_username()).toBe('aa');
		}
		{
			const log = is_user_logged_in(session_bb_2);
			expect(log[0]).toBe(true);
			expect(log[2]?.get_username()).toBe('bb');
		}
		{
			const log = is_user_logged_in(session_cc_2);
			expect(log[0]).toBe(true);
			expect(log[2]?.get_username()).toBe('cc');
		}
		{
			const log = is_user_logged_in(session_dd_2);
			expect(log[0]).toBe(true);
			expect(log[2]?.get_username()).toBe('dd');
		}
		expect(manager.num_session_ids()).toBe(10);

		const token_ee = session_id_add('ee');
		session_ee_2 = new SessionID(token_ee, 'ee');
		{
			const log = is_user_logged_in(session_aa_1);
			expect(log[0]).toBe(true);
			expect(log[2]?.get_username()).toBe('aa');
		}
		{
			const log = is_user_logged_in(session_bb_1);
			expect(log[0]).toBe(true);
			expect(log[2]?.get_username()).toBe('bb');
		}
		{
			const log = is_user_logged_in(session_cc_1);
			expect(log[0]).toBe(true);
			expect(log[2]?.get_username()).toBe('cc');
		}
		{
			const log = is_user_logged_in(session_dd_1);
			expect(log[0]).toBe(true);
			expect(log[2]?.get_username()).toBe('dd');
		}
		{
			const log = is_user_logged_in(session_ee_1);
			expect(log[0]).toBe(true);
			expect(log[2]?.get_username()).toBe('ee');
		}
		{
			const log = is_user_logged_in(session_ff_1);
			expect(log[0]).toBe(true);
			expect(log[2]?.get_username()).toBe('ff');
		}
		{
			const log = is_user_logged_in(session_aa_2);
			expect(log[0]).toBe(true);
			expect(log[2]?.get_username()).toBe('aa');
		}
		{
			const log = is_user_logged_in(session_bb_2);
			expect(log[0]).toBe(true);
			expect(log[2]?.get_username()).toBe('bb');
		}
		{
			const log = is_user_logged_in(session_cc_2);
			expect(log[0]).toBe(true);
			expect(log[2]?.get_username()).toBe('cc');
		}
		{
			const log = is_user_logged_in(session_dd_2);
			expect(log[0]).toBe(true);
			expect(log[2]?.get_username()).toBe('dd');
		}
		{
			const log = is_user_logged_in(session_ee_2);
			expect(log[0]).toBe(true);
			expect(log[2]?.get_username()).toBe('ee');
		}
		expect(manager.num_session_ids()).toBe(11);

		const token_ff = session_id_add('ff');
		session_ff_2 = new SessionID(token_ff, 'ff');
		{
			const log = is_user_logged_in(session_aa_1);
			expect(log[0]).toBe(true);
			expect(log[2]?.get_username()).toBe('aa');
		}
		{
			const log = is_user_logged_in(session_bb_1);
			expect(log[0]).toBe(true);
			expect(log[2]?.get_username()).toBe('bb');
		}
		{
			const log = is_user_logged_in(session_cc_1);
			expect(log[0]).toBe(true);
			expect(log[2]?.get_username()).toBe('cc');
		}
		{
			const log = is_user_logged_in(session_dd_1);
			expect(log[0]).toBe(true);
			expect(log[2]?.get_username()).toBe('dd');
		}
		{
			const log = is_user_logged_in(session_ee_1);
			expect(log[0]).toBe(true);
			expect(log[2]?.get_username()).toBe('ee');
		}
		{
			const log = is_user_logged_in(session_ff_1);
			expect(log[0]).toBe(true);
			expect(log[2]?.get_username()).toBe('ff');
		}
		{
			const log = is_user_logged_in(session_aa_2);
			expect(log[0]).toBe(true);
			expect(log[2]?.get_username()).toBe('aa');
		}
		{
			const log = is_user_logged_in(session_bb_2);
			expect(log[0]).toBe(true);
			expect(log[2]?.get_username()).toBe('bb');
		}
		{
			const log = is_user_logged_in(session_cc_2);
			expect(log[0]).toBe(true);
			expect(log[2]?.get_username()).toBe('cc');
		}
		{
			const log = is_user_logged_in(session_dd_2);
			expect(log[0]).toBe(true);
			expect(log[2]?.get_username()).toBe('dd');
		}
		{
			const log = is_user_logged_in(session_ee_2);
			expect(log[0]).toBe(true);
			expect(log[2]?.get_username()).toBe('ee');
		}
		{
			const log = is_user_logged_in(session_ff_2);
			expect(log[0]).toBe(true);
			expect(log[2]?.get_username()).toBe('ff');
		}
		expect(manager.num_session_ids()).toBe(12);
	});

	test('A user logs out of a device', () => {
		const manager = SessionIDManager.get_instance();

		session_id_delete(session_aa_1);
		{
			const log = is_user_logged_in(session_aa_1);
			expect(log[0]).toBe(false);
			expect(log[1]).toBe('Forbidden access. <a href="/">Go home</a>.');
			expect(log[2]).toBe(undefined);
		}
		{
			const log = is_user_logged_in(session_bb_1);
			expect(log[0]).toBe(true);
			expect(log[2]?.get_username()).toBe('bb');
		}
		{
			const log = is_user_logged_in(session_cc_1);
			expect(log[0]).toBe(true);
			expect(log[2]?.get_username()).toBe('cc');
		}
		{
			const log = is_user_logged_in(session_dd_1);
			expect(log[0]).toBe(true);
			expect(log[2]?.get_username()).toBe('dd');
		}
		{
			const log = is_user_logged_in(session_ee_1);
			expect(log[0]).toBe(true);
			expect(log[2]?.get_username()).toBe('ee');
		}
		{
			const log = is_user_logged_in(session_ff_1);
			expect(log[0]).toBe(true);
			expect(log[2]?.get_username()).toBe('ff');
		}
		{
			const log = is_user_logged_in(session_aa_2);
			expect(log[0]).toBe(true);
			expect(log[2]?.get_username()).toBe('aa');
		}
		{
			const log = is_user_logged_in(session_bb_2);
			expect(log[0]).toBe(true);
			expect(log[2]?.get_username()).toBe('bb');
		}
		{
			const log = is_user_logged_in(session_cc_2);
			expect(log[0]).toBe(true);
			expect(log[2]?.get_username()).toBe('cc');
		}
		{
			const log = is_user_logged_in(session_dd_2);
			expect(log[0]).toBe(true);
			expect(log[2]?.get_username()).toBe('dd');
		}
		{
			const log = is_user_logged_in(session_ee_2);
			expect(log[0]).toBe(true);
			expect(log[2]?.get_username()).toBe('ee');
		}
		{
			const log = is_user_logged_in(session_ff_2);
			expect(log[0]).toBe(true);
			expect(log[2]?.get_username()).toBe('ff');
		}
		expect(manager.num_session_ids()).toBe(11);

		session_id_delete(session_ff_1);
		{
			const log = is_user_logged_in(session_aa_1);
			expect(log[0]).toBe(false);
			expect(log[1]).toBe('Forbidden access. <a href="/">Go home</a>.');
			expect(log[2]).toBe(undefined);
		}
		{
			const log = is_user_logged_in(session_bb_1);
			expect(log[0]).toBe(true);
			expect(log[2]?.get_username()).toBe('bb');
		}
		{
			const log = is_user_logged_in(session_cc_1);
			expect(log[0]).toBe(true);
			expect(log[2]?.get_username()).toBe('cc');
		}
		{
			const log = is_user_logged_in(session_dd_1);
			expect(log[0]).toBe(true);
			expect(log[2]?.get_username()).toBe('dd');
		}
		{
			const log = is_user_logged_in(session_ee_1);
			expect(log[0]).toBe(true);
			expect(log[2]?.get_username()).toBe('ee');
		}
		{
			const log = is_user_logged_in(session_ff_1);
			expect(log[0]).toBe(false);
			expect(log[1]).toBe('Forbidden access. <a href="/">Go home</a>.');
			expect(log[2]).toBe(undefined);
		}
		{
			const log = is_user_logged_in(session_aa_2);
			expect(log[0]).toBe(true);
			expect(log[2]?.get_username()).toBe('aa');
		}
		{
			const log = is_user_logged_in(session_bb_2);
			expect(log[0]).toBe(true);
			expect(log[2]?.get_username()).toBe('bb');
		}
		{
			const log = is_user_logged_in(session_cc_2);
			expect(log[0]).toBe(true);
			expect(log[2]?.get_username()).toBe('cc');
		}
		{
			const log = is_user_logged_in(session_dd_2);
			expect(log[0]).toBe(true);
			expect(log[2]?.get_username()).toBe('dd');
		}
		{
			const log = is_user_logged_in(session_ee_2);
			expect(log[0]).toBe(true);
			expect(log[2]?.get_username()).toBe('ee');
		}
		{
			const log = is_user_logged_in(session_ff_2);
			expect(log[0]).toBe(true);
			expect(log[2]?.get_username()).toBe('ff');
		}
		expect(manager.num_session_ids()).toBe(10);

		session_id_delete(session_ee_1);
		{
			const log = is_user_logged_in(session_aa_1);
			expect(log[0]).toBe(false);
			expect(log[1]).toBe('Forbidden access. <a href="/">Go home</a>.');
			expect(log[2]).toBe(undefined);
		}
		{
			const log = is_user_logged_in(session_bb_1);
			expect(log[0]).toBe(true);
			expect(log[2]?.get_username()).toBe('bb');
		}
		{
			const log = is_user_logged_in(session_cc_1);
			expect(log[0]).toBe(true);
			expect(log[2]?.get_username()).toBe('cc');
		}
		{
			const log = is_user_logged_in(session_dd_1);
			expect(log[0]).toBe(true);
			expect(log[2]?.get_username()).toBe('dd');
		}
		{
			const log = is_user_logged_in(session_ee_1);
			expect(log[0]).toBe(false);
			expect(log[1]).toBe('Forbidden access. <a href="/">Go home</a>.');
			expect(log[2]).toBe(undefined);
		}
		{
			const log = is_user_logged_in(session_ff_1);
			expect(log[0]).toBe(false);
			expect(log[1]).toBe('Forbidden access. <a href="/">Go home</a>.');
			expect(log[2]).toBe(undefined);
		}
		{
			const log = is_user_logged_in(session_aa_2);
			expect(log[0]).toBe(true);
			expect(log[2]?.get_username()).toBe('aa');
		}
		{
			const log = is_user_logged_in(session_bb_2);
			expect(log[0]).toBe(true);
			expect(log[2]?.get_username()).toBe('bb');
		}
		{
			const log = is_user_logged_in(session_cc_2);
			expect(log[0]).toBe(true);
			expect(log[2]?.get_username()).toBe('cc');
		}
		{
			const log = is_user_logged_in(session_dd_2);
			expect(log[0]).toBe(true);
			expect(log[2]?.get_username()).toBe('dd');
		}
		{
			const log = is_user_logged_in(session_ee_2);
			expect(log[0]).toBe(true);
			expect(log[2]?.get_username()).toBe('ee');
		}
		{
			const log = is_user_logged_in(session_ff_2);
			expect(log[0]).toBe(true);
			expect(log[2]?.get_username()).toBe('ff');
		}
		expect(manager.num_session_ids()).toBe(9);
	});

	test('A user has all its sessions deleted', () => {
		const manager = SessionIDManager.get_instance();

		session_user_delete_all('aa');
		{
			const log = is_user_logged_in(session_aa_1);
			expect(log[0]).toBe(false);
			expect(log[1]).toBe('Forbidden access. <a href="/">Go home</a>.');
			expect(log[2]).toBe(undefined);
		}
		{
			const log = is_user_logged_in(session_bb_1);
			expect(log[0]).toBe(true);
			expect(log[2]?.get_username()).toBe('bb');
		}
		{
			const log = is_user_logged_in(session_cc_1);
			expect(log[0]).toBe(true);
			expect(log[2]?.get_username()).toBe('cc');
		}
		{
			const log = is_user_logged_in(session_dd_1);
			expect(log[0]).toBe(true);
			expect(log[2]?.get_username()).toBe('dd');
		}
		{
			const log = is_user_logged_in(session_ee_1);
			expect(log[0]).toBe(false);
			expect(log[1]).toBe('Forbidden access. <a href="/">Go home</a>.');
			expect(log[2]).toBe(undefined);
		}
		{
			const log = is_user_logged_in(session_ff_1);
			expect(log[0]).toBe(false);
			expect(log[1]).toBe('Forbidden access. <a href="/">Go home</a>.');
			expect(log[2]).toBe(undefined);
		}
		{
			const log = is_user_logged_in(session_aa_2);
			expect(log[0]).toBe(false);
			expect(log[1]).toBe('Forbidden access. <a href="/">Go home</a>.');
			expect(log[2]).toBe(undefined);
		}
		{
			const log = is_user_logged_in(session_bb_2);
			expect(log[0]).toBe(true);
			expect(log[2]?.get_username()).toBe('bb');
		}
		{
			const log = is_user_logged_in(session_cc_2);
			expect(log[0]).toBe(true);
			expect(log[2]?.get_username()).toBe('cc');
		}
		{
			const log = is_user_logged_in(session_dd_2);
			expect(log[0]).toBe(true);
			expect(log[2]?.get_username()).toBe('dd');
		}
		{
			const log = is_user_logged_in(session_ee_2);
			expect(log[0]).toBe(true);
			expect(log[2]?.get_username()).toBe('ee');
		}
		{
			const log = is_user_logged_in(session_ff_2);
			expect(log[0]).toBe(true);
			expect(log[2]?.get_username()).toBe('ff');
		}
		expect(manager.num_session_ids()).toBe(8);

		session_user_delete_all('bb');
		{
			const log = is_user_logged_in(session_aa_1);
			expect(log[0]).toBe(false);
			expect(log[1]).toBe('Forbidden access. <a href="/">Go home</a>.');
			expect(log[2]).toBe(undefined);
		}
		{
			const log = is_user_logged_in(session_bb_1);
			expect(log[0]).toBe(false);
			expect(log[1]).toBe('Forbidden access. <a href="/">Go home</a>.');
			expect(log[2]).toBe(undefined);
		}
		{
			const log = is_user_logged_in(session_cc_1);
			expect(log[0]).toBe(true);
			expect(log[2]?.get_username()).toBe('cc');
		}
		{
			const log = is_user_logged_in(session_dd_1);
			expect(log[0]).toBe(true);
			expect(log[2]?.get_username()).toBe('dd');
		}
		{
			const log = is_user_logged_in(session_ee_1);
			expect(log[0]).toBe(false);
			expect(log[1]).toBe('Forbidden access. <a href="/">Go home</a>.');
			expect(log[2]).toBe(undefined);
		}
		{
			const log = is_user_logged_in(session_ff_1);
			expect(log[0]).toBe(false);
			expect(log[1]).toBe('Forbidden access. <a href="/">Go home</a>.');
			expect(log[2]).toBe(undefined);
		}
		{
			const log = is_user_logged_in(session_aa_2);
			expect(log[0]).toBe(false);
			expect(log[1]).toBe('Forbidden access. <a href="/">Go home</a>.');
			expect(log[2]).toBe(undefined);
		}
		{
			const log = is_user_logged_in(session_bb_2);
			expect(log[0]).toBe(false);
			expect(log[1]).toBe('Forbidden access. <a href="/">Go home</a>.');
			expect(log[2]).toBe(undefined);
		}
		{
			const log = is_user_logged_in(session_cc_2);
			expect(log[0]).toBe(true);
			expect(log[2]?.get_username()).toBe('cc');
		}
		{
			const log = is_user_logged_in(session_dd_2);
			expect(log[0]).toBe(true);
			expect(log[2]?.get_username()).toBe('dd');
		}
		{
			const log = is_user_logged_in(session_ee_2);
			expect(log[0]).toBe(true);
			expect(log[2]?.get_username()).toBe('ee');
		}
		{
			const log = is_user_logged_in(session_ff_2);
			expect(log[0]).toBe(true);
			expect(log[2]?.get_username()).toBe('ff');
		}
		expect(manager.num_session_ids()).toBe(6);

		session_user_delete_all('cc');
		{
			const log = is_user_logged_in(session_aa_1);
			expect(log[0]).toBe(false);
			expect(log[1]).toBe('Forbidden access. <a href="/">Go home</a>.');
			expect(log[2]).toBe(undefined);
		}
		{
			const log = is_user_logged_in(session_bb_1);
			expect(log[0]).toBe(false);
			expect(log[1]).toBe('Forbidden access. <a href="/">Go home</a>.');
			expect(log[2]).toBe(undefined);
		}
		{
			const log = is_user_logged_in(session_cc_1);
			expect(log[0]).toBe(false);
			expect(log[1]).toBe('Forbidden access. <a href="/">Go home</a>.');
			expect(log[2]).toBe(undefined);
		}
		{
			const log = is_user_logged_in(session_dd_1);
			expect(log[0]).toBe(true);
			expect(log[2]?.get_username()).toBe('dd');
		}
		{
			const log = is_user_logged_in(session_ee_1);
			expect(log[0]).toBe(false);
			expect(log[1]).toBe('Forbidden access. <a href="/">Go home</a>.');
			expect(log[2]).toBe(undefined);
		}
		{
			const log = is_user_logged_in(session_ff_1);
			expect(log[0]).toBe(false);
			expect(log[1]).toBe('Forbidden access. <a href="/">Go home</a>.');
			expect(log[2]).toBe(undefined);
		}
		{
			const log = is_user_logged_in(session_aa_2);
			expect(log[0]).toBe(false);
			expect(log[1]).toBe('Forbidden access. <a href="/">Go home</a>.');
			expect(log[2]).toBe(undefined);
		}
		{
			const log = is_user_logged_in(session_bb_2);
			expect(log[0]).toBe(false);
			expect(log[1]).toBe('Forbidden access. <a href="/">Go home</a>.');
			expect(log[2]).toBe(undefined);
		}
		{
			const log = is_user_logged_in(session_cc_2);
			expect(log[0]).toBe(false);
			expect(log[1]).toBe('Forbidden access. <a href="/">Go home</a>.');
			expect(log[2]).toBe(undefined);
		}
		{
			const log = is_user_logged_in(session_dd_2);
			expect(log[0]).toBe(true);
			expect(log[2]?.get_username()).toBe('dd');
		}
		{
			const log = is_user_logged_in(session_ee_2);
			expect(log[0]).toBe(true);
			expect(log[2]?.get_username()).toBe('ee');
		}
		{
			const log = is_user_logged_in(session_ff_2);
			expect(log[0]).toBe(true);
			expect(log[2]?.get_username()).toBe('ff');
		}
		expect(manager.num_session_ids()).toBe(4);

		session_user_delete_all('ff');
		{
			const log = is_user_logged_in(session_aa_1);
			expect(log[0]).toBe(false);
			expect(log[1]).toBe('Forbidden access. <a href="/">Go home</a>.');
			expect(log[2]).toBe(undefined);
		}
		{
			const log = is_user_logged_in(session_bb_1);
			expect(log[0]).toBe(false);
			expect(log[1]).toBe('Forbidden access. <a href="/">Go home</a>.');
			expect(log[2]).toBe(undefined);
		}
		{
			const log = is_user_logged_in(session_cc_1);
			expect(log[0]).toBe(false);
			expect(log[1]).toBe('Forbidden access. <a href="/">Go home</a>.');
			expect(log[2]).toBe(undefined);
		}
		{
			const log = is_user_logged_in(session_dd_1);
			expect(log[0]).toBe(true);
			expect(log[2]?.get_username()).toBe('dd');
		}
		{
			const log = is_user_logged_in(session_ee_1);
			expect(log[0]).toBe(false);
			expect(log[1]).toBe('Forbidden access. <a href="/">Go home</a>.');
			expect(log[2]).toBe(undefined);
		}
		{
			const log = is_user_logged_in(session_ff_1);
			expect(log[0]).toBe(false);
			expect(log[1]).toBe('Forbidden access. <a href="/">Go home</a>.');
			expect(log[2]).toBe(undefined);
		}
		{
			const log = is_user_logged_in(session_aa_2);
			expect(log[0]).toBe(false);
			expect(log[1]).toBe('Forbidden access. <a href="/">Go home</a>.');
			expect(log[2]).toBe(undefined);
		}
		{
			const log = is_user_logged_in(session_bb_2);
			expect(log[0]).toBe(false);
			expect(log[1]).toBe('Forbidden access. <a href="/">Go home</a>.');
			expect(log[2]).toBe(undefined);
		}
		{
			const log = is_user_logged_in(session_cc_2);
			expect(log[0]).toBe(false);
			expect(log[1]).toBe('Forbidden access. <a href="/">Go home</a>.');
			expect(log[2]).toBe(undefined);
		}
		{
			const log = is_user_logged_in(session_dd_2);
			expect(log[0]).toBe(true);
			expect(log[2]?.get_username()).toBe('dd');
		}
		{
			const log = is_user_logged_in(session_ee_2);
			expect(log[0]).toBe(true);
			expect(log[2]?.get_username()).toBe('ee');
		}
		{
			const log = is_user_logged_in(session_ff_2);
			expect(log[0]).toBe(false);
			expect(log[1]).toBe('Forbidden access. <a href="/">Go home</a>.');
			expect(log[2]).toBe(undefined);
		}
		expect(manager.num_session_ids()).toBe(3);

		session_user_delete_all('dd');
		{
			const log = is_user_logged_in(session_aa_1);
			expect(log[0]).toBe(false);
			expect(log[1]).toBe('Forbidden access. <a href="/">Go home</a>.');
			expect(log[2]).toBe(undefined);
		}
		{
			const log = is_user_logged_in(session_bb_1);
			expect(log[0]).toBe(false);
			expect(log[1]).toBe('Forbidden access. <a href="/">Go home</a>.');
			expect(log[2]).toBe(undefined);
		}
		{
			const log = is_user_logged_in(session_cc_1);
			expect(log[0]).toBe(false);
			expect(log[1]).toBe('Forbidden access. <a href="/">Go home</a>.');
			expect(log[2]).toBe(undefined);
		}
		{
			const log = is_user_logged_in(session_dd_1);
			expect(log[0]).toBe(false);
			expect(log[1]).toBe('Forbidden access. <a href="/">Go home</a>.');
			expect(log[2]).toBe(undefined);
		}
		{
			const log = is_user_logged_in(session_ee_1);
			expect(log[0]).toBe(false);
			expect(log[1]).toBe('Forbidden access. <a href="/">Go home</a>.');
			expect(log[2]).toBe(undefined);
		}
		{
			const log = is_user_logged_in(session_ff_1);
			expect(log[0]).toBe(false);
			expect(log[1]).toBe('Forbidden access. <a href="/">Go home</a>.');
			expect(log[2]).toBe(undefined);
		}
		{
			const log = is_user_logged_in(session_aa_2);
			expect(log[0]).toBe(false);
			expect(log[1]).toBe('Forbidden access. <a href="/">Go home</a>.');
			expect(log[2]).toBe(undefined);
		}
		{
			const log = is_user_logged_in(session_bb_2);
			expect(log[0]).toBe(false);
			expect(log[1]).toBe('Forbidden access. <a href="/">Go home</a>.');
			expect(log[2]).toBe(undefined);
		}
		{
			const log = is_user_logged_in(session_cc_2);
			expect(log[0]).toBe(false);
			expect(log[1]).toBe('Forbidden access. <a href="/">Go home</a>.');
			expect(log[2]).toBe(undefined);
		}
		{
			const log = is_user_logged_in(session_dd_2);
			expect(log[0]).toBe(false);
			expect(log[1]).toBe('Forbidden access. <a href="/">Go home</a>.');
			expect(log[2]).toBe(undefined);
		}
		{
			const log = is_user_logged_in(session_ee_2);
			expect(log[0]).toBe(true);
			expect(log[2]?.get_username()).toBe('ee');
		}
		{
			const log = is_user_logged_in(session_ff_2);
			expect(log[0]).toBe(false);
			expect(log[1]).toBe('Forbidden access. <a href="/">Go home</a>.');
			expect(log[2]).toBe(undefined);
		}
		expect(manager.num_session_ids()).toBe(1);

		session_user_delete_all('ee');
		{
			const log = is_user_logged_in(session_aa_1);
			expect(log[0]).toBe(false);
			expect(log[1]).toBe('Forbidden access. <a href="/">Go home</a>.');
			expect(log[2]).toBe(undefined);
		}
		{
			const log = is_user_logged_in(session_bb_1);
			expect(log[0]).toBe(false);
			expect(log[1]).toBe('Forbidden access. <a href="/">Go home</a>.');
			expect(log[2]).toBe(undefined);
		}
		{
			const log = is_user_logged_in(session_cc_1);
			expect(log[0]).toBe(false);
			expect(log[1]).toBe('Forbidden access. <a href="/">Go home</a>.');
			expect(log[2]).toBe(undefined);
		}
		{
			const log = is_user_logged_in(session_dd_1);
			expect(log[0]).toBe(false);
			expect(log[1]).toBe('Forbidden access. <a href="/">Go home</a>.');
			expect(log[2]).toBe(undefined);
		}
		{
			const log = is_user_logged_in(session_ee_1);
			expect(log[0]).toBe(false);
			expect(log[1]).toBe('Forbidden access. <a href="/">Go home</a>.');
			expect(log[2]).toBe(undefined);
		}
		{
			const log = is_user_logged_in(session_ff_1);
			expect(log[0]).toBe(false);
			expect(log[1]).toBe('Forbidden access. <a href="/">Go home</a>.');
			expect(log[2]).toBe(undefined);
		}
		{
			const log = is_user_logged_in(session_aa_2);
			expect(log[0]).toBe(false);
			expect(log[1]).toBe('Forbidden access. <a href="/">Go home</a>.');
			expect(log[2]).toBe(undefined);
		}
		{
			const log = is_user_logged_in(session_bb_2);
			expect(log[0]).toBe(false);
			expect(log[1]).toBe('Forbidden access. <a href="/">Go home</a>.');
			expect(log[2]).toBe(undefined);
		}
		{
			const log = is_user_logged_in(session_cc_2);
			expect(log[0]).toBe(false);
			expect(log[1]).toBe('Forbidden access. <a href="/">Go home</a>.');
			expect(log[2]).toBe(undefined);
		}
		{
			const log = is_user_logged_in(session_dd_2);
			expect(log[0]).toBe(false);
			expect(log[1]).toBe('Forbidden access. <a href="/">Go home</a>.');
			expect(log[2]).toBe(undefined);
		}
		{
			const log = is_user_logged_in(session_ee_2);
			expect(log[0]).toBe(false);
			expect(log[1]).toBe('Forbidden access. <a href="/">Go home</a>.');
			expect(log[2]).toBe(undefined);
		}
		{
			const log = is_user_logged_in(session_ff_2);
			expect(log[0]).toBe(false);
			expect(log[1]).toBe('Forbidden access. <a href="/">Go home</a>.');
			expect(log[2]).toBe(undefined);
		}
		expect(manager.num_session_ids()).toBe(0);
	});
});
