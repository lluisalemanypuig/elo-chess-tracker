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
import {
	UserRole,
	ALL_USER_ROLES,
	USER_ROLE_TO_STRING,
	arrayStringToRoles,
	stringToRole
} from '@common/models/user-role';
import { isNotDefined } from '@common/utils/is-defined';
import { ROUTES } from '@common/api/routes';
import { PlayerPublicId } from '@common/models/player-id';
import { toUserGivenName } from '@common/models/user-given-name';

async function userWasChanged(_event: any) {
	ALL_USER_ROLES.forEach(function (role: string) {
		let checkboxRole = document.getElementById('checkbox-' + role) as HTMLInputElement;
		checkboxRole.checked = false;
	});
	let boxFirstName = document.getElementById('box-first-name') as HTMLInputElement;
	let boxLastName = document.getElementById('box-last-name') as HTMLInputElement;
	boxFirstName.value = '';
	boxLastName.value = '';

	let usernameListInput = document.getElementById('username-list') as HTMLInputElement;
	const usernameOption = document.querySelector('option[value="' + usernameListInput.value + '"]');

	if (usernameOption !== null) {
		const userId = (usernameOption as HTMLOptionElement).id;
		const response = await serverCall(ROUTES.QUERY_USER_EDIT, { u: Number(userId) as PlayerPublicId });
		if (response.status === 'Error') {
			alert(messageFromResponse(response));
			return;
		}

		const data = response.value;
		boxFirstName.value = data.firstName;
		boxLastName.value = data.lastName;

		ALL_USER_ROLES.forEach(function (role: string) {
			let checkboxRole = document.getElementById('checkbox-' + role) as HTMLInputElement;
			const properRole = stringToRole(role);
			if (isNotDefined(properRole)) {
				console.log(`Role '${role}' could not be converted to a proper role.`);
				return;
			}
			if (data.roles.includes(properRole)) {
				checkboxRole.checked = true;
			}
		});
	}
}

async function submitWasClicked(_event: any) {
	// username
	let usernameListInput = document.getElementById('username-list') as HTMLInputElement;
	const userRid = (document.querySelector('option[value="' + usernameListInput.value + '"]') as HTMLOptionElement).id;

	// first and last name
	const firstName = (document.getElementById('box-first-name') as HTMLInputElement).value;
	const lastName = (document.getElementById('box-last-name') as HTMLInputElement).value;

	// retrieve selected role
	let selectedRolesStr: string[] = [];
	ALL_USER_ROLES.forEach(function (role: string) {
		let checkboxRole = document.getElementById('checkbox-' + role) as HTMLInputElement;
		if (checkboxRole.checked) {
			selectedRolesStr.push(role);
		}
	});
	const selectedRoles = arrayStringToRoles(selectedRolesStr);
	if (isNotDefined(selectedRoles)) {
		return;
	}

	const response = await serverCall(ROUTES.USER_EDIT, {
		u: Number(userRid) as PlayerPublicId,
		f: toUserGivenName(firstName),
		l: toUserGivenName(lastName),
		r: selectedRoles
	});
	if (response.status === 'Error') {
		alert(messageFromResponse(response));
		return;
	}

	window.location.href = ROUTES.HOME;
}

window.onload = function () {
	// imlement behaviour of data list
	let datalistUsernameInput = document.getElementById('username-list') as HTMLInputElement;
	datalistUsernameInput.onselectionchange = userWasChanged;

	// imlement behaviour of submit button
	let submitChangesButton = document.getElementById('submit-changes-button') as HTMLButtonElement;
	submitChangesButton.onclick = submitWasClicked;

	// fill in role checkboxes with values
	let addCheckbox = function (div: HTMLDivElement, show: string, value: string) {
		let checkbox = document.createElement('input');
		checkbox.type = 'checkbox';
		checkbox.id = 'checkbox-' + value;
		div.appendChild(checkbox);

		let checkboxLabel = document.createElement('label');
		checkboxLabel.textContent = show;
		div.appendChild(checkboxLabel);
		div.appendChild(document.createElement('br'));
	};
	let roleDiv = document.getElementById('div-role-checkboxes') as HTMLDivElement;
	ALL_USER_ROLES.forEach(function (role: string) {
		addCheckbox(roleDiv, USER_ROLE_TO_STRING[role as UserRole], role);
	});
};
