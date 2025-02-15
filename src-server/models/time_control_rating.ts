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
import { TimeControlID } from './time_control';

/**
 * @brief A pair of time control id and rating
 */
export class TimeControlRating {
	public readonly time_control: TimeControlID;
	public rating: Rating;

	constructor(id: TimeControlID, data: Rating) {
		this.time_control = id;
		this.rating = data;
	}

	clone(): TimeControlRating {
		return new TimeControlRating(this.time_control, this.rating.clone());
	}
}
