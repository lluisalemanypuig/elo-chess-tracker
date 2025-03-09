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

function create_label_text(text: string): HTMLLabelElement {
	let label = document.createElement('label') as HTMLLabelElement;
	label.textContent = text;
	return label;
}

async function fill_datalist_username() {
	let datalist_username = document.getElementById('datalist_username') as HTMLDataListElement;

	// "query" the server
	const response = await fetch('/query/user/list', {
		method: 'GET',
		headers: { 'Content-type': 'application/json; charset=UTF-8' }
	});

	const data = await response.json();
	if (data.r == '0') {
		alert(data.reason);
		return;
	}

	const list = data.data as [string, number][];

	let options = '';
	list.forEach(function (elem: [string, number]) {
		options += `<option value="${elem[0]}" id="${elem[1]}">`;
	});
	datalist_username.innerHTML = options;
}

async function send_challenge_button_clicked(_event: any) {
	let username_list_input = document.getElementById('username_list') as HTMLInputElement;
	const username_option = document.querySelector('option[value="' + username_list_input.value + '"]');

	if (username_option != null) {
		const random_user_id = username_option.id;

		// "query" the server
		const response = await fetch('/challenges_send', {
			method: 'POST',
			body: JSON.stringify({ to: random_user_id }),
			headers: { 'Content-type': 'application/json; charset=UTF-8' }
		});

		const data = await response.json();
		if (data.r == '0') {
			alert(data.reason);
			return;
		}

		window.location.href = '/challenges_page';
	}
}

async function accept_challenge_tag_clicked(event: any) {
	let tag_clicked = event.target;
	let challenge_id = tag_clicked.id;

	const response = await fetch('/challenges_accept', {
		method: 'POST',
		body: JSON.stringify({ challenge_id: challenge_id }),
		headers: { 'Content-type': 'application/json; charset=UTF-8' }
	});
	const data = await response.json();

	if (data.r == '1') {
		window.location.href = '/challenges_page';
	}
}

async function decline_challenge_tag_clicked(event: any) {
	let tag_clicked = event.target;
	let challenge_id = tag_clicked.id;

	const response = await fetch('/challenges_decline', {
		method: 'POST',
		body: JSON.stringify({ challenge_id: challenge_id }),
		headers: { 'Content-type': 'application/json; charset=UTF-8' }
	});
	const data = await response.json();

	if (data.r == '1') {
		window.location.href = '/challenges_page';
	}
}

async function fill_challenges_received() {
	const response = await fetch('/query/challenges/received', {
		method: 'GET',
		headers: { 'Content-type': 'application/json; charset=UTF-8' }
	});
	const data = await response.json();

	if (data.r == '0') {
		// something went wrong, do nothing
		return;
	}

	const challenge_data = data.c as any[];

	let challenge_list = document.createElement('ul') as HTMLUListElement;
	challenge_data.forEach(function (elem: any) {
		let li = document.createElement('li') as HTMLLIElement;
		li.appendChild(
			document.createTextNode(`Challenge sent by ${elem.sent_by}. Sent on ${elem.sent_when.replace('..', ' ')}. `)
		);

		// add accept tag
		let accept_tag = document.createElement('a') as HTMLAnchorElement;
		accept_tag.id = elem.id;
		accept_tag.onclick = accept_challenge_tag_clicked;
		accept_tag.setAttribute('style', 'color:blue;text-decoration:underline;cursor:pointer');
		accept_tag.textContent = 'Accept.';
		li.appendChild(accept_tag);
		li.appendChild(document.createTextNode(' '));

		// add decline tag
		let decline_tag = document.createElement('a') as HTMLAnchorElement;
		decline_tag.id = elem.id;
		decline_tag.onclick = decline_challenge_tag_clicked;
		decline_tag.setAttribute('style', 'color:blue;text-decoration:underline;cursor:pointer');
		decline_tag.textContent = 'Decline.';
		li.appendChild(decline_tag);

		// append paragraph to element list
		challenge_list.appendChild(li);
	});
	(document.getElementById('challenges_received') as HTMLDivElement).appendChild(challenge_list);
}

async function fill_challenges_sent() {
	const response = await fetch('/query/challenges/sent', {
		method: 'GET',
		headers: { 'Content-type': 'application/json; charset=UTF-8' }
	});
	const data = await response.json();

	if (data.r == '0') {
		// something went wrong, do nothing
		return;
	}

	const challenge_data = data.c as any[];

	let challenge_list = document.createElement('ul') as HTMLUListElement;
	challenge_data.forEach(function (elem: any) {
		let li = document.createElement('li') as HTMLLIElement;
		li.textContent = `Challenge sent to ${elem.sent_to}. Sent on ${elem.sent_when.replace('..', ' ')}.`;

		// append paragraph to element list
		challenge_list.appendChild(li);
	});
	(document.getElementById('challenges_sent') as HTMLDivElement).appendChild(challenge_list);
}

async function fill_challenges_pending_result() {
	const response_challenges_pending = await fetch('/query/challenges/pending_result', {
		method: 'GET',
		headers: { 'Content-type': 'application/json; charset=UTF-8' }
	});
	const challenges_pending = await response_challenges_pending.json();

	const response_time_control = await fetch('/query/time_controls', {
		method: 'GET',
		headers: { 'Content-type': 'application/json; charset=UTF-8' }
	});
	const time_control = await response_time_control.json();

	if (challenges_pending.r == '0') {
		// something went wrong, do nothing
		return;
	}

	const challenge_data = challenges_pending.c as any[];
	const time_control_data = time_control.data as any[];

	let all_challenges_list = document.getElementById('challenges_pending_result__list') as HTMLDivElement;
	challenge_data.forEach(function (elem: any, index: number) {
		let li = document.createElement('li') as HTMLLIElement;
		li.textContent = `Challenge with ${elem.opponent}, sent on ${elem.sent_when.replace('..', ' ')}.`;

		// append paragraph to element list
		all_challenges_list.appendChild(li);
		li.classList.add('challenge-list-item');

		let challenge_div = document.createElement('div') as HTMLDivElement;

		// Who is the white player?
		{
			let div = document.createElement('div') as HTMLDivElement;
			div.className = 'label-and-select';

			div.appendChild(create_label_text('White:'));

			let select = document.createElement('select');
			select.id = 'white_select_' + elem.id;

			let option_1 = document.createElement('option') as HTMLOptionElement;
			option_1.text = elem.sent_to_name;
			option_1.value = elem.sent_to_username;
			select.appendChild(option_1);
			let option_2 = document.createElement('option') as HTMLOptionElement;
			option_2.text = elem.sent_by_name;
			option_2.value = elem.sent_by_username;
			select.appendChild(option_2);

			div.appendChild(select);
			challenge_div.appendChild(div);
		}

		// Who is the black player?
		{
			let div = document.createElement('div') as HTMLDivElement;
			div.className = 'label-and-select';

			div.appendChild(create_label_text('Black:'));

			let select = document.createElement('select');
			select.id = 'black_select_' + elem.id;

			let option_1 = document.createElement('option') as HTMLOptionElement;
			option_1.text = elem.sent_by_name;
			option_1.value = elem.sent_by_username;
			select.appendChild(option_1);
			let option_2 = document.createElement('option') as HTMLOptionElement;
			option_2.text = elem.sent_to_name;
			option_2.value = elem.sent_to_username;
			select.appendChild(option_2);

			div.appendChild(select);
			challenge_div.appendChild(div);
		}

		// Result of the game
		{
			let div = document.createElement('div') as HTMLDivElement;
			div.className = 'label-and-select';

			div.appendChild(create_label_text('Result:'));

			let select = document.createElement('select');
			select.id = 'select_result_game_' + elem.id;

			let option_1 = document.createElement('option') as HTMLOptionElement;
			option_1.text = '1 - 0';
			option_1.value = 'white_wins';
			select.appendChild(option_1);
			let option_2 = document.createElement('option') as HTMLOptionElement;
			option_2.text = '1/2 - 1/2';
			option_2.value = 'draw';
			select.appendChild(option_2);
			let option_3 = document.createElement('option') as HTMLOptionElement;
			option_3.text = '0 - 1';
			option_3.value = 'black_wins';
			select.appendChild(option_3);

			div.appendChild(select);
			challenge_div.appendChild(div);
		}

		// Time control of the game
		{
			let div = document.createElement('div') as HTMLDivElement;
			div.className = 'label-and-select';

			div.appendChild(create_label_text('Time control:'));

			let select = document.createElement('select');
			select.id = 'select_time_control_' + elem.id;

			for (let i = 0; i < time_control_data.length; ++i) {
				let option_i = document.createElement('option') as HTMLOptionElement;
				option_i.text = time_control_data[i].name;
				option_i.value = time_control_data[i].id;
				select.appendChild(option_i);
			}

			div.appendChild(select);
			challenge_div.appendChild(div);
		}

		all_challenges_list.appendChild(challenge_div);

		// submit button
		{
			let submit_result_button_clicked = document.createElement('button');
			submit_result_button_clicked.textContent = 'Submit result';
			submit_result_button_clicked.id = elem.id;
			submit_result_button_clicked.onclick = submit_result_challenge_button_clicked;
			submit_result_button_clicked.style.marginTop = '5px';
			if (index < challenge_data.length - 1) {
				submit_result_button_clicked.style.marginBottom = '20px';
			}

			all_challenges_list.appendChild(submit_result_button_clicked);
		}
	});
	(document.getElementById('challenges_pending_result') as HTMLDivElement).appendChild(all_challenges_list);
}

async function submit_result_challenge_button_clicked(event: any) {
	let button_clicked = event.target;
	let challenge_id = button_clicked.id;

	let white_select = document.getElementById('white_select_' + challenge_id) as HTMLSelectElement;
	let black_select = document.getElementById('black_select_' + challenge_id) as HTMLSelectElement;
	let select_result_game = document.getElementById('select_result_game_' + challenge_id) as HTMLSelectElement;
	let select_time_control = document.getElementById('select_time_control_' + challenge_id) as HTMLSelectElement;

	let white_username = white_select.options[white_select.selectedIndex].value;
	let black_username = black_select.options[black_select.selectedIndex].value;
	let result = select_result_game.options[select_result_game.selectedIndex].value;
	let time_control_id = select_time_control.options[select_time_control.selectedIndex].value;
	let time_control_name = select_time_control.options[select_time_control.selectedIndex].text;

	// "query" the server
	const response = await fetch('/challenges_set_result', {
		method: 'POST',
		body: JSON.stringify({
			challenge_id: challenge_id,
			white: white_username,
			black: black_username,
			result: result,
			time_control_id: time_control_id,
			time_control_name: time_control_name
		}),
		headers: { 'Content-type': 'application/json; charset=UTF-8' }
	});

	const data = await response.json();
	if (data.r == '0') {
		alert(data.reason);
		return;
	}

	window.location.href = '/challenges_page';
}

async function fill_challenges_confirm_result_other() {
	const response = await fetch('/query/challenges/confirm_result/other', {
		method: 'GET',
		headers: { 'Content-type': 'application/json; charset=UTF-8' }
	});
	const data = await response.json();

	if (data.r == '0') {
		// something went wrong, do nothing
		return;
	}

	const challenge_data = data.c as any[];

	let challenge_list = document.createElement('ul') as HTMLUListElement;
	challenge_data.forEach(function (elem: any) {
		let li = document.createElement('li') as HTMLLIElement;
		li.textContent = `On ${elem.sent_when.replace('..', ' ')}. White: ${elem.white}. Black: ${
			elem.black
		}. Result: ${elem.result}. Time control: ${elem.time_control}`;

		// append paragraph to element list
		challenge_list.appendChild(li);
	});
	(document.getElementById('challenges_confirm_result_other') as HTMLDivElement).appendChild(challenge_list);
}

async function fill_challenges_confirm_result_self() {
	const response = await fetch('/query/challenges/confirm_result/self', {
		method: 'GET',
		headers: { 'Content-type': 'application/json; charset=UTF-8' }
	});
	const data = await response.json();

	if (data.r == '0') {
		// something went wrong, do nothing
		return;
	}

	const challenge_data = data.c as any[];

	let challenge_list = document.createElement('ul') as HTMLUListElement;
	challenge_data.forEach(function (elem: any) {
		let li = document.createElement('li') as HTMLLIElement;
		li.textContent = `On ${elem.sent_when.replace('..', ' ')}. White: ${elem.white}. Black: ${
			elem.black
		}. Result: ${elem.result}. Time control: ${elem.time_control}. `;

		// add accept tag
		let accept_tag = document.createElement('a') as HTMLAnchorElement;
		accept_tag.id = elem.id;
		accept_tag.onclick = agree_challenge_result_tag_clicked;
		accept_tag.setAttribute('style', 'color:blue;text-decoration:underline;cursor:pointer');
		accept_tag.textContent = 'Agree.';
		li.appendChild(accept_tag);
		li.appendChild(document.createTextNode(' '));

		// add decline tag
		let decline_tag = document.createElement('a') as HTMLAnchorElement;
		decline_tag.id = elem.id;
		decline_tag.onclick = disagree_challenge_result_tag_clicked;
		decline_tag.setAttribute('style', 'color:blue;text-decoration:underline;cursor:pointer');
		decline_tag.textContent = 'Disagree.';
		li.appendChild(decline_tag);

		// append paragraph to element list
		challenge_list.appendChild(li);
	});
	(document.getElementById('challenges_confirm_result_self') as HTMLDivElement).appendChild(challenge_list);
}

async function agree_challenge_result_tag_clicked(event: any) {
	let tag_clicked = event.target;
	let challenge_id = tag_clicked.id;

	const response = await fetch('/challenges_agree_result', {
		method: 'POST',
		body: JSON.stringify({ challenge_id: challenge_id }),
		headers: { 'Content-type': 'application/json; charset=UTF-8' }
	});
	const data = await response.json();

	if (data.r == '1') {
		window.location.href = '/challenges_page';
	}
}

async function disagree_challenge_result_tag_clicked(event: any) {
	let tag_clicked = event.target;
	let challenge_id = tag_clicked.id;

	const response = await fetch('/challenges_disagree_result', {
		method: 'POST',
		body: JSON.stringify({ challenge_id: challenge_id }),
		headers: { 'Content-type': 'application/json; charset=UTF-8' }
	});
	const data = await response.json();

	if (data.r == '1') {
		window.location.href = '/challenges_page';
	}
}

window.onload = function () {
	// fill in username dropdown with values
	fill_datalist_username();

	// link button 'submit_challenge' click behaviour
	let send_challenge_button = document.getElementById('send_challenge_button') as HTMLButtonElement;
	send_challenge_button.onclick = send_challenge_button_clicked;

	// add list of challenges
	fill_challenges_received();
	fill_challenges_sent();
	fill_challenges_pending_result();
	fill_challenges_confirm_result_other();
	fill_challenges_confirm_result_self();
};
