/*
Elo rating for a Chess Club
Copyright (C) 2023 - 2025  Lluís Alemany Puig

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

import { GameNumber, User } from '../models/user';
import { TimeControlGames } from '../models/user';
import { password_from_json } from './password';
import { time_control_rating_set_from_json } from './time_control_rating';

/**
 * @brief Parses a JSON string or object and returns a GameNumber.
 * @param json A JSON string or object with data of a GameNumber.
 * @returns A new TimeControlGames object.
 * @pre If @e json is a string then it cannot start with '['.
 */
export function games_number_from_json(json: any): GameNumber {
	console.log('asdf');
	if (typeof json === 'string') {
		const json_parse = JSON.parse(json);
		return games_number_from_json(json_parse);
	}
	return new GameNumber(json['record'], json['amount']);
}

/**
 * @brief Parses a JSON string or object and returns a GameNumber.
 * @param json A JSON string or object with data of a GameNumber.
 * @returns A new TimeControlGames object.
 * @pre If @e json is a string then it cannot start with '['.
 */
export function games_number_set_from_json(json: any): GameNumber[] {
	if (typeof json === 'string') {
		const json_parse = JSON.parse(json);
		return games_number_set_from_json(json_parse);
	}

	let data_set: GameNumber[] = [];
	for (var data in json) {
		data_set.push(games_number_from_json(json[data]));
	}
	return data_set;
}

/**
 * @brief Parses a JSON string or object and returns a TimeControlGames.
 * @param json A JSON string or object with data of a TimeControlGames.
 * @returns A new TimeControlGames object.
 * @pre If @e json is a string then it cannot start with '['.
 */
export function time_control_games_from_json(json: any): TimeControlGames {
	if (typeof json === 'string') {
		const json_parse = JSON.parse(json);
		return time_control_games_from_json(json_parse);
	}
	return new TimeControlGames(json['time_control'], games_number_set_from_json(json['records']));
}

/**
 * @brief Parses a JSON string or object and returns a set of TimeControlGames.
 * @param json A JSON string or object with data of several TimeControlGames.
 * @returns An array of TimeControlGames objects.
 */
export function time_control_games_set_from_json(json: any): TimeControlGames[] {
	if (typeof json === 'string') {
		const json_parse = JSON.parse(json);
		return time_control_games_set_from_json(json_parse);
	}

	let data_set: TimeControlGames[] = [];
	for (var data in json) {
		data_set.push(time_control_games_from_json(json[data]));
	}
	return data_set;
}

/**
 * @brief Parses a JSON string or object and returns a User.
 * @param json A JSON string or object with data of a User.
 * @returns A new User object.
 * @pre If @e json is a string then it cannot start with '['.
 */
export function user_from_json(json: any): User {
	if (typeof json === 'string') {
		const json_parse = JSON.parse(json);
		return user_from_json(json_parse);
	}

	return new User(
		json['username'],
		json['first_name'],
		json['last_name'],
		password_from_json(json['password']),
		json['roles'],
		time_control_games_set_from_json(json['games']),
		time_control_rating_set_from_json(json['ratings'])
	);
}

/**
 * @brief Parses a JSON string or object and returns a set of User.
 * @param json A JSON string or object with data of several User.
 * @returns An array of User objects.
 */
export function user_set_from_json(json: any): User[] {
	if (typeof json === 'string') {
		const json_parse = JSON.parse(json);
		return user_set_from_json(json_parse);
	}

	let player_set: User[] = [];
	for (var player in json) {
		player_set.push(user_from_json(json[player]));
	}
	return player_set;
}
