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

import { AuthenticationInputSchema } from '@common/api/schemas/authentication';
import { SessionId } from '@common/models/session-id';
import { isDefined, isNotDefined } from '@common/utils/is-defined';
import { logNow } from '@common/utils/time';
import Debug from 'debug';
import { Request } from 'express';
import { z } from 'zod';

export type ParseResult = 'jsonDataNotProvided' | 'error' | 'success';

export type ParseSchemaResult<T> =
	| {
			result: 'JsonDataNotProvided' | 'Error';
			data: undefined;
	  }
	| {
			result: 'Success';
			data: T;
	  };

export function parseSchema<S extends z.ZodTypeAny>(
	json: unknown | undefined | null,
	schemaObj: S,
	debug: Debug.Debugger,
): ParseSchemaResult<z.output<S>> {
	const isEmptyPlainObject = (v: unknown) =>
		typeof v === 'object' &&
		isDefined(v) &&
		!Array.isArray(v) &&
		Object.keys(v as Record<string, unknown>).length === 0;

	if (isNotDefined(json) || isEmptyPlainObject(json)) {
		return {
			result: 'JsonDataNotProvided',
			data: undefined,
		};
	}
	const parse = schemaObj.safeParse(json);
	if (!parse.success) {
		debug(logNow(), `Failed to parse schema: ${schemaObj.constructor.name}`);
		return {
			result: 'Error',
			data: undefined,
		};
	}
	return {
		result: 'Success',
		data: parse.data,
	};
}

export type SafeParseSchemaResult<T> =
	| {
			result: 'bad';
			data: undefined;
	  }
	| {
			result: 'good';
			data: T;
	  };

export function safeParseRequestCookies(req: Request, debug: Debug.Debugger): SafeParseSchemaResult<SessionId> {
	const parse = parseSchema(req.cookies, AuthenticationInputSchema, debug);
	if (parse.result !== 'Success') {
		return {
			result: 'bad',
			data: undefined,
		};
	}
	return {
		result: 'good',
		data: parse.data,
	};
}

export function safeParseRequestBody<S extends z.ZodTypeAny>(
	req: Request,
	schemaObj: S,
	debug: Debug.Debugger,
): SafeParseSchemaResult<z.output<S>> {
	const parse = parseSchema(req.body, schemaObj, debug);
	if (parse.result !== 'Success') {
		return {
			result: 'bad',
			data: undefined,
		};
	}
	return {
		result: 'good',
		data: parse.data,
	};
}
