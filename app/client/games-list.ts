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

import { isNotDefined } from '@common/utils/is-defined';
import { GameId, resultFromTextToValue } from '@common/models/game';
import { messageFromResponse, serverCall } from '@client/action';
import { ROUTES } from '@common/routes';
import { TimeControlId } from '@common/models/time-control';

function newTextCell(text: string) {
	let cell = document.createElement('td');
	cell.textContent = text;
	return cell;
}

function newRatingCell(rating: string, increment: string) {
	let cell = document.createElement('td');

	let s1 = document.createElement('span');
	s1.textContent = rating + ' ';
	cell.appendChild(s1);

	if (increment[1] != '0') {
		let s2 = document.createElement('span');
		s2.textContent = increment;
		if (increment[0] == '+') {
			s2.style.color = 'green';
		} else {
			s2.style.color = 'red';
		}
		cell.appendChild(s2);
	}

	return cell;
}

async function selectResultGameOnChange(event: any) {
	const select = event.target;

	const gameId = select.getAttribute('gameId');
	const newResult = select.value;

	if (newResult == select.getAttribute('originalValue')) {
		return;
	}

	const response = await serverCall(ROUTES.GAME_EDIT_RESULT, {
		id: gameId,
		newResult: newResult
	});

	if (response.status === 'Error') {
		alert(messageFromResponse(response));
		return;
	}

	location.reload();
}

function newCellSelectResult(originalResult: string, gameId: string) {
	let select = document.createElement('select') as HTMLSelectElement;

	{
		const addResultOption = function (text: string) {
			let optionResult = document.createElement('option') as HTMLOptionElement;
			optionResult.text = text;
			optionResult.value = resultFromTextToValue(text) ?? '????';
			select.appendChild(optionResult);
		};
		addResultOption('1 - 0');
		addResultOption('1/2 - 1/2');
		addResultOption('0 - 1');
	}

	select.className = 'select-edit-game';
	select.value = resultFromTextToValue(originalResult) ?? '???';
	select.onchange = selectResultGameOnChange;
	select.setAttribute('originalValue', resultFromTextToValue(originalResult) ?? '???');
	select.setAttribute('gameId', gameId);

	let cell = document.createElement('td');
	cell.appendChild(select);
	return cell;
}

async function buttonDeleteGameOnClick(event: any) {
	const button = event.target;

	let selectTimeControl = document.getElementById('select-time-control') as HTMLSelectElement;
	let previousTimeControlId = selectTimeControl.options[selectTimeControl.selectedIndex].value as TimeControlId;

	const gameId = button.getAttribute('gameId');
	const response = await serverCall(ROUTES.GAME_DELETE, { id: gameId });

	if (response.status === 'Error') {
		alert(messageFromResponse(response));
		return;
	}

	fillGamesListTimeControl(previousTimeControlId);
}

function newCellButtonDeleteGame(gameId: string) {
	let button = document.createElement('button') as HTMLButtonElement;
	button.textContent = 'Delete';
	button.className = 'button-delete-game';
	button.setAttribute('gameId', gameId);
	button.onclick = buttonDeleteGameOnClick;

	let cell = document.createElement('td');
	cell.appendChild(button);
	return cell;
}

async function triggerEditGameTitle(event: Event) {
	let input = event.target as HTMLInputElement;
	const gameId = input.getAttribute('gameId') as GameId;
	const originalTitle = input.getAttribute('originalTitle');
	const newTitle = input.value;

	if (isNotDefined(gameId)) {
		console.log('Game id could not be retrieved');
		return;
	}
	if (originalTitle == newTitle) {
		return;
	}

	const response = await serverCall(ROUTES.GAME_EDIT_TITLE, {
		id: gameId,
		title: newTitle
	});
	if (response.status === 'Error') {
		alert(messageFromResponse(response));
		return;
	}

	input.setAttribute('originalTitle', newTitle);
}

async function editGameTitle(event: Event) {
	switch (event.type) {
		case 'keydown':
			const key = (event as KeyboardEvent).key;
			if (key === 'Enter') {
				triggerEditGameTitle(event);
			}
			break;

		case 'blur':
			triggerEditGameTitle(event);
			break;
	}
}

function newCellTextInput(gameId: string, title: string) {
	let input = document.createElement('input') as HTMLInputElement;
	input.value = `${title}`;
	input.className = 'input-text';
	input.setAttribute('gameId', gameId);
	input.setAttribute('originalTitle', title);
	input.onkeydown = editGameTitle;
	input.onblur = editGameTitle;

	let cell = document.createElement('td');
	cell.appendChild(input);
	return cell;
}

async function fillGamesListTimeControl(timeControlId: TimeControlId) {
	let table = document.getElementById('table-games') as HTMLTableElement;
	const val = table.getAttribute('value');

	let response;
	if (val == 'all') {
		response = await serverCall(ROUTES.QUERY_GAME_LIST_ALL, {
			timeControlId: timeControlId
		});
	} else if (val == 'own') {
		response = await serverCall(ROUTES.QUERY_GAME_LIST_OWN, {
			timeControlId: timeControlId
		});
	} else {
		alert(`Wrong value for list '${val}'.`);
		return;
	}

	if (response.status === 'Error') {
		alert(messageFromResponse(response));
		return;
	}

	const games = response.value;

	let newTbody = document.createElement('tbody');
	for (const g of games) {
		let row = document.createElement('tr');

		if (g.editable) {
			if (g.title == '') {
				row.appendChild(newTextCell(''));
			} else {
				row.appendChild(newCellTextInput(g.id, g.title));
			}
		} else {
			row.appendChild(newTextCell(g.title));
		}

		row.appendChild(newTextCell(g.timeControlName));

		const when = g.date.substring(0, g.date.length - (3 + 1 + 2 + 1)).replace('..', ' ');
		row.appendChild(newTextCell(when));

		const whiteRatingStr = `${g.whiteRating}`;
		const whiteIncrementStr = g.whiteIncrement < 0 ? `${g.whiteIncrement}` : `+${g.whiteIncrement}`;
		row.appendChild(newRatingCell(whiteRatingStr, whiteIncrementStr));
		row.appendChild(newTextCell(g.white));

		if (g.editable) {
			row.appendChild(newCellSelectResult(g.result, g.id));
		} else {
			row.appendChild(newTextCell(g.result));
		}

		const blackRatingStr = `${g.blackRating}`;
		const blackIncrementStr = g.blackIncrement < 0 ? `${g.blackIncrement}` : `+${g.blackIncrement}`;
		row.appendChild(newTextCell(g.black));
		row.appendChild(newRatingCell(blackRatingStr, blackIncrementStr));

		if (g.deleteable) {
			row.appendChild(newCellButtonDeleteGame(g.id));
		}

		newTbody.appendChild(row);
	}

	let oldTbody = table.getElementsByTagName('tbody')[0] as HTMLElement;
	oldTbody.parentNode?.replaceChild(newTbody, oldTbody);
}

async function fillGamesList(_event: any) {
	const selectTimeControl = document.getElementById('select-time-control') as HTMLSelectElement;
	const timeControlId = selectTimeControl.options[selectTimeControl.selectedIndex].value as TimeControlId;
	fillGamesListTimeControl(timeControlId);
}

window.onload = async function () {
	fillGamesListTimeControl('' as TimeControlId);

	let timeControl = document.getElementById('select-time-control') as HTMLSelectElement;
	timeControl.onchange = fillGamesList;
};
