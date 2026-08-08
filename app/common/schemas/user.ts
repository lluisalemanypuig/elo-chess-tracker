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
import { UserRoleArraySchema } from '@common/models/user_role';
import { PlayerPrivateIdSchema, PlayerPublicIdSchema } from '@common/models/player';
import { UserGivenNameSchema } from '@common/models/user';

// Routes.USER_CREATE

export const UserCreateInputSchema = z.object({
	u: PlayerPrivateIdSchema,
	fn: UserGivenNameSchema,
	ln: UserGivenNameSchema,
	password: z.string(),
	r: UserRoleArraySchema
});

export type UserCreateInput = z.infer<typeof UserCreateInputSchema>;

// Routes.USER_EDIT

export const UserEditInputSchema = z.object({
	u: PlayerPublicIdSchema,
	f: UserGivenNameSchema,
	l: UserGivenNameSchema,
	r: UserRoleArraySchema
});

export type UserEditInput = z.infer<typeof UserEditInputSchema>;

export const UserPasswordChangeInputSchema = z.object({
	old: z.string(),
	new: z.string()
});

export type UserPasswordChangeInput = z.infer<typeof UserPasswordChangeInputSchema>;
