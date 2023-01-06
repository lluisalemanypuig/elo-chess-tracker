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

async function submit_new_user_clicked(event: any) {
	// username box
	const _username_box = document.getElementById("username_box");
	if (_username_box == null) {
		console.log("Element 'username_box' does not exist.");
		return;
	}
	const username_box = _username_box as HTMLInputElement;

	// first_name box
	const _first_name_box = document.getElementById("first_name_box");
	if (_first_name_box == null) {
		console.log("Element 'first_name_box' does not exist.");
		return;
	}
	const first_name_box = _first_name_box as HTMLInputElement;

	// last_name box
	const _last_name_box = document.getElementById("last_name_box");
	if (_last_name_box == null) {
		console.log("Element 'last_name_box' does not exist.");
		return;
	}
	const last_name_box = _last_name_box as HTMLInputElement;

	// role box
	const _role_select = document.getElementById("role_select");
	if (_role_select == null) {
		console.log("Element 'role_select' does not exist.");
		return;
	}
	const role_select = _role_select as HTMLSelectElement;

	// password box
	const _password_box = document.getElementById("password_box");
	if (_password_box == null) {
		console.log("Element 'password_box' does not exist.");
		return;
	}
	const password_box = _password_box as HTMLInputElement;

	// classical_rating box
	const _classical_rating_box = document.getElementById("classical_rating_box");
	if (_classical_rating_box == null) {
		console.log("Element 'classical_rating_box' does not exist.");
		return;
	}
	const classical_rating_box = _classical_rating_box as HTMLInputElement;

	const username = username_box.value;
	const firstname = first_name_box.value;
	const lastname = last_name_box.value;
	const role = role_select.options[role_select.selectedIndex].value;
	const password = password_box.value;
	const classical_rating = classical_rating_box.value;

	console.log("Role chosen:", role);

	if (username == "") {
		alert("Missing username");
		return;
	}
	if (firstname == "") {
		alert("Missing first name");
		return;
	}
	if (lastname == "") {
		alert("Missing last name");
		return;
	}
	if (role == "") {
		alert("Missing role");
		return;
	}
	if (password == "") {
		alert("Missing password");
		return;
	}
	if (classical_rating == "") {
		alert("Missing classical rating points");
		return;
	}
	
	// "query" the server
	const response = await fetch(
		"/user_create",
		{
			method: 'POST',
			body: JSON.stringify({
				'u' : username,
				'fn' : firstname,
				'ln' : lastname,
				'r' : [role],
				'p' : password,
				'cr' : classical_rating
			}),
			headers: { 'Content-type': 'application/json; charset=UTF-8' }
		}
	);

	// report result
    const data = await response.json();
	if (data.r != "success") {
		alert(`Could not create new user: '${data.reason}'`);
	}
}

function add_to_select(dd: HTMLSelectElement, show: string, value: string) {
	let opt = document.createElement('option');
	opt.text = show;
	opt.value = value;
	dd.appendChild(opt);
}

window.onload = function () {
	// fill in select role dropdown with values
	let role_select = document.getElementById("role_select") as HTMLSelectElement;
	add_to_select(role_select, "", "");
	all_user_roles.forEach(
		function(str: string) {
			add_to_select(role_select, user_role_to_string[str as UserRole], str);
		}
	);

	// link button click with function
	let submit_new_user = document.getElementById("submit_new_user_button") as HTMLLinkElement;
	submit_new_user.onclick = submit_new_user_clicked;
}
