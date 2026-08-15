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
const debug = Debug(`ELO_CHESS_TRACKER:io`);

import { logNow } from '@common/utils/time';
import {
	GameNumberSchema,
	GameNumberArraySchema,
	GameNumber,
	User,
	TimeControlGameSchema,
	TimeControlGameArraySchema,
	UserKeys
} from '@server/models/user';
import { TimeControlGame } from '@server/models/user';
import { readJsonArrayString, readJsonObjectString, readSchema } from '@server/io/generic';
import { RatingSystemManager } from '@server/managers/rating-system-manager';
import { TimeControlRating } from '@server/models/time-control-rating';
import { UserRoleArraySchema } from '@common/models/user-role';
import { PasswordSchema } from '@server/models/password';

/**
 * @brief Parses a JSON string and returns a GameNumber.
 * @param str A string with data of a GameNumber.
 * @returns A new TimeControlGames object.
 */
export function gamesNumberFromString(str: string): GameNumber | null {
	return readSchema(GameNumberSchema, str);
}

/**
 * @brief Parses a JSON string and returns a GameNumber.
 * @param str A string with data of a GameNumber.
 * @returns A new TimeControlGames object.
 */
export function gamesNumberArrayFromString(str: string): GameNumber[] | null {
	return readSchema(GameNumberArraySchema, str);
}

/**
 * @brief Parses a JSON string and returns a TimeControlGames.
 * @param str A string with data of a TimeControlGames.
 * @returns A new TimeControlGames object.
 */
export function timeControlGameFromString(str: string): TimeControlGame | null {
	return readSchema(TimeControlGameSchema, str);
}

/**
 * @brief Parses a JSON string and returns an array of TimeControlGames.
 * @param str A string with data of several TimeControlGames.
 * @returns An array of TimeControlGames objects.
 */
export function timeControlGamesArrayFromString(str: string): TimeControlGame[] | null {
	return readSchema(TimeControlGameArraySchema, str);
}

/**
 * @brief Creates a User object from a plain json object.
 * @param json A plain JSON object.
 * @returns A new User object.
 */
export function userFromJson(json: any): User | null {
	const password = PasswordSchema.safeParse(json.password);
	if (!password.success) {
		debug(logNow(), `Could not parse password`);
		return null;
	}

	const roles = UserRoleArraySchema.safeParse(json.roles);
	if (!roles.success) {
		debug(logNow(), `Could not parse roles array`);
		return null;
	}

	const games = TimeControlGameArraySchema.safeParse(json.games);
	if (!games.success) {
		debug(logNow(), `Could not parse game records`);
		return null;
	}

	const manager = RatingSystemManager.getInstance();
	let ratings: TimeControlRating[] = [];
	for (const r of json.ratings) {
		const rating = new TimeControlRating(r.timeControl, manager.getRatingFromJson(r.rating));
		ratings.push(rating);
	}

	return new User(json.username, json.firstName, json.lastName, password.data, roles.data, games.data, ratings);
}

/**
 * @brief Parses a JSON string and returns a User.
 * @param str A string with data of a User.
 * @returns A new User object.
 */
export function userFromString(str: string): User | null {
	return readJsonObjectString(str, UserKeys, userFromJson);
}

/**
 * @brief Parses a JSON string and returns an array of User.
 * @param str A string with data of several User.
 * @returns An array of User objects.
 */
export function userArrayFromString(str: string): User[] | null {
	return readJsonArrayString(str, UserKeys, userFromJson);
}
