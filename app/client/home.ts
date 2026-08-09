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
import { ADMIN, USER_ROLE_TO_STRING, UserRole } from '@common/models/user-role';
import { GAMES_CREATE, CREATE_USER, USER_EDIT, GAMES_SEE, GRAPHS_SEE_USER } from '@common/models/user-action';
import { ROUTES } from '@common/routes';

export async function logoutLinkClicked(_event: any) {
	// "query" the server
	const response = await serverCall(ROUTES.USER_LOGOUT, null);
	if (response.status === 'Error') {
		alert(messageFromResponse(response));
		return;
	}

	const data = response.value;
	for (const c of data.cookies) {
		document.cookie = c;
	}

	window.location.href = ROUTES.ROOT;
}

function fillActionLinks(userActions: string[], userRoles: string[]) {
	let actionLinks = document.getElementById('special-action-links') as HTMLDivElement;

	if (userActions.includes(CREATE_USER)) {
		let userCreateLink = document.createElement('a') as HTMLAnchorElement;
		userCreateLink.href = ROUTES.PAGE_USER_CREATE;
		userCreateLink.text = 'Create new user';
		actionLinks.appendChild(userCreateLink);
	}
	if (userActions.includes(USER_EDIT)) {
		let userEditLink = document.createElement('a') as HTMLAnchorElement;
		userEditLink.href = ROUTES.PAGE_USER_EDIT;
		userEditLink.text = 'Edit user';
		actionLinks.appendChild(userEditLink);
	}
	if (userActions.includes(GAMES_CREATE)) {
		let gameCreateLink = document.createElement('a') as HTMLAnchorElement;
		gameCreateLink.href = ROUTES.PAGE_GAME_CREATE;
		gameCreateLink.text = 'Create new game';
		actionLinks.appendChild(gameCreateLink);
	}
	if (userActions.includes(GAMES_SEE)) {
		let seeAllGamesLink = document.createElement('a') as HTMLAnchorElement;
		seeAllGamesLink.href = ROUTES.PAGE_GAME_LIST_ALL;
		seeAllGamesLink.text = 'See all games';
		actionLinks.appendChild(seeAllGamesLink);
	}
	if (userActions.includes(GRAPHS_SEE_USER)) {
		let seeFullGraphLink = document.createElement('a') as HTMLAnchorElement;
		seeFullGraphLink.href = ROUTES.PAGE_GRAPH_FULL;
		seeFullGraphLink.text = 'See the full graph';
		actionLinks.appendChild(seeFullGraphLink);
	}

	if (userRoles.includes(ADMIN)) {
		let recalculateRatingsLink = document.createElement('u') as HTMLElement;
		recalculateRatingsLink.id = 'recalculate-ratings-link';
		recalculateRatingsLink.textContent = 'Recalculate ratings';
		recalculateRatingsLink.onclick = async function () {
			const response = await serverCall(ROUTES.RECALCULATE_RATINGS, null);
			if (response.status === 'Error') {
				alert(messageFromResponse(response));
				return;
			}
		};
		actionLinks.appendChild(recalculateRatingsLink);

		let recalculateGraphsLink = document.createElement('u') as HTMLElement;
		recalculateGraphsLink.id = 'recalculate-graphs';
		recalculateGraphsLink.textContent = 'Recalculate graphs';
		recalculateGraphsLink.onclick = async function () {
			const response = await serverCall(ROUTES.RECALCULATE_GRAPHS, null);
			if (response.status === 'Error') {
				alert(messageFromResponse(response));
				return;
			}
		};
		actionLinks.appendChild(recalculateGraphsLink);
	}
}

async function fillOwnInfo() {
	// "query" the server
	const response = await serverCall(ROUTES.QUERY_USER_HOME, null);
	if (response.status === 'Error') {
		alert(messageFromResponse(response));
		return;
	}

	const data = response.value;

	// add hrefs according to the user's permissions.
	fillActionLinks(data.actions, data.roles);

	{
		let labelNameAndRoles = document.getElementById('user-name-and-roles') as HTMLDivElement;
		labelNameAndRoles.textContent = data.fullname;

		// roles of user from the cookies
		let userRoles = data.roles as string[];
		// add roles of user next to the name
		labelNameAndRoles.textContent += ' - ';
		labelNameAndRoles.textContent += USER_ROLE_TO_STRING[userRoles[0] as UserRole];
		for (let i = 1; i < userRoles.length; ++i) {
			labelNameAndRoles.textContent += ', ' + USER_ROLE_TO_STRING[userRoles[i] as UserRole];
		}
	}

	{
		let table = document.getElementById('user-ratings-table') as HTMLTableElement;

		const ratings = data.ratings as any[];
		for (const r of ratings) {
			const dataI = r;

			let row = table.insertRow(-1);

			row.insertCell(-1).appendChild(document.createTextNode(dataI.timeControlName));
			row.insertCell(-1).appendChild(document.createTextNode(dataI.rating.rating));
			row.insertCell(-1).appendChild(document.createTextNode(dataI.rating.numGames));
			row.insertCell(-1).appendChild(document.createTextNode(dataI.rating.won));
			row.insertCell(-1).appendChild(document.createTextNode(dataI.rating.drawn));
			row.insertCell(-1).appendChild(document.createTextNode(dataI.rating.lost));
		}
	}
}

window.onload = function () {
	// display user info
	fillOwnInfo();

	let logoutLink = document.getElementById('logout-link') as HTMLLinkElement;
	logoutLink.onclick = logoutLinkClicked;
};
