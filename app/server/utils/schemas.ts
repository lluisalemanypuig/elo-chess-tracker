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

import Debug from 'debug';
import { z } from 'zod';

import { isNotDefined } from '@common/utils/is_defined';
import { log_now } from '@server/utils/time';

export type ParseSchemaResult<T> =
	| {
			result: 'JsonDataNotProvided' | 'Error';
			data: undefined;
	  }
	| {
			result: 'Success';
			data: T;
	  };

export function parse_schema<S extends z.ZodTypeAny>(
	json: unknown | undefined | null,
	schema_obj: S,
	debug: Debug.Debugger
): ParseSchemaResult<z.output<S>> {
	if (isNotDefined(json)) {
		return {
			result: 'JsonDataNotProvided',
			data: undefined
		};
	}
	const parse = schema_obj.safeParse(json);
	if (!parse.success) {
		debug(log_now(), `Failed to parse schema: ${schema_obj.constructor.name}`);
		return {
			result: 'Error',
			data: undefined
		};
	}
	return {
		result: 'Success',
		data: parse.data
	};
}
