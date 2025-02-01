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

import { set_footer_version_number } from './client_load_version_number';

async function initialize_window_client_games_create() {
	let white_datalist = document.getElementById('white_datalist') as HTMLDataListElement;
	let black_datalist = document.getElementById('black_datalist') as HTMLDataListElement;

	// query the server for the list of users
	const response = await fetch('/query_users_list', {
		method: 'GET',
		headers: { 'Content-type': 'application/json; charset=UTF-8' }
	});
	const data = await response.json();
	if (data.r == '0') {
		alert(data.reason);
		return;
	}

	// query the server for the list of time controls
	const response_time_control = await fetch('/query_time_controls', {
		method: 'GET',
		headers: { 'Content-type': 'application/json; charset=UTF-8' }
	});
	const time_control = await response_time_control.json();
	if (time_control.r == '0') {
		alert(time_control.reason);
		return;
	}

	// fill username lists
	let options = '';
	{
		const user_list = data.data as [string, string][];
		user_list.forEach(function (elem: [string, string]) {
			options += '<option id="' + elem[1] + '" value="' + elem[0] + '">';
		});
	}
	white_datalist.innerHTML = options;
	black_datalist.innerHTML = options;

	// fill time control lists
	let time_control_select = document.getElementById('time_control_select') as HTMLSelectElement;
	const time_control_data = time_control.data;
	for (let i = 0; i < time_control_data.length; ++i) {
		let option_i = document.createElement('option');
		option_i.text = time_control_data[i].name;
		option_i.value = time_control_data[i].id;
		time_control_select.appendChild(option_i);
	}
}

async function submit_new_game(_event: any) {
	const white_input = document.getElementById('white_list') as HTMLInputElement;
	const black_input = document.getElementById('black_list') as HTMLInputElement;
	const result_select = document.getElementById('result_select') as HTMLSelectElement;
	const time_control_select = document.getElementById('time_control_select') as HTMLSelectElement;
	const game_date_input = document.getElementById('game_date_input') as HTMLInputElement;
	const game_time_input = document.getElementById('game_time_input') as HTMLInputElement;

	const white_option = document.querySelector('option[value="' + white_input.value + '"]');
	const black_option = document.querySelector('option[value="' + black_input.value + '"]');
	const result = result_select.options[result_select.selectedIndex].value;
	const time_control_id = time_control_select.options[time_control_select.selectedIndex].value;
	const time_control_name = time_control_select.options[time_control_select.selectedIndex].text;

	if (game_date_input.value == '') {
		alert('Invalid date');
		return;
	}
	if (game_time_input.value == '') {
		alert('Invalid time');
		return;
	}

	const white = white_option != null ? white_option.id : '';
	const black = black_option != null ? black_option.id : '';
	const response = await fetch('/games_create', {
		method: 'POST',
		body: JSON.stringify({
			w: white,
			b: black,
			r: result,
			tc_i: time_control_id,
			tc_n: time_control_name,
			d: game_date_input.value,
			t: game_time_input.value + ':' + `${Math.floor(Math.random() * 999)}`
		}),
		headers: { 'Content-type': 'application/json; charset=UTF-8' }
	});

	const data = await response.json();
	if (data.r == '0') {
		alert(data.reason);
		return;
	}

	window.location.href = '/games_create_page';
}

window.onload = async function () {
	initialize_window_client_games_create();

	let submit = document.getElementById('submit_new_game_button') as HTMLButtonElement;
	submit.onclick = submit_new_game;

	set_footer_version_number();
};
