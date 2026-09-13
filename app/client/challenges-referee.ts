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
import { ROUTES } from '@common/api/routes';
import {
	QueryChallengesPendingAcceptRefereeOutputSingle,
	QueryChallengesPendingResultAgreeRefereeOutputSingle,
	QueryChallengesPendingResultSetRefereeOutputSingle,
} from '@common/api/schemas/query-challenges';
import 'htmx.org';

/*
function createLabelText(text: string): HTMLLabelElement {
	let label = document.createElement('label') as HTMLLabelElement;
	label.textContent = text;
	label.className = 'label';
	return label;
}
*/

function formatDate(date: string) {
	return date.replace('..', ', ').replace('-', '/').replace('-', '/');
}

/*
async function acceptChallengeButtonClicked(event: any) {
	let tagClicked = event.target;
	let challengeId = tagClicked.id;

	const response = await serverCall(ROUTES.CHALLENGE_ACCEPT, {
		id: challengeId,
	});
	if (response.status === 'error') {
		alert(messageFromResponse(response));
		return;
	}
	window.location.href = ROUTES.PAGE_CHALLENGES_OWN;
}

async function resultChallengeSetButtonClicked(_event: any) {
	window.location.href = ROUTES.PAGE_CHALLENGES_OWN;
}

async function agreeChallengeResultButtonClicked(_event: any) {
	window.location.href = ROUTES.PAGE_CHALLENGES_OWN;
}

async function disagreeChallengeResultButtonClicked(_event: any) {
	window.location.href = ROUTES.PAGE_CHALLENGES_OWN;
}
*/

//

async function fillChallengesPendingAccept() {
	const response = await serverCall(
		ROUTES.QUERY_CHALLENGE_PENDING_ACCEPT_REFEREE,
		null,
	);
	if (response.status === 'error') {
		alert(messageFromResponse(response));
		return;
	}
	const data = response.value;

	const challenges = document.getElementById(
		'challenges-pending-accept--list',
	) as HTMLDivElement;

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
		challenges.appendChild(challengeDiv);

		// missing button to force accept and the corresponding hook that calls the server
	});
}

async function fillChallengesPendingResultSet() {
	const response = await serverCall(
		ROUTES.QUERY_CHALLENGE_PENDING_RESULT_SET_REFEREE,
		null,
	);
	if (response.status === 'error') {
		alert(messageFromResponse(response));
		return;
	}
	const data = response.value;

	const challenges = document.getElementById(
		'challenges-pending-result--list',
	) as HTMLDivElement;

	data.forEach(function (
		elem: QueryChallengesPendingResultSetRefereeOutputSingle,
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
		challenges.appendChild(challengeDiv);

		// missing buttons to set the result and set it to the server
	});
}

async function fillChallengesPendingResultAccept() {
	const response = await serverCall(
		ROUTES.QUERY_CHALLENGE_PENDING_RESULT_AGREE_REFEREE,
		null,
	);
	if (response.status === 'error') {
		alert(messageFromResponse(response));
		return;
	}
	const data = response.value;

	const challenges = document.getElementById(
		'challenges-pending-agree-result--list',
	) as HTMLDivElement;

	data.forEach(function (
		elem: QueryChallengesPendingResultAgreeRefereeOutputSingle,
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
		challenges.appendChild(challengeDiv);

		// missing buttons to set the result and set it to the server
	});
}

window.onload = function () {
	// add list of challenges
	fillChallengesPendingAccept();
	fillChallengesPendingResultSet();
	fillChallengesPendingResultAccept();
};
