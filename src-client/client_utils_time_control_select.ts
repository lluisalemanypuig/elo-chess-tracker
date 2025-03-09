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

export async function fill_time_controls(element_id: string) {
	const response_time_control = await fetch('/query/time_controls', {
		method: 'GET',
		headers: { 'Content-type': 'application/json; charset=UTF-8' }
	});
	const time_control = await response_time_control.json();
	if (time_control.r == '0') {
		alert(time_control.reason);
		return;
	}

	// fill time control lists
	let select_time_control = document.getElementById(element_id) as HTMLSelectElement;
	const time_control_data = time_control.data;
	{
		let option_null = document.createElement('option');
		option_null.text = '';
		option_null.value = '';
		select_time_control.appendChild(option_null);
	}
	for (let i = 0; i < time_control_data.length; ++i) {
		let option_i = document.createElement('option');
		option_i.text = time_control_data[i].name;
		option_i.value = time_control_data[i].id;
		select_time_control.appendChild(option_i);
	}
}
