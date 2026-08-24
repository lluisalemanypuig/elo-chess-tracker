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

import { logNow } from '@common/utils/time';
import { InternalError } from '@server/models/error-types/internal-error';
import { PublicError } from '@server/models/error-types/public-error';
import Debug from 'debug';
import { Response } from 'express';

const debug = Debug('ELO_CHESS_TRACKER:serverGraphs');

export const internalErrorMessage = 'Internal error. Contact your administrator.';

export function handleError(e: Error, res: Response) {
	if (e instanceof PublicError) {
		debug(logNow(), `Sending public error to user.`);
		const msg = (e as PublicError).message;
		res.status(403).send(msg);
	} else if (e instanceof InternalError) {
		const msg = (e as InternalError).message;
		debug(logNow(), `Internal server error.`);
		debug(logNow(), `Message: '${msg}'.`);
		res.status(500).send(internalErrorMessage);
	}
}
