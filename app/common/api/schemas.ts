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

export type ApiMethod = 'GET' | 'POST';

type ApiSchemaEntry = {
	input: z.ZodTypeAny;
	output: z.ZodTypeAny;
	method: ApiMethod;
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
		output: EmptySchema,
		input: EmptySchema,
		method: 'GET'
	},
	[Routes.VERSION_NUMBER]: {
		output: EmptySchema,
		input: EmptySchema,
		method: 'GET'
	},
	[Routes.FAVICON_ICO]: {
		output: EmptySchema,
		input: EmptySchema,
		method: 'GET'
	},
	[Routes.ICON_LOGIN_PAGE]: {
		output: EmptySchema,
		input: EmptySchema,
		method: 'GET'
	},
	[Routes.ICON_HOME_PAGE]: {
		output: EmptySchema,
		input: EmptySchema,
		method: 'GET'
	},
	[Routes.TITLE_LOGIN_PAGE]: {
		output: EmptySchema,
		input: EmptySchema,
		method: 'GET'
	},
	[Routes.TITLE_HOME_PAGE]: {
		output: EmptySchema,
		input: EmptySchema,
		method: 'GET'
	},
	[Routes.ROOT]: {
		output: EmptySchema,
		input: EmptySchema,
		method: 'GET'
	},
	[Routes.HOME]: {
		output: EmptySchema,
		input: EmptySchema,
		method: 'GET'
	},
	[Routes.JS_ALL]: {
		output: EmptySchema,
		input: EmptySchema,
		method: 'GET'
	},
	[Routes.QUERY_USER_LIST]: {
		output: EmptySchema,
		input: EmptySchema,
		method: 'GET'
	},
	[Routes.QUERY_HTML_USER_LIST]: {
		output: EmptySchema,
		input: EmptySchema,
		method: 'GET'
	},
	[Routes.QUERY_USER_HOME]: {
		output: EmptySchema,
		input: EmptySchema,
		method: 'GET'
	},
	[Routes.QUERY_USER_EDIT]: {
		output: QueryUserEditInputSchema,
		input: QueryUserEditInputSchema,
		method: 'POST'
	},
	[Routes.QUERY_USER_RANKING]: {
		output: QueryUserRankingInputSchema,
		input: QueryUserRankingInputSchema,
		method: 'POST'
	},
	[Routes.QUERY_CHALLENGE_RECEIVED]: {
		output: EmptySchema,
		input: EmptySchema,
		method: 'GET'
	},
	[Routes.QUERY_CHALLENGE_SENT]: {
		output: EmptySchema,
		input: EmptySchema,
		method: 'GET'
	},
	[Routes.QUERY_CHALLENGE_PENDING_RESULT]: {
		output: EmptySchema,
		input: EmptySchema,
		method: 'GET'
	},
	[Routes.QUERY_CHALLENGE_CONFIRM_RESULT_OTHER]: {
		output: EmptySchema,
		input: EmptySchema,
		method: 'GET'
	},
	[Routes.QUERY_CHALLENGE_CONFIRM_RESULT_SELF]: {
		output: EmptySchema,
		input: EmptySchema,
		method: 'GET'
	},
	[Routes.QUERY_GAME_LIST_OWN]: {
		output: EmptySchema,
		input: QueryGamesListOwnInputSchema,
		method: 'POST'
	},
	[Routes.QUERY_GAME_LIST_ALL]: {
		output: EmptySchema,
		input: QueryGamesListAllInputSchema,
		method: 'POST'
	},
	[Routes.QUERY_GRAPH_OWN]: {
		output: EmptySchema,
		input: QueryGraphInputSchema,
		method: 'POST'
	},
	[Routes.QUERY_GRAPH_FULL]: {
		output: EmptySchema,
		input: QueryGraphInputSchema,
		method: 'POST'
	},
	[Routes.QUERY_HTML_TIME_CONTROLS]: {
		output: EmptySchema,
		input: EmptySchema,
		method: 'GET'
	},
	[Routes.QUERY_HTML_TIME_CONTROLS_UNIQUE]: {
		output: EmptySchema,
		input: EmptySchema,
		method: 'GET'
	},
	[Routes.USER_LOGIN]: {
		output: EmptySchema,
		input: UserLoginInputSchema,
		method: 'POST'
	},
	[Routes.USER_LOGOUT]: {
		output: EmptySchema,
		input: EmptySchema,
		method: 'POST'
	},
	[Routes.USER_CREATE]: {
		output: EmptySchema,
		input: UserCreateInputSchema,
		method: 'POST'
	},
	[Routes.USER_EDIT]: {
		output: EmptySchema,
		input: UserEditInputSchema,
		method: 'POST'
	},
	[Routes.USER_PASSWORD_CHANGE]: {
		output: EmptySchema,
		input: UserPasswordChangeInputSchema,
		method: 'POST'
	},
	[Routes.PAGE_USER_CREATE]: {
		output: EmptySchema,
		input: EmptySchema,
		method: 'GET'
	},
	[Routes.PAGE_USER_EDIT]: {
		output: EmptySchema,
		input: EmptySchema,
		method: 'GET'
	},
	[Routes.PAGE_USER_PASSWORD_CHANGE]: {
		output: EmptySchema,
		input: EmptySchema,
		method: 'GET'
	},
	[Routes.PAGE_USER_RANKING]: {
		output: EmptySchema,
		input: EmptySchema,
		method: 'GET'
	},
	[Routes.PAGE_GAME_CREATE]: {
		output: EmptySchema,
		input: EmptySchema,
		method: 'GET'
	},
	[Routes.PAGE_GAME_LIST_OWN]: {
		output: EmptySchema,
		input: EmptySchema,
		method: 'GET'
	},
	[Routes.PAGE_GAME_LIST_ALL]: {
		output: EmptySchema,
		input: EmptySchema,
		method: 'GET'
	},
	[Routes.PAGE_GRAPH_OWN]: {
		output: EmptySchema,
		input: EmptySchema,
		method: 'GET'
	},
	[Routes.PAGE_GRAPH_FULL]: {
		output: EmptySchema,
		input: EmptySchema,
		method: 'GET'
	},
	[Routes.PAGE_CHALLENGE]: {
		output: EmptySchema,
		input: EmptySchema,
		method: 'GET'
	},
	[Routes.GAME_CREATE]: {
		output: EmptySchema,
		input: GameCreateInputSchema,
		method: 'POST'
	},
	[Routes.GAME_DELETE]: {
		output: EmptySchema,
		input: GameDeleteInputSchema,
		method: 'POST'
	},
	[Routes.GAME_EDIT_TITLE]: {
		output: EmptySchema,
		input: GameEditTitleInputSchema,
		method: 'POST'
	},
	[Routes.GAME_EDIT_RESULT]: {
		output: EmptySchema,
		input: GameEditResultInputSchema,
		method: 'POST'
	},
	[Routes.CHALLENGE_SEND]: {
		output: EmptySchema,
		input: ChallengeSendInputSchema,
		method: 'POST'
	},
	[Routes.CHALLENGE_ACCEPT]: {
		output: EmptySchema,
		input: ChallengeAcceptInputSchema,
		method: 'POST'
	},
	[Routes.CHALLENGE_DECLINE]: {
		output: EmptySchema,
		input: ChallengeDeclineInputSchema,
		method: 'POST'
	},
	[Routes.CHALLENGE_SET_RESULT]: {
		output: EmptySchema,
		input: ChallengeSetResultInputSchema,
		method: 'POST'
	},
	[Routes.CHALLENGE_AGREE]: {
		output: EmptySchema,
		input: ChallengeAgreeResultInputSchema,
		method: 'POST'
	},
	[Routes.CHALLENGE_DISAGREE]: {
		output: EmptySchema,
		input: ChallengeDisagreeResultInputSchema,
		method: 'POST'
	},
	[Routes.RECALCULATE_RATINGS]: {
		output: EmptySchema,
		input: EmptySchema,
		method: 'POST'
	},
	[Routes.RECALCULATE_GRAPHS]: {
		output: EmptySchema,
		input: EmptySchema,
		method: 'POST'
	}
} satisfies Record<Route, ApiSchemaEntry>;

type InputSchemaFor<R extends Route> = (typeof API_SCHEMA)[R]['input'];
type OutputSchemaFor<R extends Route> = (typeof API_SCHEMA)[R]['output'];

export const InputSchemaOf = <R extends Route>(route: R): InputSchemaFor<R> => API_SCHEMA[route].input;
export const OutputSchemaOf = <R extends Route>(route: R): OutputSchemaFor<R> => API_SCHEMA[route].output;
export const MethodTypeOf = <R extends Route>(route: R): ApiMethod => API_SCHEMA[route].method;
