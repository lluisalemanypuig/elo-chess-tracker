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

import { run_command } from '@tests/exec-utils';
import { clearServer } from '@server/managers/memory/clear';
import { serverInitFromData } from '@server/managers/memory/initialization';
import { ADMIN, MEMBER, STUDENT } from '@common/models/user-role';
import { userAddNew } from '@server/managers/users';
import { ChallengesManager, numberToChallengeId } from '@server/managers/challenges-manager';
import { GamesManager } from '@server/managers/games-manager';
import {
	challengeAccept,
	challengeAgreeResult,
	challengeDecline,
	challengeSendNew,
	challengeSetResult,
	getChallengesBy,
	challengeDisagreeResult
} from '@server/managers/challenges';
import { Challenge } from '@common/models/challenge';
import { toUserGivenName, User } from '@common/models/user';
import { challengeFromString } from '@common/io/challenge';
import { UsersManager } from '@server/managers/users-manager';
import { Configuration } from '@common/models/configuration/configuration';
import { PlayerPrivateId, toPlayerPrivateId } from '@common/models/player';
import { toTimeControlId, toTimeControlName } from '@common/models/time-control';
import { toDateFull } from '@common/utils/time';

const webpage_dir = 'tests/webpage';
const db_dir = path.join(webpage_dir, 'database');
//const db_users_dir = path.join(db_dir, 'users');
const db_challenges_dir = path.join(db_dir, 'challenges');
const db_games_dir = path.join(db_dir, 'games');

const Classical = toTimeControlId('Classical');
const Classical90p30 = toTimeControlName('Classical (90 + 30)');

const Rapid = toTimeControlId('Rapid');
const Rapid12p5 = toTimeControlName('Rapid (12 + 5)');
const Rapid10p0 = toTimeControlName('Rapid (10 + 0)');

const Blitz = toTimeControlId('Blitz');
const Blitz5p3 = toTimeControlName('Blitz (5 + 3)');

const classical_rapid_blitz: Configuration = {
	environment: {
		sslCertificate: {
			publicKeyFile: '',
			privateKeyFile: '',
			passphraseFile: ''
		},

		favicon: '',
		loginPage: {
			title: '',
			icon: ''
		},
		homePage: {
			title: '',
			icon: ''
		}
	},
	server: {
		domainName: '',
		ports: {
			http: '',
			https: ''
		}
	},
	ratingSystem: 'Elo',
	timeControls: [
		{
			id: Classical,
			name: Classical90p30
		},
		{
			id: Rapid,
			name: Rapid12p5
		},
		{
			id: Rapid,
			name: Rapid10p0
		},
		{
			id: Blitz,
			name: Blitz5p3
		}
	],
	behavior: {
		challenges: {
			higherRatedPlayerCanDeclineChallengeFromLowerRatedPlayer: false
		}
	},
	permissions: {
		admin: ['challenge_admin', 'challenge_member', 'challenge_teacher', 'challenge_student'],
		teacher: ['challenge_admin', 'challenge_member', 'challenge_teacher', 'challenge_student'],
		member: ['challenge_admin', 'challenge_member', 'challenge_teacher', 'challenge_student'],
		student: ['challenge_admin', 'challenge_member', 'challenge_teacher', 'challenge_student']
	}
};

const aa = toPlayerPrivateId('aa');
const bb = toPlayerPrivateId('bb');
const cc = toPlayerPrivateId('cc');
const dd = toPlayerPrivateId('dd');
const ee = toPlayerPrivateId('ee');
const ff = toPlayerPrivateId('ff');

const A = toUserGivenName('A');
const B = toUserGivenName('B');
const C = toUserGivenName('C');
const D = toUserGivenName('D');
const E = toUserGivenName('E');
const F = toUserGivenName('F');

function user_retrieve(username: PlayerPrivateId): User | undefined {
	return UsersManager.getInstance().getUserByUsername(username);
}

describe('Check initialization', () => {
	test('In an empty server', async () => {
		await run_command('./tests/initialize-empty.sh');
		clearServer();
		serverInitFromData('tests/webpage/', classical_rapid_blitz);

		const challenges = ChallengesManager.getInstance();
		expect(challenges.numChallenges()).toBe(0);
		expect(challenges.getMaxChallengeId()).toBe(0);
		expect(getChallengesBy()).toEqual([]);
		expect(challenges.getChallengeById(numberToChallengeId(1))).toEqual(undefined);
		expect(challenges.getChallengeById(numberToChallengeId(2))).toEqual(undefined);
		expect(challenges.getChallengeIndexById(numberToChallengeId(1))).toEqual(-1);
		expect(challenges.getChallengeIndexById(numberToChallengeId(2))).toEqual(-1);
	});
});

describe('Check challenge communication', () => {
	test('Add users', () => {
		userAddNew(aa, A, A, 'pass_a', [ADMIN]);
		userAddNew(bb, B, B, 'pass_b', [MEMBER]);
		userAddNew(cc, C, C, 'pass_c', [MEMBER]);
		userAddNew(dd, D, D, 'pass_d', [STUDENT]);
		userAddNew(ee, E, E, 'pass_e', [STUDENT]);
		userAddNew(ff, F, F, 'pass_f', [STUDENT]);
	});

	test('Sending', () => {
		const challenges = ChallengesManager.getInstance();
		expect(challenges.getMaxChallengeId()).toBe(0);

		const c_aa_bb = challengeSendNew(
			'sample',
			aa,
			bb,
			Classical,
			Classical90p30,
			toDateFull('2025-01-10..20:38:12:000')
		);
		const c_aa_cc = challengeSendNew(
			'sample',
			aa,
			cc,
			Classical,
			Classical90p30,
			toDateFull('2025-01-10..20:38:13:000')
		);
		const c_aa_dd = challengeSendNew('sample', aa, dd, Blitz, Blitz5p3, toDateFull('2025-01-10..20:38:14:000'));
		const c_ee_ff = challengeSendNew(
			'sample',
			ee,
			ff,
			Classical,
			Classical90p30,
			toDateFull('2025-01-10..20:38:15:000')
		);

		const c_aa_bb_id = numberToChallengeId(1);
		const c_aa_cc_id = numberToChallengeId(2);
		const c_aa_dd_id = numberToChallengeId(3);
		const c_ee_ff_id = numberToChallengeId(4);

		expect(c_aa_bb.id).toEqual(c_aa_bb_id);
		expect(c_aa_bb.sentBy).toEqual(aa);
		expect(c_aa_bb.sentTo).toEqual(bb);
		{
			const challenge_file_aa_bb = path.join(db_challenges_dir, c_aa_bb_id);
			expect(fs.existsSync(challenge_file_aa_bb)).toBe(true);
			const c_aa_bb_ = challengeFromString(fs.readFileSync(challenge_file_aa_bb, 'utf8'));
			expect(c_aa_bb).toEqual(c_aa_bb_);
		}

		expect(c_aa_cc.id).toEqual(c_aa_cc_id);
		expect(c_aa_cc.sentBy).toEqual(aa);
		expect(c_aa_cc.sentTo).toEqual(cc);
		{
			const challenge_file_aa_cc = path.join(db_challenges_dir, c_aa_cc_id);
			expect(fs.existsSync(challenge_file_aa_cc)).toBe(true);
			const c_aa_cc_ = challengeFromString(fs.readFileSync(challenge_file_aa_cc, 'utf8'));
			expect(c_aa_cc).toEqual(c_aa_cc_);
		}

		expect(c_aa_dd.id).toEqual(c_aa_dd_id);
		expect(c_aa_dd.sentBy).toEqual(aa);
		expect(c_aa_dd.sentTo).toEqual(dd);
		{
			const challenge_file_aa_dd = path.join(db_challenges_dir, c_aa_dd_id);
			expect(fs.existsSync(challenge_file_aa_dd)).toBe(true);
			const c_aa_dd_ = challengeFromString(fs.readFileSync(challenge_file_aa_dd, 'utf8'));
			expect(c_aa_dd).toEqual(c_aa_dd_);
		}

		expect(c_ee_ff.id).toEqual(c_ee_ff_id);
		expect(c_ee_ff.sentBy).toEqual(ee);
		expect(c_ee_ff.sentTo).toEqual(ff);
		{
			const challenge_file_ee_ff = path.join(db_challenges_dir, c_ee_ff_id);
			expect(fs.existsSync(challenge_file_ee_ff)).toBe(true);
			const c_ee_ff_ = challengeFromString(fs.readFileSync(challenge_file_ee_ff, 'utf8'));
			expect(c_ee_ff).toEqual(c_ee_ff_);
		}

		expect(challenges.numChallenges()).toBe(4);
		expect(challenges.getMaxChallengeId()).toBe(4);
		expect(getChallengesBy().length).toEqual(4);
		expect(challenges.getChallengeById(numberToChallengeId(1))).toEqual(c_aa_bb);
		expect(challenges.getChallengeById(numberToChallengeId(2))).toEqual(c_aa_cc);
		expect(challenges.getChallengeById(numberToChallengeId(3))).toEqual(c_aa_dd);
		expect(challenges.getChallengeById(numberToChallengeId(4))).toEqual(c_ee_ff);
		expect(challenges.getChallengeIndexById(numberToChallengeId(1))).not.toEqual(-1);
		expect(challenges.getChallengeIndexById(numberToChallengeId(2))).not.toEqual(-1);
		expect(challenges.getChallengeIndexById(numberToChallengeId(3))).not.toEqual(-1);
		expect(challenges.getChallengeIndexById(numberToChallengeId(4))).not.toEqual(-1);
	});

	test('Accept some challenges', () => {
		const challenges = ChallengesManager.getInstance();

		for (let i of [
			{ id: 3, accepter: dd, when: toDateFull('2026-08-09..11:10:47:000') },
			{ id: 4, accepter: ff, when: toDateFull('2026-08-09..11:10:47:000') }
		]) {
			const id = numberToChallengeId(i.id);

			let c = challenges.getChallengeById(id) as Challenge;
			challengeAccept(c, { by: i.accepter, when: i.when });
			expect(c.whenChallengeAccepted).not.toBe(undefined);

			const challenge_file = path.join(db_challenges_dir, id);
			expect(fs.existsSync(challenge_file)).toBe(true);
			expect(challengeFromString(fs.readFileSync(challenge_file, 'utf8'))).toEqual(c);
			expect(challenges.getChallengeById(id)).toEqual(c);
		}
	});

	test('Decline some challenges', () => {
		const challenges = ChallengesManager.getInstance();

		for (let i of [
			{ id: 1, decliner: bb },
			{ id: 2, decliner: cc }
		]) {
			const id = numberToChallengeId(i.id);

			let c = challenges.getChallengeById(id) as Challenge;
			challengeDecline(c, { by: i.decliner });
			expect(c.whenChallengeAccepted).toBe(undefined);

			const challenge_file = path.join(db_challenges_dir, id);
			expect(fs.existsSync(challenge_file)).toBe(false);
			expect(challenges.getChallengeById(id)).toEqual(undefined);
		}

		expect(challenges.getMaxChallengeId()).toBe(4);
		expect(challenges.numChallenges()).toBe(2);
	});

	test('Set result (3)', () => {
		const challenges = ChallengesManager.getInstance();

		const id = numberToChallengeId(3);

		let c = challenges.getChallengeById(id) as Challenge;
		challengeSetResult(c, {
			by: aa,
			when: toDateFull('2025-01-10..20:32:11:000'),
			white: aa,
			black: dd,
			result: 'white_wins'
		});

		expect(c.resultSetBy).toEqual(aa);
		expect(c.white).toEqual(aa);
		expect(c.black).toEqual(dd);
		expect(c.result).toEqual('white_wins');
		expect(c.timeControlId).toEqual(Blitz);
		expect(c.timeControlName).toEqual('Blitz (5 + 3)');

		const challenge_file = path.join(db_challenges_dir, id);
		expect(fs.existsSync(challenge_file)).toBe(true);
		expect(challengeFromString(fs.readFileSync(challenge_file, 'utf8'))).toEqual(c);
		expect(challenges.getChallengeById(id)).toEqual(c);

		expect(challenges.numChallenges()).toBe(2);
	});

	test('Set result (4)', () => {
		const challenges = ChallengesManager.getInstance();

		const id = numberToChallengeId(4);

		let c = challenges.getChallengeById(id) as Challenge;
		challengeSetResult(c, {
			by: ff,
			when: toDateFull('2025-01-10..20:37:35:000'),
			white: ee,
			black: ff,
			result: 'black_wins'
		});

		expect(c.resultSetBy).toEqual(ff);
		expect(c.white).toEqual(ee);
		expect(c.black).toEqual(ff);
		expect(c.result).toEqual('black_wins');
		expect(c.timeControlId).toEqual(Classical);
		expect(c.timeControlName).toEqual('Classical (90 + 30)');

		const challenge_file = path.join(db_challenges_dir, id);
		expect(fs.existsSync(challenge_file)).toBe(true);
		expect(challengeFromString(fs.readFileSync(challenge_file, 'utf8'))).toEqual(c);
		expect(challenges.getChallengeById(id)).toEqual(c);

		expect(challenges.numChallenges()).toBe(2);
	});

	test('Agree result (4)', () => {
		const challenges = ChallengesManager.getInstance();

		const id = numberToChallengeId(4);
		let c = challenges.getChallengeById(id) as Challenge;
		expect(c.white).toEqual(ee);
		expect(c.black).toEqual(ff);

		challengeAgreeResult(c, { by: ee, when: toDateFull('2026-08-09..11:23:58:000') });

		const aaUser = user_retrieve(aa) as User;
		expect(aaUser.getGames(Classical).length).toBe(0);
		expect(aaUser.getGames(Rapid).length).toBe(0);
		expect(aaUser.getGames(Blitz).length).toBe(0);
		const bbUser = user_retrieve(bb) as User;
		expect(bbUser.getGames(Classical).length).toBe(0);
		expect(bbUser.getGames(Rapid).length).toBe(0);
		expect(bbUser.getGames(Blitz).length).toBe(0);
		const ccUser = user_retrieve(cc) as User;
		expect(ccUser.getGames(Classical).length).toBe(0);
		expect(ccUser.getGames(Rapid).length).toBe(0);
		expect(ccUser.getGames(Blitz).length).toBe(0);
		const ddUser = user_retrieve(dd) as User;
		expect(ddUser.getGames(Classical).length).toBe(0);
		expect(ddUser.getGames(Rapid).length).toBe(0);
		expect(ddUser.getGames(Blitz).length).toBe(0);
		const eeUser = user_retrieve(ee) as User;
		expect(eeUser.getGames(Classical).length).toBe(1);
		expect(eeUser.getGames(Rapid).length).toBe(0);
		expect(eeUser.getGames(Blitz).length).toBe(0);
		const ffUser = user_retrieve(ff) as User;
		expect(ffUser.getGames(Classical).length).toBe(1);
		expect(ffUser.getGames(Rapid).length).toBe(0);
		expect(ffUser.getGames(Blitz).length).toBe(0);

		expect(challenges.getChallengeById(numberToChallengeId(4))).toBe(undefined);

		const challenge_file = path.join(db_challenges_dir, id);
		expect(fs.existsSync(challenge_file)).toBe(false);
		expect(challenges.getMaxChallengeId()).toBe(4);
		expect(challenges.numChallenges()).toBe(1);

		const games = GamesManager.getInstance();
		expect(games.getMaxGameId()).toEqual('0000000001');
		const game_file = path.join(db_games_dir, numberToChallengeId(1));
		expect(fs.existsSync(game_file)).toBe(false);
	});

	test('Disagree result (3)', () => {
		const challenges = ChallengesManager.getInstance();

		const id = numberToChallengeId(3);

		let c = challenges.getChallengeById(id) as Challenge;
		expect(() => challengeDisagreeResult(c, { by: ee })).toThrow();
		challengeDisagreeResult(c, { by: dd });

		expect(c.resultSetBy).toEqual(undefined);
		expect(c.white).toEqual(undefined);
		expect(c.black).toEqual(undefined);
		expect(c.result).toEqual(undefined);
		expect(c.timeControlId).toEqual(Blitz);
		expect(c.timeControlName).toEqual('Blitz (5 + 3)');

		const challenge_file = path.join(db_challenges_dir, id);
		expect(fs.existsSync(challenge_file)).toBe(true);
		expect(challengeFromString(fs.readFileSync(challenge_file, 'utf8'))).toEqual(c);
		expect(challenges.getChallengeById(id)).toEqual(c);

		expect(challenges.numChallenges()).toBe(1);
	});

	test('Set result (3)', () => {
		const challenges = ChallengesManager.getInstance();

		const id = numberToChallengeId(3);

		let c = challenges.getChallengeById(id) as Challenge;
		challengeSetResult(c, {
			by: aa,
			when: toDateFull('2025-01-10..20:38:45:000'),
			white: dd,
			black: aa,
			result: 'black_wins'
		});

		expect(c.resultSetBy).toEqual(aa);
		expect(c.white).toEqual(dd);
		expect(c.black).toEqual(aa);
		expect(c.result).toEqual('black_wins');
		expect(c.timeControlId).toEqual(Blitz);
		expect(c.timeControlName).toEqual('Blitz (5 + 3)');

		const challenge_file = path.join(db_challenges_dir, id);
		expect(fs.existsSync(challenge_file)).toBe(true);
		expect(challengeFromString(fs.readFileSync(challenge_file, 'utf8'))).toEqual(c);
		expect(challenges.getChallengeById(id)).toEqual(c);

		expect(challenges.numChallenges()).toBe(1);
	});
});

describe('Check initialization and communication', () => {
	test('Initialization', () => {
		clearServer();
		serverInitFromData('tests/webpage/', classical_rapid_blitz);

		expect(ChallengesManager.getInstance().getMaxChallengeId()).toEqual(3);
		expect(GamesManager.getInstance().getMaxGameId()).toEqual('0000000001');
	});

	test('Agree result (3)', () => {
		const challenges = ChallengesManager.getInstance();

		const id = numberToChallengeId(3);
		let c = challenges.getChallengeById(id) as Challenge;
		expect(c.white).toEqual(dd);
		expect(c.black).toEqual(aa);

		challengeAgreeResult(c, { by: dd, when: toDateFull('2026-08-09..11:25:19:000') });

		const aaUser = user_retrieve(aa) as User;
		expect(aaUser.getGames(Classical).length).toBe(0);
		expect(aaUser.getGames(Rapid).length).toBe(0);
		expect(aaUser.getGames(Blitz).length).toBe(1);
		const bbUser = user_retrieve(bb) as User;
		expect(bbUser.getGames(Classical).length).toBe(0);
		expect(bbUser.getGames(Rapid).length).toBe(0);
		expect(bbUser.getGames(Blitz).length).toBe(0);
		const ccUser = user_retrieve(cc) as User;
		expect(ccUser.getGames(Classical).length).toBe(0);
		expect(ccUser.getGames(Rapid).length).toBe(0);
		expect(ccUser.getGames(Blitz).length).toBe(0);
		const ddUser = user_retrieve(dd) as User;
		expect(ddUser.getGames(Classical).length).toBe(0);
		expect(ddUser.getGames(Rapid).length).toBe(0);
		expect(ddUser.getGames(Blitz).length).toBe(1);
		const eeUser = user_retrieve(ee) as User;
		expect(eeUser.getGames(Classical).length).toBe(1);
		expect(eeUser.getGames(Rapid).length).toBe(0);
		expect(eeUser.getGames(Blitz).length).toBe(0);
		const ffUser = user_retrieve(ff) as User;
		expect(ffUser.getGames(Classical).length).toBe(1);
		expect(ffUser.getGames(Rapid).length).toBe(0);
		expect(ffUser.getGames(Blitz).length).toBe(0);

		expect(challenges.getChallengeById(numberToChallengeId(4))).toBe(undefined);

		const challenge_file = path.join(db_challenges_dir, id);
		expect(fs.existsSync(challenge_file)).toBe(false);
		expect(challenges.getMaxChallengeId()).toBe(0);
		expect(challenges.numChallenges()).toBe(0);

		const games = GamesManager.getInstance();
		expect(games.getMaxGameId()).toEqual('0000000002');
		const game_file = path.join(db_games_dir, numberToChallengeId(1));
		expect(fs.existsSync(game_file)).toBe(false);
	});
});

describe('Incorrect challenge communication', () => {
	test('New challenge (Blitz) aa -- bb', () => {
		const c_aa_bb = challengeSendNew('sample', aa, bb, Blitz, Blitz5p3, toDateFull('2025-01-10..20:38:45:000'));

		expect(() => challengeAccept(c_aa_bb, { by: aa, when: toDateFull('2025-01-10..20:38:50:000') })).toThrow();

		challengeAccept(c_aa_bb, { by: bb, when: toDateFull('2025-01-10..20:38:50:000') });

		expect(() =>
			challengeSetResult(c_aa_bb, {
				by: ee,
				when: toDateFull('2025-01-10..20:39:15:000'),
				white: aa,
				black: bb,
				result: 'black_wins'
			})
		).toThrow();
		expect(() =>
			challengeSetResult(c_aa_bb, {
				by: aa,
				when: toDateFull('2025-01-10..20:39:16:000'),
				white: dd,
				black: aa,
				result: 'black_wins'
			})
		).toThrow();
		expect(() =>
			challengeSetResult(c_aa_bb, {
				by: aa,
				when: toDateFull('2025-01-10..20:39:17:000'),
				white: aa,
				black: ee,
				result: 'black_wins'
			})
		).toThrow();

		challengeSetResult(c_aa_bb, {
			by: aa,
			when: toDateFull('2025-01-10..20:39:20:000'),
			white: bb,
			black: aa,
			result: 'black_wins'
		});

		expect(() => challengeAgreeResult(c_aa_bb, { by: aa, when: toDateFull('2025-01-10..20:39:30:000') })).toThrow();

		challengeAgreeResult(c_aa_bb, { by: bb, when: toDateFull('2025-01-10..20:39:30:000') });

		const aaUser = user_retrieve(aa) as User;
		expect(aaUser.getGames(Classical).length).toBe(0);
		expect(aaUser.getGames(Rapid).length).toBe(0);
		expect(aaUser.getGames(Blitz).length).toBe(1);
		const bbUser = user_retrieve(bb) as User;
		expect(bbUser.getGames(Classical).length).toBe(0);
		expect(bbUser.getGames(Rapid).length).toBe(0);
		expect(bbUser.getGames(Blitz).length).toBe(1);
		const ccUser = user_retrieve(cc) as User;
		expect(ccUser.getGames(Classical).length).toBe(0);
		expect(ccUser.getGames(Rapid).length).toBe(0);
		expect(ccUser.getGames(Blitz).length).toBe(0);
		const ddUser = user_retrieve(dd) as User;
		expect(ddUser.getGames(Classical).length).toBe(0);
		expect(ddUser.getGames(Rapid).length).toBe(0);
		expect(ddUser.getGames(Blitz).length).toBe(1);
		const eeUser = user_retrieve(ee) as User;
		expect(eeUser.getGames(Classical).length).toBe(1);
		expect(eeUser.getGames(Rapid).length).toBe(0);
		expect(eeUser.getGames(Blitz).length).toBe(0);
		const ffUser = user_retrieve(ff) as User;
		expect(ffUser.getGames(Classical).length).toBe(1);
		expect(ffUser.getGames(Rapid).length).toBe(0);
		expect(ffUser.getGames(Blitz).length).toBe(0);
	});

	test('New challenge (Classical) cc -- bb', () => {
		const c_bb_cc = challengeSendNew(
			'sample',
			cc,
			bb,
			Classical,
			Classical90p30,
			toDateFull('2025-01-10..20:40:00:000')
		);

		expect(() => challengeAccept(c_bb_cc, { by: cc, when: toDateFull('2025-01-10..20:40:30:000') })).toThrow();
		challengeAccept(c_bb_cc, { by: bb, when: toDateFull('2025-01-10..20:40:30:000') });

		expect(() =>
			challengeSetResult(c_bb_cc, {
				by: aa,
				when: toDateFull('2025-01-10..20:39:30:000'),
				white: bb,
				black: cc,
				result: 'black_wins'
			})
		).toThrow();
		expect(() =>
			challengeSetResult(c_bb_cc, {
				by: bb,
				when: toDateFull('2025-01-10..20:39:31:000'),
				white: aa,
				black: cc,
				result: 'black_wins'
			})
		).toThrow();
		expect(() =>
			challengeSetResult(c_bb_cc, {
				by: bb,
				when: toDateFull('2025-01-10..20:39:32:000'),
				white: bb,
				black: aa,
				result: 'black_wins'
			})
		).toThrow();

		challengeSetResult(c_bb_cc, {
			by: bb,
			when: toDateFull('2025-01-10..20:39:33:000'),
			white: bb,
			black: cc,
			result: 'black_wins'
		});

		expect(() => challengeAgreeResult(c_bb_cc, { by: bb, when: toDateFull('2025-01-10..20:40:30:000') })).toThrow();

		challengeAgreeResult(c_bb_cc, { by: cc, when: toDateFull('2025-01-10..20:40:30:000') });

		const aaUser = user_retrieve(aa) as User;
		expect(aaUser.getGames(Classical).length).toBe(0);
		expect(aaUser.getGames(Rapid).length).toBe(0);
		expect(aaUser.getGames(Blitz).length).toBe(1);
		const bbUser = user_retrieve(bb) as User;
		expect(bbUser.getGames(Classical).length).toBe(1);
		expect(bbUser.getGames(Rapid).length).toBe(0);
		expect(bbUser.getGames(Blitz).length).toBe(1);
		const ccUser = user_retrieve(cc) as User;
		expect(ccUser.getGames(Classical).length).toBe(1);
		expect(ccUser.getGames(Rapid).length).toBe(0);
		expect(ccUser.getGames(Blitz).length).toBe(0);
		const ddUser = user_retrieve(dd) as User;
		expect(ddUser.getGames(Classical).length).toBe(0);
		expect(ddUser.getGames(Rapid).length).toBe(0);
		expect(ddUser.getGames(Blitz).length).toBe(1);
		const eeUser = user_retrieve(ee) as User;
		expect(eeUser.getGames(Classical).length).toBe(1);
		expect(eeUser.getGames(Rapid).length).toBe(0);
		expect(eeUser.getGames(Blitz).length).toBe(0);
		const ffUser = user_retrieve(ff) as User;
		expect(ffUser.getGames(Classical).length).toBe(1);
		expect(ffUser.getGames(Rapid).length).toBe(0);
		expect(ffUser.getGames(Blitz).length).toBe(0);
	});
});
