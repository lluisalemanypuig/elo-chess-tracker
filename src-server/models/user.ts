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

import { Player } from './player';
import { Password, password_from_json } from './password';
import { UserRole } from './user_role';
import { UserAction } from './user_action';
import { UserRoleToUserAction } from './user_role_action';
import { copyarray } from '../utils/misc';
import { where_should_be_inserted } from '../utils/searching';
import { TimeControlRating, time_control_rating_set_from_json } from './time_control_rating';
import { TimeControlID } from './time_control';
import { DateStringShort } from '../utils/time';

export type UserRandomID = number;

/**
 * @brief Simple class to encode a User
 *
 * The difference between @ref Player and @ref User is that this has extra member
 * strings to store actual name and surnames, and the password of the player.
 */
export class User extends Player {
	/// First name
	private first_name: string;
	/// Last name
	private last_name: string;
	/// Password
	private password: Password;
	/// Roles of this user
	private roles: UserRole[];
	/**
	 * @brief The set of games this user has played
	 *
	 * For each time rating id, there is an array of strings that simply point
	 * to the game records.
	 */
	private games: Map<TimeControlID, DateStringShort[]>;

	toJSON(): object {
		return {
			username: this.username,
			first_name: this.first_name,
			last_name: this.last_name,
			password: this.password,
			roles: this.roles,
			ratings: this.ratings,
			games: Object.fromEntries(this.games)
		};
	}

	/**
	 * @brief Constructor
	 * @param username User name of the player.
	 * @param first_name First name of the player.
	 * @param last_name Last name of the player.
	 * @param password Password of the user.
	 * @param roles User roles.
	 * @param games The set of games played.
	 * @param ratings Ratings for every time control
	 */
	constructor(
		username: string,
		first_name: string,
		last_name: string,
		password: Password,
		roles: UserRole[],
		games: Map<TimeControlID, DateStringShort[]>,
		ratings: TimeControlRating[]
	) {
		super(username, ratings);
		this.first_name = first_name;
		this.last_name = last_name;
		this.password = password;
		this.roles = roles;
		this.games = games;
	}

	/// Set first name of the user
	set_first_name(f: string): void {
		this.first_name = f;
	}
	/// Set last name of the user
	set_last_name(l: string): void {
		this.last_name = l;
	}
	/// Set roles to the user
	set_roles(rs: UserRole[]): void {
		this.roles = rs;
	}

	/// Return last name of the user
	get_first_name(): string {
		return this.first_name;
	}
	/// Return last name of the user
	get_last_name(): string {
		return this.last_name;
	}
	/// Returns the full name of this user
	get_full_name(): string {
		return `${this.first_name} ${this.last_name}`;
	}

	set_password(pwd: Password) {
		this.password = pwd;
	}
	/// Returns the password of this user
	get_password(): Password {
		return this.password;
	}

	/// Returns the role of this user.
	get_roles(): UserRole[] {
		return this.roles;
	}

	/**
	 * @brief Returns the set of games played by this user.
	 * @param id The time control id.
	 * @returns A list of strings pointing to game records.
	 */
	get_games(id: TimeControlID): DateStringShort[] | undefined {
		return this.games.get(id);
	}

	/**
	 * @brief Inserts a new game record string into @ref games.
	 *
	 * If the record string already exists, does nothing.
	 * @param id Time control id of the game.
	 * @param g New game record string.
	 */
	add_game(id: TimeControlID, g: DateStringShort): void {
		let games_id = this.games.get(id);
		if (games_id == undefined) {
			throw new Error(`User does not have time control id '${id}'`);
		}

		let [index, exists] = where_should_be_inserted(games_id, g);
		if (!exists) {
			games_id.splice(index, 0, g);
		}
	}

	/// Returns all actions this user
	get_actions(): UserAction[] {
		const role_to_action = UserRoleToUserAction.get_instance();
		const roles = this.get_roles();

		let actions: UserAction[] = [];
		for (let i = 0; i < roles.length; ++i) {
			const r = roles[i];
			const actions_from_role = role_to_action.get_actions_role(r);

			for (let j = 0; j < actions_from_role.length; ++j) {
				const action = actions_from_role[j];
				if (actions.indexOf(action) == -1) {
					actions.push(action);
				}
			}
		}

		return actions;
	}

	/// Can a user perform a certain action?
	can_do(a: UserAction): boolean {
		const user_role_to_action = UserRoleToUserAction.get_instance();

		for (let i = 0; i < this.roles.length; ++i) {
			if (user_role_to_action.role_includes_action(this.roles[i], a)) {
				return true;
			}
		}
		return false;
	}
	/// Does a user have a certain role?
	is(r: UserRole): boolean {
		return this.roles.includes(r);
	}

	/**
	 * @brief Dump the values the input player @e p into this player.
	 * @param p Input player.
	 * @pre Usernames are equal
	 */
	copy_player_data(p: Player): void {
		if (this.username != p.get_username()) {
			throw new Error(`Trying to dump data of user ${p.get_username()} into a different player ${this.username}`);
		}

		// copy all ratings
		this.ratings = p.get_all_ratings();
	}

	/// Creates a copy of this user
	override clone(): User {
		let new_games: Map<TimeControlID, DateStringShort[]> = new Map();
		this.games.forEach((value: DateStringShort[], key: TimeControlID) => {
			new_games.set(
				key,
				copyarray(value, (id: DateStringShort): DateStringShort => {
					return id;
				})
			);
		});

		return new User(
			this.username,
			this.first_name,
			this.last_name,
			this.password.clone(),
			copyarray(this.roles, (s: UserRole): UserRole => {
				return s;
			}),
			new_games,
			copyarray(this.ratings, (r: TimeControlRating): TimeControlRating => {
				return r.clone();
			})
		);
	}

	clone_as_player(): Player {
		return new Player(
			this.username,
			copyarray(this.ratings, (tcr: TimeControlRating): TimeControlRating => {
				return tcr.clone();
			})
		);
	}
}

/**
 * @brief Parses a JSON string or object and returns a User.
 * @param json A JSON string or object with data of a User.
 * @returns A new User object.
 * @pre If @e json is a string then it cannot start with '['.
 */
export function user_from_json(json: any): User {
	if (typeof json === 'string') {
		const json_parse = JSON.parse(json);
		return user_from_json(json_parse);
	}

	return new User(
		json['username'],
		json['first_name'],
		json['last_name'],
		password_from_json(json['password']),
		json['roles'],
		new Map(Object.entries(json['games'])),
		time_control_rating_set_from_json(json['ratings'])
	);
}

/**
 * @brief Parses a JSON string or object and returns a set of User.
 * @param json A JSON string or object with data of several User.
 * @returns An array of User objects.
 */
export function user_set_from_json(json: any): User[] {
	if (typeof json === 'string') {
		const json_parse = JSON.parse(json);
		return user_set_from_json(json_parse);
	}

	let player_set: User[] = [];
	for (var player in json) {
		player_set.push(user_from_json(json[player]));
	}
	return player_set;
}
