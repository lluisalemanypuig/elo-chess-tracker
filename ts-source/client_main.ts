/*
Elo rating for a Chess Club
Copyright (C) 2023  Lluís Alemany Puig

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

import { logout_link_clicked } from "./client_logout";
import { CREATE_NEW_USER, EDIT_EXISTING_USER, user_role_to_action } from "./models/user_role";
import { get_cookie } from "./utils/cookies";

function fill_action_links() {
	let action_links = document.getElementById("special_action_links") as HTMLDivElement;

	// roles of user from the cookies
	let user_roles = get_cookie("roles").split(',');

	let add_create_new_user = false;
	let edit_existing_user = false;

	for (let i = 0; i < user_roles.length; ++i) {
		let r = user_roles[i];
		let allowed_actions = user_role_to_action[r];
		
		if (allowed_actions.includes(CREATE_NEW_USER)) {
			add_create_new_user = true;
		}
		if (allowed_actions.includes(EDIT_EXISTING_USER)) {
			edit_existing_user = true;
		}
	}

	if (add_create_new_user) {
		let user_create_link = document.createElement("a") as HTMLAnchorElement;
		user_create_link.href = "/user_create";
		user_create_link.text = "Create new user";
		action_links.appendChild(user_create_link);
		action_links.appendChild(document.createElement("br"));
		action_links.appendChild(document.createElement("br"));
	}
	if (edit_existing_user) {
		let user_edit_link = document.createElement("a") as HTMLAnchorElement;
		user_edit_link.href = "/user_edit";
		user_edit_link.text = "Edit user";
		action_links.appendChild(user_edit_link);
		action_links.appendChild(document.createElement("br"));
		action_links.appendChild(document.createElement("br"));
	}
}

async function fill_own_info() {
	// "query" the server
	const response = await fetch(
		"/user_query",
		{
			method: 'GET',
			headers: { 'Content-type': 'application/json; charset=UTF-8' }
		}
	);

	const data = await response.json();
	if (data.r == "0") {
		alert(data.reason);
		return;
	}

	let div = document.getElementById("user_info") as HTMLDivElement;
	{
	let label_fullname = document.createElement("label");
	label_fullname.textContent = data.fullname;
	div.appendChild(label_fullname);
	div.appendChild(document.createElement("br"));
	}
	let data_classical = JSON.parse(data.classical);
	div.appendChild(document.createTextNode("Classical:"));
	div.appendChild(document.createElement("br"));
	{
	div.appendChild(document.createTextNode("Rating: " + data_classical.rating));
	div.appendChild(document.createElement("br"));
	}
	{
	div.appendChild(document.createTextNode("Games: " + data_classical.num_games));
	div.appendChild(document.createElement("br"));
	}
	{
	div.appendChild(document.createTextNode("K: " + data_classical.K));
	div.appendChild(document.createElement("br"));
	}

	div.appendChild(document.createElement("br"));
}

window.onload = function () {
	// add hrefs according to the user's permissions.
	fill_action_links();

	// display user info
	fill_own_info();

	let logout_link = document.getElementById("logout_link") as HTMLLinkElement;
	logout_link.onclick = logout_link_clicked;
}
