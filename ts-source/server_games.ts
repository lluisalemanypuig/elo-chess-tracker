import Debug from 'debug';
const debug = Debug('ELO_TRACKER:server_games');

import path from 'path';

import { log_now, long_date_to_short_date } from './utils/misc';
import { is_user_logged_in } from './server/session';
import { CREATE_GAME } from './models/user_action';
import { User } from './models/user';
import { game_add, game_new } from './server/game_history';
import { GameResult } from './models/game';

export async function get_games_own_page(req: any, res: any) {
	debug(log_now(), "GET games_own_page...");

	const id = req.cookies.session_id;
	const username = req.cookies.user;

	let r = is_user_logged_in(id, username);
	if (!r[0]) {
		res.send(r[1]);
		return;
	}

	res.sendFile(path.join(__dirname, "../html/games_own.html"));
}

export async function get_games_all_page(req: any, res: any) {
	debug(log_now(), "GET games_all_page...");

	const id = req.cookies.session_id;
	const username = req.cookies.user;

	let r = is_user_logged_in(id, username);
	if (!r[0]) {
		res.send(r[1]);
		return;
	}

	res.sendFile(path.join(__dirname, "../html/games_all.html"));
}

export async function get_games_create_page(req: any, res: any) {
	debug(log_now(), "GET games_create_page...");

	const id = req.cookies.session_id;
	const username = req.cookies.user;

	let r = is_user_logged_in(id, username);
	if (!r[0]) {
		res.send(r[1]);
		return;
	}

	if (!(r[2] as User).can_do(CREATE_GAME)) {
		debug(log_now(), `User '${username}' cannot create users.`);
		res.send("403 - Forbidden");
		return;
	}

	res.sendFile(path.join(__dirname, "../html/games_create.html"));
}

export async function post_games_create(req: any, res: any) {
	debug(log_now(), "POST games_create...");

	const id = req.cookies.session_id;
	const username = req.cookies.user;

	let r = is_user_logged_in(id, username);
	if (!r[0]) {
		res.send(r[1]);
		return;
	}

	if (!(r[2] as User).can_do(CREATE_GAME)) {
		debug(log_now(), `User '${username}' cannot create users.`);
		res.send("403 - Forbidden");
		return;
	}

	const white = req.body.w;
	const black = req.body.b;
	const result = req.body.r;
	const time_control_id = req.body.tc_i;
	const time_control_name = req.body.tc_n;
	const game_time = req.body.t;

	debug(log_now(), `    White: '${white}'`);
	debug(log_now(), `    Black: '${black}'`);
	debug(log_now(), `    Result: '${result}'`);
	debug(log_now(), `    Time control id: '${time_control_id}'`);
	debug(log_now(), `    Time control name: '${time_control_name}'`);
	debug(log_now(), `    Time of game: '${game_time}'`);

	if (white == black) {
		res.send({ 'r' : '0', 'reason' : 'The players cannot be the same' });
		return;
	}
	
	debug(log_now(), `Adding the new game`);

	let g = game_new(
		white, black,
		result as GameResult,
		time_control_id, time_control_name,
		game_time
	);
	
	debug(log_now(), `    Adding game...`);

	game_add(g);

	res.send({ 'r' : '1' });
	return;
}