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

/// Generic class for a rating.
export class Rating {
	/// Actual rating
	public rating: number;
	/// Number of games
	public num_games: number;
	/// Number of won games
	public won: number;
	/// Number of drawn games
	public drawn: number;
	/// Number of lost games
	public lost: number;

	/**
	 * @brief Constructor
	 * @param rating Actual rating points
	 * @param num_games Number of games
	 * @param won Number of won games
	 * @param drawn Number of drawn games
	 * @param lost Number of lost games
	 */
	constructor(rating: number, num_games: number, won: number, drawn: number, lost: number) {
		this.rating = rating;
		this.num_games = num_games;
		this.won = won;
		this.drawn = drawn;
		this.lost = lost;

		if (this.num_games != this.won + this.drawn + this.lost) {
			throw new Error(
				`Consistency check: total number of games is not equal to the sum of won, drawn and lost. Total ${this.num_games}; Won: ${this.won}; Drawn: ${this.drawn}, Lost: ${this.lost}`
			);
		}
	}

	clone(): Rating {
		return new Rating(this.rating, this.num_games, this.won, this.drawn, this.lost);
	}
}
