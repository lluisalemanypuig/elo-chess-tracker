window.onload = async function () {

	const new_cell = function(text: string) {
		let cell = document.createElement("td");
		cell.innerHTML = text;
		return cell;
	}

	// "query" the server
	const response = await fetch(
		"/query_games_all",
		{
			method: 'GET',
			headers: { 'Content-type': 'application/json; charset=UTF-8' }
		}
	);

	const data = await response.json();
	if (data.r == '0') {
		return;
	}

	const games = data.games as any[];

	let table = document.getElementById("games_table") as HTMLTableElement;
    let tbody = table.getElementsByTagName("tbody")[0];

	for (var i = 0; i < games.length; i++) {
		let row = document.createElement("tr");

		row.appendChild(new_cell(games[i].white));
		row.appendChild(new_cell(games[i].black));
		row.appendChild(new_cell(games[i].result));
		row.appendChild(new_cell(games[i].time_control));
		row.appendChild(new_cell(games[i].date));
		row.appendChild(new_cell(games[i].white_rating));
		row.appendChild(new_cell(games[i].white_increment));
		row.appendChild(new_cell(games[i].black_rating));
		row.appendChild(new_cell(games[i].black_increment));

		tbody.appendChild(row);
	}
}