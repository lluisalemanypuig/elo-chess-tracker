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

import { ConfigurationManager } from '../managers/configuration_manager';

// Code adapted from: https://www.w3schools.com/js/js_cookies.asp

/**
 * @brief Constructs a cookie from a JSON object.
 *
 * The object can contain
 * - (*) name: name of the cookie
 * - (*) value: value of the cookie
 * - (*) days: amount of days to expire. Default: '1'
 *
 * Fields marked with (*) are mandatory; those marked with (?) are optional.
 * @param values
 * @pre Parameter @e values must have entries: 'name' and 'values'.
 */
export function make_cookie_string(values: any): string {
	let cookie: string = '';

	// name and value of the cookie
	const name = values['name'];
	const value = values['value'];
	cookie += encodeURIComponent(name) + '=' + encodeURIComponent(value);

	cookie += '; Domain=';
	if (ConfigurationManager.is_production()) {
		cookie += encodeURIComponent(ConfigurationManager.get_instance().get_domain_name());
	}

	// time to expire
	let days = 1;
	if (values['days'] != undefined) {
		days = parseInt(values['days'], 10);
	}
	const d = new Date();
	d.setTime(d.getTime() + days * 24 * 60 * 60 * 1000);
	cookie += '; expires=' + d.toUTCString();

	// path
	cookie += '; path=/';

	// SameSite
	cookie += '; SameSite=Lax';

	// security
	if (ConfigurationManager.is_production()) {
		cookie += '; Secure';
	}

	return cookie;
}

/**
 * @brief Constructs a cookie from a JSON object.
 *
 * The object can contain
 * - (*) name: name of the cookie
 *
 * Fields marked with (*) are mandatory; those marked with (?) are optional.
 * @param values
 * @pre Parameter @e values must have entries: 'name' and 'values'.
 */
export function empty_cookie(values: any): string {
	let cookie: string = '';

	// name and value of the cookie
	const name = values['name'];
	cookie += encodeURIComponent(name) + '=';

	cookie += '; Domain=';
	if (ConfigurationManager.is_production()) {
		cookie += encodeURIComponent(ConfigurationManager.get_instance().get_domain_name());
	}

	// path
	cookie += '; path=/';

	// SameSite
	cookie += '; SameSite=Lax';

	// security
	if (ConfigurationManager.is_production()) {
		cookie += '; Secure';
	}

	return cookie;
}
