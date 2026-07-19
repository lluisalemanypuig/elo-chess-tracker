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

import { isDefined } from '@common/utils/is_defined';

type SameSite = 'Lax';

interface CookiesParams {
	name: string;
	value: string;
	days?: number;
	path?: string;
	samesite?: SameSite;
	domain?: string;
	secure: boolean;
}

function make_cookie({ name, value, days, path, samesite, domain, secure }: CookiesParams): string {
	let cookie: string = '';

	cookie += encodeURIComponent(name) + '=' + encodeURIComponent(value);

	if (isDefined(domain)) {
		cookie += '; Domain=' + domain;
	}

	{
		let num_days = 1;
		if (isDefined(days)) {
			num_days = days;
		}
		const d = new Date();
		d.setTime(d.getTime() + num_days * 24 * 60 * 60 * 1000);
		cookie += '; expires=' + d.toUTCString();
	}

	if (isDefined(path)) {
		cookie += '; path=' + path;
	}
	if (isDefined(samesite)) {
		cookie += '; SameSite=' + samesite;
	}
	if (secure) {
		cookie += '; Secure';
	}

	return cookie;
}

/**
 * @brief Constructs a cookie for a session ID.
 * @param name Name of the cookie.
 * @param value Value of the cookie.
 * @param days Expiry date of the cookie.
 * @pre Parameter @e values must have entries: 'name' and 'values'.
 */
export function make_session_id_cookie(name: string, value: string, days: number): string {
	return make_cookie({
		name: name,
		value: value,
		days: days,
		path: '/',
		samesite: 'Lax',
		secure: true
	});
}

/**
 * @brief Constructs a cookie for a session ID.
 * @param name Name of the cookie.
 * @pre Parameter @e values must have entries: 'name' and 'values'.
 */
export function empty_session_id_cookie(name: string): string {
	return make_cookie({
		name: name,
		value: '',
		days: 1,
		path: '/',
		samesite: 'Lax',
		secure: true
	});
}
