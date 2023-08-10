/*
Elo rating for a Chess Club
Copyright (C) 2023  Lluís Alemany Puig

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

window.onload = async function () {

	const new_cell = function(text: string) {
		let cell = document.createElement("td");
		cell.innerHTML = text;
		return cell;
	}

	// "query" the server
	const response = await fetch(
		"/query_games_all",
		{
			method: 'GET',
			headers: { 'Content-type': 'application/json; charset=UTF-8' }
		}
	);

	const data = await response.json();
	if (data.r == '0') {
		return;
	}

	const games = data.games as any[];

	let table = document.getElementById("games_table") as HTMLTableElement;
    let tbody = table.getElementsByTagName("tbody")[0];

	for (let i = 0; i < games.length; i++) {
		let row = document.createElement("tr");

		row.appendChild(new_cell(games[i].white));
		row.appendChild(new_cell(games[i].black));
		row.appendChild(new_cell(games[i].result));
		row.appendChild(new_cell(games[i].time_control));
		row.appendChild(new_cell(games[i].date));
		row.appendChild(new_cell(games[i].white_rating));
		row.appendChild(new_cell(games[i].white_increment));
		row.appendChild(new_cell(games[i].black_rating));
		row.appendChild(new_cell(games[i].black_increment));

		tbody.appendChild(row);
	}
}