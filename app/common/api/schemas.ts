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
import { UserLoginInputSchema, UserLoginOutputSchema, UserLogoutOutputSchema } from '@common/schemas/login_logout';
import {
	QueryGamesListAllInputSchema,
	QueryGamesListOutputSchema,
	QueryGamesListOwnInputSchema
} from '@common/schemas/query_games';
import {
	QueryGraphInputFullSchema,
	QueryGraphInputOwnSchema,
	QueryGraphOutputSchema
} from '@common/schemas/query_graphs';
import {
	QueryUserEditInputSchema,
	QueryUserEditOutputSchema,
	QueryUserHomeOutputSchema,
	QueryUserListOutputSchema,
	QueryUserRankingInputSchema,
	QueryUserRankingOutputSchema
} from '@common/schemas/query_user';
import { UserCreateInputSchema, UserEditInputSchema, UserPasswordChangeInputSchema } from '@common/schemas/user';
import {
	QueryChallengesConfirmResultOtherOutputSchema,
	QueryChallengesConfirmResultSelfOutputSchema,
	QueryChallengesPendingResultOutputSchema,
	QueryChallengesReceivedOutputSchema,
	QueryChallengesSentOutputSchema
} from '@common/schemas/query_challenges';

export const EmptySchema = z.object({}).strict();
export const StringSchema = z.string();

export type ApiMethod = 'GET' | 'POST';

type ApiSchemaEntry = {
	input: z.ZodTypeAny;
	output: z.ZodTypeAny;
	method: ApiMethod;
};

export const API_SCHEMA = {
	[Routes.CSS_ALL]: {
		input: EmptySchema,
		output: EmptySchema,
		method: 'GET'
	},
	[Routes.VERSION_NUMBER]: {
		input: EmptySchema,
		output: EmptySchema,
		method: 'GET'
	},
	[Routes.FAVICON_ICO]: {
		input: EmptySchema,
		output: EmptySchema,
		method: 'GET'
	},
	[Routes.ICON_LOGIN_PAGE]: {
		input: EmptySchema,
		output: EmptySchema,
		method: 'GET'
	},
	[Routes.ICON_HOME_PAGE]: {
		input: EmptySchema,
		output: EmptySchema,
		method: 'GET'
	},
	[Routes.TITLE_LOGIN_PAGE]: {
		input: EmptySchema,
		output: EmptySchema,
		method: 'GET'
	},
	[Routes.TITLE_HOME_PAGE]: {
		input: EmptySchema,
		output: EmptySchema,
		method: 'GET'
	},
	[Routes.ROOT]: {
		input: EmptySchema,
		output: EmptySchema,
		method: 'GET'
	},
	[Routes.HOME]: {
		input: EmptySchema,
		output: EmptySchema,
		method: 'GET'
	},
	[Routes.JS_ALL]: {
		input: EmptySchema,
		output: EmptySchema,
		method: 'GET'
	},
	[Routes.QUERY_USER_LIST]: {
		input: EmptySchema,
		output: QueryUserListOutputSchema,
		method: 'GET'
	},
	[Routes.QUERY_HTML_USER_LIST]: {
		input: EmptySchema,
		output: StringSchema,
		method: 'GET'
	},
	[Routes.QUERY_USER_HOME]: {
		input: EmptySchema,
		output: QueryUserHomeOutputSchema,
		method: 'GET'
	},
	[Routes.QUERY_USER_EDIT]: {
		input: QueryUserEditInputSchema,
		output: QueryUserEditOutputSchema,
		method: 'POST'
	},
	[Routes.QUERY_USER_RANKING]: {
		input: QueryUserRankingInputSchema,
		output: QueryUserRankingOutputSchema,
		method: 'POST'
	},
	[Routes.QUERY_CHALLENGE_RECEIVED]: {
		input: EmptySchema,
		output: QueryChallengesReceivedOutputSchema,
		method: 'GET'
	},
	[Routes.QUERY_CHALLENGE_SENT]: {
		input: EmptySchema,
		output: QueryChallengesSentOutputSchema,
		method: 'GET'
	},
	[Routes.QUERY_CHALLENGE_PENDING_RESULT]: {
		input: EmptySchema,
		output: QueryChallengesPendingResultOutputSchema,
		method: 'GET'
	},
	[Routes.QUERY_CHALLENGE_CONFIRM_RESULT_OTHER]: {
		input: EmptySchema,
		output: QueryChallengesConfirmResultOtherOutputSchema,
		method: 'GET'
	},
	[Routes.QUERY_CHALLENGE_CONFIRM_RESULT_SELF]: {
		input: EmptySchema,
		output: QueryChallengesConfirmResultSelfOutputSchema,
		method: 'GET'
	},
	[Routes.QUERY_GAME_LIST_OWN]: {
		input: QueryGamesListOwnInputSchema,
		output: QueryGamesListOutputSchema,
		method: 'POST'
	},
	[Routes.QUERY_GAME_LIST_ALL]: {
		input: QueryGamesListAllInputSchema,
		output: QueryGamesListOutputSchema,
		method: 'POST'
	},
	[Routes.QUERY_GRAPH_OWN]: {
		input: QueryGraphInputOwnSchema,
		output: QueryGraphOutputSchema,
		method: 'POST'
	},
	[Routes.QUERY_GRAPH_FULL]: {
		input: QueryGraphInputFullSchema,
		output: QueryGraphOutputSchema,
		method: 'POST'
	},
	[Routes.QUERY_HTML_TIME_CONTROLS]: {
		input: EmptySchema,
		output: EmptySchema,
		method: 'GET'
	},
	[Routes.QUERY_HTML_TIME_CONTROLS_UNIQUE]: {
		input: EmptySchema,
		output: EmptySchema,
		method: 'GET'
	},
	[Routes.USER_LOGIN]: {
		input: UserLoginInputSchema,
		output: UserLoginOutputSchema,
		method: 'POST'
	},
	[Routes.USER_LOGOUT]: {
		input: EmptySchema,
		output: UserLogoutOutputSchema,
		method: 'POST'
	},
	[Routes.USER_CREATE]: {
		input: UserCreateInputSchema,
		output: EmptySchema,
		method: 'POST'
	},
	[Routes.USER_EDIT]: {
		input: UserEditInputSchema,
		output: EmptySchema,
		method: 'POST'
	},
	[Routes.USER_PASSWORD_CHANGE]: {
		input: UserPasswordChangeInputSchema,
		output: EmptySchema,
		method: 'POST'
	},
	[Routes.PAGE_USER_CREATE]: {
		input: EmptySchema,
		output: EmptySchema,
		method: 'GET'
	},
	[Routes.PAGE_USER_EDIT]: {
		input: EmptySchema,
		output: EmptySchema,
		method: 'GET'
	},
	[Routes.PAGE_USER_PASSWORD_CHANGE]: {
		input: EmptySchema,
		output: EmptySchema,
		method: 'GET'
	},
	[Routes.PAGE_USER_RANKING]: {
		input: EmptySchema,
		output: EmptySchema,
		method: 'GET'
	},
	[Routes.PAGE_GAME_CREATE]: {
		input: EmptySchema,
		output: EmptySchema,
		method: 'GET'
	},
	[Routes.PAGE_GAME_LIST_OWN]: {
		input: EmptySchema,
		output: EmptySchema,
		method: 'GET'
	},
	[Routes.PAGE_GAME_LIST_ALL]: {
		input: EmptySchema,
		output: EmptySchema,
		method: 'GET'
	},
	[Routes.PAGE_GRAPH_OWN]: {
		input: EmptySchema,
		output: EmptySchema,
		method: 'GET'
	},
	[Routes.PAGE_GRAPH_FULL]: {
		input: EmptySchema,
		output: EmptySchema,
		method: 'GET'
	},
	[Routes.PAGE_CHALLENGE]: {
		input: EmptySchema,
		output: EmptySchema,
		method: 'GET'
	},
	[Routes.GAME_CREATE]: {
		input: GameCreateInputSchema,
		output: EmptySchema,
		method: 'POST'
	},
	[Routes.GAME_DELETE]: {
		input: GameDeleteInputSchema,
		output: EmptySchema,
		method: 'POST'
	},
	[Routes.GAME_EDIT_TITLE]: {
		input: GameEditTitleInputSchema,
		output: EmptySchema,
		method: 'POST'
	},
	[Routes.GAME_EDIT_RESULT]: {
		input: GameEditResultInputSchema,
		output: EmptySchema,
		method: 'POST'
	},
	[Routes.CHALLENGE_SEND]: {
		input: ChallengeSendInputSchema,
		output: EmptySchema,
		method: 'POST'
	},
	[Routes.CHALLENGE_ACCEPT]: {
		input: ChallengeAcceptInputSchema,
		output: EmptySchema,
		method: 'POST'
	},
	[Routes.CHALLENGE_DECLINE]: {
		input: ChallengeDeclineInputSchema,
		output: EmptySchema,
		method: 'POST'
	},
	[Routes.CHALLENGE_SET_RESULT]: {
		input: ChallengeSetResultInputSchema,
		output: EmptySchema,
		method: 'POST'
	},
	[Routes.CHALLENGE_AGREE]: {
		input: ChallengeAgreeResultInputSchema,
		output: EmptySchema,
		method: 'POST'
	},
	[Routes.CHALLENGE_DISAGREE]: {
		input: ChallengeDisagreeResultInputSchema,
		output: EmptySchema,
		method: 'POST'
	},
	[Routes.RECALCULATE_RATINGS]: {
		input: EmptySchema,
		output: EmptySchema,
		method: 'POST'
	},
	[Routes.RECALCULATE_GRAPHS]: {
		input: EmptySchema,
		output: EmptySchema,
		method: 'POST'
	}
} satisfies Record<Route, ApiSchemaEntry>;

type InputSchemaFor<R extends Route> = (typeof API_SCHEMA)[R]['input'];
type OutputSchemaFor<R extends Route> = (typeof API_SCHEMA)[R]['output'];

export function InputSchemaOf<R extends Route>(route: R): InputSchemaFor<R> {
	return API_SCHEMA[route].input;
}

export function OutputSchemaOf<R extends Route>(route: R): OutputSchemaFor<R> {
	return API_SCHEMA[route].output;
}

export function MethodTypeOf<R extends Route>(route: R): ApiMethod {
	return API_SCHEMA[route].method;
}
