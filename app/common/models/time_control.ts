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

// A type for time control Ids

declare const TimeControlIdBrand: unique symbol;
export type TimeControlIdLocal = string & {
	readonly [TimeControlIdBrand]: 'TimeControlIdLocal';
};
export const TimeControlIdSchema = z.string().brand<'TimeControlIdLocal'>();

/**
 * @brief A time control ID.
 *
 * A time control ID is a unique name that can represent multiple time controls.
 * For example, a time control ID can be 'blitz' and can represent the usual time
 * controls 5+3, 5+0, 3+2.
 */
export type TimeControlId = z.infer<typeof TimeControlIdSchema>;

export function toTimeControlId(s: string): TimeControlId {
	return s as TimeControlId;
}

// A type for time control names

declare const TimeControlNameBrand: unique symbol;
export type TimeControlNameLocal = string & {
	readonly [TimeControlNameBrand]: 'TimeControlNameLocal';
};
export const TimeControlNameSchema = z.string().brand<'TimeControlNameLocal'>();

/**
 * @brief A time control name.
 *
 * A time control name is the human-readable identifier for a time control Id.
 * This may correspond to the same @ref TimeControlId. For example, for the
 * time control id "blitz" we could have multiple time control names, such as
 * - "Blitz (5 + 0)"
 * - "Blitz (5 + 3)"
 */
export type TimeControlName = z.infer<typeof TimeControlNameSchema>;

export function toTimeControlName(s: string): TimeControlName {
	return s as TimeControlName;
}

export const TimeControlSchema = z
	.object({
		id: TimeControlIdSchema,
		name: z.string()
	})
	.strict();

/**
 * @brief Time control as a tuple.
 *
 * Examples:
 * - id: "blitz_5_p_3", name: "Blitz (5 + 3)"
 * - id: "blitz_5_p_0", name: "Blitz (5 + 0)"
 *
 * Also:
 * - id: "blitz", name: "Blitz (5 + 3)"
 * - id: "blitz", name: "Blitz (5 + 0)"
 */
export type TimeControl = z.infer<typeof TimeControlSchema>;

export const TimeControlArraySchema = z.array(TimeControlSchema);

export type TimeControlArray = z.infer<typeof TimeControlArraySchema>;
