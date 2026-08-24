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

import { Empty } from '@common/api/schemas-endpoints';
import { GameCreateInput, GameDeleteInput, GameEditResultInput, GameEditTitleInput } from '@common/api/schemas/games';
import { isNotDefined } from '@common/utils/is-defined';
import { logNow } from '@common/utils/time';
import {
	gameAddNewGuarded,
	gameDelete,
	gameEditResult,
	gameEditTitle,
	recalculateAllRatings,
} from '@server/managers/games';
import { UsersManager } from '@server/managers/users-manager';
import { PublicError } from '@server/models/error-types/public-error';
import { UserSession } from '@server/models/user';
import Debug from 'debug';

const debug = Debug('ELO_CHESS_TRACKER:serverGames');

export async function getPageGameListOwn(_u: UserSession) {
	debug(logNow(), 'function getPageGameListOwn...');
	return 'html/game/list/own.html';
}

export async function getPageGameListAll(_u: UserSession) {
	debug(logNow(), 'function getPageGameListAll...');
	return 'html/game/list/all.html';
}

export async function getPageGameCreate({ user, session: _session }: UserSession) {
	debug(logNow(), 'function getPageGameCreate...');
	if (!user.canDo('CREATE_GAMES')) {
		debug(logNow(), `User '${user.username}' cannot create games.`);
		throw new PublicError('You cannot create games.');
	}
	return 'html/game/create.html';
}

export async function postGameCreate(
	{ user: creator, session: _session }: UserSession,
	input: GameCreateInput,
): Promise<Empty> {
	debug(logNow(), 'function postGameCreate...');

	const whitePublicId = input.white;
	const blackPublicId = input.black;
	const gameTitle = input.title;
	const result = input.result;
	const timeControlId = input.timeControlId;
	const timeControlName = input.timeControlName;
	const gameDate = input.whenCreated;
	const gameTime = input.timeCreated;

	const mem = UsersManager.getInstance();

	const white = mem.getAllUserDataByPublicId(whitePublicId);
	if (isNotDefined(white)) {
		debug(logNow(), `Public id '${whitePublicId}' for White is not valid.`);
		throw new PublicError('Invalid white user sent to the server.');
	}

	const black = mem.getAllUserDataByPublicId(blackPublicId);
	if (isNotDefined(black)) {
		debug(logNow(), `Public id '${blackPublicId}' for Black is not valid.`);
		throw new PublicError('Invalid black user sent to the server.');
	}

	gameAddNewGuarded(
		creator,
		gameTitle,
		white.user,
		black.user,
		result,
		timeControlId,
		timeControlName,
		gameDate,
		gameTime,
	);

	return {};
}

export async function postGameEditResult(
	{ user: editor, session: _session }: UserSession,
	input: GameEditResultInput,
): Promise<Empty> {
	debug(logNow(), 'function postGameEditResult...');

	const gameId = input.id;
	const newResult = input.newResult;

	debug(logNow(), `    Game ID: '${gameId}'`);
	debug(logNow(), `    New result: '${newResult}'`);

	gameEditResult(editor, logNow(), gameId, newResult);

	return {};
}

export async function postGameEditTitle(
	{ user: editor, session: _session }: UserSession,
	input: GameEditTitleInput,
): Promise<Empty> {
	debug(logNow(), 'function postGameEditTitle...');

	const gameId = input.id;
	const title = input.title;

	debug(logNow(), `    Game ID: '${gameId}'`);
	debug(logNow(), `    New title: '${title}'`);

	gameEditTitle(editor, logNow(), gameId, title);

	return {};
}

export async function postGameDelete(
	{ user: deleter, session: _session }: UserSession,
	input: GameDeleteInput,
): Promise<Empty> {
	debug(logNow(), 'function postGameDelete...');

	const gameId = input.id;

	debug(logNow(), `Game ID: '${gameId}'`);
	debug(logNow(), `Deleting game...`);

	gameDelete(deleter, gameId);

	return {};
}

export async function postRecalculateRatings({ user, session: _session }: UserSession, _input: Empty): Promise<Empty> {
	debug(logNow(), 'function postRecalculateRatings...');
	debug(logNow(), `Recalculating ratings...`);
	recalculateAllRatings(user);
	return {};
}
