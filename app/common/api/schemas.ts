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

import { z } from 'zod';

import {
	ChallengeAcceptInputSchema,
	ChallengeAgreeResultInputSchema,
	ChallengeDeclineInputSchema,
	ChallengeDisagreeResultInputSchema,
	ChallengeSendInputSchema,
	ChallengeSetResultInputSchema
} from '@common/schemas/challenges';
import {
	GameCreateInputSchema,
	GameDeleteInputSchema,
	GameEditResultInputSchema,
	GameEditTitleInputSchema
} from '@common/schemas/games';
import { Route, Routes } from '@common/routes';
import { UserLoginInputSchema } from '@common/schemas/login_logout';
import { QueryGamesListAllInputSchema, QueryGamesListOwnInputSchema } from '@common/schemas/query_games';
import { QueryGraphInputSchema } from '@common/schemas/query_graphs';
import { QueryUserEditInputSchema, QueryUserRankingInputSchema } from '@common/schemas/query_user';
import { UserCreateInputSchema, UserEditInputSchema, UserPasswordChangeInputSchema } from '@common/schemas/user';

export const EmptySchema = z.object({}).strict();

type ApiSchemaEntry = {
	body: z.ZodTypeAny;
	result: z.ZodTypeAny;
};

/**
 * For each API route, each field defines the type of
 * - body: the body field
 * - result: the type (as a schema) of the data returned
 *
 * When `body` is "Empty", then there is no body to be parsed in `body.body`.
 * When `result` is "Empty", then there is nothing to parse from `result.json()`.
 */
export const API_SCHEMA = {
	[Routes.CSS_ALL]: {
		result: EmptySchema,
		body: EmptySchema
	},
	[Routes.VERSION_NUMBER]: {
		result: EmptySchema,
		body: EmptySchema
	},
	[Routes.FAVICON_ICO]: {
		result: EmptySchema,
		body: EmptySchema
	},
	[Routes.ICON_LOGIN_PAGE]: {
		result: EmptySchema,
		body: EmptySchema
	},
	[Routes.ICON_HOME_PAGE]: {
		result: EmptySchema,
		body: EmptySchema
	},
	[Routes.TITLE_LOGIN_PAGE]: {
		result: EmptySchema,
		body: EmptySchema
	},
	[Routes.TITLE_HOME_PAGE]: {
		result: EmptySchema,
		body: EmptySchema
	},
	[Routes.ROOT]: {
		result: EmptySchema,
		body: EmptySchema
	},
	[Routes.HOME]: {
		result: EmptySchema,
		body: EmptySchema
	},
	[Routes.JS_ALL]: {
		result: EmptySchema,
		body: EmptySchema
	},
	[Routes.QUERY_USER_LIST]: {
		result: EmptySchema,
		body: EmptySchema
	},
	[Routes.QUERY_HTML_USER_LIST]: {
		result: EmptySchema,
		body: EmptySchema
	},
	[Routes.QUERY_USER_HOME]: {
		result: EmptySchema,
		body: EmptySchema
	},
	[Routes.QUERY_USER_EDIT]: {
		result: QueryUserEditInputSchema,
		body: QueryUserEditInputSchema
	},
	[Routes.QUERY_USER_RANKING]: {
		result: QueryUserRankingInputSchema,
		body: QueryUserRankingInputSchema
	},
	[Routes.QUERY_CHALLENGE_RECEIVED]: {
		result: EmptySchema,
		body: EmptySchema
	},
	[Routes.QUERY_CHALLENGE_SENT]: {
		result: EmptySchema,
		body: EmptySchema
	},
	[Routes.QUERY_CHALLENGE_PENDING_RESULT]: {
		result: EmptySchema,
		body: EmptySchema
	},
	[Routes.QUERY_CHALLENGE_CONFIRM_RESULT_OTHER]: {
		result: EmptySchema,
		body: EmptySchema
	},
	[Routes.QUERY_CHALLENGE_CONFIRM_RESULT_SELF]: {
		result: EmptySchema,
		body: EmptySchema
	},
	[Routes.QUERY_GAME_LIST_OWN]: {
		result: EmptySchema,
		body: QueryGamesListOwnInputSchema
	},
	[Routes.QUERY_GAME_LIST_ALL]: {
		result: EmptySchema,
		body: QueryGamesListAllInputSchema
	},
	[Routes.QUERY_GRAPH_OWN]: {
		result: EmptySchema,
		body: QueryGraphInputSchema
	},
	[Routes.QUERY_GRAPH_FULL]: {
		result: EmptySchema,
		body: QueryGraphInputSchema
	},
	[Routes.QUERY_HTML_TIME_CONTROLS]: {
		result: EmptySchema,
		body: EmptySchema
	},
	[Routes.QUERY_HTML_TIME_CONTROLS_UNIQUE]: {
		result: EmptySchema,
		body: EmptySchema
	},
	[Routes.USER_LOGIN]: {
		result: EmptySchema,
		body: UserLoginInputSchema
	},
	[Routes.USER_LOGOUT]: {
		result: EmptySchema,
		body: EmptySchema
	},
	[Routes.USER_CREATE]: {
		result: EmptySchema,
		body: UserCreateInputSchema
	},
	[Routes.USER_EDIT]: {
		result: EmptySchema,
		body: UserEditInputSchema
	},
	[Routes.USER_PASSWORD_CHANGE]: {
		result: EmptySchema,
		body: UserPasswordChangeInputSchema
	},
	[Routes.PAGE_USER_CREATE]: {
		result: EmptySchema,
		body: EmptySchema
	},
	[Routes.PAGE_USER_EDIT]: {
		result: EmptySchema,
		body: EmptySchema
	},
	[Routes.PAGE_USER_PASSWORD_CHANGE]: {
		result: EmptySchema,
		body: EmptySchema
	},
	[Routes.PAGE_USER_RANKING]: {
		result: EmptySchema,
		body: EmptySchema
	},
	[Routes.PAGE_GAME_CREATE]: {
		result: EmptySchema,
		body: EmptySchema
	},
	[Routes.PAGE_GAME_LIST_OWN]: {
		result: EmptySchema,
		body: EmptySchema
	},
	[Routes.PAGE_GAME_LIST_ALL]: {
		result: EmptySchema,
		body: EmptySchema
	},
	[Routes.PAGE_GRAPH_OWN]: {
		result: EmptySchema,
		body: EmptySchema
	},
	[Routes.PAGE_GRAPH_FULL]: {
		result: EmptySchema,
		body: EmptySchema
	},
	[Routes.PAGE_CHALLENGE]: {
		result: EmptySchema,
		body: EmptySchema
	},
	[Routes.GAME_CREATE]: {
		result: EmptySchema,
		body: GameCreateInputSchema
	},
	[Routes.GAME_DELETE]: {
		result: EmptySchema,
		body: GameDeleteInputSchema
	},
	[Routes.GAME_EDIT_TITLE]: {
		result: EmptySchema,
		body: GameEditTitleInputSchema
	},
	[Routes.GAME_EDIT_RESULT]: {
		result: EmptySchema,
		body: GameEditResultInputSchema
	},
	[Routes.CHALLENGE_SEND]: {
		result: EmptySchema,
		body: ChallengeSendInputSchema
	},
	[Routes.CHALLENGE_ACCEPT]: {
		result: EmptySchema,
		body: ChallengeAcceptInputSchema
	},
	[Routes.CHALLENGE_DECLINE]: {
		result: EmptySchema,
		body: ChallengeDeclineInputSchema
	},
	[Routes.CHALLENGE_SET_RESULT]: {
		result: EmptySchema,
		body: ChallengeSetResultInputSchema
	},
	[Routes.CHALLENGE_AGREE]: {
		result: EmptySchema,
		body: ChallengeAgreeResultInputSchema
	},
	[Routes.CHALLENGE_DISAGREE]: {
		result: EmptySchema,
		body: ChallengeDisagreeResultInputSchema
	},
	[Routes.RECALCULATE_RATINGS]: {
		result: EmptySchema,
		body: EmptySchema
	},
	[Routes.RECALCULATE_GRAPHS]: {
		result: EmptySchema,
		body: EmptySchema
	}
} satisfies Record<Route, ApiSchemaEntry>;

export const BodySchemaOf = <R extends Route>(route: R) => API_SCHEMA[route].body;
export const ResultSchemaOf = <R extends Route>(route: R) => API_SCHEMA[route].result;
