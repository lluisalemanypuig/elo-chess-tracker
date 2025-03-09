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

import 'htmx.org';

async function button_submit_clicked() {
	let box_old_password = document.getElementById('box_old_password') as HTMLInputElement;
	let box_new_password = document.getElementById('box_new_password') as HTMLInputElement;
	let box_repeat_password = document.getElementById('box_repeat_password') as HTMLInputElement;

	if (box_new_password.value != box_repeat_password.value) {
		alert('The passwords must coincide');
		return;
	}

	const response = await fetch('/user/password_change', {
		method: 'POST',
		body: JSON.stringify({
			old: box_old_password.value,
			new: box_new_password.value
		}),
		headers: { 'Content-type': 'application/json; charset=UTF-8' }
	});
	const data = await response.json();

	if (data.r == '0') {
		alert(data.reason);
		return;
	}

	// return to login page
	window.location.href = '/';
}

window.onload = function () {
	let button_submit = document.getElementById('button_submit') as HTMLButtonElement;
	button_submit.onclick = button_submit_clicked;
};
