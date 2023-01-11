#!/usr/bin/env node

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

/**
 * Adapted from Mozilla's web development tutorial "Express Local Library"
 * Full project: https://github.com/mdn/express-locallibrary-tutorial
 * File: https://github.com/mdn/express-locallibrary-tutorial/blob/main/bin/ww
 */

import Debug from 'debug';
const debug = Debug('ELO_TRACKER:app_main');
import { log_now } from './utils/misc';

import { server_initialize_from_configuration_file } from './server/initialization';

debug(log_now(), "Initialize server...");

server_initialize_from_configuration_file();

debug(log_now(), "Import app...");

import { app } from './app_build';

debug(log_now(), "    Imported!");

import http from 'http';
import { AddressInfo } from 'net';

/// Normalize a port into a number, string, or false.
function normalizePort(val: any): any {
	let port = parseInt(val, 10);

	if (isNaN(port)) {
		// named pipe
		return val;
	}

	if (port >= 0) {
		// port number
		return port;
	}

	return false;
}

/// Event listener for HTTP server "error" event.
function onError(error: any): void {
	if (error.syscall !== 'listen') {
		throw error;
	}

	var bind = typeof port === 'string'
		? 'Pipe ' + port
		: 'Port ' + port;

	// handle specific listen errors with friendly messages
	switch (error.code) {
		case 'EACCES':
			console.error(bind + ' requires elevated privileges');
			process.exit(1);
			break;
		case 'EADDRINUSE':
			console.error(bind + ' is already in use');
			process.exit(1);
			break;
		default:
			throw error;
	}
}

/// Event listener for HTTP server "listening" event.
function onListening(): void {
	let addr = server.address();
	let bind = typeof addr === 'string'
		? 'pipe ' + addr
		: 'port ' + (addr as AddressInfo).port;
	debug(log_now(), 'Listening on ' + bind);
}

/// Get port from environment and store in Express.
let port = normalizePort(process.env.PORT || '3000');
app.set('port', port);

/// Create HTTP server.
let server = http.createServer(app);

/// Listen on provided port, on all network interfaces.
server.listen(port);
server.on('error', onError);
server.on('listening', onListening);
