/*
Elo rating for a Chess Club
Copyright (C) 2023 - 2024  Lluís Alemany Puig

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

import { User } from '../models/user';
import { EDIT_ADMIN, EDIT_MEMBER, EDIT_STUDENT, EDIT_TEACHER, EDIT_USER } from '../models/user_action';
import { ADMIN, MEMBER, STUDENT, TEACHER } from '../models/user_role';

/// Can a user (@e editor) edit another user (@e edited)?
export function can_user_edit(editor: User, edited: User): boolean {
	return (
		editor.can_do(EDIT_USER) &&
		((edited.get_roles().includes(ADMIN) && editor.can_do(EDIT_ADMIN)) ||
			(edited.get_roles().includes(TEACHER) && editor.can_do(EDIT_TEACHER)) ||
			(edited.get_roles().includes(MEMBER) && editor.can_do(EDIT_MEMBER)) ||
			(edited.get_roles().includes(STUDENT) && editor.can_do(EDIT_STUDENT)))
	);
}
