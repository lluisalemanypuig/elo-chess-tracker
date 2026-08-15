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

import { gameAddNew, gameDelete } from '@server/managers/games';
import { serverInitFromData } from '@server/managers/memory/initialization';
import { userAddNew } from '@server/managers/users';
import { runCommand, TestError } from '@tests';
import { User } from '@server/models/user';
import { GamesManager } from '@server/managers/games-manager';
import { EnvironmentManager } from '@server/managers/environment-manager';
import { EdgeMetadata } from '@server/models/graph/edge-metadata';
import { GraphsManager } from '@server/managers/graphs-manager';
import { Graph } from '@server/models/graph/graph';
import { Configuration } from '@server/models/configuration/configuration';
import { toTimeControlId, toTimeControlName } from '@common/models/time-control';
import { toDateMajor, toDateMinor } from '@common/utils/time';
import { UsersManager } from '@server/managers/users-manager';
import { isNotDefined } from '@common/utils/is-defined';
import { toPlayerPrivateId } from '@common/models/player-id';
import { toUserGivenName } from '@common/models/user-given-name';
import { toGameId } from '@common/models/game-id';

const Classical = toTimeControlId('Classical');
const Classical90p30 = toTimeControlName('Classical (90 + 30)');

const Rapid = toTimeControlId('Rapid');
const Rapid12p5 = toTimeControlName('Rapid (12 + 5)');
const Rapid10p0 = toTimeControlName('Rapid (10 + 0)');

const Blitz = toTimeControlId('Blitz');
const Blitz5p3 = toTimeControlName('Blitz (5 + 3)');

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
		domainName: '$DOMAIN_NAME',
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
		admin: [
			'CREATE_USER',
			'ASSIGN_ROLE',
			'ASSIGN_ROLE_ADMIN',
			'ASSIGN_ROLE_TEACHER',
			'ASSIGN_ROLE_MEMBER',
			'ASSIGN_ROLE_STUDENT',
			'DELETE_GAMES',
			'DELETE_GAMES_ADMIN'
		],
		teacher: [],
		member: [],
		student: []
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

describe('Server setup', () => {
	test('Fill an empty server', async () => {
		await runCommand('./tests/initialize-empty.sh');
		expect(() => serverInitFromData('tests/webpage', configuration)).not.toThrow();

		const admin = UsersManager.getInstance().getAllUserDataByPrivateId(toPlayerPrivateId('admin.default'));
		if (isNotDefined(admin)) {
			throw new TestError('admin default user could not be retrieved');
		}

		aU = userAddNew(admin.user, { username: a, firstName: A, lastName: aa, password: 'aaaa', roles: ['ADMIN'] });
		bU = userAddNew(admin.user, { username: b, firstName: B, lastName: bb, password: 'dddd', roles: ['ADMIN'] });
		cU = userAddNew(admin.user, { username: c, firstName: C, lastName: cc, password: 'cccc', roles: ['ADMIN'] });
		dU = userAddNew(admin.user, { username: d, firstName: D, lastName: dd, password: 'dddd', roles: ['ADMIN'] });
		eU = userAddNew(admin.user, { username: e, firstName: E, lastName: ee, password: 'eeee', roles: ['ADMIN'] });
		fU = userAddNew(admin.user, { username: f, firstName: F, lastName: ff, password: 'ffff', roles: ['ADMIN'] });
	});
});

describe('Sequential game creation', () => {
	test('Add "Blitz" games', () => {
		gameAddNew(
			'sample',
			aU,
			bU,
			'white_wins',
			Blitz,
			Blitz5p3,
			toDateMajor('2025-01-19'),
			toDateMinor('17:06:00:000')
		);
		gameAddNew(
			'sample',
			cU,
			dU,
			'black_wins',
			Blitz,
			Blitz5p3,
			toDateMajor('2025-01-19'),
			toDateMinor('17:06:10:000')
		);
		gameAddNew('sample', eU, fU, 'draw', Blitz, Blitz5p3, toDateMajor('2025-01-19'), toDateMinor('17:06:20:000'));
		gameAddNew(
			'sample',
			aU,
			fU,
			'black_wins',
			Blitz,
			Blitz5p3,
			toDateMajor('2025-01-19'),
			toDateMinor('17:06:30:000')
		);
		gameAddNew(
			'sample',
			bU,
			aU,
			'white_wins',
			Blitz,
			Blitz5p3,
			toDateMajor('2025-01-19'),
			toDateMinor('17:06:40:000')
		);

		expect(aU.getGames(Blitz).length).toBe(1);
		expect(bU.getGames(Blitz).length).toBe(1);
		expect(cU.getGames(Blitz).length).toBe(1);
		expect(dU.getGames(Blitz).length).toBe(1);
		expect(eU.getGames(Blitz).length).toBe(1);
		expect(fU.getGames(Blitz).length).toBe(1);

		expect(aU.getRating(Blitz).numWonDrawnLost()).toEqual([3, 1, 0, 2]);
		expect(bU.getRating(Blitz).numWonDrawnLost()).toEqual([2, 1, 0, 1]);
		expect(cU.getRating(Blitz).numWonDrawnLost()).toEqual([1, 0, 0, 1]);
		expect(dU.getRating(Blitz).numWonDrawnLost()).toEqual([1, 1, 0, 0]);
		expect(eU.getRating(Blitz).numWonDrawnLost()).toEqual([1, 0, 1, 0]);
		expect(fU.getRating(Blitz).numWonDrawnLost()).toEqual([2, 1, 1, 0]);
	});

	test('Check "Blitz" graph', () => {
		const graphs_manager = GraphsManager.getInstance();
		const g = graphs_manager.getGraph(Blitz) as Graph;

		// white

		expect(g.getDataAsWhite(a, b)).toEqual(new EdgeMetadata(1, 0, 0));
		expect(g.getDataAsWhite(a, c)).toEqual(undefined);
		expect(g.getDataAsWhite(a, d)).toEqual(undefined);
		expect(g.getDataAsWhite(a, e)).toEqual(undefined);
		expect(g.getDataAsWhite(a, f)).toEqual(new EdgeMetadata(0, 0, 1));

		expect(g.getDataAsWhite(b, a)).toEqual(new EdgeMetadata(1, 0, 0));
		expect(g.getDataAsWhite(b, c)).toEqual(undefined);
		expect(g.getDataAsWhite(b, d)).toEqual(undefined);
		expect(g.getDataAsWhite(b, e)).toEqual(undefined);
		expect(g.getDataAsWhite(b, f)).toEqual(undefined);

		expect(g.getDataAsWhite(c, a)).toEqual(undefined);
		expect(g.getDataAsWhite(c, b)).toEqual(undefined);
		expect(g.getDataAsWhite(c, d)).toEqual(new EdgeMetadata(0, 0, 1));
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
		expect(g.getDataAsWhite(e, f)).toEqual(new EdgeMetadata(0, 1, 0));

		expect(g.getDataAsWhite(f, a)).toEqual(undefined);
		expect(g.getDataAsWhite(f, b)).toEqual(undefined);
		expect(g.getDataAsWhite(f, c)).toEqual(undefined);
		expect(g.getDataAsWhite(f, d)).toEqual(undefined);
		expect(g.getDataAsWhite(f, e)).toEqual(undefined);

		// black

		expect(g.getDataAsBlack(a, b)).toEqual(new EdgeMetadata(0, 0, 1));
		expect(g.getDataAsBlack(a, c)).toEqual(undefined);
		expect(g.getDataAsBlack(a, d)).toEqual(undefined);
		expect(g.getDataAsBlack(a, e)).toEqual(undefined);
		expect(g.getDataAsBlack(a, f)).toEqual(undefined);

		expect(g.getDataAsBlack(b, a)).toEqual(new EdgeMetadata(0, 0, 1));
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
		expect(g.getDataAsBlack(d, c)).toEqual(new EdgeMetadata(1, 0, 0));
		expect(g.getDataAsBlack(d, e)).toEqual(undefined);
		expect(g.getDataAsBlack(d, f)).toEqual(undefined);

		expect(g.getDataAsBlack(e, a)).toEqual(undefined);
		expect(g.getDataAsBlack(e, b)).toEqual(undefined);
		expect(g.getDataAsBlack(e, c)).toEqual(undefined);
		expect(g.getDataAsBlack(e, d)).toEqual(undefined);
		expect(g.getDataAsBlack(e, f)).toEqual(undefined);

		expect(g.getDataAsBlack(f, a)).toEqual(new EdgeMetadata(1, 0, 0));
		expect(g.getDataAsBlack(f, b)).toEqual(undefined);
		expect(g.getDataAsBlack(f, c)).toEqual(undefined);
		expect(g.getDataAsBlack(f, d)).toEqual(undefined);
		expect(g.getDataAsBlack(f, e)).toEqual(new EdgeMetadata(0, 1, 0));

		const blitz_dir = EnvironmentManager.getInstance().getDirGraphsTimeControl(Blitz);
		expect(fs.existsSync(path.join(blitz_dir, 'a'))).toBe(true);
		expect(fs.existsSync(path.join(blitz_dir, 'b'))).toBe(true);
		expect(fs.existsSync(path.join(blitz_dir, 'c'))).toBe(true);
		expect(fs.existsSync(path.join(blitz_dir, 'e'))).toBe(true);
	});

	const id0000000001 = toGameId('0000000001');
	const id0000000002 = toGameId('0000000002');
	const id0000000003 = toGameId('0000000003');
	const id0000000004 = toGameId('0000000004');
	const id0000000005 = toGameId('0000000005');

	test('Delete game 0000000001', () => {
		expect(() => gameDelete(aU, id0000000001)).not.toThrow();

		let man = GamesManager.getInstance();
		expect(man.gameExists(id0000000001)).toBe(false);
		expect(man.gameExists(id0000000002)).toBe(true);
		expect(man.gameExists(id0000000003)).toBe(true);
		expect(man.gameExists(id0000000004)).toBe(true);
		expect(man.gameExists(id0000000005)).toBe(true);

		expect(aU.getGames(Blitz).length).toBe(1);
		expect(bU.getGames(Blitz).length).toBe(1);
		expect(cU.getGames(Blitz).length).toBe(1);
		expect(dU.getGames(Blitz).length).toBe(1);
		expect(eU.getGames(Blitz).length).toBe(1);
		expect(fU.getGames(Blitz).length).toBe(1);

		expect(aU.getRating(Blitz).numWonDrawnLost()).toEqual([2, 0, 0, 2]);
		expect(bU.getRating(Blitz).numWonDrawnLost()).toEqual([1, 1, 0, 0]);
		expect(cU.getRating(Blitz).numWonDrawnLost()).toEqual([1, 0, 0, 1]);
		expect(dU.getRating(Blitz).numWonDrawnLost()).toEqual([1, 1, 0, 0]);
		expect(eU.getRating(Blitz).numWonDrawnLost()).toEqual([1, 0, 1, 0]);
		expect(fU.getRating(Blitz).numWonDrawnLost()).toEqual([2, 1, 1, 0]);

		const blitz_dir = EnvironmentManager.getInstance().getDirGamesTimeControl(Blitz);
		expect(fs.existsSync(path.join(blitz_dir, '2025-01-19'))).toBe(true);
	});

	test('Check "Blitz" graph', () => {
		const graphs_manager = GraphsManager.getInstance();
		const g = graphs_manager.getGraph(Blitz) as Graph;

		// white

		expect(g.getDataAsWhite(a, b)).toEqual(undefined);
		expect(g.getDataAsWhite(a, c)).toEqual(undefined);
		expect(g.getDataAsWhite(a, d)).toEqual(undefined);
		expect(g.getDataAsWhite(a, e)).toEqual(undefined);
		expect(g.getDataAsWhite(a, f)).toEqual(new EdgeMetadata(0, 0, 1));

		expect(g.getDataAsWhite(b, a)).toEqual(new EdgeMetadata(1, 0, 0));
		expect(g.getDataAsWhite(b, c)).toEqual(undefined);
		expect(g.getDataAsWhite(b, d)).toEqual(undefined);
		expect(g.getDataAsWhite(b, e)).toEqual(undefined);
		expect(g.getDataAsWhite(b, f)).toEqual(undefined);

		expect(g.getDataAsWhite(c, a)).toEqual(undefined);
		expect(g.getDataAsWhite(c, b)).toEqual(undefined);
		expect(g.getDataAsWhite(c, d)).toEqual(new EdgeMetadata(0, 0, 1));
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
		expect(g.getDataAsWhite(e, f)).toEqual(new EdgeMetadata(0, 1, 0));

		expect(g.getDataAsWhite(f, a)).toEqual(undefined);
		expect(g.getDataAsWhite(f, b)).toEqual(undefined);
		expect(g.getDataAsWhite(f, c)).toEqual(undefined);
		expect(g.getDataAsWhite(f, d)).toEqual(undefined);
		expect(g.getDataAsWhite(f, e)).toEqual(undefined);

		// black

		expect(g.getDataAsBlack(a, b)).toEqual(new EdgeMetadata(0, 0, 1));
		expect(g.getDataAsBlack(a, c)).toEqual(undefined);
		expect(g.getDataAsBlack(a, d)).toEqual(undefined);
		expect(g.getDataAsBlack(a, e)).toEqual(undefined);
		expect(g.getDataAsBlack(a, f)).toEqual(undefined);

		expect(g.getDataAsBlack(b, a)).toEqual(undefined);
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
		expect(g.getDataAsBlack(d, c)).toEqual(new EdgeMetadata(1, 0, 0));
		expect(g.getDataAsBlack(d, e)).toEqual(undefined);
		expect(g.getDataAsBlack(d, f)).toEqual(undefined);

		expect(g.getDataAsBlack(e, a)).toEqual(undefined);
		expect(g.getDataAsBlack(e, b)).toEqual(undefined);
		expect(g.getDataAsBlack(e, c)).toEqual(undefined);
		expect(g.getDataAsBlack(e, d)).toEqual(undefined);
		expect(g.getDataAsBlack(e, f)).toEqual(undefined);

		expect(g.getDataAsBlack(f, a)).toEqual(new EdgeMetadata(1, 0, 0));
		expect(g.getDataAsBlack(f, b)).toEqual(undefined);
		expect(g.getDataAsBlack(f, c)).toEqual(undefined);
		expect(g.getDataAsBlack(f, d)).toEqual(undefined);
		expect(g.getDataAsBlack(f, e)).toEqual(new EdgeMetadata(0, 1, 0));

		const blitz_dir = EnvironmentManager.getInstance().getDirGraphsTimeControl(Blitz);
		expect(fs.existsSync(path.join(blitz_dir, 'a'))).toBe(true);
		expect(fs.existsSync(path.join(blitz_dir, 'b'))).toBe(true);
		expect(fs.existsSync(path.join(blitz_dir, 'c'))).toBe(true);
		expect(fs.existsSync(path.join(blitz_dir, 'e'))).toBe(true);
	});

	test('Delete game 0000000004', () => {
		expect(() => gameDelete(aU, id0000000004)).not.toThrow();

		let man = GamesManager.getInstance();
		expect(man.gameExists(id0000000001)).toBe(false);
		expect(man.gameExists(id0000000002)).toBe(true);
		expect(man.gameExists(id0000000003)).toBe(true);
		expect(man.gameExists(id0000000004)).toBe(false);
		expect(man.gameExists(id0000000005)).toBe(true);

		expect(aU.getGames(Blitz).length).toBe(1);
		expect(bU.getGames(Blitz).length).toBe(1);
		expect(cU.getGames(Blitz).length).toBe(1);
		expect(dU.getGames(Blitz).length).toBe(1);
		expect(eU.getGames(Blitz).length).toBe(1);
		expect(fU.getGames(Blitz).length).toBe(1);

		expect(aU.getRating(Blitz).numWonDrawnLost()).toEqual([1, 0, 0, 1]);
		expect(bU.getRating(Blitz).numWonDrawnLost()).toEqual([1, 1, 0, 0]);
		expect(cU.getRating(Blitz).numWonDrawnLost()).toEqual([1, 0, 0, 1]);
		expect(dU.getRating(Blitz).numWonDrawnLost()).toEqual([1, 1, 0, 0]);
		expect(eU.getRating(Blitz).numWonDrawnLost()).toEqual([1, 0, 1, 0]);
		expect(fU.getRating(Blitz).numWonDrawnLost()).toEqual([1, 0, 1, 0]);

		const blitz_dir = EnvironmentManager.getInstance().getDirGamesTimeControl(Blitz);
		expect(fs.existsSync(path.join(blitz_dir, '2025-01-19'))).toBe(true);
	});

	test('Check "Blitz" graph', () => {
		const graphs_manager = GraphsManager.getInstance();
		const g = graphs_manager.getGraph(Blitz) as Graph;

		// white

		expect(g.getDataAsWhite(a, b)).toEqual(undefined);
		expect(g.getDataAsWhite(a, c)).toEqual(undefined);
		expect(g.getDataAsWhite(a, d)).toEqual(undefined);
		expect(g.getDataAsWhite(a, e)).toEqual(undefined);
		expect(g.getDataAsWhite(a, f)).toEqual(undefined);

		expect(g.getDataAsWhite(b, a)).toEqual(new EdgeMetadata(1, 0, 0));
		expect(g.getDataAsWhite(b, c)).toEqual(undefined);
		expect(g.getDataAsWhite(b, d)).toEqual(undefined);
		expect(g.getDataAsWhite(b, e)).toEqual(undefined);
		expect(g.getDataAsWhite(b, f)).toEqual(undefined);

		expect(g.getDataAsWhite(c, a)).toEqual(undefined);
		expect(g.getDataAsWhite(c, b)).toEqual(undefined);
		expect(g.getDataAsWhite(c, d)).toEqual(new EdgeMetadata(0, 0, 1));
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
		expect(g.getDataAsWhite(e, f)).toEqual(new EdgeMetadata(0, 1, 0));

		expect(g.getDataAsWhite(f, a)).toEqual(undefined);
		expect(g.getDataAsWhite(f, b)).toEqual(undefined);
		expect(g.getDataAsWhite(f, c)).toEqual(undefined);
		expect(g.getDataAsWhite(f, d)).toEqual(undefined);
		expect(g.getDataAsWhite(f, e)).toEqual(undefined);

		// black

		expect(g.getDataAsBlack(a, b)).toEqual(new EdgeMetadata(0, 0, 1));
		expect(g.getDataAsBlack(a, c)).toEqual(undefined);
		expect(g.getDataAsBlack(a, d)).toEqual(undefined);
		expect(g.getDataAsBlack(a, e)).toEqual(undefined);
		expect(g.getDataAsBlack(a, f)).toEqual(undefined);

		expect(g.getDataAsBlack(b, a)).toEqual(undefined);
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
		expect(g.getDataAsBlack(d, c)).toEqual(new EdgeMetadata(1, 0, 0));
		expect(g.getDataAsBlack(d, e)).toEqual(undefined);
		expect(g.getDataAsBlack(d, f)).toEqual(undefined);

		expect(g.getDataAsBlack(e, a)).toEqual(undefined);
		expect(g.getDataAsBlack(e, b)).toEqual(undefined);
		expect(g.getDataAsBlack(e, c)).toEqual(undefined);
		expect(g.getDataAsBlack(e, d)).toEqual(undefined);
		expect(g.getDataAsBlack(e, f)).toEqual(undefined);

		expect(g.getDataAsBlack(f, a)).toEqual(undefined);
		expect(g.getDataAsBlack(f, b)).toEqual(undefined);
		expect(g.getDataAsBlack(f, c)).toEqual(undefined);
		expect(g.getDataAsBlack(f, d)).toEqual(undefined);
		expect(g.getDataAsBlack(f, e)).toEqual(new EdgeMetadata(0, 1, 0));

		const blitz_dir = EnvironmentManager.getInstance().getDirGraphsTimeControl(Blitz);
		expect(fs.existsSync(path.join(blitz_dir, 'a'))).toBe(false);
		expect(fs.existsSync(path.join(blitz_dir, 'b'))).toBe(true);
		expect(fs.existsSync(path.join(blitz_dir, 'c'))).toBe(true);
		expect(fs.existsSync(path.join(blitz_dir, 'e'))).toBe(true);
	});

	test('Delete game 0000000003', () => {
		expect(() => gameDelete(aU, id0000000003)).not.toThrow();

		let man = GamesManager.getInstance();
		expect(man.gameExists(id0000000001)).toBe(false);
		expect(man.gameExists(id0000000002)).toBe(true);
		expect(man.gameExists(id0000000003)).toBe(false);
		expect(man.gameExists(id0000000004)).toBe(false);
		expect(man.gameExists(id0000000005)).toBe(true);

		expect(aU.getGames(Blitz).length).toBe(1);
		expect(bU.getGames(Blitz).length).toBe(1);
		expect(cU.getGames(Blitz).length).toBe(1);
		expect(dU.getGames(Blitz).length).toBe(1);
		expect(eU.getGames(Blitz).length).toBe(0);
		expect(fU.getGames(Blitz).length).toBe(0);

		expect(aU.getRating(Blitz).numWonDrawnLost()).toEqual([1, 0, 0, 1]);
		expect(bU.getRating(Blitz).numWonDrawnLost()).toEqual([1, 1, 0, 0]);
		expect(cU.getRating(Blitz).numWonDrawnLost()).toEqual([1, 0, 0, 1]);
		expect(dU.getRating(Blitz).numWonDrawnLost()).toEqual([1, 1, 0, 0]);
		expect(eU.getRating(Blitz).numWonDrawnLost()).toEqual([0, 0, 0, 0]);
		expect(fU.getRating(Blitz).numWonDrawnLost()).toEqual([0, 0, 0, 0]);

		const blitz_dir = EnvironmentManager.getInstance().getDirGamesTimeControl(Blitz);
		expect(fs.existsSync(path.join(blitz_dir, '2025-01-19'))).toBe(true);
	});

	test('Check "Blitz" graph', () => {
		const graphs_manager = GraphsManager.getInstance();
		const g = graphs_manager.getGraph(Blitz) as Graph;

		// white

		expect(g.getDataAsWhite(a, b)).toEqual(undefined);
		expect(g.getDataAsWhite(a, c)).toEqual(undefined);
		expect(g.getDataAsWhite(a, d)).toEqual(undefined);
		expect(g.getDataAsWhite(a, e)).toEqual(undefined);
		expect(g.getDataAsWhite(a, f)).toEqual(undefined);

		expect(g.getDataAsWhite(b, a)).toEqual(new EdgeMetadata(1, 0, 0));
		expect(g.getDataAsWhite(b, c)).toEqual(undefined);
		expect(g.getDataAsWhite(b, d)).toEqual(undefined);
		expect(g.getDataAsWhite(b, e)).toEqual(undefined);
		expect(g.getDataAsWhite(b, f)).toEqual(undefined);

		expect(g.getDataAsWhite(c, a)).toEqual(undefined);
		expect(g.getDataAsWhite(c, b)).toEqual(undefined);
		expect(g.getDataAsWhite(c, d)).toEqual(new EdgeMetadata(0, 0, 1));
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
		expect(g.getDataAsWhite(e, f)).toEqual(undefined);

		expect(g.getDataAsWhite(f, a)).toEqual(undefined);
		expect(g.getDataAsWhite(f, b)).toEqual(undefined);
		expect(g.getDataAsWhite(f, c)).toEqual(undefined);
		expect(g.getDataAsWhite(f, d)).toEqual(undefined);
		expect(g.getDataAsWhite(f, e)).toEqual(undefined);

		// black

		expect(g.getDataAsBlack(a, b)).toEqual(new EdgeMetadata(0, 0, 1));
		expect(g.getDataAsBlack(a, c)).toEqual(undefined);
		expect(g.getDataAsBlack(a, d)).toEqual(undefined);
		expect(g.getDataAsBlack(a, e)).toEqual(undefined);
		expect(g.getDataAsBlack(a, f)).toEqual(undefined);

		expect(g.getDataAsBlack(b, a)).toEqual(undefined);
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
		expect(g.getDataAsBlack(d, c)).toEqual(new EdgeMetadata(1, 0, 0));
		expect(g.getDataAsBlack(d, e)).toEqual(undefined);
		expect(g.getDataAsBlack(d, f)).toEqual(undefined);

		expect(g.getDataAsBlack(e, a)).toEqual(undefined);
		expect(g.getDataAsBlack(e, b)).toEqual(undefined);
		expect(g.getDataAsBlack(e, c)).toEqual(undefined);
		expect(g.getDataAsBlack(e, d)).toEqual(undefined);
		expect(g.getDataAsBlack(e, f)).toEqual(undefined);

		expect(g.getDataAsBlack(f, a)).toEqual(undefined);
		expect(g.getDataAsBlack(f, b)).toEqual(undefined);
		expect(g.getDataAsBlack(f, c)).toEqual(undefined);
		expect(g.getDataAsBlack(f, d)).toEqual(undefined);
		expect(g.getDataAsBlack(f, e)).toEqual(undefined);

		const blitz_dir = EnvironmentManager.getInstance().getDirGraphsTimeControl(Blitz);
		expect(fs.existsSync(path.join(blitz_dir, 'a'))).toBe(false);
		expect(fs.existsSync(path.join(blitz_dir, 'b'))).toBe(true);
		expect(fs.existsSync(path.join(blitz_dir, 'c'))).toBe(true);
		expect(fs.existsSync(path.join(blitz_dir, 'e'))).toBe(false);
	});

	test('Delete game 0000000002', () => {
		expect(() => gameDelete(aU, id0000000002)).not.toThrow();

		let man = GamesManager.getInstance();
		expect(man.gameExists(id0000000001)).toBe(false);
		expect(man.gameExists(id0000000002)).toBe(false);
		expect(man.gameExists(id0000000003)).toBe(false);
		expect(man.gameExists(id0000000004)).toBe(false);
		expect(man.gameExists(id0000000005)).toBe(true);

		expect(aU.getGames(Blitz).length).toBe(1);
		expect(bU.getGames(Blitz).length).toBe(1);
		expect(cU.getGames(Blitz).length).toBe(0);
		expect(dU.getGames(Blitz).length).toBe(0);
		expect(eU.getGames(Blitz).length).toBe(0);
		expect(fU.getGames(Blitz).length).toBe(0);

		expect(aU.getRating(Blitz).numWonDrawnLost()).toEqual([1, 0, 0, 1]);
		expect(bU.getRating(Blitz).numWonDrawnLost()).toEqual([1, 1, 0, 0]);
		expect(cU.getRating(Blitz).numWonDrawnLost()).toEqual([0, 0, 0, 0]);
		expect(dU.getRating(Blitz).numWonDrawnLost()).toEqual([0, 0, 0, 0]);
		expect(eU.getRating(Blitz).numWonDrawnLost()).toEqual([0, 0, 0, 0]);
		expect(fU.getRating(Blitz).numWonDrawnLost()).toEqual([0, 0, 0, 0]);

		const blitz_dir = EnvironmentManager.getInstance().getDirGamesTimeControl(Blitz);
		expect(fs.existsSync(path.join(blitz_dir, '2025-01-19'))).toBe(true);
	});

	test('Check "Blitz" graph', () => {
		const graphs_manager = GraphsManager.getInstance();
		const g = graphs_manager.getGraph(Blitz) as Graph;

		// white

		expect(g.getDataAsWhite(a, b)).toEqual(undefined);
		expect(g.getDataAsWhite(a, c)).toEqual(undefined);
		expect(g.getDataAsWhite(a, d)).toEqual(undefined);
		expect(g.getDataAsWhite(a, e)).toEqual(undefined);
		expect(g.getDataAsWhite(a, f)).toEqual(undefined);

		expect(g.getDataAsWhite(b, a)).toEqual(new EdgeMetadata(1, 0, 0));
		expect(g.getDataAsWhite(b, c)).toEqual(undefined);
		expect(g.getDataAsWhite(b, d)).toEqual(undefined);
		expect(g.getDataAsWhite(b, e)).toEqual(undefined);
		expect(g.getDataAsWhite(b, f)).toEqual(undefined);

		expect(g.getDataAsWhite(c, a)).toEqual(undefined);
		expect(g.getDataAsWhite(c, b)).toEqual(undefined);
		expect(g.getDataAsWhite(c, d)).toEqual(undefined);
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
		expect(g.getDataAsWhite(e, f)).toEqual(undefined);

		expect(g.getDataAsWhite(f, a)).toEqual(undefined);
		expect(g.getDataAsWhite(f, b)).toEqual(undefined);
		expect(g.getDataAsWhite(f, c)).toEqual(undefined);
		expect(g.getDataAsWhite(f, d)).toEqual(undefined);
		expect(g.getDataAsWhite(f, e)).toEqual(undefined);

		// black

		expect(g.getDataAsBlack(a, b)).toEqual(new EdgeMetadata(0, 0, 1));
		expect(g.getDataAsBlack(a, c)).toEqual(undefined);
		expect(g.getDataAsBlack(a, d)).toEqual(undefined);
		expect(g.getDataAsBlack(a, e)).toEqual(undefined);
		expect(g.getDataAsBlack(a, f)).toEqual(undefined);

		expect(g.getDataAsBlack(b, a)).toEqual(undefined);
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
		expect(g.getDataAsBlack(d, c)).toEqual(undefined);
		expect(g.getDataAsBlack(d, e)).toEqual(undefined);
		expect(g.getDataAsBlack(d, f)).toEqual(undefined);

		expect(g.getDataAsBlack(e, a)).toEqual(undefined);
		expect(g.getDataAsBlack(e, b)).toEqual(undefined);
		expect(g.getDataAsBlack(e, c)).toEqual(undefined);
		expect(g.getDataAsBlack(e, d)).toEqual(undefined);
		expect(g.getDataAsBlack(e, f)).toEqual(undefined);

		expect(g.getDataAsBlack(f, a)).toEqual(undefined);
		expect(g.getDataAsBlack(f, b)).toEqual(undefined);
		expect(g.getDataAsBlack(f, c)).toEqual(undefined);
		expect(g.getDataAsBlack(f, d)).toEqual(undefined);
		expect(g.getDataAsBlack(f, e)).toEqual(undefined);

		const blitz_dir = EnvironmentManager.getInstance().getDirGraphsTimeControl(Blitz);
		expect(fs.existsSync(path.join(blitz_dir, 'a'))).toBe(false);
		expect(fs.existsSync(path.join(blitz_dir, 'b'))).toBe(true);
		expect(fs.existsSync(path.join(blitz_dir, 'c'))).toBe(false);
		expect(fs.existsSync(path.join(blitz_dir, 'e'))).toBe(false);
	});

	test('Delete game 0000000005', () => {
		expect(() => gameDelete(aU, id0000000005)).not.toThrow();

		let man = GamesManager.getInstance();
		expect(man.gameExists(id0000000001)).toBe(false);
		expect(man.gameExists(id0000000002)).toBe(false);
		expect(man.gameExists(id0000000003)).toBe(false);
		expect(man.gameExists(id0000000004)).toBe(false);
		expect(man.gameExists(id0000000005)).toBe(false);

		expect(aU.getGames(Blitz).length).toBe(0);
		expect(bU.getGames(Blitz).length).toBe(0);
		expect(cU.getGames(Blitz).length).toBe(0);
		expect(dU.getGames(Blitz).length).toBe(0);
		expect(eU.getGames(Blitz).length).toBe(0);
		expect(fU.getGames(Blitz).length).toBe(0);

		expect(aU.getRating(Blitz).numWonDrawnLost()).toEqual([0, 0, 0, 0]);
		expect(bU.getRating(Blitz).numWonDrawnLost()).toEqual([0, 0, 0, 0]);
		expect(cU.getRating(Blitz).numWonDrawnLost()).toEqual([0, 0, 0, 0]);
		expect(dU.getRating(Blitz).numWonDrawnLost()).toEqual([0, 0, 0, 0]);
		expect(eU.getRating(Blitz).numWonDrawnLost()).toEqual([0, 0, 0, 0]);
		expect(fU.getRating(Blitz).numWonDrawnLost()).toEqual([0, 0, 0, 0]);

		const blitz_dir = EnvironmentManager.getInstance().getDirGamesTimeControl(Blitz);
		expect(fs.existsSync(path.join(blitz_dir, '2025-01-19'))).toBe(false);
	});

	test('Check "Blitz" graph', () => {
		const graphs_manager = GraphsManager.getInstance();
		const g = graphs_manager.getGraph(Blitz) as Graph;

		// white

		expect(g.getDataAsWhite(a, b)).toEqual(undefined);
		expect(g.getDataAsWhite(a, c)).toEqual(undefined);
		expect(g.getDataAsWhite(a, d)).toEqual(undefined);
		expect(g.getDataAsWhite(a, e)).toEqual(undefined);
		expect(g.getDataAsWhite(a, f)).toEqual(undefined);

		expect(g.getDataAsWhite(b, a)).toEqual(undefined);
		expect(g.getDataAsWhite(b, c)).toEqual(undefined);
		expect(g.getDataAsWhite(b, d)).toEqual(undefined);
		expect(g.getDataAsWhite(b, e)).toEqual(undefined);
		expect(g.getDataAsWhite(b, f)).toEqual(undefined);

		expect(g.getDataAsWhite(c, a)).toEqual(undefined);
		expect(g.getDataAsWhite(c, b)).toEqual(undefined);
		expect(g.getDataAsWhite(c, d)).toEqual(undefined);
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
		expect(g.getDataAsWhite(e, f)).toEqual(undefined);

		expect(g.getDataAsWhite(f, a)).toEqual(undefined);
		expect(g.getDataAsWhite(f, b)).toEqual(undefined);
		expect(g.getDataAsWhite(f, c)).toEqual(undefined);
		expect(g.getDataAsWhite(f, d)).toEqual(undefined);
		expect(g.getDataAsWhite(f, e)).toEqual(undefined);

		// black

		expect(g.getDataAsBlack(a, b)).toEqual(undefined);
		expect(g.getDataAsBlack(a, c)).toEqual(undefined);
		expect(g.getDataAsBlack(a, d)).toEqual(undefined);
		expect(g.getDataAsBlack(a, e)).toEqual(undefined);
		expect(g.getDataAsBlack(a, f)).toEqual(undefined);

		expect(g.getDataAsBlack(b, a)).toEqual(undefined);
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
		expect(g.getDataAsBlack(d, c)).toEqual(undefined);
		expect(g.getDataAsBlack(d, e)).toEqual(undefined);
		expect(g.getDataAsBlack(d, f)).toEqual(undefined);

		expect(g.getDataAsBlack(e, a)).toEqual(undefined);
		expect(g.getDataAsBlack(e, b)).toEqual(undefined);
		expect(g.getDataAsBlack(e, c)).toEqual(undefined);
		expect(g.getDataAsBlack(e, d)).toEqual(undefined);
		expect(g.getDataAsBlack(e, f)).toEqual(undefined);

		expect(g.getDataAsBlack(f, a)).toEqual(undefined);
		expect(g.getDataAsBlack(f, b)).toEqual(undefined);
		expect(g.getDataAsBlack(f, c)).toEqual(undefined);
		expect(g.getDataAsBlack(f, d)).toEqual(undefined);
		expect(g.getDataAsBlack(f, e)).toEqual(undefined);

		const blitz_dir = EnvironmentManager.getInstance().getDirGraphsTimeControl(Blitz);
		expect(fs.existsSync(path.join(blitz_dir, 'a'))).toBe(false);
		expect(fs.existsSync(path.join(blitz_dir, 'b'))).toBe(false);
		expect(fs.existsSync(path.join(blitz_dir, 'c'))).toBe(false);
		expect(fs.existsSync(path.join(blitz_dir, 'e'))).toBe(false);
	});
});
