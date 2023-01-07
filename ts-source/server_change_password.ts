import Debug from 'debug';
const debug = Debug('ELO_TRACKER:server_games');

import path from 'path';

import { log_now } from './utils/misc';
import { is_user_logged_in, session_id_delete } from './server/session';
import { encrypt_password_for_user, is_password_of_user_correct } from './utils/encrypt';
import { User } from './models/user';
import { Password } from './models/password';
import { user_overwrite } from './server/users';

export async function get_change_password_page(req: any, res: any) {
    debug(log_now(), "GET change_password_page...");

	const id = req.cookies.session_id;
	const username = req.cookies.user;

	let r = is_user_logged_in(id, username);
	if (!r[0]) {
		res.send(r[1]);
		return;
	}

    res.sendFile(path.join(__dirname, "../html/user_password_change.html"));
}

export async function post_change_password(req: any, res: any) {
    debug(log_now(), "POST change_password...");

	const id = req.cookies.session_id;
	const username = req.cookies.user;
    const old_password = req.body.old;
    const new_password = req.body.new;

	let r = is_user_logged_in(id, username);
	if (!r[0]) {
		res.send(r[1]);
		return;
	}
    let user = r[2] as User;

    // check if password is correct
    const old_pwd = user.get_password();
	const is_password_correct = is_password_of_user_correct
		(old_pwd.encrypted, username, old_password, old_pwd.iv);

	// is the password correct?
	if (! is_password_correct) {
		debug(log_now(), `    Password for '${username}' is incorrect`);
		res.status(404).send({ 'r' : '0', 'reason' : 'Old password is not correct.' });
		return;
	}

    // delete old session id
    session_id_delete(id, username);

    // make new password
    let _pass = encrypt_password_for_user(username, new_password);
    user.set_password(new Password(_pass[0], _pass[1]));    

    // overwrite user data
    user_overwrite(user);

    res.send({'r' : '1'});
}