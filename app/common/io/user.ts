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

import { log_now } from '@server/utils/time';
import {
	GameNumberSchema,
	GameNumberArraySchema,
	GameNumber,
	User,
	TimeControlGameSchema,
	TimeControlGameArraySchema,
	UserKeys
} from '@common/models/user';
import { TimeControlGame } from '@common/models/user';
import { read_json_array_string, read_json_object_string, read_schema } from '@common/io/generic';
import { RatingSystemManager } from '@server/managers/rating_system_manager';
import { TimeControlRating } from '@common/models/time_control_rating';
import { UserRoleArraySchema } from '@common/models/user_role';
import { PasswordSchema } from '@common/models/password';

/**
 * @brief Parses a JSON string and returns a GameNumber.
 * @param str A string with data of a GameNumber.
 * @returns A new TimeControlGames object.
 */
export function games_number_from_string(str: string): GameNumber | null {
	return read_schema(GameNumberSchema, str);
}

/**
 * @brief Parses a JSON string and returns a GameNumber.
 * @param str A string with data of a GameNumber.
 * @returns A new TimeControlGames object.
 */
export function games_number_array_from_string(str: string): GameNumber[] | null {
	return read_schema(GameNumberArraySchema, str);
}

/**
 * @brief Parses a JSON string and returns a TimeControlGames.
 * @param str A string with data of a TimeControlGames.
 * @returns A new TimeControlGames object.
 */
export function time_control_game_from_string(str: string): TimeControlGame | null {
	return read_schema(TimeControlGameSchema, str);
}

/**
 * @brief Parses a JSON string and returns an array of TimeControlGames.
 * @param str A string with data of several TimeControlGames.
 * @returns An array of TimeControlGames objects.
 */
export function time_control_games_array_from_string(str: string): TimeControlGame[] | null {
	return read_schema(TimeControlGameArraySchema, str);
}

/**
 * @brief Creates a User object from a plain json object.
 * @param json A plain JSON object.
 * @returns A new User object.
 */
export function user_from_json(json: any): User | null {
	const password = PasswordSchema.safeParse(json.password);
	if (!password.success) {
		debug(log_now(), `Could not parse password`);
		return null;
	}

	const roles = UserRoleArraySchema.safeParse(json.roles);
	if (!roles.success) {
		debug(log_now(), `Could not parse roles array`);
		return null;
	}

	const games = TimeControlGameArraySchema.safeParse(json.games);
	if (!games.success) {
		debug(log_now(), `Could not parse game records`);
		return null;
	}

	const manager = RatingSystemManager.get_instance();
	let ratings: TimeControlRating[] = [];
	for (const r of json.ratings) {
		const rating = new TimeControlRating(r.time_control, manager.get_rating_from_json(r.rating));
		ratings.push(rating);
	}

	return new User(json.username, json.first_name, json.last_name, password.data, roles.data, games.data, ratings);
}

/**
 * @brief Parses a JSON string and returns a User.
 * @param str A string with data of a User.
 * @returns A new User object.
 */
export function user_from_string(str: string): User | null {
	return read_json_object_string(str, UserKeys, user_from_json);
}

/**
 * @brief Parses a JSON string and returns an array of User.
 * @param str A string with data of several User.
 * @returns An array of User objects.
 */
export function user_array_from_string(str: string): User[] | null {
	return read_json_array_string(str, UserKeys, user_from_json);
}
