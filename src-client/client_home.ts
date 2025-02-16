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
import { ADMIN, user_role_to_string, UserRole } from '../src-server/models/user_role';
import {
	CREATE_GAMES,
	CREATE_USER,
	EDIT_USER,
	SEE_GAMES_USER,
	SEE_GRAPHS_USER
} from '../src-server/models/user_action';
import { make_cookie_string } from '../src-server/utils/cookies';
import { SessionID } from '../src-server/models/session_id';

export async function logout_link_clicked(_event: any) {
	// "query" the server
	await fetch('/user_log_out', { method: 'POST' });

	// whether logout was successful or not, empty the cookies
	document.cookie = make_cookie_string({
		name: SessionID.get_field_name_0(),
		value: '',
		days: 1
	});
	document.cookie = make_cookie_string({
		name: SessionID.get_field_name_1(),
		value: '',
		days: 1
	});

	window.location.href = '/';
}

function fill_action_links(user_actions: string[], user_roles: string[]) {
	let action_links = document.getElementById('special_action_links') as HTMLDivElement;

	if (user_actions.includes(CREATE_USER)) {
		let user_create_link = document.createElement('a') as HTMLAnchorElement;
		user_create_link.href = '/users_create_page';
		user_create_link.text = 'Create new user';
		action_links.appendChild(user_create_link);
	}
	if (user_actions.includes(EDIT_USER)) {
		let user_edit_link = document.createElement('a') as HTMLAnchorElement;
		user_edit_link.href = '/users_edit_page';
		user_edit_link.text = 'Edit user';
		action_links.appendChild(user_edit_link);
	}
	if (user_actions.includes(CREATE_GAMES)) {
		let game_create_link = document.createElement('a') as HTMLAnchorElement;
		game_create_link.href = '/games_create_page';
		game_create_link.text = 'Create new game';
		action_links.appendChild(game_create_link);
	}
	if (user_actions.includes(SEE_GAMES_USER)) {
		let see_all_games_link = document.createElement('a') as HTMLAnchorElement;
		see_all_games_link.href = '/games_list_all_page';
		see_all_games_link.text = 'See all games';
		action_links.appendChild(see_all_games_link);
	}
	if (user_actions.includes(SEE_GRAPHS_USER)) {
		let see_full_graph_link = document.createElement('a') as HTMLAnchorElement;
		see_full_graph_link.href = '/graphs_full_page';
		see_full_graph_link.text = 'See the full graph';
		action_links.appendChild(see_full_graph_link);
	}

	if (user_roles.includes(ADMIN)) {
		let recalculate_ratings_link = document.createElement('u') as HTMLElement;
		recalculate_ratings_link.id = 'recalculate_ratings_link';
		recalculate_ratings_link.textContent = 'Recalculate ratings';
		recalculate_ratings_link.onclick = async function () {
			const response = await fetch('/recalculate_ratings', {
				method: 'POST',
				headers: { 'Content-type': 'application/json; charset=UTF-8' }
			});

			await response.json();
		};
		action_links.appendChild(recalculate_ratings_link);

		let recalculate_graphs_link = document.createElement('u') as HTMLElement;
		recalculate_graphs_link.id = 'recalculate_graphs';
		recalculate_graphs_link.textContent = 'Recalculate graphs';
		recalculate_graphs_link.onclick = async function () {
			const response = await fetch('/recalculate_graphs', {
				method: 'POST',
				headers: { 'Content-type': 'application/json; charset=UTF-8' }
			});

			await response.json();
		};
		action_links.appendChild(recalculate_graphs_link);
	}
}

async function fill_own_info() {
	// "query" the server
	const response = await fetch('/query_users_home', {
		method: 'GET',
		headers: { 'Content-type': 'application/json; charset=UTF-8' }
	});

	const data = await response.json();
	if (data.r == '0') {
		alert(data.reason);
		return;
	}

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

async function set_home_page_title() {
	const response = await fetch('/title_home_page', {
		method: 'GET',
		headers: { 'Content-type': 'application/json; charset=UTF-8' }
	});
	const data = await response.text();

	// set the title of the page
	let title = document.getElementById('title_home_page') as HTMLElement;
	title.textContent = data as string;
}

window.onload = function () {
	// display user info
	fill_own_info();

	let logout_link = document.getElementById('logout_link') as HTMLLinkElement;
	logout_link.onclick = logout_link_clicked;

	set_home_page_title();

	set_footer_version_number();
};
