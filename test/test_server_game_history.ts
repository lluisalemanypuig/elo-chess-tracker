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

import { Game } from '../ts-source/models/game';
import { User } from '../ts-source/models/user';
import { ServerMemory } from '../ts-source/server/configuration';
import { server_initialize_from_data } from '../ts-source/server/initialization';
import { game_insert_in_history } from '../ts-source/server/game_history';
import { user_retrieve } from '../ts-source/server/users';

const prompt = require('prompt-sync')();

server_initialize_from_data(
	{
		"base_directory" : "/home/lluis/Documents/projects/elo-chess-tracker/test/database",
		"rating_system" : "Elo"
	}
);

let mem = ServerMemory.get_instance();

let jn1 = (user_retrieve("anatoly.karpov") as User).clone();
let al1 = (user_retrieve("vasily.smyslov") as User).clone();
let jn2 = (user_retrieve("anatoly.karpov") as User).clone();
let al2 = (user_retrieve("vasily.smyslov") as User).clone();

let a = prompt("Add 1st game:");
console.log("Adding the first game with date '2022-12-15..18:00:00'")

{
	let game = new Game(
		"1",
		(user_retrieve("emanuel.lasker") as User).as_player(),
		(user_retrieve("magnus.carlsen") as User).as_player(),
		'black_wins',
		'classical',
		'2022-12-15..18:00:00'
	);
	game_insert_in_history(game);
}

for (let i = 0; i < mem.users.length; ++i) {
	console.log(mem.users[i]);
}
a = prompt("Add 2nd game:");
console.log("Adding the first game with date '2022-12-16..18:00:00'")

{
	let game = new Game(
		"2",
		(user_retrieve("bobby.fischer") as User).as_player(),
		(user_retrieve("mikhail.botvinnik") as User).as_player(),
		'black_wins',
		'classical',
		'2022-12-16..18:00:00'
	);
	game_insert_in_history(game);
}

for (let i = 0; i < mem.users.length; ++i) {
	console.log(mem.users[i]);
}
prompt("Add 3rd game:");
console.log("Adding the second game with date '2022-12-14..18:00:00'")

{
	let game = new Game(
		"3",
		jn2.as_player(),
		al2.as_player(),
		'black_wins',
		'classical',
		'2022-12-14..18:00:00'
	);
	game_insert_in_history(game);
}

for (let i = 0; i < mem.users.length; ++i) {
	console.log(mem.users[i]);
}
prompt("Add 4th game:");
console.log("Adding the second game with date '2022-12-14..16:00:00'")

{
	let game = new Game(
		"4",
		jn1.as_player(),
		al1.as_player(),
		'white_wins',
		'classical',
		'2022-12-14..16:00:00'
	);
	game_insert_in_history(game);
}
