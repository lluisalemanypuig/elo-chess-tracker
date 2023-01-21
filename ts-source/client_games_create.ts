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

async function fill_username_datalists() {
	let white_datalist = document.getElementById("white_datalist") as HTMLDataListElement;
	let black_datalist = document.getElementById("black_datalist") as HTMLDataListElement;

	{
	let opt = document.createElement('option');
	opt.text = "";
	opt.value = "";
	white_datalist.appendChild(opt);
	}

	// "query" the server
	const response = await fetch(
		"/query_user_list",
		{
			method: 'GET',
			headers: { 'Content-type': 'application/json; charset=UTF-8' }
		}
	);

	const data = await response.json();
	if (data.r == '0') {
		alert(data.reason);
		return;
	}

	const list = data.data as [string, string][];

	let options = "";
	list.forEach(
		function (elem: [string, string]) {
			options += '<option id="' + elem[1] + '" value="' + elem[0] + '">';
		}
	);
	white_datalist.innerHTML = options;
	black_datalist.innerHTML = options;
}

async function submit_new_game(event: any) {
	let white_list = document.getElementById("white_list") as HTMLInputElement;
	let black_list = document.getElementById("black_list") as HTMLInputElement;
	let result_select = document.getElementById("result_select") as HTMLSelectElement;

	const white_option = document.querySelector('option[value="' + white_list.value + '"]');
	const black_option = document.querySelector('option[value="' + black_list.value + '"]');
	const result = result_select.options[result_select.selectedIndex].value;

	let white = "";
	if (white_option != null) {
		white = white_option.id;
	}

	let black = "";
	if (black_option != null) {
		black = black_option.id;
	}

	console.log(`White:`, white);
	console.log(`Black:`, black);
	console.log(`Result: '${result}'`);

	const response = await fetch(
		"/games_create",
		{
			method: 'POST',
			body: JSON.stringify({ 'w' : white, 'b' : black, 'r' : result }),
			headers: { 'Content-type': 'application/json; charset=UTF-8' }
		}
	);

	const data = await response.json();
	if (data.r == '0') {
		alert(data.reason);
		return;
	}

	window.location.href = "/games_create";
}

window.onload = async function () {
	fill_username_datalists();

	let submit = document.getElementById("submit_new_game_button") as HTMLButtonElement;
	submit.onclick = submit_new_game;
}