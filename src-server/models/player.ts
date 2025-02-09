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
import { TimeControlID } from './time_control';
import { TimeControlRating } from './time_control_rating';

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
	 * @param ratings All the ratings of this user.
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
	has_rating(id: TimeControlID): boolean {
		return this.index_time_control_id(id) != -1;
	}

	/**
	 * @brief Adds a rating assuming it does not exist
	 * @param id String
	 * @param rating Rating object
	 * @pre Rating does not exist
	 */
	add_rating(id: TimeControlID, rating: Rating): void {
		this.ratings.push(new TimeControlRating(id, rating));
	}

	/// Returns the rating of the player under the given time control id
	get_rating(id: TimeControlID): Rating {
		const index = this.index_time_control_id(id);
		if (index >= this.ratings.length) {
			console.log(`Rating with id '${id}' does not exist!`);
		}
		return this.ratings[index].rating;
	}

	/// Sets the classical rating of the player
	set_rating(id: TimeControlID, rating: Rating): void {
		const index = this.index_time_control_id(id);
		if (index >= this.ratings.length) {
			console.log(`Rating with id '${id}' does not exist!`);
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

	index_time_control_id(id: TimeControlID): number {
		return search_linear_by_key(this.ratings, (v: TimeControlRating): boolean => {
			return v.time_control == id;
		});
	}
}
