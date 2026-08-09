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
import { isNotDefined } from '@app/common/utils/is-defined';
import { messageFromResponse, serverCall } from '@client/action';
import { Routes } from '@common/routes';
import { PlayerPublicId } from '@common/models/player';
import { TimeControlId, TimeControlName } from '@app/common/models/time-control';
import { toDateMajor, toDateMinor } from '@common/utils/time';

async function initialize_window_client_games_create() {
	let datalist_white_users = document.getElementById('datalist_white_users') as HTMLDataListElement;
	let datalist_black_users = document.getElementById('datalist_black_users') as HTMLDataListElement;

	// query the server for the list of users
	const response = await serverCall(Routes.QUERY_HTML_USER_LIST, null);
	if (response.status === 'Error') {
		alert(messageFromResponse(response));
		return;
	}

	datalist_white_users.innerHTML = response.value;
	datalist_black_users.innerHTML = response.value;
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
	const time_control_id = select_time_control.options[select_time_control.selectedIndex].value as TimeControlId;
	const time_control_name = select_time_control.options[select_time_control.selectedIndex].text as TimeControlName;

	const result = result_from_text_to_value(result_str);
	if (isNotDefined(result)) {
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
	if (isNotDefined(white_option)) {
		console.log('Could not find white option');
		return;
	}
	if (isNotDefined(black_option)) {
		console.log('Could not find black option');
		return;
	}
	const white = Number(white_option.id) as PlayerPublicId;
	const black = Number(black_option.id) as PlayerPublicId;
	const whenCreated = toDateMajor(input_game_date.value);

	const rand_sec = `${Math.floor(Math.random() * 59)}`;
	const rand_milli = `${Math.floor(Math.random() * 999)}`;
	const timeCreated = toDateMinor(
		input_game_time.value +
			':' +
			(rand_sec.length == 1 ? '0' : '') +
			rand_sec +
			':' +
			(rand_milli.length == 1 ? '00' : rand_milli.length == 2 ? '0' : '') +
			rand_milli
	);

	const response = await serverCall(Routes.GAME_CREATE, {
		title: game_title,
		white: white,
		black: black,
		result: result,
		time_control_id: time_control_id,
		time_control_name: time_control_name,
		whenCreated: whenCreated,
		timeCreated: timeCreated
	});
	if (response.status === 'Error') {
		alert(messageFromResponse(response));
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
