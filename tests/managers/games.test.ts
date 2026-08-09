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

import fs from 'fs';
import path from 'path';

import { gameAddNew, gameEditResult, gameFindById, recalculateAllRatings } from '@server/managers/games';
import { serverInitFromData } from '@server/managers/memory/initialization';
import { userAddNew } from '@server/managers/users';
import { ADMIN } from '@common/models/user-role';
import { run_command } from '@tests/exec-utils';
import { toPlayerPrivateId } from '@common/models/player';
import { EnvironmentManager } from '@app/server/managers/environment-manager';
import { Game, toGameId } from '@common/models/game';
import { toUserGivenName, User } from '@common/models/user';
import { UsersManager } from '@app/server/managers/users-manager';
import { gameArrayFromString } from '@common/io/game';
import { GamesIterator } from '@app/server/managers/games-iterator';
import { dateFullToMajor, toDateMinor, toDateMajor } from '@common/utils/time';
import { clearServer } from '@server/managers/memory/clear';
import { GraphsManager } from '@app/server/managers/graphs-manager';
import { Graph } from '@common/models/graph/graph';
import { EdgeMetadata } from '@common/models/graph/edge-metadata';
import { graphFromString } from '@common/io/graph/graph';
import { recalculateAllGraphs } from '@server/managers/graphs';
import { Configuration } from '@common/models/configuration/configuration';
import { isNotDefined } from '@common/utils/is-defined';
import { toTimeControlId, toTimeControlName } from '@common/models/time-control';

const Classical = toTimeControlId('Classical');
const Classical90p30 = toTimeControlName('Classical (90 + 30)');

const Rapid = toTimeControlId('Rapid');
const Rapid12p5 = toTimeControlName('Rapid (12 + 5)');
const Rapid10p0 = toTimeControlName('Rapid (10 + 0)');

const Blitz = toTimeControlId('Blitz');
const Blitz5p3 = toTimeControlName('Blitz (5 + 3)');
const Blitz5p0 = toTimeControlName('Blitz (5 + 0)');

const configuration: Configuration = {
	environment: {
		sslCertificate: {
			publicKeyFile: 'sadf',
			privateKeyFile: 'qwer',
			passphraseFile: 'kgj68'
		},
		favicon: 'favicon.png',
		loginPage: {
			title: 'Login title',
			icon: 'login.png'
		},
		homePage: {
			title: 'Home title',
			icon: 'home.png'
		}
	},
	server: {
		domainName: '',
		ports: {
			http: '8080',
			https: '8443'
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
		admin: ['challenge_user', 'challenge_admin', 'challenge_member', 'challenge_teacher', 'challenge_student'],
		teacher: ['challenge_user', 'challenge_admin', 'challenge_member', 'challenge_teacher', 'challenge_student'],
		member: ['challenge_user', 'challenge_admin', 'challenge_member', 'challenge_teacher', 'challenge_student'],
		student: ['challenge_user', 'challenge_admin', 'challenge_member', 'challenge_teacher', 'challenge_student']
	}
};

let aU: User;
let bU: User;
let cU: User;
let dU: User;
let eU: User;
let fU: User;

const a = toPlayerPrivateId('a');
const b = toPlayerPrivateId('b');
const c = toPlayerPrivateId('c');
const d = toPlayerPrivateId('d');
const e = toPlayerPrivateId('e');
const f = toPlayerPrivateId('f');

const A = toUserGivenName('A');
const B = toUserGivenName('B');
const C = toUserGivenName('C');
const D = toUserGivenName('D');
const E = toUserGivenName('E');
const F = toUserGivenName('F');

const aa = toUserGivenName('aa');
const bb = toUserGivenName('bb');
const cc = toUserGivenName('cc');
const dd = toUserGivenName('dd');
const ee = toUserGivenName('ee');
const ff = toUserGivenName('ff');

function u(username: string): User {
	return UsersManager.getInstance().getUserByUsername(toPlayerPrivateId(username)) as User;
}

describe('Server setup', () => {
	test('Fill an empty server', async () => {
		await run_command('./tests/initialize_empty.sh');
		expect(() => serverInitFromData('tests/webpage', configuration)).not.toThrow();

		aU = userAddNew(a, A, aa, 'aaaa', [ADMIN]);
		bU = userAddNew(b, B, bb, 'dddd', [ADMIN]);
		cU = userAddNew(c, C, cc, 'cccc', [ADMIN]);
		dU = userAddNew(d, D, dd, 'dddd', [ADMIN]);
		eU = userAddNew(e, E, ee, 'eeee', [ADMIN]);
		fU = userAddNew(f, F, ff, 'ffff', [ADMIN]);
	});
});

describe('Sequential game creation', () => {
	test('Add "Blitz" games', () => {
		const blitz_dir = EnvironmentManager.getInstance().getDirGamesTimeControl(Blitz);

		gameAddNew(
			'sample',
			u('a'),
			u('b'),
			'white_wins',
			Blitz,
			Blitz5p3,
			toDateMajor('2025-01-19'),
			toDateMinor('17:06:00:000')
		);
		{
			const game_array = gameArrayFromString(fs.readFileSync(path.join(blitz_dir, '2025-01-19'), 'utf8'));
			expect(game_array).not.toBeNull();
			if (isNotDefined(game_array)) {
				return;
			}
			expect(game_array.length).toBe(1);

			expect(game_array[0].id).toBe('0000000001');
			expect(game_array[0].white).toBe('a');
			expect(game_array[0].black).toBe('b');
			expect(game_array[0].result).toBe('white_wins');
			expect(game_array[0].timeControlId).toBe(Blitz);
			expect(game_array[0].timeControlName).toBe(Blitz5p3);
			expect(game_array[0].when).toBe('2025-01-19..17:06:00:000');

			expect(aU.getGames(Blitz).length).toBe(1);
			expect(bU.getGames(Blitz).length).toBe(1);
			expect(cU.getGames(Blitz).length).toBe(0);
			expect(dU.getGames(Blitz).length).toBe(0);
			expect(eU.getGames(Blitz).length).toBe(0);
			expect(fU.getGames(Blitz).length).toBe(0);
			expect(aU.getGames(Classical).length).toBe(0);
			expect(bU.getGames(Classical).length).toBe(0);
			expect(cU.getGames(Classical).length).toBe(0);
			expect(dU.getGames(Classical).length).toBe(0);
			expect(eU.getGames(Classical).length).toBe(0);
			expect(fU.getGames(Classical).length).toBe(0);

			expect(aU.getRating(Blitz).numWonDrawnLost()).toEqual([1, 1, 0, 0]);
			expect(bU.getRating(Blitz).numWonDrawnLost()).toEqual([1, 0, 0, 1]);
			expect(cU.getRating(Blitz).numWonDrawnLost()).toEqual([0, 0, 0, 0]);
			expect(dU.getRating(Blitz).numWonDrawnLost()).toEqual([0, 0, 0, 0]);
			expect(eU.getRating(Blitz).numWonDrawnLost()).toEqual([0, 0, 0, 0]);
			expect(fU.getRating(Blitz).numWonDrawnLost()).toEqual([0, 0, 0, 0]);
			expect(aU.getRating(Classical).numWonDrawnLost()).toEqual([0, 0, 0, 0]);
			expect(bU.getRating(Classical).numWonDrawnLost()).toEqual([0, 0, 0, 0]);
			expect(cU.getRating(Classical).numWonDrawnLost()).toEqual([0, 0, 0, 0]);
			expect(dU.getRating(Classical).numWonDrawnLost()).toEqual([0, 0, 0, 0]);
			expect(eU.getRating(Classical).numWonDrawnLost()).toEqual([0, 0, 0, 0]);
			expect(fU.getRating(Classical).numWonDrawnLost()).toEqual([0, 0, 0, 0]);
		}

		gameAddNew(
			'sample',
			u('c'),
			u('d'),
			'black_wins',
			Blitz,
			Blitz5p3,
			toDateMajor('2025-01-19'),
			toDateMinor('17:06:10:000')
		);
		{
			const game_array = gameArrayFromString(fs.readFileSync(path.join(blitz_dir, '2025-01-19'), 'utf8'));
			expect(game_array).not.toBeNull();
			if (isNotDefined(game_array)) {
				return;
			}
			expect(game_array.length).toBe(2);

			expect(game_array[0].id).toBe('0000000001');
			expect(game_array[0].white).toBe('a');
			expect(game_array[0].black).toBe('b');
			expect(game_array[0].result).toBe('white_wins');
			expect(game_array[0].timeControlId).toBe(Blitz);
			expect(game_array[0].timeControlName).toBe(Blitz5p3);
			expect(game_array[0].when).toBe('2025-01-19..17:06:00:000');

			expect(game_array[1].id).toBe('0000000002');
			expect(game_array[1].white).toBe('c');
			expect(game_array[1].black).toBe('d');
			expect(game_array[1].result).toBe('black_wins');
			expect(game_array[1].timeControlId).toBe(Blitz);
			expect(game_array[1].timeControlName).toBe(Blitz5p3);
			expect(game_array[1].when).toBe('2025-01-19..17:06:10:000');

			expect(aU.getGames(Blitz).length).toBe(1);
			expect(bU.getGames(Blitz).length).toBe(1);
			expect(cU.getGames(Blitz).length).toBe(1);
			expect(dU.getGames(Blitz).length).toBe(1);
			expect(eU.getGames(Blitz).length).toBe(0);
			expect(fU.getGames(Blitz).length).toBe(0);
			expect(aU.getGames(Classical).length).toBe(0);
			expect(bU.getGames(Classical).length).toBe(0);
			expect(cU.getGames(Classical).length).toBe(0);
			expect(dU.getGames(Classical).length).toBe(0);
			expect(eU.getGames(Classical).length).toBe(0);
			expect(fU.getGames(Classical).length).toBe(0);

			expect(aU.getRating(Blitz).numWonDrawnLost()).toEqual([1, 1, 0, 0]);
			expect(bU.getRating(Blitz).numWonDrawnLost()).toEqual([1, 0, 0, 1]);
			expect(cU.getRating(Blitz).numWonDrawnLost()).toEqual([1, 0, 0, 1]);
			expect(dU.getRating(Blitz).numWonDrawnLost()).toEqual([1, 1, 0, 0]);
			expect(eU.getRating(Blitz).numWonDrawnLost()).toEqual([0, 0, 0, 0]);
			expect(fU.getRating(Blitz).numWonDrawnLost()).toEqual([0, 0, 0, 0]);
			expect(aU.getRating(Classical).numWonDrawnLost()).toEqual([0, 0, 0, 0]);
			expect(bU.getRating(Classical).numWonDrawnLost()).toEqual([0, 0, 0, 0]);
			expect(cU.getRating(Classical).numWonDrawnLost()).toEqual([0, 0, 0, 0]);
			expect(dU.getRating(Classical).numWonDrawnLost()).toEqual([0, 0, 0, 0]);
			expect(eU.getRating(Classical).numWonDrawnLost()).toEqual([0, 0, 0, 0]);
			expect(fU.getRating(Classical).numWonDrawnLost()).toEqual([0, 0, 0, 0]);
		}

		gameAddNew(
			'sample',
			u('e'),
			u('f'),
			'draw',
			Blitz,
			Blitz5p3,
			toDateMajor('2025-01-19'),
			toDateMinor('17:06:20:000')
		);
		{
			const game_array = gameArrayFromString(fs.readFileSync(path.join(blitz_dir, '2025-01-19'), 'utf8'));
			expect(game_array).not.toBeNull();
			if (isNotDefined(game_array)) {
				return;
			}
			expect(game_array.length).toBe(3);

			expect(game_array[0].id).toBe('0000000001');
			expect(game_array[0].white).toBe('a');
			expect(game_array[0].black).toBe('b');
			expect(game_array[0].result).toBe('white_wins');
			expect(game_array[0].timeControlId).toBe(Blitz);
			expect(game_array[0].timeControlName).toBe(Blitz5p3);
			expect(game_array[0].when).toBe('2025-01-19..17:06:00:000');

			expect(game_array[1].id).toBe('0000000002');
			expect(game_array[1].white).toBe('c');
			expect(game_array[1].black).toBe('d');
			expect(game_array[1].result).toBe('black_wins');
			expect(game_array[1].timeControlId).toBe(Blitz);
			expect(game_array[1].timeControlName).toBe(Blitz5p3);
			expect(game_array[1].when).toBe('2025-01-19..17:06:10:000');

			expect(game_array[2].id).toBe('0000000003');
			expect(game_array[2].white).toBe('e');
			expect(game_array[2].black).toBe('f');
			expect(game_array[2].result).toBe('draw');
			expect(game_array[2].timeControlId).toBe(Blitz);
			expect(game_array[2].timeControlName).toBe(Blitz5p3);
			expect(game_array[2].when).toBe('2025-01-19..17:06:20:000');

			expect(aU.getGames(Blitz).length).toBe(1);
			expect(bU.getGames(Blitz).length).toBe(1);
			expect(cU.getGames(Blitz).length).toBe(1);
			expect(dU.getGames(Blitz).length).toBe(1);
			expect(eU.getGames(Blitz).length).toBe(1);
			expect(fU.getGames(Blitz).length).toBe(1);
			expect(aU.getGames(Classical).length).toBe(0);
			expect(bU.getGames(Classical).length).toBe(0);
			expect(cU.getGames(Classical).length).toBe(0);
			expect(dU.getGames(Classical).length).toBe(0);
			expect(eU.getGames(Classical).length).toBe(0);
			expect(fU.getGames(Classical).length).toBe(0);

			expect(aU.getRating(Blitz).numWonDrawnLost()).toEqual([1, 1, 0, 0]);
			expect(bU.getRating(Blitz).numWonDrawnLost()).toEqual([1, 0, 0, 1]);
			expect(cU.getRating(Blitz).numWonDrawnLost()).toEqual([1, 0, 0, 1]);
			expect(dU.getRating(Blitz).numWonDrawnLost()).toEqual([1, 1, 0, 0]);
			expect(eU.getRating(Blitz).numWonDrawnLost()).toEqual([1, 0, 1, 0]);
			expect(fU.getRating(Blitz).numWonDrawnLost()).toEqual([1, 0, 1, 0]);
			expect(aU.getRating(Classical).numWonDrawnLost()).toEqual([0, 0, 0, 0]);
			expect(bU.getRating(Classical).numWonDrawnLost()).toEqual([0, 0, 0, 0]);
			expect(cU.getRating(Classical).numWonDrawnLost()).toEqual([0, 0, 0, 0]);
			expect(dU.getRating(Classical).numWonDrawnLost()).toEqual([0, 0, 0, 0]);
			expect(eU.getRating(Classical).numWonDrawnLost()).toEqual([0, 0, 0, 0]);
			expect(fU.getRating(Classical).numWonDrawnLost()).toEqual([0, 0, 0, 0]);
		}

		gameAddNew(
			'sample',
			u('a'),
			u('f'),
			'black_wins',
			Blitz,
			Blitz5p3,
			toDateMajor('2025-01-19'),
			toDateMinor('17:06:30:000')
		);
		{
			const game_array = gameArrayFromString(fs.readFileSync(path.join(blitz_dir, '2025-01-19'), 'utf8'));
			expect(game_array).not.toBeNull();
			if (isNotDefined(game_array)) {
				return;
			}
			expect(game_array.length).toBe(4);

			expect(game_array[0].id).toBe('0000000001');
			expect(game_array[0].white).toBe('a');
			expect(game_array[0].black).toBe('b');
			expect(game_array[0].result).toBe('white_wins');
			expect(game_array[0].timeControlId).toBe(Blitz);
			expect(game_array[0].timeControlName).toBe(Blitz5p3);
			expect(game_array[0].when).toBe('2025-01-19..17:06:00:000');

			expect(game_array[1].id).toBe('0000000002');
			expect(game_array[1].white).toBe('c');
			expect(game_array[1].black).toBe('d');
			expect(game_array[1].result).toBe('black_wins');
			expect(game_array[1].timeControlId).toBe(Blitz);
			expect(game_array[1].timeControlName).toBe(Blitz5p3);
			expect(game_array[1].when).toBe('2025-01-19..17:06:10:000');

			expect(game_array[2].id).toBe('0000000003');
			expect(game_array[2].white).toBe('e');
			expect(game_array[2].black).toBe('f');
			expect(game_array[2].result).toBe('draw');
			expect(game_array[2].timeControlId).toBe(Blitz);
			expect(game_array[2].timeControlName).toBe(Blitz5p3);
			expect(game_array[2].when).toBe('2025-01-19..17:06:20:000');

			expect(game_array[3].id).toBe('0000000004');
			expect(game_array[3].white).toBe('a');
			expect(game_array[3].black).toBe('f');
			expect(game_array[3].result).toBe('black_wins');
			expect(game_array[3].timeControlId).toBe(Blitz);
			expect(game_array[3].timeControlName).toBe(Blitz5p3);
			expect(game_array[3].when).toBe('2025-01-19..17:06:30:000');

			expect(aU.getGames(Blitz).length).toBe(1);
			expect(bU.getGames(Blitz).length).toBe(1);
			expect(cU.getGames(Blitz).length).toBe(1);
			expect(dU.getGames(Blitz).length).toBe(1);
			expect(eU.getGames(Blitz).length).toBe(1);
			expect(fU.getGames(Blitz).length).toBe(1);
			expect(aU.getGames(Classical).length).toBe(0);
			expect(bU.getGames(Classical).length).toBe(0);
			expect(cU.getGames(Classical).length).toBe(0);
			expect(dU.getGames(Classical).length).toBe(0);
			expect(eU.getGames(Classical).length).toBe(0);
			expect(fU.getGames(Classical).length).toBe(0);

			expect(aU.getRating(Blitz).numWonDrawnLost()).toEqual([2, 1, 0, 1]);
			expect(bU.getRating(Blitz).numWonDrawnLost()).toEqual([1, 0, 0, 1]);
			expect(cU.getRating(Blitz).numWonDrawnLost()).toEqual([1, 0, 0, 1]);
			expect(dU.getRating(Blitz).numWonDrawnLost()).toEqual([1, 1, 0, 0]);
			expect(eU.getRating(Blitz).numWonDrawnLost()).toEqual([1, 0, 1, 0]);
			expect(fU.getRating(Blitz).numWonDrawnLost()).toEqual([2, 1, 1, 0]);
			expect(aU.getRating(Classical).numWonDrawnLost()).toEqual([0, 0, 0, 0]);
			expect(bU.getRating(Classical).numWonDrawnLost()).toEqual([0, 0, 0, 0]);
			expect(cU.getRating(Classical).numWonDrawnLost()).toEqual([0, 0, 0, 0]);
			expect(dU.getRating(Classical).numWonDrawnLost()).toEqual([0, 0, 0, 0]);
			expect(eU.getRating(Classical).numWonDrawnLost()).toEqual([0, 0, 0, 0]);
			expect(fU.getRating(Classical).numWonDrawnLost()).toEqual([0, 0, 0, 0]);
		}
	});

	test('Add "Classical" games', () => {
		const classical_dir = EnvironmentManager.getInstance().getDirGamesTimeControl(Classical);

		gameAddNew(
			'sample',
			u('a'),
			u('b'),
			'white_wins',
			Classical,
			Classical90p30,
			toDateMajor('2025-01-09'),
			toDateMinor('17:06:00:000')
		);
		{
			const game_array = gameArrayFromString(fs.readFileSync(path.join(classical_dir, '2025-01-09'), 'utf8'));
			expect(game_array).not.toBeNull();
			if (isNotDefined(game_array)) {
				return;
			}
			expect(game_array.length).toBe(1);

			expect(game_array[0].id).toBe('0000000005');
			expect(game_array[0].white).toBe('a');
			expect(game_array[0].black).toBe('b');
			expect(game_array[0].result).toBe('white_wins');
			expect(game_array[0].timeControlId).toBe(Classical);
			expect(game_array[0].timeControlName).toBe(Classical90p30);
			expect(game_array[0].when).toBe('2025-01-09..17:06:00:000');

			expect(aU.getGames(Blitz).length).toBe(1);
			expect(bU.getGames(Blitz).length).toBe(1);
			expect(cU.getGames(Blitz).length).toBe(1);
			expect(dU.getGames(Blitz).length).toBe(1);
			expect(eU.getGames(Blitz).length).toBe(1);
			expect(fU.getGames(Blitz).length).toBe(1);
			expect(aU.getGames(Classical).length).toBe(1);
			expect(bU.getGames(Classical).length).toBe(1);
			expect(cU.getGames(Classical).length).toBe(0);
			expect(dU.getGames(Classical).length).toBe(0);
			expect(eU.getGames(Classical).length).toBe(0);
			expect(fU.getGames(Classical).length).toBe(0);

			expect(aU.getRating(Blitz).numWonDrawnLost()).toEqual([2, 1, 0, 1]);
			expect(bU.getRating(Blitz).numWonDrawnLost()).toEqual([1, 0, 0, 1]);
			expect(cU.getRating(Blitz).numWonDrawnLost()).toEqual([1, 0, 0, 1]);
			expect(dU.getRating(Blitz).numWonDrawnLost()).toEqual([1, 1, 0, 0]);
			expect(eU.getRating(Blitz).numWonDrawnLost()).toEqual([1, 0, 1, 0]);
			expect(fU.getRating(Blitz).numWonDrawnLost()).toEqual([2, 1, 1, 0]);
			expect(aU.getRating(Classical).numWonDrawnLost()).toEqual([1, 1, 0, 0]);
			expect(bU.getRating(Classical).numWonDrawnLost()).toEqual([1, 0, 0, 1]);
			expect(cU.getRating(Classical).numWonDrawnLost()).toEqual([0, 0, 0, 0]);
			expect(dU.getRating(Classical).numWonDrawnLost()).toEqual([0, 0, 0, 0]);
			expect(eU.getRating(Classical).numWonDrawnLost()).toEqual([0, 0, 0, 0]);
			expect(fU.getRating(Classical).numWonDrawnLost()).toEqual([0, 0, 0, 0]);
		}

		gameAddNew(
			'sample',
			u('c'),
			u('d'),
			'black_wins',
			Classical,
			Classical90p30,
			toDateMajor('2025-01-09'),
			toDateMinor('17:06:10:000')
		);
		{
			const game_array = gameArrayFromString(fs.readFileSync(path.join(classical_dir, '2025-01-09'), 'utf8'));
			expect(game_array).not.toBeNull();
			if (isNotDefined(game_array)) {
				return;
			}
			expect(game_array.length).toBe(2);

			expect(game_array[0].id).toBe('0000000005');
			expect(game_array[0].white).toBe('a');
			expect(game_array[0].black).toBe('b');
			expect(game_array[0].result).toBe('white_wins');
			expect(game_array[0].timeControlId).toBe(Classical);
			expect(game_array[0].timeControlName).toBe(Classical90p30);
			expect(game_array[0].when).toBe('2025-01-09..17:06:00:000');

			expect(game_array[1].id).toBe('0000000006');
			expect(game_array[1].white).toBe('c');
			expect(game_array[1].black).toBe('d');
			expect(game_array[1].result).toBe('black_wins');
			expect(game_array[1].timeControlId).toBe(Classical);
			expect(game_array[1].timeControlName).toBe(Classical90p30);
			expect(game_array[1].when).toBe('2025-01-09..17:06:10:000');

			expect(aU.getGames(Blitz).length).toBe(1);
			expect(bU.getGames(Blitz).length).toBe(1);
			expect(cU.getGames(Blitz).length).toBe(1);
			expect(dU.getGames(Blitz).length).toBe(1);
			expect(eU.getGames(Blitz).length).toBe(1);
			expect(fU.getGames(Blitz).length).toBe(1);
			expect(aU.getGames(Classical).length).toBe(1);
			expect(bU.getGames(Classical).length).toBe(1);
			expect(cU.getGames(Classical).length).toBe(1);
			expect(dU.getGames(Classical).length).toBe(1);
			expect(eU.getGames(Classical).length).toBe(0);
			expect(fU.getGames(Classical).length).toBe(0);

			expect(aU.getRating(Blitz).numWonDrawnLost()).toEqual([2, 1, 0, 1]);
			expect(bU.getRating(Blitz).numWonDrawnLost()).toEqual([1, 0, 0, 1]);
			expect(cU.getRating(Blitz).numWonDrawnLost()).toEqual([1, 0, 0, 1]);
			expect(dU.getRating(Blitz).numWonDrawnLost()).toEqual([1, 1, 0, 0]);
			expect(eU.getRating(Blitz).numWonDrawnLost()).toEqual([1, 0, 1, 0]);
			expect(fU.getRating(Blitz).numWonDrawnLost()).toEqual([2, 1, 1, 0]);
			expect(aU.getRating(Classical).numWonDrawnLost()).toEqual([1, 1, 0, 0]);
			expect(bU.getRating(Classical).numWonDrawnLost()).toEqual([1, 0, 0, 1]);
			expect(cU.getRating(Classical).numWonDrawnLost()).toEqual([1, 0, 0, 1]);
			expect(dU.getRating(Classical).numWonDrawnLost()).toEqual([1, 1, 0, 0]);
			expect(eU.getRating(Classical).numWonDrawnLost()).toEqual([0, 0, 0, 0]);
			expect(fU.getRating(Classical).numWonDrawnLost()).toEqual([0, 0, 0, 0]);
		}

		gameAddNew(
			'sample',
			u('e'),
			u('f'),
			'draw',
			Classical,
			Classical90p30,
			toDateMajor('2025-01-09'),
			toDateMinor('17:06:20:000')
		);
		{
			const game_array = gameArrayFromString(fs.readFileSync(path.join(classical_dir, '2025-01-09'), 'utf8'));
			expect(game_array).not.toBeNull();
			if (isNotDefined(game_array)) {
				return;
			}
			expect(game_array.length).toBe(3);

			expect(game_array[0].id).toBe('0000000005');
			expect(game_array[0].white).toBe('a');
			expect(game_array[0].black).toBe('b');
			expect(game_array[0].result).toBe('white_wins');
			expect(game_array[0].timeControlId).toBe(Classical);
			expect(game_array[0].timeControlName).toBe(Classical90p30);
			expect(game_array[0].when).toBe('2025-01-09..17:06:00:000');

			expect(game_array[1].id).toBe('0000000006');
			expect(game_array[1].white).toBe('c');
			expect(game_array[1].black).toBe('d');
			expect(game_array[1].result).toBe('black_wins');
			expect(game_array[1].timeControlId).toBe(Classical);
			expect(game_array[1].timeControlName).toBe(Classical90p30);
			expect(game_array[1].when).toBe('2025-01-09..17:06:10:000');

			expect(game_array[2].id).toBe('0000000007');
			expect(game_array[2].white).toBe('e');
			expect(game_array[2].black).toBe('f');
			expect(game_array[2].result).toBe('draw');
			expect(game_array[2].timeControlId).toBe(Classical);
			expect(game_array[2].timeControlName).toBe(Classical90p30);
			expect(game_array[2].when).toBe('2025-01-09..17:06:20:000');

			expect(aU.getGames(Blitz).length).toBe(1);
			expect(bU.getGames(Blitz).length).toBe(1);
			expect(cU.getGames(Blitz).length).toBe(1);
			expect(dU.getGames(Blitz).length).toBe(1);
			expect(eU.getGames(Blitz).length).toBe(1);
			expect(fU.getGames(Blitz).length).toBe(1);
			expect(aU.getGames(Classical).length).toBe(1);
			expect(bU.getGames(Classical).length).toBe(1);
			expect(cU.getGames(Classical).length).toBe(1);
			expect(dU.getGames(Classical).length).toBe(1);
			expect(eU.getGames(Classical).length).toBe(1);
			expect(fU.getGames(Classical).length).toBe(1);

			expect(aU.getRating(Blitz).numWonDrawnLost()).toEqual([2, 1, 0, 1]);
			expect(bU.getRating(Blitz).numWonDrawnLost()).toEqual([1, 0, 0, 1]);
			expect(cU.getRating(Blitz).numWonDrawnLost()).toEqual([1, 0, 0, 1]);
			expect(dU.getRating(Blitz).numWonDrawnLost()).toEqual([1, 1, 0, 0]);
			expect(eU.getRating(Blitz).numWonDrawnLost()).toEqual([1, 0, 1, 0]);
			expect(fU.getRating(Blitz).numWonDrawnLost()).toEqual([2, 1, 1, 0]);
			expect(aU.getRating(Classical).numWonDrawnLost()).toEqual([1, 1, 0, 0]);
			expect(bU.getRating(Classical).numWonDrawnLost()).toEqual([1, 0, 0, 1]);
			expect(cU.getRating(Classical).numWonDrawnLost()).toEqual([1, 0, 0, 1]);
			expect(dU.getRating(Classical).numWonDrawnLost()).toEqual([1, 1, 0, 0]);
			expect(eU.getRating(Classical).numWonDrawnLost()).toEqual([1, 0, 1, 0]);
			expect(fU.getRating(Classical).numWonDrawnLost()).toEqual([1, 0, 1, 0]);
		}

		gameAddNew(
			'sample',
			u('a'),
			u('f'),
			'black_wins',
			Classical,
			Classical90p30,
			toDateMajor('2025-01-09'),
			toDateMinor('17:06:30:000')
		);
		{
			const game_array = gameArrayFromString(fs.readFileSync(path.join(classical_dir, '2025-01-09'), 'utf8'));
			expect(game_array).not.toBeNull();
			if (isNotDefined(game_array)) {
				return;
			}
			expect(game_array.length).toBe(4);

			expect(game_array[0].id).toBe('0000000005');
			expect(game_array[0].white).toBe('a');
			expect(game_array[0].black).toBe('b');
			expect(game_array[0].result).toBe('white_wins');
			expect(game_array[0].timeControlId).toBe(Classical);
			expect(game_array[0].timeControlName).toBe(Classical90p30);
			expect(game_array[0].when).toBe('2025-01-09..17:06:00:000');

			expect(game_array[1].id).toBe('0000000006');
			expect(game_array[1].white).toBe('c');
			expect(game_array[1].black).toBe('d');
			expect(game_array[1].result).toBe('black_wins');
			expect(game_array[1].timeControlId).toBe(Classical);
			expect(game_array[1].timeControlName).toBe(Classical90p30);
			expect(game_array[1].when).toBe('2025-01-09..17:06:10:000');

			expect(game_array[2].id).toBe('0000000007');
			expect(game_array[2].white).toBe('e');
			expect(game_array[2].black).toBe('f');
			expect(game_array[2].result).toBe('draw');
			expect(game_array[2].timeControlId).toBe(Classical);
			expect(game_array[2].timeControlName).toBe(Classical90p30);
			expect(game_array[2].when).toBe('2025-01-09..17:06:20:000');

			expect(game_array[3].id).toBe('0000000008');
			expect(game_array[3].white).toBe('a');
			expect(game_array[3].black).toBe('f');
			expect(game_array[3].result).toBe('black_wins');
			expect(game_array[3].timeControlId).toBe(Classical);
			expect(game_array[3].timeControlName).toBe(Classical90p30);
			expect(game_array[3].when).toBe('2025-01-09..17:06:30:000');

			expect(aU.getGames(Blitz).length).toBe(1);
			expect(bU.getGames(Blitz).length).toBe(1);
			expect(cU.getGames(Blitz).length).toBe(1);
			expect(dU.getGames(Blitz).length).toBe(1);
			expect(eU.getGames(Blitz).length).toBe(1);
			expect(fU.getGames(Blitz).length).toBe(1);
			expect(aU.getGames(Classical).length).toBe(1);
			expect(bU.getGames(Classical).length).toBe(1);
			expect(cU.getGames(Classical).length).toBe(1);
			expect(dU.getGames(Classical).length).toBe(1);
			expect(eU.getGames(Classical).length).toBe(1);
			expect(fU.getGames(Classical).length).toBe(1);

			expect(aU.getRating(Blitz).numWonDrawnLost()).toEqual([2, 1, 0, 1]);
			expect(bU.getRating(Blitz).numWonDrawnLost()).toEqual([1, 0, 0, 1]);
			expect(cU.getRating(Blitz).numWonDrawnLost()).toEqual([1, 0, 0, 1]);
			expect(dU.getRating(Blitz).numWonDrawnLost()).toEqual([1, 1, 0, 0]);
			expect(eU.getRating(Blitz).numWonDrawnLost()).toEqual([1, 0, 1, 0]);
			expect(fU.getRating(Blitz).numWonDrawnLost()).toEqual([2, 1, 1, 0]);
			expect(aU.getRating(Classical).numWonDrawnLost()).toEqual([2, 1, 0, 1]);
			expect(bU.getRating(Classical).numWonDrawnLost()).toEqual([1, 0, 0, 1]);
			expect(cU.getRating(Classical).numWonDrawnLost()).toEqual([1, 0, 0, 1]);
			expect(dU.getRating(Classical).numWonDrawnLost()).toEqual([1, 1, 0, 0]);
			expect(eU.getRating(Classical).numWonDrawnLost()).toEqual([1, 0, 1, 0]);
			expect(fU.getRating(Classical).numWonDrawnLost()).toEqual([2, 1, 1, 0]);
		}
	});
});

describe('Inverse game creation', () => {
	test('Add "Blitz" games', () => {
		const blitz_dir = EnvironmentManager.getInstance().getDirGamesTimeControl(Blitz);

		gameAddNew(
			'sample',
			u('a'),
			u('f'),
			'draw',
			Blitz,
			Blitz5p0,
			toDateMajor('2025-01-20'),
			toDateMinor('17:06:30:000')
		);
		{
			const game_array = gameArrayFromString(fs.readFileSync(path.join(blitz_dir, '2025-01-20'), 'utf8'));
			expect(game_array).not.toBeNull();
			if (isNotDefined(game_array)) {
				return;
			}
			expect(game_array.length).toBe(1);

			expect(game_array[0].id).toBe('0000000009');
			expect(game_array[0].white).toBe('a');
			expect(game_array[0].black).toBe('f');
			expect(game_array[0].result).toBe('draw');
			expect(game_array[0].timeControlId).toBe(Blitz);
			expect(game_array[0].timeControlName).toBe(Blitz5p0);
			expect(game_array[0].when).toBe('2025-01-20..17:06:30:000');

			expect(aU.getGames(Blitz).length).toBe(2);
			expect(bU.getGames(Blitz).length).toBe(1);
			expect(cU.getGames(Blitz).length).toBe(1);
			expect(dU.getGames(Blitz).length).toBe(1);
			expect(eU.getGames(Blitz).length).toBe(1);
			expect(fU.getGames(Blitz).length).toBe(2);
			expect(aU.getGames(Classical).length).toBe(1);
			expect(bU.getGames(Classical).length).toBe(1);
			expect(cU.getGames(Classical).length).toBe(1);
			expect(dU.getGames(Classical).length).toBe(1);
			expect(eU.getGames(Classical).length).toBe(1);
			expect(fU.getGames(Classical).length).toBe(1);

			expect(aU.getRating(Blitz).numWonDrawnLost()).toEqual([3, 1, 1, 1]);
			expect(bU.getRating(Blitz).numWonDrawnLost()).toEqual([1, 0, 0, 1]);
			expect(cU.getRating(Blitz).numWonDrawnLost()).toEqual([1, 0, 0, 1]);
			expect(dU.getRating(Blitz).numWonDrawnLost()).toEqual([1, 1, 0, 0]);
			expect(eU.getRating(Blitz).numWonDrawnLost()).toEqual([1, 0, 1, 0]);
			expect(fU.getRating(Blitz).numWonDrawnLost()).toEqual([3, 1, 2, 0]);
			expect(aU.getRating(Classical).numWonDrawnLost()).toEqual([2, 1, 0, 1]);
			expect(bU.getRating(Classical).numWonDrawnLost()).toEqual([1, 0, 0, 1]);
			expect(cU.getRating(Classical).numWonDrawnLost()).toEqual([1, 0, 0, 1]);
			expect(dU.getRating(Classical).numWonDrawnLost()).toEqual([1, 1, 0, 0]);
			expect(eU.getRating(Classical).numWonDrawnLost()).toEqual([1, 0, 1, 0]);
			expect(fU.getRating(Classical).numWonDrawnLost()).toEqual([2, 1, 1, 0]);
		}

		gameAddNew(
			'sample',
			u('e'),
			u('f'),
			'draw',
			Blitz,
			Blitz5p0,
			toDateMajor('2025-01-20'),
			toDateMinor('17:06:20:000')
		);
		{
			const game_array = gameArrayFromString(fs.readFileSync(path.join(blitz_dir, '2025-01-20'), 'utf8'));
			expect(game_array).not.toBeNull();
			if (isNotDefined(game_array)) {
				return;
			}
			expect(game_array.length).toBe(2);

			expect(game_array[0].id).toBe('0000000010');
			expect(game_array[0].white).toBe('e');
			expect(game_array[0].black).toBe('f');
			expect(game_array[0].result).toBe('draw');
			expect(game_array[0].timeControlId).toBe(Blitz);
			expect(game_array[0].timeControlName).toBe(Blitz5p0);
			expect(game_array[0].when).toBe('2025-01-20..17:06:20:000');

			expect(game_array[1].id).toBe('0000000009');
			expect(game_array[1].white).toBe('a');
			expect(game_array[1].black).toBe('f');
			expect(game_array[1].result).toBe('draw');
			expect(game_array[1].timeControlId).toBe(Blitz);
			expect(game_array[1].timeControlName).toBe(Blitz5p0);
			expect(game_array[1].when).toBe('2025-01-20..17:06:30:000');

			expect(aU.getGames(Blitz).length).toBe(2);
			expect(bU.getGames(Blitz).length).toBe(1);
			expect(cU.getGames(Blitz).length).toBe(1);
			expect(dU.getGames(Blitz).length).toBe(1);
			expect(eU.getGames(Blitz).length).toBe(2);
			expect(fU.getGames(Blitz).length).toBe(2);
			expect(aU.getGames(Classical).length).toBe(1);
			expect(bU.getGames(Classical).length).toBe(1);
			expect(cU.getGames(Classical).length).toBe(1);
			expect(dU.getGames(Classical).length).toBe(1);
			expect(eU.getGames(Classical).length).toBe(1);
			expect(fU.getGames(Classical).length).toBe(1);

			expect(aU.getRating(Blitz).numWonDrawnLost()).toEqual([3, 1, 1, 1]);
			expect(bU.getRating(Blitz).numWonDrawnLost()).toEqual([1, 0, 0, 1]);
			expect(cU.getRating(Blitz).numWonDrawnLost()).toEqual([1, 0, 0, 1]);
			expect(dU.getRating(Blitz).numWonDrawnLost()).toEqual([1, 1, 0, 0]);
			expect(eU.getRating(Blitz).numWonDrawnLost()).toEqual([2, 0, 2, 0]);
			expect(fU.getRating(Blitz).numWonDrawnLost()).toEqual([4, 1, 3, 0]);
			expect(aU.getRating(Classical).numWonDrawnLost()).toEqual([2, 1, 0, 1]);
			expect(bU.getRating(Classical).numWonDrawnLost()).toEqual([1, 0, 0, 1]);
			expect(cU.getRating(Classical).numWonDrawnLost()).toEqual([1, 0, 0, 1]);
			expect(dU.getRating(Classical).numWonDrawnLost()).toEqual([1, 1, 0, 0]);
			expect(eU.getRating(Classical).numWonDrawnLost()).toEqual([1, 0, 1, 0]);
			expect(fU.getRating(Classical).numWonDrawnLost()).toEqual([2, 1, 1, 0]);
		}

		gameAddNew(
			'sample',
			u('c'),
			u('d'),
			'black_wins',
			Blitz,
			Blitz5p3,
			toDateMajor('2025-01-20'),
			toDateMinor('17:06:10:000')
		);
		{
			const game_array = gameArrayFromString(fs.readFileSync(path.join(blitz_dir, '2025-01-20'), 'utf8'));
			expect(game_array).not.toBeNull();
			if (isNotDefined(game_array)) {
				return;
			}
			expect(game_array.length).toBe(3);

			expect(game_array[0].id).toBe('0000000011');
			expect(game_array[0].white).toBe('c');
			expect(game_array[0].black).toBe('d');
			expect(game_array[0].result).toBe('black_wins');
			expect(game_array[0].timeControlId).toBe(Blitz);
			expect(game_array[0].timeControlName).toBe(Blitz5p3);
			expect(game_array[0].when).toBe('2025-01-20..17:06:10:000');

			expect(game_array[1].id).toBe('0000000010');
			expect(game_array[1].white).toBe('e');
			expect(game_array[1].black).toBe('f');
			expect(game_array[1].result).toBe('draw');
			expect(game_array[1].timeControlId).toBe(Blitz);
			expect(game_array[1].timeControlName).toBe(Blitz5p0);
			expect(game_array[1].when).toBe('2025-01-20..17:06:20:000');

			expect(game_array[2].id).toBe('0000000009');
			expect(game_array[2].white).toBe('a');
			expect(game_array[2].black).toBe('f');
			expect(game_array[2].result).toBe('draw');
			expect(game_array[2].timeControlId).toBe(Blitz);
			expect(game_array[2].timeControlName).toBe(Blitz5p0);
			expect(game_array[2].when).toBe('2025-01-20..17:06:30:000');

			expect(aU.getGames(Blitz).length).toBe(2);
			expect(bU.getGames(Blitz).length).toBe(1);
			expect(cU.getGames(Blitz).length).toBe(2);
			expect(dU.getGames(Blitz).length).toBe(2);
			expect(eU.getGames(Blitz).length).toBe(2);
			expect(fU.getGames(Blitz).length).toBe(2);
			expect(aU.getGames(Classical).length).toBe(1);
			expect(bU.getGames(Classical).length).toBe(1);
			expect(cU.getGames(Classical).length).toBe(1);
			expect(dU.getGames(Classical).length).toBe(1);
			expect(eU.getGames(Classical).length).toBe(1);
			expect(fU.getGames(Classical).length).toBe(1);

			expect(aU.getRating(Blitz).numWonDrawnLost()).toEqual([3, 1, 1, 1]);
			expect(bU.getRating(Blitz).numWonDrawnLost()).toEqual([1, 0, 0, 1]);
			expect(cU.getRating(Blitz).numWonDrawnLost()).toEqual([2, 0, 0, 2]);
			expect(dU.getRating(Blitz).numWonDrawnLost()).toEqual([2, 2, 0, 0]);
			expect(eU.getRating(Blitz).numWonDrawnLost()).toEqual([2, 0, 2, 0]);
			expect(fU.getRating(Blitz).numWonDrawnLost()).toEqual([4, 1, 3, 0]);
			expect(aU.getRating(Classical).numWonDrawnLost()).toEqual([2, 1, 0, 1]);
			expect(bU.getRating(Classical).numWonDrawnLost()).toEqual([1, 0, 0, 1]);
			expect(cU.getRating(Classical).numWonDrawnLost()).toEqual([1, 0, 0, 1]);
			expect(dU.getRating(Classical).numWonDrawnLost()).toEqual([1, 1, 0, 0]);
			expect(eU.getRating(Classical).numWonDrawnLost()).toEqual([1, 0, 1, 0]);
			expect(fU.getRating(Classical).numWonDrawnLost()).toEqual([2, 1, 1, 0]);
		}

		gameAddNew(
			'sample',
			u('a'),
			u('b'),
			'white_wins',
			Blitz,
			Blitz5p3,
			toDateMajor('2025-01-20'),
			toDateMinor('17:06:00:000')
		);
		{
			const game_array = gameArrayFromString(fs.readFileSync(path.join(blitz_dir, '2025-01-20'), 'utf8'));
			expect(game_array).not.toBeNull();
			if (isNotDefined(game_array)) {
				return;
			}
			expect(game_array.length).toBe(4);

			expect(game_array[0].id).toBe('0000000012');
			expect(game_array[0].white).toBe('a');
			expect(game_array[0].black).toBe('b');
			expect(game_array[0].result).toBe('white_wins');
			expect(game_array[0].timeControlId).toBe(Blitz);
			expect(game_array[0].timeControlName).toBe(Blitz5p3);
			expect(game_array[0].when).toBe('2025-01-20..17:06:00:000');

			expect(game_array[1].id).toBe('0000000011');
			expect(game_array[1].white).toBe('c');
			expect(game_array[1].black).toBe('d');
			expect(game_array[1].result).toBe('black_wins');
			expect(game_array[1].timeControlId).toBe(Blitz);
			expect(game_array[1].timeControlName).toBe(Blitz5p3);
			expect(game_array[1].when).toBe('2025-01-20..17:06:10:000');

			expect(game_array[2].id).toBe('0000000010');
			expect(game_array[2].white).toBe('e');
			expect(game_array[2].black).toBe('f');
			expect(game_array[2].result).toBe('draw');
			expect(game_array[2].timeControlId).toBe(Blitz);
			expect(game_array[2].timeControlName).toBe(Blitz5p0);
			expect(game_array[2].when).toBe('2025-01-20..17:06:20:000');

			expect(game_array[3].id).toBe('0000000009');
			expect(game_array[3].white).toBe('a');
			expect(game_array[3].black).toBe('f');
			expect(game_array[3].result).toBe('draw');
			expect(game_array[3].timeControlId).toBe(Blitz);
			expect(game_array[3].timeControlName).toBe(Blitz5p0);
			expect(game_array[3].when).toBe('2025-01-20..17:06:30:000');

			expect(aU.getGames(Blitz).length).toBe(2);
			expect(bU.getGames(Blitz).length).toBe(2);
			expect(cU.getGames(Blitz).length).toBe(2);
			expect(dU.getGames(Blitz).length).toBe(2);
			expect(eU.getGames(Blitz).length).toBe(2);
			expect(fU.getGames(Blitz).length).toBe(2);
			expect(aU.getGames(Classical).length).toBe(1);
			expect(bU.getGames(Classical).length).toBe(1);
			expect(cU.getGames(Classical).length).toBe(1);
			expect(dU.getGames(Classical).length).toBe(1);
			expect(eU.getGames(Classical).length).toBe(1);
			expect(fU.getGames(Classical).length).toBe(1);

			expect(aU.getRating(Blitz).numWonDrawnLost()).toEqual([4, 2, 1, 1]);
			expect(bU.getRating(Blitz).numWonDrawnLost()).toEqual([2, 0, 0, 2]);
			expect(cU.getRating(Blitz).numWonDrawnLost()).toEqual([2, 0, 0, 2]);
			expect(dU.getRating(Blitz).numWonDrawnLost()).toEqual([2, 2, 0, 0]);
			expect(eU.getRating(Blitz).numWonDrawnLost()).toEqual([2, 0, 2, 0]);
			expect(fU.getRating(Blitz).numWonDrawnLost()).toEqual([4, 1, 3, 0]);
			expect(aU.getRating(Classical).numWonDrawnLost()).toEqual([2, 1, 0, 1]);
			expect(bU.getRating(Classical).numWonDrawnLost()).toEqual([1, 0, 0, 1]);
			expect(cU.getRating(Classical).numWonDrawnLost()).toEqual([1, 0, 0, 1]);
			expect(dU.getRating(Classical).numWonDrawnLost()).toEqual([1, 1, 0, 0]);
			expect(eU.getRating(Classical).numWonDrawnLost()).toEqual([1, 0, 1, 0]);
			expect(fU.getRating(Classical).numWonDrawnLost()).toEqual([2, 1, 1, 0]);
		}
	});

	test('Add "Classical" games', () => {
		const classical_dir = EnvironmentManager.getInstance().getDirGamesTimeControl(Classical);

		gameAddNew(
			'sample',
			u('a'),
			u('f'),
			'draw',
			Classical,
			Classical90p30,
			toDateMajor('2025-01-10'),
			toDateMinor('17:06:30:000')
		);
		{
			const game_array = gameArrayFromString(fs.readFileSync(path.join(classical_dir, '2025-01-10'), 'utf8'));
			expect(game_array).not.toBeNull();
			if (isNotDefined(game_array)) {
				return;
			}
			expect(game_array.length).toBe(1);

			expect(game_array[0].id).toBe('0000000013');
			expect(game_array[0].white).toBe('a');
			expect(game_array[0].black).toBe('f');
			expect(game_array[0].result).toBe('draw');
			expect(game_array[0].timeControlId).toBe(Classical);
			expect(game_array[0].timeControlName).toBe(Classical90p30);
			expect(game_array[0].when).toBe('2025-01-10..17:06:30:000');

			expect(aU.getGames(Blitz).length).toBe(2);
			expect(bU.getGames(Blitz).length).toBe(2);
			expect(cU.getGames(Blitz).length).toBe(2);
			expect(dU.getGames(Blitz).length).toBe(2);
			expect(eU.getGames(Blitz).length).toBe(2);
			expect(fU.getGames(Blitz).length).toBe(2);
			expect(aU.getGames(Classical).length).toBe(2);
			expect(bU.getGames(Classical).length).toBe(1);
			expect(cU.getGames(Classical).length).toBe(1);
			expect(dU.getGames(Classical).length).toBe(1);
			expect(eU.getGames(Classical).length).toBe(1);
			expect(fU.getGames(Classical).length).toBe(2);

			expect(aU.getRating(Blitz).numWonDrawnLost()).toEqual([4, 2, 1, 1]);
			expect(bU.getRating(Blitz).numWonDrawnLost()).toEqual([2, 0, 0, 2]);
			expect(cU.getRating(Blitz).numWonDrawnLost()).toEqual([2, 0, 0, 2]);
			expect(dU.getRating(Blitz).numWonDrawnLost()).toEqual([2, 2, 0, 0]);
			expect(eU.getRating(Blitz).numWonDrawnLost()).toEqual([2, 0, 2, 0]);
			expect(fU.getRating(Blitz).numWonDrawnLost()).toEqual([4, 1, 3, 0]);
			expect(aU.getRating(Classical).numWonDrawnLost()).toEqual([3, 1, 1, 1]);
			expect(bU.getRating(Classical).numWonDrawnLost()).toEqual([1, 0, 0, 1]);
			expect(cU.getRating(Classical).numWonDrawnLost()).toEqual([1, 0, 0, 1]);
			expect(dU.getRating(Classical).numWonDrawnLost()).toEqual([1, 1, 0, 0]);
			expect(eU.getRating(Classical).numWonDrawnLost()).toEqual([1, 0, 1, 0]);
			expect(fU.getRating(Classical).numWonDrawnLost()).toEqual([3, 1, 2, 0]);
		}

		gameAddNew(
			'sample',
			u('e'),
			u('f'),
			'draw',
			Classical,
			Classical90p30,
			toDateMajor('2025-01-10'),
			toDateMinor('17:06:20:000')
		);
		{
			const game_array = gameArrayFromString(fs.readFileSync(path.join(classical_dir, '2025-01-10'), 'utf8'));
			expect(game_array).not.toBeNull();
			if (isNotDefined(game_array)) {
				return;
			}
			expect(game_array.length).toBe(2);

			expect(game_array[0].id).toBe('0000000014');
			expect(game_array[0].white).toBe('e');
			expect(game_array[0].black).toBe('f');
			expect(game_array[0].result).toBe('draw');
			expect(game_array[0].timeControlId).toBe(Classical);
			expect(game_array[0].timeControlName).toBe(Classical90p30);
			expect(game_array[0].when).toBe('2025-01-10..17:06:20:000');

			expect(game_array[1].id).toBe('0000000013');
			expect(game_array[1].white).toBe('a');
			expect(game_array[1].black).toBe('f');
			expect(game_array[1].result).toBe('draw');
			expect(game_array[1].timeControlId).toBe(Classical);
			expect(game_array[1].timeControlName).toBe(Classical90p30);
			expect(game_array[1].when).toBe('2025-01-10..17:06:30:000');

			expect(aU.getGames(Blitz).length).toBe(2);
			expect(bU.getGames(Blitz).length).toBe(2);
			expect(cU.getGames(Blitz).length).toBe(2);
			expect(dU.getGames(Blitz).length).toBe(2);
			expect(eU.getGames(Blitz).length).toBe(2);
			expect(fU.getGames(Blitz).length).toBe(2);
			expect(aU.getGames(Classical).length).toBe(2);
			expect(bU.getGames(Classical).length).toBe(1);
			expect(cU.getGames(Classical).length).toBe(1);
			expect(dU.getGames(Classical).length).toBe(1);
			expect(eU.getGames(Classical).length).toBe(2);
			expect(fU.getGames(Classical).length).toBe(2);

			expect(aU.getRating(Blitz).numWonDrawnLost()).toEqual([4, 2, 1, 1]);
			expect(bU.getRating(Blitz).numWonDrawnLost()).toEqual([2, 0, 0, 2]);
			expect(cU.getRating(Blitz).numWonDrawnLost()).toEqual([2, 0, 0, 2]);
			expect(dU.getRating(Blitz).numWonDrawnLost()).toEqual([2, 2, 0, 0]);
			expect(eU.getRating(Blitz).numWonDrawnLost()).toEqual([2, 0, 2, 0]);
			expect(fU.getRating(Blitz).numWonDrawnLost()).toEqual([4, 1, 3, 0]);
			expect(aU.getRating(Classical).numWonDrawnLost()).toEqual([3, 1, 1, 1]);
			expect(bU.getRating(Classical).numWonDrawnLost()).toEqual([1, 0, 0, 1]);
			expect(cU.getRating(Classical).numWonDrawnLost()).toEqual([1, 0, 0, 1]);
			expect(dU.getRating(Classical).numWonDrawnLost()).toEqual([1, 1, 0, 0]);
			expect(eU.getRating(Classical).numWonDrawnLost()).toEqual([2, 0, 2, 0]);
			expect(fU.getRating(Classical).numWonDrawnLost()).toEqual([4, 1, 3, 0]);
		}

		gameAddNew(
			'sample',
			u('c'),
			u('d'),
			'black_wins',
			Classical,
			Classical90p30,
			toDateMajor('2025-01-10'),
			toDateMinor('17:06:10:000')
		);
		{
			const game_array = gameArrayFromString(fs.readFileSync(path.join(classical_dir, '2025-01-10'), 'utf8'));
			expect(game_array).not.toBeNull();
			if (isNotDefined(game_array)) {
				return;
			}
			expect(game_array.length).toBe(3);

			expect(game_array[0].id).toBe('0000000015');
			expect(game_array[0].white).toBe('c');
			expect(game_array[0].black).toBe('d');
			expect(game_array[0].result).toBe('black_wins');
			expect(game_array[0].timeControlId).toBe(Classical);
			expect(game_array[0].timeControlName).toBe(Classical90p30);
			expect(game_array[0].when).toBe('2025-01-10..17:06:10:000');

			expect(game_array[1].id).toBe('0000000014');
			expect(game_array[1].white).toBe('e');
			expect(game_array[1].black).toBe('f');
			expect(game_array[1].result).toBe('draw');
			expect(game_array[1].timeControlId).toBe(Classical);
			expect(game_array[1].timeControlName).toBe(Classical90p30);
			expect(game_array[1].when).toBe('2025-01-10..17:06:20:000');

			expect(game_array[2].id).toBe('0000000013');
			expect(game_array[2].white).toBe('a');
			expect(game_array[2].black).toBe('f');
			expect(game_array[2].result).toBe('draw');
			expect(game_array[2].timeControlId).toBe(Classical);
			expect(game_array[2].timeControlName).toBe(Classical90p30);
			expect(game_array[2].when).toBe('2025-01-10..17:06:30:000');

			expect(aU.getGames(Blitz).length).toBe(2);
			expect(bU.getGames(Blitz).length).toBe(2);
			expect(cU.getGames(Blitz).length).toBe(2);
			expect(dU.getGames(Blitz).length).toBe(2);
			expect(eU.getGames(Blitz).length).toBe(2);
			expect(fU.getGames(Blitz).length).toBe(2);
			expect(aU.getGames(Classical).length).toBe(2);
			expect(bU.getGames(Classical).length).toBe(1);
			expect(cU.getGames(Classical).length).toBe(2);
			expect(dU.getGames(Classical).length).toBe(2);
			expect(eU.getGames(Classical).length).toBe(2);
			expect(fU.getGames(Classical).length).toBe(2);

			expect(aU.getRating(Blitz).numWonDrawnLost()).toEqual([4, 2, 1, 1]);
			expect(bU.getRating(Blitz).numWonDrawnLost()).toEqual([2, 0, 0, 2]);
			expect(cU.getRating(Blitz).numWonDrawnLost()).toEqual([2, 0, 0, 2]);
			expect(dU.getRating(Blitz).numWonDrawnLost()).toEqual([2, 2, 0, 0]);
			expect(eU.getRating(Blitz).numWonDrawnLost()).toEqual([2, 0, 2, 0]);
			expect(fU.getRating(Blitz).numWonDrawnLost()).toEqual([4, 1, 3, 0]);
			expect(aU.getRating(Classical).numWonDrawnLost()).toEqual([3, 1, 1, 1]);
			expect(bU.getRating(Classical).numWonDrawnLost()).toEqual([1, 0, 0, 1]);
			expect(cU.getRating(Classical).numWonDrawnLost()).toEqual([2, 0, 0, 2]);
			expect(dU.getRating(Classical).numWonDrawnLost()).toEqual([2, 2, 0, 0]);
			expect(eU.getRating(Classical).numWonDrawnLost()).toEqual([2, 0, 2, 0]);
			expect(fU.getRating(Classical).numWonDrawnLost()).toEqual([4, 1, 3, 0]);
		}

		gameAddNew(
			'sample',
			u('a'),
			u('b'),
			'white_wins',
			Classical,
			Classical90p30,
			toDateMajor('2025-01-10'),
			toDateMinor('17:06:00:000')
		);
		{
			const game_array = gameArrayFromString(fs.readFileSync(path.join(classical_dir, '2025-01-10'), 'utf8'));
			expect(game_array).not.toBeNull();
			if (isNotDefined(game_array)) {
				return;
			}
			expect(game_array.length).toBe(4);

			expect(game_array[0].id).toBe('0000000016');
			expect(game_array[0].white).toBe('a');
			expect(game_array[0].black).toBe('b');
			expect(game_array[0].result).toBe('white_wins');
			expect(game_array[0].timeControlId).toBe(Classical);
			expect(game_array[0].timeControlName).toBe(Classical90p30);
			expect(game_array[0].when).toBe('2025-01-10..17:06:00:000');

			expect(game_array[1].id).toBe('0000000015');
			expect(game_array[1].white).toBe('c');
			expect(game_array[1].black).toBe('d');
			expect(game_array[1].result).toBe('black_wins');
			expect(game_array[1].timeControlId).toBe(Classical);
			expect(game_array[1].timeControlName).toBe(Classical90p30);
			expect(game_array[1].when).toBe('2025-01-10..17:06:10:000');

			expect(game_array[2].id).toBe('0000000014');
			expect(game_array[2].white).toBe('e');
			expect(game_array[2].black).toBe('f');
			expect(game_array[2].result).toBe('draw');
			expect(game_array[2].timeControlId).toBe(Classical);
			expect(game_array[2].timeControlName).toBe(Classical90p30);
			expect(game_array[2].when).toBe('2025-01-10..17:06:20:000');

			expect(game_array[3].id).toBe('0000000013');
			expect(game_array[3].white).toBe('a');
			expect(game_array[3].black).toBe('f');
			expect(game_array[3].result).toBe('draw');
			expect(game_array[3].timeControlId).toBe(Classical);
			expect(game_array[3].timeControlName).toBe(Classical90p30);
			expect(game_array[3].when).toBe('2025-01-10..17:06:30:000');

			expect(aU.getGames(Blitz).length).toBe(2);
			expect(bU.getGames(Blitz).length).toBe(2);
			expect(cU.getGames(Blitz).length).toBe(2);
			expect(dU.getGames(Blitz).length).toBe(2);
			expect(eU.getGames(Blitz).length).toBe(2);
			expect(fU.getGames(Blitz).length).toBe(2);
			expect(aU.getGames(Classical).length).toBe(2);
			expect(bU.getGames(Classical).length).toBe(2);
			expect(cU.getGames(Classical).length).toBe(2);
			expect(dU.getGames(Classical).length).toBe(2);
			expect(eU.getGames(Classical).length).toBe(2);
			expect(fU.getGames(Classical).length).toBe(2);

			expect(aU.getRating(Blitz).numWonDrawnLost()).toEqual([4, 2, 1, 1]);
			expect(bU.getRating(Blitz).numWonDrawnLost()).toEqual([2, 0, 0, 2]);
			expect(cU.getRating(Blitz).numWonDrawnLost()).toEqual([2, 0, 0, 2]);
			expect(dU.getRating(Blitz).numWonDrawnLost()).toEqual([2, 2, 0, 0]);
			expect(eU.getRating(Blitz).numWonDrawnLost()).toEqual([2, 0, 2, 0]);
			expect(fU.getRating(Blitz).numWonDrawnLost()).toEqual([4, 1, 3, 0]);
			expect(aU.getRating(Classical).numWonDrawnLost()).toEqual([4, 2, 1, 1]);
			expect(bU.getRating(Classical).numWonDrawnLost()).toEqual([2, 0, 0, 2]);
			expect(cU.getRating(Classical).numWonDrawnLost()).toEqual([2, 0, 0, 2]);
			expect(dU.getRating(Classical).numWonDrawnLost()).toEqual([2, 2, 0, 0]);
			expect(eU.getRating(Classical).numWonDrawnLost()).toEqual([2, 0, 2, 0]);
			expect(fU.getRating(Classical).numWonDrawnLost()).toEqual([4, 1, 3, 0]);
		}
	});
});

describe('Zig-zag game creation', () => {
	test('Add "Blitz" games', () => {
		const blitz_dir = EnvironmentManager.getInstance().getDirGamesTimeControl(Blitz);
		gameAddNew(
			'sample',
			u('a'),
			u('f'),
			'draw',
			Blitz,
			Blitz5p0,
			toDateMajor('2025-01-20'),
			toDateMinor('17:06:25:000')
		);
		{
			const game_array = gameArrayFromString(fs.readFileSync(path.join(blitz_dir, '2025-01-20'), 'utf8'));
			expect(game_array).not.toBeNull();
			if (isNotDefined(game_array)) {
				return;
			}
			expect(game_array.length).toBe(5);

			expect(game_array[0].id).toBe('0000000012');
			expect(game_array[0].white).toBe('a');
			expect(game_array[0].black).toBe('b');
			expect(game_array[0].result).toBe('white_wins');
			expect(game_array[0].timeControlId).toBe(Blitz);
			expect(game_array[0].timeControlName).toBe(Blitz5p3);
			expect(game_array[0].when).toBe('2025-01-20..17:06:00:000');

			expect(game_array[1].id).toBe('0000000011');
			expect(game_array[1].white).toBe('c');
			expect(game_array[1].black).toBe('d');
			expect(game_array[1].result).toBe('black_wins');
			expect(game_array[1].timeControlId).toBe(Blitz);
			expect(game_array[1].timeControlName).toBe(Blitz5p3);
			expect(game_array[1].when).toBe('2025-01-20..17:06:10:000');

			expect(game_array[2].id).toBe('0000000010');
			expect(game_array[2].white).toBe('e');
			expect(game_array[2].black).toBe('f');
			expect(game_array[2].result).toBe('draw');
			expect(game_array[2].timeControlId).toBe(Blitz);
			expect(game_array[2].timeControlName).toBe(Blitz5p0);
			expect(game_array[2].when).toBe('2025-01-20..17:06:20:000');

			expect(game_array[3].id).toBe('0000000017');
			expect(game_array[3].white).toBe('a');
			expect(game_array[3].black).toBe('f');
			expect(game_array[3].result).toBe('draw');
			expect(game_array[3].timeControlId).toBe(Blitz);
			expect(game_array[3].timeControlName).toBe(Blitz5p0);
			expect(game_array[3].when).toBe('2025-01-20..17:06:25:000');

			expect(game_array[4].id).toBe('0000000009');
			expect(game_array[4].white).toBe('a');
			expect(game_array[4].black).toBe('f');
			expect(game_array[4].result).toBe('draw');
			expect(game_array[4].timeControlId).toBe(Blitz);
			expect(game_array[4].timeControlName).toBe(Blitz5p0);
			expect(game_array[4].when).toBe('2025-01-20..17:06:30:000');

			expect(aU.getGames(Blitz).length).toBe(2);
			expect(bU.getGames(Blitz).length).toBe(2);
			expect(cU.getGames(Blitz).length).toBe(2);
			expect(dU.getGames(Blitz).length).toBe(2);
			expect(eU.getGames(Blitz).length).toBe(2);
			expect(fU.getGames(Blitz).length).toBe(2);
			expect(aU.getGames(Classical).length).toBe(2);
			expect(bU.getGames(Classical).length).toBe(2);
			expect(cU.getGames(Classical).length).toBe(2);
			expect(dU.getGames(Classical).length).toBe(2);
			expect(eU.getGames(Classical).length).toBe(2);
			expect(fU.getGames(Classical).length).toBe(2);

			expect(aU.getRating(Blitz).numWonDrawnLost()).toEqual([5, 2, 2, 1]);
			expect(bU.getRating(Blitz).numWonDrawnLost()).toEqual([2, 0, 0, 2]);
			expect(cU.getRating(Blitz).numWonDrawnLost()).toEqual([2, 0, 0, 2]);
			expect(dU.getRating(Blitz).numWonDrawnLost()).toEqual([2, 2, 0, 0]);
			expect(eU.getRating(Blitz).numWonDrawnLost()).toEqual([2, 0, 2, 0]);
			expect(fU.getRating(Blitz).numWonDrawnLost()).toEqual([5, 1, 4, 0]);
			expect(aU.getRating(Classical).numWonDrawnLost()).toEqual([4, 2, 1, 1]);
			expect(bU.getRating(Classical).numWonDrawnLost()).toEqual([2, 0, 0, 2]);
			expect(cU.getRating(Classical).numWonDrawnLost()).toEqual([2, 0, 0, 2]);
			expect(dU.getRating(Classical).numWonDrawnLost()).toEqual([2, 2, 0, 0]);
			expect(eU.getRating(Classical).numWonDrawnLost()).toEqual([2, 0, 2, 0]);
			expect(fU.getRating(Classical).numWonDrawnLost()).toEqual([4, 1, 3, 0]);
		}

		gameAddNew(
			'sample',
			u('e'),
			u('f'),
			'draw',
			Blitz,
			Blitz5p0,
			toDateMajor('2025-01-20'),
			toDateMinor('17:06:05:000')
		);
		{
			const game_array = gameArrayFromString(fs.readFileSync(path.join(blitz_dir, '2025-01-20'), 'utf8'));
			expect(game_array).not.toBeNull();
			if (isNotDefined(game_array)) {
				return;
			}
			expect(game_array.length).toBe(6);

			expect(game_array[0].id).toBe('0000000012');
			expect(game_array[0].white).toBe('a');
			expect(game_array[0].black).toBe('b');
			expect(game_array[0].result).toBe('white_wins');
			expect(game_array[0].timeControlId).toBe(Blitz);
			expect(game_array[0].timeControlName).toBe(Blitz5p3);
			expect(game_array[0].when).toBe('2025-01-20..17:06:00:000');

			expect(game_array[1].id).toBe('0000000018');
			expect(game_array[1].white).toBe('e');
			expect(game_array[1].black).toBe('f');
			expect(game_array[1].result).toBe('draw');
			expect(game_array[1].timeControlId).toBe(Blitz);
			expect(game_array[1].timeControlName).toBe(Blitz5p0);
			expect(game_array[1].when).toBe('2025-01-20..17:06:05:000');

			expect(game_array[2].id).toBe('0000000011');
			expect(game_array[2].white).toBe('c');
			expect(game_array[2].black).toBe('d');
			expect(game_array[2].result).toBe('black_wins');
			expect(game_array[2].timeControlId).toBe(Blitz);
			expect(game_array[2].timeControlName).toBe(Blitz5p3);
			expect(game_array[2].when).toBe('2025-01-20..17:06:10:000');

			expect(game_array[3].id).toBe('0000000010');
			expect(game_array[3].white).toBe('e');
			expect(game_array[3].black).toBe('f');
			expect(game_array[3].result).toBe('draw');
			expect(game_array[3].timeControlId).toBe(Blitz);
			expect(game_array[3].timeControlName).toBe(Blitz5p0);
			expect(game_array[3].when).toBe('2025-01-20..17:06:20:000');

			expect(game_array[4].id).toBe('0000000017');
			expect(game_array[4].white).toBe('a');
			expect(game_array[4].black).toBe('f');
			expect(game_array[4].result).toBe('draw');
			expect(game_array[4].timeControlId).toBe(Blitz);
			expect(game_array[4].timeControlName).toBe(Blitz5p0);
			expect(game_array[4].when).toBe('2025-01-20..17:06:25:000');

			expect(game_array[5].id).toBe('0000000009');
			expect(game_array[5].white).toBe('a');
			expect(game_array[5].black).toBe('f');
			expect(game_array[5].result).toBe('draw');
			expect(game_array[5].timeControlId).toBe(Blitz);
			expect(game_array[5].timeControlName).toBe(Blitz5p0);
			expect(game_array[5].when).toBe('2025-01-20..17:06:30:000');

			expect(aU.getGames(Blitz).length).toBe(2);
			expect(bU.getGames(Blitz).length).toBe(2);
			expect(cU.getGames(Blitz).length).toBe(2);
			expect(dU.getGames(Blitz).length).toBe(2);
			expect(eU.getGames(Blitz).length).toBe(2);
			expect(fU.getGames(Blitz).length).toBe(2);
			expect(aU.getGames(Classical).length).toBe(2);
			expect(bU.getGames(Classical).length).toBe(2);
			expect(cU.getGames(Classical).length).toBe(2);
			expect(dU.getGames(Classical).length).toBe(2);
			expect(eU.getGames(Classical).length).toBe(2);
			expect(fU.getGames(Classical).length).toBe(2);

			expect(aU.getRating(Blitz).numWonDrawnLost()).toEqual([5, 2, 2, 1]);
			expect(bU.getRating(Blitz).numWonDrawnLost()).toEqual([2, 0, 0, 2]);
			expect(cU.getRating(Blitz).numWonDrawnLost()).toEqual([2, 0, 0, 2]);
			expect(dU.getRating(Blitz).numWonDrawnLost()).toEqual([2, 2, 0, 0]);
			expect(eU.getRating(Blitz).numWonDrawnLost()).toEqual([3, 0, 3, 0]);
			expect(fU.getRating(Blitz).numWonDrawnLost()).toEqual([6, 1, 5, 0]);
			expect(aU.getRating(Classical).numWonDrawnLost()).toEqual([4, 2, 1, 1]);
			expect(bU.getRating(Classical).numWonDrawnLost()).toEqual([2, 0, 0, 2]);
			expect(cU.getRating(Classical).numWonDrawnLost()).toEqual([2, 0, 0, 2]);
			expect(dU.getRating(Classical).numWonDrawnLost()).toEqual([2, 2, 0, 0]);
			expect(eU.getRating(Classical).numWonDrawnLost()).toEqual([2, 0, 2, 0]);
			expect(fU.getRating(Classical).numWonDrawnLost()).toEqual([4, 1, 3, 0]);
		}

		gameAddNew(
			'sample',
			u('c'),
			u('d'),
			'white_wins',
			Blitz,
			Blitz5p3,
			toDateMajor('2025-01-20'),
			toDateMinor('17:06:15:000')
		);
		{
			const game_array = gameArrayFromString(fs.readFileSync(path.join(blitz_dir, '2025-01-20'), 'utf8'));
			expect(game_array).not.toBeNull();
			if (isNotDefined(game_array)) {
				return;
			}
			expect(game_array.length).toBe(7);

			expect(game_array[0].id).toBe('0000000012');
			expect(game_array[0].white).toBe('a');
			expect(game_array[0].black).toBe('b');
			expect(game_array[0].result).toBe('white_wins');
			expect(game_array[0].timeControlId).toBe(Blitz);
			expect(game_array[0].timeControlName).toBe(Blitz5p3);
			expect(game_array[0].when).toBe('2025-01-20..17:06:00:000');

			expect(game_array[1].id).toBe('0000000018');
			expect(game_array[1].white).toBe('e');
			expect(game_array[1].black).toBe('f');
			expect(game_array[1].result).toBe('draw');
			expect(game_array[1].timeControlId).toBe(Blitz);
			expect(game_array[1].timeControlName).toBe(Blitz5p0);
			expect(game_array[1].when).toBe('2025-01-20..17:06:05:000');

			expect(game_array[2].id).toBe('0000000011');
			expect(game_array[2].white).toBe('c');
			expect(game_array[2].black).toBe('d');
			expect(game_array[2].result).toBe('black_wins');
			expect(game_array[2].timeControlId).toBe(Blitz);
			expect(game_array[2].timeControlName).toBe(Blitz5p3);
			expect(game_array[2].when).toBe('2025-01-20..17:06:10:000');

			expect(game_array[3].id).toBe('0000000019');
			expect(game_array[3].white).toBe('c');
			expect(game_array[3].black).toBe('d');
			expect(game_array[3].result).toBe('white_wins');
			expect(game_array[3].timeControlId).toBe(Blitz);
			expect(game_array[3].timeControlName).toBe(Blitz5p3);
			expect(game_array[3].when).toBe('2025-01-20..17:06:15:000');

			expect(game_array[4].id).toBe('0000000010');
			expect(game_array[4].white).toBe('e');
			expect(game_array[4].black).toBe('f');
			expect(game_array[4].result).toBe('draw');
			expect(game_array[4].timeControlId).toBe(Blitz);
			expect(game_array[4].timeControlName).toBe(Blitz5p0);
			expect(game_array[4].when).toBe('2025-01-20..17:06:20:000');

			expect(game_array[5].id).toBe('0000000017');
			expect(game_array[5].white).toBe('a');
			expect(game_array[5].black).toBe('f');
			expect(game_array[5].result).toBe('draw');
			expect(game_array[5].timeControlId).toBe(Blitz);
			expect(game_array[5].timeControlName).toBe(Blitz5p0);
			expect(game_array[5].when).toBe('2025-01-20..17:06:25:000');

			expect(game_array[6].id).toBe('0000000009');
			expect(game_array[6].white).toBe('a');
			expect(game_array[6].black).toBe('f');
			expect(game_array[6].result).toBe('draw');
			expect(game_array[6].timeControlId).toBe(Blitz);
			expect(game_array[6].timeControlName).toBe(Blitz5p0);
			expect(game_array[6].when).toBe('2025-01-20..17:06:30:000');

			expect(aU.getGames(Blitz).length).toBe(2);
			expect(bU.getGames(Blitz).length).toBe(2);
			expect(cU.getGames(Blitz).length).toBe(2);
			expect(dU.getGames(Blitz).length).toBe(2);
			expect(eU.getGames(Blitz).length).toBe(2);
			expect(fU.getGames(Blitz).length).toBe(2);
			expect(aU.getGames(Classical).length).toBe(2);
			expect(bU.getGames(Classical).length).toBe(2);
			expect(cU.getGames(Classical).length).toBe(2);
			expect(dU.getGames(Classical).length).toBe(2);
			expect(eU.getGames(Classical).length).toBe(2);
			expect(fU.getGames(Classical).length).toBe(2);

			expect(aU.getRating(Blitz).numWonDrawnLost()).toEqual([5, 2, 2, 1]);
			expect(bU.getRating(Blitz).numWonDrawnLost()).toEqual([2, 0, 0, 2]);
			expect(cU.getRating(Blitz).numWonDrawnLost()).toEqual([3, 1, 0, 2]);
			expect(dU.getRating(Blitz).numWonDrawnLost()).toEqual([3, 2, 0, 1]);
			expect(eU.getRating(Blitz).numWonDrawnLost()).toEqual([3, 0, 3, 0]);
			expect(fU.getRating(Blitz).numWonDrawnLost()).toEqual([6, 1, 5, 0]);
			expect(aU.getRating(Classical).numWonDrawnLost()).toEqual([4, 2, 1, 1]);
			expect(bU.getRating(Classical).numWonDrawnLost()).toEqual([2, 0, 0, 2]);
			expect(cU.getRating(Classical).numWonDrawnLost()).toEqual([2, 0, 0, 2]);
			expect(dU.getRating(Classical).numWonDrawnLost()).toEqual([2, 2, 0, 0]);
			expect(eU.getRating(Classical).numWonDrawnLost()).toEqual([2, 0, 2, 0]);
			expect(fU.getRating(Classical).numWonDrawnLost()).toEqual([4, 1, 3, 0]);
		}

		gameAddNew(
			'sample',
			u('a'),
			u('b'),
			'black_wins',
			Blitz,
			Blitz5p3,
			toDateMajor('2025-01-20'),
			toDateMinor('17:05:55:000')
		);
		{
			const game_array = gameArrayFromString(fs.readFileSync(path.join(blitz_dir, '2025-01-20'), 'utf8'));
			expect(game_array).not.toBeNull();
			if (isNotDefined(game_array)) {
				return;
			}
			expect(game_array.length).toBe(8);

			expect(game_array[0].id).toBe('0000000020');
			expect(game_array[0].white).toBe('a');
			expect(game_array[0].black).toBe('b');
			expect(game_array[0].result).toBe('black_wins');
			expect(game_array[0].timeControlId).toBe(Blitz);
			expect(game_array[0].timeControlName).toBe(Blitz5p3);
			expect(game_array[0].when).toBe('2025-01-20..17:05:55:000');

			expect(game_array[1].id).toBe('0000000012');
			expect(game_array[1].white).toBe('a');
			expect(game_array[1].black).toBe('b');
			expect(game_array[1].result).toBe('white_wins');
			expect(game_array[1].timeControlId).toBe(Blitz);
			expect(game_array[1].timeControlName).toBe(Blitz5p3);
			expect(game_array[1].when).toBe('2025-01-20..17:06:00:000');

			expect(game_array[2].id).toBe('0000000018');
			expect(game_array[2].white).toBe('e');
			expect(game_array[2].black).toBe('f');
			expect(game_array[2].result).toBe('draw');
			expect(game_array[2].timeControlId).toBe(Blitz);
			expect(game_array[2].timeControlName).toBe(Blitz5p0);
			expect(game_array[2].when).toBe('2025-01-20..17:06:05:000');

			expect(game_array[3].id).toBe('0000000011');
			expect(game_array[3].white).toBe('c');
			expect(game_array[3].black).toBe('d');
			expect(game_array[3].result).toBe('black_wins');
			expect(game_array[3].timeControlId).toBe(Blitz);
			expect(game_array[3].timeControlName).toBe(Blitz5p3);
			expect(game_array[3].when).toBe('2025-01-20..17:06:10:000');

			expect(game_array[4].id).toBe('0000000019');
			expect(game_array[4].white).toBe('c');
			expect(game_array[4].black).toBe('d');
			expect(game_array[4].result).toBe('white_wins');
			expect(game_array[4].timeControlId).toBe(Blitz);
			expect(game_array[4].timeControlName).toBe(Blitz5p3);
			expect(game_array[4].when).toBe('2025-01-20..17:06:15:000');

			expect(game_array[5].id).toBe('0000000010');
			expect(game_array[5].white).toBe('e');
			expect(game_array[5].black).toBe('f');
			expect(game_array[5].result).toBe('draw');
			expect(game_array[5].timeControlId).toBe(Blitz);
			expect(game_array[5].timeControlName).toBe(Blitz5p0);
			expect(game_array[5].when).toBe('2025-01-20..17:06:20:000');

			expect(game_array[6].id).toBe('0000000017');
			expect(game_array[6].white).toBe('a');
			expect(game_array[6].black).toBe('f');
			expect(game_array[6].result).toBe('draw');
			expect(game_array[6].timeControlId).toBe(Blitz);
			expect(game_array[6].timeControlName).toBe(Blitz5p0);
			expect(game_array[6].when).toBe('2025-01-20..17:06:25:000');

			expect(game_array[7].id).toBe('0000000009');
			expect(game_array[7].white).toBe('a');
			expect(game_array[7].black).toBe('f');
			expect(game_array[7].result).toBe('draw');
			expect(game_array[7].timeControlId).toBe(Blitz);
			expect(game_array[7].timeControlName).toBe(Blitz5p0);
			expect(game_array[7].when).toBe('2025-01-20..17:06:30:000');

			expect(aU.getGames(Blitz).length).toBe(2);
			expect(bU.getGames(Blitz).length).toBe(2);
			expect(cU.getGames(Blitz).length).toBe(2);
			expect(dU.getGames(Blitz).length).toBe(2);
			expect(eU.getGames(Blitz).length).toBe(2);
			expect(fU.getGames(Blitz).length).toBe(2);
			expect(aU.getGames(Classical).length).toBe(2);
			expect(bU.getGames(Classical).length).toBe(2);
			expect(cU.getGames(Classical).length).toBe(2);
			expect(dU.getGames(Classical).length).toBe(2);
			expect(eU.getGames(Classical).length).toBe(2);
			expect(fU.getGames(Classical).length).toBe(2);

			expect(aU.getRating(Blitz).numWonDrawnLost()).toEqual([6, 2, 2, 2]);
			expect(bU.getRating(Blitz).numWonDrawnLost()).toEqual([3, 1, 0, 2]);
			expect(cU.getRating(Blitz).numWonDrawnLost()).toEqual([3, 1, 0, 2]);
			expect(dU.getRating(Blitz).numWonDrawnLost()).toEqual([3, 2, 0, 1]);
			expect(eU.getRating(Blitz).numWonDrawnLost()).toEqual([3, 0, 3, 0]);
			expect(fU.getRating(Blitz).numWonDrawnLost()).toEqual([6, 1, 5, 0]);
			expect(aU.getRating(Classical).numWonDrawnLost()).toEqual([4, 2, 1, 1]);
			expect(bU.getRating(Classical).numWonDrawnLost()).toEqual([2, 0, 0, 2]);
			expect(cU.getRating(Classical).numWonDrawnLost()).toEqual([2, 0, 0, 2]);
			expect(dU.getRating(Classical).numWonDrawnLost()).toEqual([2, 2, 0, 0]);
			expect(eU.getRating(Classical).numWonDrawnLost()).toEqual([2, 0, 2, 0]);
			expect(fU.getRating(Classical).numWonDrawnLost()).toEqual([4, 1, 3, 0]);
		}
	});

	test('Add "Classical" games', () => {
		const blitz_dir = EnvironmentManager.getInstance().getDirGamesTimeControl(Classical);
		gameAddNew(
			'sample',
			u('a'),
			u('f'),
			'draw',
			Classical,
			Classical90p30,
			toDateMajor('2025-01-10'),
			toDateMinor('17:06:25:000')
		);
		{
			const game_array = gameArrayFromString(fs.readFileSync(path.join(blitz_dir, '2025-01-10'), 'utf8'));
			expect(game_array).not.toBeNull();
			if (isNotDefined(game_array)) {
				return;
			}
			expect(game_array.length).toBe(5);

			expect(game_array[0].id).toBe('0000000016');
			expect(game_array[0].white).toBe('a');
			expect(game_array[0].black).toBe('b');
			expect(game_array[0].result).toBe('white_wins');
			expect(game_array[0].timeControlId).toBe(Classical);
			expect(game_array[0].timeControlName).toBe(Classical90p30);
			expect(game_array[0].when).toBe('2025-01-10..17:06:00:000');

			expect(game_array[1].id).toBe('0000000015');
			expect(game_array[1].white).toBe('c');
			expect(game_array[1].black).toBe('d');
			expect(game_array[1].result).toBe('black_wins');
			expect(game_array[1].timeControlId).toBe(Classical);
			expect(game_array[1].timeControlName).toBe(Classical90p30);
			expect(game_array[1].when).toBe('2025-01-10..17:06:10:000');

			expect(game_array[2].id).toBe('0000000014');
			expect(game_array[2].white).toBe('e');
			expect(game_array[2].black).toBe('f');
			expect(game_array[2].result).toBe('draw');
			expect(game_array[2].timeControlId).toBe(Classical);
			expect(game_array[2].timeControlName).toBe(Classical90p30);
			expect(game_array[2].when).toBe('2025-01-10..17:06:20:000');

			expect(game_array[3].id).toBe('0000000021');
			expect(game_array[3].white).toBe('a');
			expect(game_array[3].black).toBe('f');
			expect(game_array[3].result).toBe('draw');
			expect(game_array[3].timeControlId).toBe(Classical);
			expect(game_array[3].timeControlName).toBe(Classical90p30);
			expect(game_array[3].when).toBe('2025-01-10..17:06:25:000');

			expect(game_array[4].id).toBe('0000000013');
			expect(game_array[4].white).toBe('a');
			expect(game_array[4].black).toBe('f');
			expect(game_array[4].result).toBe('draw');
			expect(game_array[4].timeControlId).toBe(Classical);
			expect(game_array[4].timeControlName).toBe(Classical90p30);
			expect(game_array[4].when).toBe('2025-01-10..17:06:30:000');

			expect(aU.getGames(Classical).length).toBe(2);
			expect(bU.getGames(Classical).length).toBe(2);
			expect(cU.getGames(Classical).length).toBe(2);
			expect(dU.getGames(Classical).length).toBe(2);
			expect(eU.getGames(Classical).length).toBe(2);
			expect(fU.getGames(Classical).length).toBe(2);
			expect(aU.getGames(Classical).length).toBe(2);
			expect(bU.getGames(Classical).length).toBe(2);
			expect(cU.getGames(Classical).length).toBe(2);
			expect(dU.getGames(Classical).length).toBe(2);
			expect(eU.getGames(Classical).length).toBe(2);
			expect(fU.getGames(Classical).length).toBe(2);

			expect(aU.getRating(Blitz).numWonDrawnLost()).toEqual([6, 2, 2, 2]);
			expect(bU.getRating(Blitz).numWonDrawnLost()).toEqual([3, 1, 0, 2]);
			expect(cU.getRating(Blitz).numWonDrawnLost()).toEqual([3, 1, 0, 2]);
			expect(dU.getRating(Blitz).numWonDrawnLost()).toEqual([3, 2, 0, 1]);
			expect(eU.getRating(Blitz).numWonDrawnLost()).toEqual([3, 0, 3, 0]);
			expect(fU.getRating(Blitz).numWonDrawnLost()).toEqual([6, 1, 5, 0]);
			expect(aU.getRating(Classical).numWonDrawnLost()).toEqual([5, 2, 2, 1]);
			expect(bU.getRating(Classical).numWonDrawnLost()).toEqual([2, 0, 0, 2]);
			expect(cU.getRating(Classical).numWonDrawnLost()).toEqual([2, 0, 0, 2]);
			expect(dU.getRating(Classical).numWonDrawnLost()).toEqual([2, 2, 0, 0]);
			expect(eU.getRating(Classical).numWonDrawnLost()).toEqual([2, 0, 2, 0]);
			expect(fU.getRating(Classical).numWonDrawnLost()).toEqual([5, 1, 4, 0]);
		}

		gameAddNew(
			'sample',
			u('e'),
			u('f'),
			'draw',
			Classical,
			Classical90p30,
			toDateMajor('2025-01-10'),
			toDateMinor('17:06:05:000')
		);
		{
			const game_array = gameArrayFromString(fs.readFileSync(path.join(blitz_dir, '2025-01-10'), 'utf8'));
			expect(game_array).not.toBeNull();
			if (isNotDefined(game_array)) {
				return;
			}
			expect(game_array.length).toBe(6);

			expect(game_array[0].id).toBe('0000000016');
			expect(game_array[0].white).toBe('a');
			expect(game_array[0].black).toBe('b');
			expect(game_array[0].result).toBe('white_wins');
			expect(game_array[0].timeControlId).toBe(Classical);
			expect(game_array[0].timeControlName).toBe(Classical90p30);
			expect(game_array[0].when).toBe('2025-01-10..17:06:00:000');

			expect(game_array[1].id).toBe('0000000022');
			expect(game_array[1].white).toBe('e');
			expect(game_array[1].black).toBe('f');
			expect(game_array[1].result).toBe('draw');
			expect(game_array[1].timeControlId).toBe(Classical);
			expect(game_array[1].timeControlName).toBe(Classical90p30);
			expect(game_array[1].when).toBe('2025-01-10..17:06:05:000');

			expect(game_array[2].id).toBe('0000000015');
			expect(game_array[2].white).toBe('c');
			expect(game_array[2].black).toBe('d');
			expect(game_array[2].result).toBe('black_wins');
			expect(game_array[2].timeControlId).toBe(Classical);
			expect(game_array[2].timeControlName).toBe(Classical90p30);
			expect(game_array[2].when).toBe('2025-01-10..17:06:10:000');

			expect(game_array[3].id).toBe('0000000014');
			expect(game_array[3].white).toBe('e');
			expect(game_array[3].black).toBe('f');
			expect(game_array[3].result).toBe('draw');
			expect(game_array[3].timeControlId).toBe(Classical);
			expect(game_array[3].timeControlName).toBe(Classical90p30);
			expect(game_array[3].when).toBe('2025-01-10..17:06:20:000');

			expect(game_array[4].id).toBe('0000000021');
			expect(game_array[4].white).toBe('a');
			expect(game_array[4].black).toBe('f');
			expect(game_array[4].result).toBe('draw');
			expect(game_array[4].timeControlId).toBe(Classical);
			expect(game_array[4].timeControlName).toBe(Classical90p30);
			expect(game_array[4].when).toBe('2025-01-10..17:06:25:000');

			expect(game_array[5].id).toBe('0000000013');
			expect(game_array[5].white).toBe('a');
			expect(game_array[5].black).toBe('f');
			expect(game_array[5].result).toBe('draw');
			expect(game_array[5].timeControlId).toBe(Classical);
			expect(game_array[5].timeControlName).toBe(Classical90p30);
			expect(game_array[5].when).toBe('2025-01-10..17:06:30:000');

			expect(aU.getGames(Classical).length).toBe(2);
			expect(bU.getGames(Classical).length).toBe(2);
			expect(cU.getGames(Classical).length).toBe(2);
			expect(dU.getGames(Classical).length).toBe(2);
			expect(eU.getGames(Classical).length).toBe(2);
			expect(fU.getGames(Classical).length).toBe(2);
			expect(aU.getGames(Classical).length).toBe(2);
			expect(bU.getGames(Classical).length).toBe(2);
			expect(cU.getGames(Classical).length).toBe(2);
			expect(dU.getGames(Classical).length).toBe(2);
			expect(eU.getGames(Classical).length).toBe(2);
			expect(fU.getGames(Classical).length).toBe(2);

			expect(aU.getRating(Blitz).numWonDrawnLost()).toEqual([6, 2, 2, 2]);
			expect(bU.getRating(Blitz).numWonDrawnLost()).toEqual([3, 1, 0, 2]);
			expect(cU.getRating(Blitz).numWonDrawnLost()).toEqual([3, 1, 0, 2]);
			expect(dU.getRating(Blitz).numWonDrawnLost()).toEqual([3, 2, 0, 1]);
			expect(eU.getRating(Blitz).numWonDrawnLost()).toEqual([3, 0, 3, 0]);
			expect(fU.getRating(Blitz).numWonDrawnLost()).toEqual([6, 1, 5, 0]);
			expect(aU.getRating(Classical).numWonDrawnLost()).toEqual([5, 2, 2, 1]);
			expect(bU.getRating(Classical).numWonDrawnLost()).toEqual([2, 0, 0, 2]);
			expect(cU.getRating(Classical).numWonDrawnLost()).toEqual([2, 0, 0, 2]);
			expect(dU.getRating(Classical).numWonDrawnLost()).toEqual([2, 2, 0, 0]);
			expect(eU.getRating(Classical).numWonDrawnLost()).toEqual([3, 0, 3, 0]);
			expect(fU.getRating(Classical).numWonDrawnLost()).toEqual([6, 1, 5, 0]);
		}

		gameAddNew(
			'sample',
			u('c'),
			u('d'),
			'white_wins',
			Classical,
			Classical90p30,
			toDateMajor('2025-01-10'),
			toDateMinor('17:06:15:000')
		);
		{
			const game_array = gameArrayFromString(fs.readFileSync(path.join(blitz_dir, '2025-01-10'), 'utf8'));
			expect(game_array).not.toBeNull();
			if (isNotDefined(game_array)) {
				return;
			}
			expect(game_array.length).toBe(7);

			expect(game_array[0].id).toBe('0000000016');
			expect(game_array[0].white).toBe('a');
			expect(game_array[0].black).toBe('b');
			expect(game_array[0].result).toBe('white_wins');
			expect(game_array[0].timeControlId).toBe(Classical);
			expect(game_array[0].timeControlName).toBe(Classical90p30);
			expect(game_array[0].when).toBe('2025-01-10..17:06:00:000');

			expect(game_array[1].id).toBe('0000000022');
			expect(game_array[1].white).toBe('e');
			expect(game_array[1].black).toBe('f');
			expect(game_array[1].result).toBe('draw');
			expect(game_array[1].timeControlId).toBe(Classical);
			expect(game_array[1].timeControlName).toBe(Classical90p30);
			expect(game_array[1].when).toBe('2025-01-10..17:06:05:000');

			expect(game_array[2].id).toBe('0000000015');
			expect(game_array[2].white).toBe('c');
			expect(game_array[2].black).toBe('d');
			expect(game_array[2].result).toBe('black_wins');
			expect(game_array[2].timeControlId).toBe(Classical);
			expect(game_array[2].timeControlName).toBe(Classical90p30);
			expect(game_array[2].when).toBe('2025-01-10..17:06:10:000');

			expect(game_array[3].id).toBe('0000000023');
			expect(game_array[3].white).toBe('c');
			expect(game_array[3].black).toBe('d');
			expect(game_array[3].result).toBe('white_wins');
			expect(game_array[3].timeControlId).toBe(Classical);
			expect(game_array[3].timeControlName).toBe(Classical90p30);
			expect(game_array[3].when).toBe('2025-01-10..17:06:15:000');

			expect(game_array[4].id).toBe('0000000014');
			expect(game_array[4].white).toBe('e');
			expect(game_array[4].black).toBe('f');
			expect(game_array[4].result).toBe('draw');
			expect(game_array[4].timeControlId).toBe(Classical);
			expect(game_array[4].timeControlName).toBe(Classical90p30);
			expect(game_array[4].when).toBe('2025-01-10..17:06:20:000');

			expect(game_array[5].id).toBe('0000000021');
			expect(game_array[5].white).toBe('a');
			expect(game_array[5].black).toBe('f');
			expect(game_array[5].result).toBe('draw');
			expect(game_array[5].timeControlId).toBe(Classical);
			expect(game_array[5].timeControlName).toBe(Classical90p30);
			expect(game_array[5].when).toBe('2025-01-10..17:06:25:000');

			expect(game_array[6].id).toBe('0000000013');
			expect(game_array[6].white).toBe('a');
			expect(game_array[6].black).toBe('f');
			expect(game_array[6].result).toBe('draw');
			expect(game_array[6].timeControlId).toBe(Classical);
			expect(game_array[6].timeControlName).toBe(Classical90p30);
			expect(game_array[6].when).toBe('2025-01-10..17:06:30:000');

			expect(aU.getGames(Classical).length).toBe(2);
			expect(bU.getGames(Classical).length).toBe(2);
			expect(cU.getGames(Classical).length).toBe(2);
			expect(dU.getGames(Classical).length).toBe(2);
			expect(eU.getGames(Classical).length).toBe(2);
			expect(fU.getGames(Classical).length).toBe(2);
			expect(aU.getGames(Classical).length).toBe(2);
			expect(bU.getGames(Classical).length).toBe(2);
			expect(cU.getGames(Classical).length).toBe(2);
			expect(dU.getGames(Classical).length).toBe(2);
			expect(eU.getGames(Classical).length).toBe(2);
			expect(fU.getGames(Classical).length).toBe(2);

			expect(aU.getRating(Blitz).numWonDrawnLost()).toEqual([6, 2, 2, 2]);
			expect(bU.getRating(Blitz).numWonDrawnLost()).toEqual([3, 1, 0, 2]);
			expect(cU.getRating(Blitz).numWonDrawnLost()).toEqual([3, 1, 0, 2]);
			expect(dU.getRating(Blitz).numWonDrawnLost()).toEqual([3, 2, 0, 1]);
			expect(eU.getRating(Blitz).numWonDrawnLost()).toEqual([3, 0, 3, 0]);
			expect(fU.getRating(Blitz).numWonDrawnLost()).toEqual([6, 1, 5, 0]);
			expect(aU.getRating(Classical).numWonDrawnLost()).toEqual([5, 2, 2, 1]);
			expect(bU.getRating(Classical).numWonDrawnLost()).toEqual([2, 0, 0, 2]);
			expect(cU.getRating(Classical).numWonDrawnLost()).toEqual([3, 1, 0, 2]);
			expect(dU.getRating(Classical).numWonDrawnLost()).toEqual([3, 2, 0, 1]);
			expect(eU.getRating(Classical).numWonDrawnLost()).toEqual([3, 0, 3, 0]);
			expect(fU.getRating(Classical).numWonDrawnLost()).toEqual([6, 1, 5, 0]);
		}

		gameAddNew(
			'sample',
			u('a'),
			u('b'),
			'black_wins',
			Classical,
			Classical90p30,
			toDateMajor('2025-01-10'),
			toDateMinor('17:05:55:000')
		);
		{
			const game_array = gameArrayFromString(fs.readFileSync(path.join(blitz_dir, '2025-01-10'), 'utf8'));
			expect(game_array).not.toBeNull();
			if (isNotDefined(game_array)) {
				return;
			}
			expect(game_array.length).toBe(8);

			expect(game_array[0].id).toBe('0000000024');
			expect(game_array[0].white).toBe('a');
			expect(game_array[0].black).toBe('b');
			expect(game_array[0].result).toBe('black_wins');
			expect(game_array[0].timeControlId).toBe(Classical);
			expect(game_array[0].timeControlName).toBe(Classical90p30);
			expect(game_array[0].when).toBe('2025-01-10..17:05:55:000');

			expect(game_array[1].id).toBe('0000000016');
			expect(game_array[1].white).toBe('a');
			expect(game_array[1].black).toBe('b');
			expect(game_array[1].result).toBe('white_wins');
			expect(game_array[1].timeControlId).toBe(Classical);
			expect(game_array[1].timeControlName).toBe(Classical90p30);
			expect(game_array[1].when).toBe('2025-01-10..17:06:00:000');

			expect(game_array[2].id).toBe('0000000022');
			expect(game_array[2].white).toBe('e');
			expect(game_array[2].black).toBe('f');
			expect(game_array[2].result).toBe('draw');
			expect(game_array[2].timeControlId).toBe(Classical);
			expect(game_array[2].timeControlName).toBe(Classical90p30);
			expect(game_array[2].when).toBe('2025-01-10..17:06:05:000');

			expect(game_array[3].id).toBe('0000000015');
			expect(game_array[3].white).toBe('c');
			expect(game_array[3].black).toBe('d');
			expect(game_array[3].result).toBe('black_wins');
			expect(game_array[3].timeControlId).toBe(Classical);
			expect(game_array[3].timeControlName).toBe(Classical90p30);
			expect(game_array[3].when).toBe('2025-01-10..17:06:10:000');

			expect(game_array[4].id).toBe('0000000023');
			expect(game_array[4].white).toBe('c');
			expect(game_array[4].black).toBe('d');
			expect(game_array[4].result).toBe('white_wins');
			expect(game_array[4].timeControlId).toBe(Classical);
			expect(game_array[4].timeControlName).toBe(Classical90p30);
			expect(game_array[4].when).toBe('2025-01-10..17:06:15:000');

			expect(game_array[5].id).toBe('0000000014');
			expect(game_array[5].white).toBe('e');
			expect(game_array[5].black).toBe('f');
			expect(game_array[5].result).toBe('draw');
			expect(game_array[5].timeControlId).toBe(Classical);
			expect(game_array[5].timeControlName).toBe(Classical90p30);
			expect(game_array[5].when).toBe('2025-01-10..17:06:20:000');

			expect(game_array[6].id).toBe('0000000021');
			expect(game_array[6].white).toBe('a');
			expect(game_array[6].black).toBe('f');
			expect(game_array[6].result).toBe('draw');
			expect(game_array[6].timeControlId).toBe(Classical);
			expect(game_array[6].timeControlName).toBe(Classical90p30);
			expect(game_array[6].when).toBe('2025-01-10..17:06:25:000');

			expect(game_array[7].id).toBe('0000000013');
			expect(game_array[7].white).toBe('a');
			expect(game_array[7].black).toBe('f');
			expect(game_array[7].result).toBe('draw');
			expect(game_array[7].timeControlId).toBe(Classical);
			expect(game_array[7].timeControlName).toBe(Classical90p30);
			expect(game_array[7].when).toBe('2025-01-10..17:06:30:000');

			expect(aU.getGames(Classical).length).toBe(2);
			expect(bU.getGames(Classical).length).toBe(2);
			expect(cU.getGames(Classical).length).toBe(2);
			expect(dU.getGames(Classical).length).toBe(2);
			expect(eU.getGames(Classical).length).toBe(2);
			expect(fU.getGames(Classical).length).toBe(2);
			expect(aU.getGames(Classical).length).toBe(2);
			expect(bU.getGames(Classical).length).toBe(2);
			expect(cU.getGames(Classical).length).toBe(2);
			expect(dU.getGames(Classical).length).toBe(2);
			expect(eU.getGames(Classical).length).toBe(2);
			expect(fU.getGames(Classical).length).toBe(2);

			expect(aU.getRating(Blitz).numWonDrawnLost()).toEqual([6, 2, 2, 2]);
			expect(bU.getRating(Blitz).numWonDrawnLost()).toEqual([3, 1, 0, 2]);
			expect(cU.getRating(Blitz).numWonDrawnLost()).toEqual([3, 1, 0, 2]);
			expect(dU.getRating(Blitz).numWonDrawnLost()).toEqual([3, 2, 0, 1]);
			expect(eU.getRating(Blitz).numWonDrawnLost()).toEqual([3, 0, 3, 0]);
			expect(fU.getRating(Blitz).numWonDrawnLost()).toEqual([6, 1, 5, 0]);
			expect(aU.getRating(Classical).numWonDrawnLost()).toEqual([6, 2, 2, 2]);
			expect(bU.getRating(Classical).numWonDrawnLost()).toEqual([3, 1, 0, 2]);
			expect(cU.getRating(Classical).numWonDrawnLost()).toEqual([3, 1, 0, 2]);
			expect(dU.getRating(Classical).numWonDrawnLost()).toEqual([3, 2, 0, 1]);
			expect(eU.getRating(Classical).numWonDrawnLost()).toEqual([3, 0, 3, 0]);
			expect(fU.getRating(Classical).numWonDrawnLost()).toEqual([6, 1, 5, 0]);
		}
	});
});

describe('Before-time inverse game creation', () => {
	test('Add "Blitz" games', () => {
		const blitz_dir = EnvironmentManager.getInstance().getDirGamesTimeControl(Blitz);
		gameAddNew(
			'sample',
			u('a'),
			u('f'),
			'draw',
			Blitz,
			Blitz5p0,
			toDateMajor('2023-01-20'),
			toDateMinor('17:06:50:000')
		);
		{
			const game_array = gameArrayFromString(fs.readFileSync(path.join(blitz_dir, '2023-01-20'), 'utf8'));
			expect(game_array).not.toBeNull();
			if (isNotDefined(game_array)) {
				return;
			}
			expect(game_array.length).toBe(1);

			expect(game_array[0].id).toBe('0000000025');
			expect(game_array[0].white).toBe('a');
			expect(game_array[0].black).toBe('f');
			expect(game_array[0].result).toBe('draw');
			expect(game_array[0].timeControlId).toBe(Blitz);
			expect(game_array[0].timeControlName).toBe(Blitz5p0);
			expect(game_array[0].when).toBe('2023-01-20..17:06:50:000');

			expect(aU.getGames(Blitz).length).toBe(3);
			expect(bU.getGames(Blitz).length).toBe(2);
			expect(cU.getGames(Blitz).length).toBe(2);
			expect(dU.getGames(Blitz).length).toBe(2);
			expect(eU.getGames(Blitz).length).toBe(2);
			expect(fU.getGames(Blitz).length).toBe(3);
			expect(aU.getGames(Classical).length).toBe(2);
			expect(bU.getGames(Classical).length).toBe(2);
			expect(cU.getGames(Classical).length).toBe(2);
			expect(dU.getGames(Classical).length).toBe(2);
			expect(eU.getGames(Classical).length).toBe(2);
			expect(fU.getGames(Classical).length).toBe(2);

			expect(aU.getRating(Blitz).numWonDrawnLost()).toEqual([7, 2, 3, 2]);
			expect(bU.getRating(Blitz).numWonDrawnLost()).toEqual([3, 1, 0, 2]);
			expect(cU.getRating(Blitz).numWonDrawnLost()).toEqual([3, 1, 0, 2]);
			expect(dU.getRating(Blitz).numWonDrawnLost()).toEqual([3, 2, 0, 1]);
			expect(eU.getRating(Blitz).numWonDrawnLost()).toEqual([3, 0, 3, 0]);
			expect(fU.getRating(Blitz).numWonDrawnLost()).toEqual([7, 1, 6, 0]);
			expect(aU.getRating(Classical).numWonDrawnLost()).toEqual([6, 2, 2, 2]);
			expect(bU.getRating(Classical).numWonDrawnLost()).toEqual([3, 1, 0, 2]);
			expect(cU.getRating(Classical).numWonDrawnLost()).toEqual([3, 1, 0, 2]);
			expect(dU.getRating(Classical).numWonDrawnLost()).toEqual([3, 2, 0, 1]);
			expect(eU.getRating(Classical).numWonDrawnLost()).toEqual([3, 0, 3, 0]);
			expect(fU.getRating(Classical).numWonDrawnLost()).toEqual([6, 1, 5, 0]);
		}

		gameAddNew(
			'sample',
			u('a'),
			u('c'),
			'draw',
			Blitz,
			Blitz5p0,
			toDateMajor('2023-01-10'),
			toDateMinor('17:06:40:000')
		);
		{
			const game_array = gameArrayFromString(fs.readFileSync(path.join(blitz_dir, '2023-01-10'), 'utf8'));
			expect(game_array).not.toBeNull();
			if (isNotDefined(game_array)) {
				return;
			}
			expect(game_array.length).toBe(1);

			expect(game_array[0].id).toBe('0000000026');
			expect(game_array[0].white).toBe('a');
			expect(game_array[0].black).toBe('c');
			expect(game_array[0].result).toBe('draw');
			expect(game_array[0].timeControlId).toBe(Blitz);
			expect(game_array[0].timeControlName).toBe(Blitz5p0);
			expect(game_array[0].when).toBe('2023-01-10..17:06:40:000');

			expect(aU.getGames(Blitz).length).toBe(4);
			expect(bU.getGames(Blitz).length).toBe(2);
			expect(cU.getGames(Blitz).length).toBe(3);
			expect(dU.getGames(Blitz).length).toBe(2);
			expect(eU.getGames(Blitz).length).toBe(2);
			expect(fU.getGames(Blitz).length).toBe(3);
			expect(aU.getGames(Classical).length).toBe(2);
			expect(bU.getGames(Classical).length).toBe(2);
			expect(cU.getGames(Classical).length).toBe(2);
			expect(dU.getGames(Classical).length).toBe(2);
			expect(eU.getGames(Classical).length).toBe(2);
			expect(fU.getGames(Classical).length).toBe(2);

			expect(aU.getRating(Blitz).numWonDrawnLost()).toEqual([8, 2, 4, 2]);
			expect(bU.getRating(Blitz).numWonDrawnLost()).toEqual([3, 1, 0, 2]);
			expect(cU.getRating(Blitz).numWonDrawnLost()).toEqual([4, 1, 1, 2]);
			expect(dU.getRating(Blitz).numWonDrawnLost()).toEqual([3, 2, 0, 1]);
			expect(eU.getRating(Blitz).numWonDrawnLost()).toEqual([3, 0, 3, 0]);
			expect(fU.getRating(Blitz).numWonDrawnLost()).toEqual([7, 1, 6, 0]);
			expect(aU.getRating(Classical).numWonDrawnLost()).toEqual([6, 2, 2, 2]);
			expect(bU.getRating(Classical).numWonDrawnLost()).toEqual([3, 1, 0, 2]);
			expect(cU.getRating(Classical).numWonDrawnLost()).toEqual([3, 1, 0, 2]);
			expect(dU.getRating(Classical).numWonDrawnLost()).toEqual([3, 2, 0, 1]);
			expect(eU.getRating(Classical).numWonDrawnLost()).toEqual([3, 0, 3, 0]);
			expect(fU.getRating(Classical).numWonDrawnLost()).toEqual([6, 1, 5, 0]);
		}
	});
});

describe('Test graphs metadata before edition', () => {
	test('Check Blitz graph', () => {
		const graphs_manager = GraphsManager.getInstance();
		const g = graphs_manager.getGraph(Blitz) as Graph;
		expect(g.getDataAsWhite(a, b)).toEqual(new EdgeMetadata(2, 0, 1));
		expect(g.getDataAsWhite(a, c)).toEqual(new EdgeMetadata(0, 1, 0));
		expect(g.getDataAsWhite(a, d)).toEqual(undefined);
		expect(g.getDataAsWhite(a, e)).toEqual(undefined);
		expect(g.getDataAsWhite(a, f)).toEqual(new EdgeMetadata(0, 3, 1));

		expect(g.getDataAsWhite(b, a)).toEqual(undefined);
		expect(g.getDataAsWhite(b, c)).toEqual(undefined);
		expect(g.getDataAsWhite(b, d)).toEqual(undefined);
		expect(g.getDataAsWhite(b, e)).toEqual(undefined);
		expect(g.getDataAsWhite(b, f)).toEqual(undefined);

		expect(g.getDataAsWhite(c, a)).toEqual(undefined);
		expect(g.getDataAsWhite(c, b)).toEqual(undefined);
		expect(g.getDataAsWhite(c, d)).toEqual(new EdgeMetadata(1, 0, 2));
		expect(g.getDataAsWhite(c, e)).toEqual(undefined);
		expect(g.getDataAsWhite(c, f)).toEqual(undefined);

		expect(g.getDataAsWhite(d, a)).toEqual(undefined);
		expect(g.getDataAsWhite(d, b)).toEqual(undefined);
		expect(g.getDataAsWhite(d, c)).toEqual(undefined);
		expect(g.getDataAsWhite(d, e)).toEqual(undefined);
		expect(g.getDataAsWhite(d, f)).toEqual(undefined);

		expect(g.getDataAsWhite(e, a)).toEqual(undefined);
		expect(g.getDataAsWhite(e, b)).toEqual(undefined);
		expect(g.getDataAsWhite(e, c)).toEqual(undefined);
		expect(g.getDataAsWhite(e, d)).toEqual(undefined);
		expect(g.getDataAsWhite(e, f)).toEqual(new EdgeMetadata(0, 3, 0));

		expect(g.getDataAsWhite(f, a)).toEqual(undefined);
		expect(g.getDataAsWhite(f, b)).toEqual(undefined);
		expect(g.getDataAsWhite(f, c)).toEqual(undefined);
		expect(g.getDataAsWhite(f, d)).toEqual(undefined);
		expect(g.getDataAsWhite(f, e)).toEqual(undefined);

		expect(g.getDataAsBlack(a, b)).toEqual(undefined);
		expect(g.getDataAsBlack(a, c)).toEqual(undefined);
		expect(g.getDataAsBlack(a, d)).toEqual(undefined);
		expect(g.getDataAsBlack(a, e)).toEqual(undefined);
		expect(g.getDataAsBlack(a, f)).toEqual(undefined);

		expect(g.getDataAsBlack(b, a)).toEqual(new EdgeMetadata(1, 0, 2));
		expect(g.getDataAsBlack(b, c)).toEqual(undefined);
		expect(g.getDataAsBlack(b, d)).toEqual(undefined);
		expect(g.getDataAsBlack(b, e)).toEqual(undefined);
		expect(g.getDataAsBlack(b, f)).toEqual(undefined);

		expect(g.getDataAsBlack(c, a)).toEqual(new EdgeMetadata(0, 1, 0));
		expect(g.getDataAsBlack(c, b)).toEqual(undefined);
		expect(g.getDataAsBlack(c, d)).toEqual(undefined);
		expect(g.getDataAsBlack(c, e)).toEqual(undefined);
		expect(g.getDataAsBlack(c, f)).toEqual(undefined);

		expect(g.getDataAsBlack(d, a)).toEqual(undefined);
		expect(g.getDataAsBlack(d, b)).toEqual(undefined);
		expect(g.getDataAsBlack(d, c)).toEqual(new EdgeMetadata(2, 0, 1));
		expect(g.getDataAsBlack(d, e)).toEqual(undefined);
		expect(g.getDataAsBlack(d, f)).toEqual(undefined);

		expect(g.getDataAsBlack(e, a)).toEqual(undefined);
		expect(g.getDataAsBlack(e, b)).toEqual(undefined);
		expect(g.getDataAsBlack(e, c)).toEqual(undefined);
		expect(g.getDataAsBlack(e, d)).toEqual(undefined);
		expect(g.getDataAsBlack(e, f)).toEqual(undefined);

		expect(g.getDataAsBlack(f, a)).toEqual(new EdgeMetadata(1, 3, 0));
		expect(g.getDataAsBlack(f, b)).toEqual(undefined);
		expect(g.getDataAsBlack(f, c)).toEqual(undefined);
		expect(g.getDataAsBlack(f, d)).toEqual(undefined);
		expect(g.getDataAsBlack(f, e)).toEqual(new EdgeMetadata(0, 3, 0));
	});

	test('Check Classical graph', () => {
		const graphs_manager = GraphsManager.getInstance();
		const g = graphs_manager.getGraph(Classical) as Graph;
		expect(g.getDataAsWhite(a, b)).toEqual(new EdgeMetadata(2, 0, 1));
		expect(g.getDataAsWhite(a, c)).toEqual(undefined);
		expect(g.getDataAsWhite(a, d)).toEqual(undefined);
		expect(g.getDataAsWhite(a, e)).toEqual(undefined);
		expect(g.getDataAsWhite(a, f)).toEqual(new EdgeMetadata(0, 2, 1));

		expect(g.getDataAsWhite(b, a)).toEqual(undefined);
		expect(g.getDataAsWhite(b, c)).toEqual(undefined);
		expect(g.getDataAsWhite(b, d)).toEqual(undefined);
		expect(g.getDataAsWhite(b, e)).toEqual(undefined);
		expect(g.getDataAsWhite(b, f)).toEqual(undefined);

		expect(g.getDataAsWhite(c, a)).toEqual(undefined);
		expect(g.getDataAsWhite(c, b)).toEqual(undefined);
		expect(g.getDataAsWhite(c, d)).toEqual(new EdgeMetadata(1, 0, 2));
		expect(g.getDataAsWhite(c, e)).toEqual(undefined);
		expect(g.getDataAsWhite(c, f)).toEqual(undefined);

		expect(g.getDataAsWhite(d, a)).toEqual(undefined);
		expect(g.getDataAsWhite(d, b)).toEqual(undefined);
		expect(g.getDataAsWhite(d, c)).toEqual(undefined);
		expect(g.getDataAsWhite(d, e)).toEqual(undefined);
		expect(g.getDataAsWhite(d, f)).toEqual(undefined);

		expect(g.getDataAsWhite(e, a)).toEqual(undefined);
		expect(g.getDataAsWhite(e, b)).toEqual(undefined);
		expect(g.getDataAsWhite(e, c)).toEqual(undefined);
		expect(g.getDataAsWhite(e, d)).toEqual(undefined);
		expect(g.getDataAsWhite(e, f)).toEqual(new EdgeMetadata(0, 3, 0));

		expect(g.getDataAsWhite(f, a)).toEqual(undefined);
		expect(g.getDataAsWhite(f, b)).toEqual(undefined);
		expect(g.getDataAsWhite(f, c)).toEqual(undefined);
		expect(g.getDataAsWhite(f, d)).toEqual(undefined);
		expect(g.getDataAsWhite(f, e)).toEqual(undefined);

		expect(g.getDataAsBlack(a, b)).toEqual(undefined);
		expect(g.getDataAsBlack(a, c)).toEqual(undefined);
		expect(g.getDataAsBlack(a, d)).toEqual(undefined);
		expect(g.getDataAsBlack(a, e)).toEqual(undefined);
		expect(g.getDataAsBlack(a, f)).toEqual(undefined);

		expect(g.getDataAsBlack(b, a)).toEqual(new EdgeMetadata(1, 0, 2));
		expect(g.getDataAsBlack(b, c)).toEqual(undefined);
		expect(g.getDataAsBlack(b, d)).toEqual(undefined);
		expect(g.getDataAsBlack(b, e)).toEqual(undefined);
		expect(g.getDataAsBlack(b, f)).toEqual(undefined);

		expect(g.getDataAsBlack(c, a)).toEqual(undefined);
		expect(g.getDataAsBlack(c, b)).toEqual(undefined);
		expect(g.getDataAsBlack(c, d)).toEqual(undefined);
		expect(g.getDataAsBlack(c, e)).toEqual(undefined);
		expect(g.getDataAsBlack(c, f)).toEqual(undefined);

		expect(g.getDataAsBlack(d, a)).toEqual(undefined);
		expect(g.getDataAsBlack(d, b)).toEqual(undefined);
		expect(g.getDataAsBlack(d, c)).toEqual(new EdgeMetadata(2, 0, 1));
		expect(g.getDataAsBlack(d, e)).toEqual(undefined);
		expect(g.getDataAsBlack(d, f)).toEqual(undefined);

		expect(g.getDataAsBlack(e, a)).toEqual(undefined);
		expect(g.getDataAsBlack(e, b)).toEqual(undefined);
		expect(g.getDataAsBlack(e, c)).toEqual(undefined);
		expect(g.getDataAsBlack(e, d)).toEqual(undefined);
		expect(g.getDataAsBlack(e, f)).toEqual(undefined);

		expect(g.getDataAsBlack(f, a)).toEqual(new EdgeMetadata(1, 2, 0));
		expect(g.getDataAsBlack(f, b)).toEqual(undefined);
		expect(g.getDataAsBlack(f, c)).toEqual(undefined);
		expect(g.getDataAsBlack(f, d)).toEqual(undefined);
		expect(g.getDataAsBlack(f, e)).toEqual(new EdgeMetadata(0, 3, 0));
	});
});

const id0000000001 = toGameId('0000000001');
const id0000000002 = toGameId('0000000002');
const id0000000008 = toGameId('0000000008');
const id0000000013 = toGameId('0000000013');
const id0000000015 = toGameId('0000000015');
const id0000000020 = toGameId('0000000020');
const id0000000021 = toGameId('0000000021');
const id1200003433 = toGameId('1200003433');
const id1288883433 = toGameId('1288883433');
const id1299999433 = toGameId('1299999433');

describe('Edition of game results', () => {
	test('Edit some "Blitz" games', () => {
		gameEditResult(id0000000001, 'black_wins');

		expect(aU.getRating(Blitz).numWonDrawnLost()).toEqual([8, 1, 4, 3]);
		expect(bU.getRating(Blitz).numWonDrawnLost()).toEqual([3, 2, 0, 1]);
		expect(cU.getRating(Blitz).numWonDrawnLost()).toEqual([4, 1, 1, 2]);
		expect(dU.getRating(Blitz).numWonDrawnLost()).toEqual([3, 2, 0, 1]);
		expect(eU.getRating(Blitz).numWonDrawnLost()).toEqual([3, 0, 3, 0]);
		expect(fU.getRating(Blitz).numWonDrawnLost()).toEqual([7, 1, 6, 0]);
		expect(aU.getRating(Classical).numWonDrawnLost()).toEqual([6, 2, 2, 2]);
		expect(bU.getRating(Classical).numWonDrawnLost()).toEqual([3, 1, 0, 2]);
		expect(cU.getRating(Classical).numWonDrawnLost()).toEqual([3, 1, 0, 2]);
		expect(dU.getRating(Classical).numWonDrawnLost()).toEqual([3, 2, 0, 1]);
		expect(eU.getRating(Classical).numWonDrawnLost()).toEqual([3, 0, 3, 0]);
		expect(fU.getRating(Classical).numWonDrawnLost()).toEqual([6, 1, 5, 0]);

		gameEditResult(id0000000001, 'draw');

		expect(aU.getRating(Blitz).numWonDrawnLost()).toEqual([8, 1, 5, 2]);
		expect(bU.getRating(Blitz).numWonDrawnLost()).toEqual([3, 1, 1, 1]);
		expect(cU.getRating(Blitz).numWonDrawnLost()).toEqual([4, 1, 1, 2]);
		expect(dU.getRating(Blitz).numWonDrawnLost()).toEqual([3, 2, 0, 1]);
		expect(eU.getRating(Blitz).numWonDrawnLost()).toEqual([3, 0, 3, 0]);
		expect(fU.getRating(Blitz).numWonDrawnLost()).toEqual([7, 1, 6, 0]);
		expect(aU.getRating(Classical).numWonDrawnLost()).toEqual([6, 2, 2, 2]);
		expect(bU.getRating(Classical).numWonDrawnLost()).toEqual([3, 1, 0, 2]);
		expect(cU.getRating(Classical).numWonDrawnLost()).toEqual([3, 1, 0, 2]);
		expect(dU.getRating(Classical).numWonDrawnLost()).toEqual([3, 2, 0, 1]);
		expect(eU.getRating(Classical).numWonDrawnLost()).toEqual([3, 0, 3, 0]);
		expect(fU.getRating(Classical).numWonDrawnLost()).toEqual([6, 1, 5, 0]);

		gameEditResult(id0000000001, 'draw');

		expect(aU.getRating(Blitz).numWonDrawnLost()).toEqual([8, 1, 5, 2]);
		expect(bU.getRating(Blitz).numWonDrawnLost()).toEqual([3, 1, 1, 1]);
		expect(cU.getRating(Blitz).numWonDrawnLost()).toEqual([4, 1, 1, 2]);
		expect(dU.getRating(Blitz).numWonDrawnLost()).toEqual([3, 2, 0, 1]);
		expect(eU.getRating(Blitz).numWonDrawnLost()).toEqual([3, 0, 3, 0]);
		expect(fU.getRating(Blitz).numWonDrawnLost()).toEqual([7, 1, 6, 0]);
		expect(aU.getRating(Classical).numWonDrawnLost()).toEqual([6, 2, 2, 2]);
		expect(bU.getRating(Classical).numWonDrawnLost()).toEqual([3, 1, 0, 2]);
		expect(cU.getRating(Classical).numWonDrawnLost()).toEqual([3, 1, 0, 2]);
		expect(dU.getRating(Classical).numWonDrawnLost()).toEqual([3, 2, 0, 1]);
		expect(eU.getRating(Classical).numWonDrawnLost()).toEqual([3, 0, 3, 0]);
		expect(fU.getRating(Classical).numWonDrawnLost()).toEqual([6, 1, 5, 0]);

		gameEditResult(id0000000002, 'draw');

		expect(aU.getRating(Blitz).numWonDrawnLost()).toEqual([8, 1, 5, 2]);
		expect(bU.getRating(Blitz).numWonDrawnLost()).toEqual([3, 1, 1, 1]);
		expect(cU.getRating(Blitz).numWonDrawnLost()).toEqual([4, 1, 2, 1]);
		expect(dU.getRating(Blitz).numWonDrawnLost()).toEqual([3, 1, 1, 1]);
		expect(eU.getRating(Blitz).numWonDrawnLost()).toEqual([3, 0, 3, 0]);
		expect(fU.getRating(Blitz).numWonDrawnLost()).toEqual([7, 1, 6, 0]);
		expect(aU.getRating(Classical).numWonDrawnLost()).toEqual([6, 2, 2, 2]);
		expect(bU.getRating(Classical).numWonDrawnLost()).toEqual([3, 1, 0, 2]);
		expect(cU.getRating(Classical).numWonDrawnLost()).toEqual([3, 1, 0, 2]);
		expect(dU.getRating(Classical).numWonDrawnLost()).toEqual([3, 2, 0, 1]);
		expect(eU.getRating(Classical).numWonDrawnLost()).toEqual([3, 0, 3, 0]);
		expect(fU.getRating(Classical).numWonDrawnLost()).toEqual([6, 1, 5, 0]);
	});

	test('Edit some "Classical" games', () => {
		gameEditResult(id0000000013, 'black_wins');

		expect(aU.getRating(Blitz).numWonDrawnLost()).toEqual([8, 1, 5, 2]);
		expect(bU.getRating(Blitz).numWonDrawnLost()).toEqual([3, 1, 1, 1]);
		expect(cU.getRating(Blitz).numWonDrawnLost()).toEqual([4, 1, 2, 1]);
		expect(dU.getRating(Blitz).numWonDrawnLost()).toEqual([3, 1, 1, 1]);
		expect(eU.getRating(Blitz).numWonDrawnLost()).toEqual([3, 0, 3, 0]);
		expect(fU.getRating(Blitz).numWonDrawnLost()).toEqual([7, 1, 6, 0]);
		expect(aU.getRating(Classical).numWonDrawnLost()).toEqual([6, 2, 1, 3]);
		expect(bU.getRating(Classical).numWonDrawnLost()).toEqual([3, 1, 0, 2]);
		expect(cU.getRating(Classical).numWonDrawnLost()).toEqual([3, 1, 0, 2]);
		expect(dU.getRating(Classical).numWonDrawnLost()).toEqual([3, 2, 0, 1]);
		expect(eU.getRating(Classical).numWonDrawnLost()).toEqual([3, 0, 3, 0]);
		expect(fU.getRating(Classical).numWonDrawnLost()).toEqual([6, 2, 4, 0]);

		gameEditResult(id0000000013, 'white_wins');

		expect(aU.getRating(Blitz).numWonDrawnLost()).toEqual([8, 1, 5, 2]);
		expect(bU.getRating(Blitz).numWonDrawnLost()).toEqual([3, 1, 1, 1]);
		expect(cU.getRating(Blitz).numWonDrawnLost()).toEqual([4, 1, 2, 1]);
		expect(dU.getRating(Blitz).numWonDrawnLost()).toEqual([3, 1, 1, 1]);
		expect(eU.getRating(Blitz).numWonDrawnLost()).toEqual([3, 0, 3, 0]);
		expect(fU.getRating(Blitz).numWonDrawnLost()).toEqual([7, 1, 6, 0]);
		expect(aU.getRating(Classical).numWonDrawnLost()).toEqual([6, 3, 1, 2]);
		expect(bU.getRating(Classical).numWonDrawnLost()).toEqual([3, 1, 0, 2]);
		expect(cU.getRating(Classical).numWonDrawnLost()).toEqual([3, 1, 0, 2]);
		expect(dU.getRating(Classical).numWonDrawnLost()).toEqual([3, 2, 0, 1]);
		expect(eU.getRating(Classical).numWonDrawnLost()).toEqual([3, 0, 3, 0]);
		expect(fU.getRating(Classical).numWonDrawnLost()).toEqual([6, 1, 4, 1]);

		gameEditResult(id0000000013, 'draw');

		expect(aU.getRating(Blitz).numWonDrawnLost()).toEqual([8, 1, 5, 2]);
		expect(bU.getRating(Blitz).numWonDrawnLost()).toEqual([3, 1, 1, 1]);
		expect(cU.getRating(Blitz).numWonDrawnLost()).toEqual([4, 1, 2, 1]);
		expect(dU.getRating(Blitz).numWonDrawnLost()).toEqual([3, 1, 1, 1]);
		expect(eU.getRating(Blitz).numWonDrawnLost()).toEqual([3, 0, 3, 0]);
		expect(fU.getRating(Blitz).numWonDrawnLost()).toEqual([7, 1, 6, 0]);
		expect(aU.getRating(Classical).numWonDrawnLost()).toEqual([6, 2, 2, 2]);
		expect(bU.getRating(Classical).numWonDrawnLost()).toEqual([3, 1, 0, 2]);
		expect(cU.getRating(Classical).numWonDrawnLost()).toEqual([3, 1, 0, 2]);
		expect(dU.getRating(Classical).numWonDrawnLost()).toEqual([3, 2, 0, 1]);
		expect(eU.getRating(Classical).numWonDrawnLost()).toEqual([3, 0, 3, 0]);
		expect(fU.getRating(Classical).numWonDrawnLost()).toEqual([6, 1, 5, 0]);

		gameEditResult(id0000000021, 'black_wins');

		expect(aU.getRating(Blitz).numWonDrawnLost()).toEqual([8, 1, 5, 2]);
		expect(bU.getRating(Blitz).numWonDrawnLost()).toEqual([3, 1, 1, 1]);
		expect(cU.getRating(Blitz).numWonDrawnLost()).toEqual([4, 1, 2, 1]);
		expect(dU.getRating(Blitz).numWonDrawnLost()).toEqual([3, 1, 1, 1]);
		expect(eU.getRating(Blitz).numWonDrawnLost()).toEqual([3, 0, 3, 0]);
		expect(fU.getRating(Blitz).numWonDrawnLost()).toEqual([7, 1, 6, 0]);
		expect(aU.getRating(Classical).numWonDrawnLost()).toEqual([6, 2, 1, 3]);
		expect(bU.getRating(Classical).numWonDrawnLost()).toEqual([3, 1, 0, 2]);
		expect(cU.getRating(Classical).numWonDrawnLost()).toEqual([3, 1, 0, 2]);
		expect(dU.getRating(Classical).numWonDrawnLost()).toEqual([3, 2, 0, 1]);
		expect(eU.getRating(Classical).numWonDrawnLost()).toEqual([3, 0, 3, 0]);
		expect(fU.getRating(Classical).numWonDrawnLost()).toEqual([6, 2, 4, 0]);
	});
});

const N = 2;
for (let i = 0; i < N; ++i) {
	describe(`(${i}) Test graphs`, () => {
		test('Check Blitz graph', () => {
			const graphs_manager = GraphsManager.getInstance();
			const g = graphs_manager.getGraph(Blitz) as Graph;
			expect(g.getBlackOpponents(a)).toEqual(['b', 'c', 'f']);
			expect(g.getBlackOpponents(b)).toEqual([]);
			expect(g.getBlackOpponents(c)).toEqual(['d']);
			expect(g.getBlackOpponents(d)).toEqual([]);
			expect(g.getBlackOpponents(e)).toEqual(['f']);
			expect(g.getBlackOpponents(f)).toEqual([]);

			expect(g.getWhiteOpponents(a)).toEqual([]);
			expect(g.getWhiteOpponents(b)).toEqual(['a']);
			expect(g.getWhiteOpponents(c)).toEqual(['a']);
			expect(g.getWhiteOpponents(d)).toEqual(['c']);
			expect(g.getWhiteOpponents(e)).toEqual([]);
			expect(g.getWhiteOpponents(f)).toEqual(['a', 'e']);
		});

		test('Check Classical graph', () => {
			const graphs_manager = GraphsManager.getInstance();
			const g = graphs_manager.getGraph(Classical) as Graph;
			expect(g.getBlackOpponents(a)).toEqual(['b', 'f']);
			expect(g.getBlackOpponents(b)).toEqual([]);
			expect(g.getBlackOpponents(c)).toEqual(['d']);
			expect(g.getBlackOpponents(d)).toEqual([]);
			expect(g.getBlackOpponents(e)).toEqual(['f']);
			expect(g.getBlackOpponents(f)).toEqual([]);

			expect(g.getWhiteOpponents(a)).toEqual([]);
			expect(g.getWhiteOpponents(b)).toEqual(['a']);
			expect(g.getWhiteOpponents(c)).toEqual([]);
			expect(g.getWhiteOpponents(d)).toEqual(['c']);
			expect(g.getWhiteOpponents(e)).toEqual([]);
			expect(g.getWhiteOpponents(f)).toEqual(['a', 'e']);
		});
	});

	describe(`(${i}) Test graphs metadata after edition`, () => {
		test('Check Blitz graph', () => {
			const graphs_manager = GraphsManager.getInstance();
			const g = graphs_manager.getGraph(Blitz) as Graph;
			expect(g.getDataAsWhite(a, b)).toEqual(new EdgeMetadata(1, 1, 1));
			expect(g.getDataAsWhite(a, c)).toEqual(new EdgeMetadata(0, 1, 0));
			expect(g.getDataAsWhite(a, d)).toEqual(undefined);
			expect(g.getDataAsWhite(a, e)).toEqual(undefined);
			expect(g.getDataAsWhite(a, f)).toEqual(new EdgeMetadata(0, 3, 1));

			expect(g.getDataAsWhite(b, a)).toEqual(undefined);
			expect(g.getDataAsWhite(b, c)).toEqual(undefined);
			expect(g.getDataAsWhite(b, d)).toEqual(undefined);
			expect(g.getDataAsWhite(b, e)).toEqual(undefined);
			expect(g.getDataAsWhite(b, f)).toEqual(undefined);

			expect(g.getDataAsWhite(c, a)).toEqual(undefined);
			expect(g.getDataAsWhite(c, b)).toEqual(undefined);
			expect(g.getDataAsWhite(c, d)).toEqual(new EdgeMetadata(1, 1, 1));
			expect(g.getDataAsWhite(c, e)).toEqual(undefined);
			expect(g.getDataAsWhite(c, f)).toEqual(undefined);

			expect(g.getDataAsWhite(d, a)).toEqual(undefined);
			expect(g.getDataAsWhite(d, b)).toEqual(undefined);
			expect(g.getDataAsWhite(d, c)).toEqual(undefined);
			expect(g.getDataAsWhite(d, e)).toEqual(undefined);
			expect(g.getDataAsWhite(d, f)).toEqual(undefined);

			expect(g.getDataAsWhite(e, a)).toEqual(undefined);
			expect(g.getDataAsWhite(e, b)).toEqual(undefined);
			expect(g.getDataAsWhite(e, c)).toEqual(undefined);
			expect(g.getDataAsWhite(e, d)).toEqual(undefined);
			expect(g.getDataAsWhite(e, f)).toEqual(new EdgeMetadata(0, 3, 0));

			expect(g.getDataAsWhite(f, a)).toEqual(undefined);
			expect(g.getDataAsWhite(f, b)).toEqual(undefined);
			expect(g.getDataAsWhite(f, c)).toEqual(undefined);
			expect(g.getDataAsWhite(f, d)).toEqual(undefined);
			expect(g.getDataAsWhite(f, e)).toEqual(undefined);

			expect(g.getDataAsBlack(a, b)).toEqual(undefined);
			expect(g.getDataAsBlack(a, c)).toEqual(undefined);
			expect(g.getDataAsBlack(a, d)).toEqual(undefined);
			expect(g.getDataAsBlack(a, e)).toEqual(undefined);
			expect(g.getDataAsBlack(a, f)).toEqual(undefined);

			expect(g.getDataAsBlack(b, a)).toEqual(new EdgeMetadata(1, 1, 1));
			expect(g.getDataAsBlack(b, c)).toEqual(undefined);
			expect(g.getDataAsBlack(b, d)).toEqual(undefined);
			expect(g.getDataAsBlack(b, e)).toEqual(undefined);
			expect(g.getDataAsBlack(b, f)).toEqual(undefined);

			expect(g.getDataAsBlack(c, a)).toEqual(new EdgeMetadata(0, 1, 0));
			expect(g.getDataAsBlack(c, b)).toEqual(undefined);
			expect(g.getDataAsBlack(c, d)).toEqual(undefined);
			expect(g.getDataAsBlack(c, e)).toEqual(undefined);
			expect(g.getDataAsBlack(c, f)).toEqual(undefined);

			expect(g.getDataAsBlack(d, a)).toEqual(undefined);
			expect(g.getDataAsBlack(d, b)).toEqual(undefined);
			expect(g.getDataAsBlack(d, c)).toEqual(new EdgeMetadata(1, 1, 1));
			expect(g.getDataAsBlack(d, e)).toEqual(undefined);
			expect(g.getDataAsBlack(d, f)).toEqual(undefined);

			expect(g.getDataAsBlack(e, a)).toEqual(undefined);
			expect(g.getDataAsBlack(e, b)).toEqual(undefined);
			expect(g.getDataAsBlack(e, c)).toEqual(undefined);
			expect(g.getDataAsBlack(e, d)).toEqual(undefined);
			expect(g.getDataAsBlack(e, f)).toEqual(undefined);

			expect(g.getDataAsBlack(f, a)).toEqual(new EdgeMetadata(1, 3, 0));
			expect(g.getDataAsBlack(f, b)).toEqual(undefined);
			expect(g.getDataAsBlack(f, c)).toEqual(undefined);
			expect(g.getDataAsBlack(f, d)).toEqual(undefined);
			expect(g.getDataAsBlack(f, e)).toEqual(new EdgeMetadata(0, 3, 0));
		});

		test('Check Classical graph', () => {
			const graphs_manager = GraphsManager.getInstance();
			const g = graphs_manager.getGraph(Classical) as Graph;
			expect(g.getDataAsWhite(a, b)).toEqual(new EdgeMetadata(2, 0, 1));
			expect(g.getDataAsWhite(a, c)).toEqual(undefined);
			expect(g.getDataAsWhite(a, d)).toEqual(undefined);
			expect(g.getDataAsWhite(a, e)).toEqual(undefined);
			expect(g.getDataAsWhite(a, f)).toEqual(new EdgeMetadata(0, 1, 2));

			expect(g.getDataAsWhite(b, a)).toEqual(undefined);
			expect(g.getDataAsWhite(b, c)).toEqual(undefined);
			expect(g.getDataAsWhite(b, d)).toEqual(undefined);
			expect(g.getDataAsWhite(b, e)).toEqual(undefined);
			expect(g.getDataAsWhite(b, f)).toEqual(undefined);

			expect(g.getDataAsWhite(c, a)).toEqual(undefined);
			expect(g.getDataAsWhite(c, b)).toEqual(undefined);
			expect(g.getDataAsWhite(c, d)).toEqual(new EdgeMetadata(1, 0, 2));
			expect(g.getDataAsWhite(c, e)).toEqual(undefined);
			expect(g.getDataAsWhite(c, f)).toEqual(undefined);

			expect(g.getDataAsWhite(d, a)).toEqual(undefined);
			expect(g.getDataAsWhite(d, b)).toEqual(undefined);
			expect(g.getDataAsWhite(d, c)).toEqual(undefined);
			expect(g.getDataAsWhite(d, e)).toEqual(undefined);
			expect(g.getDataAsWhite(d, f)).toEqual(undefined);

			expect(g.getDataAsWhite(e, a)).toEqual(undefined);
			expect(g.getDataAsWhite(e, b)).toEqual(undefined);
			expect(g.getDataAsWhite(e, c)).toEqual(undefined);
			expect(g.getDataAsWhite(e, d)).toEqual(undefined);
			expect(g.getDataAsWhite(e, f)).toEqual(new EdgeMetadata(0, 3, 0));

			expect(g.getDataAsWhite(f, a)).toEqual(undefined);
			expect(g.getDataAsWhite(f, b)).toEqual(undefined);
			expect(g.getDataAsWhite(f, c)).toEqual(undefined);
			expect(g.getDataAsWhite(f, d)).toEqual(undefined);
			expect(g.getDataAsWhite(f, e)).toEqual(undefined);

			expect(g.getDataAsBlack(a, b)).toEqual(undefined);
			expect(g.getDataAsBlack(a, c)).toEqual(undefined);
			expect(g.getDataAsBlack(a, d)).toEqual(undefined);
			expect(g.getDataAsBlack(a, e)).toEqual(undefined);
			expect(g.getDataAsBlack(a, f)).toEqual(undefined);

			expect(g.getDataAsBlack(b, a)).toEqual(new EdgeMetadata(1, 0, 2));
			expect(g.getDataAsBlack(b, c)).toEqual(undefined);
			expect(g.getDataAsBlack(b, d)).toEqual(undefined);
			expect(g.getDataAsBlack(b, e)).toEqual(undefined);
			expect(g.getDataAsBlack(b, f)).toEqual(undefined);

			expect(g.getDataAsBlack(c, a)).toEqual(undefined);
			expect(g.getDataAsBlack(c, b)).toEqual(undefined);
			expect(g.getDataAsBlack(c, d)).toEqual(undefined);
			expect(g.getDataAsBlack(c, e)).toEqual(undefined);
			expect(g.getDataAsBlack(c, f)).toEqual(undefined);

			expect(g.getDataAsBlack(d, a)).toEqual(undefined);
			expect(g.getDataAsBlack(d, b)).toEqual(undefined);
			expect(g.getDataAsBlack(d, c)).toEqual(new EdgeMetadata(2, 0, 1));
			expect(g.getDataAsBlack(d, e)).toEqual(undefined);
			expect(g.getDataAsBlack(d, f)).toEqual(undefined);

			expect(g.getDataAsBlack(e, a)).toEqual(undefined);
			expect(g.getDataAsBlack(e, b)).toEqual(undefined);
			expect(g.getDataAsBlack(e, c)).toEqual(undefined);
			expect(g.getDataAsBlack(e, d)).toEqual(undefined);
			expect(g.getDataAsBlack(e, f)).toEqual(undefined);

			expect(g.getDataAsBlack(f, a)).toEqual(new EdgeMetadata(2, 1, 0));
			expect(g.getDataAsBlack(f, b)).toEqual(undefined);
			expect(g.getDataAsBlack(f, c)).toEqual(undefined);
			expect(g.getDataAsBlack(f, d)).toEqual(undefined);
			expect(g.getDataAsBlack(f, e)).toEqual(new EdgeMetadata(0, 3, 0));
		});
	});

	describe(`(${i}) Look for a game`, () => {
		test('"Blitz" games', () => {
			{
				const _game = gameFindById(id0000000001);
				expect(_game).not.toBe(undefined);
				const game = _game as Game;
				expect(game.id).toEqual('0000000001');
				expect(game.white).toEqual('a');
				expect(game.black).toEqual('b');
				expect(game.result).toEqual('draw');
				expect(game.timeControlId).toEqual(Blitz);
				expect(game.timeControlName).toEqual(Blitz5p3);
			}

			{
				const _game = gameFindById(id0000000002);
				expect(_game).not.toBe(undefined);
				const game = _game as Game;
				expect(game.id).toEqual('0000000002');
				expect(game.white).toEqual('c');
				expect(game.black).toEqual('d');
				expect(game.result).toEqual('draw');
				expect(game.timeControlId).toEqual(Blitz);
				expect(game.timeControlName).toEqual(Blitz5p3);
			}

			{
				const _game = gameFindById(id0000000020);
				expect(_game).not.toBe(undefined);
				const game = _game as Game;
				expect(game.id).toEqual('0000000020');
				expect(game.white).toEqual('a');
				expect(game.black).toEqual('b');
				expect(game.result).toEqual('black_wins');
				expect(game.timeControlId).toEqual(Blitz);
				expect(game.timeControlName).toEqual(Blitz5p3);
			}
		});

		test('"Classical" games', () => {
			{
				const _game = gameFindById(id0000000015);
				expect(_game).not.toBe(undefined);
				const game = _game as Game;
				expect(game.id).toEqual('0000000015');
				expect(game.white).toEqual('c');
				expect(game.black).toEqual('d');
				expect(game.result).toEqual('black_wins');
				expect(game.timeControlId).toEqual(Classical);
				expect(game.timeControlName).toEqual(Classical90p30);
			}

			{
				const _game = gameFindById(id0000000021);
				expect(_game).not.toBe(undefined);
				const game = _game as Game;
				expect(game.id).toEqual('0000000021');
				expect(game.white).toEqual('a');
				expect(game.black).toEqual('f');
				expect(game.result).toEqual('black_wins');
				expect(game.timeControlId).toEqual(Classical);
				expect(game.timeControlName).toEqual(Classical90p30);
			}

			{
				const _game = gameFindById(id0000000008);
				expect(_game).not.toBe(undefined);
				const game = _game as Game;
				expect(game.id).toEqual('0000000008');
				expect(game.white).toEqual('a');
				expect(game.black).toEqual('f');
				expect(game.result).toEqual('black_wins');
				expect(game.timeControlId).toEqual(Classical);
				expect(game.timeControlName).toEqual(Classical90p30);
			}
		});

		test('Nonexistent games', () => {
			{
				const _game = gameFindById(id1200003433);
				expect(_game).toBe(undefined);
			}

			{
				const _game = gameFindById(id1288883433);
				expect(_game).toBe(undefined);
			}

			{
				const _game = gameFindById(id1299999433);
				expect(_game).toBe(undefined);
			}
		});
	});

	describe(`(${i}) Check all games are sorted by date`, () => {
		test(Blitz, () => {
			let all_games: Game[] = [];
			const game_dir = EnvironmentManager.getInstance().getDirGamesTimeControl(Blitz);
			let games_iter = new GamesIterator(game_dir);
			while (!games_iter.endRecordList()) {
				all_games = all_games.concat(games_iter.getCurrentGameArray());
				games_iter.nextRecord();
			}

			expect(all_games.length).toBe(14);
			for (let i = 1; i < all_games.length; ++i) {
				const gi1 = all_games[i - 1];
				const gi = all_games[i];
				expect(gi1.when < gi.when).toBe(true);
			}
		});

		test(Classical, () => {
			let all_games: Game[] = [];
			const game_dir = EnvironmentManager.getInstance().getDirGamesTimeControl(Classical);
			let games_iter = new GamesIterator(game_dir);
			while (!games_iter.endRecordList()) {
				all_games = all_games.concat(games_iter.getCurrentGameArray());
				games_iter.nextRecord();
			}

			expect(all_games.length).toBe(12);
			for (let i = 1; i < all_games.length; ++i) {
				const gi1 = all_games[i - 1];
				const gi = all_games[i];
				expect(gi1.when < gi.when).toBe(true);
			}
		});
	});

	describe(`(${i}) Check all games are located where they should be`, () => {
		test(Blitz, () => {
			const game_dir = EnvironmentManager.getInstance().getDirGamesTimeControl(Blitz);
			let games_iter = new GamesIterator(game_dir);
			while (!games_iter.endRecordList()) {
				let current_games = games_iter.getCurrentGameArray();
				const current_record = games_iter.getCurrentRecordName();

				for (let i = 0; i < current_games.length; ++i) {
					const gi = current_games[i];
					expect(gi.timeControlId).toEqual(Blitz);
					expect(dateFullToMajor(gi.when)).toEqual(current_record);
				}
				games_iter.nextRecord();
			}
		});

		test(Classical, () => {
			const game_dir = EnvironmentManager.getInstance().getDirGamesTimeControl(Classical);
			let games_iter = new GamesIterator(game_dir);
			while (!games_iter.endRecordList()) {
				let current_games = games_iter.getCurrentGameArray();
				const current_record = games_iter.getCurrentRecordName();

				for (let i = 0; i < current_games.length; ++i) {
					const gi = current_games[i];
					expect(gi.timeControlId).toEqual(Classical);
					expect(dateFullToMajor(gi.when)).toEqual(current_record);
				}
				games_iter.nextRecord();
			}
		});
	});

	describe(`(${i}) Recalculation of ratings`, () => {
		let blitz: Game[] = [];
		let classical: Game[] = [];

		test('Read Blitz', () => {
			const game_dir = EnvironmentManager.getInstance().getDirGamesTimeControl(Blitz);
			let games_iter = new GamesIterator(game_dir);
			while (!games_iter.endRecordList()) {
				blitz = blitz.concat(games_iter.getCurrentGameArray());
				games_iter.nextRecord();
			}
		});
		test('Read Classical', () => {
			const game_dir = EnvironmentManager.getInstance().getDirGamesTimeControl(Classical);
			let games_iter = new GamesIterator(game_dir);
			while (!games_iter.endRecordList()) {
				classical = classical.concat(games_iter.getCurrentGameArray());
				games_iter.nextRecord();
			}
		});

		test('Recalculate', () => {
			recalculateAllRatings();
		});

		test('Read Blitz and compare', () => {
			let all_games: Game[] = [];
			const game_dir = EnvironmentManager.getInstance().getDirGamesTimeControl(Blitz);
			let games_iter = new GamesIterator(game_dir);
			while (!games_iter.endRecordList()) {
				all_games = all_games.concat(games_iter.getCurrentGameArray());
				games_iter.nextRecord();
			}
			expect(all_games.length).toEqual(blitz.length);
			for (let i = 0; i < all_games.length; ++i) {
				expect(all_games[i]).toEqual(blitz[i]);
			}
		});
		test('Read Classical and compare', () => {
			let all_games: Game[] = [];
			const game_dir = EnvironmentManager.getInstance().getDirGamesTimeControl(Classical);
			let games_iter = new GamesIterator(game_dir);
			while (!games_iter.endRecordList()) {
				all_games = all_games.concat(games_iter.getCurrentGameArray());
				games_iter.nextRecord();
			}
			expect(all_games.length).toEqual(classical.length);
			for (let i = 0; i < all_games.length; ++i) {
				expect(all_games[i]).toEqual(classical[i]);
			}
		});
	});

	describe(`(${i}) Recalculation of graphs`, () => {
		let blitz: Graph | null = null;
		let classical: Graph | null = null;

		test('Read Blitz', () => {
			const graph_dir = EnvironmentManager.getInstance().getDirGraphsTimeControl(Blitz);
			blitz = graphFromString(graph_dir);
			expect(blitz).not.toBeNull();
			if (isNotDefined(blitz)) {
				return;
			}
		});
		test('Read Classical', () => {
			const graph_dir = EnvironmentManager.getInstance().getDirGraphsTimeControl(Classical);
			classical = graphFromString(graph_dir);
			expect(classical).not.toBeNull();
			if (isNotDefined(classical)) {
				return;
			}
		});

		test('Recalculate', () => {
			recalculateAllGraphs();
		});

		test('Read Blitz and compare', () => {
			const graph_dir = EnvironmentManager.getInstance().getDirGraphsTimeControl(Blitz);
			const blitz2 = graphFromString(graph_dir);
			expect(blitz).toEqual(blitz2);
		});
		test('Read Classical and compare', () => {
			const graph_dir = EnvironmentManager.getInstance().getDirGraphsTimeControl(Classical);
			const classical2 = graphFromString(graph_dir);
			expect(classical).toEqual(classical2);
		});
	});

	if (i < N - 1) {
		describe(`(${i}) Turn the server off and on again`, () => {
			test('Clear the server memory', () => {
				expect(() => clearServer()).not.toThrow();
			});
			test('Reload server data', () => {
				expect(() => serverInitFromData('tests/webpage', configuration)).not.toThrow();
			});
		});
	}
}
