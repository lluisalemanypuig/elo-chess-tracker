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

import { Player, player_from_json, player_set_from_json } from '../ts-source/models/player';
import { User, user_from_json, user_set_from_json } from '../ts-source/models/user';
import { Password } from '../ts-source/models/password';
import { server_initialize_from_configuration_file } from '../ts-source/server/initialization';
import { EloRating } from '../ts-source/rating_system/Elo/rating';
import { TimeControlRating } from '../ts-source/models/time_control_rating';

server_initialize_from_configuration_file("system_configuration.json");

function flatten(obj: Object): Object {
    var result = Object.create(obj);
    for(var key in result) {
        result[key] = result[key];
    }
    return result;
}

const list_ratings: TimeControlRating[] = [
	new TimeControlRating("Classical", new EloRating(1500, 0,0,0,0, 40)),
	new TimeControlRating("Blitz", new EloRating(1500, 0,0,0,0, 40))
];

function Test_Player() {
	console.log("======================================");
	console.log("Creating, storing and reading a player");
	console.log("======================================");

	console.log("------------------------------------------");
	console.log("(1)");
	let p1: Player = new Player("p1", list_ratings);
	console.log(p1);

	console.log("------------------------------------------");
	console.log("(2)");
	console.log("Convert a player to JSON string");
	console.log(JSON.stringify(flatten(p1)));

	console.log("------------------------------------------");
	console.log("(3)");
	console.log("Parse a player from a JSON string");
	let json_string: string =
		'{\
			"username" : "p1",\
			"ratings" : [\
				{\
					"time_control" : "Classical",\
					"rating" : {\
						"rating" : 1500,\
						"num_games" : 0, "won" : 0, "drawn" : 0, "lost" : 0,\
						"K" : 40\
					}\
				},\
				{\
					"time_control" : "Blitz",\
					"rating" : {\
						"rating" : 1800,\
						"num_games" : 0, "won" : 0, "drawn" : 0, "lost" : 0,\
						"K" : 40\
					}\
				}\
			]\
		}';
	let json_parse = JSON.parse(json_string);
	console.log(typeof (json_parse));
	console.log(json_parse);

	console.log("------------------------------------------");
	console.log("(4)");
	let px = player_from_json(json_string);
	console.log(px);

	console.log("------------------------------------------");
	console.log("(5)");
	let json_string2: string =
		'[\
			{\
				"username" : "p1",\
				"ratings" : [\
					{\
						"time_control" : "Classical",\
						"rating" : {\
							"rating" : 1500,\
							"num_games" : 0, "won" : 0, "drawn" : 0, "lost" : 0,\
							"K" : 40\
						}\
					},\
					{\
						"time_control" : "Blitz",\
						"rating" : {\
							"rating" : 1800,\
							"num_games" : 0, "won" : 0, "drawn" : 0, "lost" : 0,\
							"K" : 40\
						}\
					}\
				]\
			},\
			{\
				"username" : "p2",\
				"ratings" : [\
					{\
						"time_control" : "Classical",\
						"rating" : {\
							"rating" : 1500,\
							"num_games" : 0, "won" : 0, "drawn" : 0, "lost" : 0,\
							"K" : 40\
						}\
					},\
					{\
						"time_control" : "Blitz",\
						"rating" : {\
							"rating" : 1800,\
							"num_games" : 0, "won" : 0, "drawn" : 0, "lost" : 0,\
							"K" : 40\
						}\
					}\
				]\
			}\
		]';
	let set_players: Player[] = player_set_from_json(json_string2);
	console.log(set_players);
}

function Test_User() {
	console.log("====================================");
	console.log("Creating, storing and reading a user");
	console.log("====================================");

	console.log("------------------------------------------");
	console.log("(1)");
	let p1: User = new User(
		"p1",
		"Perico", "de los Palotes",
		new Password("caca", "iv"),
		["admin"],
		["2022-12-31"],
		list_ratings
	);
	console.log(p1);

	console.log("------------------------------------------");
	console.log("(2)");
	console.log("Convert a user to JSON string");
	let json_str = JSON.stringify(p1);
	console.log(json_str);

	console.log("------------------------------------------");
	console.log("(3)");
	console.log("Parse a user from a JSON string");
	let json_string: string =
		'{\
			"username" : "p1",\
			"first_name" : "Perico",\
			"last_name" : "de los Palotes",\
			"password" : {\
				"encrypted" : "asdf",\
				"iv" : "234"\
			},\
			"roles" : ["member"],\
			"ratings" : [\
				{\
					"time_control" : "Classical",\
					"rating" : {\
						"rating" : 1500,\
						"num_games" : 0, "won" : 0, "drawn" : 0, "lost" : 0,\
						"K" : 40\
					}\
				},\
				{\
					"time_control" : "Blitz",\
					"rating" : {\
						"rating" : 1800,\
						"num_games" : 0, "won" : 0, "drawn" : 0, "lost" : 0,\
						"K" : 40\
					}\
				}\
			],\
			"games": []\
		}';
	let json_parse = JSON.parse(json_string);
	console.log(typeof (json_parse));
	console.log(json_parse);

	console.log("------------------------------------------");
	console.log("(4)");
	let px = user_from_json(json_string);
	console.log(px);

	console.log("------------------------------------------");
	console.log("(5)");
	let json_string2: string =
		'[\
			{\
				"username" : "p2",\
				"first_name" : "AAAAA",\
				"last_name" : "BBBBBBBB",\
				"password" : {\
					"encrypted" : "asdf",\
					"iv" : "234"\
				},\
				"roles" : ["member"],\
				"ratings" : [\
					{\
						"time_control" : "Classical",\
						"rating" : {\
							"rating" : 1500,\
							"num_games" : 0, "won" : 0, "drawn" : 0, "lost" : 0,\
							"K" : 40\
						}\
					},\
					{\
						"time_control" : "Blitz",\
						"rating" : {\
							"rating" : 1800,\
							"num_games" : 0, "won" : 0, "drawn" : 0, "lost" : 0,\
							"K" : 40\
						}\
					}\
				],\
				"games" : []\
			},\
			{\
				"username" : "p3",\
				"first_name" : "CCCCC",\
				"last_name" : "DDDDDD",\
				"password" : {\
					"encrypted" : "asdf",\
					"iv" : "234"\
				},\
				"roles" : ["member"],\
				"ratings" : [\
					{\
						"time_control" : "Classical",\
						"rating" : {\
							"rating" : 1500,\
							"num_games" : 0, "won" : 0, "drawn" : 0, "lost" : 0,\
							"K" : 40\
						}\
					},\
					{\
						"time_control" : "Blitz",\
						"rating" : {\
							"rating" : 1800,\
							"num_games" : 0, "won" : 0, "drawn" : 0, "lost" : 0,\
							"K" : 40\
						}\
					}\
				],\
				"games" : []\
			}\
		]';

	let set_players: User[] = user_set_from_json(json_string2);
	console.log(set_players);
}

Test_Player();
Test_User();
