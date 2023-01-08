import { Game } from "../models/game";
import { Player } from "../models/player";
import { Rating } from "../models/rating";

function get_exp_score(Ra: number, Rb: number): number {
	return 1.0/(1 + 10**((Rb - Ra)/400));
}

function rating_adjustment(exp_score: number, score: number, k: number): number {
	return k*(score - exp_score);
}

function update_classical(game: Game): [Player, Player] {
	let white = game.white.clone();
	let black = game.black.clone();
	const result = game.result;

	let white_rating = white.get_classical_rating();
	let black_rating = black.get_classical_rating();

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

	white.set_classical_rating(white_rating);
	black.set_classical_rating(black_rating);

	return [white, black];
}

export function player_vs_player(game: Game): [Player, Player] {
	if (game.game_type == 'classical') {
		return update_classical(game);
	}

	return [
		new Player("", new Rating(0, 0, 0, 0, 0, 0)),
		new Player("", new Rating(0, 0, 0, 0, 0, 0))
	];
}