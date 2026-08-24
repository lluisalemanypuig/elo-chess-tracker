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
const debug = Debug('ELO_CHESS_TRACKER:router');
import { logNow } from '@common/utils/time';

import { EnvironmentManager, getExecutionDirectory } from '@server/managers/environment-manager';
import { ConfigurationManager } from '@server/managers/configuration-manager';
import { Route, ROUTES } from '@common/api/routes';
import { entryPointAction, entryPointHTMX, entryPointPage } from '@app/entry-point';
import { UserSession } from '@server/models/user';
import { InputTypeOf, OutputTypeOf } from '@common/api/types';
import { methodTypeOf } from '@common/api/schemas-endpoints';

import { postUserLogin, postUserLogout } from '@server/login-logout';
import {
	postQueryUserEdit,
	getQueryUserList,
	getQueryUserHome,
	postQueryUserRanking,
	getQueryHtmlUserList
} from '@server/query-user';
import {
	getQueryChallengeReceived,
	getQueryChallengeSent,
	getQueryChallengePendingResult,
	getQueryChallengeConfirmResultOther,
	getQueryChallengeConfirmResultSelf
} from '@server/query-challenges';
import { getQueryHtmlTimeControls, getQueryHtmlTimeControlsUnique } from '@server/query-time-control';
import { postQueryGraphFull, postQueryGraphOwn } from '@server/query-graphs';
import { postQueryGameListOwn, postQueryGameListAll } from '@server/query-games';
import { postUserCreate, getPageUserCreate } from '@server/users-new';
import { postUserEdit, getPageUserEdit } from '@server/users-edit';
import { getPageUserPasswordChange, postUserPasswordChange } from '@server/users-password-change';
import { getPageUserRanking } from '@server/users-ranking';
import {
	getPageGameListAll,
	getPageGameListOwn,
	getPageGameCreate,
	postGameCreate,
	postGameDelete,
	postGameEditTitle,
	postGameEditResult,
	postRecalculateRatings
} from '@server/games';
import { getPageGraphOwn, getPageGraphFull, postRecalculateGraphs } from '@server/graphs';
import {
	getPageChallenge,
	postChallengeAccept,
	postChallengeAgree,
	postChallengeDecline,
	postChallengeDisagree,
	postChallengeSend,
	postChallengeSetResult
} from '@server/challenges';

/* ************************************************************************** */
// ROUTER OBJECT

let router = express.Router();

async function defineEndpointPage(route: Route, action: (u: UserSession) => Promise<string>) {
	router.get(route, (req: Request, res: Response) => {
		return entryPointPage(route, action, req, res);
	});
}

async function defineEndpointHTMX<R extends Route>(route: R, action: (u: UserSession) => Promise<string>) {
	router.get(route, (req: Request, res: Response) => {
		return entryPointHTMX(route, action, req, res);
	});
}

async function defineEndpointAction<R extends Route>(
	route: R,
	action: (u: UserSession, data: InputTypeOf<R>) => Promise<OutputTypeOf<R>>
) {
	const method = methodTypeOf(route);
	if (method === 'POST') {
		router.post(route, (req: Request, res: Response) => {
			entryPointAction(route, action, req, res);
		});
	} else if (method === 'GET') {
		router.get(route, (req: Request, res: Response) => {
			entryPointAction(route, action, req, res);
		});
	}
}

/* ************************************************************************** */
// ROUTER CONFIGURATION STARTS HERE

// serve all *.css files
router.get(ROUTES.CSS_ALL, (req: Request, res: Response) => {
	debug(logNow(), 'GET css file...');
	debug(logNow(), `    request: ${req.url}`);
	const filepath = `${getExecutionDirectory()}/${req.url}`;
	debug(logNow(), `    file to send: ${filepath}`);
	res.status(200);
	if (ConfigurationManager.shouldCacheData()) {
		res.setHeader('Cache-Control', 'public, max-age=864000, immutable');
	}
	res.sendFile(filepath);
});

/* ************************************************************************** */
/* Version number */
router.get(ROUTES.VERSION_NUMBER, (_req: Request, res: Response) => {
	debug(logNow(), `GET ${ROUTES.VERSION_NUMBER}...`);
	res.status(200);
	if (ConfigurationManager.shouldCacheData()) {
		res.setHeader('Cache-Control', 'public, max-age=864000, immutable');
	}
	res.send('xx.yy');
});

/* ************************************************************************** */
/* ICONS */
router.get(ROUTES.FAVICON_ICO, (_req: Request, res: Response) => {
	debug(logNow(), `GET ${ROUTES.FAVICON_ICO}...`);
	const filepath = EnvironmentManager.getInstance().getIconFavicon();
	debug(logNow(), `    file to send: ${filepath}`);
	res.status(200);
	if (ConfigurationManager.shouldCacheData()) {
		res.setHeader('Cache-Control', 'public, max-age=864000, immutable');
	}
	res.sendFile(filepath);
});
router.get(ROUTES.ICON_LOGIN_PAGE, (_req: Request, res: Response) => {
	debug(logNow(), `GET ${ROUTES.ICON_LOGIN_PAGE}...`);
	const filepath = EnvironmentManager.getInstance().getIconLoginPage();
	debug(logNow(), `    file to send: ${filepath}`);
	res.status(200);
	if (ConfigurationManager.shouldCacheData()) {
		res.setHeader('Cache-Control', 'public, max-age=864000, immutable');
	}
	res.sendFile(filepath);
});
router.get(ROUTES.ICON_HOME_PAGE, (_req: Request, res: Response) => {
	debug(logNow(), `GET ${ROUTES.ICON_HOME_PAGE}...`);
	const filepath = EnvironmentManager.getInstance().getIconHomePage();
	debug(logNow(), `    file to send: ${filepath}`);
	res.status(200);
	if (ConfigurationManager.shouldCacheData()) {
		res.setHeader('Cache-Control', 'public, max-age=864000, immutable');
	}
	res.sendFile(filepath);
});

/* PAGE TITLES */
router.get(ROUTES.TITLE_LOGIN_PAGE, (_req: Request, res: Response) => {
	debug(logNow(), `GET ${ROUTES.TITLE_LOGIN_PAGE}...`);
	res.status(200);
	if (ConfigurationManager.shouldCacheData()) {
		res.setHeader('Cache-Control', 'public, max-age=864000, immutable');
	}
	res.send(EnvironmentManager.getInstance().getTitleLoginPage());
});
router.get(ROUTES.TITLE_HOME_PAGE, (_req: Request, res: Response) => {
	debug(logNow(), `GET ${ROUTES.TITLE_HOME_PAGE}...`);
	res.status(200);
	if (ConfigurationManager.shouldCacheData()) {
		res.setHeader('Cache-Control', 'public, max-age=864000, immutable');
	}
	res.send(EnvironmentManager.getInstance().getTitleHomePage());
});

/* ************************************************************************** */

// route the login page and the home page
import { getPageHome, getPageLogin } from '@server/home';
router.get(ROUTES.ROOT, getPageLogin);
defineEndpointPage(ROUTES.HOME, getPageHome);

// serve all javascript files!
router.get(ROUTES.JS_ALL, (req: Request, res: Response) => {
	debug(logNow(), `GET ${ROUTES.JS_ALL}: file ${req.url}`);
	debug(logNow(), `    request: ${req.url}`);
	const filepath = `${getExecutionDirectory()}/${req.url}`;
	debug(logNow(), `    file to send: ${filepath}`);
	res.status(200);
	if (ConfigurationManager.shouldCacheData()) {
		res.setHeader('Cache-Control', 'public, max-age=864000, immutable');
		res.setHeader('Content-Type', 'text/javascript');
	}
	res.sendFile(filepath);
});

defineEndpointAction(ROUTES.QUERY_USER_HOME, getQueryUserHome);
defineEndpointAction(ROUTES.QUERY_USER_LIST, getQueryUserList);
defineEndpointHTMX(ROUTES.QUERY_HTML_USER_LIST, getQueryHtmlUserList);
defineEndpointAction(ROUTES.QUERY_USER_EDIT, postQueryUserEdit);
defineEndpointAction(ROUTES.QUERY_USER_RANKING, postQueryUserRanking);

// sending, receiving, accepting, setting result of challenges
defineEndpointAction(ROUTES.QUERY_CHALLENGE_RECEIVED, getQueryChallengeReceived);
defineEndpointAction(ROUTES.QUERY_CHALLENGE_SENT, getQueryChallengeSent);
defineEndpointAction(ROUTES.QUERY_CHALLENGE_PENDING_RESULT, getQueryChallengePendingResult);
defineEndpointAction(ROUTES.QUERY_CHALLENGE_CONFIRM_RESULT_OTHER, getQueryChallengeConfirmResultOther);
defineEndpointAction(ROUTES.QUERY_CHALLENGE_CONFIRM_RESULT_SELF, getQueryChallengeConfirmResultSelf);

defineEndpointAction(ROUTES.QUERY_GAME_LIST_OWN, postQueryGameListOwn);
defineEndpointAction(ROUTES.QUERY_GAME_LIST_ALL, postQueryGameListAll);

defineEndpointAction(ROUTES.QUERY_GRAPH_OWN, postQueryGraphOwn);
defineEndpointAction(ROUTES.QUERY_GRAPH_FULL, postQueryGraphFull);

// query time controls
defineEndpointHTMX(ROUTES.QUERY_HTML_TIME_CONTROLS, getQueryHtmlTimeControls);
defineEndpointHTMX(ROUTES.QUERY_HTML_TIME_CONTROLS_UNIQUE, getQueryHtmlTimeControlsUnique);

// user login and logout
router.post(ROUTES.USER_LOGIN, postUserLogin);
defineEndpointAction(ROUTES.USER_LOGOUT, postUserLogout);

// user management
defineEndpointPage(ROUTES.PAGE_USER_CREATE, getPageUserCreate);
defineEndpointAction(ROUTES.USER_CREATE, postUserCreate);
defineEndpointPage(ROUTES.PAGE_USER_EDIT, getPageUserEdit);
defineEndpointAction(ROUTES.USER_EDIT, postUserEdit);

// change of password
defineEndpointPage(ROUTES.PAGE_USER_PASSWORD_CHANGE, getPageUserPasswordChange);
defineEndpointAction(ROUTES.USER_PASSWORD_CHANGE, postUserPasswordChange);

// retrieve ranking of players
defineEndpointPage(ROUTES.PAGE_USER_RANKING, getPageUserRanking);

defineEndpointPage(ROUTES.PAGE_GAME_LIST_OWN, getPageGameListOwn);
defineEndpointPage(ROUTES.PAGE_GAME_LIST_ALL, getPageGameListAll);
defineEndpointPage(ROUTES.PAGE_GAME_CREATE, getPageGameCreate);
defineEndpointAction(ROUTES.GAME_CREATE, postGameCreate);
defineEndpointAction(ROUTES.GAME_EDIT_TITLE, postGameEditTitle);
defineEndpointAction(ROUTES.GAME_EDIT_RESULT, postGameEditResult);
defineEndpointAction(ROUTES.GAME_DELETE, postGameDelete);
defineEndpointAction(ROUTES.RECALCULATE_RATINGS, postRecalculateRatings);

// challenges management
defineEndpointPage(ROUTES.PAGE_CHALLENGE, getPageChallenge);
defineEndpointAction(ROUTES.CHALLENGE_SEND, postChallengeSend);
defineEndpointAction(ROUTES.CHALLENGE_ACCEPT, postChallengeAccept);
defineEndpointAction(ROUTES.CHALLENGE_DECLINE, postChallengeDecline);
defineEndpointAction(ROUTES.CHALLENGE_SET_RESULT, postChallengeSetResult);
defineEndpointAction(ROUTES.CHALLENGE_AGREE, postChallengeAgree);
defineEndpointAction(ROUTES.CHALLENGE_DISAGREE, postChallengeDisagree);

// graphs management
defineEndpointPage(ROUTES.PAGE_GRAPH_OWN, getPageGraphOwn);
defineEndpointPage(ROUTES.PAGE_GRAPH_FULL, getPageGraphFull);
defineEndpointAction(ROUTES.RECALCULATE_GRAPHS, postRecalculateGraphs);

export { router };
