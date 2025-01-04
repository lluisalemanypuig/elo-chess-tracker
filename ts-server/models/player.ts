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

import { Rating } from '../rating_framework/rating';
import { copyarray } from '../utils/misc';
import { search_linear_by_key } from '../utils/searching';
import { TimeControlRating, time_control_rating_set_from_json } from './time_control_rating';

/**
 * @brief Simple class to encode a Player
 */
export class Player {
	/// The user name of the the player
	protected readonly username: string;

	/// Rating info of the player per time control id
	protected ratings: TimeControlRating[];

	/**
	 * @brief Constructor
	 * @param username User name of the player.
	 * @param classical Information about classical games.
	 */
	constructor(username: string, ratings: TimeControlRating[]) {
		this.username = username;
		this.ratings = ratings;
	}

	/// Returns the username of this player
	get_username(): string {
		return this.username;
	}

	/// Returns whether the rating under the given time control id exists
	has_rating(time_control_id: string): boolean {
		return this.index_time_control_id(time_control_id) != -1;
	}

	/**
	 * @brief Adds a rating assuming it does not exist
	 * @param time_control_id String
	 * @param rating Rating object
	 * @pre Rating does not exist
	 */
	add_rating(time_control_id: string, rating: Rating): void {
		this.ratings.push(new TimeControlRating(time_control_id, rating));
	}

	/// Returns the rating of the player under the given time control id
	get_rating(time_control_id: string): Rating {
		const index = this.index_time_control_id(time_control_id);
		if (index >= this.ratings.length) {
			console.log(`Rating with id '${time_control_id}' does not exist!`);
		}
		return this.ratings[index].rating;
	}

	/// Sets the classical rating of the player
	set_rating(time_control_id: string, rating: Rating): void {
		const index = this.index_time_control_id(time_control_id);
		if (index >= this.ratings.length) {
			console.log(`Rating with id '${time_control_id}' does not exist!`);
			return;
		}
		this.ratings[index].rating = rating;
	}

	/// Returns all ratings
	get_all_ratings(): TimeControlRating[] {
		return this.ratings;
	}

	/// Creates a copy of this player.
	clone(): Player {
		return new Player(
			this.username,
			copyarray(this.ratings, (tcr: TimeControlRating) => {
				return tcr.clone();
			})
		);
	}

	index_time_control_id(time_control_id: string): number {
		return search_linear_by_key(this.ratings, (v: TimeControlRating): boolean => {
			return v.time_control == time_control_id;
		});
	}
}

/**
 * @brief Parses a JSON string or object and returns a Player.
 * @param json A JSON string or object with data of a Player.
 * @returns A new Player object.
 * @pre If @e json is a string then it cannot start with '['.
 */
export function player_from_json(json: any): Player {
	if (typeof json === 'string') {
		const json_parse = JSON.parse(json);
		return player_from_json(json_parse);
	}

	return new Player(json['username'], time_control_rating_set_from_json(json['ratings']));
}

/**
 * @brief Parses a JSON string or object and returns a set of Player.
 * @param json A JSON string or object with data of several Player.
 * @returns An array of Player objects.
 */
export function player_set_from_json(json: any): Player[] {
	if (typeof json === 'string') {
		const json_parse = JSON.parse(json);
		return player_set_from_json(json_parse);
	}

	let player_set: Player[] = [];
	for (var player in json) {
		player_set.push(player_from_json(json[player]));
	}
	return player_set;
}
