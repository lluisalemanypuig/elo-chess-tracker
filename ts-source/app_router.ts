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
		res.sendFile(path.join(__dirname, "../html/main.html"));
	}
	else {
		debug(log_now(), `    Session id does not exist. Login!`);
		// User does not have an appropriate cookie. They must provide
		// identity credentials to log in.
		res.sendFile(path.join(__dirname, "../html/login_screen.html"));
	}
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

// implement user login
import { user_log_in } from './server_login';
router.post('/login', user_log_in);

// implement user logout
import { user_log_out } from './server_logout';
router.post('/logout', user_log_out);

// implement creation of a new user
import { user_create_new_post, user_create_new_get } from './server_user_new';
router.post('/user_create', user_create_new_post);
router.get('/user_create', user_create_new_get);

import { query_user_get, query_user_list_get } from './server_query_user';
router.get('/query_user_list', query_user_list_get);
router.get('/user_query', query_user_get);

// implement edition of an existing user
import { user_edit_existing_post, user_edit_existing_get } from './server_user_edit';
router.post('/user_edit', user_edit_existing_post);
router.get('/user_edit', user_edit_existing_get);

// implement retrieve list of games
import { games_own_get } from './server_games';
router.get('/games', games_own_get);
import { query_games_list_own_get } from './server_query_games';
router.get('/query_games_own', query_games_list_own_get);

// implement sending, receiving, accepting, setting result of challenges
import {
	query_challenges_received_get,
	query_challenges_sent_get,
	query_challenges_pending_set_result_get,
	query_challenges_result_set_by_me_get,
	query_challenges_result_set_by_opponent_get
}
from './server_query_challenges';
router.get('/query_challenges_received', query_challenges_received_get);
router.get('/query_challenges_sent', query_challenges_sent_get);
router.get('/query_challenges_pending_set_result_get', query_challenges_pending_set_result_get);
router.get('/query_challenges_result_set_by_me_get', query_challenges_result_set_by_me_get);
router.get('/query_challenges_result_set_by_opponent_get', query_challenges_result_set_by_opponent_get);

import { challenges_get } from './server_challenges';
router.get('/challenges', challenges_get);
import { challenge_send_post } from './server_challenges';
router.post('/challenge_send', challenge_send_post);
import { challenge_accept_post, challenge_decline_post } from './server_challenges';
router.post('/challenge_accept', challenge_accept_post);
router.post('/challenge_decline', challenge_decline_post);
import { challenge_set_result_post } from './server_challenges';
router.post('/challenge_set_result', challenge_set_result_post);
import { challenge_agree_result_post, challenge_disagree_result_post } from './server_challenges';
router.post('/challenge_agree_result', challenge_agree_result_post);
router.post('/challenge_disagree_result', challenge_disagree_result_post);

// retrieve main page
router.get('/main', (req: any, res: any) => {
	debug(log_now(), "GET main");
	
	if (! session_id_exists(req.cookies.session_id, req.cookies.user)) {
		debug(log_now(), "    Session id does not exist.");
		res.send("Computer says no");
		return;
	}
	
	debug(log_now(), "    Access granted");
	res.sendFile(path.join(__dirname, "../html/main.html"));
});

export { router };
