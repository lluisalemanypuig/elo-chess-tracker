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
import Debug from 'debug';
const debug = Debug('ELO_CHESS_TRACKER:managers/games');

import { DateFull, DateMajor, DateMinor, logNow, dateFullToMajor, toDateFull } from '@common/utils/time';
import { Player, PlayerPrivateId } from '@common/models/player';
import { Game, GameId, GameResult } from '@common/models/game';
import { User } from '@common/models/user';
import { whereShouldBeInsertedByKey } from '@server/utils/searching';
import { GamesManager } from '@server/managers/games-manager';
import { UsersManager } from '@server/managers/users-manager';
import { RatingSystemManager } from '@server/managers/rating-system-manager';
import { EnvironmentManager } from '@server/managers/environment-manager';
import { userUpdateFromPlayerData } from '@server/managers/users';
import { Rating } from '@common/models/rating-framework/rating';
import { TimeControlId, TimeControlName } from '@common/models/time-control';
import { graphDeleteEdge, graphModifyEdge, graphUpdate } from '@server/managers/graphs';
import { GamesIterator } from '@server/managers/games-iterator';
import { TimeControlRating } from '@common/models/time-control-rating';
import { isDefined, isNotDefined } from '@common/utils/is-defined';

/// Returns g1 < g2 using dates
function gameCompareDates(g: Game): Function {
	return (g2: Game): number => {
		if (g.when < g2.when) {
			return -1;
		}
		if (g.when == g2.when) {
			return 0;
		}
		return 1;
	};
}

/// Return the game where player 'username' is involved with
/// date after later than date 'when'.
function gameNextOfPlayer(username: PlayerPrivateId, timeControlId: TimeControlId, when: DateFull): Game | undefined {
	const gamesDir = EnvironmentManager.getInstance().getDirGamesTimeControl(timeControlId);

	// The file into which we have to add the new game.
	const recordStr = dateFullToMajor(when);

	let gamesIter = new GamesIterator(gamesDir);
	let found = gamesIter.locateFirstGameAfter(recordStr, when);
	if (!found) {
		return undefined;
	}

	// TODO: optimize this function to only iterate over record files present in
	// the user's data.
	while (!gamesIter.endRecordList()) {
		const g = gamesIter.getCurrentGame();
		if (g.isUserInvolved(username)) {
			return g;
		}
		gamesIter.nextGame();
	}
	return undefined;
}

/// Creates a new game with no players using the parameters given
function gameNew(
	title: string,
	white: PlayerPrivateId,
	black: PlayerPrivateId,
	result: GameResult,
	timeControlId: TimeControlId,
	timeControlName: TimeControlName,
	when: DateFull
): Game {
	// retrieve next id and increment maximum id
	const idStr: GameId = GamesManager.getInstance().newGameId();
	debug(logNow(), `ID for new game: ${idStr}`);

	let whiteToAssign: Rating;
	let blackToAssign: Rating;

	{
		// get white's next game in the history
		let next = gameNextOfPlayer(white, timeControlId, when);
		if (next != null) {
			if (next.white == white) {
				// white in this game is also white in the next game
				whiteToAssign = next.whiteRating.clone();
			} else {
				// white in this game is black in the next game
				whiteToAssign = next.blackRating.clone();
			}
		} else {
			// there is no next game for white
			const whiteUser = UsersManager.getInstance().getUserByUsername(white);
			if (isNotDefined(whiteUser)) {
				throw new Error(`White user '${white}' is not in the users database`);
			}
			whiteToAssign = whiteUser.getRating(timeControlId).clone();
		}
	}

	{
		// get black's next game in the history
		let next = gameNextOfPlayer(black, timeControlId, when);
		if (next != null) {
			if (next.white == black) {
				// white in this game is white in the next game
				blackToAssign = next.whiteRating.clone();
			} else {
				// black in this game is also black in the next game
				blackToAssign = next.blackRating.clone();
			}
		} else {
			const blackUser = UsersManager.getInstance().getUserByUsername(black);
			if (isNotDefined(blackUser)) {
				throw new Error(`Black user '${black}' is not in the users database`);
			}
			blackToAssign = blackUser.getRating(timeControlId).clone();
		}
	}

	return new Game(
		idStr,
		title,
		white,
		whiteToAssign,
		black,
		blackToAssign,
		result,
		timeControlId,
		timeControlName,
		when
	);
}

function ratingIntoPlayer(timeControlId: TimeControlId, player: PlayerPrivateId, rating: Rating): Player {
	return new Player(player, [new TimeControlRating(timeControlId, rating.clone())]);
}

/// Updates the given game record
function updateGameRecord(
	gamesIter: GamesIterator,
	timeControlId: TimeControlId,
	updatedPlayers: Player[],
	playerToIndex: Map<string, number>
): void {
	debug(logNow(), `    Updating '${gamesIter.getCurrentRecordName()}'...`);
	debug(logNow(), `    Before update:`);
	for (const player of updatedPlayers) {
		debug(logNow(), `        ${player.username}.`);
		debug(logNow(), `            ${player.getRating(timeControlId).numGames}.`);
		debug(logNow(), `            ${player.getRating(timeControlId).won}.`);
		debug(logNow(), `            ${player.getRating(timeControlId).drawn}.`);
		debug(logNow(), `            ${player.getRating(timeControlId).lost}.`);
	}

	let i: number = 0;
	while (!gamesIter.endRecordSingle()) {
		debug(logNow(), `        Updating game ${i}/${gamesIter.getCurrentGameArray().length}.`);

		let g = gamesIter.getCurrentGame();

		const white = g.white;
		const black = g.black;

		const whiteIdx = playerToIndex.get(white);
		const blackIdx = playerToIndex.get(black);

		const whiteWasUpdated = isDefined(whiteIdx);
		const blackWasUpdated = isDefined(blackIdx);

		if (whiteWasUpdated || blackWasUpdated) {
			// set the player information in the game to the most updated version
			if (whiteWasUpdated) {
				g.whiteRating = updatedPlayers[whiteIdx].getRating(timeControlId).clone();
			}
			if (blackWasUpdated) {
				g.blackRating = updatedPlayers[blackIdx].getRating(timeControlId).clone();
			}

			// calculate result of game
			const [ratingWhiteAfter, ratingBlackAfter] = RatingSystemManager.getInstance().applyRatingFunction(g);

			if (whiteWasUpdated) {
				updatedPlayers[whiteIdx].setRating(timeControlId, ratingWhiteAfter);
			} else {
				updatedPlayers.push(ratingIntoPlayer(timeControlId, white, ratingWhiteAfter));
				playerToIndex.set(white, updatedPlayers.length - 1);
			}

			if (blackWasUpdated) {
				updatedPlayers[blackIdx].setRating(timeControlId, ratingBlackAfter);
			} else {
				updatedPlayers.push(ratingIntoPlayer(timeControlId, black, ratingBlackAfter));
				playerToIndex.set(black, updatedPlayers.length - 1);
			}
		}

		gamesIter.nextGameRecord();
		++i;
	}

	debug(logNow(), `    Updating '${gamesIter.getCurrentRecordName()}'...`);
	debug(logNow(), `    Before update:`);
	for (const player of updatedPlayers) {
		debug(logNow(), `        ${player.username}.`);
		debug(logNow(), `            ${player.getRating(timeControlId).numGames}.`);
		debug(logNow(), `            ${player.getRating(timeControlId).won}.`);
		debug(logNow(), `            ${player.getRating(timeControlId).drawn}.`);
		debug(logNow(), `            ${player.getRating(timeControlId).lost}.`);
	}
}

/**
 * @brief Inserts a game into the entire history
 * @param g Game to be inserted
 * @param recordId Game record id, the file into which we have to add the new game
 * @post Users in the server are update (both memory and user files)
 */
function gameInsertInHistory(g: Game, recordId: DateMajor): void {
	let updatedPlayers: Player[] = [];

	const whiteUsername = g.white;
	const blackUsername = g.black;
	const timeControlId = g.timeControlId;

	{
		let [whiteRatingAfter, blackRatingAfter] = RatingSystemManager.getInstance().applyRatingFunction(g);
		updatedPlayers.push(ratingIntoPlayer(timeControlId, whiteUsername, whiteRatingAfter));
		updatedPlayers.push(ratingIntoPlayer(timeControlId, blackUsername, blackRatingAfter));
	}

	const gamesDir = EnvironmentManager.getInstance().getDirGamesTimeControl(timeControlId);
	const gameRecordFile = path.join(gamesDir, recordId);

	let gamesIter = new GamesIterator(gamesDir);

	// the directory is completely empty
	if (gamesIter.getAllRecords().length == 0) {
		debug(logNow(), `There are no game record files for time control '${timeControlId}'.`);

		fs.writeFileSync(gameRecordFile, JSON.stringify([g], null, 4));
		userUpdateFromPlayerData(updatedPlayers);
		return;
	}

	// there are some files in the directory
	const recordExists = gamesIter.locateRecord(recordId);
	if (!recordExists) {
		debug(logNow(), `The game record for game '${g.id}' does not exist.`);

		fs.writeFileSync(gameRecordFile, JSON.stringify([g], null, 4));
		if (gamesIter.endRecordList()) {
			debug(logNow(), `The new game record file is beyond every other game record.`);

			userUpdateFromPlayerData(updatedPlayers);
			return;
		}
	}

	debug(logNow(), `There is some game record file beyond the current game record -- those have to be updated.`);

	let playerToIndex: Map<string, number> = new Map();
	playerToIndex.set(whiteUsername, 0);
	playerToIndex.set(blackUsername, 1);

	if (recordExists) {
		debug(logNow(), `The game record for game '${g.id}' exists.`);

		let gameSet = gamesIter.getCurrentGameArray();

		const [gameIdx, gameExists] = whereShouldBeInsertedByKey(gameSet, gameCompareDates(g));
		if (gameExists) {
			throw new Error(`Game of the exact same date field '${g.when}' already exists`);
		}

		gameSet.splice(gameIdx, 0, g);

		gamesIter.setToGame(gameIdx + 1);
		updateGameRecord(gamesIter, timeControlId, updatedPlayers, playerToIndex);
		fs.writeFileSync(gameRecordFile, JSON.stringify(gameSet, null, 4));

		gamesIter.nextRecord();
	}

	debug(logNow(), `The game record for game '${g.id}' has been created/updated.`);
	debug(logNow(), `Going to update the next game records.`);

	while (!gamesIter.endRecordList()) {
		updateGameRecord(gamesIter, timeControlId, updatedPlayers, playerToIndex);

		fs.writeFileSync(
			path.join(gamesDir, gamesIter.getCurrentRecordName()),
			JSON.stringify(gamesIter.getCurrentGameArray(), null, 4)
		);

		gamesIter.nextRecord();
	}

	userUpdateFromPlayerData(updatedPlayers);
}

/**
 * @brief Add a game to the server
 * @param g Game
 */
export function gameAddNew(
	title: string,
	white: User,
	black: User,
	result: GameResult,
	timeControlId: TimeControlId,
	timeControlName: TimeControlName,
	gameRecord: DateMajor,
	hhmmss: DateMinor
): void {
	const when = toDateFull(gameRecord + '..' + hhmmss);
	const whiteUsername = white.username;
	const blackUsername = black.username;
	const g = gameNew(title, whiteUsername, blackUsername, result, timeControlId, timeControlName, when);

	white.addGame(timeControlId, gameRecord);
	black.addGame(timeControlId, gameRecord);

	gameInsertInHistory(g, gameRecord);

	GamesManager.getInstance().addGame(g.id, gameRecord, timeControlId);
	graphUpdate(whiteUsername, blackUsername, result, timeControlId);
}

/**
 * @brief Looks for the game of identifier @e gameId.
 * @param gameId The game G to be returned.
 * @returns The game object that has identifier equal to @e gameId.
 */
export function gameFindById(gameId: GameId): Game | undefined {
	const info = GamesManager.getInstance().getGameInfo(gameId);

	// gameId does not exist
	if (isNotDefined(info)) {
		return undefined;
	}

	const timeControlId = info.timeControlId;
	const gameRecord = info.gameRecord;
	const gamesDir = EnvironmentManager.getInstance().getDirGamesTimeControl(timeControlId);

	let gamesIter = new GamesIterator(gamesDir);
	if (gamesIter.getNumberOfRecords() == 0) {
		throw new Error(`There are no game records in database for time control ${timeControlId}.`);
	}

	const res = gamesIter.locateRecord(gameRecord);
	if (!res) {
		throw new Error(`There is no game record '${gameRecord}' in the database for time control ${timeControlId}.`);
	}

	while (!gamesIter.endRecordSingle() && gamesIter.getCurrentGame().id != gameId) {
		gamesIter.nextGameRecord();
	}
	if (gamesIter.endRecordSingle()) {
		return undefined;
	}
	return gamesIter.getCurrentGame();
}

/**
 * @brief Edit a game's result.
 * @param gameId The ID of the game to edit
 * @param newResult The (new) result of the game
 */
export function gameEditResult(gameId: GameId, newResult: GameResult): void {
	const info = GamesManager.getInstance().getGameInfo(gameId);

	// gameId does not exist
	if (isNotDefined(info)) {
		throw new Error(`Game id '${gameId}' does not exist in the Games Manager`);
	}

	const timeControlId = info.timeControlId;
	const gameRecord = info.gameRecord;
	const gamesDir = EnvironmentManager.getInstance().getDirGamesTimeControl(timeControlId);

	let gamesIter = new GamesIterator(gamesDir);
	const found = gamesIter.locateGame(gameRecord, gameId);
	if (!found) {
		throw new Error(`Could not find game '${gameId}'.`);
	}

	let game = gamesIter.getCurrentGame();
	const oldResult = game.result;

	// avoid unnecessary work
	if (oldResult == newResult) {
		return;
	}

	const white = game.white;
	const black = game.black;

	/* Update the graphs */

	graphModifyEdge(white, black, oldResult, newResult, timeControlId);

	/* Update the game files */

	game.result = newResult;

	let updatedPlayers: Player[] = [];
	{
		let [whiteAfter, blackAfter] = RatingSystemManager.getInstance().applyRatingFunction(game);
		updatedPlayers.push(ratingIntoPlayer(timeControlId, white, whiteAfter));
		updatedPlayers.push(ratingIntoPlayer(timeControlId, black, blackAfter));
	}

	let playerToIndex: Map<string, number> = new Map();
	playerToIndex.set(white, 0);
	playerToIndex.set(black, 1);

	// update record of the current game
	gamesIter.nextGameRecord();

	while (!gamesIter.endRecordList()) {
		updateGameRecord(gamesIter, timeControlId, updatedPlayers, playerToIndex);

		fs.writeFileSync(
			path.join(gamesDir, gamesIter.getCurrentRecordName()),
			JSON.stringify(gamesIter.getCurrentGameArray(), null, 4)
		);

		gamesIter.nextRecord();
	}

	userUpdateFromPlayerData(updatedPlayers);
}

/**
 * @brief Edit a game's title
 * @param gameId The ID of the game to edit
 * @param newResult The (new) result of the game
 */
export function gameEditTitle(gameId: GameId, newTitle: string): void {
	const info = GamesManager.getInstance().getGameInfo(gameId);

	// gameId does not exist
	if (isNotDefined(info)) {
		throw new Error(`Game id '${gameId}' does not exist in the Games Manager`);
	}

	const timeControlId = info.timeControlId;
	const gameRecord = info.gameRecord;
	const gamesDir = EnvironmentManager.getInstance().getDirGamesTimeControl(timeControlId);

	let gamesIter = new GamesIterator(gamesDir);
	const found = gamesIter.locateGame(gameRecord, gameId);
	if (!found) {
		throw new Error(`Could not find game '${gameId}'.`);
	}

	let game = gamesIter.getCurrentGame();

	// avoid unnecessary work
	if (game.title == newTitle) {
		return;
	}

	game.title = newTitle;

	const gameRecordFile = path.join(gamesDir, gameRecord);

	let gameSet = gamesIter.getCurrentGameArray();
	fs.writeFileSync(gameRecordFile, JSON.stringify(gameSet, null, 4));
}

export function gameDelete(gameId: GameId): void {
	let gamesManager = GamesManager.getInstance();
	const info = gamesManager.getGameInfo(gameId);

	// gameId does not exist
	if (isNotDefined(info)) {
		throw new Error(`Game id '${gameId}' does not exist in the Games Manager`);
	}

	const timeControlId = info.timeControlId;
	const gameRecord = info.gameRecord;
	const gamesDir = EnvironmentManager.getInstance().getDirGamesTimeControl(timeControlId);

	let gamesIter = new GamesIterator(gamesDir);
	const found = gamesIter.locateGame(gameRecord, gameId);
	if (!found) {
		throw new Error(`Could not find game '${gameId}'.`);
	}

	let game = gamesIter.getCurrentGame();

	const result = game.result;
	const white = game.white;
	const black = game.black;

	/* Update the graphs */

	graphDeleteEdge(white, black, result, timeControlId);

	/* Update the game files */

	let updatedPlayers: Player[] = [];
	{
		const whiteBefore = game.whiteRating;
		const blackBefore = game.blackRating;
		updatedPlayers.push(ratingIntoPlayer(timeControlId, white, whiteBefore));
		updatedPlayers.push(ratingIntoPlayer(timeControlId, black, blackBefore));
	}

	let playerToIndex: Map<string, number> = new Map();
	playerToIndex.set(white, 0);
	playerToIndex.set(black, 1);

	// delete the current game in the record
	gamesIter.deleteCurrentGame();
	const recordIsEmpty = gamesIter.getCurrentGameArray().length == 0;

	while (!gamesIter.endRecordList()) {
		updateGameRecord(gamesIter, timeControlId, updatedPlayers, playerToIndex);

		fs.writeFileSync(
			path.join(gamesDir, gamesIter.getCurrentRecordName()),
			JSON.stringify(gamesIter.getCurrentGameArray(), null, 4)
		);

		gamesIter.nextRecord();
	}

	if (recordIsEmpty) {
		const filename = path.join(gamesDir, gameRecord);
		fs.rmSync(filename);
	}

	/* Update games manager */

	gamesManager.deleteGameId(gameId);

	/* Update all user instances */

	let usersManager = UsersManager.getInstance();

	let w = usersManager.getUserByUsername(white);
	if (isNotDefined(w)) {
		debug(logNow(), `User ${white} could not be found`);
		return;
	}
	w.deleteGame(timeControlId, gameRecord);

	let b = usersManager.getUserByUsername(black);
	if (isNotDefined(b)) {
		debug(logNow(), `User ${black} could not be found`);
		return;
	}
	b.deleteGame(timeControlId, gameRecord);

	userUpdateFromPlayerData(updatedPlayers);
}

export function recalculateAllRatings() {
	const ratingSystem = RatingSystemManager.getInstance();
	const allTimeControls = ratingSystem.getUniqueTimeControlsIds();

	let mem = UsersManager.getInstance();

	// initialize all players to a freshly created player
	let updatedPlayers: Player[] = [];
	let playerToIndex: Map<string, number> = new Map();

	for (let i = 0; i < mem.numUsers(); ++i) {
		const username = (mem.getUserAt(i) as User).username;

		let p = new Player(username, []);
		for (const tc of allTimeControls) {
			p.addRating(tc, ratingSystem.getNewRating());
		}

		updatedPlayers.push(p);
		playerToIndex.set(username, i);
	}

	for (const timeControl of allTimeControls) {
		const gamesDir = EnvironmentManager.getInstance().getDirGamesTimeControl(timeControl);

		let gamesIter = new GamesIterator(gamesDir);
		while (!gamesIter.endRecordList()) {
			updateGameRecord(gamesIter, timeControl, updatedPlayers, playerToIndex);

			fs.writeFileSync(
				path.join(gamesDir, gamesIter.getCurrentRecordName()),
				JSON.stringify(gamesIter.getCurrentGameArray(), null, 4)
			);
			gamesIter.nextRecord();
		}
	}

	userUpdateFromPlayerData(updatedPlayers);
}
