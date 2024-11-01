/*
Elo rating for a Chess Club
Copyright (C) 2023 - 2024  Lluís Alemany Puig

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

Contact:
	Lluís Alemany Puig
	https://github.com/lluisalemanypuig
*/

import Debug from 'debug';
const debug = Debug('ELO_TRACKER:server_time_control');

import { log_now } from './utils/misc';
import { is_user_logged_in } from './server/session';
import { RatingSystem } from './server/rating_system';

export async function get_query_time_control(req: any, res: any) {
	debug(log_now(), "GET time_control...");

	const id = req.cookies.session_id;
	const username = req.cookies.user;

	let r = is_user_logged_in(id, username);
	if (!r[0]) {
		res.send(r[1]);
		return;
	}

    const tcs = RatingSystem.get_instance().get_time_controls();
    let all_time_controls: any[] = [];
    for (let i = 0; i < tcs.length; ++i) {
        all_time_controls.push({
            'id' : tcs[i].id,
            'name' : tcs[i].name
        });
    }
	res.send({
        'r' : '1',
        'data' : all_time_controls
    });
}
