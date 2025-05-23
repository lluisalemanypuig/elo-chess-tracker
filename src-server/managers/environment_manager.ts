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

import path from 'path';
import { TimeControlID } from '../models/time_control';

/**
 * @brief Directories and other parameters of the server's environment
 */
export class EnvironmentManager {
	/// The only instance of this class
	private static instance: EnvironmentManager;

	/**
	 * @brief Construct the server configuration
	 */
	constructor() {
		if (EnvironmentManager.instance) {
			return EnvironmentManager.instance;
		}

		EnvironmentManager.instance = this;
	}

	static get_instance(): EnvironmentManager {
		EnvironmentManager.instance = EnvironmentManager.instance || new EnvironmentManager();
		return EnvironmentManager.instance;
	}

	// database directory
	private directory_database: string = '';
	private directory_database_games: string = '';
	private directory_database_users: string = '';
	private directory_database_challenges: string = '';
	private directory_database_graphs: string = '';

	clear_database(): void {
		this.directory_database = '';
		this.directory_database_games = '';
		this.directory_database_users = '';
		this.directory_database_challenges = '';
		this.directory_database_graphs = '';
	}

	get_dir_database(): string {
		return this.directory_database;
	}
	get_dir_games(): string {
		return this.directory_database_games;
	}
	get_dir_games_time_control(id: TimeControlID): string {
		return path.join(this.directory_database_games, id);
	}
	get_dir_users(): string {
		return this.directory_database_users;
	}
	get_dir_challenges(): string {
		return this.directory_database_challenges;
	}
	get_dir_graphs(): string {
		return this.directory_database_graphs;
	}
	get_dir_graphs_time_control(id: TimeControlID): string {
		return path.join(this.directory_database_graphs, id);
	}

	set_database_base_directory(base_dir: string): void {
		this.directory_database = base_dir;
		this.directory_database_games = path.join(this.directory_database, 'games');
		this.directory_database_users = path.join(this.directory_database, 'users');
		this.directory_database_challenges = path.join(this.directory_database, 'challenges');
		this.directory_database_graphs = path.join(this.directory_database, 'graphs');
	}

	// SSL certificate info
	private directory_ssl: string = '';
	private ssl_public_key_file: string = '';
	private ssl_private_key_file: string = '';
	private ssl_passphrase_file: string = '';

	clear_ssl(): void {
		this.directory_ssl = '';
		this.ssl_public_key_file = '';
		this.ssl_private_key_file = '';
		this.ssl_passphrase_file = '';
	}

	get_dir_ssl(): string {
		return this.directory_ssl;
	}
	get_ssl_public_key_file(): string {
		return this.ssl_public_key_file;
	}
	get_ssl_private_key_file(): string {
		return this.ssl_private_key_file;
	}
	get_ssl_passphrase_file(): string {
		return this.ssl_passphrase_file;
	}

	set_SSL_info(base_dir: string, public_key_file: string, private_key_file: string, passphrase_file: string): void {
		this.directory_ssl = base_dir;
		if (public_key_file != '') {
			this.ssl_public_key_file = path.join(this.directory_ssl, public_key_file);
		}
		if (private_key_file != '') {
			this.ssl_private_key_file = path.join(this.directory_ssl, private_key_file);
		}
		if (passphrase_file != '') {
			this.ssl_passphrase_file = path.join(this.directory_ssl, passphrase_file);
		}
	}

	is_SSL_info_valid(): boolean {
		return this.directory_ssl != '' && this.ssl_public_key_file != '' && this.ssl_private_key_file != '';
	}

	// icons
	private directory_icon: string = '';
	private icon_favicon: string = '';
	private icon_login_page: string = '';
	private icon_home_page: string = '';

	clear_icons(): void {
		this.directory_icon = '';
		this.icon_favicon = '';
		this.icon_login_page = '';
		this.icon_home_page = '';
	}

	get_dir_icons(): string {
		return this.directory_icon;
	}
	get_icon_favicon(): string {
		return this.icon_favicon;
	}
	get_icon_login_page(): string {
		return this.icon_login_page;
	}
	get_icon_home_page(): string {
		return this.icon_home_page;
	}

	set_icons_info(base_dir: string, favicon: string, login_page: string, home_page: string) {
		this.directory_icon = base_dir;
		this.icon_favicon = path.join(base_dir, favicon);
		this.icon_login_page = path.join(base_dir, login_page);
		this.icon_home_page = path.join(base_dir, home_page);
	}

	// titles
	private title_login_page: string = '';
	private title_home_page: string = '';

	clear_titles(): void {
		this.title_login_page = '';
		this.title_home_page = '';
	}

	get_title_login_page(): string {
		return this.title_login_page;
	}
	get_title_home_page(): string {
		return this.title_home_page;
	}

	set_titles_info(login_page: string, home_page: string): void {
		this.title_login_page = login_page;
		this.title_home_page = home_page;
	}

	// --------------------

	clear(): void {
		this.clear_database();
		this.clear_ssl();
		this.clear_icons();
		this.clear_titles();
	}
}
