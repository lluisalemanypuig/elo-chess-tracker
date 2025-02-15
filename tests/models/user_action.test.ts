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

import {
	all_action_ids,
	ASSIGN_ROLE_ADMIN,
	ASSIGN_ROLE_MEMBER,
	ASSIGN_ROLE_STUDENT,
	ASSIGN_ROLE_TEACHER,
	CHALLENGE_ADMIN,
	CHALLENGE_MEMBER,
	CHALLENGE_STUDENT,
	CHALLENGE_TEACHER,
	EDIT_ADMIN,
	EDIT_MEMBER,
	EDIT_STUDENT,
	EDIT_TEACHER,
	get_role_action_name,
	EDIT_GAMES_ADMIN,
	EDIT_GAMES_MEMBER,
	EDIT_GAMES_STUDENT,
	EDIT_GAMES_TEACHER,
	SEE_GAMES_ADMIN,
	SEE_GAMES_MEMBER,
	SEE_GAMES_STUDENT,
	SEE_GAMES_TEACHER,
	UserAction,
	UserActionID,
	CREATE_GAMES_ADMIN,
	CREATE_GAMES_TEACHER,
	CREATE_GAMES_MEMBER,
	CREATE_GAMES_STUDENT,
	SEE_GRAPHS_ADMIN,
	SEE_GRAPHS_TEACHER,
	SEE_GRAPHS_MEMBER,
	SEE_GRAPHS_STUDENT
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
		create_game: [CREATE_GAMES_ADMIN, CREATE_GAMES_TEACHER, CREATE_GAMES_MEMBER, CREATE_GAMES_STUDENT],
		edit_users: [EDIT_ADMIN, EDIT_TEACHER, EDIT_MEMBER, EDIT_STUDENT],
		edit_games: [EDIT_GAMES_ADMIN, EDIT_GAMES_TEACHER, EDIT_GAMES_MEMBER, EDIT_GAMES_STUDENT],
		assign_role: [ASSIGN_ROLE_ADMIN, ASSIGN_ROLE_TEACHER, ASSIGN_ROLE_MEMBER, ASSIGN_ROLE_STUDENT],
		see_games: [SEE_GAMES_ADMIN, SEE_GAMES_TEACHER, SEE_GAMES_MEMBER, SEE_GAMES_STUDENT],
		see_graphs: [SEE_GRAPHS_ADMIN, SEE_GRAPHS_TEACHER, SEE_GRAPHS_MEMBER, SEE_GRAPHS_STUDENT],
		challenge: [CHALLENGE_ADMIN, CHALLENGE_TEACHER, CHALLENGE_MEMBER, CHALLENGE_STUDENT]
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
