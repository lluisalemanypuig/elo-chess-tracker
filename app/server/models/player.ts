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

import { copyarray } from '@server/utils/misc';
import { searchLinearByKey } from '@server/utils/searching';
import { TimeControlId } from '@common/models/time-control';
import { TimeControlRating } from '@server/models/time-control-rating';
import { InternalError } from '@app/server/models/error-types/internal-error';
import { PlayerPrivateId } from '@common/models/player-id';
import { Rating } from '@server/models/rating-framework/rating';

export const PlayerKeys = ['username', 'ratings'];

/**
 * @brief Simple class to encode a Player
 */
export class Player {
	// The user name of the the player
	public readonly username: PlayerPrivateId;

	// Rating info of the player per time control id
	public ratings: TimeControlRating[];

	/**
	 * @brief Constructor
	 * @param username User name of the player.
	 * @param ratings All the ratings of this user.
	 */
	constructor(username: PlayerPrivateId, ratings: TimeControlRating[]) {
		this.username = username;
		this.ratings = ratings;
	}

	// Returns whether the rating under the given time control id exists
	hasRating(id: TimeControlId): boolean {
		return this.indexTimeControlId(id) !== -1;
	}

	/**
	 * @brief Adds a rating assuming it does not exist
	 * @param id String
	 * @param rating Rating object
	 * @pre Rating does not exist
	 */
	addRating(id: TimeControlId, rating: Rating) {
		this.ratings.push(new TimeControlRating(id, rating));
	}

	// Returns the rating of the player under the given time control id
	getRating(id: TimeControlId): Rating {
		const index = this.indexTimeControlId(id);
		if (index === -1) {
			throw new InternalError(`Rating with id '${id}' does not exist!`);
		}
		return this.ratings[index].rating;
	}

	// Sets the rating of the player
	setRating(id: TimeControlId, rating: Rating) {
		const index = this.indexTimeControlId(id);
		if (index === -1) {
			throw new InternalError(`Rating with id '${id}' does not exist!`);
		}
		this.ratings[index].rating = rating;
	}

	// Creates a copy of this player.
	clone(): Player {
		return new Player(
			this.username,
			copyarray(this.ratings, (tcr: TimeControlRating): TimeControlRating => {
				return tcr.clone();
			})
		);
	}

	indexTimeControlId(id: TimeControlId): number {
		return searchLinearByKey(this.ratings, (v: TimeControlRating): boolean => {
			return v.timeControl === id;
		});
	}
}

export type PlayerArray = Player[];
