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

/**
 * @brief Configuration parameters of the server.
 */
export class ConfigurationManager {
	/// The only instance of this class
	private static instance: ConfigurationManager;

	/**
	 * @brief Construct the server configuration
	 */
	constructor() {
		if (ConfigurationManager.instance) {
			return ConfigurationManager.instance;
		}

		ConfigurationManager.instance = this;
	}

	static get_instance(): ConfigurationManager {
		ConfigurationManager.instance = ConfigurationManager.instance || new ConfigurationManager();
		return ConfigurationManager.instance;
	}

	private readonly production: boolean = false;
	private port_http: string = '';
	private port_https: string = '';

	clear(): void {
		this.port_http = '';
		this.port_https = '';
	}

	set_port_http(http: string): void {
		this.port_http = http;
	}
	set_port_https(https: string): void {
		this.port_https = https;
	}

	get_port_http(): string {
		return this.port_http;
	}
	get_port_https(): string {
		return this.port_https;
	}

	is_production(): boolean {
		return this.production;
	}
}
