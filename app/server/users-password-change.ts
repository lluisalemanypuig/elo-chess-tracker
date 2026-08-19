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
const debug = Debug('ELO_CHESS_TRACKER:serverUsersPasswordChanges');

import { logNow } from '@common/utils/time';
import { Empty } from '@common/api/schemas-endpoints';
import { userSelfChangePassword } from '@server/managers/users';
import { UserSession } from '@server/models/user';
import { UserPasswordChangeInput } from '@common/api/schemas/user';

export async function getPageUserPasswordChange(_u: UserSession) {
	debug(logNow(), 'function getPageUserPasswordChange...');
	return 'html/user/password-change.html';
}

export async function postUserPasswordChange(
	{ user, session }: UserSession,
	input: UserPasswordChangeInput
): Promise<Empty> {
	debug(logNow(), 'function postUserPasswordChange...');

	const oldPassword = input.old;
	const newPassword = input.new;

	userSelfChangePassword(user, { session, oldPassword, newPassword });

	return {};
}
