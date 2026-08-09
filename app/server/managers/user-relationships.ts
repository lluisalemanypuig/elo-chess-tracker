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

import { TimeControlId } from '@common/models/time-control';
import { User } from '@common/models/user';
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
} from '@common/models/user-action';
import { ADMIN, MEMBER, STUDENT, TEACHER, UserRole } from '@common/models/user-role';
import { UsersBehavior } from '@app/server/managers/users-behavior';

/// Can a user (@e editor) edit another user (@e edited)?
export function canUserEdit(editor: User, edited: User): boolean {
	return (
		editor.canDo(USER_EDIT) &&
		((editor.canDo(USER_EDIT_ADMIN) && edited.is(ADMIN)) ||
			(editor.canDo(USER_EDIT_TEACHER) && edited.is(TEACHER)) ||
			(editor.canDo(USER_EDIT_MEMBER) && edited.is(MEMBER)) ||
			(editor.canDo(USER_EDIT_STUDENT) && edited.is(STUDENT)))
	);
}

/// Can a user (@e u) see a game between two players (@e white and @e black)?
export function canUserSeeGame(u: User, white: User, black: User): boolean {
	const either_user_is = function (r: UserRole): boolean {
		return white.is(r) || black.is(r);
	};

	return (
		u.canDo(GAMES_SEE) &&
		((u.canDo(GAMES_SEE_ADMIN) && either_user_is(ADMIN)) ||
			(u.canDo(GAMES_SEE_TEACHER) && either_user_is(TEACHER)) ||
			(u.canDo(GAMES_SEE_STUDENT) && either_user_is(STUDENT)) ||
			(u.canDo(GAMES_SEE_MEMBER) && either_user_is(MEMBER)))
	);
}

/// Can a user (@e u) create a game between two players (@e white and @e black)?
export function canUserCreateGame(u: User, white: User, black: User): boolean {
	const either_user_is = function (r: UserRole): boolean {
		return white.is(r) || black.is(r);
	};

	return (
		u.canDo(GAMES_CREATE) &&
		((u.canDo(GAMES_CREATE_ADMIN) && either_user_is(ADMIN)) ||
			(u.canDo(GAMES_CREATE_TEACHER) && either_user_is(TEACHER)) ||
			(u.canDo(GAMES_CREATE_STUDENT) && either_user_is(STUDENT)) ||
			(u.canDo(GAMES_CREATE_MEMBER) && either_user_is(MEMBER)))
	);
}

/// Can a user (@e u) edit a game between two players (@e white and @e black)?
export function canUserEditGame(u: User, white: User, black: User): boolean {
	const either_user_is = function (r: UserRole): boolean {
		return white.is(r) || black.is(r);
	};

	return (
		u.canDo(GAMES_EDIT) &&
		((u.canDo(GAMES_EDIT_ADMIN) && either_user_is(ADMIN)) ||
			(u.canDo(GAMES_EDIT_TEACHER) && either_user_is(TEACHER)) ||
			(u.canDo(GAMES_EDIT_STUDENT) && either_user_is(STUDENT)) ||
			(u.canDo(GAMES_EDIT_MEMBER) && either_user_is(MEMBER)))
	);
}

/// Can a user (@e u) delete a game between two players (@e white and @e black)?
export function canUserDeleteGame(u: User, white: User, black: User): boolean {
	const either_user_is = function (r: UserRole): boolean {
		return white.is(r) || black.is(r);
	};

	return (
		u.canDo(GAMES_DELETE) &&
		((u.canDo(GAMES_DELETE_ADMIN) && either_user_is(ADMIN)) ||
			(u.canDo(GAMES_DELETE_TEACHER) && either_user_is(TEACHER)) ||
			(u.canDo(GAMES_DELETE_STUDENT) && either_user_is(STUDENT)) ||
			(u.canDo(GAMES_DELETE_MEMBER) && either_user_is(MEMBER)))
	);
}

/**
 * @brief Challenge sent from 'sender' to 'receiver'
 * @param sender User that sends the challenge.
 * @param receiver User that receives the challenge.
 * @returns Can the sender actually challenge the receiver?
 */
export function canUserSendChallenge(sender: User, receiver: User): boolean {
	return (
		sender.canDo(USER_CHALLENGE) &&
		((receiver.is(ADMIN) && sender.canDo(USER_CHALLENGE_ADMIN)) ||
			(receiver.is(MEMBER) && sender.canDo(USER_CHALLENGE_MEMBER)) ||
			(receiver.is(STUDENT) && sender.canDo(USER_CHALLENGE_STUDENT)) ||
			(receiver.is(TEACHER) && sender.canDo(USER_CHALLENGE_TEACHER)))
	);
}

/// Can a user (@e u) see another user's graph (@e other)?
export function canUserSeeGraph(u: User, other: User): boolean {
	return (
		u.canDo(GRAPHS_SEE_USER) &&
		((other.is(ADMIN) && u.canDo(GRAPHS_SEE_ADMIN)) ||
			(other.is(MEMBER) && u.canDo(GRAPHS_SEE_MEMBER)) ||
			(other.is(STUDENT) && u.canDo(GRAPHS_SEE_STUDENT)) ||
			(other.is(TEACHER) && u.canDo(GRAPHS_SEE_TEACHER)))
	);
}

/// Can user 'u1' decline the challenge sent by user 'u2'?
export function canUserDeclineChallenge(u1: User, u2: User, id: TimeControlId): boolean {
	if (u1.getRating(id).rating > u2.getRating(id).rating) {
		const behavior = UsersBehavior.getInstance();
		return behavior.canHigherRatedDeclineChallengeLowerRated();
	}
	return true;
}
