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

import { Rating } from '../ts-source/models/rating';
import { Player, player_from_json, player_set_from_json } from '../ts-source/models/player';
import { User, user_from_json, user_set_from_json } from '../ts-source/models/user';
import { Password } from '../ts-source/models/password';

function Test_Player() {
	console.log("======================================");
	console.log("Creating, storing and reading a player");
	console.log("======================================");

	let p1: Player = new Player("p1", new Rating(1500, 0, 40));
	console.log(p1);

	console.log("Convert a player to JSON string");
	let json_str = JSON.stringify(p1);
	console.log(json_str);

	console.log("Parse a player from a JSON string");
	let json_string: string =
		'{\
			"username" : "p1",\
			"classical" : {\
				"rating" : 1500,\
				"num_games" : 0,\
				"K" : 40\
			}\
		}';
	let json_parse = JSON.parse(json_string);
	console.log(typeof (json_parse));
	console.log(json_parse);

	let px = player_from_json(json_string);
	console.log(px);

	let json_string2: string =
		'[\
			{\
				"username" : "p1",\
				"classical" : {\
					"rating" : 1500,\
					"num_games" : 0,\
					"K" : 88\
				}\
			},\
			{\
				"username" : "p1",\
				"classical" : {\
					"rating" : 1700,\
					"num_games" : 50,\
					"K" : 12\
				}\
			}\
		]';
	let set_players: Player[] = player_set_from_json(json_string2);
	console.log(set_players);
	}

function Test_User() {
	console.log("============================================");
	console.log("Creating, storing and reading a named player");
	console.log("============================================");

	let p1: User = new User(
		"p1",
		"Perico", "de los Palotes",
		new Password("caca", "iv"),
		["admin"],
		new Rating(1500, 0, 40)
	);
	console.log(p1);

	console.log("Convert a player to JSON string");
	let json_str = JSON.stringify(p1);
	console.log(json_str);

	console.log("Parse a player from a JSON string");
	let json_string: string =
		'{\
			"username" : "p1",\
			"first_name" : "Perico",\
			"last_name" : "de los Palotes",\
			"password" : {\
				"encrypted" : "asdf",\
				"iv" : "234"\
			},\
			"role" : ["member"],\
			"classical" : {\
				"rating" : 1500,\
				"num_games" : 0,\
				"K" : 34\
			}\
		}';
	let json_parse = JSON.parse(json_string);
	console.log(typeof (json_parse));
	console.log(json_parse);

	let px = user_from_json(json_string);
	console.log(px);

	let json_string2: string =
		'[\
			{\
				"username" : "p1",\
				"first_name" : "Perico",\
				"last_name" : "de los Palotes",\
				"password" : {\
					"encrypted" : "asdf",\
					"iv" : "234"\
				},\
				"role" : ["member"],\
				"classical" : {\
					"rating" : 1500,\
					"num_games" : 0,\
					"K" : 77\
				}\
			},\
			{\
				"username" : "p1",\
				"first_name" : "Perico",\
				"last_name" : "de los Palotes",\
				"password" : {\
					"encrypted" : "asdf",\
					"iv" : "234"\
				},\
				"role" : ["member"],\
				"classical" : {\
					"rating" : 1700,\
					"num_games" : 50,\
					"K" : 65\
				}\
			}\
		]';

	let set_players: User[] = user_set_from_json(json_string2);
	console.log(set_players);
}

Test_Player();
Test_User();
