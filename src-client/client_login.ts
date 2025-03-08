/*
Elo rating for a Chess Club
Copyright (C) 2023 - 2025  Lluís Alemany Puig

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

Full source code of elo-chess-tracker:
	https://github.com/lluisalemanypuig/elo-chess-tracker

Contact:
	Lluís Alemany Puig
	https://github.com/lluisalemanypuig
*/

import { set_footer_version_number } from './client_utils_version_number';

async function log_into_webpage(_event: any) {
	// username box
	const _username_box = document.getElementById('username_box');
	if (_username_box == null) {
		console.log("Element 'username_box' does not exist.");
		return;
	}

	// password box
	const _password_box = document.getElementById('password_box');
	if (_password_box == null) {
		console.log("Element 'password_box' does not exist.");
		return;
	}

	const username = (_username_box as HTMLInputElement).value;
	const password = (_password_box as HTMLInputElement).value;

	if (username == '' || password == '') {
		return;
	}

	// "query" the server
	const response = await fetch('/user/login', {
		method: 'POST',
		body: JSON.stringify({ u: username, p: password }),
		headers: { 'Content-type': 'application/json; charset=UTF-8' }
	});

	const data = await response.json();
	if (data.r == '0') {
		alert('Incorrect user or password.');
		return;
	}

	// put identity cookies
	let cookies = data['cookies'];
	for (let i = 0; i < cookies.length; ++i) {
		document.cookie = cookies[i];
	}
	window.location.href = '/home';
}

async function set_login_page_title() {
	const response = await fetch('/title/login_page', {
		method: 'GET',
		headers: { 'Content-type': 'application/json; charset=UTF-8' }
	});
	const data = await response.text();

	// set the title of the page
	let title = document.getElementById('title_login_page') as HTMLElement;
	title.textContent = data as string;
}

async function password_box_key_down(_event: any) {
	if (_event.key == 'Enter') {
		log_into_webpage(_event);
	}
}

window.onload = function () {
	// define behaviour of login button
	let login_button = document.getElementById('login_button') as HTMLButtonElement;
	login_button.onclick = log_into_webpage;

	let password_box = document.getElementById('password_box') as HTMLInputElement;
	password_box.onkeydown = password_box_key_down;

	set_login_page_title();

	set_footer_version_number();
};
