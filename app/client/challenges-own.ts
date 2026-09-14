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
	QueryChallengesConfirmResultOtherOutputSingle,
	QueryChallengesConfirmResultSelfOutputSingle,
	QueryChallengesPendingResultOutputSingle,
	QueryChallengesReceivedOutputSingle,
	QueryChallengesSentOutputSingle,
} from '@common/api/schemas/query-challenges';
import { GameResult } from '@common/models/game-result';
import { PlayerPrivateId, toPlayerPublicId } from '@common/models/player-id';
import { TimeControlId, TimeControlName } from '@common/models/time-control';
import 'htmx.org';

async function sendChallengeButtonClicked(_event: any) {
	const usernameListInput = document.getElementById(
		'username-list',
	) as HTMLInputElement;
	const usernameOption = document.querySelector(
		'option[value="' + usernameListInput.value + '"]',
	);

	if (usernameOption !== null) {
		const publicUserId = toPlayerPublicId(usernameOption.id);

		const selectTimeControl = document.getElementById(
			'select-time-control',
		) as HTMLSelectElement;
		const timeControlId = selectTimeControl.options[
			selectTimeControl.selectedIndex
		].value as TimeControlId;
		const timeControlName = selectTimeControl.options[
			selectTimeControl.selectedIndex
		].text as TimeControlName;
		const gameTitleText = document.getElementById(
			'input-game-title',
		) as HTMLSelectElement;
		const gameTitle = gameTitleText.textContent;

		// "query" the server
		const response = await serverCall(ROUTES.CHALLENGE_SEND, {
			to: publicUserId,
			title: gameTitle,
			timeControlId: timeControlId,
			timeControlName: timeControlName,
		});
		if (response.status === 'error') {
			alert(messageFromResponse(response));
			return;
		}

		window.location.href = ROUTES.PAGE_CHALLENGES_OWN;
	}
}

async function acceptChallengeButtonClicked(event: any) {
	const tagClicked = event.target;
	const challengeId = tagClicked.id;

	const response = await serverCall(ROUTES.CHALLENGE_ACCEPT, {
		id: challengeId,
	});
	if (response.status === 'error') {
		alert(messageFromResponse(response));
		return;
	}
	window.location.href = ROUTES.PAGE_CHALLENGES_OWN;
}

async function declineChallengeTagClicked(event: any) {
	const tagClicked = event.target;
	const challengeId = tagClicked.id;

	const response = await serverCall(ROUTES.CHALLENGE_DECLINE, {
		id: challengeId,
	});
	if (response.status === 'error') {
		alert(messageFromResponse(response));
		return;
	}
	window.location.href = ROUTES.PAGE_CHALLENGES_OWN;
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
	const selectResultGame = document.getElementById(
		`select-result-game-${challengeId}`,
	) as HTMLSelectElement;

	const whitePublicId = whiteSelect.options[whiteSelect.selectedIndex]
		.value as PlayerPrivateId;
	const blackPublicId = blackSelect.options[blackSelect.selectedIndex]
		.value as PlayerPrivateId;
	const resultStr =
		selectResultGame.options[selectResultGame.selectedIndex].value;
	let result: GameResult;
	if (resultStr === 'white_wins') {
		result = 'white_wins';
	} else if (resultStr === 'black_wins') {
		result = 'black_wins';
	} else if (resultStr === 'draw') {
		result = 'draw';
	} else {
		console.log(`Wrong result for the game '${resultStr}'.`);
		return;
	}

	// "query" the server
	const response = await serverCall(ROUTES.CHALLENGE_SET_RESULT, {
		id: challengeId,
		white: toPlayerPublicId(whitePublicId),
		black: toPlayerPublicId(blackPublicId),
		result: result,
	});
	if (response.status === 'error') {
		alert(messageFromResponse(response));
		return;
	}

	window.location.href = ROUTES.PAGE_CHALLENGES_OWN;
}

async function agreeChallengeResultButtonClicked(event: any) {
	const tagClicked = event.target;
	const challengeId = tagClicked.id;

	const response = await serverCall(ROUTES.CHALLENGE_AGREE, {
		id: challengeId,
	});

	if (response.status === 'error') {
		alert(messageFromResponse(response));
		return;
	}

	window.location.href = ROUTES.PAGE_CHALLENGES_OWN;
}

async function disagreeChallengeResultButtonClicked(event: any) {
	const tagClicked = event.target;
	const challengeId = tagClicked.id;

	const response = await serverCall(ROUTES.CHALLENGE_DISAGREE, {
		id: challengeId,
	});

	if (response.status === 'error') {
		alert(messageFromResponse(response));
		return;
	}

	window.location.href = ROUTES.PAGE_CHALLENGES_OWN;
}

//

async function fillChallengesReceived() {
	const response = await serverCall(ROUTES.QUERY_CHALLENGE_RECEIVED, null);
	if (response.status === 'error') {
		alert(messageFromResponse(response));
		return;
	}
	const data = response.value;

	const challengeList = document.createElement('ul') as HTMLUListElement;
	challengeList.className = 'challenge-items';

	data.forEach(function (
		elem: QueryChallengesReceivedOutputSingle,
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
			const canCannot = elem.canBeDeclined ? 'can' : 'cannot';
			li = document.createElement('li') as HTMLLIElement;
			li.className = 'challenge-items-nobullet';
			li.textContent = `You ${canCannot} decline the challenge.`;
			challengeDiv.appendChild(li);
		}
		challengeList.appendChild(challengeDiv);

		const buttonsDiv = document.createElement('div') as HTMLDivElement;
		buttonsDiv.setAttribute('align', 'center');
		buttonsDiv.style.marginTop = '5px';
		buttonsDiv.style.marginBottom = '5px';

		{
			// accept tag
			const acceptButton = document.createElement(
				'button',
			) as HTMLButtonElement;
			acceptButton.id = `button-accept-${elem.id}`;
			acceptButton.onclick = acceptChallengeButtonClicked;
			acceptButton.className = 'button-accept-decline-challenge';
			acceptButton.textContent = 'Accept';
			acceptButton.style.marginRight = '5px';
			buttonsDiv.appendChild(acceptButton);
		}

		{
			// decline tag
			const declineButton = document.createElement(
				'button',
			) as HTMLButtonElement;
			declineButton.id = `button-decline-${elem.id}`;
			declineButton.onclick = declineChallengeTagClicked;
			declineButton.className = 'button-accept-decline-challenge';
			declineButton.textContent = 'Decline';
			declineButton.style.marginLeft = '5px';
			if (!elem.canBeDeclined) {
				declineButton.disabled = true;
			}
			buttonsDiv.appendChild(declineButton);
		}

		if (index < data.length - 1) {
			buttonsDiv.style.marginBottom = '20px';
		}

		challengeList.appendChild(buttonsDiv);
	});

	if (data.length > 0) {
		const challenges = document.getElementById(
			'challenges-received',
		) as HTMLDivElement;
		challenges.appendChild(challengeList);
	}
}

async function fillChallengesSent() {
	const response = await serverCall(ROUTES.QUERY_CHALLENGE_SENT, null);
	if (response.status === 'error') {
		alert(messageFromResponse(response));
		return;
	}
	const data = response.value;

	const challengeList = document.createElement('ul') as HTMLUListElement;
	challengeList.className = 'challenge-items';

	data.forEach(function (elem: QueryChallengesSentOutputSingle) {
		const challengeDiv = document.createElement('div') as HTMLDivElement;
		{
			// ----
			let li = document.createElement('li') as HTMLLIElement;
			li.className = 'challenge-items-bullet';
			li.textContent = `Challenge sent to ${elem.sentTo}.`;
			challengeDiv.appendChild(li);
			// ----
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
			let canCannot = elem.canBeDeclined ? 'can' : 'cannot';
			li = document.createElement('li') as HTMLLIElement;
			li.className = 'challenge-items-nobullet';
			li.textContent = `Your opponent ${canCannot} decline the challenge.`;
		}
		challengeList.appendChild(challengeDiv);
	});

	if (data.length > 0) {
		const challenges = document.getElementById(
			'challenges-sent',
		) as HTMLDivElement;
		challenges.appendChild(challengeList);
	}
}

function makeHeaderChallengePendingResultSet(
	c: QueryChallengesPendingResultOutputSingle,
) {
	const header = document.createElement('ul') as HTMLUListElement;
	header.className = 'challenge-items';
	{
		let li = document.createElement('li') as HTMLLIElement;
		li.className = 'challenge-items-bullet';
		li.textContent = `Challenge with ${c.opponent}.`;
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
	const response = await serverCall(
		ROUTES.QUERY_CHALLENGE_PENDING_RESULT,
		null,
	);
	if (response.status === 'error') {
		alert(messageFromResponse(response));
		return;
	}
	const data = response.value;

	const challengeList = document.createElement('div') as HTMLDivElement;
	challengeList.className = 'challenge-items';

	data.forEach(function (
		elem: QueryChallengesPendingResultOutputSingle,
		index: number,
	) {
		const itemDiv = createChallengeResultSetDiv(
			elem,
			index,
			data.length,
			makeHeaderChallengePendingResultSet,
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

async function fillChallengesResultPendingAgreeOther() {
	const response = await serverCall(
		ROUTES.QUERY_CHALLENGE_CONFIRM_RESULT_OTHER,
		null,
	);
	if (response.status === 'error') {
		alert(messageFromResponse(response));
		return;
	}

	const challengeData = response.value;

	const challengeList = document.createElement('ul') as HTMLUListElement;
	challengeList.className = 'challenge-items';
	challengeData.forEach(function (
		elem: QueryChallengesConfirmResultOtherOutputSingle,
	) {
		{
			let li = document.createElement('li') as HTMLLIElement;
			li.className = 'challenge-items-bullet';
			li.textContent = `On ${formatDate(elem.sentWhen)}.`;
			challengeList.appendChild(li);
			//
			li = document.createElement('li') as HTMLLIElement;
			li.className = 'challenge-items-nobullet';
			li.textContent = `White: ${elem.white}.`;
			challengeList.appendChild(li);
			//
			li = document.createElement('li') as HTMLLIElement;
			li.className = 'challenge-items-nobullet';
			li.textContent = `Black: ${elem.black}.`;
			challengeList.appendChild(li);
			//
			li = document.createElement('li') as HTMLLIElement;
			li.className = 'challenge-items-nobullet';
			li.textContent = `Result: ${elem.result}.`;
			challengeList.appendChild(li);
			//
			li = document.createElement('li') as HTMLLIElement;
			li.className = 'challenge-items-nobullet';
			li.textContent = `Time control: ${elem.timeControlName}.`;
			challengeList.appendChild(li);
			//
			if (elem.title !== '') {
				li = document.createElement('li') as HTMLLIElement;
				li.className = 'challenge-items-nobullet';
				li.textContent = `Of title: ${elem.title}.`;
				challengeList.appendChild(li);
			}
		}
	});

	if (challengeData.length > 0) {
		(
			document.getElementById(
				'challenges-confirm-result-other',
			) as HTMLDivElement
		).appendChild(challengeList);
	}
}

async function fillChallengesResultPendingAgreeSelf() {
	const response = await serverCall(
		ROUTES.QUERY_CHALLENGE_CONFIRM_RESULT_SELF,
		null,
	);
	if (response.status === 'error') {
		alert(messageFromResponse(response));
		return;
	}

	const challengeData = response.value;

	const challengeList = document.createElement('ul') as HTMLUListElement;
	challengeList.className = 'challenge-items';
	challengeData.forEach(function (
		elem: QueryChallengesConfirmResultSelfOutputSingle,
		index: number,
	) {
		const confirmationDiv = document.createElement('div') as HTMLDivElement;
		{
			let li = document.createElement('li') as HTMLLIElement;
			li.className = 'challenge-items-bullet';
			li.textContent = `On ${formatDate(elem.sentWhen)}.`;
			confirmationDiv.appendChild(li);
			//
			li = document.createElement('li') as HTMLLIElement;
			li.className = 'challenge-items-nobullet';
			li.textContent = `White: ${elem.white}.`;
			confirmationDiv.appendChild(li);
			//
			li = document.createElement('li') as HTMLLIElement;
			li.className = 'challenge-items-nobullet';
			li.textContent = `Black: ${elem.black}.`;
			confirmationDiv.appendChild(li);
			//
			li = document.createElement('li') as HTMLLIElement;
			li.className = 'challenge-items-nobullet';
			li.textContent = `Result: ${elem.result}.`;
			confirmationDiv.appendChild(li);
			//
			li = document.createElement('li') as HTMLLIElement;
			li.className = 'challenge-items-nobullet';
			li.textContent = `Time control: ${elem.timeControlName}.`;
			confirmationDiv.appendChild(li);
			//
			if (elem.title !== '') {
				li = document.createElement('li') as HTMLLIElement;
				li.className = 'challenge-items-nobullet';
				li.textContent = `Of title: ${elem.title}.`;
				confirmationDiv.appendChild(li);
			}
		}

		challengeList.appendChild(confirmationDiv);

		const buttonsDiv = document.createElement('div') as HTMLDivElement;
		buttonsDiv.setAttribute('align', 'center');
		buttonsDiv.style.marginTop = '5px';
		buttonsDiv.style.marginBottom = '5px';

		{
			// accept tag
			const acceptButton = document.createElement(
				'button',
			) as HTMLButtonElement;
			acceptButton.id = elem.id;
			acceptButton.onclick = agreeChallengeResultButtonClicked;
			acceptButton.className = 'button-agree-disagree-challenge';
			acceptButton.textContent = 'Agree';
			acceptButton.style.marginLeft = '5px';
			buttonsDiv.appendChild(acceptButton);
		}

		if (elem.canDisagree) {
			// decline tag
			const disagreeButton = document.createElement(
				'button',
			) as HTMLButtonElement;
			disagreeButton.id = elem.id;
			disagreeButton.onclick = disagreeChallengeResultButtonClicked;
			disagreeButton.className = 'button-agree-disagree-challenge';
			disagreeButton.textContent = 'Disagree';
			disagreeButton.style.marginLeft = '5px';
			buttonsDiv.appendChild(disagreeButton);
		}

		if (index < challengeData.length - 1) {
			buttonsDiv.style.marginBottom = '20px';
		}

		challengeList.appendChild(buttonsDiv);
	});

	if (challengeData.length > 0) {
		(
			document.getElementById(
				'challenges-confirm-result-self',
			) as HTMLDivElement
		).appendChild(challengeList);
	}
}

window.onload = function () {
	// link button 'button-submit-challenge' click behaviour
	let sendChallengeButton = document.getElementById(
		'send-challenge-button',
	) as HTMLButtonElement;
	sendChallengeButton.onclick = sendChallengeButtonClicked;

	// add list of challenges
	fillChallengesReceived();
	fillChallengesSent();
	fillChallengesPendingResultSet();
	fillChallengesResultPendingAgreeOther();
	fillChallengesResultPendingAgreeSelf();
};
