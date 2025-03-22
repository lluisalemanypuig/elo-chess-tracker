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
	label.className = 'label';
	return label;
}

function format_date(date: string) {
	return date.replace('..', ', ').replace('-', '/').replace('-', '/');
}

async function send_challenge_button_clicked(_event: any) {
	let username_list_input = document.getElementById('username_list') as HTMLInputElement;
	const username_option = document.querySelector('option[value="' + username_list_input.value + '"]');

	if (username_option != null) {
		const random_user_id = username_option.id;

		// "query" the server
		const response = await fetch('/challenge/send', {
			method: 'POST',
			body: JSON.stringify({ to: random_user_id }),
			headers: { 'Content-type': 'application/json; charset=UTF-8' }
		});
		if (response.status >= 400) {
			const message = await response.text();
			alert(`${response.status} -- ${response.statusText}\nMessage: '${message}'`);
			return;
		}

		window.location.href = '/challenge';
	}
}

async function accept_challenge_tag_clicked(event: any) {
	let tag_clicked = event.target;
	let challenge_id = tag_clicked.id;

	const response = await fetch('/challenge/accept', {
		method: 'POST',
		body: JSON.stringify({ challenge_id: challenge_id }),
		headers: { 'Content-type': 'application/json; charset=UTF-8' }
	});
	if (response.status >= 400) {
		const message = await response.text();
		alert(`${response.status} -- ${response.statusText}\nMessage: '${message}'`);
		return;
	}
	window.location.href = '/challenge';
}

async function decline_challenge_tag_clicked(event: any) {
	let tag_clicked = event.target;
	let challenge_id = tag_clicked.id;

	const response = await fetch('/challenge/decline', {
		method: 'POST',
		body: JSON.stringify({ challenge_id: challenge_id }),
		headers: { 'Content-type': 'application/json; charset=UTF-8' }
	});
	if (response.status >= 400) {
		const message = await response.text();
		alert(`${response.status} -- ${response.statusText}\nMessage: '${message}'`);
		return;
	}
	window.location.href = '/challenge';
}

async function fill_challenges_received() {
	const response = await fetch('/query/challenge/received', {
		method: 'GET',
		headers: { 'Content-type': 'application/json; charset=UTF-8' }
	});
	if (response.status >= 400) {
		const message = await response.text();
		alert(`${response.status} -- ${response.statusText}\nMessage: '${message}'`);
		return;
	}
	const data = (await response.json()) as any[];

	let challenge_list = document.createElement('ul') as HTMLUListElement;
	challenge_list.className = 'challenge_items';
	data.forEach(function (elem: any) {
		{
			let li = document.createElement('li') as HTMLLIElement;
			li.className = 'challenge_items_bullet';
			li.textContent = `Challenge sent by ${elem.sent_by}.`;
			challenge_list.appendChild(li);

			li = document.createElement('li') as HTMLLIElement;
			li.className = 'challenge_items_nobullet';
			li.textContent = `Sent on ${format_date(elem.sent_when)}.`;
			challenge_list.appendChild(li);
		}

		{
			// accept tag
			let accept_tag = document.createElement('a') as HTMLAnchorElement;
			accept_tag.id = elem.id;
			accept_tag.onclick = accept_challenge_tag_clicked;
			accept_tag.setAttribute('style', 'color:blue;text-decoration:underline;cursor:pointer');
			accept_tag.textContent = 'Accept.';

			// decline tag
			let decline_tag = document.createElement('a') as HTMLAnchorElement;
			decline_tag.id = elem.id;
			decline_tag.onclick = decline_challenge_tag_clicked;
			decline_tag.setAttribute('style', 'color:blue;text-decoration:underline;cursor:pointer');
			decline_tag.textContent = 'Decline.';

			let li = document.createElement('li') as HTMLLIElement;
			li.className = 'challenge_items_nobullet';
			li.appendChild(accept_tag);
			li.appendChild(document.createTextNode(' '));
			li.appendChild(decline_tag);
			challenge_list.appendChild(li);
		}
	});

	if (data.length > 0) {
		(document.getElementById('challenges_received') as HTMLDivElement).appendChild(challenge_list);
	}
}

async function fill_challenges_sent() {
	const response = await fetch('/query/challenge/sent', {
		method: 'GET',
		headers: { 'Content-type': 'application/json; charset=UTF-8' }
	});
	if (response.status >= 400) {
		const message = await response.text();
		alert(`${response.status} -- ${response.statusText}\nMessage: '${message}'`);
		return;
	}
	const data = (await response.json()) as any[];

	let challenge_list = document.createElement('ul') as HTMLUListElement;
	challenge_list.className = 'challenge_items';

	data.forEach(function (elem: any) {
		let li = document.createElement('li') as HTMLLIElement;
		li.className = 'challenge_items_bullet';
		li.textContent = `Challenge sent to ${elem.sent_to}.`;
		challenge_list.appendChild(li);

		li = document.createElement('li') as HTMLLIElement;
		li.className = 'challenge_items_nobullet';
		li.textContent = `Sent on ${format_date(elem.sent_when)}.`;
		challenge_list.appendChild(li);
	});

	if (data.length > 0) {
		(document.getElementById('challenges_sent') as HTMLDivElement).appendChild(challenge_list);
	}
}

async function fill_challenges_pending_result() {
	const response_pending = await fetch('/query/challenge/pending_result', {
		method: 'GET',
		headers: { 'Content-type': 'application/json; charset=UTF-8' }
	});
	if (response_pending.status >= 400) {
		const message = await response_pending.text();
		alert(`${response_pending.status} -- ${response_pending.statusText}\nMessage: '${message}'`);
		return;
	}

	const response_tc = await fetch('/query/html/time_controls', {
		method: 'GET',
		headers: { 'Content-type': 'application/json; charset=UTF-8' }
	});
	if (response_tc.status >= 400) {
		const message = await response_tc.text();
		alert(`${response_tc.status} -- ${response_tc.statusText}\nMessage: '${message}'`);
		return;
	}

	const challenge_data = await response_pending.json();
	const time_control_data = await response_tc.text();

	let all_challenges_list = document.getElementById('challenges_pending_result__list') as HTMLDivElement;
	challenge_data.forEach(function (elem: any, index: number) {
		{
			let header = document.createElement('ul') as HTMLUListElement;
			header.className = 'challenge_items';
			{
				let li = document.createElement('li') as HTMLLIElement;
				li.className = 'challenge_items_bullet';
				li.textContent = `Challenge with ${elem.opponent}.`;
				header.appendChild(li);
			}

			{
				let li = document.createElement('li') as HTMLLIElement;
				li.className = 'challenge_items_nobullet';
				li.textContent = `Sent on ${format_date(elem.sent_when)}.`;
				header.appendChild(li);
			}
			all_challenges_list.appendChild(header);
		}

		let challenge_div = document.createElement('div') as HTMLDivElement;

		// Who is the white player?
		{
			let div = document.createElement('div') as HTMLDivElement;
			div.className = 'label-and-select';

			div.appendChild(create_label_text('White:'));

			let select = document.createElement('select');
			select.id = 'white_select_' + elem.id;
			select.className = 'select_basic';

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
			select.className = 'select_basic';

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
			select.className = 'select_basic';

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
			select.className = 'select_basic';
			select.innerHTML = time_control_data;
			div.appendChild(select);
			challenge_div.appendChild(div);
		}

		all_challenges_list.appendChild(challenge_div);

		// submit button
		{
			let submit_result_button = document.createElement('button');
			submit_result_button.textContent = 'Submit result';
			submit_result_button.className = 'button_submit_challenge';
			submit_result_button.id = elem.id;
			submit_result_button.onclick = submit_result_challenge_button_clicked;
			submit_result_button.style.marginTop = '5px';
			if (index < challenge_data.length - 1) {
				submit_result_button.style.marginBottom = '20px';
			}

			all_challenges_list.appendChild(submit_result_button);
		}

		(document.getElementById('challenges_pending_result') as HTMLDivElement).appendChild(all_challenges_list);
	});
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
	const response = await fetch('/challenge/set_result', {
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
	if (response.status >= 400) {
		const message = await response.text();
		alert(`${response.status} -- ${response.statusText}\nMessage: '${message}'`);
		return;
	}

	window.location.href = '/challenge';
}

async function fill_challenges_confirm_result_other() {
	const response = await fetch('/query/challenge/confirm_result/other', {
		method: 'GET',
		headers: { 'Content-type': 'application/json; charset=UTF-8' }
	});
	if (response.status >= 400) {
		const message = await response.text();
		alert(`${response.status} -- ${response.statusText}\nMessage: '${message}'`);
		return;
	}

	const challenge_data = (await response.json()) as any[];

	let challenge_list = document.createElement('ul') as HTMLUListElement;
	challenge_list.className = 'challenge_items';
	challenge_data.forEach(function (elem: any) {
		{
			let li = document.createElement('li') as HTMLLIElement;
			li.className = 'challenge_items_bullet';
			li.textContent = `On ${format_date(elem.sent_when)}.`;
			challenge_list.appendChild(li);
		}

		{
			let li = document.createElement('li') as HTMLLIElement;
			li.className = 'challenge_items_nobullet';
			li.textContent = `White: ${elem.white}.`;
			challenge_list.appendChild(li);
		}

		{
			let li = document.createElement('li') as HTMLLIElement;
			li.className = 'challenge_items_nobullet';
			li.textContent = `Black: ${elem.black}.`;
			challenge_list.appendChild(li);
		}

		{
			let li = document.createElement('li') as HTMLLIElement;
			li.className = 'challenge_items_nobullet';
			li.textContent = `Result: ${elem.result}.`;
			challenge_list.appendChild(li);
		}

		{
			let li = document.createElement('li') as HTMLLIElement;
			li.className = 'challenge_items_nobullet';
			li.textContent = `Time control: ${elem.time_control}.`;
			challenge_list.appendChild(li);
		}
	});

	if (challenge_data.length > 0) {
		(document.getElementById('challenges_confirm_result_other') as HTMLDivElement).appendChild(challenge_list);
	}
}

async function fill_challenges_confirm_result_self() {
	const response = await fetch('/query/challenge/confirm_result/self', {
		method: 'GET',
		headers: { 'Content-type': 'application/json; charset=UTF-8' }
	});
	if (response.status >= 400) {
		const message = await response.text();
		alert(`${response.status} -- ${response.statusText}\nMessage: '${message}'`);
		return;
	}

	const challenge_data = (await response.json()) as any[];

	let challenge_list = document.createElement('ul') as HTMLUListElement;
	challenge_list.className = 'challenge_items';
	challenge_data.forEach(function (elem: any) {
		{
			let li = document.createElement('li') as HTMLLIElement;
			li.className = 'challenge_items_bullet';
			li.textContent = `On ${format_date(elem.sent_when)}.`;
			challenge_list.appendChild(li);
		}

		{
			let li = document.createElement('li') as HTMLLIElement;
			li.className = 'challenge_items_nobullet';
			li.textContent = `White: ${elem.white}.`;
			challenge_list.appendChild(li);
		}

		{
			let li = document.createElement('li') as HTMLLIElement;
			li.className = 'challenge_items_nobullet';
			li.textContent = `Black: ${elem.black}.`;
			challenge_list.appendChild(li);
		}

		{
			let li = document.createElement('li') as HTMLLIElement;
			li.className = 'challenge_items_nobullet';
			li.textContent = `Result: ${elem.result}.`;
			challenge_list.appendChild(li);
		}

		{
			let li = document.createElement('li') as HTMLLIElement;
			li.className = 'challenge_items_nobullet';
			li.textContent = `Time control: ${elem.time_control}.`;
			challenge_list.appendChild(li);
		}

		{
			// accept tag
			let accept_tag = document.createElement('a') as HTMLAnchorElement;
			accept_tag.id = elem.id;
			accept_tag.onclick = agree_challenge_result_tag_clicked;
			accept_tag.setAttribute('style', 'color:blue;text-decoration:underline;cursor:pointer');
			accept_tag.textContent = 'Agree.';

			// decline tag
			let decline_tag = document.createElement('a') as HTMLAnchorElement;
			decline_tag.id = elem.id;
			decline_tag.onclick = disagree_challenge_result_tag_clicked;
			decline_tag.setAttribute('style', 'color:blue;text-decoration:underline;cursor:pointer');
			decline_tag.textContent = 'Disagree.';

			let li = document.createElement('li') as HTMLLIElement;
			li.className = 'challenge_items_nobullet';
			li.appendChild(accept_tag);
			li.appendChild(document.createTextNode(' '));
			li.appendChild(decline_tag);
			challenge_list.appendChild(li);
		}
	});

	if (challenge_data.length > 0) {
		(document.getElementById('challenges_confirm_result_self') as HTMLDivElement).appendChild(challenge_list);
	}
}

async function agree_challenge_result_tag_clicked(event: any) {
	let tag_clicked = event.target;
	let challenge_id = tag_clicked.id;

	const response = await fetch('/challenge/agree', {
		method: 'POST',
		body: JSON.stringify({ challenge_id: challenge_id }),
		headers: { 'Content-type': 'application/json; charset=UTF-8' }
	});
	if (response.status >= 400) {
		const message = await response.text();
		alert(`${response.status} -- ${response.statusText}\nMessage: '${message}'`);
		return;
	}

	window.location.href = '/challenge';
}

async function disagree_challenge_result_tag_clicked(event: any) {
	let tag_clicked = event.target;
	let challenge_id = tag_clicked.id;

	const response = await fetch('/challenge/disagree', {
		method: 'POST',
		body: JSON.stringify({ challenge_id: challenge_id }),
		headers: { 'Content-type': 'application/json; charset=UTF-8' }
	});
	if (response.status >= 400) {
		const message = await response.text();
		alert(`${response.status} -- ${response.statusText}\nMessage: '${message}'`);
		return;
	}

	window.location.href = '/challenge';
}

window.onload = function () {
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
