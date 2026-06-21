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
const debug = Debug(`ELO_CHESS_TRACKER:io`);

import { log_now } from '@server/utils/time';
import { z } from 'zod';
import { isDefined } from '@common/utils';

export function read_schema<T extends z.ZodTypeAny>(schema: T, str: string): z.output<T> | null {
	const parse = JSON.parse(str);
	if (!isDefined) {
		debug(log_now(), `JSON failed to parse string.`);
		return null;
	}
	const res = schema.safeParse(parse);
	if (!res.success) {
		debug(log_now(), `safeParse failed to parse JSON schema.`);
		debug(log_now(), `    errors: ${res.error}.`);
		return null;
	}
	return res.data;
}

export function check_json_keys(json: any, expected_keys: string[]): boolean {
	let all_keys = [];
	for (const key of expected_keys) {
		all_keys.push(key);
		if (!(key in json)) {
			debug(log_now(), `JSON is missing required key '${key}''.`);
			return false;
		}
	}

	if (all_keys.length != expected_keys.length) {
		debug(log_now(), `Expected '${expected_keys.length}'; found '${all_keys.length}' instead.`);
		return false;
	}

	return true;
}

export function read_json_object_string<T>(
	str: string,
	expected_keys: string[],
	conversion: (json: any) => T | null
): T | null {
	let json: any;

	try {
		json = JSON.parse(str);
	} catch (error) {
		debug(log_now(), `Invalid JSON string`);
		return null;
	}

	if (!json || typeof json !== `object` || Array.isArray(json)) {
		debug(log_now(), `JSON string must be an object`);
		return null;
	}

	if (!check_json_keys(json, expected_keys)) {
		debug(log_now(), `JSON object does not have the right keys`);
		return null;
	}

	return conversion(json);
}

export function read_json_array_string<T>(
	str: string,
	expected_keys: string[],
	conversion: (json: any) => T | null
): T[] | null {
	let json: any;

	try {
		json = JSON.parse(str);
	} catch (error) {
		debug(log_now(), `Invalid JSON string`);
		return null;
	}

	if (!json || typeof json !== `object` || !Array.isArray(json)) {
		debug(log_now(), `JSON string must be an array`);
		return null;
	}

	let array: T[] = [];
	for (const obj of json) {
		if (!check_json_keys(obj, expected_keys)) {
			debug(log_now(), `JSON object does not have the right keys`);
			return null;
		}

		const conv = conversion(obj);
		if (!isDefined(conv)) {
			debug(log_now(), `JSON object could not be converted to object of type T`);
			return null;
		}
		array.push(conv);
	}

	return array;
}
