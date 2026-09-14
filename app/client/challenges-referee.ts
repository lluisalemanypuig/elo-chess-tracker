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

import { messageFromResponse, serverCall } from '@client/action';
import {
	createChallengeResultSetDiv,
	formatDate,
} from '@client/challenges-utils';
import { ROUTES } from '@common/api/routes';
import {
	QueryChallengesPendingAcceptRefereeOutputSingle,
	QueryChallengesPendingResultAgreeRefereeOutputSingle,
	QueryChallengesPendingResultSetRefereeOutputSingle,
} from '@common/api/schemas/query-challenges';
import { GameResult } from '@common/models/game-result';
import { PlayerPrivateId, toPlayerPublicId } from '@common/models/player-id';
import 'htmx.org';

async function acceptChallengeButtonClicked(event: any) {
	const tagClicked = event.target;
	const challengeId = tagClicked.id;

	const response = await serverCall({
		route: ROUTES.CHALLENGE_ACCEPT,
		body: {
			id: challengeId,
		},
	});
	if (response.status === 'error') {
		alert(messageFromResponse(response));
		return;
	}
	window.location.href = ROUTES.PAGE_CHALLENGES_REFEREE;
}

async function submitResultChallengeButtonClicked(event: any) {
	const buttonClicked = event.target;
	const challengeId = buttonClicked.id;

	const whiteSelect = document.getElementById(
		`white-select-${challengeId}`,
	) as HTMLSelectElement;
	const blackSelect = document.getElementById(
		`black-select-${challengeId}`,
	) as HTMLSelectElement;
	const resultSelect = document.getElementById(
		`select-result-game-${challengeId}`,
	) as HTMLSelectElement;

	const whitePublicId = whiteSelect.options[whiteSelect.selectedIndex]
		.value as PlayerPrivateId;
	const blackPublicId = blackSelect.options[blackSelect.selectedIndex]
		.value as PlayerPrivateId;
	const resultValue = resultSelect.options[resultSelect.selectedIndex].value;
	let result: GameResult;
	if (
		resultValue === 'white_wins' ||
		resultValue === 'black_wins' ||
		resultValue === 'draw'
	) {
		result = resultValue;
	} else {
		console.log(`Wrong result for the game '${resultValue}'.`);
		return;
	}

	const response = await serverCall({
		route: ROUTES.CHALLENGE_SET_RESULT,
		body: {
			id: challengeId,
			white: toPlayerPublicId(whitePublicId),
			black: toPlayerPublicId(blackPublicId),
			result: result,
		},
	});
	if (response.status === 'error') {
		alert(messageFromResponse(response));
		return;
	}
	window.location.href = ROUTES.PAGE_CHALLENGES_REFEREE;
}

async function agreeChallengeResultButtonClicked(event: any) {
	const tagClicked = event.target;
	const challengeId = tagClicked.id;
	const response = await serverCall({
		route: ROUTES.CHALLENGE_AGREE,
		body: {
			id: challengeId,
		},
	});
	if (response.status === 'error') {
		alert(messageFromResponse(response));
		return;
	}
	window.location.href = ROUTES.PAGE_CHALLENGES_REFEREE;
}

async function disagreeChallengeResultButtonClicked(event: any) {
	const tagClicked = event.target;
	const challengeId = tagClicked.id;
	const response = await serverCall({
		route: ROUTES.CHALLENGE_DISAGREE,
		body: {
			id: challengeId,
		},
	});
	if (response.status === 'error') {
		alert(messageFromResponse(response));
		return;
	}
	window.location.href = ROUTES.PAGE_CHALLENGES_REFEREE;
}

//

async function fillChallengesPendingAccept() {
	const response = await serverCall({
		route: ROUTES.QUERY_CHALLENGE_PENDING_ACCEPT_REFEREE,
	});
	if (response.status === 'error') {
		alert(messageFromResponse(response));
		return;
	}
	const data = response.value;

	const challengeList = document.createElement('ul') as HTMLUListElement;
	challengeList.className = 'challenge-items';

	data.forEach(function (
		elem: QueryChallengesPendingAcceptRefereeOutputSingle,
		_index: number,
	) {
		const challengeDiv = document.createElement('div') as HTMLDivElement;
		{
			// ---
			let li = document.createElement('li') as HTMLLIElement;
			li.className = 'challenge-items-bullet';
			li.textContent = `Challenge sent by ${elem.sentBy}.`;
			challengeDiv.appendChild(li);
			// ---
			li = document.createElement('li') as HTMLLIElement;
			li.className = 'challenge-items-nobullet';
			//
			li = document.createElement('li') as HTMLLIElement;
			li.className = 'challenge-items-nobullet';
			li.textContent = `Of time control: ${elem.timeControlName}.`;
			challengeDiv.appendChild(li);
			//
			if (elem.title !== '') {
				li = document.createElement('li') as HTMLLIElement;
				li.className = 'challenge-items-nobullet';
				li.textContent = `Of title: ${elem.title}.`;
				challengeDiv.appendChild(li);
			}
			//
			li = document.createElement('li') as HTMLLIElement;
			li.className = 'challenge-items-nobullet';
			li.textContent = `Sent on ${formatDate(elem.sentWhen)}.`;
			challengeDiv.appendChild(li);
		}
		challengeList.appendChild(challengeDiv);

		const buttonsDiv = document.createElement('div') as HTMLDivElement;
		buttonsDiv.setAttribute('align', 'center');
		buttonsDiv.style.marginTop = '5px';
		buttonsDiv.style.marginBottom = '5px';

		const acceptButton = document.createElement('button') as HTMLButtonElement;
		acceptButton.id = elem.id;
		acceptButton.onclick = acceptChallengeButtonClicked;
		acceptButton.className = 'button-accept-decline-challenge';
		acceptButton.textContent = 'Accept';
		buttonsDiv.appendChild(acceptButton);

		challengeList.appendChild(buttonsDiv);
	});

	if (data.length > 0) {
		const challenges = document.getElementById(
			'challenges-pending-accept',
		) as HTMLDivElement;
		challenges.appendChild(challengeList);
	}
}

function makeHeaderChallengeSetResult(
	c: QueryChallengesPendingResultSetRefereeOutputSingle,
) {
	const header = document.createElement('ul') as HTMLUListElement;
	header.className = 'challenge-items';
	{
		let li = document.createElement('li') as HTMLLIElement;
		li.className = 'challenge-items-bullet';
		li.textContent = `Challenge sent by ${c.sentBy.name}.`;
		header.appendChild(li);
		//
		li = document.createElement('li') as HTMLLIElement;
		li.className = 'challenge-items-nobullet';
		li.textContent = `Challenge sent to ${c.sentTo.name}.`;
		header.appendChild(li);
		//
		li = document.createElement('li') as HTMLLIElement;
		li.className = 'challenge-items-nobullet';
		li.textContent = `Of time control: ${c.timeControlName}.`;
		header.appendChild(li);
		//
		if (c.title !== '') {
			li = document.createElement('li') as HTMLLIElement;
			li.className = 'challenge-items-nobullet';
			li.textContent = `Of title: ${c.title}.`;
			header.appendChild(li);
		}
		li = document.createElement('li') as HTMLLIElement;
		li.className = 'challenge-items-nobullet';
		li.textContent = `Sent on ${formatDate(c.sentWhen)}.`;
		header.appendChild(li);
	}
	return header;
}

async function fillChallengesPendingResultSet() {
	const response = await serverCall({
		route: ROUTES.QUERY_CHALLENGE_PENDING_RESULT_SET_REFEREE,
	});
	if (response.status === 'error') {
		alert(messageFromResponse(response));
		return;
	}
	const data = response.value;

	const challengeList = document.createElement('div') as HTMLDivElement;
	challengeList.className = 'challenge-items';

	data.forEach(function (
		elem: QueryChallengesPendingResultSetRefereeOutputSingle,
		index: number,
	) {
		const itemDiv = createChallengeResultSetDiv(
			elem,
			index,
			data.length,
			makeHeaderChallengeSetResult,
			submitResultChallengeButtonClicked,
		);
		challengeList.appendChild(itemDiv);
	});

	if (data.length > 0) {
		const challenges = document.getElementById(
			'challenges-pending-result',
		) as HTMLDivElement;
		challenges.appendChild(challengeList);
	}
}

async function fillChallengesPendingResultAgree() {
	const response = await serverCall({
		route: ROUTES.QUERY_CHALLENGE_PENDING_RESULT_AGREE_REFEREE,
	});
	if (response.status === 'error') {
		alert(messageFromResponse(response));
		return;
	}
	const data = response.value;

	const challengeList = document.createElement('ul') as HTMLUListElement;
	challengeList.className = 'challenge-items';

	data.forEach(function (
		elem: QueryChallengesPendingResultAgreeRefereeOutputSingle,
		index: number,
	) {
		const challengeDiv = document.createElement('div') as HTMLDivElement;
		{
			// ---
			let li = document.createElement('li') as HTMLLIElement;
			li.className = 'challenge-items-bullet';
			li.textContent = `Challenge sent by ${elem.sentBy}.`;
			challengeDiv.appendChild(li);
			// ---
			li = document.createElement('li') as HTMLLIElement;
			li.className = 'challenge-items-nobullet';
			li.textContent = `Challenge sent to ${elem.sentTo}.`;
			challengeDiv.appendChild(li);
			// ---
			li = document.createElement('li') as HTMLLIElement;
			li.className = 'challenge-items-nobullet';
			//
			li = document.createElement('li') as HTMLLIElement;
			li.className = 'challenge-items-nobullet';
			li.textContent = `Of time control: ${elem.timeControlName}.`;
			challengeDiv.appendChild(li);
			//
			if (elem.title !== '') {
				li = document.createElement('li') as HTMLLIElement;
				li.className = 'challenge-items-nobullet';
				li.textContent = `Of title: ${elem.title}.`;
				challengeDiv.appendChild(li);
			}
			//
			li = document.createElement('li') as HTMLLIElement;
			li.className = 'challenge-items-nobullet';
			li.textContent = `Sent on ${formatDate(elem.sentWhen)}.`;
			challengeDiv.appendChild(li);
			//
			li = document.createElement('li') as HTMLLIElement;
			li.className = 'challenge-items-nobullet';
			li.textContent = `White: ${elem.white}.`;
			challengeDiv.appendChild(li);
			//
			li = document.createElement('li') as HTMLLIElement;
			li.className = 'challenge-items-nobullet';
			li.textContent = `Black: ${elem.black}.`;
			challengeDiv.appendChild(li);
			//
			li = document.createElement('li') as HTMLLIElement;
			li.className = 'challenge-items-nobullet';
			li.textContent = `Result: ${elem.result}.`;
			challengeDiv.appendChild(li);
			//
			li = document.createElement('li') as HTMLLIElement;
			li.className = 'challenge-items-nobullet';
			li.textContent = `Time control: ${elem.timeControlName}.`;
			challengeDiv.appendChild(li);
			//
			if (elem.title !== '') {
				li = document.createElement('li') as HTMLLIElement;
				li.className = 'challenge-items-nobullet';
				li.textContent = `Of title: ${elem.title}.`;
				challengeDiv.appendChild(li);
			}
		}
		challengeList.appendChild(challengeDiv);

		const buttonsDiv = document.createElement('div') as HTMLDivElement;
		buttonsDiv.setAttribute('align', 'center');
		buttonsDiv.style.marginTop = '5px';
		buttonsDiv.style.marginBottom = '5px';

		const agreeButton = document.createElement('button') as HTMLButtonElement;
		agreeButton.id = elem.id;
		agreeButton.onclick = agreeChallengeResultButtonClicked;
		agreeButton.className = 'button-agree-disagree-challenge';
		agreeButton.textContent = 'Agree';
		buttonsDiv.appendChild(agreeButton);

		if (elem.resultSetByReferee) {
			agreeButton.style.marginRight = '5px';

			const disagreeButton = document.createElement(
				'button',
			) as HTMLButtonElement;
			disagreeButton.style.marginLeft = '5px';
			disagreeButton.id = elem.id;
			disagreeButton.onclick = disagreeChallengeResultButtonClicked;
			disagreeButton.className = 'button-agree-disagree-challenge';
			disagreeButton.textContent = 'Disagree';
			buttonsDiv.appendChild(disagreeButton);
		}

		if (index < data.length - 1) {
			buttonsDiv.style.marginBottom = '20px';
		}

		challengeList.appendChild(buttonsDiv);
	});

	if (data.length > 0) {
		const challenges = document.getElementById(
			'challenges-pending-agree-result',
		) as HTMLDivElement;
		challenges.appendChild(challengeList);
	}
}

window.onload = function () {
	// add list of challenges
	fillChallengesPendingAccept();
	fillChallengesPendingResultSet();
	fillChallengesPendingResultAgree();
};
