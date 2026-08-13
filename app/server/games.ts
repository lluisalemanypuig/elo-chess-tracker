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

import Debug from 'debug';
const debug = Debug('ELO_CHESS_TRACKER:serverGames');
import { Request, Response } from 'express';

import { logNow } from '@common/utils/time';
import { isUserLoggedIn } from '@server/managers/session';
import { GAMES_CREATE, GAMES_DELETE, GAMES_EDIT } from '@common/models/user-action';
import {
	gameAddNew,
	gameDelete,
	gameEditResult,
	gameEditTitle,
	gameFindById,
	recalculateAllRatings
} from '@server/managers/games';
import { ADMIN } from '@common/models/user-role';
import { canUserCreateGame, canUserDeleteGame, canUserEditGame } from '@server/managers/user-relationships';
import { UsersManager } from '@server/managers/users-manager';
import { ConfigurationManager } from '@server/managers/configuration-manager';
import { getExecutionDirectory } from '@server/managers/environment-manager';
import { isNotDefined } from '@common/utils/is-defined';
import { ROUTES } from '@common/api/routes';
import { inputSchemaOf } from '@common/api/schemas-endpoints';
import { safeParseRequestCookies, safeParseRequestBody } from '@server/utils/schemas';

export async function getPageGameListOwn(req: Request, res: Response) {
	debug(logNow(), `GET ${ROUTES.PAGE_GAME_LIST_OWN}...`);

	const sessionParse = safeParseRequestCookies(req, res, debug);
	if (sessionParse.result === 'Exit') {
		return;
	}
	const session = sessionParse.data;
	const r = isUserLoggedIn(session);
	const user = r[2];
	if (isNotDefined(user)) {
		res.status(401).send(r[1]);
		return;
	}

	res.status(200);
	if (ConfigurationManager.shouldCacheData()) {
		res.setHeader('Cache-Control', 'public, max-age=864000, immutable');
	}
	res.sendFile(`${getExecutionDirectory()}/html/game/list/own.html`);
}

export async function getPageGameListAll(req: Request, res: Response) {
	debug(logNow(), `GET ${ROUTES.PAGE_GAME_LIST_ALL}...`);

	const sessionParse = safeParseRequestCookies(req, res, debug);
	if (sessionParse.result === 'Exit') {
		return;
	}
	const session = sessionParse.data;
	const r = isUserLoggedIn(session);
	const user = r[2];
	if (isNotDefined(user)) {
		res.status(401).send(r[1]);
		return;
	}

	res.status(200);
	if (ConfigurationManager.shouldCacheData()) {
		res.setHeader('Cache-Control', 'public, max-age=864000, immutable');
	}
	res.sendFile(`${getExecutionDirectory()}/html/game/list/all.html`);
}

export async function getPageGameCreate(req: Request, res: Response) {
	debug(logNow(), `GET ${ROUTES.PAGE_GAME_CREATE}...`);

	const sessionParse = safeParseRequestCookies(req, res, debug);
	if (sessionParse.result === 'Exit') {
		return;
	}
	const session = sessionParse.data;
	const r = isUserLoggedIn(session);
	const user = r[2];
	if (isNotDefined(user)) {
		res.status(401).send(r[1]);
		return;
	}

	if (!user.canDo(GAMES_CREATE)) {
		debug(logNow(), `User '${user.username}' cannot create games.`);
		res.status(403).send('You cannot create games.');
		return;
	}

	res.status(200);
	if (ConfigurationManager.shouldCacheData()) {
		res.setHeader('Cache-Control', 'public, max-age=864000, immutable');
	}
	res.sendFile(`${getExecutionDirectory()}/html/game/create.html`);
}

export async function postGameCreate(req: Request, res: Response) {
	debug(logNow(), `POST ${ROUTES.GAME_CREATE}...`);

	const sessionParse = safeParseRequestCookies(req, res, debug);
	if (sessionParse.result === 'Exit') {
		return;
	}
	const session = sessionParse.data;
	const r = isUserLoggedIn(session);
	const creator = r[2];
	if (isNotDefined(creator)) {
		res.status(401).send(r[1]);
		return;
	}

	if (!creator.canDo(GAMES_CREATE)) {
		debug(logNow(), `User '${creator.username}' cannot create users.`);
		res.status(403).send('You cannot create games');
		return;
	}

	const gameParse = safeParseRequestBody(req.body, inputSchemaOf(ROUTES.GAME_CREATE), res, debug);
	if (gameParse.result === 'Exit') {
		return;
	}

	const whitePublicId = gameParse.data.white;
	const blackPublicId = gameParse.data.black;
	const gameTitle = gameParse.data.title;
	const result = gameParse.data.result;
	const timeControlId = gameParse.data.timeControlId;
	const timeControlName = gameParse.data.timeControlName;
	const gameDate = gameParse.data.whenCreated;
	const gameTime = gameParse.data.timeCreated;

	const mem = UsersManager.getInstance();

	const white = mem.getAllUserDataByPublicId(whitePublicId);
	if (isNotDefined(white)) {
		debug(logNow(), `Random id '${whitePublicId}' for White is not valid.`);
		res.status(500).send('Invalid white user sent to the server.');
		return;
	}

	const black = mem.getAllUserDataByPublicId(blackPublicId);
	if (isNotDefined(black)) {
		debug(logNow(), `Random id '${blackPublicId}' for Black is not valid.`);
		res.status(500).send('Invalid black user sent to the server.');
		return;
	}

	if (white.user.username === black.user.username) {
		res.status(500).send('The players cannot be the same.');
		return;
	}

	if (gameDate === '') {
		res.status(500).send('The selected date is incorrect.');
		return;
	}
	if (gameTime === '') {
		res.status(500).send('The selected time is incorrect.');
		return;
	}

	if (!canUserCreateGame(creator, white.user, black.user)) {
		debug(logNow(), `User cannot create this game.`);
		res.status(403).send('You cannot create this game.');
		return;
	}

	debug(logNow(), `    Title: '${gameTitle}'`);
	debug(logNow(), `    White: '${white.user.username}'`);
	debug(logNow(), `    Black: '${black.user.username}'`);
	debug(logNow(), `    Result: '${result}'`);
	debug(logNow(), `    Time control id: '${timeControlId}'`);
	debug(logNow(), `    Time control name: '${timeControlName}'`);
	debug(logNow(), `    Date of game: '${gameDate}'`);
	debug(logNow(), `    Time of game: '${gameTime}'`);

	debug(logNow(), `Adding the new game`);

	gameAddNew(gameTitle, white.user, black.user, result, timeControlId, timeControlName, gameDate, gameTime);

	res.status(201).send();
}

export async function postGameEditResult(req: Request, res: Response) {
	debug(logNow(), `POST ${ROUTES.GAME_EDIT_RESULT}...`);

	const sessionParse = safeParseRequestCookies(req, res, debug);
	if (sessionParse.result === 'Exit') {
		return;
	}
	const session = sessionParse.data;
	const r = isUserLoggedIn(session);
	const user = r[2];
	if (isNotDefined(user)) {
		res.status(401).send(r[1]);
		return;
	}

	if (!user.canDo(GAMES_EDIT)) {
		debug(logNow(), `User '${user.username}' cannot edit games.`);
		res.status(403).send('You cannot edit games');
		return;
	}

	const gameParse = safeParseRequestBody(req.body, inputSchemaOf(ROUTES.GAME_EDIT_RESULT), res, debug);
	if (gameParse.result === 'Exit') {
		return;
	}

	const gameId = gameParse.data.id;
	const newResult = gameParse.data.newResult;

	debug(logNow(), `    Game ID: '${gameId}'`);
	debug(logNow(), `    New result: '${newResult}'`);

	const game = gameFindById(gameId);
	if (isNotDefined(game)) {
		res.status(404).send(`Game was not found.`);
		return;
	}

	const manager = UsersManager.getInstance();

	const white = manager.getAllUserDataByPrivateId(game.white);
	if (isNotDefined(white)) {
		debug(logNow(), `Random id '${white}' for White is not valid.`);
		res.status(500).send('Invalid white user sent to the server.');
		return;
	}

	const black = manager.getAllUserDataByPrivateId(game.black);
	if (isNotDefined(black)) {
		debug(logNow(), `Random id '${black}' for Black is not valid.`);
		res.status(500).send('Invalid black user sent to the server.');
		return;
	}

	const isEditable = canUserEditGame(user, white.user, black.user);
	if (!isEditable) {
		res.status(403).send(`You lack permissions to edit this game.`);
		return;
	}

	debug(logNow(), `Editing game...`);

	// actually edit the game now
	gameEditResult(gameId, newResult);

	res.status(200).send();
}

export async function postGameEditTitle(req: Request, res: Response) {
	debug(logNow(), `POST ${ROUTES.GAME_EDIT_TITLE}...`);

	const sessionParse = safeParseRequestCookies(req, res, debug);
	if (sessionParse.result === 'Exit') {
		return;
	}
	const session = sessionParse.data;
	const r = isUserLoggedIn(session);
	const user = r[2];
	if (isNotDefined(user)) {
		res.status(401).send(r[1]);
		return;
	}

	if (!user.canDo(GAMES_EDIT)) {
		debug(logNow(), `User '${user.username}' cannot edit games.`);
		res.status(403).send('You cannot edit games');
		return;
	}

	const gameParse = safeParseRequestBody(req.body, inputSchemaOf(ROUTES.GAME_EDIT_TITLE), res, debug);
	if (gameParse.result === 'Exit') {
		return;
	}

	const gameId = gameParse.data.id;
	const title = gameParse.data.title;

	debug(logNow(), `    Game ID: '${gameId}'`);
	debug(logNow(), `    New title: '${title}'`);

	const game = gameFindById(gameId);
	if (isNotDefined(game)) {
		res.status(404).send(`Game was not found.`);
		return;
	}

	const manager = UsersManager.getInstance();

	const white = manager.getAllUserDataByPrivateId(game.white);
	if (isNotDefined(white)) {
		debug(logNow(), `Random id '${white}' for White is not valid.`);
		res.status(500).send('Invalid white user sent to the server.');
		return;
	}

	const black = manager.getAllUserDataByPrivateId(game.black);
	if (isNotDefined(black)) {
		debug(logNow(), `Random id '${black}' for Black is not valid.`);
		res.status(500).send('Invalid black user sent to the server.');
		return;
	}

	const isEditable = canUserEditGame(user, white.user, black.user);
	if (!isEditable) {
		res.status(403).send(`You lack permissions to edit this game.`);
		return;
	}

	debug(logNow(), `Editing game...`);

	// actually edit the game now
	gameEditTitle(gameId, title);

	res.status(200).send();
}

export async function postGameDelete(req: Request, res: Response) {
	debug(logNow(), `POST ${ROUTES.GAME_DELETE}...`);

	const sessionParse = safeParseRequestCookies(req, res, debug);
	if (sessionParse.result === 'Exit') {
		return;
	}
	const session = sessionParse.data;
	const r = isUserLoggedIn(session);
	const user = r[2];
	if (isNotDefined(user)) {
		res.status(401).send(r[1]);
		return;
	}

	if (!user.canDo(GAMES_DELETE)) {
		debug(logNow(), `User '${user.username}' cannot delete games.`);
		res.status(403).send('You cannot delete games');
		return;
	}

	const gameParse = safeParseRequestBody(req.body, inputSchemaOf(ROUTES.GAME_DELETE), res, debug);
	if (gameParse.result === 'Exit') {
		return;
	}

	const gameId = gameParse.data.id;

	debug(logNow(), `    Game ID: '${gameId}'`);

	const game = gameFindById(gameId);
	if (isNotDefined(game)) {
		res.status(404).send(`Game was not found.`);
		return;
	}

	const manager = UsersManager.getInstance();

	const white = manager.getAllUserDataByPrivateId(game.white);
	if (isNotDefined(white)) {
		debug(logNow(), `Random id '${white}' for White is not valid.`);
		res.status(500).send('Invalid white user sent to the server.');
		return;
	}

	const black = manager.getAllUserDataByPrivateId(game.black);
	if (isNotDefined(black)) {
		debug(logNow(), `Random id '${black}' for Black is not valid.`);
		res.status(500).send('Invalid black user sent to the server.');
		return;
	}

	const isDeleteable = canUserDeleteGame(user, white.user, black.user);
	if (!isDeleteable) {
		res.status(403).send(`You lack permissions to delete this game.`);
		return;
	}

	debug(logNow(), `Deleting game...`);

	gameDelete(gameId);

	res.status(200).send();
}

export async function postRecalculateRatings(req: Request, res: Response) {
	debug(logNow(), `POST ${ROUTES.RECALCULATE_RATINGS}...`);

	const sessionParse = safeParseRequestCookies(req, res, debug);
	if (sessionParse.result === 'Exit') {
		return;
	}
	const session = sessionParse.data;
	const r = isUserLoggedIn(session);
	const user = r[2];
	if (isNotDefined(user)) {
		res.status(401).send(r[1]);
		return;
	}

	if (!user.is(ADMIN)) {
		debug(logNow(), `User '${user.username}' cannot recalculate ratings.`);
		res.status(403).send('You cannot recalculate ratings.');
		return;
	}

	debug(logNow(), `Recalculating ratings...`);

	// actually recalculating ratings
	recalculateAllRatings();

	res.status(200).send();
}
