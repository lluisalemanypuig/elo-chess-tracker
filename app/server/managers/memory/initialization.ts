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
import Debug from 'debug';
const debug = Debug('ELO_CHESS_TRACKER:managers/initialization');

import { logNow, toDateMajor } from '@common/utils/time';
import { EnvironmentManager } from '@server/managers/environment-manager';
import { ConfigurationManager } from '@server/managers/configuration-manager';
import { ChallengesManager } from '@server/managers/challenges-manager';
import { GamesManager } from '@server/managers/games-manager';
import { UsersManager } from '@server/managers/users-manager';
import { initializeRatingTimeControls, initializeRatingFunctions } from '@server/managers/rating-system';
import { RatingSystemManager } from '@server/managers/rating-system-manager';
import { Game, toGameId } from '@common/models/game';
import { TimeControl, TimeControlArray } from '@common/models/time-control';
import { Graph } from '@common/models/graph/graph';
import { GraphsManager } from '@server/managers/graphs-manager';
import { gameArrayFromString } from '@common/io/game';
import { challengeFromString } from '@common/io/challenge';
import { userFromString } from '@common/io/user';
import { graphFromString } from '@common/io/graph/graph';
import { UsersBehavior } from '@server/managers/users-behavior';
import { readDirectory } from '@server/utils/read-directory';
import { isNotDefined } from '@common/utils/is-defined';
import { RatingFrameworkType } from '@common/models/rating-framework/rating-framework-type';
import { configurationFromString } from '@common/io/configuration';
import { Configuration } from '@common/models/configuration/configuration';
import { Behavior, ChallengesBehavior } from '@common/models/configuration/behavior';
import { Environment, SSLCertificate } from '@common/models/configuration/environment';
import { Ports, ServerConfiguration } from '@common/models/configuration/server';
import { UserPermissions } from '@common/models/configuration/permissions';
import { clearServer } from '@server/managers/memory/clear';
import { initializePermissions } from '@server/managers/user-role-action';
import { writeUserToFile } from '../users';

function initEnvironmentDirectories(baseDirectory: string, executionDirectory: string): void {
	let serverEnv = EnvironmentManager.getInstance();
	serverEnv.setDatabaseBaseDirectory(path.join(baseDirectory, '/database'));
	debug(logNow(), `    Database directory: '${serverEnv.getDirDatabase()}'`);
	debug(logNow(), `        Games directory: '${serverEnv.getDirGames()}'`);
	debug(logNow(), `        Users directory: '${serverEnv.getDirUsers()}'`);
	debug(logNow(), `        Challenges directory: '${serverEnv.getDirChallenges()}'`);
	debug(logNow(), `        Graphs directory: '${serverEnv.getDirGraphs()}'`);

	serverEnv.setExecutionEnvironment(executionDirectory);
}

function initEnvironmentSSL(baseDirectory: string, ssl: SSLCertificate): void {
	let env = EnvironmentManager.getInstance();
	env.setSSLInfo(path.join(baseDirectory, '/ssl'), ssl);
	debug(logNow(), `    SSL base directory: '${env.getDirSsl()}'`);
	debug(logNow(), `        Public key file: '${env.getSslPublicKeyFile()}'`);
	debug(logNow(), `        Private key file: '${env.getSslPrivateKeyFile()}'`);
	debug(logNow(), `        Passphrase: '${env.getSslPassphraseFile()}'`);
}

function initEnvironmentIconFilePaths(baseDirectory: string, env: Environment): void {
	EnvironmentManager.getInstance().setIconsInfo(path.join(baseDirectory, '/icons'), env);
}

function initEnvironmentPageTitles(env: Environment): void {
	EnvironmentManager.getInstance().setTitlesInfo(env.loginPage.title, env.homePage.title);
}

function initEnvironment(baseDirectory: string, env: Environment): void {
	const executionDirectory = process.cwd();
	initEnvironmentDirectories(baseDirectory, executionDirectory);
	initEnvironmentSSL(baseDirectory, env.sslCertificate);
	initEnvironmentPageTitles(env);
	initEnvironmentIconFilePaths(baseDirectory, env);
}

function initServerPorts(ports: Ports): void {
	let serverConf = ConfigurationManager.getInstance();
	serverConf.setPortHttp(ports.http);
	serverConf.setPortHttps(ports.https);
	debug(logNow(), `    Configuration parameters:`);
	debug(logNow(), `        HTTP : ${serverConf.getPortHttp()}`);
	debug(logNow(), `        HTTPS: ${serverConf.getPortHttps()}`);
}

function initServer(conf: ServerConfiguration): void {
	let serverConf = ConfigurationManager.getInstance();

	serverConf.setDomainName(conf.domainName);
	debug(logNow(), `        Domain name: ${serverConf.getDomainName()}`);

	initServerPorts(conf.ports);
}

function initUserPermissions(permissions: UserPermissions): void {
	debug(logNow(), 'Initialize permissions...');

	initializePermissions(permissions);
}

function initRatingFramework(ratingType: RatingFrameworkType): void {
	debug(logNow(), `    Rating system: '${ratingType}'`);

	initializeRatingFunctions(ratingType);
}

function initTimeControls(timeControls: TimeControlArray): void {
	debug(logNow(), 'Initialize time controls...');

	debug(logNow(), `    Found '${timeControls.length}' rating types:`);

	let allTimeControls: TimeControl[] = [];
	for (let tc of timeControls) {
		allTimeControls.push({ id: tc.id, name: tc.name });

		debug(logNow(), `        * Id '${tc.id}'`);
		debug(logNow(), `          Name '${tc.name}'`);
	}

	initializeRatingTimeControls(allTimeControls);

	// create directories for the time controls in the 'games' directory
	const gamesDir = EnvironmentManager.getInstance().getDirGames();
	for (let i = 0; i < allTimeControls.length; ++i) {
		const idDir = path.join(gamesDir, allTimeControls[i].id);
		if (!fs.existsSync(idDir)) {
			fs.mkdirSync(idDir);
		}
	}
}

function initBehaviorChallenges(challenges: ChallengesBehavior): void {
	let behavior = UsersBehavior.getInstance();
	behavior.setHigherRatedDeclineChallengeLowerRated(
		challenges.higherRatedPlayerCanDeclineChallengeFromLowerRatedPlayer
	);
}

function initBehavior(behavior: Behavior): void {
	debug(logNow(), 'Initialize behaviours...');

	initBehaviorChallenges(behavior.challenges);
}

function initUserSessionIds(): void {
	debug(logNow(), 'Initialize sessions...');
}

function initUsers(): void {
	debug(logNow(), 'Initialize users...');

	const ratingSystem = RatingSystemManager.getInstance();
	const uniqueTimeControlsIds = ratingSystem.getUniqueTimeControlsIds();
	const newRating = ratingSystem.getNewRating();
	const usersDir = EnvironmentManager.getInstance().getDirUsers();
	let userManager = UsersManager.getInstance();

	debug(logNow(), `    Reading directory '${usersDir}'`);
	const allUserFiles = readDirectory(usersDir);

	for (let i = 0; i < allUserFiles.length; ++i) {
		const userFile = path.join(usersDir, allUserFiles[i]);

		debug(logNow(), `        Reading file '${userFile}'`);
		const userStr = fs.readFileSync(userFile, 'utf8');
		const user = userFromString(userStr);
		if (isNotDefined(user)) {
			throw new Error(`Could not parse user at index '${i}', at file '${userFile}'.`);
		}
		debug(logNow(), `        User '${user.username}' is at index '${i}'`);

		// maybe the file the user was read from has to be updated
		let updateUserFile: boolean = false;
		// make sure that all users have a rating for every time control
		for (const timeControlId of uniqueTimeControlsIds) {
			if (!user.hasRating(timeControlId)) {
				user.addRating(timeControlId, newRating.clone());
				updateUserFile = true;
			}
		}

		userManager.addUser(user);
		if (updateUserFile) {
			debug(logNow(), `Overwriting file '${userFile}' of user '${user.username}'`);
			writeUserToFile(userFile, user);
		}
	}
	debug(logNow(), `    Found ${userManager.numUsers()} users.`);
}

function initChallenges(): void {
	debug(logNow(), 'Initialize challenges...');

	const challengesDir = EnvironmentManager.getInstance().getDirChallenges();
	let challenges = ChallengesManager.getInstance();
	let maxChallengeId: string = '0';

	debug(logNow(), `    Reading directory '${challengesDir}'`);
	const allChallengesFiles = readDirectory(challengesDir);

	for (let i = 0; i < allChallengesFiles.length; ++i) {
		const challengeFile = path.join(challengesDir, allChallengesFiles[i]);

		debug(logNow(), `        Reading file '${challengeFile}'`);
		const challengeData = fs.readFileSync(challengeFile, 'utf8');
		const c = challengeFromString(challengeData);
		if (isNotDefined(c)) {
			throw new Error(`Challenge at index '${i}' could not be parsed.`);
			continue;
		}
		challenges.addChallenge(c);

		maxChallengeId = maxChallengeId < c.id ? c.id : maxChallengeId;
	}

	challenges.setMaxChallengeId(parseInt(maxChallengeId));

	debug(logNow(), `    Found ${challenges.numChallenges()} challenges.`);
	debug(logNow(), `    Maximum challenge id ${maxChallengeId}.`);
}

function initGames(): void {
	debug(logNow(), 'Initialize games...');

	const ratings = RatingSystemManager.getInstance();
	let games = GamesManager.getInstance();
	let numGames: number = 0;
	let maxGameId = toGameId('0');

	for (const id of ratings.getUniqueTimeControlsIds()) {
		const gamesDir = EnvironmentManager.getInstance().getDirGamesTimeControl(id);

		debug(logNow(), `    Reading directory '${gamesDir}'`);
		const allDateRecordFiles = readDirectory(gamesDir).map(toDateMajor);

		for (let i = 0; i < allDateRecordFiles.length; ++i) {
			const gameRecordFile = path.join(gamesDir, allDateRecordFiles[i]);

			debug(logNow(), `        Reading file '${gameRecordFile}'`);
			const gameRecordData = fs.readFileSync(gameRecordFile, 'utf8');
			const gameSet = gameArrayFromString(gameRecordData);
			if (isNotDefined(gameSet)) {
				throw new Error(`File '${gameRecordFile}' could not be parsed.`);
			}

			for (let j = 0; j < gameSet.length; ++j) {
				const g = gameSet[j] as Game;
				const gameId = g.id;
				maxGameId = maxGameId < gameId ? gameId : maxGameId;

				games.addGame(g.id, allDateRecordFiles[i], g.timeControlId);
			}

			numGames += gameSet.length;
		}
	}

	games.setMaxGameId(parseInt(maxGameId));

	debug(logNow(), `    Found ${numGames} games.`);
	debug(logNow(), `    Maximum game id ${maxGameId}.`);
}

function initGraphs(): void {
	debug(logNow(), 'Initialize graphs...');

	const ratings = RatingSystemManager.getInstance();
	let graphManager = GraphsManager.getInstance();

	for (const timeControlId of ratings.getUniqueTimeControlsIds()) {
		const graphsDir = EnvironmentManager.getInstance().getDirGraphsTimeControl(timeControlId);

		if (!fs.existsSync(graphsDir)) {
			fs.mkdirSync(graphsDir);
			graphManager.addGraph(timeControlId, new Graph());
		} else {
			debug(logNow(), `    Found directory ${graphsDir}`);
			const graph = graphFromString(graphsDir);
			if (isNotDefined(graph)) {
				throw new Error(`Could not read graph from directory '${graphsDir}'.`);
			}
			graphManager.addGraph(timeControlId, graph);
		}
	}
}

export function serverInitFromData(baseDirectory: string, configuration: Configuration): void {
	debug(logNow(), `    Webpage base directory: '${baseDirectory}'`);

	clearServer();

	initEnvironment(baseDirectory, configuration.environment);
	initServer(configuration.server);
	initUserPermissions(configuration.permissions);
	initRatingFramework(configuration.ratingSystem);
	initTimeControls(configuration.timeControls);

	initBehavior(configuration.behavior);

	initUserSessionIds();
	initUsers();
	initChallenges();
	initGames();
	initGraphs();
}

/// Initializes the server memory
export function serverInitFromConfigurationFile(configurationFile: string): void {
	debug(logNow(), `Reading configuration file '${configurationFile}'`);

	const data = fs.readFileSync(configurationFile, 'utf8');
	const configuration = configurationFromString(data);
	if (isNotDefined(configuration)) {
		debug(logNow(), `Configuration file '${configurationFile}' not found.`);
		return;
	}

	const basePath = configurationFile.substring(0, configurationFile.lastIndexOf('/'));
	serverInitFromData(basePath, configuration);
}

export function serverInitFromParameters(args: string[]): void {
	let configurationFile: string = '';
	for (let i = 0; i < args.length; ++i) {
		if (args[i] === 'configuration-file') {
			configurationFile = args[i + 1];
			++i;
		} else {
			debug(logNow(), "Error: invalid option '" + configurationFile + "'.");
		}
	}

	if (configurationFile === '') {
		debug(logNow(), 'Error: configuration file parameter is missing');
		return;
	}

	serverInitFromConfigurationFile(configurationFile);
}
