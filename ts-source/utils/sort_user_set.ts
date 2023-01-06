/*
Elo rating for a Chess Club
Copyright (C) 2023  Lluís Alemany Puig

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

Contact:
	Lluís Alemany Puig
	https://github.com/lluisalemanypuig
*/

import { User } from "../models/user";

/// Compare two users using their username
export function username_sort(a: User, b: User): number {
	if (a.get_username() <  b.get_username()) { return -1; }
	if (a.get_username() == b.get_username()) { return 0; }
	return 1;
}

/// Compare two users using their username
export function full_name_sort(a: User, b: User): number {
	if (a.get_full_name() <  b.get_full_name()) { return -1; }
	if (a.get_full_name() == b.get_full_name()) { return 0; }
	return 1;
}

/// Compare two users using their classical rating
export function classical_sort(a: User, b: User): number {
	if (a.get_classical_rating().rating <  b.get_classical_rating().rating) { return -1; }
	if (a.get_classical_rating().rating == b.get_classical_rating().rating) { return 0; }
	return 1;
}
