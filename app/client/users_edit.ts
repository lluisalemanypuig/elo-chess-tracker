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

import { server_call } from '@client/action';
import { UserRole, all_user_roles, user_role_to_string, array_string_to_roles } from '@common/models/user_role';
import { QueryUserEditInput } from '@common/schemas/query_user';
import { UserEditInput } from '@common/schemas/user';
import { isDefined } from '@common/utils/is_defined';
import { Routes } from '@common/routes';

async function user_was_changed(_event: any) {
	all_user_roles.forEach(function (role: string) {
		let checkbox_role = document.getElementById('checkbox_' + role) as HTMLInputElement;
		checkbox_role.checked = false;
	});
	let box_first_name = document.getElementById('box_first_name') as HTMLInputElement;
	let box_last_name = document.getElementById('box_last_name') as HTMLInputElement;
	box_first_name.value = '';
	box_last_name.value = '';

	let username_list_input = document.getElementById('username_list') as HTMLInputElement;
	const username_option = document.querySelector('option[value="' + username_list_input.value + '"]');

	if (username_option != null) {
		const user_id = (username_option as HTMLOptionElement).id;
		const response = await server_call(
			Routes.QUERY_USER_EDIT,
			'POST',
			JSON.stringify({ u: Number(user_id) } satisfies QueryUserEditInput)
		);
		if (response.status >= 400) {
			const message = await response.text();
			alert(`${response.status} -- ${response.statusText}\nMessage: '${message}'`);
			return;
		}

		const data = await response.json();
		box_first_name.value = data.first_name;
		box_last_name.value = data.last_name;

		all_user_roles.forEach(function (role: string) {
			let checkbox_role = document.getElementById('checkbox_' + role) as HTMLInputElement;
			if (data.roles.includes(role)) {
				checkbox_role.checked = true;
			}
		});
	}
}

async function submit_was_clicked(_event: any) {
	// username
	let username_list_input = document.getElementById('username_list') as HTMLInputElement;
	const user_rid = (document.querySelector('option[value="' + username_list_input.value + '"]') as HTMLOptionElement)
		.id;

	// first and last name
	const first_name = (document.getElementById('box_first_name') as HTMLInputElement).value;
	const last_name = (document.getElementById('box_last_name') as HTMLInputElement).value;

	// retrieve selected role
	let selected_roles_str: string[] = [];
	all_user_roles.forEach(function (role: string) {
		let checkbox_role = document.getElementById('checkbox_' + role) as HTMLInputElement;
		if (checkbox_role.checked) {
			selected_roles_str.push(role);
		}
	});
	const selected_roles = array_string_to_roles(selected_roles_str);
	if (!isDefined(selected_roles)) {
		return;
	}

	const response = await server_call(
		Routes.USER_EDIT,
		'POST',
		JSON.stringify({
			u: Number(user_rid),
			f: first_name,
			l: last_name,
			r: selected_roles
		} satisfies UserEditInput)
	);
	if (response.status >= 400) {
		const message = await response.text();
		alert(`${response.status} -- ${response.statusText}\nMessage: '${message}'`);
		return;
	}

	window.location.href = Routes.HOME;
}

window.onload = function () {
	// imlement behaviour of data list
	let datalist_username_input = document.getElementById('username_list') as HTMLInputElement;
	datalist_username_input.onselectionchange = user_was_changed;

	// imlement behaviour of submit button
	let submit_changes_button = document.getElementById('submit_changes_button') as HTMLButtonElement;
	submit_changes_button.onclick = submit_was_clicked;

	// fill in role checkboxes with values
	let add_checkbox = function (div: HTMLDivElement, show: string, value: string) {
		let checkbox = document.createElement('input');
		checkbox.type = 'checkbox';
		checkbox.id = 'checkbox_' + value;
		div.appendChild(checkbox);

		let checkbox_label = document.createElement('label');
		checkbox_label.textContent = show;
		div.appendChild(checkbox_label);
		div.appendChild(document.createElement('br'));
	};
	let role_div = document.getElementById('div_role_checkboxes') as HTMLDivElement;
	all_user_roles.forEach(function (role: string) {
		add_checkbox(role_div, user_role_to_string[role as UserRole], role);
	});
};
