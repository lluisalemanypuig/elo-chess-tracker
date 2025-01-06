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

import path from 'path';
import fs from 'fs';

import { run_command } from './exec_utils';
import { clear_server } from '../../ts-server/server/clear';
import { server_init_from_data } from '../../ts-server/server/initialization';
import { ADMIN, MEMBER, STUDENT } from '../../ts-server/models/user_role';
import { user_add_new, user_retrieve } from '../../ts-server/server/users';
import { ServerChallenges, ServerGames } from '../../ts-server/server/memory';
import {
	challenge_accept,
	challenge_agree_result,
	challenge_decline,
	challenge_send_new,
	challenge_set_result,
	challenge_set_retrieve,
	challenge_unset_result
} from '../../ts-server/server/challenges';
import { number_to_string } from '../../ts-server/utils/misc';
import { Challenge, challenge_from_json } from '../../ts-server/models/challenge';
import { User } from '../../ts-server/models/user';

const webpage_dir = 'tests/webpage';
const db_dir = path.join(webpage_dir, 'database');
//const db_users_dir = path.join(db_dir, 'users');
const db_challenges_dir = path.join(db_dir, 'challenges');
const db_games_dir = path.join(db_dir, 'games');

const classical_rapid_blitz = {
	ssl_certificate: {
		public_key_file: '',
		private_key_file: '',
		passphrase_file: ''
	},
	ports: {
		http: '',
		https: ''
	},
	favicon: '',
	login_page: {
		title: '',
		icon: ''
	},
	home_page: {
		title: '',
		icon: ''
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

describe('Check initialization', () => {
	test('In an empty server', async () => {
		await run_command('./tests/initialize_empty.sh');
		clear_server();
		server_init_from_data('tests/webpage/', classical_rapid_blitz);

		const challenges = ServerChallenges.get_instance();
		expect(challenges.num_challenges()).toBe(0);
		expect(challenges.get_max_challenge_id()).toBe(0);
		expect(challenge_set_retrieve()).toEqual([]);
		expect(challenges.get_challenge_id(number_to_string(1))).toEqual(null);
		expect(challenges.get_challenge_id(number_to_string(2))).toEqual(null);
		expect(challenges.get_challenge_index_id(number_to_string(1))).toEqual(-1);
		expect(challenges.get_challenge_index_id(number_to_string(2))).toEqual(-1);
	});
});

describe('Check challenge communication', () => {
	test('Add users', () => {
		user_add_new('aa', 'A', 'a', 'pass_a', [ADMIN]);
		user_add_new('bb', 'B', 'b', 'pass_b', [MEMBER]);
		user_add_new('cc', 'C', 'c', 'pass_c', [MEMBER]);
		user_add_new('dd', 'D', 'd', 'pass_d', [STUDENT]);
		user_add_new('ee', 'E', 'e', 'pass_e', [STUDENT]);
		user_add_new('ff', 'F', 'f', 'pass_f', [STUDENT]);
	});

	test('Sending', () => {
		const challenges = ServerChallenges.get_instance();
		expect(challenges.get_max_challenge_id()).toBe(0);

		const c_aa_bb = challenge_send_new('aa', 'bb');
		const c_aa_cc = challenge_send_new('aa', 'cc');
		const c_aa_dd = challenge_send_new('aa', 'dd');
		const c_ee_ff = challenge_send_new('ee', 'ff');

		const c_aa_bb_id = number_to_string(1);
		const c_aa_cc_id = number_to_string(2);
		const c_aa_dd_id = number_to_string(3);
		const c_ee_ff_id = number_to_string(4);

		expect(c_aa_bb.get_id()).toEqual(c_aa_bb_id);
		expect(c_aa_bb.get_sent_by()).toEqual('aa');
		expect(c_aa_bb.get_sent_to()).toEqual('bb');
		{
			const challenge_file_aa_bb = path.join(db_challenges_dir, c_aa_bb_id);
			expect(fs.existsSync(challenge_file_aa_bb)).toBe(true);
			const c_aa_bb_ = challenge_from_json(fs.readFileSync(challenge_file_aa_bb, 'utf8'));
			expect(c_aa_bb).toEqual(c_aa_bb_);
		}

		expect(c_aa_cc.get_id()).toEqual(c_aa_cc_id);
		expect(c_aa_cc.get_sent_by()).toEqual('aa');
		expect(c_aa_cc.get_sent_to()).toEqual('cc');
		{
			const challenge_file_aa_cc = path.join(db_challenges_dir, c_aa_cc_id);
			expect(fs.existsSync(challenge_file_aa_cc)).toBe(true);
			const c_aa_cc_ = challenge_from_json(fs.readFileSync(challenge_file_aa_cc, 'utf8'));
			expect(c_aa_cc).toEqual(c_aa_cc_);
		}

		expect(c_aa_dd.get_id()).toEqual(c_aa_dd_id);
		expect(c_aa_dd.get_sent_by()).toEqual('aa');
		expect(c_aa_dd.get_sent_to()).toEqual('dd');
		{
			const challenge_file_aa_dd = path.join(db_challenges_dir, c_aa_dd_id);
			expect(fs.existsSync(challenge_file_aa_dd)).toBe(true);
			const c_aa_dd_ = challenge_from_json(fs.readFileSync(challenge_file_aa_dd, 'utf8'));
			expect(c_aa_dd).toEqual(c_aa_dd_);
		}

		expect(c_ee_ff.get_id()).toEqual(c_ee_ff_id);
		expect(c_ee_ff.get_sent_by()).toEqual('ee');
		expect(c_ee_ff.get_sent_to()).toEqual('ff');
		{
			const challenge_file_ee_ff = path.join(db_challenges_dir, c_ee_ff_id);
			expect(fs.existsSync(challenge_file_ee_ff)).toBe(true);
			const c_ee_ff_ = challenge_from_json(fs.readFileSync(challenge_file_ee_ff, 'utf8'));
			expect(c_ee_ff).toEqual(c_ee_ff_);
		}

		expect(challenges.num_challenges()).toBe(4);
		expect(challenges.get_max_challenge_id()).toBe(4);
		expect(challenge_set_retrieve().length).toEqual(4);
		expect(challenges.get_challenge_id(number_to_string(1))).toEqual(c_aa_bb);
		expect(challenges.get_challenge_id(number_to_string(2))).toEqual(c_aa_cc);
		expect(challenges.get_challenge_id(number_to_string(3))).toEqual(c_aa_dd);
		expect(challenges.get_challenge_id(number_to_string(4))).toEqual(c_ee_ff);
		expect(challenges.get_challenge_index_id(number_to_string(1))).not.toEqual(-1);
		expect(challenges.get_challenge_index_id(number_to_string(2))).not.toEqual(-1);
		expect(challenges.get_challenge_index_id(number_to_string(3))).not.toEqual(-1);
		expect(challenges.get_challenge_index_id(number_to_string(4))).not.toEqual(-1);
	});

	test('Accept some challenges', () => {
		const challenges = ServerChallenges.get_instance();

		for (let i of [3, 4]) {
			const id = number_to_string(i);

			let c = challenges.get_challenge_id(id) as Challenge;
			challenge_accept(c);
			expect(c.get_when_challenge_accepted()).not.toBe(null);

			const challenge_file = path.join(db_challenges_dir, id);
			expect(fs.existsSync(challenge_file)).toBe(true);
			expect(challenge_from_json(fs.readFileSync(challenge_file, 'utf8'))).toEqual(c);
			expect(challenges.get_challenge_id(id)).toEqual(c);
		}
	});

	test('Decline some challenges', () => {
		const challenges = ServerChallenges.get_instance();

		for (let i of [1, 2]) {
			const id = number_to_string(i);

			let c = challenges.get_challenge_id(id) as Challenge;
			challenge_decline(c);
			expect(c.get_when_challenge_accepted()).toBe(null);

			const challenge_file = path.join(db_challenges_dir, id);
			expect(fs.existsSync(challenge_file)).toBe(false);
			expect(challenges.get_challenge_id(id)).toEqual(null);
		}

		expect(challenges.get_max_challenge_id()).toBe(4);
		expect(challenges.num_challenges()).toBe(2);
	});

	test('Set result (3)', () => {
		const challenges = ServerChallenges.get_instance();

		const id = number_to_string(3);

		let c = challenges.get_challenge_id(id) as Challenge;
		challenge_set_result(c, 'aa', 'aa', 'dd', 'white_wins', 'Blitz', 'Blitz (5 + 3)');

		expect(c.get_result_set_by()).toEqual('aa');
		expect(c.get_white()).toEqual('aa');
		expect(c.get_black()).toEqual('dd');
		expect(c.get_result()).toEqual('white_wins');
		expect(c.get_time_control_id()).toEqual('Blitz');
		expect(c.get_time_control_name()).toEqual('Blitz (5 + 3)');

		const challenge_file = path.join(db_challenges_dir, id);
		expect(fs.existsSync(challenge_file)).toBe(true);
		expect(challenge_from_json(fs.readFileSync(challenge_file, 'utf8'))).toEqual(c);
		expect(challenges.get_challenge_id(id)).toEqual(c);

		expect(challenges.num_challenges()).toBe(2);
	});

	test('Set result (4)', () => {
		const challenges = ServerChallenges.get_instance();

		const id = number_to_string(4);

		let c = challenges.get_challenge_id(id) as Challenge;
		challenge_set_result(c, 'ff', 'ee', 'ff', 'black_wins', 'Classical', 'Classical (90 + 30)');

		expect(c.get_result_set_by()).toEqual('ff');
		expect(c.get_white()).toEqual('ee');
		expect(c.get_black()).toEqual('ff');
		expect(c.get_result()).toEqual('black_wins');
		expect(c.get_time_control_id()).toEqual('Classical');
		expect(c.get_time_control_name()).toEqual('Classical (90 + 30)');

		const challenge_file = path.join(db_challenges_dir, id);
		expect(fs.existsSync(challenge_file)).toBe(true);
		expect(challenge_from_json(fs.readFileSync(challenge_file, 'utf8'))).toEqual(c);
		expect(challenges.get_challenge_id(id)).toEqual(c);

		expect(challenges.num_challenges()).toBe(2);
	});

	test('Accept result (4)', () => {
		const challenges = ServerChallenges.get_instance();

		const id = number_to_string(4);
		let c = challenges.get_challenge_id(id) as Challenge;
		expect(c.get_white()).toEqual('ee');
		expect(c.get_black()).toEqual('ff');

		challenge_agree_result(c);

		const aa = user_retrieve('aa') as User;
		expect(aa.get_games().length).toBe(0);
		const bb = user_retrieve('bb') as User;
		expect(bb.get_games().length).toBe(0);
		const cc = user_retrieve('cc') as User;
		expect(cc.get_games().length).toBe(0);
		const dd = user_retrieve('dd') as User;
		expect(dd.get_games().length).toBe(0);
		const ee = user_retrieve('ee') as User;
		expect(ee.get_games().length).toBe(1);
		const ff = user_retrieve('ff') as User;
		expect(ff.get_games().length).toBe(1);

		expect(challenges.get_challenge_id(number_to_string(4))).toBe(null);

		const challenge_file = path.join(db_challenges_dir, id);
		expect(fs.existsSync(challenge_file)).toBe(false);
		expect(challenges.get_max_challenge_id()).toBe(4);
		expect(challenges.num_challenges()).toBe(1);

		const games = ServerGames.get_instance();
		expect(games.get_max_game_id()).toEqual(1);
		const game_file = path.join(db_games_dir, number_to_string(1));
		expect(fs.existsSync(game_file)).toBe(false);
	});

	test('Unset result (3)', () => {
		const challenges = ServerChallenges.get_instance();

		const id = number_to_string(3);

		let c = challenges.get_challenge_id(id) as Challenge;
		challenge_unset_result(c);

		expect(c.get_result_set_by()).toEqual(null);
		expect(c.get_white()).toEqual(null);
		expect(c.get_black()).toEqual(null);
		expect(c.get_result()).toEqual(null);
		expect(c.get_time_control_id()).toEqual(null);
		expect(c.get_time_control_name()).toEqual(null);

		const challenge_file = path.join(db_challenges_dir, id);
		expect(fs.existsSync(challenge_file)).toBe(true);
		expect(challenge_from_json(fs.readFileSync(challenge_file, 'utf8'))).toEqual(c);
		expect(challenges.get_challenge_id(id)).toEqual(c);

		expect(challenges.num_challenges()).toBe(1);
	});

	test('Set result (3)', () => {
		const challenges = ServerChallenges.get_instance();

		const id = number_to_string(3);

		let c = challenges.get_challenge_id(id) as Challenge;
		challenge_set_result(c, 'aa', 'dd', 'aa', 'black_wins', 'Blitz', 'Blitz (5 + 3)');

		expect(c.get_result_set_by()).toEqual('aa');
		expect(c.get_white()).toEqual('dd');
		expect(c.get_black()).toEqual('aa');
		expect(c.get_result()).toEqual('black_wins');
		expect(c.get_time_control_id()).toEqual('Blitz');
		expect(c.get_time_control_name()).toEqual('Blitz (5 + 3)');

		const challenge_file = path.join(db_challenges_dir, id);
		expect(fs.existsSync(challenge_file)).toBe(true);
		expect(challenge_from_json(fs.readFileSync(challenge_file, 'utf8'))).toEqual(c);
		expect(challenges.get_challenge_id(id)).toEqual(c);

		expect(challenges.num_challenges()).toBe(1);
	});
});

describe('Check initialization and communication', () => {
	test('Initialization', () => {
		clear_server();
		server_init_from_data('tests/webpage/', classical_rapid_blitz);

		expect(ServerChallenges.get_instance().get_max_challenge_id()).toEqual(3);
		expect(ServerGames.get_instance().get_max_game_id()).toEqual(1);
	});

	test('Accept result (3)', () => {
		const challenges = ServerChallenges.get_instance();

		const id = number_to_string(3);
		let c = challenges.get_challenge_id(id) as Challenge;
		expect(c.get_white()).toEqual('dd');
		expect(c.get_black()).toEqual('aa');

		challenge_agree_result(c);

		const aa = user_retrieve('aa') as User;
		expect(aa.get_games().length).toBe(1);
		const bb = user_retrieve('bb') as User;
		expect(bb.get_games().length).toBe(0);
		const cc = user_retrieve('cc') as User;
		expect(cc.get_games().length).toBe(0);
		const dd = user_retrieve('dd') as User;
		expect(dd.get_games().length).toBe(1);
		const ee = user_retrieve('ee') as User;
		expect(ee.get_games().length).toBe(1);
		const ff = user_retrieve('ff') as User;
		expect(ff.get_games().length).toBe(1);

		expect(challenges.get_challenge_id(number_to_string(4))).toBe(null);

		const challenge_file = path.join(db_challenges_dir, id);
		expect(fs.existsSync(challenge_file)).toBe(false);
		expect(challenges.get_max_challenge_id()).toBe(0);
		expect(challenges.num_challenges()).toBe(0);

		const games = ServerGames.get_instance();
		expect(games.get_max_game_id()).toEqual(2);
		const game_file = path.join(db_games_dir, number_to_string(1));
		expect(fs.existsSync(game_file)).toBe(false);
	});
});
