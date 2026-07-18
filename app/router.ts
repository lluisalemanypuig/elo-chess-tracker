/*
Elo rating for a Chess Club
Copyright (C) 2023 - 2026  Lluís Alemany Puig

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
import { Request, Response } from 'express';

import Debug from 'debug';
const debug = Debug('ELO_CHESS_TRACKER:app_router');
import { log_now } from '@server/utils/time';

import { EnvironmentManager, get_execution_directory } from '@server/managers/environment_manager';
import { ConfigurationManager } from '@server/managers/configuration_manager';
import {
	ROUTE_CSS_ALL,
	ROUTE_VERSION_NUMBER,
	ROUTE_FAVICON_ICO,
	ROUTE_ICON_LOGIN_PAGE,
	ROUTE_ICON_HOME_PAGE,
	ROUTE_TITLE_LOGIN_PAGE,
	ROUTE_TITLE_HOME_PAGE,
	ROUTE_ROOT,
	ROUTE_HOME,
	ROUTE_JS_ALL,
	ROUTE_QUERY_USER_LIST,
	ROUTE_QUERY_HTML_USER_LIST,
	ROUTE_QUERY_USER_HOME,
	ROUTE_QUERY_USER_EDIT,
	ROUTE_QUERY_USER_RANKING,
	ROUTE_QUERY_CHALLENGE_RECEIVED,
	ROUTE_QUERY_CHALLENGE_SENT,
	ROUTE_QUERY_CHALLENGE_PENDING_RESULT,
	ROUTE_QUERY_CHALLENGE_CONFIRM_RESULT_OTHER,
	ROUTE_QUERY_CHALLENGE_CONFIRM_RESULT_SELF,
	ROUTE_QUERY_GAME_LIST_OWN,
	ROUTE_QUERY_GAME_LIST_ALL,
	ROUTE_QUERY_GRAPH_OWN,
	ROUTE_QUERY_GRAPH_FULL,
	ROUTE_QUERY_HTML_TIME_CONTROLS,
	ROUTE_QUERY_HTML_TIME_CONTROLS_UNIQUE,
	ROUTE_USER_LOGIN,
	ROUTE_USER_LOGOUT,
	ROUTE_USER_CREATE,
	ROUTE_USER_EDIT,
	ROUTE_USER_PASSWORD_CHANGE,
	ROUTE_PAGE_USER_CREATE,
	ROUTE_PAGE_USER_EDIT,
	ROUTE_PAGE_USER_PASSWORD_CHANGE,
	ROUTE_PAGE_USER_RANKING,
	ROUTE_PAGE_GAME_CREATE,
	ROUTE_PAGE_GAME_LIST_OWN,
	ROUTE_PAGE_GAME_LIST_ALL,
	ROUTE_PAGE_GRAPH_OWN,
	ROUTE_PAGE_GRAPH_FULL,
	ROUTE_PAGE_CHALLENGE,
	ROUTE_GAME_CREATE,
	ROUTE_GAME_DELETE,
	ROUTE_GAME_EDIT_TITLE,
	ROUTE_GAME_EDIT_RESULT,
	ROUTE_CHALLENGE_SEND,
	ROUTE_CHALLENGE_ACCEPT,
	ROUTE_CHALLENGE_DECLINE,
	ROUTE_CHALLENGE_SET_RESULT,
	ROUTE_CHALLENGE_AGREE,
	ROUTE_CHALLENGE_DISAGREE,
	ROUTE_RECALCULATE_RATINGS,
	ROUTE_RECALCULATE_GRAPHS
} from './common/routes';

let router = express.Router();

// serve all *.css files
router.get(ROUTE_CSS_ALL, (req: Request, res: Response) => {
	debug(log_now(), 'GET css file...');
	debug(log_now(), `    request: ${req.url}`);
	const filepath = `${get_execution_directory()}/${req.url}`;
	debug(log_now(), `    file to send: ${filepath}`);
	res.status(200);
	if (ConfigurationManager.should_cache_data()) {
		res.setHeader('Cache-Control', 'public, max-age=864000, immutable');
	}
	res.sendFile(filepath);
});

/* ************************************************************************** */
/* Version number */
router.get(ROUTE_VERSION_NUMBER, (_req: Request, res: Response) => {
	debug(log_now(), 'GET version_number...');
	res.status(200);
	if (ConfigurationManager.should_cache_data()) {
		res.setHeader('Cache-Control', 'public, max-age=864000, immutable');
	}
	res.send('xx.yy');
});

/* ************************************************************************** */
/* ICONS */
router.get(ROUTE_FAVICON_ICO, (_req: Request, res: Response) => {
	debug(log_now(), 'GET favicon.ico...');
	const filepath = EnvironmentManager.get_instance().get_icon_favicon();
	debug(log_now(), `    file to send: ${filepath}`);
	res.status(200);
	if (ConfigurationManager.should_cache_data()) {
		res.setHeader('Cache-Control', 'public, max-age=864000, immutable');
	}
	res.sendFile(filepath);
});
router.get(ROUTE_ICON_LOGIN_PAGE, (_req: Request, res: Response) => {
	debug(log_now(), 'GET /icon/login_page...');
	const filepath = EnvironmentManager.get_instance().get_icon_login_page();
	debug(log_now(), `    file to send: ${filepath}`);
	res.status(200);
	if (ConfigurationManager.should_cache_data()) {
		res.setHeader('Cache-Control', 'public, max-age=864000, immutable');
	}
	res.sendFile(filepath);
});
router.get(ROUTE_ICON_HOME_PAGE, (_req: Request, res: Response) => {
	debug(log_now(), 'GET /icon/home_page...');
	const filepath = EnvironmentManager.get_instance().get_icon_home_page();
	debug(log_now(), `    file to send: ${filepath}`);
	res.status(200);
	if (ConfigurationManager.should_cache_data()) {
		res.setHeader('Cache-Control', 'public, max-age=864000, immutable');
	}
	res.sendFile(filepath);
});

/* PAGE TITLES */
router.get(ROUTE_TITLE_LOGIN_PAGE, (_req: Request, res: Response) => {
	debug(log_now(), 'GET /title/login_page...');
	res.status(200);
	if (ConfigurationManager.should_cache_data()) {
		res.setHeader('Cache-Control', 'public, max-age=864000, immutable');
	}
	res.send(EnvironmentManager.get_instance().get_title_login_page());
});
router.get(ROUTE_TITLE_HOME_PAGE, (_req: Request, res: Response) => {
	debug(log_now(), 'GET /title/home_page...');
	res.status(200);
	if (ConfigurationManager.should_cache_data()) {
		res.setHeader('Cache-Control', 'public, max-age=864000, immutable');
	}
	res.send(EnvironmentManager.get_instance().get_title_home_page());
});

/* ************************************************************************** */

// route the login page and the home page
import { get_page_home, get_page_login } from '@server/home';
router.get(ROUTE_ROOT, get_page_login);
router.get(ROUTE_HOME, get_page_home);

// serve all javascript files!
router.get(ROUTE_JS_ALL, (req: Request, res: Response) => {
	debug(log_now(), 'GET a file in js/');
	debug(log_now(), `    request: ${req.url}`);
	const filepath = `${get_execution_directory()}/${req.url}`;
	debug(log_now(), `    file to send: ${filepath}`);
	res.status(200);
	if (ConfigurationManager.should_cache_data()) {
		res.setHeader('Cache-Control', 'public, max-age=864000, immutable');
		res.setHeader('Content-Type', 'text/javascript');
	}
	res.sendFile(filepath);
});

import {
	post_query_user_edit,
	get_query_user_list,
	get_query_user_home,
	post_query_user_ranking,
	get_query_html_user_list
} from '@server/query_user';
router.get(ROUTE_QUERY_USER_LIST, get_query_user_list);
router.get(ROUTE_QUERY_HTML_USER_LIST, get_query_html_user_list);
router.get(ROUTE_QUERY_USER_HOME, get_query_user_home);

// these queries need to be 'post'-ed because we
// need to send (post) information to the server
router.post(ROUTE_QUERY_USER_EDIT, post_query_user_edit);
router.post(ROUTE_QUERY_USER_RANKING, post_query_user_ranking);

// sending, receiving, accepting, setting result of challenges
import {
	get_query_challenge_received,
	get_query_challenge_sent,
	get_query_challenge_pending_result,
	get_query_challenge_confirm_result_other,
	get_query_challenge_confirm_result_self
} from '@server/query_challenges';
router.get(ROUTE_QUERY_CHALLENGE_RECEIVED, get_query_challenge_received);
router.get(ROUTE_QUERY_CHALLENGE_SENT, get_query_challenge_sent);
router.get(ROUTE_QUERY_CHALLENGE_PENDING_RESULT, get_query_challenge_pending_result);
router.get(ROUTE_QUERY_CHALLENGE_CONFIRM_RESULT_OTHER, get_query_challenge_confirm_result_other);
router.get(ROUTE_QUERY_CHALLENGE_CONFIRM_RESULT_SELF, get_query_challenge_confirm_result_self);

import { post_query_game_list_own, post_query_game_list_all } from '@server/query_games';
router.post(ROUTE_QUERY_GAME_LIST_OWN, post_query_game_list_own);
router.post(ROUTE_QUERY_GAME_LIST_ALL, post_query_game_list_all);

import { post_query_graph_full, post_query_graph_own } from '@server/query_graphs';
router.post(ROUTE_QUERY_GRAPH_OWN, post_query_graph_own);
router.post(ROUTE_QUERY_GRAPH_FULL, post_query_graph_full);

// query time controls
import { get_query_html_time_controls, get_query_html_time_controls_unique } from '@server/query_time_control';
router.get(ROUTE_QUERY_HTML_TIME_CONTROLS, get_query_html_time_controls);
router.get(ROUTE_QUERY_HTML_TIME_CONTROLS_UNIQUE, get_query_html_time_controls_unique);

// user login and logout
import { post_user_login, post_user_logout } from '@server/login_logout';
router.post(ROUTE_USER_LOGIN, post_user_login);
router.post(ROUTE_USER_LOGOUT, post_user_logout);

// creation of a new user
import { post_user_create, get_page_user_create } from '@server/users_new';
router.get(ROUTE_PAGE_USER_CREATE, get_page_user_create);
router.post(ROUTE_USER_CREATE, post_user_create);

// edition of an existing user
import { post_user_edit, get_page_user_edit } from '@server/users_edit';
router.get(ROUTE_PAGE_USER_EDIT, get_page_user_edit);
router.post(ROUTE_USER_EDIT, post_user_edit);

// change of password
import { get_page_user_password_change, post_user_password_change } from '@server/users_password_change';
router.get(ROUTE_PAGE_USER_PASSWORD_CHANGE, get_page_user_password_change);
router.post(ROUTE_USER_PASSWORD_CHANGE, post_user_password_change);

// retrieve ranking of players
import { get_page_user_ranking } from '@server/users_ranking';
router.get(ROUTE_PAGE_USER_RANKING, get_page_user_ranking);

// create a new game
import { get_page_game_create, post_game_create } from '@server/games';
router.get(ROUTE_PAGE_GAME_CREATE, get_page_game_create);
router.post(ROUTE_GAME_CREATE, post_game_create);

// delete a game
import { post_game_delete } from '@server/games';
router.post(ROUTE_GAME_DELETE, post_game_delete);

// edit a game's title
import { post_game_edit_title } from '@server/games';
router.post(ROUTE_GAME_EDIT_TITLE, post_game_edit_title);

// editing a game's result
import { post_game_edit_result } from '@server/games';
router.post(ROUTE_GAME_EDIT_RESULT, post_game_edit_result);

// retrieve list of games
import { get_page_game_list_all, get_page_game_list_own } from '@server/games';
router.get(ROUTE_PAGE_GAME_LIST_OWN, get_page_game_list_own);
router.get(ROUTE_PAGE_GAME_LIST_ALL, get_page_game_list_all);

// retrieve graphs of the webpage
import { get_page_graph_own, get_page_graph_full } from '@server/graphs';
router.get(ROUTE_PAGE_GRAPH_OWN, get_page_graph_own);
router.get(ROUTE_PAGE_GRAPH_FULL, get_page_graph_full);

// challenges management
import { get_page_challenge } from '@server/challenges';
router.get(ROUTE_PAGE_CHALLENGE, get_page_challenge);
import { post_challenge_send } from '@server/challenges';
router.post(ROUTE_CHALLENGE_SEND, post_challenge_send);
import { post_challenge_accept, post_challenge_decline } from '@server/challenges';
router.post(ROUTE_CHALLENGE_ACCEPT, post_challenge_accept);
router.post(ROUTE_CHALLENGE_DECLINE, post_challenge_decline);
import { post_challenge_set_result } from '@server/challenges';
router.post(ROUTE_CHALLENGE_SET_RESULT, post_challenge_set_result);
import { post_challenge_agree, post_challenge_disagree } from '@server/challenges';
router.post(ROUTE_CHALLENGE_AGREE, post_challenge_agree);
router.post(ROUTE_CHALLENGE_DISAGREE, post_challenge_disagree);

// recalculation of all Elo ratings
import { post_recalculate_ratings } from '@server/games';
router.post(ROUTE_RECALCULATE_RATINGS, post_recalculate_ratings);

// recalculation of all graphs
import { post_recalculate_graphs } from '@server/graphs';
router.post(ROUTE_RECALCULATE_GRAPHS, post_recalculate_graphs);

export { router };
