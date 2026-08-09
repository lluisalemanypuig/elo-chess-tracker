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

import { serverInitFromData } from '@server/managers/memory/initialization';
import { clearServer } from '@server/managers/memory/clear';
import { RatingSystemManager } from '@server/managers/rating-system-manager';
import { EnvironmentManager } from '@server/managers/environment-manager';
import { ConfigurationManager } from '@server/managers/configuration-manager';
import { ChallengesManager } from '@server/managers/challenges-manager';
import { GamesManager } from '@server/managers/games-manager';
import { SessionIDManager } from '@server/managers/session-id-manager';
import { UsersManager } from '@server/managers/users-manager';
import { run_command } from '@tests/exec-utils';
import { GraphsManager } from '@server/managers/graphs-manager';
import { Graph } from '@common/models/graph/graph';
import { Configuration } from '@common/models/configuration/configuration';
import { toTimeControlId, toTimeControlName } from '@common/models/time-control';

const webpage_dir = 'tests/webpage';
const icons_dir = path.join(webpage_dir, 'icons');
const ssl_dir = path.join(webpage_dir, 'ssl');
const db_dir = path.join(webpage_dir, 'database');
const db_users_dir = path.join(db_dir, 'users');
const db_challenges_dir = path.join(db_dir, 'challenges');
const db_games_dir = path.join(db_dir, 'games');
const db_games_Classical_dir = path.join(db_games_dir, 'Classical');
const db_games_Rapid_dir = path.join(db_games_dir, 'Rapid');
const db_games_Blitz_dir = path.join(db_games_dir, 'Blitz');

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
		domainName: 'my_domain',
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

describe('Configure server', () => {
	test('Load an empty server', async () => {
		await run_command('./tests/initialize-empty.sh');
		expect(() => serverInitFromData('tests/webpage', configuration)).not.toThrow();
	});

	test('Check RatingSystemManager', () => {
		const ratingSystem_manager = RatingSystemManager.getInstance();

		expect(ratingSystem_manager.isTimeControlIdValid(Classical)).toBe(true);
		expect(ratingSystem_manager.isTimeControlIdValid(toTimeControlId('classical'))).toBe(false);
		expect(ratingSystem_manager.isTimeControlIdValid(Rapid)).toBe(true);
		expect(ratingSystem_manager.isTimeControlIdValid(toTimeControlId('rapid'))).toBe(false);
		expect(ratingSystem_manager.isTimeControlIdValid(Blitz)).toBe(true);
		expect(ratingSystem_manager.isTimeControlIdValid(toTimeControlId('blitz'))).toBe(false);

		const unique_ids = ratingSystem_manager.getUniqueTimeControlsIds();
		expect(
			unique_ids.find((val: string): boolean => {
				return val == Rapid;
			})
		).toEqual(Rapid);

		expect(
			unique_ids.find((val: string): boolean => {
				return val == Blitz;
			})
		).toEqual(Blitz);

		expect(ratingSystem_manager.getTimeControls().length).toBe(4);
		expect(ratingSystem_manager.getUniqueTimeControlsIds().length).toBe(3);
	});

	test('Check UsersManager', () => {
		const users_manager = UsersManager.getInstance();
		expect(users_manager.numUsers()).toBe(0);
	});

	test('Check ChallengesManager', () => {
		const challenges_manager = ChallengesManager.getInstance();
		expect(challenges_manager.numChallenges()).toBe(0);
	});

	test('Check GamesManager', () => {
		const games_manager = GamesManager.getInstance();
		expect(games_manager.getMaxGameId()).toBe('0000000000');
	});

	test('Check ConfigurationManager', () => {
		const configuration_manager = ConfigurationManager.getInstance();
		expect(configuration_manager.getPortHttp()).toBe('8080');
		expect(configuration_manager.getPortHttps()).toBe('8443');
		expect(configuration_manager.getDomainName()).toBe('my_domain');
	});

	test('Check SessionIDManager', () => {
		const session_manager = SessionIDManager.getInstance();
		expect(session_manager.numSessionIds()).toBe(0);
	});

	test('Check Environmentmanager', () => {
		const environment_manager = EnvironmentManager.getInstance();

		expect(environment_manager.getDirDatabase()).toEqual(db_dir);
		expect(environment_manager.getDirGames()).toEqual(db_games_dir);
		expect(environment_manager.getDirGamesTimeControl(Classical)).toEqual(db_games_Classical_dir);
		expect(environment_manager.getDirGamesTimeControl(Rapid)).toEqual(db_games_Rapid_dir);
		expect(environment_manager.getDirGamesTimeControl(Blitz)).toEqual(db_games_Blitz_dir);
		expect(environment_manager.getDirUsers()).toEqual(db_users_dir);
		expect(environment_manager.getDirChallenges()).toEqual(db_challenges_dir);

		expect(fs.existsSync(db_games_Classical_dir)).toBe(true);
		expect(fs.existsSync(db_games_Rapid_dir)).toBe(true);
		expect(fs.existsSync(db_games_Blitz_dir)).toBe(true);

		expect(environment_manager.getDirSsl()).toEqual(ssl_dir);
		expect(environment_manager.getSslPublicKeyFile()).toEqual(path.join(ssl_dir, 'sadf'));
		expect(environment_manager.getSslPrivateKeyFile()).toEqual(path.join(ssl_dir, 'qwer'));
		expect(environment_manager.getSslPassphraseFile()).toEqual(path.join(ssl_dir, 'kgj68'));

		expect(environment_manager.getDirIcons()).toEqual(icons_dir);
		expect(environment_manager.getIconFavicon()).toEqual(path.join(icons_dir, 'favicon.png'));
		expect(environment_manager.getIconLoginPage()).toEqual(path.join(icons_dir, 'login.png'));
		expect(environment_manager.getIconHomePage()).toEqual(path.join(icons_dir, 'home.png'));

		expect(environment_manager.getTitleLoginPage()).toEqual('Login title');
		expect(environment_manager.getTitleHomePage()).toEqual('Home title');
	});

	test('Check GraphsManager', () => {
		const graphs_manager = GraphsManager.getInstance();
		expect(graphs_manager.getGraph(Blitz)).toEqual(new Graph());
		expect(graphs_manager.getGraph(Rapid)).toEqual(new Graph());
		expect(graphs_manager.getGraph(Classical)).toEqual(new Graph());
	});

	test('Clear the server memory', () => {
		expect(() => clearServer()).not.toThrow();
	});

	test('Check RatingSystemManager', () => {
		const ratingSystem_manager = RatingSystemManager.getInstance();

		expect(ratingSystem_manager.isTimeControlIdValid(Classical)).toBe(false);
		expect(ratingSystem_manager.isTimeControlIdValid(Classical)).toBe(false);
		expect(ratingSystem_manager.isTimeControlIdValid(Rapid)).toBe(false);
		expect(ratingSystem_manager.isTimeControlIdValid(Rapid)).toBe(false);
		expect(ratingSystem_manager.isTimeControlIdValid(Blitz)).toBe(false);
		expect(ratingSystem_manager.isTimeControlIdValid(Blitz)).toBe(false);

		const unique_ids = ratingSystem_manager.getUniqueTimeControlsIds();
		expect(
			unique_ids.find((val: string): boolean => {
				return val == Rapid;
			})
		).toEqual(undefined);

		expect(
			unique_ids.find((val: string): boolean => {
				return val == Blitz;
			})
		).toEqual(undefined);

		expect(ratingSystem_manager.getTimeControls().length).toBe(0);
		expect(ratingSystem_manager.getUniqueTimeControlsIds().length).toBe(0);
	});

	test('Check UsersManager', () => {
		const users_manager = UsersManager.getInstance();
		expect(users_manager.numUsers()).toBe(0);
	});

	test('Check ChallengesManager', () => {
		const challenges_manager = ChallengesManager.getInstance();
		expect(challenges_manager.numChallenges()).toBe(0);
	});

	test('Check GamesManager', () => {
		const games_manager = GamesManager.getInstance();
		expect(games_manager.getMaxGameId()).toBe('0000000000');
	});

	test('Check ConfigurationManager', () => {
		const configuration_manager = ConfigurationManager.getInstance();
		expect(configuration_manager.getPortHttp()).toBe('');
		expect(configuration_manager.getPortHttps()).toBe('');
	});

	test('Check SessionIDManager', () => {
		const session_manager = SessionIDManager.getInstance();
		expect(session_manager.numSessionIds()).toBe(0);
	});

	test('Check Environmentmanager', () => {
		const environment_manager = EnvironmentManager.getInstance();

		expect(environment_manager.getDirDatabase()).toEqual('');
		expect(environment_manager.getDirGames()).toEqual('');
		expect(environment_manager.getDirUsers()).toEqual('');
		expect(environment_manager.getDirChallenges()).toEqual('');

		expect(environment_manager.getDirSsl()).toEqual('');
		expect(environment_manager.getSslPublicKeyFile()).toEqual('');
		expect(environment_manager.getSslPrivateKeyFile()).toEqual('');
		expect(environment_manager.getSslPassphraseFile()).toEqual('');

		expect(environment_manager.getDirIcons()).toEqual('');
		expect(environment_manager.getIconFavicon()).toEqual('');
		expect(environment_manager.getIconLoginPage()).toEqual('');
		expect(environment_manager.getIconHomePage()).toEqual('');

		expect(environment_manager.getTitleLoginPage()).toEqual('');
		expect(environment_manager.getTitleHomePage()).toEqual('');
	});

	test('Check GraphsManager', () => {
		const graphs_manager = GraphsManager.getInstance();
		expect(graphs_manager.getGraph(Blitz)).toEqual(undefined);
		expect(graphs_manager.getGraph(Rapid)).toEqual(undefined);
		expect(graphs_manager.getGraph(Classical)).toEqual(undefined);
	});
});
