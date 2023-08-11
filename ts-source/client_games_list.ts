/*
Elo rating for a Chess Club
Copyright (C) 2023  Lluís Alemany Puig

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

function new_text_cell(text: string) {
	let cell = document.createElement("td");
	cell.textContent = text;
	return cell;
}

function edit_button_was_clicked(event: any) {
	console.log(`Button ${event.target.id} was clicked!`);
}

function new_button_cell(text: string, game_id: string, row_num: number) {
	let button = document.createElement("button") as HTMLButtonElement;
	button.textContent = text;
	button.id = "button-" + game_id + "-" + row_num;
	button.setAttribute("game_id", game_id);
	button.setAttribute("row_num", String(row_num));
	button.onclick = edit_button_was_clicked;
	button.disabled = true;
	return button;
}

function result_selection_changed(event: any) {
	const select = event.target;
	const id = select.id as string;
	
	let button = document.getElementById( select.getAttribute("button_id") ) as HTMLButtonElement;

	if (select.value != select.getAttribute("original_value")) {
		button.disabled = false;
	}
	else {
		button.disabled = true;
	}
}

function new_select_cell_result(original_result: string, game_id: string, row_num: number) {
	let select_result = document.createElement("select") as HTMLSelectElement;

	const result_from_text_to_value = function(text: string) {
		if (text == "1 - 0") { return "white_wins"; }
		if (text == "1/2 - 1/2") { return "draw"; }
		if (text == "0 - 1") { return "black_wins"; }
		return "????";
	}

	{
	const add_result_option = function(text: string) {
		let option_result = document.createElement("option") as HTMLOptionElement;
		option_result.text = text;
		option_result.value = result_from_text_to_value(text);
		select_result.appendChild(option_result);
	};
	add_result_option("1 - 0");
	add_result_option("1/2 - 1/2");
	add_result_option("0 - 1");
	}

	select_result.value = result_from_text_to_value(original_result);
	select_result.onchange = result_selection_changed;
	select_result.setAttribute("original_value", result_from_text_to_value(original_result));
	select_result.setAttribute("button_id", "button-" + game_id + "-" + row_num);

	return select_result;
}

window.onload = async function () {
	const val = document.getElementById("type_of_list")?.getAttribute('value');

	let query_to_server: string = "";
	if (val == "all") {
		query_to_server = "/query_games_all";
	}
	else if (val == "own") {
		query_to_server = "/query_games_own";
	}

	// "query" the server
	const response = await fetch(
		query_to_server,
		{
			method: 'GET',
			headers: { 'Content-type': 'application/json; charset=UTF-8' }
		}
	);

	const data = await response.json();
	if (data.r == '0') {
		return;
	}

	const games = data.games as any[];

	let table = document.getElementById("games_table") as HTMLTableElement;
    let tbody = table.getElementsByTagName("tbody")[0];
	
	for (let i = 0; i < games.length; i++) {
		let row = document.createElement("tr");

		row.appendChild(new_text_cell(games[i].id));
		row.appendChild(new_text_cell(games[i].white));
		row.appendChild(new_text_cell(games[i].black));
		
		row.appendChild(new_select_cell_result(games[i].result, games[i].id, i + 1));
		
		row.appendChild(new_text_cell(games[i].time_control));
		row.appendChild(new_text_cell(games[i].date));
		row.appendChild(new_text_cell(games[i].white_rating));
		row.appendChild(new_text_cell(games[i].white_increment));
		row.appendChild(new_text_cell(games[i].black_rating));
		row.appendChild(new_text_cell(games[i].black_increment));

		if (games[i].editable == "yes") {
			row.appendChild(new_button_cell("Edit", games[i].id, i + 1));
		}

		tbody.appendChild(row);
	}
}