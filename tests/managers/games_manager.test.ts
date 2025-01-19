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

import { GamesManager } from '../../src-server/managers/games_manager';

describe('Games Manager', () => {
	test('Get some new game ids', () => {
		let games = GamesManager.get_instance();
		games.clear();

		expect(games.get_max_game_id()).toBe('0000000000');
		expect(games.new_game_id()).toBe('0000000001');
		expect(games.get_max_game_id()).toBe('0000000001');
		expect(games.new_game_id()).toBe('0000000002');
		expect(games.get_max_game_id()).toBe('0000000002');
		expect(games.new_game_id()).toBe('0000000003');
		expect(games.get_max_game_id()).toBe('0000000003');
		expect(games.new_game_id()).toBe('0000000004');
		expect(games.get_max_game_id()).toBe('0000000004');
		expect(games.new_game_id()).toBe('0000000005');
		expect(games.get_max_game_id()).toBe('0000000005');
		expect(games.num_games()).toBe(0);
		games.clear();

		expect(games.get_max_game_id()).toBe('0000000000');
		expect(games.new_game_id()).toBe('0000000001');
		expect(games.get_max_game_id()).toBe('0000000001');
		expect(games.new_game_id()).toBe('0000000002');
		expect(games.get_max_game_id()).toBe('0000000002');
		expect(games.new_game_id()).toBe('0000000003');
		expect(games.get_max_game_id()).toBe('0000000003');
		expect(games.new_game_id()).toBe('0000000004');
		expect(games.get_max_game_id()).toBe('0000000004');
		expect(games.new_game_id()).toBe('0000000005');
		expect(games.get_max_game_id()).toBe('0000000005');
		expect(games.num_games()).toBe(0);
	});

	test('Start at an arbitrary id', () => {
		let games = GamesManager.get_instance();
		games.clear();

		games.set_max_game_id(100);
		expect(games.get_max_game_id()).toBe('0000000100');
		expect(games.new_game_id()).toBe('0000000101');
		expect(games.get_max_game_id()).toBe('0000000101');
		expect(games.new_game_id()).toBe('0000000102');
		expect(games.get_max_game_id()).toBe('0000000102');
		expect(games.new_game_id()).toBe('0000000103');
		expect(games.get_max_game_id()).toBe('0000000103');
		expect(games.new_game_id()).toBe('0000000104');
		expect(games.get_max_game_id()).toBe('0000000104');
		expect(games.new_game_id()).toBe('0000000105');
		expect(games.get_max_game_id()).toBe('0000000105');
		expect(games.num_games()).toBe(0);
	});

	test('Add some games', () => {
		let games = GamesManager.get_instance();
		games.clear();

		games.add_game(games.new_game_id(), '2025-01-19', 'blitz');
		expect(games.num_games()).toBe(1);
		games.add_game(games.new_game_id(), '2025-01-19', 'classical');
		expect(games.num_games()).toBe(2);
		games.add_game(games.new_game_id(), '2025-01-19', 'rapid');
		expect(games.num_games()).toBe(3);
		games.add_game(games.new_game_id(), '2025-01-19', 'bullet');
		expect(games.num_games()).toBe(4);

		expect(games.get_game_id_record_date('0000000001')).toBe('2025-01-19');
		expect(games.get_game_id_record_date('0000000002')).toBe('2025-01-19');
		expect(games.get_game_id_record_date('0000000003')).toBe('2025-01-19');
		expect(games.get_game_id_record_date('0000000004')).toBe('2025-01-19');

		expect(games.get_game_id_time_control('0000000001')).toBe('blitz');
		expect(games.get_game_id_time_control('0000000002')).toBe('classical');
		expect(games.get_game_id_time_control('0000000003')).toBe('rapid');
		expect(games.get_game_id_time_control('0000000004')).toBe('bullet');

		expect(games.game_exists('0000000001')).toBe(true);
		expect(games.game_exists('0000000002')).toBe(true);
		expect(games.game_exists('0000000003')).toBe(true);
		expect(games.game_exists('0000000004')).toBe(true);
		expect(games.game_exists('0000000005')).toBe(false);
		expect(games.game_exists('0000000006')).toBe(false);

		expect(games.get_game_id_record_date('0000000005')).toBe(undefined);
		expect(games.get_game_id_time_control('0000000005')).toBe(undefined);

		expect(games.get_game_id_record_date('0000000006')).toBe(undefined);
		expect(games.get_game_id_time_control('0000000006')).toBe(undefined);
	});

	test('Clear and check', () => {
		let games = GamesManager.get_instance();
		games.clear();
		expect(games.num_games()).toBe(0);
		expect(games.get_game_id_record_date('0000000001')).toBe(undefined);
		expect(games.get_game_id_record_date('0000000002')).toBe(undefined);
		expect(games.get_game_id_record_date('0000000003')).toBe(undefined);
		expect(games.get_game_id_record_date('0000000004')).toBe(undefined);
		expect(games.get_game_id_time_control('0000000001')).toBe(undefined);
		expect(games.get_game_id_time_control('0000000002')).toBe(undefined);
		expect(games.get_game_id_time_control('0000000003')).toBe(undefined);
		expect(games.get_game_id_time_control('0000000004')).toBe(undefined);
	});
});
