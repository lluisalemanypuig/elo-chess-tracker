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
import { game_add, game_new } from '../ts-source/server/game_history';
import { user_retrieve } from '../ts-source/server/users';

const prompt = require('prompt-sync')();

server_initialize_from_configuration_file("system_configuration_test.json");

function dump_memory() {
	const memory = ServerMemory.get_instance();
	console.log("==================================");
	console.log("Users");
	for (let i = 0; i < memory.users.length; ++i) {
		console.log("----------------------------------");
		console.log(memory.users[i]);
	}
	console.log("==================================");
	console.log("Game IDs to record files");
	memory.game_id_to_record_file.forEach(
		(record: string, id: string) => {
			console.log(`ID '${id}' -> '${record}'`);
		}
	);
}

const karpov = "anatoly.karpov";
const fischer = "bobby.fischer";
const lasker = "emanuel.lasker";
const carlsen = "magnus.carlsen";
const botvinnik = "mikhail.botvinnik";
const smyslov = "vasily.smyslov";

///////////////////////////////////////////////////////////
prompt("Add 1st game:");
console.log("Adding the first game with date '2022-12-15..18:00:00'")

{
	let game = game_new(
		lasker, carlsen, 'black_wins',
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
	let game = game_new(
		fischer, botvinnik, 'black_wins',
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
	let game = game_new(
		karpov, smyslov, 'black_wins',
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
	let game = game_new(
		karpov, smyslov, 'white_wins',
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
	let game = game_new(
		lasker, carlsen, 'white_wins',
		'Classical',
		'Classical (90 + 30)',
		'2022-12-13..12:00:00'
	);
	game_add(game);
}

dump_memory();
