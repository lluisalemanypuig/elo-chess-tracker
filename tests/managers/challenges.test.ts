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

import path from 'path';
import fs from 'fs';

import { run_command } from './exec_utils';
import { clear_server } from '../../src-server/managers/clear';
import { server_init_from_data } from '../../src-server/managers/initialization';
import { ADMIN, MEMBER, STUDENT } from '../../src-server/models/user_role';
import { user_add_new } from '../../src-server/managers/users';
import { ChallengesManager } from '../../src-server/managers/challenges_manager';
import { GamesManager } from '../../src-server/managers/games_manager';
import {
	challenge_accept,
	challenge_agree_result,
	challenge_decline,
	challenge_send_new,
	challenge_set_result,
	challenge_set_retrieve,
	challenge_unset_result
} from '../../src-server/managers/challenges';
import { number_to_string } from '../../src-server/utils/misc';
import { Challenge } from '../../src-server/models/challenge';
import { User } from '../../src-server/models/user';
import { challenge_from_json } from '../../src-server/io/challenge';
import { UsersManager } from '../../src-server/managers/users_manager';

const webpage_dir = 'tests/webpage';
const db_dir = path.join(webpage_dir, 'database');
//const db_users_dir = path.join(db_dir, 'users');
const db_challenges_dir = path.join(db_dir, 'challenges');
const db_games_dir = path.join(db_dir, 'games');

const classical_rapid_blitz = {
	environment: {
		ssl_certificate: {
			public_key_file: '',
			private_key_file: '',
			passphrase_file: ''
		},

		favicon: '',
		login_page: {
			title: '',
			icon: ''
		},
		home_page: {
			title: '',
			icon: ''
		}
	},
	server: {
		domain_name: '',
		ports: {
			http: '',
			https: ''
		}
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
	behavior: {
		challenges: {
			higher_rated_player_can_decline_challenge_from_lower_rated_player: false
		}
	},
	permissions: {
		admin: ['challenge_admin', 'challenge_member', 'challenge_teacher', 'challenge_student'],
		teacher: ['challenge_admin', 'challenge_member', 'challenge_teacher', 'challenge_student'],
		member: ['challenge_admin', 'challenge_member', 'challenge_teacher', 'challenge_student'],
		student: ['challenge_admin', 'challenge_member', 'challenge_teacher', 'challenge_student']
	}
};

function user_retrieve(username: string): User | undefined {
	return UsersManager.get_instance().get_user_by_username(username);
}

describe('Check initialization', () => {
	test('In an empty server', async () => {
		await run_command('./tests/initialize_empty.sh');
		clear_server();
		server_init_from_data('tests/webpage/', classical_rapid_blitz);

		const challenges = ChallengesManager.get_instance();
		expect(challenges.num_challenges()).toBe(0);
		expect(challenges.get_max_challenge_id()).toBe(0);
		expect(challenge_set_retrieve()).toEqual([]);
		expect(challenges.get_challenge_by_id(number_to_string(1))).toEqual(undefined);
		expect(challenges.get_challenge_by_id(number_to_string(2))).toEqual(undefined);
		expect(challenges.get_challenge_index_by_id(number_to_string(1))).toEqual(-1);
		expect(challenges.get_challenge_index_by_id(number_to_string(2))).toEqual(-1);
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
		const challenges = ChallengesManager.get_instance();
		expect(challenges.get_max_challenge_id()).toBe(0);

		const c_aa_bb = challenge_send_new('aa', 'bb', 'Classical', 'Classical (90 + 30)', '2025-01-10..20:38:12:000');
		const c_aa_cc = challenge_send_new('aa', 'cc', 'Classical', 'Classical (90 + 30)', '2025-01-10..20:38:13:000');
		const c_aa_dd = challenge_send_new('aa', 'dd', 'Blitz', 'Blitz (5 + 3)', '2025-01-10..20:38:14:000');
		const c_ee_ff = challenge_send_new('ee', 'ff', 'Classical', 'Classical (90 + 30)', '2025-01-10..20:38:15:000');

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
		expect(challenges.get_challenge_by_id(number_to_string(1))).toEqual(c_aa_bb);
		expect(challenges.get_challenge_by_id(number_to_string(2))).toEqual(c_aa_cc);
		expect(challenges.get_challenge_by_id(number_to_string(3))).toEqual(c_aa_dd);
		expect(challenges.get_challenge_by_id(number_to_string(4))).toEqual(c_ee_ff);
		expect(challenges.get_challenge_index_by_id(number_to_string(1))).not.toEqual(-1);
		expect(challenges.get_challenge_index_by_id(number_to_string(2))).not.toEqual(-1);
		expect(challenges.get_challenge_index_by_id(number_to_string(3))).not.toEqual(-1);
		expect(challenges.get_challenge_index_by_id(number_to_string(4))).not.toEqual(-1);
	});

	test('Accept some challenges', () => {
		const challenges = ChallengesManager.get_instance();

		for (let i of [3, 4]) {
			const id = number_to_string(i);

			let c = challenges.get_challenge_by_id(id) as Challenge;
			challenge_accept(c);
			expect(c.get_when_challenge_accepted()).not.toBe(undefined);

			const challenge_file = path.join(db_challenges_dir, id);
			expect(fs.existsSync(challenge_file)).toBe(true);
			expect(challenge_from_json(fs.readFileSync(challenge_file, 'utf8'))).toEqual(c);
			expect(challenges.get_challenge_by_id(id)).toEqual(c);
		}
	});

	test('Decline some challenges', () => {
		const challenges = ChallengesManager.get_instance();

		for (let i of [1, 2]) {
			const id = number_to_string(i);

			let c = challenges.get_challenge_by_id(id) as Challenge;
			challenge_decline(c);
			expect(c.get_when_challenge_accepted()).toBe(undefined);

			const challenge_file = path.join(db_challenges_dir, id);
			expect(fs.existsSync(challenge_file)).toBe(false);
			expect(challenges.get_challenge_by_id(id)).toEqual(undefined);
		}

		expect(challenges.get_max_challenge_id()).toBe(4);
		expect(challenges.num_challenges()).toBe(2);
	});

	test('Set result (3)', () => {
		const challenges = ChallengesManager.get_instance();

		const id = number_to_string(3);

		let c = challenges.get_challenge_by_id(id) as Challenge;
		challenge_set_result(c, 'aa', '2025-01-10..20:32:11:000', 'aa', 'dd', 'white_wins');

		expect(c.get_result_set_by()).toEqual('aa');
		expect(c.get_white()).toEqual('aa');
		expect(c.get_black()).toEqual('dd');
		expect(c.get_result()).toEqual('white_wins');
		expect(c.get_time_control_id()).toEqual('Blitz');
		expect(c.get_time_control_name()).toEqual('Blitz (5 + 3)');

		const challenge_file = path.join(db_challenges_dir, id);
		expect(fs.existsSync(challenge_file)).toBe(true);
		expect(challenge_from_json(fs.readFileSync(challenge_file, 'utf8'))).toEqual(c);
		expect(challenges.get_challenge_by_id(id)).toEqual(c);

		expect(challenges.num_challenges()).toBe(2);
	});

	test('Set result (4)', () => {
		const challenges = ChallengesManager.get_instance();

		const id = number_to_string(4);

		let c = challenges.get_challenge_by_id(id) as Challenge;
		challenge_set_result(c, 'ff', '2025-01-10..20:37:35:000', 'ee', 'ff', 'black_wins');

		expect(c.get_result_set_by()).toEqual('ff');
		expect(c.get_white()).toEqual('ee');
		expect(c.get_black()).toEqual('ff');
		expect(c.get_result()).toEqual('black_wins');
		expect(c.get_time_control_id()).toEqual('Classical');
		expect(c.get_time_control_name()).toEqual('Classical (90 + 30)');

		const challenge_file = path.join(db_challenges_dir, id);
		expect(fs.existsSync(challenge_file)).toBe(true);
		expect(challenge_from_json(fs.readFileSync(challenge_file, 'utf8'))).toEqual(c);
		expect(challenges.get_challenge_by_id(id)).toEqual(c);

		expect(challenges.num_challenges()).toBe(2);
	});

	test('Accept result (4)', () => {
		const challenges = ChallengesManager.get_instance();

		const id = number_to_string(4);
		let c = challenges.get_challenge_by_id(id) as Challenge;
		expect(c.get_white()).toEqual('ee');
		expect(c.get_black()).toEqual('ff');

		challenge_agree_result(c);

		const aa = user_retrieve('aa') as User;
		expect(aa.get_games('Classical').length).toBe(0);
		expect(aa.get_games('Rapid').length).toBe(0);
		expect(aa.get_games('Blitz').length).toBe(0);
		const bb = user_retrieve('bb') as User;
		expect(bb.get_games('Classical').length).toBe(0);
		expect(bb.get_games('Rapid').length).toBe(0);
		expect(bb.get_games('Blitz').length).toBe(0);
		const cc = user_retrieve('cc') as User;
		expect(cc.get_games('Classical').length).toBe(0);
		expect(cc.get_games('Rapid').length).toBe(0);
		expect(cc.get_games('Blitz').length).toBe(0);
		const dd = user_retrieve('dd') as User;
		expect(dd.get_games('Classical').length).toBe(0);
		expect(dd.get_games('Rapid').length).toBe(0);
		expect(dd.get_games('Blitz').length).toBe(0);
		const ee = user_retrieve('ee') as User;
		expect(ee.get_games('Classical').length).toBe(1);
		expect(ee.get_games('Rapid').length).toBe(0);
		expect(ee.get_games('Blitz').length).toBe(0);
		const ff = user_retrieve('ff') as User;
		expect(ff.get_games('Classical').length).toBe(1);
		expect(ff.get_games('Rapid').length).toBe(0);
		expect(ff.get_games('Blitz').length).toBe(0);

		expect(challenges.get_challenge_by_id(number_to_string(4))).toBe(undefined);

		const challenge_file = path.join(db_challenges_dir, id);
		expect(fs.existsSync(challenge_file)).toBe(false);
		expect(challenges.get_max_challenge_id()).toBe(4);
		expect(challenges.num_challenges()).toBe(1);

		const games = GamesManager.get_instance();
		expect(games.get_max_game_id()).toEqual('0000000001');
		const game_file = path.join(db_games_dir, number_to_string(1));
		expect(fs.existsSync(game_file)).toBe(false);
	});

	test('Unset result (3)', () => {
		const challenges = ChallengesManager.get_instance();

		const id = number_to_string(3);

		let c = challenges.get_challenge_by_id(id) as Challenge;
		challenge_unset_result(c);

		expect(c.get_result_set_by()).toEqual(undefined);
		expect(c.get_white()).toEqual(undefined);
		expect(c.get_black()).toEqual(undefined);
		expect(c.get_result()).toEqual(undefined);
		expect(c.get_time_control_id()).toEqual('Blitz');
		expect(c.get_time_control_name()).toEqual('Blitz (5 + 3)');

		const challenge_file = path.join(db_challenges_dir, id);
		expect(fs.existsSync(challenge_file)).toBe(true);
		expect(challenge_from_json(fs.readFileSync(challenge_file, 'utf8'))).toEqual(c);
		expect(challenges.get_challenge_by_id(id)).toEqual(c);

		expect(challenges.num_challenges()).toBe(1);
	});

	test('Set result (3)', () => {
		const challenges = ChallengesManager.get_instance();

		const id = number_to_string(3);

		let c = challenges.get_challenge_by_id(id) as Challenge;
		challenge_set_result(c, 'aa', '2025-01-10..20:38:45:000', 'dd', 'aa', 'black_wins');

		expect(c.get_result_set_by()).toEqual('aa');
		expect(c.get_white()).toEqual('dd');
		expect(c.get_black()).toEqual('aa');
		expect(c.get_result()).toEqual('black_wins');
		expect(c.get_time_control_id()).toEqual('Blitz');
		expect(c.get_time_control_name()).toEqual('Blitz (5 + 3)');

		const challenge_file = path.join(db_challenges_dir, id);
		expect(fs.existsSync(challenge_file)).toBe(true);
		expect(challenge_from_json(fs.readFileSync(challenge_file, 'utf8'))).toEqual(c);
		expect(challenges.get_challenge_by_id(id)).toEqual(c);

		expect(challenges.num_challenges()).toBe(1);
	});
});

describe('Check initialization and communication', () => {
	test('Initialization', () => {
		clear_server();
		server_init_from_data('tests/webpage/', classical_rapid_blitz);

		expect(ChallengesManager.get_instance().get_max_challenge_id()).toEqual(3);
		expect(GamesManager.get_instance().get_max_game_id()).toEqual('0000000001');
	});

	test('Accept result (3)', () => {
		const challenges = ChallengesManager.get_instance();

		const id = number_to_string(3);
		let c = challenges.get_challenge_by_id(id) as Challenge;
		expect(c.get_white()).toEqual('dd');
		expect(c.get_black()).toEqual('aa');

		challenge_agree_result(c);

		const aa = user_retrieve('aa') as User;
		expect(aa.get_games('Classical').length).toBe(0);
		expect(aa.get_games('Rapid').length).toBe(0);
		expect(aa.get_games('Blitz').length).toBe(1);
		const bb = user_retrieve('bb') as User;
		expect(bb.get_games('Classical').length).toBe(0);
		expect(bb.get_games('Rapid').length).toBe(0);
		expect(bb.get_games('Blitz').length).toBe(0);
		const cc = user_retrieve('cc') as User;
		expect(cc.get_games('Classical').length).toBe(0);
		expect(cc.get_games('Rapid').length).toBe(0);
		expect(cc.get_games('Blitz').length).toBe(0);
		const dd = user_retrieve('dd') as User;
		expect(dd.get_games('Classical').length).toBe(0);
		expect(dd.get_games('Rapid').length).toBe(0);
		expect(dd.get_games('Blitz').length).toBe(1);
		const ee = user_retrieve('ee') as User;
		expect(ee.get_games('Classical').length).toBe(1);
		expect(ee.get_games('Rapid').length).toBe(0);
		expect(ee.get_games('Blitz').length).toBe(0);
		const ff = user_retrieve('ff') as User;
		expect(ff.get_games('Classical').length).toBe(1);
		expect(ff.get_games('Rapid').length).toBe(0);
		expect(ff.get_games('Blitz').length).toBe(0);

		expect(challenges.get_challenge_by_id(number_to_string(4))).toBe(undefined);

		const challenge_file = path.join(db_challenges_dir, id);
		expect(fs.existsSync(challenge_file)).toBe(false);
		expect(challenges.get_max_challenge_id()).toBe(0);
		expect(challenges.num_challenges()).toBe(0);

		const games = GamesManager.get_instance();
		expect(games.get_max_game_id()).toEqual('0000000002');
		const game_file = path.join(db_games_dir, number_to_string(1));
		expect(fs.existsSync(game_file)).toBe(false);
	});
});

describe('Fast challenge communication', () => {
	test('New challenge (Blitz) aa -- bb', () => {
		const c_aa_bb = challenge_send_new('aa', 'bb', 'Blitz', 'Blitz (5 + 3)', '2025-01-10..20:38:45:000');
		challenge_accept(c_aa_bb);

		expect(() =>
			challenge_set_result(c_aa_bb, 'ee', '2025-01-10..20:39:15:000', 'aa', 'bb', 'black_wins')
		).toThrow();
		expect(() =>
			challenge_set_result(c_aa_bb, 'aa', '2025-01-10..20:39:16:000', 'dd', 'aa', 'black_wins')
		).toThrow();
		expect(() =>
			challenge_set_result(c_aa_bb, 'aa', '2025-01-10..20:39:17:000', 'aa', 'ee', 'black_wins')
		).toThrow();

		challenge_set_result(c_aa_bb, 'aa', '2025-01-10..20:39:20:000', 'bb', 'aa', 'black_wins');
		challenge_agree_result(c_aa_bb);

		const aa = user_retrieve('aa') as User;
		expect(aa.get_games('Classical').length).toBe(0);
		expect(aa.get_games('Rapid').length).toBe(0);
		expect(aa.get_games('Blitz').length).toBe(1);
		const bb = user_retrieve('bb') as User;
		expect(bb.get_games('Classical').length).toBe(0);
		expect(bb.get_games('Rapid').length).toBe(0);
		expect(bb.get_games('Blitz').length).toBe(1);
		const cc = user_retrieve('cc') as User;
		expect(cc.get_games('Classical').length).toBe(0);
		expect(cc.get_games('Rapid').length).toBe(0);
		expect(cc.get_games('Blitz').length).toBe(0);
		const dd = user_retrieve('dd') as User;
		expect(dd.get_games('Classical').length).toBe(0);
		expect(dd.get_games('Rapid').length).toBe(0);
		expect(dd.get_games('Blitz').length).toBe(1);
		const ee = user_retrieve('ee') as User;
		expect(ee.get_games('Classical').length).toBe(1);
		expect(ee.get_games('Rapid').length).toBe(0);
		expect(ee.get_games('Blitz').length).toBe(0);
		const ff = user_retrieve('ff') as User;
		expect(ff.get_games('Classical').length).toBe(1);
		expect(ff.get_games('Rapid').length).toBe(0);
		expect(ff.get_games('Blitz').length).toBe(0);
	});

	test('New challenge (Classical) cc -- bb', () => {
		const c_bb_cc = challenge_send_new('cc', 'bb', 'Classical', 'Classical (90 + 30)', '2025-01-10..20:40:00:000');
		challenge_accept(c_bb_cc);

		expect(() =>
			challenge_set_result(c_bb_cc, 'aa', '2025-01-10..20:39:30:000', 'bb', 'cc', 'black_wins')
		).toThrow();
		expect(() =>
			challenge_set_result(c_bb_cc, 'bb', '2025-01-10..20:39:31:000', 'aa', 'cc', 'black_wins')
		).toThrow();
		expect(() =>
			challenge_set_result(c_bb_cc, 'bb', '2025-01-10..20:39:32:000', 'bb', 'aa', 'black_wins')
		).toThrow();

		challenge_set_result(c_bb_cc, 'bb', '2025-01-10..20:39:33:000', 'bb', 'cc', 'black_wins');
		challenge_agree_result(c_bb_cc);

		const aa = user_retrieve('aa') as User;
		expect(aa.get_games('Classical').length).toBe(0);
		expect(aa.get_games('Rapid').length).toBe(0);
		expect(aa.get_games('Blitz').length).toBe(1);
		const bb = user_retrieve('bb') as User;
		expect(bb.get_games('Classical').length).toBe(1);
		expect(bb.get_games('Rapid').length).toBe(0);
		expect(bb.get_games('Blitz').length).toBe(1);
		const cc = user_retrieve('cc') as User;
		expect(cc.get_games('Classical').length).toBe(1);
		expect(cc.get_games('Rapid').length).toBe(0);
		expect(cc.get_games('Blitz').length).toBe(0);
		const dd = user_retrieve('dd') as User;
		expect(dd.get_games('Classical').length).toBe(0);
		expect(dd.get_games('Rapid').length).toBe(0);
		expect(dd.get_games('Blitz').length).toBe(1);
		const ee = user_retrieve('ee') as User;
		expect(ee.get_games('Classical').length).toBe(1);
		expect(ee.get_games('Rapid').length).toBe(0);
		expect(ee.get_games('Blitz').length).toBe(0);
		const ff = user_retrieve('ff') as User;
		expect(ff.get_games('Classical').length).toBe(1);
		expect(ff.get_games('Rapid').length).toBe(0);
		expect(ff.get_games('Blitz').length).toBe(0);
	});
});
