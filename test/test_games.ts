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

import { game_from_json, game_set_from_json } from "../ts-source/models/game";
import { server_initialize_from_configuration_file } from "../ts-source/server/initialization";

server_initialize_from_configuration_file("system_configuration.json");

function Test1() {
	console.log("==========");
	console.log("  Test 1  ");
	console.log("==========");

	let game = game_from_json(
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
			"time_control" : "Classical",\
			"result" : "black_wins",\
			"type" : "classical",\
			"when" : "2022-12-15..18:00:00"\
		}'
	);

	console.log(game);
}

function Test2() {
	console.log("==========");
	console.log("  Test 2  ");
	console.log("==========");

	let game = game_set_from_json(
		'[{\
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
			"time_control" : "Classical",\
			"result" : "black_wins",\
			"type" : "classical",\
			"when" : "2022-12-15..18:00:00"\
		}]'
	);

	console.log(game);
}

Test1();
Test2();
