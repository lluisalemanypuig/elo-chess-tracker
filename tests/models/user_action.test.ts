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
	EDIT_ADMIN_GAMES,
	EDIT_MEMBER,
	EDIT_MEMBER_GAMES,
	EDIT_STUDENT,
	EDIT_STUDENT_GAMES,
	EDIT_TEACHER,
	EDIT_TEACHER_GAMES,
	get_role_action_name,
	SEE_ADMIN_GAMES,
	SEE_MEMBER_GAMES,
	SEE_STUDENT_GAMES,
	SEE_TEACHER_GAMES,
	UserAction,
	UserActionID
} from '../../ts-server/models/user_action';
import { all_user_roles, UserRole } from '../../ts-server/models/user_role';

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
		edit: [EDIT_ADMIN, EDIT_TEACHER, EDIT_MEMBER, EDIT_STUDENT],
		edit_games: [EDIT_ADMIN_GAMES, EDIT_TEACHER_GAMES, EDIT_MEMBER_GAMES, EDIT_STUDENT_GAMES],
		assign: [ASSIGN_ROLE_ADMIN, ASSIGN_ROLE_TEACHER, ASSIGN_ROLE_MEMBER, ASSIGN_ROLE_STUDENT],
		see: [SEE_ADMIN_GAMES, SEE_TEACHER_GAMES, SEE_MEMBER_GAMES, SEE_STUDENT_GAMES],
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
