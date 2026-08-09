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
import { ROUTES } from '@common/routes';
import { PlayerPrivateId } from '@common/models/player';

async function logIntoWebpage(_event: any) {
	// username box
	const usernameBox = document.getElementById('username-box');
	if (usernameBox === null) {
		console.log("Element 'username-box' does not exist.");
		return;
	}

	// password box
	const passwordBox = document.getElementById('password-box');
	if (passwordBox === null) {
		console.log("Element 'password-box' does not exist.");
		return;
	}

	const username = (usernameBox as HTMLInputElement).value as PlayerPrivateId;
	const password = (passwordBox as HTMLInputElement).value as PlayerPrivateId;

	if (username === '' || password === '') {
		return;
	}

	// "query" the server
	const response = await serverCall(ROUTES.USER_LOGIN, { u: username, p: password });
	if (response.status === 'Error') {
		alert(messageFromResponse(response));
		return;
	}

	const data = response.value;

	// put identity cookies
	const cookies = data['cookies'];
	for (const c of cookies) {
		document.cookie = c;
	}
	window.location.href = ROUTES.HOME;
}

async function passwordBoxKeyDown(event: any) {
	if (event.key === 'Enter') {
		logIntoWebpage(event);
	}
}

window.onload = function () {
	// define behaviour of login button
	let loginButton = document.getElementById('login-button') as HTMLButtonElement;
	loginButton.onclick = logIntoWebpage;

	let passwordBox = document.getElementById('password-box') as HTMLInputElement;
	passwordBox.onkeydown = passwordBoxKeyDown;
};
