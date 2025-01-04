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

export async function set_footer_version_number() {
	// set the title of the page
	let version_number_ = document.getElementById('version_number');
	if (version_number_ == null) {
		return;
	}
	let version_number = version_number_ as HTMLElement;

	const response = await fetch('/version_number', {
		method: 'GET',
		headers: { 'Content-type': 'application/json; charset=UTF-8' }
	});
	const data = await response.text();

	version_number.textContent = data as string;
}
