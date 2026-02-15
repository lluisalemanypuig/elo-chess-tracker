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

import { UserRole, all_user_roles, user_role_to_string } from '../src-server/models/user_role';

async function submit_new_user_clicked(_event: any) {
	// username box
	const _username_box = document.getElementById('username_box');
	if (_username_box == null) {
		console.log("Element 'username_box' does not exist.");
		return;
	}
	const username_box = _username_box as HTMLInputElement;

	// first_name box
	const _box_first_name = document.getElementById('box_first_name');
	if (_box_first_name == null) {
		console.log("Element 'box_first_name' does not exist.");
		return;
	}
	const box_first_name = _box_first_name as HTMLInputElement;

	// last_name box
	const _box_last_name = document.getElementById('box_last_name');
	if (_box_last_name == null) {
		console.log("Element 'box_last_name' does not exist.");
		return;
	}
	const box_last_name = _box_last_name as HTMLInputElement;

	// password box
	const _password_box = document.getElementById('password_box');
	if (_password_box == null) {
		console.log("Element 'password_box' does not exist.");
		return;
	}
	const password_box = _password_box as HTMLInputElement;

	const username = username_box.value;
	const firstname = box_first_name.value;
	const lastname = box_last_name.value;

	let roles: string[] = [];
	all_user_roles.forEach(function (str: string) {
		let checkbox_role = document.getElementById(str) as HTMLInputElement;
		if (checkbox_role.checked) {
			roles.push(str);
		}
	});

	const password = password_box.value;

	if (username == '') {
		alert('Missing username');
		return;
	}
	if (firstname == '') {
		alert('Missing first name');
		return;
	}
	if (lastname == '') {
		alert('Missing last name');
		return;
	}
	if (roles.length == 0) {
		alert('Missing roles');
		return;
	}
	if (password == '') {
		alert('Missing password');
		return;
	}

	const response = await fetch('/user/create', {
		method: 'POST',
		body: JSON.stringify({
			u: username,
			fn: firstname,
			ln: lastname,
			r: roles,
			p: password
		}),
		headers: { 'Content-type': 'application/json; charset=UTF-8' }
	});
	if (response.status >= 400) {
		const message = await response.text();
		alert(`${response.status} -- ${response.statusText}\nMessage: '${message}'`);
		return;
	}

	window.location.href = '/home';
}

window.onload = function () {
	let add_checkbox = function (div: HTMLDivElement, show: string, value: string) {
		let checkbox = document.createElement('input');
		checkbox.type = 'checkbox';
		checkbox.id = value;
		div.appendChild(checkbox);

		let checkbox_label = document.createElement('label');
		checkbox_label.textContent = show;
		div.appendChild(checkbox_label);
		div.appendChild(document.createElement('br'));
	};

	// fill in select role dropdown with values
	let role_div = document.getElementById('div_role_checkboxes') as HTMLDivElement;
	all_user_roles.forEach(function (str: string) {
		add_checkbox(role_div, user_role_to_string[str as UserRole], str);
	});
	role_div.appendChild(document.createElement('br'));

	// link button click with function
	let submit_new_user = document.getElementById('submit_new_user_button') as HTMLLinkElement;
	submit_new_user.onclick = submit_new_user_clicked;
};
