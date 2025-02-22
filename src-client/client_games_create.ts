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

import { fill_time_controls } from './client_utils_time_control_select';
import { set_footer_version_number } from './client_utils_version_number';

async function initialize_window_client_games_create() {
	let datalist_white_users = document.getElementById('datalist_white_users') as HTMLDataListElement;
	let datalist_black_users = document.getElementById('datalist_black_users') as HTMLDataListElement;

	// query the server for the list of users
	const response_user_list = await fetch('/query_users_list', {
		method: 'GET',
		headers: { 'Content-type': 'application/json; charset=UTF-8' }
	});
	const data_user_list = await response_user_list.json();
	if (data_user_list.r == '0') {
		alert(data_user_list.reason);
		return;
	}

	// fill username lists
	let options = '';
	{
		const user_list = data_user_list.data as [string, number][];
		user_list.forEach(function (elem: [string, number]) {
			options += `<option value="${elem[0]}" id="${elem[1]}">`;
		});
	}
	datalist_white_users.innerHTML = options;
	datalist_black_users.innerHTML = options;

	fill_time_controls('select_time_control');
}

async function submit_new_game(_event: any) {
	const white_input = document.getElementById('list_white_users') as HTMLInputElement;
	const black_input = document.getElementById('list_black_users') as HTMLInputElement;
	const select_result_game = document.getElementById('select_result_game') as HTMLSelectElement;
	const select_time_control = document.getElementById('select_time_control') as HTMLSelectElement;
	const input_game_date = document.getElementById('input_game_date') as HTMLInputElement;
	const input_game_time = document.getElementById('input_game_time') as HTMLInputElement;

	const white_option = document.querySelector('option[value="' + white_input.value + '"]');
	const black_option = document.querySelector('option[value="' + black_input.value + '"]');
	const result = select_result_game.options[select_result_game.selectedIndex].value;
	const time_control_id = select_time_control.options[select_time_control.selectedIndex].value;
	const time_control_name = select_time_control.options[select_time_control.selectedIndex].text;

	if (input_game_date.value == '') {
		alert('Invalid date');
		return;
	}
	if (input_game_time.value == '') {
		alert('Invalid time');
		return;
	}

	const white = white_option != null ? white_option.id : '';
	const black = black_option != null ? black_option.id : '';

	const rand_sec = `${Math.floor(Math.random() * 59)}`;
	const rand_milli = `${Math.floor(Math.random() * 999)}`;
	const response = await fetch('/games_create', {
		method: 'POST',
		body: JSON.stringify({
			w: white,
			b: black,
			r: result,
			tc_i: time_control_id,
			tc_n: time_control_name,
			d: input_game_date.value,
			t:
				input_game_time.value +
				':' +
				(rand_sec.length == 1 ? '0' : '') +
				rand_sec +
				':' +
				(rand_milli.length == 1 ? '00' : rand_milli.length == 2 ? '0' : '') +
				rand_milli
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
