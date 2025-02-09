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

function new_text_cell(text: string) {
	let cell = document.createElement('td');
	cell.textContent = text;
	return cell;
}

async function edit_button_was_clicked(event: any) {
	let button = event.target as HTMLButtonElement;

	const game_id = button.getAttribute('game_id');
	const new_result = (document.getElementById(button.getAttribute('select_id') as string) as HTMLSelectElement).value;

	const response = await fetch('/games_edit_result', {
		method: 'POST',
		body: JSON.stringify({
			game_id: game_id,
			new_result: new_result
		}),
		headers: { 'Content-type': 'application/json; charset=UTF-8' }
	});

	const data = await response.json();
	if (data.r == '0') {
		alert(data.reason);
		return;
	}

	location.reload();
}

function new_button_cell(text: string, game_id: string) {
	let button = document.createElement('button') as HTMLButtonElement;
	button.textContent = text;
	button.id = 'button_edit-' + game_id;
	button.setAttribute('game_id', game_id);
	button.setAttribute('select_id', 'select_result-' + game_id);
	button.onclick = edit_button_was_clicked;
	button.disabled = true;
	return button;
}

function result_selection_changed(event: any) {
	const select = event.target;

	let button = document.getElementById(select.getAttribute('button_id')) as HTMLButtonElement;

	if (select.value != select.getAttribute('original_value')) {
		button.disabled = false;
	} else {
		button.disabled = true;
	}
}

function new_select_cell_result(original_result: string, game_id: string) {
	let select_result = document.createElement('select') as HTMLSelectElement;

	const result_from_text_to_value = function (text: string) {
		if (text == '1 - 0') {
			return 'white_wins';
		}
		if (text == '1/2 - 1/2') {
			return 'draw';
		}
		if (text == '0 - 1') {
			return 'black_wins';
		}
		return '????';
	};

	{
		const add_result_option = function (text: string) {
			let option_result = document.createElement('option') as HTMLOptionElement;
			option_result.text = text;
			option_result.value = result_from_text_to_value(text);
			select_result.appendChild(option_result);
		};
		add_result_option('1 - 0');
		add_result_option('1/2 - 1/2');
		add_result_option('0 - 1');
	}

	select_result.id = 'select_result-' + game_id;
	select_result.value = result_from_text_to_value(original_result);
	select_result.onchange = result_selection_changed;
	select_result.setAttribute('original_value', result_from_text_to_value(original_result));
	select_result.setAttribute('button_id', 'button_edit-' + game_id);

	return select_result;
}

window.onload = async function () {
	const val = document.getElementById('type_of_list')?.getAttribute('value');

	const query_to_server: string = (() => {
		if (val == 'all') {
			return '/query_games_all';
		}
		if (val == 'own') {
			return '/query_games_own';
		}
		return '?';
	})();

	// "query" the server
	const response = await fetch(query_to_server, {
		method: 'GET',
		headers: { 'Content-type': 'application/json; charset=UTF-8' }
	});

	const data = await response.json();
	if (data.r == '0') {
		return;
	}

	const games = data.games as any[];

	let table = document.getElementById('games_table') as HTMLTableElement;
	let tbody = table.getElementsByTagName('tbody')[0];

	for (let i = 0; i < games.length; i++) {
		let row = document.createElement('tr');

		row.appendChild(new_text_cell(games[i].id));
		row.appendChild(new_text_cell(games[i].white));
		row.appendChild(new_text_cell(games[i].black));

		if (games[i].editable == 'y') {
			row.appendChild(new_select_cell_result(games[i].result, games[i].id));
		} else {
			row.appendChild(new_text_cell(games[i].result));
		}

		const when = games[i].date.substring(0, games[i].date.length - (3 + 1 + 2 + 1));
		row.appendChild(new_text_cell(games[i].time_control));
		row.appendChild(new_text_cell(when));
		row.appendChild(new_text_cell(games[i].white_rating));
		row.appendChild(new_text_cell(games[i].white_increment));
		row.appendChild(new_text_cell(games[i].black_rating));
		row.appendChild(new_text_cell(games[i].black_increment));

		if (games[i].editable == 'y') {
			row.appendChild(new_button_cell('Edit', games[i].id));
		}

		tbody.appendChild(row);
	}

	set_footer_version_number();
};
