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

import { toPlayerPrivateId } from '@common/models/player-id';
import { toTimeControlId, toTimeControlName } from '@common/models/time-control';
import { isNotDefined } from '@common/utils/is-defined';
import { graphFromString } from '@server/io/graph/graph';
import { EnvironmentManager } from '@server/managers/environment-manager';
import { graphModifyEdge, graphUpdate } from '@server/managers/graphs';
import { clearServer } from '@server/managers/memory/clear';
import { serverInitFromData } from '@server/managers/memory/initialization';
import { Configuration } from '@server/models/configuration/configuration';
import { EdgeMetadata } from '@server/models/graph/edge-metadata';
import { runCommand } from '@tests';

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
			passphraseFile: 'kgj68',
		},
		favicon: 'favicon.png',
		loginPage: {
			title: 'Login title',
			icon: 'login.png',
		},
		homePage: {
			title: 'Home title',
			icon: 'home.png',
		},
	},
	server: {
		domainName: '',
		ports: {
			http: '8080',
			https: '8443',
		},
	},
	ratingSystem: 'Elo',
	timeControls: [
		{
			id: Classical,
			name: Classical90p30,
		},
		{
			id: Rapid,
			name: Rapid12p5,
		},
		{
			id: Rapid,
			name: Rapid10p0,
		},
		{
			id: Blitz,
			name: Blitz5p3,
		},
	],
	behavior: {
		challenges: {
			higherRatedPlayerCanDeclineChallengeFromLowerRatedPlayer: false,
		},
	},
	permissions: {
		admin: [
			'CHALLENGE_USER',
			'CHALLENGE_USER_ADMIN',
			'CHALLENGE_USER_MEMBER',
			'CHALLENGE_USER_TEACHER',
			'CHALLENGE_USER_STUDENT',
		],
		teacher: [
			'CHALLENGE_USER',
			'CHALLENGE_USER_ADMIN',
			'CHALLENGE_USER_MEMBER',
			'CHALLENGE_USER_TEACHER',
			'CHALLENGE_USER_STUDENT',
		],
		member: [
			'CHALLENGE_USER',
			'CHALLENGE_USER_ADMIN',
			'CHALLENGE_USER_MEMBER',
			'CHALLENGE_USER_TEACHER',
			'CHALLENGE_USER_STUDENT',
		],
		student: [
			'CHALLENGE_USER',
			'CHALLENGE_USER_ADMIN',
			'CHALLENGE_USER_MEMBER',
			'CHALLENGE_USER_TEACHER',
			'CHALLENGE_USER_STUDENT',
		],
	},
};

const A = toPlayerPrivateId('A');
const B = toPlayerPrivateId('B');
const C = toPlayerPrivateId('C');

describe('Server setup', () => {
	test('Load an empty server', async () => {
		await runCommand('./tests/initialize-empty.sh');
		expect(() => serverInitFromData('tests/webpage', configuration)).not.toThrow();
	});
});

describe('Simple construction and query', () => {
	test(Blitz, () => {
		graphUpdate(A, B, 'white_wins', Blitz);
		{
			const g = graphFromString(EnvironmentManager.getInstance().getDirGraphsTimeControl(Blitz));
			expect(g).not.toBeNull();
			if (isNotDefined(g)) {
				return;
			}
			expect(g.getDataAsWhite(A, B)).toEqual(new EdgeMetadata(1, 0, 0));
			expect(g.getDataAsBlack(A, B)).toEqual(undefined);
			expect(g.getOutDegree(A)).toBe(1);
			expect(g.getInDegree(A)).toBe(0);
			expect(g.getBlackOpponents(A)).toEqual([B]);
			expect(g.getWhiteOpponents(A)).toEqual([]);
			expect(g.getDataAsWhite(B, A)).toEqual(undefined);
			expect(g.getDataAsBlack(B, A)).toEqual(new EdgeMetadata(0, 0, 1));
			expect(g.getOutDegree(B)).toBe(0);
			expect(g.getInDegree(B)).toBe(1);
			expect(g.getBlackOpponents(B)).toEqual([]);
			expect(g.getWhiteOpponents(B)).toEqual([A]);
		}

		graphUpdate(A, B, 'white_wins', Blitz);
		{
			const g = graphFromString(EnvironmentManager.getInstance().getDirGraphsTimeControl(Blitz));
			expect(g).not.toBeNull();
			if (isNotDefined(g)) {
				return;
			}
			expect(g.getDataAsWhite(A, B)).toEqual(new EdgeMetadata(2, 0, 0));
			expect(g.getDataAsBlack(A, B)).toEqual(undefined);
			expect(g.getOutDegree(A)).toBe(1);
			expect(g.getInDegree(A)).toBe(0);
			expect(g.getBlackOpponents(A)).toEqual([B]);
			expect(g.getWhiteOpponents(A)).toEqual([]);
			expect(g.getDataAsWhite(B, A)).toEqual(undefined);
			expect(g.getDataAsBlack(B, A)).toEqual(new EdgeMetadata(0, 0, 2));
			expect(g.getOutDegree(B)).toBe(0);
			expect(g.getInDegree(B)).toBe(1);
			expect(g.getBlackOpponents(B)).toEqual([]);
			expect(g.getWhiteOpponents(B)).toEqual([A]);
		}

		graphUpdate(A, B, 'white_wins', Blitz);
		{
			const g = graphFromString(EnvironmentManager.getInstance().getDirGraphsTimeControl(Blitz));
			expect(g).not.toBeNull();
			if (isNotDefined(g)) {
				return;
			}
			expect(g.getDataAsWhite(A, B)).toEqual(new EdgeMetadata(3, 0, 0));
			expect(g.getDataAsBlack(A, B)).toEqual(undefined);
			expect(g.getOutDegree(A)).toBe(1);
			expect(g.getInDegree(A)).toBe(0);
			expect(g.getBlackOpponents(A)).toEqual([B]);
			expect(g.getWhiteOpponents(A)).toEqual([]);
			expect(g.getDataAsWhite(B, A)).toEqual(undefined);
			expect(g.getDataAsBlack(B, A)).toEqual(new EdgeMetadata(0, 0, 3));
			expect(g.getOutDegree(B)).toBe(0);
			expect(g.getInDegree(B)).toBe(1);
			expect(g.getBlackOpponents(B)).toEqual([]);
			expect(g.getWhiteOpponents(B)).toEqual([A]);
		}
	});

	test(Classical, () => {
		graphUpdate(A, B, 'white_wins', Classical);
		{
			const g = graphFromString(EnvironmentManager.getInstance().getDirGraphsTimeControl(Classical));
			expect(g).not.toBeNull();
			if (isNotDefined(g)) {
				return;
			}
			expect(g.getDataAsWhite(A, B)).toEqual(new EdgeMetadata(1, 0, 0));
			expect(g.getDataAsBlack(A, B)).toEqual(undefined);
			expect(g.getOutDegree(A)).toBe(1);
			expect(g.getInDegree(A)).toBe(0);
			expect(g.getBlackOpponents(A)).toEqual([B]);
			expect(g.getWhiteOpponents(A)).toEqual([]);
			expect(g.getDataAsWhite(B, A)).toEqual(undefined);
			expect(g.getDataAsBlack(B, A)).toEqual(new EdgeMetadata(0, 0, 1));
			expect(g.getOutDegree(B)).toBe(0);
			expect(g.getInDegree(B)).toBe(1);
			expect(g.getBlackOpponents(B)).toEqual([]);
			expect(g.getWhiteOpponents(B)).toEqual([A]);
		}

		graphUpdate(A, B, 'black_wins', Classical);
		{
			const g = graphFromString(EnvironmentManager.getInstance().getDirGraphsTimeControl(Classical));
			expect(g).not.toBeNull();
			if (isNotDefined(g)) {
				return;
			}
			expect(g.getDataAsWhite(A, B)).toEqual(new EdgeMetadata(1, 0, 1));
			expect(g.getDataAsBlack(A, B)).toEqual(undefined);
			expect(g.getOutDegree(A)).toBe(1);
			expect(g.getInDegree(A)).toBe(0);
			expect(g.getBlackOpponents(A)).toEqual([B]);
			expect(g.getWhiteOpponents(A)).toEqual([]);
			expect(g.getDataAsWhite(B, A)).toEqual(undefined);
			expect(g.getDataAsBlack(B, A)).toEqual(new EdgeMetadata(1, 0, 1));
			expect(g.getOutDegree(B)).toBe(0);
			expect(g.getInDegree(B)).toBe(1);
			expect(g.getBlackOpponents(B)).toEqual([]);
			expect(g.getWhiteOpponents(B)).toEqual([A]);
		}

		graphUpdate(A, B, 'draw', Classical);
		{
			const g = graphFromString(EnvironmentManager.getInstance().getDirGraphsTimeControl(Classical));
			expect(g).not.toBeNull();
			if (isNotDefined(g)) {
				return;
			}
			expect(g.getDataAsWhite(A, B)).toEqual(new EdgeMetadata(1, 1, 1));
			expect(g.getDataAsBlack(A, B)).toEqual(undefined);
			expect(g.getOutDegree(A)).toBe(1);
			expect(g.getInDegree(A)).toBe(0);
			expect(g.getBlackOpponents(A)).toEqual([B]);
			expect(g.getWhiteOpponents(A)).toEqual([]);
			expect(g.getDataAsWhite(B, A)).toEqual(undefined);
			expect(g.getDataAsBlack(B, A)).toEqual(new EdgeMetadata(1, 1, 1));
			expect(g.getOutDegree(B)).toBe(0);
			expect(g.getInDegree(B)).toBe(1);
			expect(g.getBlackOpponents(B)).toEqual([]);
			expect(g.getWhiteOpponents(B)).toEqual([A]);
		}
	});
});

describe('Server reset', () => {
	test('Clear and reload server', async () => {
		clearServer();
		await runCommand('./tests/initialize-empty.sh');
		serverInitFromData('tests/webpage', configuration);
	});
});

describe('Edge update', () => {
	test(Classical, () => {
		graphUpdate(A, B, 'white_wins', Classical);
		graphModifyEdge(A, B, 'white_wins', 'draw', Classical);
		{
			const g = graphFromString(EnvironmentManager.getInstance().getDirGraphsTimeControl(Classical));
			expect(g).not.toBeNull();
			if (isNotDefined(g)) {
				return;
			}
			expect(g.getDataAsWhite(A, B)).toEqual(new EdgeMetadata(0, 1, 0));
			expect(g.getDataAsBlack(A, B)).toEqual(undefined);
			expect(g.getDataAsWhite(A, C)).toEqual(undefined);
			expect(g.getDataAsBlack(A, C)).toEqual(undefined);
			expect(g.getOutDegree(A)).toBe(1);
			expect(g.getInDegree(A)).toBe(0);
			expect(g.getBlackOpponents(A)).toEqual([B]);
			expect(g.getWhiteOpponents(A)).toEqual([]);
			expect(g.getDataAsWhite(B, A)).toEqual(undefined);
			expect(g.getDataAsBlack(B, A)).toEqual(new EdgeMetadata(0, 1, 0));
			expect(g.getDataAsWhite(B, C)).toEqual(undefined);
			expect(g.getDataAsBlack(B, C)).toEqual(undefined);
			expect(g.getOutDegree(B)).toBe(0);
			expect(g.getInDegree(B)).toBe(1);
			expect(g.getBlackOpponents(B)).toEqual([]);
			expect(g.getWhiteOpponents(B)).toEqual([A]);
			expect(g.getDataAsWhite(C, A)).toEqual(undefined);
			expect(g.getDataAsBlack(C, A)).toEqual(undefined);
			expect(g.getDataAsWhite(C, B)).toEqual(undefined);
			expect(g.getDataAsBlack(C, B)).toEqual(undefined);
			expect(g.getOutDegree(C)).toBe(0);
			expect(g.getInDegree(C)).toBe(0);
			expect(g.getBlackOpponents(C)).toEqual([]);
			expect(g.getWhiteOpponents(C)).toEqual([]);
		}

		graphModifyEdge(A, B, 'draw', 'black_wins', Classical);
		{
			const g = graphFromString(EnvironmentManager.getInstance().getDirGraphsTimeControl(Classical));
			expect(g).not.toBeNull();
			if (isNotDefined(g)) {
				return;
			}
			expect(g.getDataAsWhite(A, B)).toEqual(new EdgeMetadata(0, 0, 1));
			expect(g.getDataAsBlack(A, B)).toEqual(undefined);
			expect(g.getDataAsWhite(A, C)).toEqual(undefined);
			expect(g.getDataAsBlack(A, C)).toEqual(undefined);
			expect(g.getOutDegree(A)).toBe(1);
			expect(g.getInDegree(A)).toBe(0);
			expect(g.getBlackOpponents(A)).toEqual([B]);
			expect(g.getWhiteOpponents(A)).toEqual([]);
			expect(g.getDataAsWhite(B, A)).toEqual(undefined);
			expect(g.getDataAsBlack(B, A)).toEqual(new EdgeMetadata(1, 0, 0));
			expect(g.getDataAsWhite(B, C)).toEqual(undefined);
			expect(g.getDataAsBlack(B, C)).toEqual(undefined);
			expect(g.getOutDegree(B)).toBe(0);
			expect(g.getInDegree(B)).toBe(1);
			expect(g.getBlackOpponents(B)).toEqual([]);
			expect(g.getWhiteOpponents(B)).toEqual([A]);
			expect(g.getDataAsWhite(C, A)).toEqual(undefined);
			expect(g.getDataAsBlack(C, A)).toEqual(undefined);
			expect(g.getDataAsWhite(C, B)).toEqual(undefined);
			expect(g.getDataAsBlack(C, B)).toEqual(undefined);
			expect(g.getOutDegree(C)).toBe(0);
			expect(g.getInDegree(C)).toBe(0);
			expect(g.getBlackOpponents(C)).toEqual([]);
			expect(g.getWhiteOpponents(C)).toEqual([]);
		}

		graphModifyEdge(A, B, 'black_wins', 'draw', Classical);
		{
			const g = graphFromString(EnvironmentManager.getInstance().getDirGraphsTimeControl(Classical));
			expect(g).not.toBeNull();
			if (isNotDefined(g)) {
				return;
			}
			expect(g.getDataAsWhite(A, B)).toEqual(new EdgeMetadata(0, 1, 0));
			expect(g.getDataAsBlack(A, B)).toEqual(undefined);
			expect(g.getDataAsWhite(A, C)).toEqual(undefined);
			expect(g.getDataAsBlack(A, C)).toEqual(undefined);
			expect(g.getOutDegree(A)).toBe(1);
			expect(g.getInDegree(A)).toBe(0);
			expect(g.getBlackOpponents(A)).toEqual([B]);
			expect(g.getWhiteOpponents(A)).toEqual([]);
			expect(g.getDataAsWhite(B, A)).toEqual(undefined);
			expect(g.getDataAsBlack(B, A)).toEqual(new EdgeMetadata(0, 1, 0));
			expect(g.getDataAsWhite(B, C)).toEqual(undefined);
			expect(g.getDataAsBlack(B, C)).toEqual(undefined);
			expect(g.getOutDegree(B)).toBe(0);
			expect(g.getInDegree(B)).toBe(1);
			expect(g.getBlackOpponents(B)).toEqual([]);
			expect(g.getWhiteOpponents(B)).toEqual([A]);
			expect(g.getDataAsWhite(C, A)).toEqual(undefined);
			expect(g.getDataAsBlack(C, A)).toEqual(undefined);
			expect(g.getDataAsWhite(C, B)).toEqual(undefined);
			expect(g.getDataAsBlack(C, B)).toEqual(undefined);
			expect(g.getOutDegree(C)).toBe(0);
			expect(g.getInDegree(C)).toBe(0);
			expect(g.getBlackOpponents(C)).toEqual([]);
			expect(g.getWhiteOpponents(C)).toEqual([]);
		}

		graphUpdate(C, A, 'white_wins', Classical);
		graphUpdate(C, B, 'black_wins', Classical);

		graphModifyEdge(C, A, 'white_wins', 'draw', Classical);
		{
			const g = graphFromString(EnvironmentManager.getInstance().getDirGraphsTimeControl(Classical));
			expect(g).not.toBeNull();
			if (isNotDefined(g)) {
				return;
			}
			expect(g.getDataAsWhite(A, B)).toEqual(new EdgeMetadata(0, 1, 0));
			expect(g.getDataAsBlack(A, B)).toEqual(undefined);
			expect(g.getDataAsWhite(A, C)).toEqual(undefined);
			expect(g.getDataAsBlack(A, C)).toEqual(new EdgeMetadata(0, 1, 0));
			expect(g.getOutDegree(A)).toBe(1);
			expect(g.getInDegree(A)).toBe(1);
			expect(g.getBlackOpponents(A)).toEqual([B]);
			expect(g.getWhiteOpponents(A)).toEqual([C]);
			expect(g.getDataAsWhite(B, A)).toEqual(undefined);
			expect(g.getDataAsBlack(B, A)).toEqual(new EdgeMetadata(0, 1, 0));
			expect(g.getDataAsWhite(B, C)).toEqual(undefined);
			expect(g.getDataAsBlack(B, C)).toEqual(new EdgeMetadata(1, 0, 0));
			expect(g.getOutDegree(B)).toBe(0);
			expect(g.getInDegree(B)).toBe(2);
			expect(g.getBlackOpponents(B)).toEqual([]);
			expect(g.getWhiteOpponents(B)).toEqual([A, C]);
			expect(g.getDataAsWhite(C, A)).toEqual(new EdgeMetadata(0, 1, 0));
			expect(g.getDataAsBlack(C, A)).toEqual(undefined);
			expect(g.getDataAsWhite(C, B)).toEqual(new EdgeMetadata(0, 0, 1));
			expect(g.getDataAsBlack(C, B)).toEqual(undefined);
			expect(g.getOutDegree(C)).toBe(2);
			expect(g.getInDegree(C)).toBe(0);
			expect(g.getBlackOpponents(C)).toEqual([A, B]);
			expect(g.getWhiteOpponents(C)).toEqual([]);
		}

		graphModifyEdge(C, B, 'black_wins', 'draw', Classical);
		{
			const g = graphFromString(EnvironmentManager.getInstance().getDirGraphsTimeControl(Classical));
			expect(g).not.toBeNull();
			if (isNotDefined(g)) {
				return;
			}
			expect(g.getDataAsWhite(A, B)).toEqual(new EdgeMetadata(0, 1, 0));
			expect(g.getDataAsBlack(A, B)).toEqual(undefined);
			expect(g.getDataAsWhite(A, C)).toEqual(undefined);
			expect(g.getDataAsBlack(A, C)).toEqual(new EdgeMetadata(0, 1, 0));
			expect(g.getOutDegree(A)).toBe(1);
			expect(g.getInDegree(A)).toBe(1);
			expect(g.getBlackOpponents(A)).toEqual([B]);
			expect(g.getWhiteOpponents(A)).toEqual([C]);
			expect(g.getDataAsWhite(B, A)).toEqual(undefined);
			expect(g.getDataAsBlack(B, A)).toEqual(new EdgeMetadata(0, 1, 0));
			expect(g.getDataAsWhite(B, C)).toEqual(undefined);
			expect(g.getDataAsBlack(B, C)).toEqual(new EdgeMetadata(0, 1, 0));
			expect(g.getOutDegree(B)).toBe(0);
			expect(g.getInDegree(B)).toBe(2);
			expect(g.getBlackOpponents(B)).toEqual([]);
			expect(g.getWhiteOpponents(B)).toEqual([A, C]);
			expect(g.getDataAsWhite(C, A)).toEqual(new EdgeMetadata(0, 1, 0));
			expect(g.getDataAsBlack(C, A)).toEqual(undefined);
			expect(g.getDataAsWhite(C, B)).toEqual(new EdgeMetadata(0, 1, 0));
			expect(g.getDataAsBlack(C, B)).toEqual(undefined);
			expect(g.getOutDegree(C)).toBe(2);
			expect(g.getInDegree(C)).toBe(0);
			expect(g.getBlackOpponents(C)).toEqual([A, B]);
			expect(g.getWhiteOpponents(C)).toEqual([]);
		}
	});
});
