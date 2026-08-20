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
const debug = Debug('ELO_CHESS_TRACKER:serverQueryTimeControl');

import { logNow } from '@common/utils/time';
import { RatingSystemManager } from '@server/managers/rating-system-manager';
import { ROUTES } from '@common/api/routes';
import { UserSession } from '@server/models/user';

export async function getQueryHtmlTimeControls(_u: UserSession) {
	debug(logNow(), `GET ${ROUTES.QUERY_HTML_TIME_CONTROLS}...`);

	let html: string = '';
	const tcs = RatingSystemManager.getInstance().getTimeControls();
	for (const tc of tcs) {
		html += `<option value="${tc.id}">${tc.name}</option>`;
	}
	return html;
}

export async function getQueryHtmlTimeControlsUnique(_u: UserSession) {
	debug(logNow(), `GET ${ROUTES.QUERY_HTML_TIME_CONTROLS_UNIQUE}...`);

	let html: string = '';
	const tcs = RatingSystemManager.getInstance().getUniqueTimeControlsIds();
	for (const tc of tcs) {
		html += `<option value="${tc}">${tc}</option>`;
	}
	return html;
}
