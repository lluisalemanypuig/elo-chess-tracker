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

import { User } from '../models/user';
import {
	CHALLENGE_ADMIN,
	CHALLENGE_MEMBER,
	CHALLENGE_STUDENT,
	CHALLENGE_TEACHER,
	CHALLENGE_USER,
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
		((editor.can_do(EDIT_ADMIN) && edited.is(ADMIN)) ||
			(editor.can_do(EDIT_TEACHER) && edited.is(TEACHER)) ||
			(editor.can_do(EDIT_MEMBER) && edited.is(MEMBER)) ||
			(editor.can_do(EDIT_STUDENT) && edited.is(STUDENT)))
	);
}

/// Can a user (@e u) see a game between two players (@e white and @e black)?
export function can_user_see_a_game(u: User, white: User, black: User): boolean {
	const either_user_is = function (r: UserRole): boolean {
		return white.is(r) || black.is(r);
	};

	return (
		u.can_do(SEE_USER_GAMES) &&
		((u.can_do(SEE_ADMIN_GAMES) && either_user_is(ADMIN)) ||
			(u.can_do(SEE_TEACHER_GAMES) && either_user_is(TEACHER)) ||
			(u.can_do(SEE_STUDENT_GAMES) && either_user_is(STUDENT)) ||
			(u.can_do(SEE_MEMBER_GAMES) && either_user_is(MEMBER)))
	);
}

/// Can a user (@e u) edit a game between two players (@e white and @e black)?
export function can_user_edit_a_game(u: User, white: User, black: User): boolean {
	const either_user_is = function (r: UserRole): boolean {
		return white.is(r) || black.is(r);
	};

	return (
		u.can_do(EDIT_USER_GAMES) &&
		((u.can_do(EDIT_ADMIN_GAMES) && either_user_is(ADMIN)) ||
			(u.can_do(EDIT_TEACHER_GAMES) && either_user_is(TEACHER)) ||
			(u.can_do(EDIT_STUDENT_GAMES) && either_user_is(STUDENT)) ||
			(u.can_do(EDIT_MEMBER_GAMES) && either_user_is(MEMBER)))
	);
}

/**
 * Challenge sent from 'sender' to 'receiver'
 * @param sender User that sends the challenge.
 * @param receiver User that receives the challenge.
 * @returns Can the sender actually challenge the receiver?
 */
export function challenge_can_user_send(sender: User, receiver: User): boolean {
	return (
		sender.can_do(CHALLENGE_USER) &&
		((receiver.is(ADMIN) && sender.can_do(CHALLENGE_ADMIN)) ||
			(receiver.is(MEMBER) && sender.can_do(CHALLENGE_MEMBER)) ||
			(receiver.is(STUDENT) && sender.can_do(CHALLENGE_STUDENT)) ||
			(receiver.is(TEACHER) && sender.can_do(CHALLENGE_TEACHER)))
	);
}
