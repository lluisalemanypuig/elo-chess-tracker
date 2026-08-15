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
import { canUserCreateGame, canUserDeleteGame, canUserEditGame } from '@server/managers/user-relationships';
import { PublicError } from '@server/utils/error-types/public-error';
import { InternalError } from '@server/utils/error-types/internal-error';

function writeGameArrayToFile(filename: string, gs: Game[]) {
	fs.writeFileSync(filename, JSON.stringify(gs, null, 4));
}

function gameCompareDates(g: Game): Function {
	return (g2: Game): number => {
		if (g.when < g2.when) {
			return -1;
		}
		if (g.when === g2.when) {
			return 0;
		}
		return 1;
	};
}

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

	let nextWhiteGame = gameNextOfPlayer(white, timeControlId, when);
	if (isDefined(nextWhiteGame)) {
		if (nextWhiteGame.white === white) {
			// white in this game is also white in the next game
			whiteToAssign = nextWhiteGame.whiteRating.clone();
		} else {
			// white in this game is black in the next game
			whiteToAssign = nextWhiteGame.blackRating.clone();
		}
	} else {
		// there is no next game for white
		const whiteData = UsersManager.getInstance().getAllUserDataByPrivateId(white);
		if (isNotDefined(whiteData)) {
			throw new InternalError(`White user '${white}' is not in the users database`);
		}
		whiteToAssign = whiteData.user.getRating(timeControlId).clone();
	}

	let nextBlackGame = gameNextOfPlayer(black, timeControlId, when);
	if (isDefined(nextBlackGame)) {
		if (nextBlackGame.white === black) {
			// white in this game is white in the next game
			blackToAssign = nextBlackGame.whiteRating.clone();
		} else {
			// black in this game is also black in the next game
			blackToAssign = nextBlackGame.blackRating.clone();
		}
	} else {
		const blackData = UsersManager.getInstance().getAllUserDataByPrivateId(black);
		if (isNotDefined(blackData)) {
			throw new InternalError(`Black user '${black}' is not in the users database`);
		}
		blackToAssign = blackData.user.getRating(timeControlId).clone();
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

function updateGameRecord(
	gamesIter: GamesIterator,
	timeControlId: TimeControlId,
	updatedPlayers: Player[],
	playerToIndex: Map<string, number>
) {
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

function gameInsertInHistory(g: Game, recordId: DateMajor) {
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
	if (gamesIter.getAllRecords().length === 0) {
		debug(logNow(), `There are no game record files for time control '${timeControlId}'.`);

		writeGameArrayToFile(gameRecordFile, [g]);
		userUpdateFromPlayerData(updatedPlayers);
		return;
	}

	// there are some files in the directory
	const recordExists = gamesIter.locateRecord(recordId);
	if (!recordExists) {
		debug(logNow(), `The game record for game '${g.id}' does not exist.`);

		writeGameArrayToFile(gameRecordFile, [g]);
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
			throw new InternalError(`Game of the exact same date field '${g.when}' already exists`);
		}

		gameSet.splice(gameIdx, 0, g);

		gamesIter.setToGame(gameIdx + 1);
		updateGameRecord(gamesIter, timeControlId, updatedPlayers, playerToIndex);
		writeGameArrayToFile(gameRecordFile, gameSet);

		gamesIter.nextRecord();
	}

	debug(logNow(), `The game record for game '${g.id}' has been created/updated.`);
	debug(logNow(), `Going to update the next game records.`);

	while (!gamesIter.endRecordList()) {
		updateGameRecord(gamesIter, timeControlId, updatedPlayers, playerToIndex);

		writeGameArrayToFile(path.join(gamesDir, gamesIter.getCurrentRecordName()), gamesIter.getCurrentGameArray());

		gamesIter.nextRecord();
	}

	userUpdateFromPlayerData(updatedPlayers);
}

export function gameAddNew(
	gameTitle: string,
	white: User,
	black: User,
	result: GameResult,
	timeControlId: TimeControlId,
	timeControlName: TimeControlName,
	gameDate: DateMajor,
	gameTime: DateMinor
) {
	if (white.username === black.username) {
		throw new PublicError('The players cannot be the same.');
	}

	if (gameDate === '') {
		throw new PublicError('The selected date is incorrect.');
	}
	if (gameTime === '') {
		throw new PublicError('The selected time is incorrect.');
	}

	debug(logNow(), `    Title: '${gameTitle}'`);
	debug(logNow(), `    White: '${white.username}'`);
	debug(logNow(), `    Black: '${black.username}'`);
	debug(logNow(), `    Result: '${result}'`);
	debug(logNow(), `    Time control id: '${timeControlId}'`);
	debug(logNow(), `    Time control name: '${timeControlName}'`);
	debug(logNow(), `    Date of game: '${gameDate}'`);
	debug(logNow(), `    Time of game: '${gameTime}'`);

	debug(logNow(), `Adding the new game`);

	const when = toDateFull(gameDate + '..' + gameTime);
	const g = gameNew(gameTitle, white.username, black.username, result, timeControlId, timeControlName, when);

	white.addGame(timeControlId, gameDate);
	black.addGame(timeControlId, gameDate);

	gameInsertInHistory(g, gameDate);

	GamesManager.getInstance().addGame(g.id, gameDate, timeControlId);
	graphUpdate(white.username, black.username, result, timeControlId);
}

export function gameAddNewGuarded(
	creator: User,
	gameTitle: string,
	white: User,
	black: User,
	result: GameResult,
	timeControlId: TimeControlId,
	timeControlName: TimeControlName,
	gameDate: DateMajor,
	gameTime: DateMinor
) {
	if (!canUserCreateGame(creator, white, black)) {
		debug(logNow(), `User cannot create this game.`);
		throw new PublicError('You cannot create this game.');
	}
	gameAddNew(gameTitle, white, black, result, timeControlId, timeControlName, gameDate, gameTime);
}

export function gameEditResult(editor: User, gameId: GameId, newResult: GameResult) {
	if (!editor.canDo('EDIT_GAMES')) {
		debug(logNow(), `User '${editor.username}' cannot edit games.`);
		throw new PublicError('You cannot edit games');
	}

	const info = GamesManager.getInstance().getGameInfo(gameId);
	if (isNotDefined(info)) {
		throw new PublicError(`Could not find information associated to this game.`);
	}

	const timeControlId = info.timeControlId;
	const gameRecord = info.gameRecord;
	const gamesDir = EnvironmentManager.getInstance().getDirGamesTimeControl(timeControlId);

	const gamesIter = new GamesIterator(gamesDir);
	const found = gamesIter.locateGame(gameRecord, gameId);
	if (!found) {
		throw new PublicError(`Could not find game '${gameId}'.`);
	}

	const game = gamesIter.getCurrentGame();
	if (isNotDefined(game)) {
		throw new PublicError(`Game was not found.`);
	}

	const oldResult = game.result;
	if (oldResult === newResult) {
		return;
	}

	const manager = UsersManager.getInstance();

	const white = manager.getAllUserDataByPrivateId(game.white);
	const black = manager.getAllUserDataByPrivateId(game.black);

	if (isNotDefined(white)) {
		debug(logNow(), `Public id '${game.white}' for White is not valid.`);
		throw new PublicError('Invalid white user sent to the server.');
	}
	if (isNotDefined(black)) {
		debug(logNow(), `Public id '${game.black}' for Black is not valid.`);
		throw new PublicError('Invalid black user sent to the server.');
	}

	if (!canUserEditGame(editor, white.user, black.user)) {
		throw new PublicError(`You lack permissions to edit this game.`);
	}

	debug(logNow(), `Editing game...`);

	/* Update the graphs */

	graphModifyEdge(white.user.username, black.user.username, oldResult, newResult, timeControlId);

	/* Update the game files */

	game.result = newResult;

	const updatedPlayers: Player[] = [];
	{
		const [whiteAfter, blackAfter] = RatingSystemManager.getInstance().applyRatingFunction(game);
		updatedPlayers.push(ratingIntoPlayer(timeControlId, white.user.username, whiteAfter));
		updatedPlayers.push(ratingIntoPlayer(timeControlId, black.user.username, blackAfter));
	}

	const playerToIndex = new Map<string, number>();
	playerToIndex.set(white.user.username, 0);
	playerToIndex.set(black.user.username, 1);

	// update record of the current game
	gamesIter.nextGameRecord();

	while (!gamesIter.endRecordList()) {
		updateGameRecord(gamesIter, timeControlId, updatedPlayers, playerToIndex);
		writeGameArrayToFile(path.join(gamesDir, gamesIter.getCurrentRecordName()), gamesIter.getCurrentGameArray());
		gamesIter.nextRecord();
	}

	userUpdateFromPlayerData(updatedPlayers);
}

export function gameEditTitle(editor: User, gameId: GameId, newTitle: string) {
	if (!editor.canDo('EDIT_GAMES')) {
		debug(logNow(), `User '${editor.username}' cannot edit games.`);
		throw new PublicError('You cannot edit games');
	}

	const info = GamesManager.getInstance().getGameInfo(gameId);
	if (isNotDefined(info)) {
		throw new PublicError(`Could not find information associated to this game.`);
	}

	const timeControlId = info.timeControlId;
	const gameRecord = info.gameRecord;
	const gamesDir = EnvironmentManager.getInstance().getDirGamesTimeControl(timeControlId);

	const gamesIter = new GamesIterator(gamesDir);
	const found = gamesIter.locateGame(gameRecord, gameId);
	if (!found) {
		debug(logNow(), `Could not find game '${gameId}'.`);
		throw new PublicError(`Could not find game.`);
	}

	const game = gamesIter.getCurrentGame();
	if (isNotDefined(game)) {
		throw new PublicError(`Game was not found.`);
	}

	// avoid unnecessary work
	if (game.title === newTitle) {
		return;
	}

	const manager = UsersManager.getInstance();

	const white = manager.getAllUserDataByPrivateId(game.white);
	const black = manager.getAllUserDataByPrivateId(game.black);

	if (isNotDefined(white)) {
		debug(logNow(), `Public id '${white}' for White is not valid.`);
		throw new PublicError('Invalid white user sent to the server.');
	}
	if (isNotDefined(black)) {
		debug(logNow(), `Public id '${black}' for Black is not valid.`);
		throw new PublicError('Invalid black user sent to the server.');
	}

	if (!canUserEditGame(editor, white.user, black.user)) {
		debug(
			logNow(),
			`User ${editor.username} is trying to edit a game with users ${white.user.username} and ${black.user.username}`
		);
		throw new PublicError(`You lack permissions to edit this game.`);
	}

	debug(logNow(), `Editing game...`);

	game.title = newTitle;

	const gameRecordFile = path.join(gamesDir, gameRecord);

	let gameSet = gamesIter.getCurrentGameArray();
	writeGameArrayToFile(gameRecordFile, gameSet);
}

export function gameDelete(deleter: User, gameId: GameId) {
	if (!deleter.canDo('DELETE_GAMES')) {
		debug(logNow(), `User '${deleter.username}' cannot delete games.`);
		throw new PublicError('You cannot delete games');
	}

	const gamesManager = GamesManager.getInstance();
	const info = gamesManager.getGameInfo(gameId);

	// gameId does not exist
	if (isNotDefined(info)) {
		throw new PublicError(`Game id '${gameId}' does not exist in the Games Manager`);
	}

	const timeControlId = info.timeControlId;
	const gameRecord = info.gameRecord;
	const gamesDir = EnvironmentManager.getInstance().getDirGamesTimeControl(timeControlId);

	const gamesIter = new GamesIterator(gamesDir);
	const found = gamesIter.locateGame(gameRecord, gameId);
	if (!found) {
		throw new PublicError(`Could not find game '${gameId}'.`);
	}

	const game = gamesIter.getCurrentGame();
	const manager = UsersManager.getInstance();

	const result = game.result;
	const white = manager.getAllUserDataByPrivateId(game.white);
	const black = manager.getAllUserDataByPrivateId(game.black);

	if (isNotDefined(white)) {
		debug(logNow(), `Random id '${white}' for White is not valid.`);
		throw new PublicError('Invalid white user sent to the server.');
	}
	if (isNotDefined(black)) {
		debug(logNow(), `Random id '${black}' for Black is not valid.`);
		throw new PublicError('Invalid black user sent to the server.');
	}

	if (!canUserDeleteGame(deleter, white.user, black.user)) {
		throw new PublicError(`You lack permissions to delete this game.`);
	}

	/* Update the graphs */

	graphDeleteEdge(white.user.username, black.user.username, result, timeControlId);

	/* Update the game files */

	const updatedPlayers: Player[] = [];
	{
		const whiteBefore = game.whiteRating;
		const blackBefore = game.blackRating;
		updatedPlayers.push(ratingIntoPlayer(timeControlId, white.user.username, whiteBefore));
		updatedPlayers.push(ratingIntoPlayer(timeControlId, black.user.username, blackBefore));
	}

	const playerToIndex: Map<string, number> = new Map();
	playerToIndex.set(white.user.username, 0);
	playerToIndex.set(black.user.username, 1);

	// delete the current game in the record
	gamesIter.deleteCurrentGame();
	const recordIsEmpty = gamesIter.getCurrentGameArray().length === 0;

	while (!gamesIter.endRecordList()) {
		updateGameRecord(gamesIter, timeControlId, updatedPlayers, playerToIndex);

		writeGameArrayToFile(path.join(gamesDir, gamesIter.getCurrentRecordName()), gamesIter.getCurrentGameArray());

		gamesIter.nextRecord();
	}

	if (recordIsEmpty) {
		const filename = path.join(gamesDir, gameRecord);
		fs.rmSync(filename);
	}

	/* Update games manager */

	gamesManager.deleteGameId(gameId);

	/* Update all user instances */

	const mem = UsersManager.getInstance();

	const w = mem.getAllUserDataByPrivateId(white.user.username);
	if (isNotDefined(w)) {
		debug(logNow(), `User ${white} could not be found`);
		return;
	}
	w.user.deleteGame(timeControlId, gameRecord);

	const b = mem.getAllUserDataByPrivateId(black.user.username);
	if (isNotDefined(b)) {
		debug(logNow(), `User ${black} could not be found`);
		return;
	}
	b.user.deleteGame(timeControlId, gameRecord);

	userUpdateFromPlayerData(updatedPlayers);
}

export function recalculateAllRatings(u: User) {
	if (!u.is('ADMIN')) {
		debug(logNow(), `User '${u.username}' cannot recalculate ratings.`);
		throw new PublicError('You cannot recalculate ratings.');
	}

	const ratingSystem = RatingSystemManager.getInstance();
	const allTimeControls = ratingSystem.getUniqueTimeControlsIds();

	const mem = UsersManager.getInstance();

	// initialize all players to a freshly created player
	const updatedPlayers: Player[] = [];
	const playerToIndex: Map<string, number> = new Map();

	for (let i = 0; i < mem.numUsers(); ++i) {
		const username = mem.getAllUserDataAtSafeIdx(i).user.username;

		const p = new Player(username, []);
		for (const tc of allTimeControls) {
			p.addRating(tc, ratingSystem.getNewRating());
		}

		updatedPlayers.push(p);
		playerToIndex.set(username, i);
	}

	for (const timeControl of allTimeControls) {
		const gamesDir = EnvironmentManager.getInstance().getDirGamesTimeControl(timeControl);

		const gamesIter = new GamesIterator(gamesDir);
		while (!gamesIter.endRecordList()) {
			updateGameRecord(gamesIter, timeControl, updatedPlayers, playerToIndex);

			writeGameArrayToFile(
				path.join(gamesDir, gamesIter.getCurrentRecordName()),
				gamesIter.getCurrentGameArray()
			);

			gamesIter.nextRecord();
		}
	}

	userUpdateFromPlayerData(updatedPlayers);
}
