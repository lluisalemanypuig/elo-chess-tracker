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
	const result = game.result;

	let white_rating = white.get_classical_rating();
	let black_rating = black.get_classical_rating();

	let rt1 = white_rating.rating;
	let rt2 = black_rating.rating;

	let ng1 = white_rating.num_games + 1;
	let ng2 = black_rating.num_games + 1;

	let K1 = white_rating.K;
	let K2 = black_rating.K;

	if (result == "draw") {
		white_rating.rating = (rt1 + rt2 - ng1/K1*100)/2;
		black_rating.rating = (rt1 + rt2 + ng2/K2*100)/2;
		white_rating.drawn += 1;
		black_rating.drawn += 1;
	}
	else if (result == "white_wins") {
		white_rating.rating = (rt1 + rt2)/2 + ng1/K1*100;
		black_rating.rating = (rt1 + rt2)/2 - ng2/K2*100;
		white_rating.won += 1;
		black_rating.lost += 1;
	}
	else if (result == "black_wins") {
		white_rating.rating = (rt1 + rt2)/2 - ng1/K1*100;
		black_rating.rating = (rt1 + rt2)/2 + ng2/K2*100;
		white_rating.lost += 1;
		black_rating.won += 1;
	}

	++white_rating.num_games;
	if (ng1 >= 5) {
		white_rating.K = 20;
	}
	++black_rating.num_games;
	if (ng2 >= 5) {
		black_rating.K = 20;
	}

	white.set_classical_rating(white_rating);
	black.set_classical_rating(black_rating);

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
