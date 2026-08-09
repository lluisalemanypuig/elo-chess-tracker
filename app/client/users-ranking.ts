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
import { TimeControlId } from '@common/models/time-control';

async function fillRanking(_event: any) {
	const selectTimeControl = document.getElementById('select-time-control') as HTMLSelectElement;
	const timeControlId = selectTimeControl.options[selectTimeControl.selectedIndex].value as TimeControlId;

	if (timeControlId === '') {
		return;
	}

	let newCell = function (text: string) {
		let cell = document.createElement('td');
		cell.innerHTML = text;
		return cell;
	};

	// "query" the server
	const response = await serverCall(ROUTES.QUERY_USER_RANKING, { timeControlId: timeControlId });
	if (response.status === 'Error') {
		alert(messageFromResponse(response));
		return;
	}

	const listOfUsers = response.value;

	{
		let table = document.getElementById('users-table-with-games') as HTMLTableElement;
		let oldTbody = table.getElementsByTagName('tbody')[0];
		let newTbody = document.createElement('tbody');

		const users = listOfUsers.withGames;
		for (var i = 0; i < users.length; i++) {
			let row = document.createElement('tr');
			row.appendChild(newCell(users[i].name));
			row.appendChild(newCell(`${users[i].rating}`));
			row.appendChild(newCell(`${users[i].totalGames}`));
			row.appendChild(newCell(`${users[i].won}`));
			row.appendChild(newCell(`${users[i].drawn}`));
			row.appendChild(newCell(`${users[i].lost}`));
			newTbody.appendChild(row);
		}

		if (oldTbody.parentNode !== undefined) {
			oldTbody.parentNode.replaceChild(newTbody, oldTbody);
		}
	}

	{
		let table = document.getElementById('users-table-without-games') as HTMLTableElement;
		let oldTbody = table.getElementsByTagName('tbody')[0];
		let newTbody = document.createElement('tbody');

		const users = listOfUsers.withoutGames;
		for (var i = 0; i < users.length; i++) {
			let row = document.createElement('tr');
			row.appendChild(newCell(users[i].name));
			row.appendChild(newCell(`${users[i].rating}`));
			row.appendChild(newCell('-'));
			row.appendChild(newCell('-'));
			row.appendChild(newCell('-'));
			row.appendChild(newCell('-'));
			newTbody.appendChild(row);
		}

		if (oldTbody.parentNode !== undefined) {
			oldTbody.parentNode.replaceChild(newTbody, oldTbody);
		}
	}
}

window.onload = async function () {
	let selectTimeControl = document.getElementById('select-time-control') as HTMLSelectElement;
	selectTimeControl.onchange = fillRanking;
};
