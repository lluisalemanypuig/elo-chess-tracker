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

import Debug from 'debug';
const debug = Debug('ELO_CHESS_TRACKER:server_query_games');
import { Request, Response } from 'express';

import path from 'path';
import fs from 'fs';

import { DateStringShort, log_now } from '@server/utils/time';
import { is_user_logged_in } from '@server/managers/session';
import { GameNumber, User } from '@common/models/user';
import { Game } from '@common/models/game';
import { RatingSystemManager } from '@server/managers/rating_system_manager';
import { EnvironmentManager } from '@server/managers/environment_manager';
import { GAMES_SEE } from '@common/models/user_action';
import { can_user_delete_a_game, can_user_edit_a_game, can_user_see_a_game } from '@server/managers/user_relationships';
import { TimeControlID } from '@common/models/time_control';
import { game_array_from_string } from '@common/io/game';
import { UsersManager } from '@server/managers/users_manager';
import { search_by_key } from '@server/utils/searching';
import { read_directory } from '@server/utils/read_directory';
import { isDefined } from '@common/utils/is_defined';
import { Routes } from '@common/routes';
import { InputSchemaOf } from '@common/api/schemas';
import { parse_schema } from '@server/utils/schemas';
import { AuthenticationInputSchema } from '@common/schemas/authentication';

function increment(g: Game): any {
	const [white_after, black_after] = RatingSystemManager.get_instance().apply_rating_function(g);
	return {
		white_increment: Math.round(white_after.rating - g.white_rating.rating),
		black_increment: Math.round(black_after.rating - g.black_rating.rating)
	};
}

/**
 * @brief Returns a list of games guided by the filter functions
 *
 * The filter functions return true when a game should be accepted.
 * @param filter_game_record Filters game record files
 * @param filter_game Filters games
 */
function filter_game_list(
	user: User,
	time_control_id: TimeControlID,
	filter_game_record: Function,
	filter_game: Function
): any[] {
	let data_to_return: any[] = [];

	const games_id_dir = EnvironmentManager.get_instance().get_dir_games_time_control(time_control_id);

	// The files currently existing in the 'games_directory'
	debug(log_now(), `Reading directory '${games_id_dir}'...`);
	const game_record_file_list = read_directory(games_id_dir);

	debug(log_now(), `    Directory contents: '${game_record_file_list}'`);

	let manager = UsersManager.get_instance();

	for (let i = game_record_file_list.length - 1; i >= 0; --i) {
		const game_record_file = path.join(games_id_dir, game_record_file_list[i]);

		if (!filter_game_record(game_record_file_list[i])) {
			continue;
		}

		// read the games from the file
		debug(log_now(), `    Reading game record '${game_record_file}'...`);
		const data = fs.readFileSync(game_record_file, 'utf8');
		debug(log_now(), `        Game record '${game_record_file}' read.`);
		const game_set = game_array_from_string(data);
		if (!isDefined(game_set)) {
			debug(log_now(), `        Game record '${game_record_file}' could not be parsed.`);
			continue;
		}

		for (let j = game_set.length - 1; j >= 0; --j) {
			const g = game_set[j];

			if (!filter_game(g)) {
				continue;
			}

			const inc = increment(g);

			const result = ((): string => {
				if (g.result == 'white_wins') {
					return '1 - 0';
				}
				if (g.result == 'black_wins') {
					return '0 - 1';
				}
				return '1/2 - 1/2';
			})();

			const white = manager.get_user_by_username(g.white);
			if (!isDefined(white)) {
				debug(log_now(), `User with username '${g.white}' could not be found.`);
				return [];
			}
			const black = manager.get_user_by_username(g.black);
			if (!isDefined(black)) {
				debug(log_now(), `User with username '${g.black}' could not be found.`);
				return [];
			}

			const is_editable: boolean = can_user_edit_a_game(user, white, black);
			const is_deleteable: boolean = can_user_delete_a_game(user, white, black);

			data_to_return.push({
				id: g.id,
				title: g.title,
				white: white.get_full_name(),
				black: black.get_full_name(),
				result: result,
				time_control: g.time_control_name,
				date: g.when.replace('..', ' '),
				white_rating: Math.round(g.white_rating.rating),
				black_rating: Math.round(g.black_rating.rating),
				white_increment: inc.white_increment < 0 ? inc.white_increment : '+' + inc.white_increment,
				black_increment: inc.black_increment < 0 ? inc.black_increment : '+' + inc.black_increment,
				editable: is_editable ? 'y' : 'n',
				deleteable: is_deleteable ? 'y' : 'n'
			});
		}
	}

	return data_to_return;
}

export async function post_query_game_list_own(req: Request, res: Response) {
	debug(log_now(), `POST ${Routes.QUERY_GAME_LIST_OWN}...`);

	const session_parse = parse_schema(req, AuthenticationInputSchema, debug);
	if (session_parse.result !== 'Success') {
		res.status(401).send(`Failure to parse cookies ${session_parse.result}.`);
		return;
	}
	const session = session_parse.data;
	const r = is_user_logged_in(session);

	const user = r[2];
	if (!isDefined(user)) {
		res.status(401).send(r[1]);
		return;
	}

	const game_parse = InputSchemaOf(Routes.QUERY_GAME_LIST_OWN).safeParse(req.body);
	if (!game_parse.success) {
		debug(log_now(), 'Failed to parse schema');
		debug(log_now(), `Error: '${game_parse.error}'`);
		res.status(401).send('Internal error');
		return;
	}
	const time_control_id = game_parse.data.tc_i;

	const filter_game_function = (g: Game): boolean => {
		return g.is_user_involved(session.username);
	};

	let data_to_return: any[] = [];
	if (time_control_id != '') {
		data_to_return = filter_game_list(
			user,
			time_control_id,
			(record_id: DateStringShort): boolean => {
				const game_record_list = user.get_games(time_control_id);
				return (
					search_by_key(game_record_list, (r: GameNumber): number => {
						return record_id.localeCompare(r.record);
					}) != -1
				);
			},
			filter_game_function
		);
	} else {
		const ratings = RatingSystemManager.get_instance();
		for (const tid of ratings.get_unique_time_controls_ids()) {
			const data = filter_game_list(
				user,
				tid,
				(record_id: DateStringShort): boolean => {
					const game_record_list = user.get_games(tid);
					return (
						search_by_key(game_record_list, (r: GameNumber): number => {
							return record_id.localeCompare(r.record);
						}) != -1
					);
				},
				filter_game_function
			);
			data_to_return = data_to_return.concat(data);
		}
	}

	debug(log_now(), `Found '${data_to_return.length}' games involving '${session.username}'`);

	res.status(200).send(data_to_return);
}

function merge_by_date(v1: any[], v2: any[]): any[] {
	let v3: any[] = [];
	let i: number = 0;
	let j: number = 0;
	while (i < v1.length && j < v2.length) {
		const comp = v1[i].date.localeCompare(v2[j].date);
		if (comp < 0) {
			v3.push(v2[j]);
			++j;
		} else if (comp > 0) {
			v3.push(v1[i]);
			++i;
		} else {
			v3.push(v1[i]);
			v3.push(v2[j]);
			++i;
			++j;
		}
	}
	while (i < v1.length) {
		v3.push(v1[i]);
		++i;
	}
	while (j < v2.length) {
		v3.push(v2[j]);
		++j;
	}
	return v3;
}

export async function post_query_game_list_all(req: Request, res: Response) {
	debug(log_now(), `POST ${Routes.QUERY_GAME_LIST_ALL}...`);

	const session_parse = parse_schema(req, AuthenticationInputSchema, debug);
	if (session_parse.result !== 'Success') {
		res.status(401).send(`Failure to parse cookies ${session_parse.result}.`);
		return;
	}
	const session = session_parse.data;
	const r = is_user_logged_in(session);

	const user = r[2];
	if (!isDefined(user)) {
		res.status(401).send(r[1]);
		return;
	}

	if (!user.can_do(GAMES_SEE)) {
		res.status(403).send('You cannot see the entire list of games in the web.');
		return;
	}

	const game_parse = InputSchemaOf(Routes.QUERY_GAME_LIST_ALL).safeParse(req.body);
	if (!game_parse.success) {
		debug(log_now(), 'Failed to parse schema');
		debug(log_now(), `Error: '${game_parse.error}'`);
		res.status(401).send('Internal error');
		return;
	}
	const time_control_id = game_parse.data.tc_i;

	let manager = UsersManager.get_instance();
	let data_to_return: any[] = [];
	if (time_control_id != '') {
		data_to_return = filter_game_list(
			user,
			time_control_id,
			(_: DateStringShort): boolean => {
				return true;
			},
			(g: Game): boolean => {
				const white = manager.get_user_by_username(g.white);
				if (!isDefined(white)) {
					debug(log_now(), `User with username '${g.white}' could not be found.`);
					res.status(500).send('Invalid white user sent to the server.');
					return false;
				}
				const black = manager.get_user_by_username(g.black);
				if (!isDefined(black)) {
					debug(log_now(), `User with username '${g.black}' could not be found.`);
					res.status(500).send('Invalid black user sent to the server.');
					return false;
				}
				return can_user_see_a_game(user, white, black);
			}
		);
	} else {
		const ratings = RatingSystemManager.get_instance();
		for (const tid of ratings.get_unique_time_controls_ids()) {
			const data = filter_game_list(
				user,
				tid,
				(_: DateStringShort): boolean => {
					return true;
				},
				(g: Game): boolean => {
					const white = manager.get_user_by_username(g.white);
					if (!isDefined(white)) {
						debug(log_now(), `User with username '${g.white}' could not be found.`);
						return false;
					}
					const black = manager.get_user_by_username(g.black);
					if (!isDefined(black)) {
						debug(log_now(), `User with username '${g.black}' could not be found.`);
						return false;
					}
					return can_user_see_a_game(user, white, black);
				}
			);
			data_to_return = merge_by_date(data_to_return, data);
		}
	}

	res.status(200).send(data_to_return);
}
