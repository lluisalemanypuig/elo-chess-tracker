/*
Elo rating for a Chess Club
Copyright (C) 2023 - 2024  Lluís Alemany Puig

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

Contact:
	Lluís Alemany Puig
	https://github.com/lluisalemanypuig
*/

/*
 * Adapted from post: https://stackoverflow.com/questions/2450954/how-to-randomize-shuffle-a-javascript-array
 * Answer: https://stackoverflow.com/a/2450976/12075306
 */

/**
 * @brief Uses randomness to shuffle an array.
 * @param array Input array.
 * @post The input array is shuffled.
 */
export function shuffle<T>(array: T[]): void {
	let cur_idx = array.length;
	let rnd_idx = 0;

	// While there remain elements to shuffle.
	while (cur_idx != 0) {
		// Pick a remaining element
		rnd_idx = Math.floor(Math.random() * cur_idx);
		cur_idx--;

		// And swap it with the current element
		[array[cur_idx], array[rnd_idx]] = [array[rnd_idx], array[cur_idx]];
	}
}
