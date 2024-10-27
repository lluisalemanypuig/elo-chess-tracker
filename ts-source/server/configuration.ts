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

import path from "path";

import { User } from "../models/user";
import { Challenge } from '../models/challenge';
import { RatingSystemType } from "../rating_system/rating_system_type";
import { TimeControl } from "../models/time_control";
import { linear_find } from "../utils/misc";
import { ADMIN } from "../models/user_role";

/**
 * @brief Rating system in the web
 */
export class RatingSystem {

	/// Function to evaluate a game
	public formula: Function = () => void {};
	/// Function to read a single rating JSON object
	public rating_from_JSON: Function = () => void {};
	/// Function to read a single rating JSON object
	public rating_set_from_JSON: Function = () => void {};
	/// Function to create a new rating
	public new_rating: Function = () => void {};
	/// All ratings used in the web
	public all_time_controls: TimeControl[] = [];
	
	/// Rating System type chosen
	public type: RatingSystemType = "";

	/// The only instance of this class
	private static instance: RatingSystem;

	constructor() {
		if (RatingSystem.instance) {
			return RatingSystem.instance;
		}
		RatingSystem.instance = this;
	}

	set_formula_function(formula: Function): void {
		this.formula = formula;
	}
	set_rating_from_JSON(read_rating: Function): void {
		this.rating_from_JSON = read_rating;
	}
	set_rating_set_from_JSON(read_rating_set: Function): void {
		this.rating_set_from_JSON = read_rating_set;
	}
	set_new_rating(new_rating: Function): void {
		this.new_rating = new_rating;
	}
	set_time_controls(all_ratings: TimeControl[]): void {
		this.all_time_controls = all_ratings;
	}
	get_name_time_control(time_control_id: string): string {
		const index = linear_find(this.all_time_controls, (t: TimeControl): boolean => { return t.id == time_control_id; });
		if (index >= this.all_time_controls.length) { return "?"; }
		return this.all_time_controls[index].name;
	}
	set_type(type: RatingSystemType): void {
		this.type = type;
	}

	is_time_control_id_valid(id: string): boolean {
		for (let i = 0; i < this.all_time_controls.length; ++i) {
			if (this.all_time_controls[i].id == id) { return true; }
		}
		return false;
	}

	/**
	 * @brief Returns the only instance of this class
	 * @returns The only instance of this class
	 * @pre Method @ref initialize must have been called before
	 */
	static get_instance(): RatingSystem {
		RatingSystem.instance = RatingSystem.instance || new RatingSystem();
		return RatingSystem.instance;
	}
}

/**
 * @brief Directories and other parameters of the server environment
 */
export class ServerDirectories {
	// database directory
	public database_directory: string = "";
	public games_directory: string = "";
	public users_directory: string = "";
	public challenges_directory: string = "";

	// SSL certificate info
	public ssl_directory: string = "";
	public public_key_file: string = "";
	public private_key_file: string = "";
	public passphrase_file: string = "";

	// icons
	public icon_directory: string = "";
	public icon_login_page: string = "";

	// titles
	public title_login_page: string = "";

	/// The only instance of this class
	private static instance: ServerDirectories;

	/**
	 * @brief Construct the server configuration
	 */
	constructor() {
		if (ServerDirectories.instance) {
			return ServerDirectories.instance;
		}

		ServerDirectories.instance = this;
	}

	/// Sets base directory of database
	set_database_base_directory(base_dir: string): void {
		this.database_directory = base_dir;
		this.games_directory = path.join(this.database_directory, "games");
		this.users_directory = path.join(this.database_directory, "users");
		this.challenges_directory = path.join(this.database_directory, "challenges");
	}

	/// Sets all necessary SSL information
	set_SSL_info(
		base_dir: string,
		public_key_file: string,
		private_key_file: string,
		passphrase_file: string
	):
	void
	{
		this.ssl_directory = base_dir;
		if (public_key_file != "") {
			this.public_key_file = path.join(this.ssl_directory, public_key_file);
		}
		if (private_key_file != "") {
			this.private_key_file = path.join(this.ssl_directory, private_key_file);
		}
		if (passphrase_file != "") {
			this.passphrase_file = path.join(this.ssl_directory, passphrase_file);
		}
	}

	is_SSL_info_valid(): boolean {
		return this.ssl_directory != "" &&
			this.public_key_file != "" &&
			this.private_key_file != "";
	}

	set_icons_info(
		base_dir: string,
		login_page_main: string
	)
	{
		this.icon_directory = base_dir;
		this.icon_login_page = path.join(base_dir, login_page_main);
	}

	/**
	 * @brief Returns the only instance of this class
	 * @returns The only instance of this class
	 * @pre Method @ref initialize must have been called before
	 */
	static get_instance(): ServerDirectories {
		ServerDirectories.instance = ServerDirectories.instance || new ServerDirectories();
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
	public max_game_id: number = 0;
	/// Map from game ID to game record (file)
	public game_id_to_record_file: Map<string, string> = new Map();

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
