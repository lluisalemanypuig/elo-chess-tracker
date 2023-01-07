/*
Elo rating for a Chess Club
Copyright (C) 2023  Lluís Alemany Puig

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

import Debug from 'debug';
const debug = Debug('ELO_TRACKER:server_setup');

import path from "path";

import { User } from "../models/user";
import { Challenge } from '../models/challenge';
import { player_vs_player } from '../rating_system/Elo_system';

/// What formula 
export class RatingFormula {
	public formula: Function;

	/// The only instance of this class
	private static instance: RatingFormula;

	constructor(formula: Function = player_vs_player) {
		this.formula = formula;
	}

	/// Initializes the only instance with a base path
	static initialize(formula: Function): void {
		RatingFormula.instance = new RatingFormula(formula);
	}

	/**
	 * @brief Returns the only instance of this class
	 * @returns The only instance of this class
	 * @pre Method @ref initialize must have been called before
	 */
	static get_instance(): RatingFormula {
		return RatingFormula.instance;
	}
}

/**
 * @brief Directories and other parameters of the server environment
 * 
 * Directories:
 * - @ref base_directory: base directory of the server
 * - @ref games_directory: directory where games are stored
 * - @ref users_directory: directory where player files are stored
 */
export class ServerDirectories {
	public base_directory: string = "";
	public games_directory: string = "";
	public users_directory: string = "";
	public challenges_directory: string = "";

	/// The only instance of this class
	private static instance: ServerDirectories;

	/**
	 * @brief Construct the server configuration
	 * @param base_dir Base directory, pointing at the root of the databse/ directory
	 */
	constructor(base_dir: string) {
		if (ServerDirectories.instance) {
			return ServerDirectories.instance;
		}

		this.base_directory = base_dir;
		this.games_directory = path.join(this.base_directory, "games");
		this.users_directory = path.join(this.base_directory, "users");
		this.challenges_directory = path.join(this.base_directory, "challenges");

		ServerDirectories.instance = this;
	}

	/// Initializes the only instance with a base path
	static initialize(base_dir: string): void {
		ServerDirectories.instance = new ServerDirectories(base_dir);
	}

	/**
	 * @brief Returns the only instance of this class
	 * @returns The only instance of this class
	 * @pre Method @ref initialize must have been called before
	 */
	static get_instance(): ServerDirectories {
		return ServerDirectories.instance;
	}
}

/**
 * @brief A structure that encodes a session.
 * 
 * It consists of an id and a username
 */
export class SessionID {
	public readonly id: string;
	public readonly username: string;
	constructor(id: string, username: string) {
		this.id = id;
		this.username = username;
	}
}

/**
 * @brief A singleton class to store data at runtime
 * 
 * Stores things like users session ids.
 */
export class ServerMemory {

	/// Session ids of the server.
	public session_ids: SessionID[] = [];
	
	/// Set of users
	public users: User[] = [];
	public user_to_index: Map<string, number> = new Map();

	/// The challenges in the system
	public challenges: Challenge[] = [];
	
	/// Number of games in the system
	public num_games: number = 0;

	/// The only instance of this class
	private static instance: ServerMemory;

	constructor() {
		if (ServerMemory.instance) {
			return ServerMemory.instance;
		}
		ServerMemory.instance = this;
	}

	/// Returns the only instance of this class
	static get_instance(): ServerMemory {
		ServerMemory.instance = ServerMemory.instance || new ServerMemory();
		return ServerMemory.instance;
	}
}
