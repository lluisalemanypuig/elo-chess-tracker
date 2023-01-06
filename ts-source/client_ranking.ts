window.onload = async function () {

	let new_cell = function(text: string) {
		let cell = document.createElement("td");
		cell.innerHTML = text;
		return cell;
	}

	// "query" the server
	const response = await fetch(
		"/query_ranking_users",
		{
			method: 'GET',
			headers: { 'Content-type': 'application/json; charset=UTF-8' }
		}
	);

	const data = await response.json();
	if (data.r == '0') {
		return;
	}

	const users = data.users as any[];

	let table = document.getElementById("users_table") as HTMLTableElement;
    let tbody = table.getElementsByTagName("tbody")[0];

	for (var i = 0; i < users.length; i++) {
		let row = document.createElement("tr");

		row.appendChild(new_cell(users[i].name));
		row.appendChild(new_cell(users[i].elo));
		row.appendChild(new_cell(users[i].total_games));
		row.appendChild(new_cell(users[i].won));
		row.appendChild(new_cell(users[i].drawn));
		row.appendChild(new_cell(users[i].lost));

		tbody.appendChild(row);
	}
}