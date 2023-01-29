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

import { Game } from "../../models/game";
import { EloRating } from "./rating";

function get_exp_score(Ra: number, Rb: number): number {
	return 1.0/(1 + 10**((Rb - Ra)/400));
}

function rating_adjustment(exp_score: number, score: number, k: number): number {
	return k*(score - exp_score);
}

export function player_vs_player(game: Game): [EloRating, EloRating] {
	let white_rating = game.white_rating.clone() as EloRating;
	let black_rating = game.black_rating.clone() as EloRating;
	const result = game.result;

	let exp_score_a = get_exp_score(white_rating.rating, black_rating.rating);
	if (result == 'white_wins') {
		white_rating.rating += rating_adjustment(exp_score_a,     1,   white_rating.K);
		black_rating.rating += rating_adjustment(1 - exp_score_a, 0,   black_rating.K);

		white_rating.won += 1;
		black_rating.lost += 1;
	}	
	else if (result == 'black_wins') {
		white_rating.rating += rating_adjustment(exp_score_a,     0,   white_rating.K);
		black_rating.rating += rating_adjustment(1 - exp_score_a, 1,   black_rating.K);

		white_rating.lost += 1;
		black_rating.won += 1;
	}
	else if (result == 'draw') {
		white_rating.rating += rating_adjustment(exp_score_a,     0.5, white_rating.K);
		black_rating.rating += rating_adjustment(1 - exp_score_a, 0.5, black_rating.K);

		white_rating.drawn += 1;
		black_rating.drawn += 1;
	}

	// update White's and Black's number of games
	++white_rating.num_games;
	++black_rating.num_games;

	// update White's constant
	if (white_rating.num_games >= 30) {
		white_rating.K = 20;
	}
	if (white_rating.rating >= 2400) {
		white_rating.K = 10;
	}

	// update Black's constant
	if (black_rating.num_games >= 30) {
		black_rating.K = 20;
	}
	if (black_rating.rating >= 2400) {
		black_rating.K = 10;
	}

	return [white_rating, black_rating];
}