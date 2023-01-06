/*
Elo rating for a Chess Club
Copyright (C) 2023  Lluís Alemany Puig

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
const debug = Debug('ELO_TRACKER:server_logout');

import { session_id_delete, session_id_exists } from './server/session';
import { log_now } from './utils/misc';

/**
 * @brief Logs a user out of the website.
 * @param req 
 * @param res 
 * @post Deletes the user's session id.
 */
export async function user_log_out(req: any, res: any) {
    debug(log_now(), `POST /logout`);
    debug(log_now(), `    Cookie:`);
    debug(log_now(), `        Username:   '${req.cookies.user}'`);
    debug(log_now(), `        Session ID: '${req.cookies.session_id}'`);

	// in order to log out a user, they must have been logged in
    if (! session_id_exists(req.cookies.session_id, req.cookies.user)) {
        debug(log_now(), `    User '${req.cookies.user}' was never logged in.`);
        res.status(200).send("");
    }
    else {
        debug(log_now(), `    User '${req.cookies.user}' was logged in.`);
        debug(log_now(), `    Deleting session id of user '${req.cookies.user}'...`);
        session_id_delete(req.cookies.session_id, req.cookies.user);
        debug(log_now(), `        Deleted.`);
        // send response
        res.status(200).send("success");
    }

    return;
}
