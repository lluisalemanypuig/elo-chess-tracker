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
import 'htmx.org';

async function buttonSubmitClicked() {
	let boxOldPassword = document.getElementById(
		'box-old-password',
	) as HTMLInputElement;
	let boxNewPassword = document.getElementById(
		'box-new-password',
	) as HTMLInputElement;
	let boxRepeatPassword = document.getElementById(
		'box-repeat-password',
	) as HTMLInputElement;

	if (boxNewPassword.value !== boxRepeatPassword.value) {
		alert('The passwords must coincide');
		return;
	}

	const response = await serverCall(ROUTES.USER_PASSWORD_CHANGE, {
		old: boxOldPassword.value,
		new: boxNewPassword.value,
	});
	if (response.status === 'Error') {
		alert(messageFromResponse(response));
		return;
	}

	// return to login page
	window.location.href = ROUTES.ROOT;
}

window.onload = function () {
	let buttonSubmit = document.getElementById(
		'button-submit',
	) as HTMLButtonElement;
	buttonSubmit.onclick = buttonSubmitClicked;
};
