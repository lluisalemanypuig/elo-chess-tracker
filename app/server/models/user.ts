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

import { z } from 'zod';
import { Player } from './player';
import { Password } from './password';
import { UserRole } from './user_role';
import { UserAction } from './user_action';
import { UserRoleToUserAction } from './user_role_action';
import { TimeControlRating } from './time_control_rating';
import { TimeControlID } from './time_control';
import { copyarray } from '@server/utils/misc';
import { search_by_key, search_linear_by_key, where_should_be_inserted_by_key } from '@server/utils/searching';
import { DateStringShort } from '@server/utils/time';

export type UserRandomID = number;

export const GameNumberSchema = z
	.object({
		record: z.string() as z.ZodType<DateStringShort>,
		amount: z.number()
	})
	.strict();

export type GameNumber = z.infer<typeof GameNumberSchema>;

export const GameNumberArraySchema = z.array(GameNumberSchema);

export type GameNumberArray = z.infer<typeof GameNumberArraySchema>;

export const TimeControlGameSchema = z
	.object({
		time_control: z.string() as z.ZodType<TimeControlID>,
		records: z.array(GameNumberSchema)
	})
	.strict();

export type TimeControlGame = z.infer<typeof TimeControlGameSchema>;

export const TimeControlGameArraySchema = z.array(TimeControlGameSchema);

export type TimeControlGameArray = z.infer<typeof TimeControlGameArraySchema>;

export const UserKeys = ['username', 'first_name', 'last_name', 'password', 'roles', 'games', 'ratings'];

/**
 * @brief Simple class to encode a User
 *
 * The difference between @ref Player and @ref User is that this has extra member
 * strings to store actual name and surnames, and the password of the player.
 */
export class User extends Player {
	/// First name
	public first_name: string;
	/// Last name
	public last_name: string;
	/// Password
	public password: Password;
	/// Roles of this user
	public roles: UserRole[];
	/**
	 * @brief The set of games this user has played
	 *
	 * For each time rating id, there is an array of strings that simply point
	 * to the game records.
	 */
	public games: TimeControlGame[];

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
		games: TimeControlGame[],
		ratings: TimeControlRating[]
	) {
		super(username, ratings);
		this.first_name = first_name;
		this.last_name = last_name;
		this.password = password;
		this.games = games;
		this.roles = roles;
	}

	/// Returns the full name of this user
	get_full_name(): string {
		return `${this.first_name} ${this.last_name}`;
	}

	/**
	 * @brief Returns the set of games played by this user.
	 * @param id The time control id.
	 * @returns A list of strings pointing to game records.
	 */
	get_games(id: TimeControlID): GameNumber[] {
		const idx = search_linear_by_key(this.games, (v: TimeControlGame): boolean => {
			return v.time_control == id;
		});
		if (idx == -1) {
			throw new Error(`Rating with id '${id}' does not exist!`);
		}
		return this.games[idx].records;
	}

	/**
	 * @brief Inserts a new game record string into @ref games.
	 *
	 * If the record string already exists, does nothing.
	 * @param id Time control id of the game.
	 * @param game_record New game record string.
	 */
	add_game(id: TimeControlID, game_record: DateStringShort): void {
		const idx = search_linear_by_key(this.games, (p: TimeControlGame): boolean => {
			return p.time_control == id;
		});
		if (idx == -1) {
			throw new Error(`User does not have time control id '${id}'`);
		}

		const [index, exists] = where_should_be_inserted_by_key(this.games[idx].records, (s: GameNumber): number => {
			return game_record.localeCompare(s.record);
		});
		if (!exists) {
			this.games[idx].records.splice(index, 0, { record: game_record, amount: 1 });
		} else {
			this.games[idx].records[index].amount += 1;
		}
	}

	delete_game(id: TimeControlID, game_record: DateStringShort): void {
		const idx = search_linear_by_key(this.games, (p: TimeControlGame): boolean => {
			return p.time_control == id;
		});
		if (idx == -1) {
			throw new Error(`User does not have time control id '${id}'`);
		}

		const index = search_by_key(this.games[idx].records, (s: GameNumber): number => {
			return game_record.localeCompare(s.record);
		});
		if (index == -1) {
			throw new Error(
				`User '${this.username}' does not have game record '${game_record}' in time control '${id}': '${this.games[idx].records}'.`
			);
		}

		this.games[idx].records[index].amount -= 1;
		if (this.games[idx].records[index].amount == 0) {
			this.games[idx].records.splice(index, 1);
		}
	}

	/// Returns all actions this user
	get_actions(): UserAction[] {
		const role_to_action = UserRoleToUserAction.get_instance();
		const roles = this.roles;

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
		if (this.username != p.username) {
			throw new Error(`Trying to dump data of user ${p.username} into a different player ${this.username}`);
		}

		// copy all ratings
		this.ratings = p.ratings;
	}

	/// Creates a copy of this user
	override clone(): User {
		return new User(
			this.username,
			this.first_name,
			this.last_name,
			{ ...this.password },
			copyarray(this.roles, (s: UserRole): UserRole => {
				return s;
			}),
			copyarray(this.games, (value: TimeControlGame): TimeControlGame => {
				return { ...value };
			}),
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
