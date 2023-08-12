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

import express from 'express';
import path from 'path';

import Debug from 'debug';
const debug = Debug('ELO_TRACKER:app_router');
import { log_now } from './utils/misc';

import { session_id_exists } from './server/session';

let router = express.Router();
router.get('/', (req: any, res: any) => {

	debug(log_now(), `Username received in cookie: '${req.cookies.user}'`);

	if (session_id_exists(req.cookies.session_id, req.cookies.user)) {
		debug(log_now(), `    Session id exists. Please, come in.`);
		// User has a cookie proving that they logged into the web in the past
		res.sendFile(path.join(__dirname, "../html/home.html"));
	}
	else {
		debug(log_now(), `    Session id does not exist. Login!`);
		// User does not have an appropriate cookie. They must provide
		// identity credentials to log in.
		res.sendFile(path.join(__dirname, "../html/login_screen.html"));
	}
});

// serve all *.css files
router.get('/html/*.css', (req: any, res: any) => {
	debug(log_now(), "GET css file...");
	debug(log_now(), `    request: ${req.url}`);
	let filepath = path.join(__dirname, "..", req.url);
	debug(log_now(), `    file to send: ${filepath}`);
	res.sendFile(filepath);
});

// 
router.get('/favicon.ico', (req: any, res: any) => {
	debug(log_now(), "GET favicon.ico...");
	debug(log_now(), `    request: ${req.url}`);
	let filepath = path.join(__dirname, "../public/favicon.ico");
	debug(log_now(), `    file to send: ${filepath}`);
	res.sendFile(filepath);
});

// serve all javascript files!
router.get('/js-source/*', (req: any, res: any) => {
	debug(log_now(), "GET a file in js-source...");
	debug(log_now(), `    request: ${req.url}`);
	let filepath = path.join(__dirname, "..", req.url);
	debug(log_now(), `    file to send: ${filepath}`);
	res.sendFile(filepath);
});

import { query_users_modify, query_users_list, query_users_home, query_users_ranking } from './server_query_user';
router.get('/query_users_list', query_users_list);
router.get('/query_users_home', query_users_home);
router.post('/query_users_modify', query_users_modify);
router.post('/query_users_ranking', query_users_ranking);

// implement sending, receiving, accepting, setting result of challenges
import {
	query_challenges_received,
	query_challenges_sent,
	query_challenges_pending_set_result,
	query_challenges_result_set_by_me,
	query_challenges_result_set_by_opponent
}
from './server_query_challenges';
router.get('/query_challenges_received', query_challenges_received);
router.get('/query_challenges_sent', query_challenges_sent);
router.get('/query_challenges_pending_set_result', query_challenges_pending_set_result);
router.get('/query_challenges_result_set_by_me', query_challenges_result_set_by_me);
router.get('/query_challenges_result_set_by_opponent', query_challenges_result_set_by_opponent);

import { query_games_list_own, query_games_list_all } from './server_query_games';
router.get('/query_games_own', query_games_list_own);
router.get('/query_games_all', query_games_list_all);

// implement query time controls
import { get_time_control } from './server_query_time_control';
router.get('/query_time_controls', get_time_control);

// implement user login
import { user_log_in } from './server_login';
router.post('/login', user_log_in);

// implement user logout
import { user_log_out } from './server_logout';
router.post('/logout', user_log_out);

// implement creation of a new user
import { post_user_create, get_user_create_page } from './server_users_new';
router.get('/users_create', get_user_create_page);
router.post('/users_create', post_user_create);

// implement edition of an existing user
import { post_user_edit, get_user_edit_page } from './server_users_edit';
router.get('/users_edit', get_user_edit_page);
router.post('/users_edit', post_user_edit);

// implement change of password
import { get_users_password_change_page, post_users_password_change } from './server_users_password_change';
router.get('/users_password_change', get_users_password_change_page);
router.post('/users_password_change', post_users_password_change);

// implement create a new game
import { post_games_create, get_games_create_page } from './server_games';
router.get('/games_create', get_games_create_page);
router.post('/games_create', post_games_create);

// implement editing a game's result
import { post_games_edit_result } from './server_games';
router.post('/games_edit_result', post_games_edit_result);

// implement retrieve list of games
import { get_games_all_page, get_games_own_page } from './server_games';
router.get('/games_own', get_games_own_page);
router.get('/games_all', get_games_all_page);

// implement retrieve ranking of players
import { get_ranking_users_page } from './server_users_ranking';
router.get('/ranking_users', get_ranking_users_page);

// implement challenges management
import { get_challenges_page } from './server_challenges';
router.get('/challenges', get_challenges_page);
import { post_challenge_send } from './server_challenges';
router.post('/challenge_send', post_challenge_send);
import { post_challenge_accept, post_challenge_decline } from './server_challenges';
router.post('/challenge_accept', post_challenge_accept);
router.post('/challenge_decline', post_challenge_decline);
import { post_challenge_set_result } from './server_challenges';
router.post('/challenge_set_result', post_challenge_set_result);
import { post_challenge_agree_result, post_challenge_disagree_result } from './server_challenges';
router.post('/challenge_agree_result', post_challenge_agree_result);
router.post('/challenge_disagree_result', post_challenge_disagree_result);

// retrieve home page
router.get('/home', (req: any, res: any) => {
	debug(log_now(), "GET home");
	
	if (! session_id_exists(req.cookies.session_id, req.cookies.user)) {
		debug(log_now(), "    Session id does not exist.");
		res.send("Computer says no");
		return;
	}
	
	debug(log_now(), "    Access granted");
	res.sendFile(path.join(__dirname, "../html/home.html"));
});

export { router };
