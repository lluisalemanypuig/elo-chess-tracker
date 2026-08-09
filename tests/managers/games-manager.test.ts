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

import { toTimeControlId } from '@common/models/time-control';
import { toGameId } from '@common/models/game';
import { GamesManager } from '@app/server/managers/games-manager';
import { toDateMajor } from '@common/utils/time';

const Classical = toTimeControlId('classical');
const Rapid = toTimeControlId('rapid');
const Blitz = toTimeControlId('blitz');
const Bullet = toTimeControlId('bullet');

describe('Games Manager', () => {
	test('Get some new game ids', () => {
		let games = GamesManager.getInstance();
		games.clear();

		expect(games.getMaxGameId()).toBe('0000000000');
		expect(games.newGameId()).toBe('0000000001');
		expect(games.getMaxGameId()).toBe('0000000001');
		expect(games.newGameId()).toBe('0000000002');
		expect(games.getMaxGameId()).toBe('0000000002');
		expect(games.newGameId()).toBe('0000000003');
		expect(games.getMaxGameId()).toBe('0000000003');
		expect(games.newGameId()).toBe('0000000004');
		expect(games.getMaxGameId()).toBe('0000000004');
		expect(games.newGameId()).toBe('0000000005');
		expect(games.getMaxGameId()).toBe('0000000005');
		expect(games.numGames()).toBe(0);
		games.clear();

		expect(games.getMaxGameId()).toBe('0000000000');
		expect(games.newGameId()).toBe('0000000001');
		expect(games.getMaxGameId()).toBe('0000000001');
		expect(games.newGameId()).toBe('0000000002');
		expect(games.getMaxGameId()).toBe('0000000002');
		expect(games.newGameId()).toBe('0000000003');
		expect(games.getMaxGameId()).toBe('0000000003');
		expect(games.newGameId()).toBe('0000000004');
		expect(games.getMaxGameId()).toBe('0000000004');
		expect(games.newGameId()).toBe('0000000005');
		expect(games.getMaxGameId()).toBe('0000000005');
		expect(games.numGames()).toBe(0);
	});

	test('Start at an arbitrary id', () => {
		let games = GamesManager.getInstance();
		games.clear();

		games.setMaxGameId(100);
		expect(games.getMaxGameId()).toBe('0000000100');
		expect(games.newGameId()).toBe('0000000101');
		expect(games.getMaxGameId()).toBe('0000000101');
		expect(games.newGameId()).toBe('0000000102');
		expect(games.getMaxGameId()).toBe('0000000102');
		expect(games.newGameId()).toBe('0000000103');
		expect(games.getMaxGameId()).toBe('0000000103');
		expect(games.newGameId()).toBe('0000000104');
		expect(games.getMaxGameId()).toBe('0000000104');
		expect(games.newGameId()).toBe('0000000105');
		expect(games.getMaxGameId()).toBe('0000000105');
		expect(games.numGames()).toBe(0);
	});

	const id0000000000 = toGameId('0000000000');
	const id0000000001 = toGameId('0000000001');
	const id0000000002 = toGameId('0000000002');
	const id0000000003 = toGameId('0000000003');
	const id0000000004 = toGameId('0000000004');
	const id0000000005 = toGameId('0000000005');
	const id0000000006 = toGameId('0000000006');

	test('Add some games', () => {
		let games = GamesManager.getInstance();
		games.clear();

		games.addGame(games.newGameId(), toDateMajor('2025-01-19'), Blitz);
		expect(games.numGames()).toBe(1);
		games.addGame(games.newGameId(), toDateMajor('2025-01-19'), Classical);
		expect(games.numGames()).toBe(2);
		games.addGame(games.newGameId(), toDateMajor('2025-01-19'), Rapid);
		expect(games.numGames()).toBe(3);
		games.addGame(games.newGameId(), toDateMajor('2025-01-19'), Bullet);
		expect(games.numGames()).toBe(4);

		expect(games.getGameInfo(id0000000001)?.gameRecord).toBe('2025-01-19');
		expect(games.getGameInfo(id0000000002)?.gameRecord).toBe('2025-01-19');
		expect(games.getGameInfo(id0000000003)?.gameRecord).toBe('2025-01-19');
		expect(games.getGameInfo(id0000000004)?.gameRecord).toBe('2025-01-19');

		expect(games.getGameInfo(id0000000001)?.timeControlId).toBe('blitz');
		expect(games.getGameInfo(id0000000002)?.timeControlId).toBe('classical');
		expect(games.getGameInfo(id0000000003)?.timeControlId).toBe('rapid');
		expect(games.getGameInfo(id0000000004)?.timeControlId).toBe('bullet');

		expect(games.gameExists(id0000000000)).toBe(false);
		expect(games.gameExists(id0000000001)).toBe(true);
		expect(games.gameExists(id0000000002)).toBe(true);
		expect(games.gameExists(id0000000003)).toBe(true);
		expect(games.gameExists(id0000000004)).toBe(true);
		expect(games.gameExists(id0000000005)).toBe(false);
		expect(games.gameExists(id0000000006)).toBe(false);

		expect(games.getGameInfo(id0000000005)).toBe(undefined);
		expect(games.getGameInfo(id0000000006)).toBe(undefined);
	});

	test('Clear and check', () => {
		let games = GamesManager.getInstance();
		games.clear();
		expect(games.numGames()).toBe(0);
		expect(games.getGameInfo(id0000000001)).toBe(undefined);
		expect(games.getGameInfo(id0000000002)).toBe(undefined);
		expect(games.getGameInfo(id0000000003)).toBe(undefined);
		expect(games.getGameInfo(id0000000004)).toBe(undefined);
	});
});
