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

import { messageFromResponse, serverCall } from '@client/action';
import { isNotDefined } from '@common/utils/is-defined';
import { UserRole, ALL_USER_ROLES, arrayStringToRoles, USER_ROLE_TO_STRING } from '@common/models/user-role';
import { ROUTES } from '@common/routes';
import { toPlayerPrivateId } from '@common/models/player';
import { toUserGivenName } from '@common/models/user';

async function submitNewUserClicked(_event: any) {
	// username box
	const UsernameBox = document.getElementById('username-box');
	if (isNotDefined(UsernameBox)) {
		console.log("Element 'usernameBox' does not exist.");
		return;
	}
	const usernameBox = UsernameBox as HTMLInputElement;

	// firstName box
	const BoxFirstName = document.getElementById('box-first-name');
	if (isNotDefined(BoxFirstName)) {
		console.log("Element 'boxFirstName' does not exist.");
		return;
	}
	const boxFirstName = BoxFirstName as HTMLInputElement;

	// lastName box
	const BoxLastName = document.getElementById('box-last-name');
	if (isNotDefined(BoxLastName)) {
		console.log("Element 'boxLastName' does not exist.");
		return;
	}
	const boxLastName = BoxLastName as HTMLInputElement;

	// password box
	const PasswordBox = document.getElementById('password-box');
	if (isNotDefined(PasswordBox)) {
		console.log("Element 'passwordBox' does not exist.");
		return;
	}
	const passwordBox = PasswordBox as HTMLInputElement;

	const username = usernameBox.value;
	const firstname = boxFirstName.value;
	const lastname = boxLastName.value;

	let selectedRolesStr: string[] = [];
	ALL_USER_ROLES.forEach(function (role: string) {
		let checkboxRole = document.getElementById(role) as HTMLInputElement;
		if (checkboxRole.checked) {
			selectedRolesStr.push(role);
		}
	});
	const selectedRoles = arrayStringToRoles(selectedRolesStr);
	if (isNotDefined(selectedRoles)) {
		return;
	}

	const password = passwordBox.value;

	if (username === '') {
		alert('Missing username');
		return;
	}
	if (firstname === '') {
		alert('Missing first name');
		return;
	}
	if (lastname === '') {
		alert('Missing last name');
		return;
	}
	if (selectedRoles.length === 0) {
		alert('Missing roles');
		return;
	}
	if (password === '') {
		alert('Missing password');
		return;
	}

	if (isNotDefined(username)) {
		alert('username was not given');
		return;
	}

	const response = await serverCall(ROUTES.USER_CREATE, {
		u: toPlayerPrivateId(username),
		fn: toUserGivenName(firstname),
		ln: toUserGivenName(lastname),
		r: selectedRoles,
		password: password
	});
	if (response.status === 'Error') {
		alert(messageFromResponse(response));
		return;
	}

	window.location.href = ROUTES.HOME;
}

window.onload = function () {
	let addCheckbox = function (div: HTMLDivElement, show: string, value: string) {
		let checkbox = document.createElement('input');
		checkbox.type = 'checkbox';
		checkbox.id = value;
		div.appendChild(checkbox);

		let checkboxLabel = document.createElement('label');
		checkboxLabel.textContent = show;
		div.appendChild(checkboxLabel);
		div.appendChild(document.createElement('br'));
	};

	// fill in select role dropdown with values
	let roleDiv = document.getElementById('div-role-checkboxes') as HTMLDivElement;
	ALL_USER_ROLES.forEach(function (str: string) {
		addCheckbox(roleDiv, USER_ROLE_TO_STRING[str as UserRole], str);
	});
	roleDiv.appendChild(document.createElement('br'));

	// link button click with function
	let submitNewUser = document.getElementById('submit-new-user-button') as HTMLLinkElement;
	submitNewUser.onclick = submitNewUserClicked;
};
