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
import {
	gameAddNewGuarded,
	gameDelete,
	gameEditResult,
	gameEditTitle,
	recalculateAllRatings
} from '@server/managers/games';
import { UsersManager } from '@server/managers/users-manager';
import { ConfigurationManager } from '@server/managers/configuration-manager';
import { getExecutionDirectory } from '@server/managers/environment-manager';
import { isNotDefined } from '@common/utils/is-defined';
import { ROUTES } from '@common/api/routes';
import { inputSchemaOf } from '@common/api/schemas-endpoints';
import { safeParseRequestCookies, safeParseRequestBody } from '@server/utils/schemas';
import { handleError } from '@server/utils/error-handling';

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

	if (!user.canDo('CREATE_GAMES')) {
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

	if (!creator.canDo('CREATE_GAMES')) {
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
		debug(logNow(), `Public id '${whitePublicId}' for White is not valid.`);
		res.status(500).send('Invalid white user sent to the server.');
		return;
	}

	const black = mem.getAllUserDataByPublicId(blackPublicId);
	if (isNotDefined(black)) {
		debug(logNow(), `Public id '${blackPublicId}' for Black is not valid.`);
		res.status(500).send('Invalid black user sent to the server.');
		return;
	}

	try {
		gameAddNewGuarded(
			creator,
			gameTitle,
			white.user,
			black.user,
			result,
			timeControlId,
			timeControlName,
			gameDate,
			gameTime
		);
	} catch (e) {
		handleError(e as Error, res);
		return;
	}

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
	const editor = r[2];
	if (isNotDefined(editor)) {
		res.status(401).send(r[1]);
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

	try {
		gameEditResult(editor, gameId, newResult);
	} catch (e) {
		handleError(e as Error, res);
		return;
	}

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
	const editor = r[2];
	if (isNotDefined(editor)) {
		res.status(401).send(r[1]);
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

	try {
		gameEditTitle(editor, gameId, title);
	} catch (e) {
		handleError(e as Error, res);
		return;
	}

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
	const deleter = r[2];
	if (isNotDefined(deleter)) {
		res.status(401).send(r[1]);
		return;
	}

	const gameParse = safeParseRequestBody(req.body, inputSchemaOf(ROUTES.GAME_DELETE), res, debug);
	if (gameParse.result === 'Exit') {
		return;
	}

	const gameId = gameParse.data.id;

	debug(logNow(), `Game ID: '${gameId}'`);
	debug(logNow(), `Deleting game...`);

	try {
		gameDelete(deleter, gameId);
	} catch (e) {
		handleError(e as Error, res);
		return;
	}

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

	debug(logNow(), `Recalculating ratings...`);

	try {
		recalculateAllRatings(user);
	} catch (e) {
		handleError(e as Error, res);
		return;
	}

	res.status(200).send();
}
