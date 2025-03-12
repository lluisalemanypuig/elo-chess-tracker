/*
Elo rating for a Chess Club
Copyright (C) 2023 - 2025  Lluís Alemany Puig

This program is free software: you can redistribute it and/or modify
it under the terms of the GNU Affero General Public License as published
by the Free Software Foundation, either version 3 of the License, or
(at your option) any later version.

This program is distributed in the hope that it will be useful,
but WITHOUT ANY WARRANTY; without even the implied warranty of
MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE. See the
GNU Affero General Public License for more details.

You should have received a copy of the GNU Affero General Public License
along with this program. If not, see <https://www.gnu.org/licenses/>.

Full source code of elo-chess-tracker:
	https://github.com/lluisalemanypuig/elo-chess-tracker
*/

import 'htmx.org';

async function fill_ranking(_event: any) {
	const select_time_control = document.getElementById('select_time_control') as HTMLSelectElement;
	const time_control_id = select_time_control.options[select_time_control.selectedIndex].value;

	if (time_control_id == '') {
		return;
	}

	let new_cell = function (text: string) {
		let cell = document.createElement('td');
		cell.innerHTML = text;
		return cell;
	};

	// "query" the server
	const response = await fetch('/query/user/ranking', {
		method: 'POST',
		body: JSON.stringify({ tc_i: time_control_id }),
		headers: { 'Content-type': 'application/json; charset=UTF-8' }
	});
	if (response.status >= 400) {
		const message = await response.text();
		alert(`${response.status} -- ${response.statusText}\nMessage: '${message}'`);
		return;
	}

	const users = (await response.json()) as any[];

	let table = document.getElementById('users_table') as HTMLTableElement;

	let old_tbody = table.getElementsByTagName('tbody')[0];
	let new_tbody = document.createElement('tbody');

	for (var i = 0; i < users.length; i++) {
		let row = document.createElement('tr');

		row.appendChild(new_cell(users[i].name));
		row.appendChild(new_cell(users[i].rating));
		row.appendChild(new_cell(users[i].total_games));
		row.appendChild(new_cell(users[i].won));
		row.appendChild(new_cell(users[i].drawn));
		row.appendChild(new_cell(users[i].lost));

		new_tbody.appendChild(row);
	}

	if (old_tbody.parentNode != undefined) {
		old_tbody.parentNode.replaceChild(new_tbody, old_tbody);
	}
}

window.onload = async function () {
	let select_time_control = document.getElementById('select_time_control') as HTMLSelectElement;
	select_time_control.onchange = fill_ranking;
};
