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
import { User } from '@server/models/user';
import { UserRole } from '@common/models/user-role';
import { UsersBehavior } from '@server/managers/users-behavior';

export function canUserEditUser(editor: User, edited: User): boolean {
	return (
		editor.canDo('EDIT_USER') &&
		((editor.canDo('EDIT_USER_ADMIN') && edited.is('ADMIN')) ||
			(editor.canDo('EDIT_USER_TEACHER') && edited.is('TEACHER')) ||
			(editor.canDo('EDIT_USER_MEMBER') && edited.is('MEMBER')) ||
			(editor.canDo('EDIT_USER_STUDENT') && edited.is('STUDENT')))
	);
}

// GAMES

export function canUserSeeGame(u: User, white: User, black: User): boolean {
	const eitherUserIs = function (r: UserRole): boolean {
		return white.is(r) || black.is(r);
	};

	return (
		u.canDo('SEE_GAMES') &&
		((u.canDo('SEE_GAMES_ADMIN') && eitherUserIs('ADMIN')) ||
			(u.canDo('SEE_GAMES_TEACHER') && eitherUserIs('TEACHER')) ||
			(u.canDo('SEE_GAMES_STUDENT') && eitherUserIs('STUDENT')) ||
			(u.canDo('SEE_GAMES_MEMBER') && eitherUserIs('MEMBER')))
	);
}

export function canUserCreateGame(u: User, white: User, black: User): boolean {
	const eitherUserIs = function (r: UserRole): boolean {
		return white.is(r) || black.is(r);
	};

	return (
		u.canDo('CREATE_GAMES') &&
		((u.canDo('CREATE_GAMES_ADMIN') && eitherUserIs('ADMIN')) ||
			(u.canDo('CREATE_GAMES_TEACHER') && eitherUserIs('TEACHER')) ||
			(u.canDo('CREATE_GAMES_STUDENT') && eitherUserIs('STUDENT')) ||
			(u.canDo('CREATE_GAMES_MEMBER') && eitherUserIs('MEMBER')))
	);
}

export function canUserEditGame(u: User, white: User, black: User): boolean {
	const eitherUserIs = function (r: UserRole): boolean {
		return white.is(r) || black.is(r);
	};

	return (
		u.canDo('EDIT_GAMES') &&
		((u.canDo('EDIT_GAMES_ADMIN') && eitherUserIs('ADMIN')) ||
			(u.canDo('EDIT_GAMES_TEACHER') && eitherUserIs('TEACHER')) ||
			(u.canDo('EDIT_GAMES_STUDENT') && eitherUserIs('STUDENT')) ||
			(u.canDo('EDIT_GAMES_MEMBER') && eitherUserIs('MEMBER')))
	);
}

export function canUserDeleteGame(u: User, white: User, black: User): boolean {
	const eitherUserIs = function (r: UserRole): boolean {
		return white.is(r) || black.is(r);
	};

	return (
		u.canDo('DELETE_GAMES') &&
		((u.canDo('DELETE_GAMES_ADMIN') && eitherUserIs('ADMIN')) ||
			(u.canDo('DELETE_GAMES_TEACHER') && eitherUserIs('TEACHER')) ||
			(u.canDo('DELETE_GAMES_STUDENT') && eitherUserIs('STUDENT')) ||
			(u.canDo('DELETE_GAMES_MEMBER') && eitherUserIs('MEMBER')))
	);
}

// CHALLENGES

export function canUserSendChallenge(sender: User, receiver: User): boolean {
	return (
		sender.canDo('CHALLENGE_USER') &&
		((receiver.is('ADMIN') && sender.canDo('CHALLENGE_USER_ADMIN')) ||
			(receiver.is('MEMBER') && sender.canDo('CHALLENGE_USER_MEMBER')) ||
			(receiver.is('STUDENT') && sender.canDo('CHALLENGE_USER_STUDENT')) ||
			(receiver.is('TEACHER') && sender.canDo('CHALLENGE_USER_TEACHER')))
	);
}

export function canUserDeclineChallenge(u1: User, u2: User, id: TimeControlId): boolean {
	if (u1.getRating(id).rating > u2.getRating(id).rating) {
		return UsersBehavior.getInstance().canHigherRatedDeclineChallengeLowerRated();
	}
	return true;
}

// GRAPHS

export function canUserSeeGraph(u: User, other: User): boolean {
	return (
		u.canDo('SEE_GRAPHS') &&
		((other.is('ADMIN') && u.canDo('SEE_GRAPHS_ADMIN')) ||
			(other.is('MEMBER') && u.canDo('SEE_GRAPHS_MEMBER')) ||
			(other.is('STUDENT') && u.canDo('SEE_GRAPHS_STUDENT')) ||
			(other.is('TEACHER') && u.canDo('SEE_GRAPHS_TEACHER')))
	);
}
