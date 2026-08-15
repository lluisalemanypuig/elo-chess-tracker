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

import { ALL_ACTION_IDS, getRoleActionName, UserAction, UserActionId } from '@common/models/user-action';
import { ALL_USER_ROLES, UserRole } from '@common/models/user-role';

describe('Role concatenation', () => {
	test('Check non-throwing functions', () => {
		for (const action_id of ALL_ACTION_IDS) {
			for (const role of ALL_USER_ROLES) {
				expect(() => getRoleActionName(action_id as UserActionId, role as UserRole)).not.toThrow();
			}
		}
	});

	const roles_and_actions: { [key in UserActionId]: UserAction[] } = {
		CREATE_GAMES: ['CREATE_GAMES_ADMIN', 'CREATE_GAMES_TEACHER', 'CREATE_GAMES_MEMBER', 'CREATE_GAMES_STUDENT'],
		DELETE_GAMES: ['DELETE_GAMES_ADMIN', 'DELETE_GAMES_TEACHER', 'DELETE_GAMES_MEMBER', 'DELETE_GAMES_STUDENT'],
		EDIT_USERS: ['EDIT_USER_ADMIN', 'EDIT_USER_TEACHER', 'EDIT_USER_MEMBER', 'EDIT_USER_STUDENT'],
		EDIT_GAMES: ['EDIT_GAMES_ADMIN', 'EDIT_GAMES_TEACHER', 'EDIT_GAMES_MEMBER', 'EDIT_GAMES_STUDENT'],
		ASSIGN_ROLE_USERS: ['ASSIGN_ROLE_ADMIN', 'ASSIGN_ROLE_TEACHER', 'ASSIGN_ROLE_MEMBER', 'ASSIGN_ROLE_STUDENT'],
		SEE_GAMES: ['SEE_GAMES_ADMIN', 'SEE_GAMES_TEACHER', 'SEE_GAMES_MEMBER', 'SEE_GAMES_STUDENT'],
		SEE_GRAPHS: ['SEE_GRAPHS_ADMIN', 'SEE_GRAPHS_TEACHER', 'SEE_GRAPHS_MEMBER', 'SEE_GRAPHS_STUDENT'],
		CHALLENGE_USERS: [
			'CHALLENGE_USER_ADMIN',
			'CHALLENGE_USER_TEACHER',
			'CHALLENGE_USER_MEMBER',
			'CHALLENGE_USER_STUDENT'
		]
	};

	test('Check correct concatenation', () => {
		for (let i = 0; i < ALL_ACTION_IDS.length; ++i) {
			const action_id = ALL_ACTION_IDS[i];
			const concats = roles_and_actions[action_id as UserActionId];
			for (let j = 0; j < ALL_USER_ROLES.length; ++j) {
				const r = ALL_USER_ROLES[j];
				expect(getRoleActionName(action_id as UserActionId, r)).toEqual(concats[j]);
			}
		}
	});
});
