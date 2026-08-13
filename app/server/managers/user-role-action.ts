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

import { UserRole, ADMIN, TEACHER, MEMBER, STUDENT, ALL_USER_ROLES } from '@common/models/user-role';
import {
	ALL_ACTION_IDS,
	getGenericRoleActionName,
	getRoleActionName,
	UserAction,
	UserActionID
} from '@common/models/user-action';
import { UserPermissions } from '@common/models/configuration/permissions';

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
	static getInstance(): UserRoleToUserAction {
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
	addToRole(role: UserRole, action: UserAction): void {
		this.relate[role].push(action);
	}

	/// Return all actions for role 'role'
	getActionsRole(role: UserRole): UserAction[] {
		return this.relate[role];
	}

	roleIncludesAction(role: UserRole, action: UserAction): boolean {
		return this.relate[role].includes(action);
	}

	roleCanDo(role: UserRole, action: UserActionID): boolean {
		for (const otherRoles of ALL_USER_ROLES) {
			const userAction = getRoleActionName(action, otherRoles);
			if (this.roleIncludesAction(role, userAction)) {
				return true;
			}
		}
		return false;
	}

	addMissingGenericActions(role: UserRole): void {
		for (const actionId of ALL_ACTION_IDS) {
			if (this.roleCanDo(role, actionId)) {
				const genericActionName = getGenericRoleActionName(actionId);
				this.addToRole(role, genericActionName);
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
 * @param permissions A JSON object with the following structure:
	{
		admin : [...],
		teacher : [...],
		member : [...],
		student : [...],
	}
 * where each "[...]" is a vector of UserAction.
 */
export function initializePermissions(permissions: UserPermissions): void {
	let actions = UserRoleToUserAction.getInstance();

	// ADMIN
	for (const permission of permissions.admin) {
		actions.addToRole(ADMIN, permission);
	}
	actions.addMissingGenericActions(ADMIN);

	// TEACHER
	for (const permission of permissions.teacher) {
		actions.addToRole(TEACHER, permission);
	}
	actions.addMissingGenericActions(TEACHER);

	// MEMBER
	for (const permission of permissions.member) {
		actions.addToRole(MEMBER, permission);
	}
	actions.addMissingGenericActions(MEMBER);

	// STUDENT
	for (const permission of permissions.student) {
		actions.addToRole(STUDENT, permission);
	}
	actions.addMissingGenericActions(STUDENT);
}
