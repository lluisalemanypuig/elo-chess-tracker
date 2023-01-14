import { UserRole } from "./user_role";
import { UserAction } from "./user_action";

/// Relate each user role to a readable string
export class UserRoleToUserAction {

	/// The data structure that relates user roles to actions
	private relate: { [key in UserRole]: UserAction[] } = {};

	/// The only instance of this class
	private static instance: UserRoleToUserAction;

	constructor() {
		if (UserRoleToUserAction.instance) {
			return UserRoleToUserAction.instance;
		}

		this.relate = {
			admin: [],
			teacher: [],
			member: [],
			student: [],
		};

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

	/// Add action 'action' to role 'role'
	add_to_role(role: UserRole, action: UserAction): void {
		this.relate[role].push(action);
	}

	/// Return all actions for role 'role'
	get_actions_role(role: UserRole): UserAction[] {
		return this.relate[role];
	}
}
