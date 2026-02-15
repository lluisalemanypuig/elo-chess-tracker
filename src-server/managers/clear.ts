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

import { EnvironmentManager } from './environment_manager';
import { ConfigurationManager } from './configuration_manager';
import { ChallengesManager } from './challenges_manager';
import { GamesManager } from './games_manager';
import { UsersManager } from './users_manager';
import { SessionIDManager } from './session_id_manager';
import { RatingSystemManager } from './rating_system_manager';
import { GraphsManager } from './graphs_manager';

/**
 * @brief Clear the memory of the server
 *
 * That is, the RAM memory, not the disk memory.
 */
export function clear_server(): void {
	RatingSystemManager.get_instance().clear();
	UsersManager.get_instance().clear();
	ChallengesManager.get_instance().clear();
	GamesManager.get_instance().clear();
	GraphsManager.get_instance().clear();
	ConfigurationManager.get_instance().clear();
	EnvironmentManager.get_instance().clear();
	SessionIDManager.get_instance().clear();
}
