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

import { resultFromTextToValue } from '@common/models/game';
import { isNotDefined } from '@common/utils/is-defined';
import { messageFromResponse, serverCall } from '@client/action';
import { ROUTES } from '@common/routes';
import { PlayerPublicId } from '@common/models/player';
import { TimeControlId, TimeControlName } from '@common/models/time-control';
import { toDateMajor, toDateMinor } from '@common/utils/time';

async function initializeWindowClientGamesCreate() {
	let datalistWhiteUsers = document.getElementById('datalist-white-users') as HTMLDataListElement;
	let datalistBlackUsers = document.getElementById('datalist-black-users') as HTMLDataListElement;

	// query the server for the list of users
	const response = await serverCall(ROUTES.QUERY_HTML_USER_LIST, null);
	if (response.status === 'Error') {
		alert(messageFromResponse(response));
		return;
	}

	datalistWhiteUsers.innerHTML = response.value;
	datalistBlackUsers.innerHTML = response.value;
}

async function submitNewGame(_event: any) {
	let gameTitleInput = document.getElementById('input-game-title') as HTMLInputElement;
	let whiteInput = document.getElementById('list-white-users') as HTMLInputElement;
	let blackInput = document.getElementById('list-black-users') as HTMLInputElement;
	let selectResultGame = document.getElementById('select-result-game') as HTMLSelectElement;
	const selectTimeControl = document.getElementById('select-time-control') as HTMLSelectElement;
	const inputGameDate = document.getElementById('input-game-date') as HTMLInputElement;
	const inputGameTime = document.getElementById('input-game-time') as HTMLInputElement;

	const whiteOption = document.querySelector('option[value="' + whiteInput.value + '"]');
	const blackOption = document.querySelector('option[value="' + blackInput.value + '"]');
	const resultStr = selectResultGame.options[selectResultGame.selectedIndex].value;
	const timeControlId = selectTimeControl.options[selectTimeControl.selectedIndex].value as TimeControlId;
	const timeControlName = selectTimeControl.options[selectTimeControl.selectedIndex].text as TimeControlName;

	const result = resultFromTextToValue(resultStr);
	if (isNotDefined(result)) {
		console.log(`Wrong result for the game '${resultStr}'.`);
		return;
	}

	if (inputGameDate.value == '') {
		alert('Invalid date');
		return;
	}
	if (inputGameTime.value == '') {
		alert('Invalid time');
		return;
	}

	const gameTitle = gameTitleInput.value;
	if (isNotDefined(whiteOption)) {
		console.log('Could not find white option');
		return;
	}
	if (isNotDefined(blackOption)) {
		console.log('Could not find black option');
		return;
	}
	const white = Number(whiteOption.id) as PlayerPublicId;
	const black = Number(blackOption.id) as PlayerPublicId;
	const whenCreated = toDateMajor(inputGameDate.value);

	const randSec = `${Math.floor(Math.random() * 59)}`;
	const randMilli = `${Math.floor(Math.random() * 999)}`;
	const timeCreated = toDateMinor(
		inputGameTime.value +
			':' +
			(randSec.length == 1 ? '0' : '') +
			randSec +
			':' +
			(randMilli.length == 1 ? '00' : randMilli.length == 2 ? '0' : '') +
			randMilli
	);

	const response = await serverCall(ROUTES.GAME_CREATE, {
		title: gameTitle,
		white: white,
		black: black,
		result: result,
		timeControlId: timeControlId,
		timeControlName: timeControlName,
		whenCreated: whenCreated,
		timeCreated: timeCreated
	});
	if (response.status === 'Error') {
		alert(messageFromResponse(response));
		return;
	}

	whiteInput.value = '';
	blackInput.value = '';
	selectResultGame.value = '';
}

window.onload = async function () {
	initializeWindowClientGamesCreate();

	let submit = document.getElementById('submit-new-game-button') as HTMLButtonElement;
	submit.onclick = submitNewGame;
};
