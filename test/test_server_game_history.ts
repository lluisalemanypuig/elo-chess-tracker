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
import { server_initialize_from_configuration_file } from '../ts-source/server/initialization';
import { game_add } from '../ts-source/server/game_history';
import { user_retrieve } from '../ts-source/server/users';

const prompt = require('prompt-sync')();

server_initialize_from_configuration_file("system_configuration_test.json");

function dump_memory() {
	let mem = ServerMemory.get_instance();
	console.log("==================================");
	for (let i = 0; i < mem.users.length; ++i) {
		console.log("----------------------------------");
		console.log(mem.users[i]);
	}
}

let jn1 = (user_retrieve("anatoly.karpov") as User).clone();
let al1 = (user_retrieve("vasily.smyslov") as User).clone();
let jn2 = (user_retrieve("anatoly.karpov") as User).clone();
let al2 = (user_retrieve("vasily.smyslov") as User).clone();

///////////////////////////////////////////////////////////
prompt("Add 1st game:");
console.log("Adding the first game with date '2022-12-15..18:00:00'")

{
	let game = new Game(
		"1",
		"emanuel.lasker", (user_retrieve("emanuel.lasker") as User).get_rating("Classical"),
		"magnus.carlsen", (user_retrieve("magnus.carlsen") as User).get_rating("Classical"),
		'black_wins',
		'Classical',
		'Classical (90 + 30)',
		'2022-12-15..18:00:00'
	);
	game_add(game);
}

dump_memory();

///////////////////////////////////////////////////////////
prompt("Add 2nd game:");
console.log("Adding game with date '2022-12-16..18:00:00'")

{
	let game = new Game(
		"2",
		"bobby.fischer", (user_retrieve("bobby.fischer") as User).get_rating("Classical"),
		"mikhail.botvinnik", (user_retrieve("mikhail.botvinnik") as User).get_rating("Classical"),
		'black_wins',
		'Classical',
		'Classical (90 + 30)',
		'2022-12-16..18:00:00'
	);
	game_add(game);
}

dump_memory();

///////////////////////////////////////////////////////////
prompt("Add 3rd game:");
console.log("Adding game with date '2022-12-14..18:00:00'")

{
	let game = new Game(
		"3",
		jn2.get_username(), jn2.get_rating("Classical"),
		al2.get_username(), al2.get_rating("Classical"),
		'black_wins',
		'Classical',
		'Classical (90 + 30)',
		'2022-12-14..18:00:00'
	);
	game_add(game);
}

dump_memory();

///////////////////////////////////////////////////////////
prompt("Add 4th game:");
console.log("Adding game with date '2022-12-14..16:00:00'")

{
	let game = new Game(
		"4",
		jn1.get_username(), jn1.get_rating("Classical"),
		al1.get_username(), al1.get_rating("Classical"),
		'white_wins',
		'Classical',
		'Classical (90 + 30)',
		'2022-12-14..16:00:00'
	);
	game_add(game);
}

dump_memory();

///////////////////////////////////////////////////////////
prompt("Add 5th game:");
console.log("Adding game with date '2022-12-13..12:00:00'")

{
	let game = new Game(
		"5",
		"emanuel.lasker", (user_retrieve("emanuel.lasker") as User).get_rating("Classical"),
		"magnus.carlsen", (user_retrieve("magnus.carlsen") as User).get_rating("Classical"),
		'white_wins',
		'Classical',
		'Classical (90 + 30)',
		'2022-12-13..12:00:00'
	);
	game_add(game);
}
