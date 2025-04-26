/*
Elo rating for a Chess Club
Copyright (C) 2023 - 2025  Lluís Alemany Puig

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

/*
import { ConfigurationManager } from '../managers/configuration_manager';

function get_domain_name(): string | undefined {
	return ConfigurationManager.is_production() ? ConfigurationManager.get_instance().get_domain_name() : undefined;
}
*/

function make_cookie(values: any): string {
	let cookie: string = '';

	// name and value of the cookie
	cookie += encodeURIComponent(values['name']) + '=' + encodeURIComponent(values['value']);

	// domain
	if (values['domain'] != undefined) {
		cookie += '; Domain=' + encodeURIComponent(values['domain']);
	}

	// time to expire
	let days = 1;
	if (values['days'] != undefined) {
		days = parseInt(values['days'], 10);
	}
	const d = new Date();
	d.setTime(d.getTime() + days * 24 * 60 * 60 * 1000);
	cookie += '; expires=' + encodeURIComponent(d.toUTCString());

	// path
	if (values['path'] != undefined) {
		cookie += '; path=' + encodeURIComponent(values['path']);
	}

	// SameSite
	if (values['samesite'] != undefined) {
		cookie += '; SameSite=' + encodeURIComponent(values['samesite']);
	}

	// security
	if (values['secure'] != undefined) {
		cookie += '; Secure';
	}

	return cookie;
}

/**
 * @brief Constructs a cookie from the given parameters.
 * @param name Name of the cookie.
 * @param value Value of the cookie.
 * @param days Expiry date of the cookie.
 * @pre Parameter @e values must have entries: 'name' and 'values'.
 */
export function make_cookie_string(name: string, value: string, days: number): string {
	return make_cookie({
		name: name,
		value: value,
		days: days,
		path: '/',
		samesite: 'Strict',
		domain: undefined,
		secure: 'Secure'
	});
}

/**
 * @brief Constructs a cookie from a JSON object.
 * @param name Name of the cookie.
 * @pre Parameter @e values must have entries: 'name' and 'values'.
 */
export function empty_cookie(name: string): string {
	return make_cookie({
		name: name,
		value: '',
		days: 1,
		path: '/',
		samesite: 'Strict',
		domain: undefined,
		secure: 'Secure'
	});
}
