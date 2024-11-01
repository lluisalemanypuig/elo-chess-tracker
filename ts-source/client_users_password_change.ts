/*
Elo rating for a Chess Club
Copyright (C) 2023 - 2024  Lluís Alemany Puig

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

async function submit_button_clicked() {
	let old_password_box = document.getElementById("old_password_box") as HTMLInputElement;
	let new_password_box = document.getElementById("new_password_box") as HTMLInputElement;
	let repeat_password_box = document.getElementById("repeat_password_box") as HTMLInputElement;

	if (new_password_box.value != repeat_password_box.value) {
		alert("The passwords must coincide");
		return;
	}

	const response = await fetch(
		"/users_password_change",
		{
			method: 'POST',
			body : JSON.stringify({'old' : old_password_box.value, 'new' : new_password_box.value}),
			headers: { 'Content-type': 'application/json; charset=UTF-8' }
		}
	);
	const data = await response.json();

	if (data.r == '0') {
		alert(data.reason);
		return;
	}

	// return to login page
	window.location.href = "/";
}

window.onload = function () {
	let submit_button = document.getElementById("submit_button") as HTMLButtonElement;
	submit_button.onclick = submit_button_clicked;
}
