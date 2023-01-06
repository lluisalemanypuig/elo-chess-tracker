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

function Test1() {
    console.log("==========");
    console.log("  Test 1  ");
    console.log("==========");

    let game = game_from_json(
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
            "type" : "classical",\
            "when" : "2022-12-15..18:00:00"\
        }]'
    );

    console.log(game);
}

Test1();
Test2();
