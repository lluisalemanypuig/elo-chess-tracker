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
import { Player, PlayerPrivateId } from '@common/models/player';
import { Password } from '@common/models/password';
import { UserRole } from '@common/models/user-role';
import { UserAction } from '@common/models/user-action';
import { UserRoleToUserAction } from '@server/managers/user-role-action';
import { TimeControlRating } from '@common/models/time-control-rating';
import { TimeControlId, TimeControlIdSchema } from '@common/models/time-control';
import { copyarray } from '@server/utils/misc';
import { searchByKey, searchLinearByKey, whereShouldBeInsertedByKey } from '@server/utils/searching';
import { DateMajor, DateMajorSchema } from '@common/utils/time';
import { InternalError } from '@server/utils/error-types/internal-error';

export const GameNumberSchema = z
	.object({
		record: DateMajorSchema,
		amount: z.number()
	})
	.strict();

export type GameNumber = z.infer<typeof GameNumberSchema>;

export const GameNumberArraySchema = z.array(GameNumberSchema);

export type GameNumberArray = z.infer<typeof GameNumberArraySchema>;

export const TimeControlGameSchema = z
	.object({
		timeControl: TimeControlIdSchema,
		records: z.array(GameNumberSchema)
	})
	.strict();

export type TimeControlGame = z.infer<typeof TimeControlGameSchema>;

export const TimeControlGameArraySchema = z.array(TimeControlGameSchema);

export type TimeControlGameArray = z.infer<typeof TimeControlGameArraySchema>;

export const UserKeys = ['username', 'firstName', 'lastName', 'password', 'roles', 'games', 'ratings'];

// User name

declare const UserGivenNameBrand: unique symbol;
export type UserGivenNameLocal = string & {
	readonly [UserGivenNameBrand]: 'UserGivenNameLocal';
};
export const UserGivenNameSchema = z.string().brand<'UserGivenNameLocal'>();
export type UserGivenName = z.infer<typeof UserGivenNameSchema>;

export function toUserGivenName(s: string): UserGivenName {
	return s as UserGivenName;
}

/**
 * @brief Simple class to encode a User
 *
 * The difference between @ref Player and @ref User is that this has extra member
 * strings to store actual name and surnames, and the password of the player.
 */
export class User extends Player {
	/// First name
	public firstName: UserGivenName;
	/// Last name
	public lastName: UserGivenName;
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
	 * @param firstName First name of the player.
	 * @param lastName Last name of the player.
	 * @param password Password of the user.
	 * @param roles User roles.
	 * @param games The set of games played.
	 * @param ratings Ratings for every time control
	 */
	constructor(
		username: PlayerPrivateId,
		firstName: UserGivenName,
		lastName: UserGivenName,
		password: Password,
		roles: UserRole[],
		games: TimeControlGame[],
		ratings: TimeControlRating[]
	) {
		super(username, ratings);
		this.firstName = firstName;
		this.lastName = lastName;
		this.password = password;
		this.games = games;
		this.roles = roles;
	}

	/// Returns the full name of this user
	getFullName(): UserGivenName {
		return toUserGivenName(`${this.firstName} ${this.lastName}`);
	}

	/**
	 * @brief Returns the set of games played by this user.
	 * @param id The time control id.
	 * @returns A list of strings pointing to game records.
	 */
	getGames(id: TimeControlId): GameNumber[] {
		const idx = searchLinearByKey(this.games, (v: TimeControlGame): boolean => {
			return v.timeControl === id;
		});
		if (idx === -1) {
			throw new InternalError(`Rating with id '${id}' does not exist!`);
		}
		return this.games[idx].records;
	}

	/**
	 * @brief Inserts a new game record string into @ref games.
	 *
	 * If the record string already exists, does nothing.
	 * @param id Time control id of the game.
	 * @param gameRecord New game record string.
	 */
	addGame(id: TimeControlId, gameRecord: DateMajor) {
		const idx = searchLinearByKey(this.games, (p: TimeControlGame): boolean => {
			return p.timeControl === id;
		});
		if (idx === -1) {
			throw new InternalError(`User does not have time control id '${id}'`);
		}

		const [index, exists] = whereShouldBeInsertedByKey(this.games[idx].records, (s: GameNumber): number => {
			return gameRecord.localeCompare(s.record);
		});
		if (!exists) {
			this.games[idx].records.splice(index, 0, { record: gameRecord, amount: 1 });
		} else {
			this.games[idx].records[index].amount += 1;
		}
	}

	deleteGame(id: TimeControlId, gameRecord: DateMajor) {
		const idx = searchLinearByKey(this.games, (p: TimeControlGame): boolean => {
			return p.timeControl === id;
		});
		if (idx === -1) {
			throw new InternalError(`User does not have time control id '${id}'`);
		}

		const index = searchByKey(this.games[idx].records, (s: GameNumber): number => {
			return gameRecord.localeCompare(s.record);
		});
		if (index === -1) {
			throw new InternalError(
				`User '${this.username}' does not have game record '${gameRecord}' in time control '${id}': '${this.games[idx].records}'.`
			);
		}

		this.games[idx].records[index].amount -= 1;
		if (this.games[idx].records[index].amount === 0) {
			this.games[idx].records.splice(index, 1);
		}
	}

	/// Returns all actions this user
	getActions(): UserAction[] {
		const role_to_action = UserRoleToUserAction.getInstance();
		const roles = this.roles;

		let actions: UserAction[] = [];
		for (const r of roles) {
			const actions_from_role = role_to_action.getActionsRole(r);

			for (const action of actions_from_role) {
				if (actions.indexOf(action) === -1) {
					actions.push(action);
				}
			}
		}

		return actions;
	}

	/// Can a user perform a certain action?
	canDo(a: UserAction): boolean {
		const user_role_to_action = UserRoleToUserAction.getInstance();

		for (const role of this.roles) {
			if (user_role_to_action.roleIncludesAction(role, a)) {
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
	copyPlayerData(p: Player) {
		if (this.username !== p.username) {
			throw new InternalError(
				`Trying to dump data of user ${p.username} into a different player ${this.username}`
			);
		}

		// copy all ratings
		this.ratings = p.ratings;
	}

	/// Creates a copy of this user
	override clone(): User {
		return new User(
			this.username,
			this.firstName,
			this.lastName,
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

	cloneAsPlayer(): Player {
		return new Player(
			this.username,
			copyarray(this.ratings, (tcr: TimeControlRating): TimeControlRating => {
				return tcr.clone();
			})
		);
	}
}
