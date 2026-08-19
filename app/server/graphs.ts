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
const debug = Debug('ELO_CHESS_TRACKER:serverGraphs');

import { logNow } from '@common/utils/time';
import { recalculateAllGraphs } from '@server/managers/graphs';
import { User, UserSession } from '@server/models/user';
import { PublicError } from './models/error-types/public-error';
import { Empty } from '@app/common/api/schemas-endpoints';

export async function getPageGraphOwn(_u: UserSession) {
	debug(logNow(), 'function getPageGraphOwn...');
	return 'html/graph/own.html';
}

export async function getPageGraphFull({ user, session: _session }: UserSession) {
	debug(logNow(), 'function getPageGraphFull...');

	if (!user.canDo('SEE_GRAPHS')) {
		debug(logNow(), `User '${user.username}' cannot see the whole graph.`);
		throw new PublicError('You cannot see the whole graph.');
	}

	return 'html/graph/full.html';
}

export async function postRecalculateGraphs({ user, session: _session }: UserSession, _input: Empty) {
	debug(logNow(), 'function postRecalculateGraphs...');
	debug(logNow(), `Recalculating ratings...`);
	recalculateAllGraphs(user);
	return {};
}
