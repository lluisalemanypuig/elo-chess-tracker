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

import { Game } from '../ts-source/models/game';
import { game_from_json } from '../ts-source/models/game';
import { player_vs_player } from '../ts-source/rating_system/Elo/formula';
import { EloRating } from '../ts-source/rating_system/Elo/rating';
import { server_initialize_from_configuration_file } from '../ts-source/server/initialization';

server_initialize_from_configuration_file('configuration.json');

function Test1() {
	console.log('==========');
	console.log('= Test 1 =');
	console.log('==========');

	let p1: EloRating = new EloRating(1500, 0, 0, 0, 0, 40);
	let p2: EloRating = new EloRating(1500, 0, 0, 0, 0, 40);

	console.log(p1);
	console.log(p2);

	let [after_p1, after_p2] = player_vs_player(
		new Game('0', 'p1', p1, 'p2', p2, 'white_wins', 'classical_90_30', 'Classical', '2022-12-18')
	);

	console.log(after_p1);
	console.log(after_p2);
}

function Test2() {
	console.log('==========');
	console.log('= Test 2 =');
	console.log('==========');

	let p1: EloRating = new EloRating(1500, 0, 0, 0, 0, 40);
	let p2: EloRating = new EloRating(1500, 0, 0, 0, 0, 40);

	console.log(p1);
	console.log(p2);

	let [after_p1, after_p2] = player_vs_player(
		new Game('0', 'p1', p1, 'p2', p2, 'draw', 'classical_90_30', 'Classical', '2022-12-18')
	);

	console.log(after_p1);
	console.log(after_p2);
}

function Test3() {
	console.log('==========');
	console.log('= Test 3 =');
	console.log('==========');

	let p1: EloRating = new EloRating(1500, 0, 0, 0, 0, 40);
	let p2: EloRating = new EloRating(1500, 0, 0, 0, 0, 40);

	console.log(p1);
	console.log(p2);

	let [after_p1, after_p2] = player_vs_player(
		new Game('0', 'p1', p1, 'p2', p2, 'black_wins', 'classical_90_30', 'Classical', '2022-12-18')
	);

	console.log(after_p1);
	console.log(after_p2);
}

function Test4() {
	console.log('===============================');
	console.log('= Test 4 -- Black always wins =');
	console.log('===============================');

	let p1: EloRating = new EloRating(1500, 0, 0, 0, 0, 40);
	let p2: EloRating = new EloRating(1500, 0, 0, 0, 0, 40);

	for (let i: number = 0; i < 10; ++i) {
		console.log('Rating p1:', p1);
		console.log('Rating p2:', p2);

		let [after_p1, after_p2] = player_vs_player(
			new Game('0', 'p1', p1, 'p2', p2, 'black_wins', 'classical_90_30', 'Classical', '2022-12-18')
		);

		p1 = after_p1;
		p2 = after_p2;
	}
}

function Test5() {
	console.log('===============================');
	console.log('= Test 5 -- White always wins =');
	console.log('===============================');

	let p1: EloRating = new EloRating(1500, 0, 0, 0, 0, 40);
	let p2: EloRating = new EloRating(1500, 0, 0, 0, 0, 40);

	for (let i: number = 0; i < 10; ++i) {
		console.log('Rating p1:', p1);
		console.log('Rating p2:', p2);

		let [after_p1, after_p2] = player_vs_player(
			new Game('0', 'p1', p1, 'p2', p2, 'white_wins', 'classical_90_30', 'Classical', '2022-12-18')
		);

		p1 = after_p1;
		p2 = after_p2;
	}
}

function Test6() {
	console.log('===========================');
	console.log('= Test 6 -- Always a draw =');
	console.log('===========================');

	let p1: EloRating = new EloRating(1500, 0, 0, 0, 0, 40);
	let p2: EloRating = new EloRating(1500, 0, 0, 0, 0, 40);

	for (let i: number = 0; i < 10; ++i) {
		console.log('Rating p1:', p1);
		console.log('Rating p2:', p2);

		let [after_p1, after_p2] = player_vs_player(
			new Game('0', 'p1', p1, 'p2', p2, 'draw', 'classical_90_30', 'Classical', '2022-12-18')
		);

		p1 = after_p1;
		p2 = after_p2;
	}
}

function Test7() {
	console.log('==========');
	console.log('= Test 7 =');
	console.log('==========');

	let game1 = game_from_json(
		'{\
			"id" : "0",\
            "white" : "vasily.smyslov",\
			"white_rating" : {\
				"rating" : 1500,\
				"num_games" : 0, "won" : 0, "drawn" : 0, "lost" : 0,\
				"K" : 40\
			},\
            "black" : "bobby.fischer",\
			"black_rating" : {\
				"rating" : 1500,\
				"num_games" : 0, "won" : 0, "drawn" : 0, "lost" : 0,\
				"K" : 40\
			},\
            "result" : "white_wins",\
			"time_control" : "classical",\
            "game_type" : "classical",\
            "when" : "2022-12-10..18:00:00"\
        }'
	);

	let game2 = game_from_json(
		'{\
			"id" : "1",\
            "white" : "bobby.fischer",\
			"white_rating" : {\
				"rating" : 1480,\
				"num_games" : 1, "won" : 0, "drawn" : 0, "lost" : 1,\
				"K" : 40\
			},\
            "black" : "vasily.smyslov",\
			"black_rating" : {\
				"rating" : 1520,\
				"num_games" : 1, "won" : 1, "drawn" : 0, "lost" : 0,\
				"K" : 40\
			},\
            "result" : "black_wins",\
			"time_control" : "classical",\
            "game_type" : "classical",\
            "when" : "2022-12-10..20:00:00"\
        }'
	);

	let [p1, p2] = player_vs_player(game1);
	let [p3, p4] = player_vs_player(game2);

	console.log(p1);
	console.log(p2);
	console.log(p3);
	console.log(p4);
}

Test1();
Test2();
Test3();
Test4();
Test5();
Test6();
Test7();
