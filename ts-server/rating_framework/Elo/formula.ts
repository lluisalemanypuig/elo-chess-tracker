/*
Elo rating for a Chess Club
Copyright (C) 2023 - 2025  Lluís Alemany Puig

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

Full source code of elo-chess-tracker:
	https://github.com/lluisalemanypuig/elo-chess-tracker

Contact:
	Lluís Alemany Puig
	https://github.com/lluisalemanypuig
*/

import { Game } from '../../models/game';
import { EloRating } from './rating';

function get_exp_score(Ra: number, Rb: number): number {
	return 1.0 / (1 + 10 ** ((Rb - Ra) / 400));
}

function rating_adjustment(exp_score: number, score: number, k: number): number {
	return k * (score - exp_score);
}

/*

FROM FIDE REGULATIONS 2022 (https://www.fide.com/docs/regulations/FIDE%20Rating%20Regulations%202022.pdf)

* K = 40 for a player new to the rating list until they have completed events
  with at least 30 games.
* K = 20 as long as a player's rating remains under 2400.
* K = 10 once a player's published rating has reached 2400 and remains at
  that level subsequently, even if the rating drops below 2400.
* K = 40 for all players until the end of the year of their 18th birthday,
  as long as their rating remains under 2300.
* If the number of games (n) for a player on any list for a rating period
  multiplied by K (as defined above) exceeds 700, then K shall be the
  largest whole number such that K x n does not exceed 700.

REGULATIONS IN THIS WAY

- age has been completely disregarded

- We selected the following bullet points from the list above

	* K = 40 for a player new to the rating list until they have completed events
	with at least 30 games.
	* K = 20 as long as a player's rating remains under 2400.
	* K = 10 once a player's published rating has reached 2400 and remains at
	that level subsequently, even if the rating drops below 2400.

- rating is updated BEFORE changing the value of K

*/

function update_constant_K(elo: EloRating): void {
	// the constant should not be changed and stay at 10.
	if (elo.surpassed_2400) {
		return;
	}

	if (elo.num_games < 30) {
		elo.K = 40;
	} else if (elo.num_games >= 30) {
		if (elo.rating < 2400) {
			elo.K = 20;
		} else {
			elo.K = 10;
			elo.surpassed_2400 = true;
		}
	}
}

export function player_vs_player(game: Game): [EloRating, EloRating] {
	let white_rating = game.get_white_rating().clone() as EloRating;
	let black_rating = game.get_black_rating().clone() as EloRating;
	const result = game.get_result();

	let exp_score_a = get_exp_score(white_rating.rating, black_rating.rating);
	if (result == 'white_wins') {
		white_rating.rating += rating_adjustment(exp_score_a, 1, white_rating.K);
		black_rating.rating += rating_adjustment(1 - exp_score_a, 0, black_rating.K);

		white_rating.won += 1;
		black_rating.lost += 1;
	} else if (result == 'black_wins') {
		white_rating.rating += rating_adjustment(exp_score_a, 0, white_rating.K);
		black_rating.rating += rating_adjustment(1 - exp_score_a, 1, black_rating.K);

		white_rating.lost += 1;
		black_rating.won += 1;
	} else if (result == 'draw') {
		white_rating.rating += rating_adjustment(exp_score_a, 0.5, white_rating.K);
		black_rating.rating += rating_adjustment(1 - exp_score_a, 0.5, black_rating.K);

		white_rating.drawn += 1;
		black_rating.drawn += 1;
	}

	++white_rating.num_games;
	++black_rating.num_games;

	update_constant_K(white_rating);
	update_constant_K(black_rating);

	return [white_rating, black_rating];
}
