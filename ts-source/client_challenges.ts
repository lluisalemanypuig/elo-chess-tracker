/*
Elo rating for a Chess Club
Copyright (C) 2023  Lluís Alemany Puig

This program is free software: you can redistribute it and/or modify
it under the terms of the GNU Affero General Public License as published
by the Free Software Foundation, either version 3 of the License, or
(at your option) any later version.

This program is distributed in the hope that it will be useful,
but WITHOUT ANY WARRANTY; without even the implied warranty of
MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
GNU Affero General Public License for more details.

You should have received a copy of the GNU Affero General Public License
along with this program.  If not, see <https://www.gnu.org/licenses/>.

Contact:
	Lluís Alemany Puig
	https://github.com/lluisalemanypuig
*/

async function fill_username_datalist() {
	let username_datalist = document.getElementById("username_datalist") as HTMLDataListElement;

	{
	let opt = document.createElement('option');
	opt.text = "";
	opt.value = "";
	username_datalist.appendChild(opt);
	}

	// "query" the server
	const response = await fetch(
		"/query_user_list",
		{
			method: 'GET',
			headers: { 'Content-type': 'application/json; charset=UTF-8' }
		}
	);

	const data = await response.json();
	if (data.r == '0') {
		alert(data.reason);
		return;
	}

	const list = data.data as [string,string][];

	let options = "";
	list.forEach(
		function(elem: [string,string]) {
			options += '<option id="' + elem[1] + '" value="' + elem[0] + '">';
		}
	);
	username_datalist.innerHTML = options;
}

async function submit_challenge_button_clicked(event: any) {
	
	let username_list_input = document.getElementById("username_list") as HTMLInputElement;
	const username = (document.querySelector('option[value="' + username_list_input.value + '"]') as HTMLOptionElement).id;

	// "query" the server
	const response = await fetch(
		"/challenge_send",
		{
			method: 'POST',
			body : JSON.stringify({ 'to' : username }),
			headers: { 'Content-type': 'application/json; charset=UTF-8' }
		}
	);

	const data = await response.json();
	if (data.r == "0") {
		alert(data.reason);
		return;
	}

	window.location.href = "/challenges";
}

async function accept_challenge_tag_clicked(event: any) {
	let tag_clicked = event.explicitOriginalTarget;
	let challenge_id = tag_clicked.id;

	const response = await fetch(
		"/challenge_accept",
		{
			method: 'POST',
			body: JSON.stringify({ 'challenge_id' : challenge_id }),
			headers: { 'Content-type': 'application/json; charset=UTF-8' }
		}
	);
	const data = await response.json();

	if (data.r == '1') {
		window.location.href = "/challenges";
	}
}

async function decline_challenge_tag_clicked(event: any) {
	let tag_clicked = event.explicitOriginalTarget;
	let challenge_id = tag_clicked.id;

	const response = await fetch(
		"/challenge_decline",
		{
			method: 'POST',
			body: JSON.stringify({ 'challenge_id' : challenge_id }),
			headers: { 'Content-type': 'application/json; charset=UTF-8' }
		}
	);
	const data = await response.json();

	if (data.r == '1') {
		window.location.href = "/challenges";
	}
}

async function fill_challenges_received_list() {
	const response = await fetch(
		"/query_challenges_received",
		{
			method: 'GET',
			headers: { 'Content-type': 'application/json; charset=UTF-8' }
		}
	);
	const data = await response.json();

	if (data.r == '0') {
		// something went wrong, do nothing
		return;
	}

	const challenge_data = data.c as any[];

	let challenge_list = document.createElement("ul") as HTMLUListElement;
	challenge_data.forEach(
		function (elem: any) {
			let li = document.createElement("li") as HTMLLIElement;
			li.appendChild(document.createTextNode(`Challenge sent by ${elem.sent_by}. Sent on ${elem.sent_when.replace('..', ' ')}. `));

			// add accept tag
			let accept_tag = document.createElement("a") as HTMLAnchorElement;
			accept_tag.id = elem.id;
			accept_tag.onclick = accept_challenge_tag_clicked;
			accept_tag.setAttribute('style', "color:blue;text-decoration:underline;cursor:pointer");
			accept_tag.textContent = "Accept.";
			li.appendChild(accept_tag);
			li.appendChild(document.createTextNode(" "));

			// add decline tag
			let decline_tag = document.createElement("a") as HTMLAnchorElement;
			decline_tag.id = elem.id;
			decline_tag.onclick = decline_challenge_tag_clicked;
			decline_tag.setAttribute('style', "color:blue;text-decoration:underline;cursor:pointer");
			decline_tag.textContent = "Decline.";
			li.appendChild(decline_tag);

			// append paragraph to element list
			challenge_list.appendChild(li);
			challenge_list.appendChild(document.createElement("br"));
		}
	);
	(document.getElementById("challenges_received_list") as HTMLDivElement).appendChild(challenge_list);
}

async function fill_challenges_sent_list() {
	const response = await fetch(
		"/query_challenges_sent",
		{
			method: 'GET',
			headers: { 'Content-type': 'application/json; charset=UTF-8' }
		}
	);
	const data = await response.json();

	if (data.r == '0') {
		// something went wrong, do nothing
		return;
	}

	const challenge_data = data.c as any[];

	let challenge_list = document.createElement("ul") as HTMLUListElement;
	challenge_data.forEach(
		function (elem: any) {
			let li = document.createElement("li") as HTMLLIElement;
			li.textContent = `Challenge sent to ${elem.sent_to}. Sent on ${elem.sent_when.replace('..', ' ')}.`;

			// append paragraph to element list
			challenge_list.appendChild(li);
			challenge_list.appendChild(document.createElement("br"));
		}
	);
	(document.getElementById("challenges_sent_list") as HTMLDivElement).appendChild(challenge_list);
}

async function fill_challenges_pending_set_result_list() {
	const response = await fetch(
		"/query_challenges_pending_set_result",
		{
			method: 'GET',
			headers: { 'Content-type': 'application/json; charset=UTF-8' }
		}
	);
	const data = await response.json();

	if (data.r == '0') {
		// something went wrong, do nothing
		return;
	}

	const challenge_data = data.c as any[];

	let challenge_list = document.createElement("ul") as HTMLUListElement;
	challenge_data.forEach(
		function (elem: any) {
			let li = document.createElement("li") as HTMLLIElement;
			li.textContent = `Challenge with ${elem.opponent}, sent on ${elem.sent_when.replace('..', ' ')}.`;

			// append paragraph to element list
			challenge_list.appendChild(li);
			challenge_list.appendChild(document.createElement("br"));

			// Who is the white player?
			{
			challenge_list.appendChild(document.createTextNode("White:"));
			challenge_list.appendChild(document.createTextNode(" "));
			let player_select = document.createElement("select");
			player_select.id = "white_select_" + elem.id;

				let option_1 = document.createElement("option");
				option_1.text = elem.sent_to_name;
				option_1.value = elem.sent_to_username;
				player_select.appendChild(option_1);
				let option_2 = document.createElement("option");
				option_2.text = elem.sent_by_name;
				option_2.value = elem.sent_by_username;
				player_select.appendChild(option_2);

			challenge_list.appendChild(player_select);
			challenge_list.appendChild(document.createTextNode("  "));
			}

			// Who is the black player?
			{
			challenge_list.appendChild(document.createTextNode("Black:"));
			challenge_list.appendChild(document.createTextNode(" "));
			let player_select = document.createElement("select");
			player_select.id = "black_select_" + elem.id;

				let option_1 = document.createElement("option");
				option_1.text = elem.sent_by_name;
				option_1.value = elem.sent_by_username;
				player_select.appendChild(option_1);
				let option_2 = document.createElement("option");
				option_2.text = elem.sent_to_name;
				option_2.value = elem.sent_to_username;
				player_select.appendChild(option_2);

			challenge_list.appendChild(player_select);
			challenge_list.appendChild(document.createTextNode("  "));
			}

			// Result of the game
			{
			challenge_list.appendChild(document.createTextNode("Result game:"));
			challenge_list.appendChild(document.createTextNode(" "));
			let result_select = document.createElement("select");
			result_select.id = "result_select_" + elem.id;

				let option_1 = document.createElement("option");
				option_1.text = "1 - 0";
				option_1.value = "white_wins";
				result_select.appendChild(option_1);
				let option_2 = document.createElement("option");
				option_2.text = "1/2 - 1/2";
				option_2.value = "draw";
				result_select.appendChild(option_2);
				let option_3 = document.createElement("option");
				option_3.text = "0 - 1";
				option_3.value = "black_wins";
				result_select.appendChild(option_3);

			challenge_list.appendChild(result_select);
			challenge_list.appendChild(document.createTextNode("  "));
			}

			challenge_list.appendChild(document.createElement("br"));
			challenge_list.appendChild(document.createElement("br"));

			// submit button
			{
			let submit_result_button_clicked = document.createElement("button");
			submit_result_button_clicked.textContent = "Submit result";
			submit_result_button_clicked.id = elem.id;
			submit_result_button_clicked.onclick = submit_result_challenge_button_clicked;
			challenge_list.appendChild(submit_result_button_clicked);
			}
			
			challenge_list.appendChild(document.createElement("br"));
			challenge_list.appendChild(document.createElement("br"));
		}
	);
	(document.getElementById("challenges_pending_result_set") as HTMLDivElement).appendChild(challenge_list);
}

async function submit_result_challenge_button_clicked(event: any) {
	let button_clicked = event.explicitOriginalTarget;
	let challenge_id = button_clicked.id;

	let white_select = document.getElementById("white_select_" + challenge_id) as HTMLSelectElement;
	let black_select = document.getElementById("black_select_" + challenge_id) as HTMLSelectElement;
	let result_select = document.getElementById("result_select_" + challenge_id) as HTMLSelectElement;

	let white_username = white_select.options[white_select.selectedIndex].value;
	let black_username = black_select.options[black_select.selectedIndex].value;
	let result = result_select.options[result_select.selectedIndex].value;

	// "query" the server
	const response = await fetch(
		"/challenge_set_result",
		{
			method: 'POST',
			body: JSON.stringify({
				'challenge_id' : challenge_id,
				'white' : white_username,
				'black' : black_username,
				'result' : result
			}),
			headers: { 'Content-type': 'application/json; charset=UTF-8' }
		}
	);

	const data = await response.json();
	if (data.r == '0') {
		alert(data.reason);
		return;
	}

	window.location.href = "/challenges";
}

async function fill_challenges_result_set_by_me_list() {
	const response = await fetch(
		"/query_challenges_result_set_by_me",
		{
			method: 'GET',
			headers: { 'Content-type': 'application/json; charset=UTF-8' }
		}
	);
	const data = await response.json();

	if (data.r == '0') {
		// something went wrong, do nothing
		return;
	}

	const challenge_data = data.c as any[];

	let challenge_list = document.createElement("ul") as HTMLUListElement;
	challenge_data.forEach(
		function (elem: any) {
			let li = document.createElement("li") as HTMLLIElement;
			li.textContent = `On ${elem.sent_when.replace('..', ' ')}. White: ${elem.white}. Black: ${elem.black}. Result: ${elem.result}`;

			// append paragraph to element list
			challenge_list.appendChild(li);
			challenge_list.appendChild(document.createElement("br"));
		}
	);
	(document.getElementById("challenges_result_set_by_me") as HTMLDivElement).appendChild(challenge_list);
}

async function fill_challenges_result_set_by_opponent_list() {
	const response = await fetch(
		"/query_challenges_result_set_by_opponent",
		{
			method: 'GET',
			headers: { 'Content-type': 'application/json; charset=UTF-8' }
		}
	);
	const data = await response.json();

	if (data.r == '0') {
		// something went wrong, do nothing
		return;
	}

	const challenge_data = data.c as any[];

	let challenge_list = document.createElement("ul") as HTMLUListElement;
	challenge_data.forEach(
		function (elem: any) {
			let li = document.createElement("li") as HTMLLIElement;
			li.textContent = `On ${elem.sent_when.replace('..', ' ')}. White: ${elem.white}. Black: ${elem.black}. Result: ${elem.result}. `;

			// add accept tag
			let accept_tag = document.createElement("a") as HTMLAnchorElement;
			accept_tag.id = elem.id;
			accept_tag.onclick = agree_challenge_result_tag_clicked;
			accept_tag.setAttribute('style', "color:blue;text-decoration:underline;cursor:pointer");
			accept_tag.textContent = "Agree.";
			li.appendChild(accept_tag);
			li.appendChild(document.createTextNode(" "));

			// add decline tag
			let decline_tag = document.createElement("a") as HTMLAnchorElement;
			decline_tag.id = elem.id;
			decline_tag.onclick = disagree_challenge_result_tag_clicked;
			decline_tag.setAttribute('style', "color:blue;text-decoration:underline;cursor:pointer");
			decline_tag.textContent = "Disagree.";
			li.appendChild(decline_tag);

			// append paragraph to element list
			challenge_list.appendChild(li);
			challenge_list.appendChild(document.createElement("br"));

			// append paragraph to element list
			challenge_list.appendChild(li);
			challenge_list.appendChild(document.createElement("br"));
		}
	);
	(document.getElementById("challenges_result_set_by_opponent") as HTMLDivElement).appendChild(challenge_list);
}

async function agree_challenge_result_tag_clicked(event: any) {
	let tag_clicked = event.explicitOriginalTarget;
	let challenge_id = tag_clicked.id;

	const response = await fetch(
		"/challenge_agree_result",
		{
			method: 'POST',
			body: JSON.stringify({ 'challenge_id' : challenge_id }),
			headers: { 'Content-type': 'application/json; charset=UTF-8' }
		}
	);
	const data = await response.json();

	if (data.r == '1') {
		window.location.href = "/challenges";
	}
}

async function disagree_challenge_result_tag_clicked(event: any) {
	let tag_clicked = event.explicitOriginalTarget;
	let challenge_id = tag_clicked.id;

	const response = await fetch(
		"/challenge_disagree_result",
		{
			method: 'POST',
			body: JSON.stringify({ 'challenge_id' : challenge_id }),
			headers: { 'Content-type': 'application/json; charset=UTF-8' }
		}
	);
	const data = await response.json();

	if (data.r == '1') {
		window.location.href = "/challenges";
	}
}

window.onload = function () {
	// fill in username dropdown with values
	fill_username_datalist();

	// link button 'submit_challenge' click behaviour
	let submit_challenge_button = document.getElementById("send_challenge_button") as HTMLButtonElement;
	submit_challenge_button.onclick = submit_challenge_button_clicked;

	// add list of challenges
	fill_challenges_received_list();
	fill_challenges_sent_list();
	fill_challenges_pending_set_result_list();
	fill_challenges_result_set_by_me_list();
	fill_challenges_result_set_by_opponent_list();
}
