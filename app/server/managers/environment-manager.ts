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

import path from 'path';
import { TimeControlId } from '@common/models/time-control';
import { Environment, SSLCertificate } from '@common/models/configuration/environment';

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

	static getInstance(): EnvironmentManager {
		EnvironmentManager.instance = EnvironmentManager.instance || new EnvironmentManager();
		return EnvironmentManager.instance;
	}

	// execution directory (TS code)
	private directoryExecution: string = '';

	setExecutionEnvironment(baseDir: string): void {
		this.directoryExecution = baseDir;
	}

	getExecutionDirectory(): string {
		return this.directoryExecution;
	}

	// database directory
	private directoryDatabase: string = '';
	private directoryDatabaseGames: string = '';
	private directoryDatabaseUsers: string = '';
	private directoryDatabaseChallenges: string = '';
	private directoryDatabaseGraphs: string = '';

	clearDatabase(): void {
		this.directoryDatabase = '';
		this.directoryDatabaseGames = '';
		this.directoryDatabaseUsers = '';
		this.directoryDatabaseChallenges = '';
		this.directoryDatabaseGraphs = '';
	}

	getDirDatabase(): string {
		return this.directoryDatabase;
	}
	getDirGames(): string {
		return this.directoryDatabaseGames;
	}
	getDirGamesTimeControl(id: TimeControlId): string {
		return path.join(this.directoryDatabaseGames, id);
	}
	getDirUsers(): string {
		return this.directoryDatabaseUsers;
	}
	getDirChallenges(): string {
		return this.directoryDatabaseChallenges;
	}
	getDirGraphs(): string {
		return this.directoryDatabaseGraphs;
	}
	getDirGraphsTimeControl(id: TimeControlId): string {
		return path.join(this.directoryDatabaseGraphs, id);
	}

	setDatabaseBaseDirectory(baseDir: string): void {
		this.directoryDatabase = baseDir;
		this.directoryDatabaseGames = path.join(this.directoryDatabase, 'games');
		this.directoryDatabaseUsers = path.join(this.directoryDatabase, 'users');
		this.directoryDatabaseChallenges = path.join(this.directoryDatabase, 'challenges');
		this.directoryDatabaseGraphs = path.join(this.directoryDatabase, 'graphs');
	}

	// SSL certificate info
	private directorySsl: string = '';
	private sslPublicKeyFile: string = '';
	private sslPrivateKeyFile: string = '';
	private sslPassphraseFile: string = '';

	clearSsl(): void {
		this.directorySsl = '';
		this.sslPublicKeyFile = '';
		this.sslPrivateKeyFile = '';
		this.sslPassphraseFile = '';
	}

	getDirSsl(): string {
		return this.directorySsl;
	}
	getSslPublicKeyFile(): string {
		return this.sslPublicKeyFile;
	}
	getSslPrivateKeyFile(): string {
		return this.sslPrivateKeyFile;
	}
	getSslPassphraseFile(): string {
		return this.sslPassphraseFile;
	}

	setSSLInfo(baseDir: string, ssl: SSLCertificate): void {
		this.directorySsl = baseDir;
		if (ssl.publicKeyFile != '') {
			this.sslPublicKeyFile = path.join(this.directorySsl, ssl.publicKeyFile);
		}
		if (ssl.privateKeyFile != '') {
			this.sslPrivateKeyFile = path.join(this.directorySsl, ssl.privateKeyFile);
		}
		if (ssl.passphraseFile != '') {
			this.sslPassphraseFile = path.join(this.directorySsl, ssl.passphraseFile);
		}
	}

	isSSLInfoValid(): boolean {
		return this.directorySsl != '' && this.sslPublicKeyFile != '' && this.sslPrivateKeyFile != '';
	}

	// icons
	private directoryIcon: string = '';
	private iconFavicon: string = '';
	private iconLoginPage: string = '';
	private iconHomePage: string = '';

	clearIcons(): void {
		this.directoryIcon = '';
		this.iconFavicon = '';
		this.iconLoginPage = '';
		this.iconHomePage = '';
	}

	getDirIcons(): string {
		return this.directoryIcon;
	}
	getIconFavicon(): string {
		return this.iconFavicon;
	}
	getIconLoginPage(): string {
		return this.iconLoginPage;
	}
	getIconHomePage(): string {
		return this.iconHomePage;
	}

	setIconsInfo(baseDir: string, env: Environment) {
		this.directoryIcon = baseDir;
		this.iconFavicon = path.join(baseDir, env.favicon);
		this.iconLoginPage = path.join(baseDir, env.loginPage.icon);
		this.iconHomePage = path.join(baseDir, env.homePage.icon);
	}

	// titles
	private titleLoginPage: string = '';
	private titleHomePage: string = '';

	clearTitles(): void {
		this.titleLoginPage = '';
		this.titleHomePage = '';
	}

	getTitleLoginPage(): string {
		return this.titleLoginPage;
	}
	getTitleHomePage(): string {
		return this.titleHomePage;
	}

	setTitlesInfo(loginPage: string, homePage: string): void {
		this.titleLoginPage = loginPage;
		this.titleHomePage = homePage;
	}

	// --------------------

	clear(): void {
		this.clearDatabase();
		this.clearSsl();
		this.clearIcons();
		this.clearTitles();
	}
}

export function getExecutionDirectory(): string {
	return EnvironmentManager.getInstance().getExecutionDirectory();
}
