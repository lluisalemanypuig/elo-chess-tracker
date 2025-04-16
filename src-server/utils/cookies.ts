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

// Code adapted from: https://www.w3schools.com/js/js_cookies.asp

/**
 * @brief Constructs a cookie from a JSON object.
 *
 * The object can contain
 * - (*) name: name of the cookie
 * - (*) value: value of the cookie
 * - (?) days: amount of days to expire. Default: '1'
 * - (?) path: path associated to the cookie. Default: '/'
 * - (?) SameSite: (see docs). Default 'Lax'
 * - (?) secure: should the cookie be sent only over https? Default: 'secure'
 *
 * Fields marked with (*) are mandatory; those marked with (?) are optional.
 * @param values
 * @pre Parameter @e values must have entries: 'name' and 'values'.
 */
export function make_cookie_string(values: any): string {
	// name and value of the cookie
	const name = values['name'];
	const value = values['value'];
	let cookie = encodeURIComponent(name) + '=' + encodeURIComponent(value);

	// time to expire
	let days = 1;
	if (values['days'] != undefined) {
		days = parseInt(values['days'], 10);
	}
	const d = new Date();
	d.setTime(d.getTime() + days * 24 * 60 * 60 * 1000);
	cookie += '; expires=' + d.toUTCString();

	// path
	let path = '/';
	if (values['path'] != undefined) {
		path = values['path'];
	}
	cookie += '; path=' + encodeURIComponent(path);

	// SameSite
	let same_site = 'Lax';
	if (values['SameSite'] != undefined) {
		same_site = values['SameSite'];
	}
	cookie += '; samesite=' + encodeURIComponent(same_site);

	// Secure
	let secure = 'secure';
	if (values['secure'] != undefined) {
		secure = values['secure'];
	}
	cookie += '; ' + encodeURIComponent(secure);

	return cookie;
}

/*
/**
 * @brief Retrieve the value of a cookie
 * @param name Name of the cookie to be retrieved
 * @returns A string object, containing the value of the cookie
 //
export function get_cookie(name: string): string {
	const _name = name + '=';
	const ca = document.cookie.split(';');
	for (let i = 0; i < ca.length; i++) {
		let c = ca[i];
		while (c.charAt(0) == ' ') {
			c = c.substring(1);
		}
		if (c.indexOf(_name) == 0) {
			return decodeURIComponent(c.substring(_name.length, c.length));
		}
	}
	return '';
}

export function check_cookie(): void {
	let user = get_cookie("username");
	if (user != "") {
		alert("Welcome again " + user);
	}
	else {
		user = prompt("Please enter your name:", "") as string;
		if (user != "" && user != null) {
			set_cookie({
				"name" : "username",
				"value" : user,
				"days" : "365"
			});
		}
	}
}
*/
