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

import { Game } from "../ts-source/models/game";
import { Player } from "../ts-source/models/player";
import { Rating } from "../ts-source/models/rating";
import { game_from_json } from "../ts-source/models/game";
import { test_player_vs_player } from "../ts-source/rating_system/test_system";

function Test1() {
	console.log("==========");
	console.log("= Test 1 =");
	console.log("==========");

	let p1: Player = new Player("p1", new Rating(1500, 0, 50));
	let p2: Player = new Player("p2", new Rating(1500, 0, 50));

	console.log(p1);
	console.log(p2);

	let [after_p1, after_p2] = test_player_vs_player(new Game("0", p1, p2, "white_wins", "classical", "2022-12-18"));

	console.log(after_p1);
	console.log(after_p2);
}

function Test2() {
	console.log("==========");
	console.log("= Test 2 =");
	console.log("==========");

	let p1: Player = new Player("p1", new Rating(1500, 0, 50));
	let p2: Player = new Player("p2", new Rating(1500, 0, 50));

	console.log(p1);
	console.log(p2);

	let [after_p1, after_p2] = test_player_vs_player(new Game("1", p1, p2, "draw", "classical", "2022-12-18"));

	console.log(after_p1);
	console.log(after_p2);
}

function Test3() {
	console.log("==========");
	console.log("= Test 3 =");
	console.log("==========");

	let p1: Player = new Player("p1", new Rating(1500, 0, 50));
	let p2: Player = new Player("p2", new Rating(1500, 0, 50));

	console.log(p1);
	console.log(p2);

	let [after_p1, after_p2] = test_player_vs_player(new Game("2", p1, p2, "black_wins", "classical", "2022-12-18"));

	console.log(after_p1);
	console.log(after_p2);
}

function Test4() {
	console.log("===============================");
	console.log("= Test 4 -- Black always wins =");
	console.log("===============================");

	let p1: Player = new Player("p1", new Rating(1500, 0, 50));
	let p2: Player = new Player("p2", new Rating(1500, 0, 50));

	for (let i: number = 0; i < 10; ++i) {
		console.log("Rating p1:", p1.get_classical_rating());
		console.log("Rating p2:", p2.get_classical_rating());

		let [after_p1, after_p2] = test_player_vs_player(new Game("3", p1, p2, "black_wins", "classical", "2022-12-18"));

		p1 = after_p1;
		p2 = after_p2;
	}
}

function Test5() {
	console.log("===============================");
	console.log("= Test 5 -- White always wins =");
	console.log("===============================");

	let p1: Player = new Player("p1", new Rating(1500, 0, 50));
	let p2: Player = new Player("p2", new Rating(1500, 0, 50));

	for (let i: number = 0; i < 10; ++i) {
		console.log("Rating p1:", p1.get_classical_rating());
		console.log("Rating p2:", p2.get_classical_rating());

		let [after_p1, after_p2] = test_player_vs_player(new Game("4", p1, p2, "white_wins", "classical", "2022-12-18"));

		p1 = after_p1;
		p2 = after_p2;
	}
}

function Test6() {
	console.log("===========================");
	console.log("= Test 6 -- Always a draw =");
	console.log("===========================");

	let p1: Player = new Player("p1", new Rating(1500, 0, 50));
	let p2: Player = new Player("p2", new Rating(1500, 0, 50));

	for (let i: number = 0; i < 10; ++i) {
		console.log("Rating p1:", p1.get_classical_rating());
		console.log("Rating p2:", p2.get_classical_rating());

		let [after_p1, after_p2] = test_player_vs_player(new Game("5", p1, p2, "draw", "classical", "2022-12-18"));

		p1 = after_p1;
		p2 = after_p2;
	}
}

function Playground(): void {
	console.log("==============");
	console.log("= Playground =");
	console.log("==============");

	let p1: Player = new Player("p1", new Rating(1500, 0, 40));
	let p2: Player = new Player("p2", new Rating(1500, 0, 40));

	console.log(p1);
	console.log(p2);

	let [after_p1, after_p2] =
		test_player_vs_player(
			new Game(
				"6",
				p1, p2,
				"draw",
				"classical",
				"2022-12-18"
			)
		);

	console.log(after_p1);
	console.log(after_p2);
}

function Test7() {
	console.log("==========");
	console.log("= Test 7 =");
	console.log("==========");

	let game1 = game_from_json(
		'{\
            "white" : {\
                "username" : "albert.einstein",\
                "classical" : {\
                    "rating" : 1500,\
                    "num_games" : 0,\
                    "K" : 40\
                }\
            },\
            "black" : {\
                "username" : "john.nash",\
                "classical" : {\
                    "rating" : 1500,\
                    "num_games" : 0,\
                    "K" : 40\
                }\
            },\
            "result" : "draw",\
            "game_type" : "classical",\
            "when" : "2022-12-10..18:00:00"\
        }'
	);

	let game2 = game_from_json(
		'{\
            "white" : {\
                "username" : "jordi.arca.canalejo",\
                "classical" : {\
                    "rating" : 1500,\
                    "num_games" : 0,\
                    "K" : 40\
                }\
            },\
            "black" : {\
                "username" : "alexandre.sanahuja.palomo",\
                "classical" : {\
                    "rating" : 1500,\
                    "num_games" : 0,\
                    "K" : 40\
                }\
            },\
            "result" : "draw",\
            "game_type" : "classical",\
            "when" : "2022-12-10..18:30:00"\
        }'
	);

	let [p1, p2] = test_player_vs_player(game1);
	let [p3, p4] = test_player_vs_player(game2);

	console.log(p1);
	console.log(p2);
	console.log(p3);
	console.log(p4);
}

function Test8() {
	console.log("==========");
	console.log("= Test 8 =");
	console.log("==========");

	let game1 = game_from_json(
		'{\
            "white" : {\
                "username" : "lluis.alemany.puig",\
                "classical" : {\
                    "rating" : 1498.75,\
                    "num_games" : 1,\
                    "K" : 40\
                }\
            },\
            "black" : {\
                "username" : "alexandre.sanahuja.palomo",\
                "classical" : {\
                    "rating" : 1501.25,\
                    "num_games" : 1,\
                    "K" : 40\
                }\
            },\
            "result" : "black_wins",\
            "game_type" : "classical",\
            "when" : "2022-12-18..18:00:00"\
        }'
	);

	let game2 = game_from_json(
		'{\
            "white" : {\
                "username" : "jordi.arca.canalejo",\
                "classical" : {\
                    "rating" : 1498.75,\
                    "num_games" : 1,\
                    "K" : 40\
                }\
            },\
            "black" : {\
                "username" : "toni.sobrepera.llovera",\
                "classical" : {\
                    "rating" : 1501.25,\
                    "num_games" : 1,\
                    "K" : 40\
                }\
            },\
            "result" : "white_wins",\
            "game_type" : "classical",\
            "when" : "2022-12-18..18:30:00"\
        }'
	);

	let [p1, p2] = test_player_vs_player(game1);
	let [p3, p4] = test_player_vs_player(game2);

	console.log(p1);
	console.log(p2);
	console.log(p3);
	console.log(p4);
}

function Test9() {
	console.log("==========");
	console.log("= Test 9 =");
	console.log("==========");

	let game1 = game_from_json(
		'{\
            "white" : {\
                "username" : "lluis.alemany.puig",\
                "classical" : {\
                    "rating" : 1502.5,\
                    "num_games" : 1,\
                    "K" : 40\
                }\
            },\
            "black" : {\
                "username" : "jordi.arca.canalejo",\
                "classical" : {\
                    "rating" : 1497.5,\
                    "num_games" : 1,\
                    "K" : 40\
                }\
            },\
            "result" : "black_wins",\
            "game_type" : "classical",\
            "when" : "2022-12-14..18:00:00"\
        }'
	);

	let [p1, p2] = test_player_vs_player(game1);

	console.log(p1);
	console.log(p2);
}

Playground();
Test1();
Test2();
Test3();
Test4();
Test5();
Test6();
Test7();
Test8();
Test9();