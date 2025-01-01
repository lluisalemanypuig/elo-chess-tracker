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
import {
	EDIT_ADMIN,
	EDIT_ADMIN_GAMES,
	EDIT_MEMBER,
	EDIT_MEMBER_GAMES,
	EDIT_STUDENT,
	EDIT_STUDENT_GAMES,
	EDIT_TEACHER,
	EDIT_TEACHER_GAMES,
	EDIT_USER,
	EDIT_USER_GAMES,
	SEE_ADMIN_GAMES,
	SEE_MEMBER_GAMES,
	SEE_STUDENT_GAMES,
	SEE_TEACHER_GAMES,
	SEE_USER_GAMES
} from '../models/user_action';
import { ADMIN, MEMBER, STUDENT, TEACHER, UserRole } from '../models/user_role';

/// Can a user (@e editor) edit another user (@e edited)?
export function can_user_edit(editor: User, edited: User): boolean {
	return (
		editor.can_do(EDIT_USER) &&
		((edited.is(ADMIN) && editor.can_do(EDIT_ADMIN)) ||
			(edited.is(TEACHER) && editor.can_do(EDIT_TEACHER)) ||
			(edited.is(MEMBER) && editor.can_do(EDIT_MEMBER)) ||
			(edited.is(STUDENT) && editor.can_do(EDIT_STUDENT)))
	);
}

/// Can a user (@e u) see a game between two players (@e white and @e black)?
export function can_user_see_a_game(u: User, white: User, black: User): boolean {
	if (!u.can_do(SEE_USER_GAMES)) {
		return false;
	}

	const either_user_is = function (r: UserRole): boolean {
		return white.is(r) || black.is(r);
	};

	if (u.can_do(SEE_ADMIN_GAMES) && either_user_is(ADMIN)) {
		return true;
	}
	if (u.can_do(SEE_TEACHER_GAMES) && either_user_is(TEACHER)) {
		return true;
	}
	if (u.can_do(SEE_STUDENT_GAMES) && either_user_is(STUDENT)) {
		return true;
	}
	if (u.can_do(SEE_MEMBER_GAMES) && either_user_is(MEMBER)) {
		return true;
	}
	return false;
}

/// Can a user (@e u) edit a game between two players (@e white and @e black)?
export function can_user_edit_a_game(u: User, white: User, black: User): boolean {
	if (!u.can_do(EDIT_USER_GAMES)) {
		return false;
	}

	const either_user_is = function (r: UserRole): boolean {
		return white.is(r) || black.is(r);
	};

	if (u.can_do(EDIT_ADMIN_GAMES) && either_user_is(ADMIN)) {
		return true;
	}
	if (u.can_do(EDIT_TEACHER_GAMES) && either_user_is(TEACHER)) {
		return true;
	}
	if (u.can_do(EDIT_STUDENT_GAMES) && either_user_is(STUDENT)) {
		return true;
	}
	if (u.can_do(EDIT_MEMBER_GAMES) && either_user_is(MEMBER)) {
		return true;
	}
	return false;
}
