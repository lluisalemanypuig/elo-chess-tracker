/*
Elo rating for a Chess Club
Copyright (C) 2023 - 2025  Lluís Alemany Puig

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

import { ADMIN, user_role_to_string, UserRole } from '../src-server/models/user_role';
import { GAMES_CREATE, CREATE_USER, USER_EDIT, GAMES_SEE, GRAPHS_SEE_USER } from '../src-server/models/user_action';

export async function logout_link_clicked(_event: any) {
	// "query" the server
	const response = await fetch('/user/logout', { method: 'POST' });

	const data = await response.json();
	const cookies = data['cookies'];
	for (let i = 0; i < cookies.length; ++i) {
		document.cookie = cookies[i];
	}

	window.location.href = '/';
}

function fill_action_links(user_actions: string[], user_roles: string[]) {
	let action_links = document.getElementById('special_action_links') as HTMLDivElement;

	if (user_actions.includes(CREATE_USER)) {
		let user_create_link = document.createElement('a') as HTMLAnchorElement;
		user_create_link.href = '/page/user/create';
		user_create_link.text = 'Create new user';
		action_links.appendChild(user_create_link);
	}
	if (user_actions.includes(USER_EDIT)) {
		let user_edit_link = document.createElement('a') as HTMLAnchorElement;
		user_edit_link.href = '/page/user/edit';
		user_edit_link.text = 'Edit user';
		action_links.appendChild(user_edit_link);
	}
	if (user_actions.includes(GAMES_CREATE)) {
		let game_create_link = document.createElement('a') as HTMLAnchorElement;
		game_create_link.href = '/page/game/create';
		game_create_link.text = 'Create new game';
		action_links.appendChild(game_create_link);
	}
	if (user_actions.includes(GAMES_SEE)) {
		let see_all_games_link = document.createElement('a') as HTMLAnchorElement;
		see_all_games_link.href = '/page/game/list/all';
		see_all_games_link.text = 'See all games';
		action_links.appendChild(see_all_games_link);
	}
	if (user_actions.includes(GRAPHS_SEE_USER)) {
		let see_full_graph_link = document.createElement('a') as HTMLAnchorElement;
		see_full_graph_link.href = '/page/graph/full';
		see_full_graph_link.text = 'See the full graph';
		action_links.appendChild(see_full_graph_link);
	}

	if (user_roles.includes(ADMIN)) {
		let recalculate_ratings_link = document.createElement('u') as HTMLElement;
		recalculate_ratings_link.id = 'recalculate_ratings_link';
		recalculate_ratings_link.textContent = 'Recalculate ratings';
		recalculate_ratings_link.onclick = async function () {
			const response = await fetch('/recalculate/ratings', {
				method: 'POST',
				headers: { 'Content-type': 'application/json; charset=UTF-8' }
			});
			if (response.status >= 400) {
				const message = await response.text();
				alert(`${response.status} -- ${response.statusText}\nMessage: '${message}'`);
				return;
			}
		};
		action_links.appendChild(recalculate_ratings_link);

		let recalculate_graphs_link = document.createElement('u') as HTMLElement;
		recalculate_graphs_link.id = 'recalculate_graphs';
		recalculate_graphs_link.textContent = 'Recalculate graphs';
		recalculate_graphs_link.onclick = async function () {
			const response = await fetch('/recalculate/graphs', {
				method: 'POST',
				headers: { 'Content-type': 'application/json; charset=UTF-8' }
			});
			if (response.status >= 400) {
				const message = await response.text();
				alert(`${response.status} -- ${response.statusText}\nMessage: '${message}'`);
				return;
			}
		};
		action_links.appendChild(recalculate_graphs_link);
	}
}

async function fill_own_info() {
	// "query" the server
	const response = await fetch('/query/user/home', {
		method: 'GET',
		headers: { 'Content-type': 'application/json; charset=UTF-8' }
	});
	if (response.status >= 400) {
		const message = await response.text();
		alert(`${response.status} -- ${response.statusText}\nMessage: '${message}'`);
		return;
	}

	const data = await response.json();

	// add hrefs according to the user's permissions.
	fill_action_links(data.actions, data.roles);

	{
		let label_name_and_roles = document.getElementById('user_name_and_roles') as HTMLDivElement;
		label_name_and_roles.textContent = data.fullname;

		// roles of user from the cookies
		let user_roles = data.roles as string[];
		// add roles of user next to the name
		label_name_and_roles.textContent += ' - ';
		label_name_and_roles.textContent += user_role_to_string[user_roles[0] as UserRole];
		for (let i = 1; i < user_roles.length; ++i) {
			label_name_and_roles.textContent += ', ' + user_role_to_string[user_roles[i] as UserRole];
		}
	}

	{
		let table = document.getElementById('user_ratings_table') as HTMLTableElement;

		const ratings = data.ratings as any[];
		for (let i = 0; i < ratings.length; ++i) {
			const data_i = ratings[i];

			let row = table.insertRow(-1);

			row.insertCell(-1).appendChild(document.createTextNode(data_i.id));
			row.insertCell(-1).appendChild(document.createTextNode(data_i.v.rating));
			row.insertCell(-1).appendChild(document.createTextNode(data_i.v.num_games));
			row.insertCell(-1).appendChild(document.createTextNode(data_i.v.won));
			row.insertCell(-1).appendChild(document.createTextNode(data_i.v.drawn));
			row.insertCell(-1).appendChild(document.createTextNode(data_i.v.lost));
		}
	}
}

window.onload = function () {
	// display user info
	fill_own_info();

	let logout_link = document.getElementById('logout_link') as HTMLLinkElement;
	logout_link.onclick = logout_link_clicked;
};
