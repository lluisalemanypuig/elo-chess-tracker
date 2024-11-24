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

/// Can create users
export const CREATE_USER = 'create_user';

/// Can create games
export const CREATE_GAME = 'create_game';

/// Edit a user
export const EDIT_USER = 'edit_user';
/// Edit admin
export const EDIT_ADMIN = 'edit_admin';
/// Edit teacher
export const EDIT_TEACHER = 'edit_teacher';
/// Edit members
export const EDIT_MEMBER = 'edit_member';
/// Edit students
export const EDIT_STUDENT = 'edit_student';

/// Can edit user games
export const EDIT_USER_GAMES = 'edit_user_games';
/// Can edit admin games
export const EDIT_ADMIN_GAMES = 'edit_admin_games';
/// Can edit teacher games
export const EDIT_TEACHER_GAMES = 'edit_teacher_games';
/// Can edit member games
export const EDIT_MEMBER_GAMES = 'edit_member_games';
/// Can edit student games
export const EDIT_STUDENT_GAMES = 'edit_student_games';

/// Assign admin role
export const ASSIGN_ROLE_ADMIN = 'assign_role_admin';
/// Assign teacher role
export const ASSIGN_ROLE_TEACHER = 'assign_role_teacher';
/// Assign member role
export const ASSIGN_ROLE_MEMBER = 'assign_role_member';
/// Assign student role
export const ASSIGN_ROLE_STUDENT = 'assign_role_student';

/// Can see a users games
export const SEE_USER_GAMES = 'see_user_games';
/// Can see admin's games
export const SEE_ADMIN_GAMES = 'see_admin_games';
/// Can see teacher's games
export const SEE_TEACHER_GAMES = 'see_teacher_games';
/// Can see members' games
export const SEE_MEMBER_GAMES = 'see_member_games';
/// Can see student' games
export const SEE_STUDENT_GAMES = 'see_student_games';

/// Can challenge a user
export const CHALLENGE_USER = 'challenge_user';
/// Can see admin's games
export const CHALLENGE_ADMIN = 'challenge_admin';
/// Can see teacher's games
export const CHALLENGE_MEMBER = 'challenge_member';
/// Can see members' games
export const CHALLENGE_TEACHER = 'challenge_teacher';
/// Can see student' games
export const CHALLENGE_STUDENT = 'challenge_student';

/// All actions that can be performed in this web
export const all_actions = [
    CREATE_USER,
    CREATE_GAME,

    EDIT_USER,
    EDIT_ADMIN,
    EDIT_TEACHER,
    EDIT_MEMBER,
    EDIT_STUDENT,

    EDIT_USER_GAMES,
    EDIT_ADMIN_GAMES,
    EDIT_TEACHER_GAMES,
    EDIT_MEMBER_GAMES,
    EDIT_STUDENT_GAMES,

    ASSIGN_ROLE_ADMIN,
    ASSIGN_ROLE_TEACHER,
    ASSIGN_ROLE_MEMBER,
    ASSIGN_ROLE_STUDENT,

    SEE_USER_GAMES,
    SEE_ADMIN_GAMES,
    SEE_TEACHER_GAMES,
    SEE_MEMBER_GAMES,
    SEE_STUDENT_GAMES,

    CHALLENGE_USER,
    CHALLENGE_ADMIN,
    CHALLENGE_MEMBER,
    CHALLENGE_TEACHER,
    CHALLENGE_STUDENT
] as const;

/// All actions as type
export type UserAction = (typeof all_actions)[number];
