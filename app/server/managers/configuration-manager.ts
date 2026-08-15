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

/**
 * @brief Configuration parameters of the server.
 */
export class ConfigurationManager {
	// The only instance of this class
	private static instance: ConfigurationManager;

	// Construct the server configuration
	constructor() {
		if (ConfigurationManager.instance) {
			return ConfigurationManager.instance;
		}

		ConfigurationManager.instance = this;
	}

	static getInstance(): ConfigurationManager {
		ConfigurationManager.instance = ConfigurationManager.instance || new ConfigurationManager();
		return ConfigurationManager.instance;
	}

	// The HTTP port of the server
	private portHttp: string = '';
	// The HTTPS port of the server
	private portHttps: string = '';

	setPortHttp(http: string) {
		this.portHttp = http;
	}
	setPortHttps(https: string) {
		this.portHttps = https;
	}

	getPortHttp(): string {
		return this.portHttp;
	}
	getPortHttps(): string {
		return this.portHttps;
	}

	// The name of the domain the server can be accessed from
	private domain: string = '';
	setDomainName(d: string) {
		this.domain = d;
	}
	getDomainName(): string {
		return this.domain;
	}

	clear() {
		this.portHttp = '';
		this.portHttps = '';
		this.domain = '';
	}

	// Cache results of GET/POST methods (e.g., titles and icons)
	private static readonly cacheData: boolean = false;
	static shouldCacheData(): boolean {
		return ConfigurationManager.cacheData;
	}

	// Is this server running in production?
	private static readonly production: boolean = false;
	static isProduction(): boolean {
		return ConfigurationManager.production;
	}
}
