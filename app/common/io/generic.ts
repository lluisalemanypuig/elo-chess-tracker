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

import { logNow } from '@common/utils/time';
import { z } from 'zod';
import { isNotDefined } from '@common/utils/is-defined';

export function readSchema<T extends z.ZodTypeAny>(schema: T, str: string): z.output<T> | null {
	const parse = JSON.parse(str);
	if (isNotDefined(parse)) {
		debug(logNow(), `JSON Failed to parse schema.`);
		return null;
	}
	const res = schema.safeParse(parse);
	if (!res.success) {
		debug(logNow(), `safeParse Failed to parse schema schema.`);
		debug(logNow(), `    errors: ${res.error}.`);
		return null;
	}
	return res.data;
}

export function checkJsonKeys<Key extends string>(json: any, expectedKeys: readonly Key[]): boolean {
	let allKeys: Key[] = [];
	for (const key of expectedKeys) {
		allKeys.push(key);
		if (!(key in json)) {
			debug(logNow(), `JSON is missing required key '${key}''.`);
			return false;
		}
	}

	if (allKeys.length != expectedKeys.length) {
		debug(logNow(), `Expected '${expectedKeys.length}'; found '${allKeys.length}' instead.`);
		return false;
	}

	return true;
}

export function readJsonObjectString<T, Key extends string>(
	str: string,
	expectedKeys: readonly Key[],
	conversion: (json: any) => T | null
): T | null {
	let json: any;

	try {
		json = JSON.parse(str);
	} catch (error) {
		debug(logNow(), `Invalid JSON string`);
		return null;
	}

	if (!json || typeof json !== `object` || Array.isArray(json)) {
		debug(logNow(), `JSON string must be an object`);
		return null;
	}

	if (!checkJsonKeys(json, expectedKeys)) {
		debug(logNow(), `JSON object does not have the right keys`);
		return null;
	}

	return conversion(json);
}

export function readJsonArrayString<T, Key extends string>(
	str: string,
	expectedKeys: readonly Key[],
	conversion: (json: any) => T | null
): T[] | null {
	let json: any;

	try {
		json = JSON.parse(str);
	} catch (error) {
		debug(logNow(), `Invalid JSON string`);
		return null;
	}

	if (!json || typeof json !== `object` || !Array.isArray(json)) {
		debug(logNow(), `JSON string must be an array`);
		return null;
	}

	let array: T[] = [];
	for (const obj of json) {
		if (!checkJsonKeys(obj, expectedKeys)) {
			debug(logNow(), `JSON object does not have the right keys`);
			return null;
		}

		const conv = conversion(obj);
		if (isNotDefined(conv)) {
			debug(logNow(), `JSON object could not be converted to object of type T`);
			return null;
		}
		array.push(conv);
	}

	return array;
}
