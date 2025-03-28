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
	CHALLENGE_ADMIN,
	CHALLENGE_MEMBER,
	CHALLENGE_STUDENT,
	CHALLENGE_TEACHER,
	CHALLENGE_USER,
	EDIT_ADMIN,
	EDIT_MEMBER,
	EDIT_STUDENT,
	EDIT_TEACHER,
	EDIT_USER,
	SEE_GAMES_ADMIN,
	SEE_GAMES_MEMBER,
	SEE_GAMES_STUDENT,
	SEE_GAMES_TEACHER,
	SEE_GAMES_USER,
	SEE_GRAPHS_ADMIN,
	SEE_GRAPHS_MEMBER,
	SEE_GRAPHS_STUDENT,
	SEE_GRAPHS_TEACHER,
	SEE_GRAPHS_USER,
	CREATE_GAMES,
	CREATE_GAMES_ADMIN,
	CREATE_GAMES_TEACHER,
	CREATE_GAMES_STUDENT,
	CREATE_GAMES_MEMBER,
	EDIT_GAMES_ADMIN,
	EDIT_GAMES_MEMBER,
	EDIT_GAMES_STUDENT,
	EDIT_GAMES_TEACHER,
	EDIT_GAMES_USER,
	DELETE_GAMES_ADMIN,
	DELETE_GAMES_MEMBER,
	DELETE_GAMES_STUDENT,
	DELETE_GAMES_TEACHER,
	DELETE_GAMES_USER
} from './user_action';
import { ADMIN, MEMBER, STUDENT, TEACHER, UserRole } from './user_role';

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
		u.can_do(SEE_GAMES_USER) &&
		((u.can_do(SEE_GAMES_ADMIN) && either_user_is(ADMIN)) ||
			(u.can_do(SEE_GAMES_TEACHER) && either_user_is(TEACHER)) ||
			(u.can_do(SEE_GAMES_STUDENT) && either_user_is(STUDENT)) ||
			(u.can_do(SEE_GAMES_MEMBER) && either_user_is(MEMBER)))
	);
}

/// Can a user (@e u) create a game between two players (@e white and @e black)?
export function can_user_create_a_game(u: User, white: User, black: User): boolean {
	const either_user_is = function (r: UserRole): boolean {
		return white.is(r) || black.is(r);
	};

	return (
		u.can_do(CREATE_GAMES) &&
		((u.can_do(CREATE_GAMES_ADMIN) && either_user_is(ADMIN)) ||
			(u.can_do(CREATE_GAMES_TEACHER) && either_user_is(TEACHER)) ||
			(u.can_do(CREATE_GAMES_STUDENT) && either_user_is(STUDENT)) ||
			(u.can_do(CREATE_GAMES_MEMBER) && either_user_is(MEMBER)))
	);
}

/// Can a user (@e u) edit a game between two players (@e white and @e black)?
export function can_user_edit_a_game(u: User, white: User, black: User): boolean {
	const either_user_is = function (r: UserRole): boolean {
		return white.is(r) || black.is(r);
	};

	return (
		u.can_do(EDIT_GAMES_USER) &&
		((u.can_do(EDIT_GAMES_ADMIN) && either_user_is(ADMIN)) ||
			(u.can_do(EDIT_GAMES_TEACHER) && either_user_is(TEACHER)) ||
			(u.can_do(EDIT_GAMES_STUDENT) && either_user_is(STUDENT)) ||
			(u.can_do(EDIT_GAMES_MEMBER) && either_user_is(MEMBER)))
	);
}

/// Can a user (@e u) delete a game between two players (@e white and @e black)?
export function can_user_delete_a_game(u: User, white: User, black: User): boolean {
	const either_user_is = function (r: UserRole): boolean {
		return white.is(r) || black.is(r);
	};

	return (
		u.can_do(DELETE_GAMES_USER) &&
		((u.can_do(DELETE_GAMES_ADMIN) && either_user_is(ADMIN)) ||
			(u.can_do(DELETE_GAMES_TEACHER) && either_user_is(TEACHER)) ||
			(u.can_do(DELETE_GAMES_STUDENT) && either_user_is(STUDENT)) ||
			(u.can_do(DELETE_GAMES_MEMBER) && either_user_is(MEMBER)))
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
		sender.can_do(CHALLENGE_USER) &&
		((receiver.is(ADMIN) && sender.can_do(CHALLENGE_ADMIN)) ||
			(receiver.is(MEMBER) && sender.can_do(CHALLENGE_MEMBER)) ||
			(receiver.is(STUDENT) && sender.can_do(CHALLENGE_STUDENT)) ||
			(receiver.is(TEACHER) && sender.can_do(CHALLENGE_TEACHER)))
	);
}

/// Can a user (@e u) see another user's graph (@e other)?
export function can_user_see_graph(u: User, other: User): boolean {
	return (
		u.can_do(SEE_GRAPHS_USER) &&
		((other.is(ADMIN) && u.can_do(SEE_GRAPHS_ADMIN)) ||
			(other.is(MEMBER) && u.can_do(SEE_GRAPHS_MEMBER)) ||
			(other.is(STUDENT) && u.can_do(SEE_GRAPHS_STUDENT)) ||
			(other.is(TEACHER) && u.can_do(SEE_GRAPHS_TEACHER)))
	);
}
