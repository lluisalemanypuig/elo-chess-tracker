import Debug from 'debug';
const debug = Debug('ELO_TRACKER:server_ranking');

import path from 'path';

import { log_now } from './utils/misc';
import { is_user_logged_in } from './server/session';

export async function ranking_users_get(req: any, res: any) {
	debug(log_now(), "GET games_own page...");

	const id = req.cookies.session_id;
	const username = req.cookies.user;

	let r = is_user_logged_in(id, username);
	if (!r[0]) {
		res.send(r[1]);
		return;
	}

	res.sendFile(path.join(__dirname, "../html/ranking.html"));
}