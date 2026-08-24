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

import { messageFromResponse, serverCall } from '@client/action';
import { ROUTES } from '@common/api/routes';
import { toPlayerPrivateId } from '@common/models/player-id';
import { toUserGivenName } from '@common/models/user-given-name';
import {
	ALL_USER_ROLES,
	arrayStringToRoles,
	USER_ROLE_TO_STRING,
	UserRole,
} from '@common/models/user-role';
import { isNotDefined } from '@common/utils/is-defined';
import { shuffleString } from '@common/utils/shuffle-random';
import 'htmx.org';

async function submitNewUserClicked(_event: any) {
	// username box
	const usernameBoxElem = document.getElementById('username-box');
	if (isNotDefined(usernameBoxElem)) {
		console.log("Element 'usernameBox' does not exist.");
		return;
	}
	const usernameBox = usernameBoxElem as HTMLInputElement;

	// firstName box
	const boxFirstNameElem = document.getElementById('box-first-name');
	if (isNotDefined(boxFirstNameElem)) {
		console.log("Element 'boxFirstName' does not exist.");
		return;
	}
	const boxFirstName = boxFirstNameElem as HTMLInputElement;

	// lastName box
	const boxLastNameElem = document.getElementById('box-last-name');
	if (isNotDefined(boxLastNameElem)) {
		console.log("Element 'boxLastName' does not exist.");
		return;
	}
	const boxLastName = boxLastNameElem as HTMLInputElement;

	// password box
	const passwordBoxElem = document.getElementById('password-box');
	if (isNotDefined(passwordBoxElem)) {
		console.log("Element 'passwordBox' does not exist.");
		return;
	}
	const passwordBox = passwordBoxElem as HTMLInputElement;

	const username = usernameBox.value;
	const firstname = boxFirstName.value;
	const lastname = boxLastName.value;

	const selectedRolesStr: string[] = [];
	ALL_USER_ROLES.forEach(function (role: string) {
		const checkboxRole = document.getElementById(role) as HTMLInputElement;
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
		username: toPlayerPrivateId(username),
		firstName: toUserGivenName(firstname),
		lastName: toUserGivenName(lastname),
		roles: selectedRoles,
		password: password,
	});
	if (response.status === 'Error') {
		alert(messageFromResponse(response));
		return;
	}

	window.location.href = ROUTES.HOME;
}

function addCheckbox(div: HTMLDivElement, show: string, value: string) {
	const checkbox = document.createElement('input');
	checkbox.type = 'checkbox';
	checkbox.id = value;
	div.appendChild(checkbox);

	const checkboxLabel = document.createElement('label');
	checkboxLabel.textContent = show;
	div.appendChild(checkboxLabel);
	div.appendChild(document.createElement('br'));
}

// In case of accidental overwrite, use:
// '$ALLOWED-SYMBOLS-RANDOM.PASSWORD'
// (replace the dashes '-' with underscores '_')

// This string is randomized by the build script which the administrator must
// use in order to configure the webpage in their machine.
const characterSamples: string = '$ALLOWED_SYMBOLS_RANDOM_PASSWORD';

function generateRandomPassword(_event: Event) {
	const passwordBoxElem = document.getElementById('password-box');
	if (isNotDefined(passwordBoxElem)) {
		console.log("Element 'passwordBox' does not exist.");
		return;
	}
	const passwordBox = passwordBoxElem as HTMLInputElement;

	passwordBox.value = shuffleString(characterSamples).substring(0, 14);
}

window.onload = function () {
	// fill in select role dropdown with values
	const roleDiv = document.getElementById(
		'div-role-checkboxes',
	) as HTMLDivElement;
	ALL_USER_ROLES.forEach(function (str: string) {
		addCheckbox(roleDiv, USER_ROLE_TO_STRING[str as UserRole], str);
	});
	roleDiv.appendChild(document.createElement('br'));

	// set the onclick event for random password generation
	const passwordGenerator = document.getElementById(
		'random-password-button',
	) as HTMLDivElement;
	passwordGenerator.onclick = generateRandomPassword;

	// link button click with function
	const submitNewUser = document.getElementById(
		'submit-new-user-button',
	) as HTMLLinkElement;
	submitNewUser.onclick = submitNewUserClicked;
};
