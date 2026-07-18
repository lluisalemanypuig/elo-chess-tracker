/*
Elo rating for a Chess Club
Copyright (C) 2023 - 2026  Lluís Alemany Puig

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

import { result_from_text_to_value } from '@common/models/game';
import { GameCreateInput } from '@common/schemas/games';
import { isDefined } from '@common/utils/is_defined';
import { server_call } from '@client/action';
import { ROUTE_QUERY_HTML_USER_LIST, GAME_CREATE } from '@common/routes';

async function initialize_window_client_games_create() {
	let datalist_white_users = document.getElementById('datalist_white_users') as HTMLDataListElement;
	let datalist_black_users = document.getElementById('datalist_black_users') as HTMLDataListElement;

	// query the server for the list of users
	const response = await server_call(ROUTE_QUERY_HTML_USER_LIST, 'GET', '');
	const data = await response.text();
	if (response.status >= 400) {
		alert(`${response.status} -- ${response.statusText}\nMessage: '${data}'`);
		return;
	}

	datalist_white_users.innerHTML = data;
	datalist_black_users.innerHTML = data;
}

async function submit_new_game(_event: any) {
	let game_title_input = document.getElementById('input_game_title') as HTMLInputElement;
	let white_input = document.getElementById('list_white_users') as HTMLInputElement;
	let black_input = document.getElementById('list_black_users') as HTMLInputElement;
	let select_result_game = document.getElementById('select_result_game') as HTMLSelectElement;
	const select_time_control = document.getElementById('select_time_control') as HTMLSelectElement;
	const input_game_date = document.getElementById('input_game_date') as HTMLInputElement;
	const input_game_time = document.getElementById('input_game_time') as HTMLInputElement;

	const white_option = document.querySelector('option[value="' + white_input.value + '"]');
	const black_option = document.querySelector('option[value="' + black_input.value + '"]');
	const result_str = select_result_game.options[select_result_game.selectedIndex].value;
	const time_control_id = select_time_control.options[select_time_control.selectedIndex].value;
	const time_control_name = select_time_control.options[select_time_control.selectedIndex].text;

	const result = result_from_text_to_value(result_str);
	if (!isDefined(result)) {
		console.log(`Wrong result for the game '${result_str}'.`);
		return;
	}

	if (input_game_date.value == '') {
		alert('Invalid date');
		return;
	}
	if (input_game_time.value == '') {
		alert('Invalid time');
		return;
	}

	const game_title = game_title_input.value;
	if (!isDefined(white_option)) {
		console.log('Could not find white option');
		return;
	}
	if (!isDefined(black_option)) {
		console.log('Could not find black option');
		return;
	}
	const white = white_option.id;
	const black = black_option.id;

	const rand_sec = `${Math.floor(Math.random() * 59)}`;
	const rand_milli = `${Math.floor(Math.random() * 999)}`;
	const response = await server_call(
		GAME_CREATE,
		'POST',
		JSON.stringify({
			title: game_title,
			w: Number(white),
			b: Number(black),
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
		} satisfies GameCreateInput)
	);
	if (response.status >= 400) {
		const message = await response.text();
		alert(`${response.status} -- ${response.statusText}\nMessage: '${message}'`);
		return;
	}

	white_input.value = '';
	black_input.value = '';
	select_result_game.value = '';
}

window.onload = async function () {
	initialize_window_client_games_create();

	let submit = document.getElementById('submit_new_game_button') as HTMLButtonElement;
	submit.onclick = submit_new_game;
};
