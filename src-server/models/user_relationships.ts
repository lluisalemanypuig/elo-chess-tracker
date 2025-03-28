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

import { User } from './user';
import {
	USER_CHALLENGE_ADMIN,
	USER_CHALLENGE_MEMBER,
	USER_CHALLENGE_STUDENT,
	USER_CHALLENGE_TEACHER,
	USER_CHALLENGE,
	USER_EDIT_ADMIN,
	USER_EDIT_MEMBER,
	USER_EDIT_STUDENT,
	USER_EDIT_TEACHER,
	USER_EDIT,
	GAMES_SEE_ADMIN,
	GAMES_SEE_MEMBER,
	GAMES_SEE_STUDENT,
	GAMES_SEE_TEACHER,
	GAMES_SEE,
	GRAPHS_SEE_ADMIN,
	GRAPHS_SEE_MEMBER,
	GRAPHS_SEE_STUDENT,
	GRAPHS_SEE_TEACHER,
	GRAPHS_SEE_USER,
	GAMES_CREATE,
	GAMES_CREATE_ADMIN,
	GAMES_CREATE_TEACHER,
	GAMES_CREATE_STUDENT,
	GAMES_CREATE_MEMBER,
	GAMES_EDIT_ADMIN,
	GAMES_EDIT_MEMBER,
	GAMES_EDIT_STUDENT,
	GAMES_EDIT_TEACHER,
	GAMES_EDIT,
	GAMES_DELETE_ADMIN,
	GAMES_DELETE_MEMBER,
	GAMES_DELETE_STUDENT,
	GAMES_DELETE_TEACHER,
	GAMES_DELETE
} from './user_action';
import { ADMIN, MEMBER, STUDENT, TEACHER, UserRole } from './user_role';

/// Can a user (@e editor) edit another user (@e edited)?
export function can_user_edit(editor: User, edited: User): boolean {
	return (
		editor.can_do(USER_EDIT) &&
		((editor.can_do(USER_EDIT_ADMIN) && edited.is(ADMIN)) ||
			(editor.can_do(USER_EDIT_TEACHER) && edited.is(TEACHER)) ||
			(editor.can_do(USER_EDIT_MEMBER) && edited.is(MEMBER)) ||
			(editor.can_do(USER_EDIT_STUDENT) && edited.is(STUDENT)))
	);
}

/// Can a user (@e u) see a game between two players (@e white and @e black)?
export function can_user_see_a_game(u: User, white: User, black: User): boolean {
	const either_user_is = function (r: UserRole): boolean {
		return white.is(r) || black.is(r);
	};

	return (
		u.can_do(GAMES_SEE) &&
		((u.can_do(GAMES_SEE_ADMIN) && either_user_is(ADMIN)) ||
			(u.can_do(GAMES_SEE_TEACHER) && either_user_is(TEACHER)) ||
			(u.can_do(GAMES_SEE_STUDENT) && either_user_is(STUDENT)) ||
			(u.can_do(GAMES_SEE_MEMBER) && either_user_is(MEMBER)))
	);
}

/// Can a user (@e u) create a game between two players (@e white and @e black)?
export function can_user_create_a_game(u: User, white: User, black: User): boolean {
	const either_user_is = function (r: UserRole): boolean {
		return white.is(r) || black.is(r);
	};

	return (
		u.can_do(GAMES_CREATE) &&
		((u.can_do(GAMES_CREATE_ADMIN) && either_user_is(ADMIN)) ||
			(u.can_do(GAMES_CREATE_TEACHER) && either_user_is(TEACHER)) ||
			(u.can_do(GAMES_CREATE_STUDENT) && either_user_is(STUDENT)) ||
			(u.can_do(GAMES_CREATE_MEMBER) && either_user_is(MEMBER)))
	);
}

/// Can a user (@e u) edit a game between two players (@e white and @e black)?
export function can_user_edit_a_game(u: User, white: User, black: User): boolean {
	const either_user_is = function (r: UserRole): boolean {
		return white.is(r) || black.is(r);
	};

	return (
		u.can_do(GAMES_EDIT) &&
		((u.can_do(GAMES_EDIT_ADMIN) && either_user_is(ADMIN)) ||
			(u.can_do(GAMES_EDIT_TEACHER) && either_user_is(TEACHER)) ||
			(u.can_do(GAMES_EDIT_STUDENT) && either_user_is(STUDENT)) ||
			(u.can_do(GAMES_EDIT_MEMBER) && either_user_is(MEMBER)))
	);
}

/// Can a user (@e u) delete a game between two players (@e white and @e black)?
export function can_user_delete_a_game(u: User, white: User, black: User): boolean {
	const either_user_is = function (r: UserRole): boolean {
		return white.is(r) || black.is(r);
	};

	return (
		u.can_do(GAMES_DELETE) &&
		((u.can_do(GAMES_DELETE_ADMIN) && either_user_is(ADMIN)) ||
			(u.can_do(GAMES_DELETE_TEACHER) && either_user_is(TEACHER)) ||
			(u.can_do(GAMES_DELETE_STUDENT) && either_user_is(STUDENT)) ||
			(u.can_do(GAMES_DELETE_MEMBER) && either_user_is(MEMBER)))
	);
}

/**
 * @brief Challenge sent from 'sender' to 'receiver'
 * @param sender User that sends the challenge.
 * @param receiver User that receives the challenge.
 * @returns Can the sender actually challenge the receiver?
 */
export function can_user_send_challenge(sender: User, receiver: User): boolean {
	return (
		sender.can_do(USER_CHALLENGE) &&
		((receiver.is(ADMIN) && sender.can_do(USER_CHALLENGE_ADMIN)) ||
			(receiver.is(MEMBER) && sender.can_do(USER_CHALLENGE_MEMBER)) ||
			(receiver.is(STUDENT) && sender.can_do(USER_CHALLENGE_STUDENT)) ||
			(receiver.is(TEACHER) && sender.can_do(USER_CHALLENGE_TEACHER)))
	);
}

/// Can a user (@e u) see another user's graph (@e other)?
export function can_user_see_graph(u: User, other: User): boolean {
	return (
		u.can_do(GRAPHS_SEE_USER) &&
		((other.is(ADMIN) && u.can_do(GRAPHS_SEE_ADMIN)) ||
			(other.is(MEMBER) && u.can_do(GRAPHS_SEE_MEMBER)) ||
			(other.is(STUDENT) && u.can_do(GRAPHS_SEE_STUDENT)) ||
			(other.is(TEACHER) && u.can_do(GRAPHS_SEE_TEACHER)))
	);
}
