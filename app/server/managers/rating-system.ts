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

import { TimeControl } from '@common/models/time-control';
import { EloPlayerVsPlayer } from '@server/rating-framework/Elo/formula';
import { newRatingElo } from '@common/models/rating-framework/Elo/rating';
import { RatingSystemManager } from '@server/managers/rating-system-manager';
import { ratingFromStringElo, ratingFromJsonElo } from '@common/io/ratings/Elo/rating';
import { RatingFrameworkType } from '@common/models/rating-framework/rating-framework-type';

/**
 * @brief Initializes the class @ref RatingSystem based on the system in @e name.
 * @param name Name of the rating system.
 * @returns True if the name is valid; false if otherwise.
 */
export function initializeRatingFunctions(name: RatingFrameworkType): void {
	let ratingSystem = RatingSystemManager.getInstance();
	if (name == 'Elo') {
		ratingSystem.setFunctions(EloPlayerVsPlayer, newRatingElo, ratingFromStringElo, ratingFromJsonElo);
	}
}

/**
 * @brief Initialize the time controls in the @ref RatingSystem.
 * @param allTimeControls The list of time controls for the system.
 * @pre The RatingSystem must have been initialized via @ref initializeRatingSystem.
 */
export function initializeRatingTimeControls(allTimeControls: TimeControl[]): void {
	let ratingSystem = RatingSystemManager.getInstance();
	ratingSystem.setTimeControls(allTimeControls);
}
