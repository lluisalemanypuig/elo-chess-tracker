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

import {
	QueryChallengesPendingResultOutputSingle,
	QueryChallengesPendingResultSetRefereeOutputSingle,
} from '@app/common/api/schemas/query-challenges';
import { ChallengeId } from '@app/common/models/challenge-id';
import { PlayerPublicId } from '@app/common/models/player-id';
import { UserGivenName } from '@app/common/models/user-given-name';
import 'htmx.org';

export function formatDate(date: string) {
	return date.replace('..', ', ').replace('-', '/').replace('-', '/');
}

function createLabelText(text: string): HTMLLabelElement {
	let label = document.createElement('label') as HTMLLabelElement;
	label.textContent = text;
	label.className = 'label';
	return label;
}

interface ButtonProps {
	player: string;
	label: string;
	id: ChallengeId;
	player1: {
		name: UserGivenName;
		publicId: PlayerPublicId;
	};
	player2: {
		name: UserGivenName;
		publicId: PlayerPublicId;
	};
}

export function makePlayerLabelDiv({
	player,
	label,
	id,
	player1,
	player2,
}: ButtonProps) {
	const divWhite = document.createElement('div') as HTMLDivElement;
	divWhite.className = 'label-select';

	divWhite.appendChild(createLabelText(`${player}:`));

	let select = document.createElement('select');
	select.id = `${label}-select-${id}`;
	select.className = 'select-basic';

	let option1 = document.createElement('option') as HTMLOptionElement;
	option1.text = player1.name;
	option1.value = `${player1.publicId}`;
	select.appendChild(option1);
	let option2 = document.createElement('option') as HTMLOptionElement;
	option2.text = player2.name;
	option2.value = `${player2.publicId}`;
	select.appendChild(option2);

	divWhite.appendChild(select);
	return divWhite;
}

export function resultDropdown(id: string) {
	const div = document.createElement('div') as HTMLDivElement;
	div.className = 'label-select';

	div.appendChild(createLabelText('Result:'));

	const select = document.createElement('select');
	select.id = `select-result-game-${id}`;
	select.className = 'select-basic';

	const option1 = document.createElement('option') as HTMLOptionElement;
	option1.text = '1 - 0';
	option1.value = 'white_wins';
	select.appendChild(option1);
	const option2 = document.createElement('option') as HTMLOptionElement;
	option2.text = '1/2 - 1/2';
	option2.value = 'draw';
	select.appendChild(option2);
	const option3 = document.createElement('option') as HTMLOptionElement;
	option3.text = '0 - 1';
	option3.value = 'black_wins';
	select.appendChild(option3);

	div.appendChild(select);
	return div;
}

export function submitButton(
	id: string,
	index: number,
	total: number,
	buttonSubmitFunc: (event: any) => void,
) {
	const div = document.createElement('div') as HTMLDivElement;
	div.setAttribute('align', 'center');
	div.style.marginTop = '5px';
	div.style.marginBottom = '5px';

	const submitResultButton = document.createElement('button');
	submitResultButton.textContent = 'Submit result';
	submitResultButton.className = 'button-submit-challenge';
	submitResultButton.id = id;
	submitResultButton.onclick = buttonSubmitFunc;
	submitResultButton.style.marginTop = '5px';
	if (index < total - 1) {
		submitResultButton.style.marginBottom = '20px';
	}
	div.appendChild(submitResultButton);

	return div;
}

type CustomChallenge =
	| QueryChallengesPendingResultOutputSingle
	| QueryChallengesPendingResultSetRefereeOutputSingle;

export function createChallengeResultSetDiv<T extends CustomChallenge>(
	c: T,
	index: number,
	total: number,
	makeHeader: (v: T) => HTMLUListElement,
	buttonSubmitFunc: (event: any) => void,
) {
	const fullDiv = document.createElement('div') as HTMLDivElement;

	// header
	fullDiv.appendChild(makeHeader(c));

	// selects and button
	{
		const dataDiv = document.createElement('div') as HTMLDivElement;
		dataDiv.appendChild(
			makePlayerLabelDiv({
				player: 'White',
				label: 'white',
				id: c.id,
				player1: c.sentTo,
				player2: c.sentBy,
			}),
		);
		dataDiv.appendChild(
			makePlayerLabelDiv({
				player: 'Black',
				label: 'black',
				id: c.id,
				player1: c.sentBy,
				player2: c.sentTo,
			}),
		);
		dataDiv.appendChild(resultDropdown(c.id));
		fullDiv.appendChild(dataDiv);
	}
	fullDiv.appendChild(submitButton(c.id, index, total, buttonSubmitFunc));

	return fullDiv;
}
