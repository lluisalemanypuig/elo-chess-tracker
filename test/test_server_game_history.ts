/*
Elo rating for a Chess Club
Copyright (C) 2023 - 2024  Lluís Alemany Puig

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

import { ServerMemory } from '../ts-source/server/configuration';
import { server_initialize_from_configuration_file } from '../ts-source/server/initialization';
import { game_add, game_edit_result, game_new } from '../ts-source/server/game_history';

const prompt = require('prompt-sync')();

server_initialize_from_configuration_file('configuration_test.json');

function dump_memory() {
	const memory = ServerMemory.get_instance();
	console.log('==================================');
	console.log('Users');
	for (let i = 0; i < memory.users.length; ++i) {
		console.log('----------------------------------');
		console.log(memory.users[i]);
	}
	console.log('==================================');
	console.log('Game IDs to record files');
	memory.game_id_to_record_file.forEach((record: string, id: string) => {
		console.log(`ID '${id}' -> '${record}'`);
	});
}

const karpov = 'anatoly.karpov';
const fischer = 'bobby.fischer';
const lasker = 'emanuel.lasker';
const carlsen = 'magnus.carlsen';
const botvinnik = 'mikhail.botvinnik';
const smyslov = 'vasily.smyslov';

function test1(): void {
	///////////////////////////////////////////////////////////
	prompt('Add 1st game:');
	console.log("Adding the first game with date '2022-12-15..18:00:00'");

	let id_game_1: string;
	{
		let game = game_new(lasker, carlsen, 'black_wins', 'Classical', 'Classical (90 + 30)', '2022-12-15..18:00:00');
		id_game_1 = game.get_id();
		game_add(game);
	}

	dump_memory();

	///////////////////////////////////////////////////////////
	prompt('Add 2nd game:');
	console.log("Adding game with date '2022-12-16..18:00:00'");

	let id_game_2: string;
	{
		let game = game_new(
			fischer,
			botvinnik,
			'black_wins',
			'Classical',
			'Classical (90 + 30)',
			'2022-12-16..18:00:00'
		);
		id_game_2 = game.get_id();
		game_add(game);
	}

	dump_memory();

	///////////////////////////////////////////////////////////
	prompt('Add 3rd game:');
	console.log("Adding game with date '2022-12-14..18:00:00'");

	let id_game_3: string;
	{
		let game = game_new(karpov, smyslov, 'black_wins', 'Classical', 'Classical (90 + 30)', '2022-12-14..18:00:00');
		id_game_3 = game.get_id();
		game_add(game);
	}

	dump_memory();

	///////////////////////////////////////////////////////////
	prompt('Add 4th game:');
	console.log("Adding game with date '2022-12-14..16:00:00'");

	let id_game_4: string;
	{
		let game = game_new(karpov, smyslov, 'white_wins', 'Classical', 'Classical (90 + 30)', '2022-12-14..16:00:00');
		id_game_4 = game.get_id();
		game_add(game);
	}

	dump_memory();

	///////////////////////////////////////////////////////////
	prompt('Add 5th game:');
	console.log("Adding game with date '2022-12-13..12:00:00'");

	let id_game_5: string;
	{
		let game = game_new(lasker, carlsen, 'white_wins', 'Classical', 'Classical (90 + 30)', '2022-12-13..12:00:00');
		id_game_5 = game.get_id();
		game_add(game);
	}

	dump_memory();

	///////////////////////////////////////////////////////////
	prompt('Add 6th game:');
	console.log("Adding game with date '2022-12-13..12:00:00'");

	let id_game_6: string;
	{
		let game = game_new(
			botvinnik,
			fischer,
			'white_wins',
			'Classical',
			'Classical (90 + 30)',
			'2022-12-16..12:00:00'
		);
		id_game_6 = game.get_id();
		game_add(game);
	}

	dump_memory();

	///////////////////////////////////////////////////////////
	prompt('Edit 5th game:');
	console.log('Editing 5th game');

	game_edit_result(id_game_5, 'black_wins');

	dump_memory();
}

function test2(): void {
	///////////////////////////////////////////////////////////
	prompt('Add 1st game:');

	let id_game_1: string;
	{
		let game = game_new(karpov, fischer, 'white_wins', 'Classical', 'Classical (90 + 30)', '2023-08-01..12:00:00');
		id_game_1 = game.get_id();
		game_add(game);
	}

	dump_memory();

	///////////////////////////////////////////////////////////
	prompt('Add 2nd game:');

	let id_game_2: string;
	{
		let game = game_new(fischer, karpov, 'black_wins', 'Classical', 'Classical (90 + 30)', '2023-08-01..18:00:00');
		id_game_2 = game.get_id();
		game_add(game);
	}

	dump_memory();

	///////////////////////////////////////////////////////////
	prompt('Add 3rd game:');

	let id_game_3: string;
	{
		let game = game_new(lasker, carlsen, 'white_wins', 'Classical', 'Classical (90 + 30)', '2023-08-02..12:00:00');
		id_game_3 = game.get_id();
		game_add(game);
	}

	dump_memory();

	///////////////////////////////////////////////////////////
	prompt('Add 4th game:');

	let id_game_4: string;
	{
		let game = game_new(karpov, fischer, 'white_wins', 'Classical', 'Classical (90 + 30)', '2023-08-03..12:00:00');
		id_game_4 = game.get_id();
		game_add(game);
	}

	dump_memory();

	///////////////////////////////////////////////////////////
	prompt('Add 5th game:');

	let id_game_5: string;
	{
		let game = game_new(fischer, karpov, 'draw', 'Classical', 'Classical (90 + 30)', '2023-08-03..18:00:00');
		id_game_5 = game.get_id();
		game_add(game);
	}

	dump_memory();

	///////////////////////////////////////////////////////////
	prompt('Edit 3rd game:');

	game_edit_result(id_game_3, 'black_wins');

	dump_memory();
}

//test1();
test2();
