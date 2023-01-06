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

import { UserRole, all_user_roles, user_role_to_string } from "./models/user_role";

function user_was_chosen(event: any) {
	console.log("Changed!");
}

async function fill_username_datalist() {
	let username_datalist = document.getElementById("username_datalist") as HTMLDataListElement;

	{
	let opt = document.createElement('option');
	opt.text = "";
	opt.value = "";
	username_datalist.appendChild(opt);
	}

	// "query" the server
	const response = await fetch(
		"/user_list_query",
		{
			method: 'GET',
			headers: { 'Content-type': 'application/json; charset=UTF-8' }
		}
	);

	const data = await response.json();
	const list = data.data as [string,string][];

	let options = "";
	list.forEach(
		function(elem: [string,string]) {
			options += '<option value="' + elem[0] + '">';
		}
	);
	username_datalist.innerHTML = options;
}

function add_to_select(dd: HTMLSelectElement, show: string, value: string) {
	let opt = document.createElement('option');
	opt.text = show;
	opt.value = value;
	dd.appendChild(opt);
}

window.onload = function () {
	// imlement behaviour of data list
	let username_datalist_input = document.getElementById("usernames_list") as HTMLInputElement;
	username_datalist_input.onselectionchange = user_was_chosen;
	
	// fill in username dropdown with values
	fill_username_datalist();

	// fill in select role dropdown with values
	let role_select = document.getElementById("role_select") as HTMLSelectElement;
	add_to_select(role_select, "", "");
	all_user_roles.forEach(
		function(str: string) {
			add_to_select(role_select, user_role_to_string[str as UserRole], str);
		}
	);
}
