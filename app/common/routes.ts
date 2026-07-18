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

export const Routes = {
	CSS_ALL: '/css/*.css',
	VERSION_NUMBER: '/version_number',
	FAVICON_ICO: '/favicon.ico',
	ICON_LOGIN_PAGE: '/icon/login_page',
	ICON_HOME_PAGE: '/icon/home_page',
	TITLE_LOGIN_PAGE: '/title/login_page',
	TITLE_HOME_PAGE: '/title/home_page',
	ROOT: '/',
	HOME: '/home',
	JS_ALL: '/js/*',

	QUERY_USER_LIST: '/query/user/list',
	QUERY_HTML_USER_LIST: '/query/html/user/list',
	QUERY_USER_HOME: '/query/user/home',
	QUERY_USER_EDIT: '/query/user/edit',
	QUERY_USER_RANKING: '/query/user/ranking',
	QUERY_CHALLENGE_RECEIVED: '/query/challenge/received',
	QUERY_CHALLENGE_SENT: '/query/challenge/sent',
	QUERY_CHALLENGE_PENDING_RESULT: '/query/challenge/pending_result',
	QUERY_CHALLENGE_CONFIRM_RESULT_OTHER: '/query/challenge/confirm_result/other',
	QUERY_CHALLENGE_CONFIRM_RESULT_SELF: '/query/challenge/confirm_result/self',
	QUERY_GAME_LIST_OWN: '/query/game/list/own',
	QUERY_GAME_LIST_ALL: '/query/game/list/all',
	QUERY_GRAPH_OWN: '/query/graph/own',
	QUERY_GRAPH_FULL: '/query/graph/full',
	QUERY_HTML_TIME_CONTROLS: '/query/html/time_controls',
	QUERY_HTML_TIME_CONTROLS_UNIQUE: '/query/html/time_controls_unique',

	USER_LOGIN: '/user/login',
	USER_LOGOUT: '/user/logout',
	USER_CREATE: '/user/create',
	USER_EDIT: '/user/edit',
	USER_PASSWORD_CHANGE: '/user/password_change',

	PAGE_USER_CREATE: '/page/user/create',
	PAGE_USER_EDIT: '/page/user/edit',
	PAGE_USER_PASSWORD_CHANGE: '/page/user/password_change',
	PAGE_USER_RANKING: '/page/user/ranking',
	PAGE_GAME_CREATE: '/page/game/create',
	PAGE_GAME_LIST_OWN: '/page/game/list/own',
	PAGE_GAME_LIST_ALL: '/page/game/list/all',
	PAGE_GRAPH_OWN: '/page/graph/own',
	PAGE_GRAPH_FULL: '/page/graph/full',
	PAGE_CHALLENGE: '/page/challenge',

	GAME_CREATE: '/game/create',
	GAME_DELETE: '/game/delete',
	GAME_EDIT_TITLE: '/game/edit_title',
	GAME_EDIT_RESULT: '/game/edit_result',

	CHALLENGE_SEND: '/challenge/send',
	CHALLENGE_ACCEPT: '/challenge/accept',
	CHALLENGE_DECLINE: '/challenge/decline',
	CHALLENGE_SET_RESULT: '/challenge/set_result',
	CHALLENGE_AGREE: '/challenge/agree',
	CHALLENGE_DISAGREE: '/challenge/disagree',

	RECALCULATE_RATINGS: '/recalculate/ratings',
	RECALCULATE_GRAPHS: '/recalculate/graphs'
} as const;
