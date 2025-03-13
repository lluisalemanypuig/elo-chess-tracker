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
import { log_now } from './utils/time';

import { SessionIDManager } from './managers/session_id_manager';
import { EnvironmentManager } from './managers/environment_manager';
import { SessionID } from './models/session_id';

let router = express.Router();
router.get('/', (req: any, res: any) => {
	debug(log_now(), `Username received in cookie: '${req.cookies.user}'`);

	const session = SessionID.from_cookie(req.cookies);
	const mem = SessionIDManager.get_instance();
	if (mem.has_session_id(session)) {
		debug(log_now(), `    Session id for user '${session.username}' exists. Please, come in.`);
		res.sendFile(path.join(__dirname, '../html/home.html'));
	} else {
		debug(log_now(), `    Session id does not exist. Login using your credentials`);
		res.sendFile(path.join(__dirname, '../html/login_screen.html'));
	}
});

// retrieve home page
router.get('/home', (req: any, res: any) => {
	debug(log_now(), 'GET /home');

	const session = SessionID.from_cookie(req.cookies);
	if (!SessionIDManager.get_instance().has_session_id(session)) {
		debug(log_now(), '    Session id does not exist.');
		res.status(401).send('Forbidden');
		return;
	}

	debug(log_now(), '    Access granted');
	res.status(200).sendFile(path.join(__dirname, '../html/home.html'));
});

// serve all *.css files
router.get('/css/*.css', (req: any, res: any) => {
	debug(log_now(), 'GET css file...');
	debug(log_now(), `    request: ${req.url}`);
	const filepath = path.join(__dirname, '..', req.url);
	debug(log_now(), `    file to send: ${filepath}`);
	res.status(200).sendFile(filepath);
});

/* ************************************************************************** */
/* Version number */
router.get('/version_number', (req: any, res: any) => {
	debug(log_now(), 'GET version_number...');
	debug(log_now(), `    request: ${req.url}`);
	res.status(200).setHeader('Cache-Control', 'public, max-age=864000, immutable').send('XX.YY');
});

/* ************************************************************************** */
/* ICONS */
router.get('/favicon.ico', (req: any, res: any) => {
	debug(log_now(), 'GET favicon.ico...');
	debug(log_now(), `    request: ${req.url}`);
	const filepath = EnvironmentManager.get_instance().get_icon_favicon();
	debug(log_now(), `    file to send: ${filepath}`);
	res.status(200).setHeader('Cache-Control', 'public, max-age=864000, immutable').sendFile(filepath);
});
router.get('/icon/login_page', (req: any, res: any) => {
	debug(log_now(), 'GET /icon/login_page...');
	debug(log_now(), `    request: ${req.url}`);
	const filepath = EnvironmentManager.get_instance().get_icon_login_page();
	debug(log_now(), `    file to send: ${filepath}`);
	res.status(200).setHeader('Cache-Control', 'public, max-age=864000, immutable').sendFile(filepath);
});
router.get('/icon/home_page', (req: any, res: any) => {
	debug(log_now(), 'GET /icon/home_page...');
	debug(log_now(), `    request: ${req.url}`);
	const filepath = EnvironmentManager.get_instance().get_icon_home_page();
	debug(log_now(), `    file to send: ${filepath}`);
	res.status(200).setHeader('Cache-Control', 'public, max-age=864000, immutable').sendFile(filepath);
});

/* PAGE TITLES */
router.get('/title/login_page', (req: any, res: any) => {
	debug(log_now(), 'GET /title/login_page...');
	debug(log_now(), `    request: ${req.url}`);
	res.status(200)
		.setHeader('Cache-Control', 'public, max-age=864000, immutable')
		.send(EnvironmentManager.get_instance().get_title_login_page());
});
router.get('/title/home_page', (req: any, res: any) => {
	debug(log_now(), 'GET /title/home_page...');
	debug(log_now(), `    request: ${req.url}`);
	res.status(200)
		.setHeader('Cache-Control', 'public, max-age=864000, immutable')
		.send(EnvironmentManager.get_instance().get_title_home_page());
});

/* ************************************************************************** */

// serve all javascript files!
router.get('/js/*', (req: any, res: any) => {
	debug(log_now(), 'GET a file in js/');
	debug(log_now(), `    request: ${req.url}`);
	const filepath = path.join(__dirname, '..', req.url);
	debug(log_now(), `    file to send: ${filepath}`);
	res.status(200).sendFile(filepath);
});

import {
	post_query_user_edit,
	get_query_user_list,
	get_query_user_home,
	post_query_user_ranking,
	get_query_html_user_list
} from './server_query_user';
router.get('/query/user/list', get_query_user_list);
router.get('/query/html/user/list', get_query_html_user_list);
router.get('/query/user/home', get_query_user_home);

// these queries need to be 'post'-ed because we
// need to send (post) information to the server
router.post('/query/user/edit', post_query_user_edit);
router.post('/query/user/ranking', post_query_user_ranking);

// sending, receiving, accepting, setting result of challenges
import {
	get_query_challenge_received,
	get_query_challenge_sent,
	get_query_challenge_pending_result,
	get_query_challenge_confirm_result_other,
	get_query_challenge_confirm_result_self
} from './server_query_challenges';
router.get('/query/challenge/received', get_query_challenge_received);
router.get('/query/challenge/sent', get_query_challenge_sent);
router.get('/query/challenge/pending_result', get_query_challenge_pending_result);
router.get('/query/challenge/confirm_result/other', get_query_challenge_confirm_result_other);
router.get('/query/challenge/confirm_result/self', get_query_challenge_confirm_result_self);

import { post_query_game_list_own, post_query_game_list_all } from './server_query_games';
router.post('/query/game/list/own', post_query_game_list_own);
router.post('/query/game/list/all', post_query_game_list_all);

import { post_query_graph_full, post_query_graph_own } from './server_query_graphs';
router.post('/query/graph/own', post_query_graph_own);
router.post('/query/graph/full', post_query_graph_full);

// query time controls
import { get_query_html_time_controls } from './server_query_time_control';
router.get('/query/html/time_controls', get_query_html_time_controls);

// user login and logout
import { post_user_login, post_user_logout } from './server_login_logout';
router.post('/user/login', post_user_login);
router.post('/user/logout', post_user_logout);

// creation of a new user
import { post_user_create, get_page_user_create } from './server_users_new';
router.get('/user/create', get_page_user_create);
router.post('/user/create', post_user_create);

// edition of an existing user
import { post_user_edit, get_page_user_edit } from './server_users_edit';
router.get('/user/edit', get_page_user_edit);
router.post('/user/edit', post_user_edit);

// change of password
import { get_user_password_change_page, post_user_password_change } from './server_users_password_change';
router.get('/user/password_change', get_user_password_change_page);
router.post('/user/password_change', post_user_password_change);

// retrieve ranking of players
import { get_page_user_ranking } from './server_users_ranking';
router.get('/user/ranking', get_page_user_ranking);

// create a new game
import { get_page_game_create, post_game_create } from './server_games';
router.get('/game/create', get_page_game_create);
router.post('/game/create', post_game_create);

// editing a game's result
import { post_game_edit_result } from './server_games';
router.post('/game/edit_result', post_game_edit_result);

// retrieve list of games
import { get_page_game_list_all, get_page_game_list_own } from './server_games';
router.get('/game/list/own', get_page_game_list_own);
router.get('/game/list/all', get_page_game_list_all);

// retrieve graphs of the webpage
import { get_page_graph_own, get_page_graph_full } from './server_graphs';
router.get('/graph/own', get_page_graph_own);
router.get('/graph/full', get_page_graph_full);

// challenges management
import { get_challenge_page } from './server_challenges';
router.get('/challenge', get_challenge_page);
import { post_challenge_send } from './server_challenges';
router.post('/challenge/send', post_challenge_send);
import { post_challenge_accept, post_challenge_decline } from './server_challenges';
router.post('/challenge/accept', post_challenge_accept);
router.post('/challenge/decline', post_challenge_decline);
import { post_challenge_set_result } from './server_challenges';
router.post('/challenge/set_result', post_challenge_set_result);
import { post_challenge_agree, post_challenge_disagree } from './server_challenges';
router.post('/challenge/agree', post_challenge_agree);
router.post('/challenge/disagree', post_challenge_disagree);

// recalculation of all Elo ratings
import { post_recalculate_ratings } from './server_games';
router.post('/recalculate_ratings', post_recalculate_ratings);

// recalculation of all graphs
import { post_recalculate_graphs } from './server_graphs';
router.post('/recalculate_graphs', post_recalculate_graphs);

export { router };
