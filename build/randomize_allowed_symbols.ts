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

function shuffle(input: string): string {
	const arr = Array.from(input); // handles unicode correctly
	const cryptoObj = globalThis.crypto;

	for (let i = arr.length - 1; i > 0; i--) {
		// Generate secure random integer 0 <= j <= i
		const rand = new Uint32Array(1);
		cryptoObj.getRandomValues(rand);

		const j = rand[0] % (i + 1);

		[arr[i], arr[j]] = [arr[j], arr[i]];
	}

	return arr.join('');
}

const allowed_symbols: string =
	'a!b·c$d%e&f/g(h)i=j?k¿l|m@n#o~p¬qrs[¡]t{u}v/w*x-y+zºAªB"C,D.E;F:G_HIJKLMNOPQRSTUVWXYZ0123456789 '.normalize('NFC');

const randomized = shuffle(allowed_symbols);

const result = {
	randomized_allowed_symbols: `${randomized}`
};

console.log(JSON.stringify(result));
