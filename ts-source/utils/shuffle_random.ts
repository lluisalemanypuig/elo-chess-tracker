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
 * @brief Uses randomness to shuffle an array
 * @param array Input array
 * @returns A shuffled array
 */
export function shuffle<T>(array: T[]): T[] {
	let currentIndex = array.length;
	let randomIndex = 0;

	// While there remain elements to shuffle.
	while (currentIndex != 0) {

		// Pick a remaining element
		randomIndex = Math.floor(Math.random()*currentIndex);
		currentIndex--;

		// And swap it with the current element
		[array[currentIndex], array[randomIndex]] =
			[array[randomIndex], array[currentIndex]];
	}

	return array;
}
