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

function new_text_cell(text: string) {
	let cell = document.createElement('td');
	cell.textContent = text;
	return cell;
}

async function select_result_game_on_change(event: any) {
	const select = event.target;

	const game_id = select.getAttribute('game_id');
	const new_result = select.value;

	if (new_result == select.getAttribute('original_value')) {
		return;
	}

	const response = await fetch('/game/edit_result', {
		method: 'POST',
		body: JSON.stringify({
			game_id: game_id,
			new_result: new_result
		}),
		headers: { 'Content-type': 'application/json; charset=UTF-8' }
	});

	if (response.status >= 400) {
		const message = await response.text();
		alert(`${response.status} -- ${response.statusText}\nMessage: '${message}'`);
		return;
	}

	location.reload();
}

function new_select_cell(original_result: string, game_id: string) {
	let select = document.createElement('select') as HTMLSelectElement;

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
			select.appendChild(option_result);
		};
		add_result_option('1 - 0');
		add_result_option('1/2 - 1/2');
		add_result_option('0 - 1');
	}

	select.className = 'select_edit_game';
	select.id = 'select_result_' + game_id;
	select.value = result_from_text_to_value(original_result);
	select.onchange = select_result_game_on_change;
	select.setAttribute('original_value', result_from_text_to_value(original_result));
	select.setAttribute('game_id', game_id);

	let cell = document.createElement('td');
	cell.appendChild(select);
	return cell;
}

async function fill_games_list_time_control(time_control_id: string) {
	const val = document.getElementById('table_games')?.getAttribute('value');

	const query_to_server: string = (() => {
		if (val == 'all') {
			return '/query/game/list/all';
		}
		if (val == 'own') {
			return '/query/game/list/own';
		}
		return '?';
	})();

	const response = await fetch(query_to_server, {
		method: 'POST',
		body: JSON.stringify({ tc_i: time_control_id }),
		headers: { 'Content-type': 'application/json; charset=UTF-8' }
	});
	if (response.status >= 400) {
		const message = await response.text();
		alert(`${response.status} -- ${response.statusText}\nMessage: '${message}'`);
		return;
	}

	const games = (await response.json()) as any[];

	let new_tbody = document.createElement('tbody');
	for (let i = 0; i < games.length; i++) {
		let row = document.createElement('tr');

		//row.appendChild(new_text_cell(games[i].id));
		row.appendChild(new_text_cell(games[i].white));
		row.appendChild(new_text_cell(games[i].black));

		if (games[i].editable == 'y') {
			row.appendChild(new_select_cell(games[i].result, games[i].id));
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

		new_tbody.appendChild(row);
	}

	let table = document.getElementById('table_games') as HTMLTableElement;
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
