/*
Elo rating for a Chess Club
Copyright (C) 2023 - 2024  Lluís Alemany Puig

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

async function fill_username_datalist() {
	let username_datalist = document.getElementById("username_datalist") as HTMLDataListElement;

	{
	let opt = document.createElement('option');
	opt.text = "";
	opt.value = "";
	username_datalist.appendChild(opt);
	}

	const response = await fetch(
		"/query_users_list",
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
			options += '<option id="' + elem[1] + '" value="' + elem[0] + '">';
		}
	);
	username_datalist.innerHTML = options;
}

async function user_was_changed(event: any) {
	all_user_roles.forEach(
		function(role: string) {
			let checkbox_role = document.getElementById("checkbox_" + role) as HTMLInputElement;
			checkbox_role.checked = false;
		}
	);
	let first_name_box = document.getElementById("first_name_box") as HTMLInputElement;
	let last_name_box = document.getElementById("last_name_box") as HTMLInputElement;
	first_name_box.value = "";
	last_name_box.value = "";

	let username_list_input = document.getElementById("username_list") as HTMLInputElement;
	const username_option = document.querySelector('option[value="' + username_list_input.value + '"]');

	if (username_option != null) {
		const username = (username_option as HTMLOptionElement).id;
		const response = await fetch(
			"/query_users_edit",
			{
				method: 'POST',
				body: JSON.stringify({'u' : username}),
				headers: { 'Content-type': 'application/json; charset=UTF-8' }
			}
		);

		const data = await response.json();
		if (data.r == '0') {
			alert(data.reason);
			return;
		}

		first_name_box.value = data.first_name;
		last_name_box.value = data.last_name;

		all_user_roles.forEach(
			function(role: string) {
				let checkbox_role = document.getElementById("checkbox_" + role) as HTMLInputElement;
				if (data.roles.includes(role)) {
					checkbox_role.checked = true;
				}
			}
		);
	}
}

async function submit_was_clicked(event: any) {
	// username
	let username_list_input = document.getElementById("username_list") as HTMLInputElement;
	const username = (document.querySelector('option[value="' + username_list_input.value + '"]') as HTMLOptionElement).id;

	// first and last name
	const first_name = (document.getElementById("first_name_box") as HTMLInputElement).value;
	const last_name = (document.getElementById("last_name_box") as HTMLInputElement).value;

	// retrieve selected role
	let selected_roles: string[] = [];
	all_user_roles.forEach(
		function(role: string) {
			let checkbox_role = document.getElementById("checkbox_" + role) as HTMLInputElement;
			if (checkbox_role.checked) {
				selected_roles.push(role);
			}
		}
	);

	const response = await fetch(
		"/users_edit",
		{
			method: 'POST',
			body: JSON.stringify({'u' : username, 'f' : first_name, 'l' : last_name, 'r': selected_roles}),
			headers: { 'Content-type': 'application/json; charset=UTF-8' }
		}
	);

	const data = await response.json();
	if (data.r == '0') {
		alert(data.reason);
		return;
	}

	window.location.href = "/";
}

window.onload = function () {
	// fill in username datalist with values
	fill_username_datalist();

	// imlement behaviour of data list
	let username_datalist_input = document.getElementById("username_list") as HTMLInputElement;
	username_datalist_input.onselectionchange = user_was_changed;

	// imlement behaviour of submit button
	let submit_button = document.getElementById("submit_button") as HTMLButtonElement;
	submit_button.onclick = submit_was_clicked;

	// fill in role checkboxes with values
	let add_checkbox = function(div: HTMLDivElement, show: string, value: string) {
		let checkbox = document.createElement("input");
		checkbox.type = "checkbox";
		checkbox.id = "checkbox_" + value;
		div.appendChild(checkbox);
		
		let checkbox_label = document.createElement("label");
		checkbox_label.textContent = show;
		div.appendChild(checkbox_label);
		div.appendChild(document.createElement("br"));
	}
	let role_div = document.getElementById("role_checkboxes") as HTMLDivElement;
	all_user_roles.forEach(
		function(role: string) {
			add_checkbox(role_div, user_role_to_string[role as UserRole], role);
		}
	);
	role_div.appendChild(document.createElement("br"));
}
