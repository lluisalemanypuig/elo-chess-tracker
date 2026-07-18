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

import { isDefined } from '@common/utils/is_defined';
import { GameDeleteInput, GameEditResultInput, GameEditTitleInput } from '@common/schemas/games';
import { QueryGamesListAllInput, QueryGamesListOwnInput } from '@common/schemas/query_games';
import { result_from_text_to_value } from '@common/models/game';
import { server_call } from '@client/action';
import { Routes } from '@common/routes';

function new_text_cell(text: string) {
	let cell = document.createElement('td');
	cell.textContent = text;
	return cell;
}

function new_rating_cell(rating: string, increment: string) {
	let cell = document.createElement('td');

	let s1 = document.createElement('span');
	s1.textContent = rating + ' ';
	cell.appendChild(s1);

	if (increment[1] != '0') {
		let s2 = document.createElement('span');
		s2.textContent = increment;
		if (increment[0] == '+') {
			s2.style.color = 'green';
		} else {
			s2.style.color = 'red';
		}
		cell.appendChild(s2);
	}

	return cell;
}

async function select_result_game_on_change(event: any) {
	const select = event.target;

	const game_id = select.getAttribute('game_id');
	const new_result = select.value;

	if (new_result == select.getAttribute('original_value')) {
		return;
	}

	const response = await server_call(
		Routes.GAME_EDIT_RESULT,
		'POST',
		JSON.stringify({
			id: game_id,
			new_result: new_result
		} satisfies GameEditResultInput)
	);

	if (response.status >= 400) {
		const message = await response.text();
		alert(`${response.status} -- ${response.statusText}\nMessage: '${message}'`);
		return;
	}

	location.reload();
}

function new_cell_select_result(original_result: string, game_id: string) {
	let select = document.createElement('select') as HTMLSelectElement;

	{
		const add_result_option = function (text: string) {
			let option_result = document.createElement('option') as HTMLOptionElement;
			option_result.text = text;
			option_result.value = result_from_text_to_value(text) ?? '????';
			select.appendChild(option_result);
		};
		add_result_option('1 - 0');
		add_result_option('1/2 - 1/2');
		add_result_option('0 - 1');
	}

	select.className = 'select-edit-game';
	select.value = result_from_text_to_value(original_result) ?? '???';
	select.onchange = select_result_game_on_change;
	select.setAttribute('original_value', result_from_text_to_value(original_result) ?? '???');
	select.setAttribute('game_id', game_id);

	let cell = document.createElement('td');
	cell.appendChild(select);
	return cell;
}

async function button_delete_game_on_click(event: any) {
	const button = event.target;

	let select_time_control = document.getElementById('select_time_control') as HTMLSelectElement;
	let previous_time_control_id = select_time_control.options[select_time_control.selectedIndex].value;

	const game_id = button.getAttribute('game_id');
	const response = await server_call(
		Routes.GAME_DELETE,
		'POST',
		JSON.stringify({ id: game_id } satisfies GameDeleteInput)
	);

	if (response.status >= 400) {
		const message = await response.text();
		alert(`${response.status} -- ${response.statusText}\nMessage: '${message}'`);
		return;
	}

	fill_games_list_time_control(previous_time_control_id);
}

function new_cell_button_delete_game(game_id: string) {
	let button = document.createElement('button') as HTMLButtonElement;
	button.textContent = 'Delete';
	button.className = 'button-delete-game';
	button.setAttribute('game_id', game_id);
	button.onclick = button_delete_game_on_click;

	let cell = document.createElement('td');
	cell.appendChild(button);
	return cell;
}

async function trigger_edit_game_title(event: Event) {
	let input = event.target as HTMLInputElement;
	const game_id = input.getAttribute('game_id');
	const original_title = input.getAttribute('original_title');
	const new_title = input.value;

	if (!isDefined(game_id)) {
		console.log('Game id could not be retrieved');
		return;
	}
	if (original_title == new_title) {
		return;
	}

	const response = await server_call(
		Routes.GAME_EDIT_TITLE,
		'POST',
		JSON.stringify({ id: game_id, title: new_title } satisfies GameEditTitleInput)
	);

	if (response.status >= 400) {
		const message = await response.text();
		alert(`${response.status} -- ${response.statusText}\nMessage: '${message}'`);
		return;
	}

	input.setAttribute('original_title', new_title);
}

async function edit_game_title(event: Event) {
	switch (event.type) {
		case 'keydown':
			const key = (event as KeyboardEvent).key;
			if (key === 'Enter') {
				trigger_edit_game_title(event);
			}
			break;

		case 'blur':
			trigger_edit_game_title(event);
			break;
	}
}

function new_cell_text_input(game_id: string, title: string) {
	let input = document.createElement('input') as HTMLInputElement;
	input.value = `${title}`;
	input.className = 'input-text';
	input.setAttribute('game_id', game_id);
	input.setAttribute('original_title', title);
	input.onkeydown = edit_game_title;
	input.onblur = edit_game_title;

	let cell = document.createElement('td');
	cell.appendChild(input);
	return cell;
}

async function fill_games_list_time_control(time_control_id: string) {
	let table = document.getElementById('table-games') as HTMLTableElement;
	const val = table.getAttribute('value');

	let response;
	if (val == 'all') {
		response = await server_call(
			Routes.QUERY_GAME_LIST_ALL,
			'POST',
			JSON.stringify({ tc_i: time_control_id } satisfies QueryGamesListAllInput)
		);
	} else if (val == 'own') {
		response = await server_call(
			Routes.QUERY_GAME_LIST_OWN,
			'POST',
			JSON.stringify({ tc_i: time_control_id } satisfies QueryGamesListOwnInput)
		);
	} else {
		console.log(`Wrong value for list '${val}'.`);
		return;
	}

	if (response.status >= 400) {
		const message = await response.text();
		alert(`${response.status} -- ${response.statusText}\nMessage: '${message}'`);
		return;
	}

	const games = (await response.json()) as any[];

	let new_tbody = document.createElement('tbody');
	for (const g of games) {
		let row = document.createElement('tr');

		if (g.editable == 'y') {
			if (g.title == '') {
				row.appendChild(new_text_cell(''));
			} else {
				row.appendChild(new_cell_text_input(g.id, g.title));
			}
		} else {
			row.appendChild(new_text_cell(g.title));
		}

		row.appendChild(new_text_cell(g.time_control));

		const when = g.date.substring(0, g.date.length - (3 + 1 + 2 + 1));
		row.appendChild(new_text_cell(when));

		row.appendChild(new_rating_cell(g.white_rating, g.white_increment));
		row.appendChild(new_text_cell(g.white));

		if (g.editable == 'y') {
			row.appendChild(new_cell_select_result(g.result, g.id));
		} else {
			row.appendChild(new_text_cell(g.result));
		}

		row.appendChild(new_text_cell(g.black));
		row.appendChild(new_rating_cell(g.black_rating, g.black_increment));

		if (g.deleteable == 'y') {
			row.appendChild(new_cell_button_delete_game(g.id));
		}

		new_tbody.appendChild(row);
	}

	let old_tbody = table.getElementsByTagName('tbody')[0] as HTMLElement;
	old_tbody.parentNode?.replaceChild(new_tbody, old_tbody);
}

async function fill_games_list(_event: any) {
	const select_time_control = document.getElementById('select_time_control') as HTMLSelectElement;
	const time_control_id = select_time_control.options[select_time_control.selectedIndex].value;
	fill_games_list_time_control(time_control_id);
}

window.onload = async function () {
	fill_games_list_time_control('');

	let time_control = document.getElementById('select_time_control') as HTMLSelectElement;
	time_control.onchange = fill_games_list;
};
