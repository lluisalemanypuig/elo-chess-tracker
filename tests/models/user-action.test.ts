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

import {
	ALL_ACTION_IDS,
	roleActionNames,
	rolesAndActions,
} from '@common/models/user-action';
import { ALL_USER_ROLES } from '@common/models/user-role';

describe('Role concatenation', () => {
	test('Check non-throwing functions', () => {
		for (const action_id of ALL_ACTION_IDS) {
			for (const role of ALL_USER_ROLES) {
				expect(() => roleActionNames[action_id][role]).not.toThrow();
			}
		}
	});

	test('Check correct concatenation', () => {
		for (let i = 0; i < ALL_ACTION_IDS.length; ++i) {
			const action_id = ALL_ACTION_IDS[i];
			const concats = rolesAndActions[action_id];
			for (let j = 0; j < ALL_USER_ROLES.length; ++j) {
				const r = ALL_USER_ROLES[j];
				expect(roleActionNames[action_id][r]).toEqual(concats[j]);
			}
		}
	});
});
