import Debug from 'debug';
const debug = Debug('ELO_TRACKER:server_games');

import path from 'path';
import fs from 'fs';

import { log_now } from './utils/misc';
import { is_user_logged_in } from './server/session';
import { user_retrieve } from './server/users';
import { User } from './models/user';
import { Game, game_set_from_json } from './models/game';
import { RatingFormula } from './server/configuration';
import { ServerDirectories } from './server/configuration';

function increment(username: string, g: Game): any {
	const formula = RatingFormula.get_instance().formula;
	let [white_after, black_after] = formula(g);

	let white_Elo_increment: number;
	white_Elo_increment =
		white_after.get_classical_rating().rating -
		g.white.get_classical_rating().rating;

	let black_Elo_increment: number;
	black_Elo_increment =
		black_after.get_classical_rating().rating -
		g.black.get_classical_rating().rating;

	return {
		'white_Elo_increment' : white_Elo_increment,
		'black_Elo_increment' : black_Elo_increment
	};
}

export async function query_games_list_own_get(req: any, res: any) {
	debug(log_now(), "GET games_own_list...");

	const id = req.cookies.session_id;
	const username = req.cookies.user;

	let r = is_user_logged_in(id, username);
	if (!r[0]) {
		res.send(r[1]);
		return;
	}

	const games_dir = ServerDirectories.get_instance().games_directory;
	let data_to_return: any[] = [];

	let u = user_retrieve(username) as User;
	let game_record_file_list = u.get_games();
	for (let i = game_record_file_list.length - 1; i >= 0; --i) {
		let game_record_file = path.join(games_dir, game_record_file_list[i]);

		// read the games from the file
		debug(log_now(), `    Reading game record '${game_record_file}'...`);
		let data = fs.readFileSync(game_record_file, 'utf8');
		debug(log_now(), `        Game record '${game_record_file}' read.`);
		let game_set = game_set_from_json(data);

		for (let j = game_set.length - 1; j >= 0; --j) {
			let g = game_set[j];
			if (g.is_user_involved(username)) {
				let inc = increment(username, g);
				data_to_return.push({
					'white': (user_retrieve(g.white.get_username()) as User).get_full_name(),
					'black': (user_retrieve(g.black.get_username()) as User).get_full_name(),
					'type': g.game_type,
					'result': g.result,
					'date' : g.when,
					'white_Elo': g.white.get_classical_rating().rating,
					'black_Elo': g.black.get_classical_rating().rating,
					'white_Elo_increment': (inc.white_Elo_increment < 0 ? inc.white_Elo_increment : "+" + inc.white_Elo_increment),
					'black_Elo_increment': (inc.black_Elo_increment < 0 ? inc.black_Elo_increment : "+" + inc.black_Elo_increment)
				});
			}
		}
	}

	debug(log_now(), `Found '${data_to_return.length}' games involving '${username}'`);

	res.send({
		'r' : '1',
		'games' : data_to_return
	});
}