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

async function fill_time_controls() {
	const response_time_control = await fetch('/query_time_controls', {
		method: 'GET',
		headers: { 'Content-type': 'application/json; charset=UTF-8' }
	});
	const time_control = await response_time_control.json();
	if (time_control.r == '0') {
		alert(time_control.reason);
		return;
	}

	// fill time control lists
	let time_control_select = document.getElementById('time_control_select') as HTMLSelectElement;
	const time_control_data = time_control.data;
	{
		let option_null = document.createElement('option');
		option_null.text = '';
		option_null.value = '';
		time_control_select.appendChild(option_null);
	}
	for (let i = 0; i < time_control_data.length; ++i) {
		let option_i = document.createElement('option');
		option_i.text = time_control_data[i].name;
		option_i.value = time_control_data[i].id;
		time_control_select.appendChild(option_i);
	}
}

async function fill_ranking(_event: any) {
	const time_control_select = document.getElementById('time_control_select') as HTMLSelectElement;
	const time_control_id = time_control_select.options[time_control_select.selectedIndex].value;

	if (time_control_id == '') {
		return;
	}

	let new_cell = function (text: string) {
		let cell = document.createElement('td');
		cell.innerHTML = text;
		return cell;
	};

	// "query" the server
	const response = await fetch('/query_users_ranking', {
		method: 'POST',
		body: JSON.stringify({ tc_i: time_control_id }),
		headers: { 'Content-type': 'application/json; charset=UTF-8' }
	});

	const data = await response.json();
	if (data.r == '0') {
		return;
	}

	const users = data.users as any[];

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
	fill_time_controls();

	let time_control_select = document.getElementById('time_control_select') as HTMLSelectElement;
	time_control_select.onchange = fill_ranking;

	set_footer_version_number();
};
