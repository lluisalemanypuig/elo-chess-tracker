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

import express from 'express';
import path from 'path';

import Debug from 'debug';
const debug = Debug('ELO_TRACKER:app_router');
import { log_now } from './utils/misc';

import { SessionIDManager } from './managers/session_id_manager';
import { EnvironmentManager } from './managers/environment_manager';

let router = express.Router();
router.get('/', (req: any, res: any) => {
	debug(log_now(), `Username received in cookie: '${req.cookies.user}'`);

	const session = new SessionID(req.cookies.session_id, req.cookies.user);
	const mem = SessionIDManager.get_instance();
	if (mem.has_session_id(session)) {
		debug(log_now(), `    Session id exists. Please, come in.`);
		// User has a cookie proving that they logged into the web in the past
		res.sendFile(path.join(__dirname, '../html/home.html'));
	} else {
		debug(log_now(), `    Session id does not exist. Login!`);
		// User does not have an appropriate cookie. They must provide
		// identity credentials to log in.
		res.sendFile(path.join(__dirname, '../html/login_screen.html'));
	}
});

// serve all *.css files
router.get('/html/*.css', (req: any, res: any) => {
	debug(log_now(), 'GET css file...');
	debug(log_now(), `    request: ${req.url}`);
	const filepath = path.join(__dirname, '..', req.url);
	debug(log_now(), `    file to send: ${filepath}`);
	res.sendFile(filepath);
});

/* ************************************************************************** */
/* Version number */
router.get('/version_number', (req: any, res: any) => {
	debug(log_now(), 'GET version_number...');
	debug(log_now(), `    request: ${req.url}`);
	res.setHeader('Cache-Control', 'public, max-age=864000, immutable');
	res.send('XX.YY');
});

/* ************************************************************************** */
/* ICONS */
router.get('/favicon.ico', (req: any, res: any) => {
	debug(log_now(), 'GET favicon.ico...');
	debug(log_now(), `    request: ${req.url}`);
	const filepath = EnvironmentManager.get_instance().get_icon_favicon();
	debug(log_now(), `    file to send: ${filepath}`);
	res.setHeader('Cache-Control', 'public, max-age=864000, immutable');
	res.sendFile(filepath);
});
router.get('/icon_login_page', (req: any, res: any) => {
	debug(log_now(), 'GET icon_login_page...');
	debug(log_now(), `    request: ${req.url}`);
	const filepath = EnvironmentManager.get_instance().get_icon_login_page();
	debug(log_now(), `    file to send: ${filepath}`);
	res.setHeader('Cache-Control', 'public, max-age=864000, immutable');
	res.sendFile(filepath);
});
router.get('/icon_home_page', (req: any, res: any) => {
	debug(log_now(), 'GET icon_home_page...');
	debug(log_now(), `    request: ${req.url}`);
	const filepath = EnvironmentManager.get_instance().get_icon_home_page();
	debug(log_now(), `    file to send: ${filepath}`);
	res.setHeader('Cache-Control', 'public, max-age=864000, immutable');
	res.sendFile(filepath);
});

/* PAGE TITLES */
router.get('/title_login_page', (req: any, res: any) => {
	debug(log_now(), 'GET title_login_page...');
	debug(log_now(), `    request: ${req.url}`);
	res.setHeader('Cache-Control', 'public, max-age=864000, immutable');
	res.send(EnvironmentManager.get_instance().get_title_login_page());
});
router.get('/title_home_page', (req: any, res: any) => {
	debug(log_now(), 'GET title_home_page...');
	debug(log_now(), `    request: ${req.url}`);
	res.setHeader('Cache-Control', 'public, max-age=864000, immutable');
	res.send(EnvironmentManager.get_instance().get_title_home_page());
});

/* ************************************************************************** */

// serve all javascript files!
router.get('/js-source/*', (req: any, res: any) => {
	debug(log_now(), 'GET a file in js-source...');
	debug(log_now(), `    request: ${req.url}`);
	const filepath = path.join(__dirname, '..', req.url);
	debug(log_now(), `    file to send: ${filepath}`);
	res.sendFile(filepath);
});

import {
	post_query_users_edit,
	get_query_users_list,
	get_query_users_home,
	post_query_users_ranking
} from './server_query_user';
router.get('/query_users_list', get_query_users_list);
router.get('/query_users_home', get_query_users_home);
// these queries need to be 'post'-ed because we
// need to send (post) information to the server
router.post('/query_users_edit', post_query_users_edit);
router.post('/query_users_ranking', post_query_users_ranking);

// sending, receiving, accepting, setting result of challenges
import {
	get_query_challenges_received,
	get_query_challenges_sent,
	get_query_challenges_pending_result,
	get_query_challenges_confirm_result_other,
	get_query_challenges_confirm_result_self
} from './server_query_challenges';
router.get('/query_challenges_received', get_query_challenges_received);
router.get('/query_challenges_sent', get_query_challenges_sent);
router.get('/query_challenges_pending_result', get_query_challenges_pending_result);
router.get('/query_challenges_confirm_result_other', get_query_challenges_confirm_result_other);
router.get('/query_challenges_confirm_result_self', get_query_challenges_confirm_result_self);

import { get_query_games_list_own, get_query_games_list_all } from './server_query_games';
router.get('/query_games_own', get_query_games_list_own);
router.get('/query_games_all', get_query_games_list_all);

// query time controls
import { get_query_time_control } from './server_query_time_control';
router.get('/query_time_controls', get_query_time_control);

// user login and logout
import { post_user_log_in, post_user_log_out } from './server_login_logout';
router.post('/login', post_user_log_in);
router.post('/logout', post_user_log_out);

// creation of a new user
import { post_users_create, get_users_create_page } from './server_users_new';
router.get('/users_create_page', get_users_create_page);
router.post('/users_create', post_users_create);

// edition of an existing user
import { post_users_edit, get_users_edit_page } from './server_users_edit';
router.get('/users_edit_page', get_users_edit_page);
router.post('/users_edit', post_users_edit);

// change of password
import { get_users_password_change_page, post_users_password_change } from './server_users_password_change';
router.get('/users_password_change', get_users_password_change_page);
router.post('/users_password_change', post_users_password_change);

// create a new game
import { get_games_create_page, post_games_create } from './server_games';
router.get('/games_create_page', get_games_create_page);
router.post('/games_create', post_games_create);

// editing a game's result
import { post_games_edit_result } from './server_games';
router.post('/games_edit_result', post_games_edit_result);

// retrieve list of games
import { get_games_all_page, get_games_own_page } from './server_games';
router.get('/games_own_page', get_games_own_page);
router.get('/games_all_page', get_games_all_page);

// retrieve ranking of players
import { get_ranking_users_page } from './server_users_ranking';
router.get('/ranking_users_page', get_ranking_users_page);

// challenges management
import { get_challenges_page } from './server_challenges';
router.get('/challenges_page', get_challenges_page);
import { post_challenge_send } from './server_challenges';
router.post('/challenges_send', post_challenge_send);
import { post_challenge_accept, post_challenge_decline } from './server_challenges';
router.post('/challenges_accept', post_challenge_accept);
router.post('/challenges_decline', post_challenge_decline);
import { post_challenge_set_result } from './server_challenges';
router.post('/challenges_set_result', post_challenge_set_result);
import { post_challenge_agree_result, post_challenge_disagree_result } from './server_challenges';
router.post('/challenges_agree_result', post_challenge_agree_result);
router.post('/challenges_disagree_result', post_challenge_disagree_result);

// recalculation of all Elo ratings
import { post_recalculate_Elo_ratings } from './server_games';
import { SessionID } from './models/session_id';
router.post('/recalculate_Elo_ratings', post_recalculate_Elo_ratings);

// retrieve home page
router.get('/home', (req: any, res: any) => {
	debug(log_now(), 'GET home');

	const session = new SessionID(req.cookies.session_id, req.cookies.user);
	let mem = SessionIDManager.get_instance();
	if (!mem.has_session_id(session)) {
		debug(log_now(), '    Session id does not exist.');
		res.send('Computer says no');
		return;
	}

	debug(log_now(), '    Access granted');
	res.sendFile(path.join(__dirname, '../html/home.html'));
});

export { router };
