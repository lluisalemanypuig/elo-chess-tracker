function new_cell(text: string) {
	let cell = document.createElement("td");
	cell.innerHTML = text;
	return cell;
}

window.onload = async function () {
	// "query" the server
	const response = await fetch(
		"/query_games_own",
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

		let result: string;
		if (games[i].result == 'white_wins') {
			result = "1 - 0";
		}
		else if (games[i].result == 'black_wins') {
			result = "0 - 1";
		}
		else {
			result = "1/2 - 1/2"
		}
		
		row.appendChild(new_cell(games[i].white));
		row.appendChild(new_cell(games[i].black));
		row.appendChild(new_cell(result));
		row.appendChild(new_cell(games[i].date.replace('..', ' ')));
		row.appendChild(new_cell(games[i].type));
		row.appendChild(new_cell(games[i].white_Elo));
		row.appendChild(new_cell(games[i].white_Elo_increment));
		row.appendChild(new_cell(games[i].black_Elo));
		row.appendChild(new_cell(games[i].black_Elo_increment));

		tbody.appendChild(row);
	}
}