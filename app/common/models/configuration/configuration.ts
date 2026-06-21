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
import { EnvironmentSchema } from '@common/models/configuration/environment';
import { ServerConfigurationSchema } from '@common/models/configuration/server';
import { TimeControlArraySchema } from '@common/models/configuration/time_controls';
import { BehaviorSchema } from '@common/models/configuration/behavior';
import { UserPermissionsSchema } from '@common/models/configuration/permissions';
import { RatingFrameworkTypeSchema } from '@common/models/rating_framework/rating_framework_type';

export const ConfigurationSchema = z
	.object({
		environment: EnvironmentSchema,
		server: ServerConfigurationSchema,
		rating_system: RatingFrameworkTypeSchema,
		time_controls: TimeControlArraySchema,
		behavior: BehaviorSchema,
		permissions: UserPermissionsSchema
	})
	.strict();

export type Configuration = z.infer<typeof ConfigurationSchema>;
