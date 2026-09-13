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

import { PlayerPrivateId } from '@common/models/player-id';
import { gameArrayFromString } from '@server/io/game';
import { graphFullToFile } from '@server/io/graph/graph';
import { writeChallengeToFile } from '@server/managers/challenges';
import { ChallengesManager } from '@server/managers/challenges-manager';
import { EnvironmentManager } from '@server/managers/environment-manager';
import { GraphsManager } from '@server/managers/graphs-manager';
import { serverInitFromConfigurationFile } from '@server/managers/memory/initialization';
import { RatingSystemManager } from '@server/managers/rating-system-manager';
import { writeUserToFile } from '@server/managers/users';
import { UsersManager } from '@server/managers/users-manager';
import { Game } from '@server/models/game';
import { Edge } from '@server/models/graph/edge';
import { Graph } from '@server/models/graph/graph';
import { User } from '@server/models/user';
import { encryptPasswordForUser } from '@server/utils/encrypt';
import { readDirectory } from '@server/utils/read-directory';
import fs from 'fs';
import path from 'path';

function getParameters() {
	const args = process.argv.slice(2);

	const oldUsernameIndex = args.indexOf('--old-username');
	if (oldUsernameIndex === -1) {
		console.log('Missing --old-username parameter');
		process.exit(1);
	}

	const newUsernameIndex = args.indexOf('--new-username');
	if (newUsernameIndex === -1) {
		console.log('Missing --new-username parameter');
		process.exit(1);
	}

	const configurationFileIndex = args.indexOf('--configuration-file');
	if (configurationFileIndex === -1) {
		console.log('Missing --configuration-file parameter');
		process.exit(1);
	}

	const oldUsername = args[oldUsernameIndex + 1] as PlayerPrivateId;
	const newUsername = args[newUsernameIndex + 1] as PlayerPrivateId;
	const configurationFile = args[configurationFileIndex + 1];
	if (!oldUsername || !newUsername || !configurationFile) {
		console.log('All parameters must have a value');
		process.exit(1);
	}

	console.log(`Previous username: '${oldUsername}'`);
	console.log(`New username:      '${newUsername}'`);
	console.log(`Directory:         '${configurationFile}'`);

	return {
		oldUsername,
		newUsername,
		configurationFile,
	};
}

function renamedUsername(
	username: PlayerPrivateId,
	oldUsername: PlayerPrivateId,
	newUsername: PlayerPrivateId,
): PlayerPrivateId {
	return username === oldUsername ? newUsername : username;
}

function rewriteGames(
	oldUsername: PlayerPrivateId,
	newUsername: PlayerPrivateId,
) {
	const gamesDir = EnvironmentManager.getInstance().getDirGames();
	for (const timeControlId of RatingSystemManager.getInstance().getUniqueTimeControlsIds()) {
		const timeControlDir = path.join(gamesDir, timeControlId);
		for (const recordFile of readDirectory(timeControlDir)) {
			const filename = path.join(timeControlDir, recordFile);
			const games = gameArrayFromString(fs.readFileSync(filename, 'utf8'));
			if (games === null) {
				throw new Error(`Could not parse game record '${filename}'.`);
			}

			const renamedGames = games.map(
				(game: Game) =>
					new Game(
						game.id,
						game.title,
						renamedUsername(game.white, oldUsername, newUsername),
						game.whiteRating,
						renamedUsername(game.black, oldUsername, newUsername),
						game.blackRating,
						renamedUsername(game.createdBy, oldUsername, newUsername),
						game.whenCreated,
						game.result,
						game.timeControlId,
						game.timeControlName,
						game.whenPlayed,
						game.history.map((entry) => ({
							...entry,
							who: renamedUsername(entry.who, oldUsername, newUsername),
						})),
					),
			);
			fs.writeFileSync(filename, JSON.stringify(renamedGames, null, 4));
		}
	}
}

function rewriteChallenges(
	oldUsername: PlayerPrivateId,
	newUsername: PlayerPrivateId,
) {
	const manager = ChallengesManager.getInstance();
	const challengesDir = EnvironmentManager.getInstance().getDirChallenges();
	for (let i = 0; i < manager.numChallenges(); ++i) {
		const challenge = manager.getChallengeAt(i);
		if (!challenge) {
			continue;
		}
		challenge.sentBy = renamedUsername(
			challenge.sentBy,
			oldUsername,
			newUsername,
		);
		challenge.sentTo = renamedUsername(
			challenge.sentTo,
			oldUsername,
			newUsername,
		);
		challenge.challengeAcceptedBy =
			challenge.challengeAcceptedBy === undefined
				? undefined
				: renamedUsername(
						challenge.challengeAcceptedBy,
						oldUsername,
						newUsername,
					);
		challenge.resultSetBy =
			challenge.resultSetBy === undefined
				? undefined
				: renamedUsername(challenge.resultSetBy, oldUsername, newUsername);
		challenge.resultAcceptedBy =
			challenge.resultAcceptedBy === undefined
				? undefined
				: renamedUsername(challenge.resultAcceptedBy, oldUsername, newUsername);
		challenge.white =
			challenge.white === undefined
				? undefined
				: renamedUsername(challenge.white, oldUsername, newUsername);
		challenge.black =
			challenge.black === undefined
				? undefined
				: renamedUsername(challenge.black, oldUsername, newUsername);
		writeChallengeToFile(path.join(challengesDir, challenge.id), challenge);
	}
}

function rewriteGraph(
	graph: Graph,
	oldUsername: PlayerPrivateId,
	newUsername: PlayerPrivateId,
) {
	const renamedGraph = new Graph();
	for (const username of graph.getOutEntries()) {
		const renamedSource = renamedUsername(username, oldUsername, newUsername);
		const edges = graph.getOutgoingEdges(username) || [];
		for (const edge of edges) {
			renamedGraph.addEdgeRaw(
				renamedSource,
				renamedUsername(edge.neighbor, oldUsername, newUsername),
				new Edge(
					renamedUsername(edge.neighbor, oldUsername, newUsername),
					edge.metadata.clone(),
				),
			);
		}
	}
	return renamedGraph;
}

function rewriteGraphs(
	oldUsername: PlayerPrivateId,
	newUsername: PlayerPrivateId,
) {
	const environment = EnvironmentManager.getInstance();
	for (const timeControlId of RatingSystemManager.getInstance().getUniqueTimeControlsIds()) {
		const graph = GraphsManager.getInstance().getGraph(timeControlId);
		if (!graph) {
			throw new Error(`Graph for '${timeControlId}' is not loaded.`);
		}
		const renamedGraph = rewriteGraph(graph, oldUsername, newUsername);
		const graphDir = environment.getDirGraphsTimeControl(timeControlId);
		for (const filename of readDirectory(graphDir)) {
			fs.rmSync(path.join(graphDir, filename));
		}
		graphFullToFile(graphDir, renamedGraph);
	}
}

function validateUserRename(
	oldUsername: PlayerPrivateId,
	newUsername: PlayerPrivateId,
) {
	const manager = UsersManager.getInstance();
	if (!manager.exists(oldUsername)) {
		throw new Error(`User '${oldUsername}' does not exist.`);
	}
	if (manager.exists(newUsername)) {
		throw new Error(`User '${newUsername}' already exists.`);
	}
}

function rewriteUser(
	oldUsername: PlayerPrivateId,
	newUsername: PlayerPrivateId,
) {
	const manager = UsersManager.getInstance();
	const userData = manager.getAllUserDataByPrivateId(oldUsername);
	if (!userData) {
		throw new Error(`User '${oldUsername}' does not exist.`);
	}

	const user = userData.user;
	const [encrypted, iv] = encryptPasswordForUser(newUsername, '1234');
	const renamedUser = new User(
		newUsername,
		user.firstName,
		user.lastName,
		{ encrypted, iv },
		user.roles,
		user.games,
		user.ratings,
	);
	const usersDir = EnvironmentManager.getInstance().getDirUsers();
	writeUserToFile(path.join(usersDir, newUsername), renamedUser);
	fs.rmSync(path.join(usersDir, oldUsername));
	manager.replaceUser(renamedUser, userData.index);
}

const params = getParameters();

serverInitFromConfigurationFile(params.configurationFile);
validateUserRename(params.oldUsername, params.newUsername);
rewriteGames(params.oldUsername, params.newUsername);
rewriteChallenges(params.oldUsername, params.newUsername);
rewriteGraphs(params.oldUsername, params.newUsername);
rewriteUser(params.oldUsername, params.newUsername);
console.log(`Renamed '${params.oldUsername}' to '${params.newUsername}'.`);
