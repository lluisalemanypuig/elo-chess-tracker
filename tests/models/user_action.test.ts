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

import {
	all_action_ids,
	USER_ROLE_ASSIGN_ADMIN,
	USER_ROLE_ASSIGN_MEMBER,
	USER_ROLE_ASSIGN_STUDENT,
	USER_ROLE_ASSIGN_TEACHER,
	USER_CHALLENGE_ADMIN,
	USER_CHALLENGE_MEMBER,
	USER_CHALLENGE_STUDENT,
	USER_CHALLENGE_TEACHER,
	USER_EDIT_ADMIN,
	USER_EDIT_MEMBER,
	USER_EDIT_STUDENT,
	USER_EDIT_TEACHER,
	get_role_action_name,
	GAMES_EDIT_ADMIN,
	GAMES_EDIT_MEMBER,
	GAMES_EDIT_STUDENT,
	GAMES_EDIT_TEACHER,
	GAMES_SEE_ADMIN,
	GAMES_SEE_MEMBER,
	GAMES_SEE_STUDENT,
	GAMES_SEE_TEACHER,
	UserAction,
	UserActionID,
	GAMES_CREATE_ADMIN,
	GAMES_CREATE_TEACHER,
	GAMES_CREATE_MEMBER,
	GAMES_CREATE_STUDENT,
	GRAPHS_SEE_ADMIN,
	GRAPHS_SEE_TEACHER,
	GRAPHS_SEE_MEMBER,
	GRAPHS_SEE_STUDENT,
	GAMES_DELETE_ADMIN,
	GAMES_DELETE_TEACHER,
	GAMES_DELETE_MEMBER,
	GAMES_DELETE_STUDENT
} from '../../src-server/models/user_action';
import { all_user_roles, UserRole } from '../../src-server/models/user_role';

describe('Role concatenation', () => {
	test('Check non-throwing functions', () => {
		for (let i = 0; i < all_action_ids.length; ++i) {
			const action_id = all_action_ids[i];
			for (let j = 0; j < all_user_roles.length; ++j) {
				const role = all_user_roles[j];
				expect(() => get_role_action_name(action_id as UserActionID, role as UserRole)).not.toThrow();
			}
		}
	});

	const roles_and_actions: { [key in UserActionID]: UserAction[] } = {
		create_games: [GAMES_CREATE_ADMIN, GAMES_CREATE_TEACHER, GAMES_CREATE_MEMBER, GAMES_CREATE_STUDENT],
		delete_games: [GAMES_DELETE_ADMIN, GAMES_DELETE_TEACHER, GAMES_DELETE_MEMBER, GAMES_DELETE_STUDENT],
		edit_users: [USER_EDIT_ADMIN, USER_EDIT_TEACHER, USER_EDIT_MEMBER, USER_EDIT_STUDENT],
		edit_games: [GAMES_EDIT_ADMIN, GAMES_EDIT_TEACHER, GAMES_EDIT_MEMBER, GAMES_EDIT_STUDENT],
		assign_role: [
			USER_ROLE_ASSIGN_ADMIN,
			USER_ROLE_ASSIGN_TEACHER,
			USER_ROLE_ASSIGN_MEMBER,
			USER_ROLE_ASSIGN_STUDENT
		],
		see_games: [GAMES_SEE_ADMIN, GAMES_SEE_TEACHER, GAMES_SEE_MEMBER, GAMES_SEE_STUDENT],
		see_graphs: [GRAPHS_SEE_ADMIN, GRAPHS_SEE_TEACHER, GRAPHS_SEE_MEMBER, GRAPHS_SEE_STUDENT],
		challenge: [USER_CHALLENGE_ADMIN, USER_CHALLENGE_TEACHER, USER_CHALLENGE_MEMBER, USER_CHALLENGE_STUDENT]
	};

	test('Check correct concatenation', () => {
		for (let i = 0; i < all_action_ids.length; ++i) {
			const action_id = all_action_ids[i];
			const concats = roles_and_actions[action_id as UserActionID];
			for (let j = 0; j < all_user_roles.length; ++j) {
				const r = all_user_roles[j];
				expect(get_role_action_name(action_id as UserActionID, r)).toEqual(concats[j]);
			}
		}
	});
});
