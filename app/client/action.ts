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

import { MethodTypeOf, OutputSchemaOf } from '@common/api/schemas';
import { InputTypeOf, OutputTypeOf } from '@common/api/types';
import { Route } from '@common/routes';
import { isNotDefined } from '@common/utils/is_defined';

type ResponseResultError = {
	message: string;
	statusCode: number;
	status: 'Error';
};

type ResponseResult<T> =
	| ResponseResultError
	| {
			value: T;
			status: 'Success';
	  };

export async function server_call<T extends Route>(
	route: T,
	body: InputTypeOf<T> | undefined | null
): Promise<ResponseResult<OutputTypeOf<T>>> {
	const method = MethodTypeOf(route);
	let response: Response;

	if (isNotDefined(body)) {
		response = await fetch(route, {
			method: method,
			headers: { 'Content-type': 'application/json; charset=UTF-8' }
		});
	} else {
		response = await fetch(route, {
			method: method,
			body: JSON.stringify(body, null, ''),
			headers: { 'Content-type': 'application/json; charset=UTF-8' }
		});
	}

	if (response.status >= 400) {
		const msg = await response.text();
		return {
			message: msg,
			statusCode: response.status,
			status: 'Error'
		};
	}

	const schema_object = OutputSchemaOf(route);
	const json_text = await response.json();
	const parse = schema_object.safeParse(json_text);
	if (!parse.success) {
		console.log(JSON.stringify(json_text, null, '  '));
		return {
			message: `Failed to parse schema '${schema_object.constructor.name}', at route '${route}'. Reason: ${parse.error}`,
			statusCode: 900,
			status: 'Error'
		};
	}
	return {
		/// TODO: eventually, remove the type assertion so that typescript
		/// figures out on its own that the type of parse.data is correct
		value: parse.data as OutputTypeOf<T>,
		status: 'Success'
	};
}

export function message_from_response(response: ResponseResultError): string {
	return `${response.status} -- ${response.statusCode}\nMessage: '${response.message}'`;
}
