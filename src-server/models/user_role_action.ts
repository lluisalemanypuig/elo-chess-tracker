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

import { UserRole, ADMIN, TEACHER, MEMBER, STUDENT, all_user_roles } from './user_role';
import {
	all_action_ids,
	get_generic_role_action_name,
	get_role_action_name,
	UserAction,
	UserActionID
} from './user_action';

/// Relate each user role to a readable string
export class UserRoleToUserAction {
	/// The only instance of this class
	private static instance: UserRoleToUserAction;

	constructor() {
		if (UserRoleToUserAction.instance) {
			return UserRoleToUserAction.instance;
		}

		this.clear();
		UserRoleToUserAction.instance = this;
	}

	/**
	 * @brief Returns the only instance of this class
	 * @returns The only instance of this class
	 * @pre Method @ref initialize must have been called before
	 */
	static get_instance(): UserRoleToUserAction {
		UserRoleToUserAction.instance = UserRoleToUserAction.instance || new UserRoleToUserAction();
		return UserRoleToUserAction.instance;
	}

	/// The data structure that relates user roles to actions
	private relate: { [key in UserRole]: UserAction[] } = {
		admin: [],
		teacher: [],
		member: [],
		student: []
	};

	/// Add action 'action' to role 'role'
	add_to_role(role: UserRole, action: UserAction): void {
		this.relate[role].push(action);
	}

	/// Return all actions for role 'role'
	get_actions_role(role: UserRole): UserAction[] {
		return this.relate[role];
	}

	role_includes_action(role: UserRole, action: UserAction): boolean {
		return this.relate[role].includes(action);
	}

	role_can_do(role: UserRole, action: UserActionID): boolean {
		for (const other_roles of all_user_roles) {
			const user_action = get_role_action_name(action, other_roles);
			if (this.role_includes_action(role, user_action)) {
				return true;
			}
		}
		return false;
	}

	add_missing_generic_actions(role: UserRole): void {
		for (const action_id of all_action_ids) {
			if (this.role_can_do(role, action_id)) {
				const generic_action_name = get_generic_role_action_name(action_id);
				this.add_to_role(role, generic_action_name);
			}
		}
	}

	/// Clears the relationships contained in this instance.
	clear(): void {
		this.relate = {
			admin: [],
			teacher: [],
			member: [],
			student: []
		};
	}
}

/**
 * @brief Initialize the permissions of every type of user.
 * @param permission_data A JSON object with the following structure:
	{
		admin : [...],
		teacher : [...],
		member : [...],
		student : [...],
	}
 * where each "[...]" is a vector of UserAction.
 */
export function initialize_permissions(permission_data: any): void {
	let actions = UserRoleToUserAction.get_instance();

	// ADMIN
	for (let i = 0; i < permission_data.admin.length; ++i) {
		actions.add_to_role(ADMIN, permission_data.admin[i]);
	}
	actions.add_missing_generic_actions(ADMIN);

	// TEACHER
	for (let i = 0; i < permission_data.teacher.length; ++i) {
		actions.add_to_role(TEACHER, permission_data.teacher[i]);
	}
	actions.add_missing_generic_actions(TEACHER);

	// MEMBER
	for (let i = 0; i < permission_data.member.length; ++i) {
		actions.add_to_role(MEMBER, permission_data.member[i]);
	}
	actions.add_missing_generic_actions(MEMBER);

	// STUDENT
	for (let i = 0; i < permission_data.student.length; ++i) {
		actions.add_to_role(STUDENT, permission_data.student[i]);
	}
	actions.add_missing_generic_actions(STUDENT);
}
