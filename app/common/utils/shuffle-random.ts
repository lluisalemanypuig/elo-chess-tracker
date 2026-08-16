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

export function shuffleArray<T>(array: T[]) {
	const cryptoObj = globalThis.crypto;
	const rand = new Uint32Array(array.length);
	cryptoObj.getRandomValues(rand);
	for (let i = array.length - 1; i > 0; i--) {
		const j = rand[i] % (i + 1);
		[array[i], array[j]] = [array[j], array[i]];
	}
}

export function shuffleString(input: string): string {
	const arr = Array.from(input); // handles unicode correctly
	const cryptoObj = globalThis.crypto;
	const rand = new Uint32Array(arr.length);
	cryptoObj.getRandomValues(rand);
	for (let i = arr.length - 1; i > 0; i--) {
		const j = rand[i] % (i + 1);
		[arr[i], arr[j]] = [arr[j], arr[i]];
	}

	return arr.join('');
}
