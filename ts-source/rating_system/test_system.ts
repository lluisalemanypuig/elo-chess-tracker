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

import { Game } from '../models/game';
import { Player } from '../models/player';
import { Rating } from '../models/rating';

function update_classical(game: Game): [Player, Player] {
	let white = game.white.clone();
	let black = game.black.clone();
	let result = game.result;

	let classical_white = white.get_classical_rating();
	let classical_black = black.get_classical_rating();

	let rt1 = classical_white.rating;
	let rt2 = classical_black.rating;

	let ng1 = classical_white.num_games + 1;
	let ng2 = classical_black.num_games + 1;

	let K1 = classical_white.K;
	let K2 = classical_black.K;

	if (result == "draw") {
		classical_white.rating = (rt1 + rt2 - ng1 / K1 * 100) / 2;
		classical_black.rating = (rt1 + rt2 + ng2 / K2 * 100) / 2;
		classical_white.drawn += 1;
		classical_black.drawn += 1;
	}
	else if (result == "white_wins") {
		classical_white.rating = (rt1 + rt2) / 2 + ng1 / K1 * 100;
		classical_black.rating = (rt1 + rt2) / 2 - ng2 / K2 * 100;
		classical_white.won += 1;
		classical_black.lost += 1;
	}
	else if (result == "black_wins") {
		classical_white.rating = (rt1 + rt2) / 2 - ng1 / K1 * 100;
		classical_black.rating = (rt1 + rt2) / 2 + ng2 / K2 * 100;
		classical_white.lost += 1;
		classical_black.won += 1;
	}

	classical_white.num_games = ng1;
	if (ng1 >= 5) {
		classical_white.K = 20;
	}
	classical_black.num_games = ng2;
	if (ng2 >= 5) {
		classical_black.K = 20;
	}

	white.set_classical_rating(classical_white);
	black.set_classical_rating(classical_black);

	return [white, black];
}

export function player_vs_player(game: Game): [Player, Player] {
	if (game.game_type == "classical") {
		return update_classical(game);
	}

	return [
		new Player("", new Rating(0, 0, 0, 0, 0, 0)),
		new Player("", new Rating(0, 0, 0, 0, 0, 0))
	];
}
