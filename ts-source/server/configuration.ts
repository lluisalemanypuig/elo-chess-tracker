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

import path from "path";

import { User } from "../models/user";
import { Challenge } from '../models/challenge';
import { Game } from '../models/game';
import { Rating } from '../rating_system/rating';
import { TimeControl } from "../models/time_control";
import { linear_find } from "../utils/misc";

/**
 * @brief Rating system in the web
 */
export class RatingSystem {

	/// The only instance of this class
	private static m_instance: RatingSystem;

	constructor() {
		if (RatingSystem.m_instance) {
			return RatingSystem.m_instance;
		}
		RatingSystem.m_instance = this;
	}

	/// Function to evaluate a game
	private rating_formula: Function = () => void {};
	/// Function to create a new rating
	private new_rating: Function = () => void {};

	/// Function to read a single rating JSON object
	private rating_from_JSON: Function = () => void {};
	/// All ratings used in the web
	private all_time_controls: TimeControl[] = [];

	/**
	 * @brief Returns the only instance of this class
	 * @returns The only instance of this class
	 * @pre Method @ref initialize must have been called before
	 */
	static get_instance(): RatingSystem {
		RatingSystem.m_instance = RatingSystem.m_instance || new RatingSystem();
		return RatingSystem.m_instance;
	}

	set_rating_formula(formula: Function): void {
		this.rating_formula = formula;
	}
	apply_rating_formula(game: Game): [Rating, Rating] {
		return this.rating_formula(game);
	}
	get_new_rating(): Rating {
		return this.new_rating();
	}

	set_rating_from_JSON_formula(read_rating: Function): void {
		this.rating_from_JSON = read_rating;
	}
	get_rating_from_json(json: any): Rating {
		return this.rating_from_JSON(json);
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

	is_time_control_id_valid(id: string): boolean {
		for (let i = 0; i < this.all_time_controls.length; ++i) {
			if (this.all_time_controls[i].id == id) { return true; }
		}
		return false;
	}

	get_time_controls(): TimeControl[] {
		return this.all_time_controls;
	}
}

/**
 * @brief Directories and other parameters of the server environment
 */
export class ServerEnvironment {
	/**
	 * @brief Construct the server configuration
	 */
	constructor() {
		if (ServerEnvironment.m_instance) {
			return ServerEnvironment.m_instance;
		}

		ServerEnvironment.m_instance = this;
	}

	/// The only instance of this class
	private static m_instance: ServerEnvironment;

	static get_instance(): ServerEnvironment {
		ServerEnvironment.m_instance = ServerEnvironment.m_instance || new ServerEnvironment();
		return ServerEnvironment.m_instance;
	}

	// database directory
	private directory_database: string = "";
	private directory_games: string = "";
	private directory_users: string = "";
	private directory_challenges: string = "";

	get_dir_database(): string { return this.directory_games; }
	get_dir_games(): string { return this.directory_games; }
	get_dir_users(): string { return this.directory_users; }
	get_dir_challenges(): string { return this.directory_challenges; }

	set_database_base_directory(base_dir: string): void {
		this.directory_database = base_dir;
		this.directory_games = path.join(this.directory_database, "games");
		this.directory_users = path.join(this.directory_database, "users");
		this.directory_challenges = path.join(this.directory_database, "challenges");
	}

	// SSL certificate info
	private directory_ssl: string = "";
	private ssl_public_key_file: string = "";
	private ssl_private_key_file: string = "";
	private ssl_passphrase_file: string = "";

	get_dir_ssl(): string { return this.ssl_public_key_file; }
	get_ssl_public_key_file(): string { return this.ssl_public_key_file; }
	get_ssl_private_key_file(): string { return this.ssl_private_key_file; }
	get_ssl_passphrase_file(): string { return this.ssl_passphrase_file; }

	set_SSL_info(
		base_dir: string,
		public_key_file: string,
		private_key_file: string,
		passphrase_file: string
	):
	void
	{
		this.directory_ssl = base_dir;
		if (public_key_file != "") {
			this.ssl_public_key_file = path.join(this.directory_ssl, public_key_file);
		}
		if (private_key_file != "") {
			this.ssl_private_key_file = path.join(this.directory_ssl, private_key_file);
		}
		if (passphrase_file != "") {
			this.ssl_passphrase_file = path.join(this.directory_ssl, passphrase_file);
		}
	}

	is_SSL_info_valid(): boolean {
		return this.directory_ssl != "" &&
			this.ssl_public_key_file != "" &&
			this.ssl_private_key_file != "";
	}

	// icons
	private directory_icon: string = "";
	private icon_favicon: string = "";
	private icon_login_page: string = "";
	private icon_home_page: string = "";

	get_dir_icons(): string { return this.directory_icon; }
	get_icon_favicon(): string { return this.icon_favicon; }
	get_icon_login_page(): string { return this.icon_login_page; }
	get_icon_home_page(): string { return this.icon_home_page; }

	set_icons_info(
		base_dir: string,
		favicon: string,
		login_page: string,
		home_page: string
	)
	{
		this.directory_icon = base_dir;
		this.icon_favicon = path.join(base_dir, favicon);
		this.icon_login_page = path.join(base_dir, login_page);
		this.icon_home_page = path.join(base_dir, home_page);
	}

	// titles
	private title_login_page: string = "";
	private title_home_page: string = "";

	get_title_login_page(): string { return this.title_login_page; }
	get_title_home_page(): string { return this.title_home_page; }

	set_titles_info(login_page: string, home_page: string): void {
		this.title_login_page = login_page;
		this.title_home_page = home_page;
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

	/// The only instance of this class
	private static m_instance: ServerMemory;

	constructor() {
		if (ServerMemory.m_instance) {
			return ServerMemory.m_instance;
		}
		ServerMemory.m_instance = this;
	}

	static get_instance(): ServerMemory {
		ServerMemory.m_instance = ServerMemory.m_instance || new ServerMemory();
		return ServerMemory.m_instance;
	}

	/// Set of users
	private users: User[] = [];
	private user_to_index: Map<string, number> = new Map();

	add_user(u: User): void {
		this.users.push(u);
	}
	add_user_index(u: User, i: number): void {
		this.users.push(u);
		this.user_to_index.set(u.get_username(), i);
	}
	replace_user(u: User, i: number): void {
		delete this.users[i];
		this.users[i] = u;
	}
	get_user(i: number): User {
		return this.users[i];
	}
	get_user_index(username: string): number | undefined {
		return this.user_to_index.get(username);
	}
	num_users(): number {
		return this.users.length;
	}

	/// Session ids of the server.
	private session_ids: SessionID[] = [];

	add_session_id(id: SessionID): void {
		this.session_ids.push(id);
	}
	num_session_ids(): number {
		return this.session_ids.length;
	}
	index_session_id(id: string, username: string): number {
		if (id == undefined || username == undefined) { return -1; }
		for (let i = 0; i < this.session_ids.length; ++i) {
			if (this.session_ids[i].id == id &&
				this.session_ids[i].username == username
			)
			{
				return i;
			}
		}
		return -1;
	}
	has_session_id(id: string, username: string): boolean {
		return this.index_session_id(id, username) != -1;
	}
	remove_session_id(i: number): void {
		this.session_ids.splice(i, 1);
	}
	clear_session_ids(): void {
		this.session_ids = [];
	}

	/// The challenges in the system
	private challenges: Challenge[] = [];

	add_challenge(c: Challenge): void {
		this.challenges.push(c);
	}
	remove_challenge(i: number): void {
		this.challenges.splice(i, 1);
	}
	num_challenges(): number {
		return this.challenges.length;
	}
	get_challenge(i: number): Challenge {
		return this.challenges[i];
	}
	last_challenge(): Challenge {
		return this.challenges[this.challenges.length - 1];
	}

	/// Number of games in the system
	private max_game_id: number = 0;
	/// Map from game ID to game record (file)
	private game_id_to_record_date: Map<string, string> = new Map();

	/// Current maximum game ID
	get_max_game_id(): number {
		return this.max_game_id;
	}
	/// Sets the maximum game ID
	set_max_game_id(id: number): void {
		this.max_game_id = id;
	}
	/// Current maximum game ID
	new_max_game_id(): number {
		this.max_game_id += 1;
		return this.max_game_id;
	}

	/// Returns the date record file in which we find the game ID passed as parameter.
	get_game_id_record_date(game_id: string): string | undefined {
		return this.game_id_to_record_date.get(game_id);
	}
	// Sets the date record file 'when' in which we find the game ID passed as parameter.
	set_game_id_record_date(game_id: string, when: string): void {
		this.game_id_to_record_date.set(game_id, when);
	}
}
