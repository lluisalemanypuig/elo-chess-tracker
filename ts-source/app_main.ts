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

import fs from 'fs';
import { log_now } from './utils/misc';

import { server_initialize_from_default_configuration_file } from './server/initialization';

debug(log_now(), "Initialize server...");

server_initialize_from_default_configuration_file(process.argv.slice(2));

debug(log_now(), "Import app...");

import { app } from './app_build';

debug(log_now(), "    Imported!");

import http from 'http';
import https from 'https';
import { AddressInfo } from 'net';
import { ServerDirectories } from './server/configuration';

// Normalize a port into a number, string, or false.
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

// create https server when possible
if (ServerDirectories.get_instance().is_SSL_info_valid()) {
	// Create HTTPS server
	debug(log_now(), "Create https server");

	// Get port from environment and store in Express.
	let port_8443 = normalizePort(process.env.PORT || '8443');
	app.set('port', port_8443);

	let passphrase = fs.readFileSync(ServerDirectories.get_instance().passphrase_file, 'utf8');
	let https_server = https.createServer(
		{
			key : fs.readFileSync(ServerDirectories.get_instance().private_key_file, 'utf8'),
			cert : fs.readFileSync(ServerDirectories.get_instance().public_key_file, 'utf8'),
			passphrase : passphrase.substring(0,passphrase.length - 1)
		},
		app
	);

	function https_on_listening(): void {
		let addr = https_server.address();
		let bind = typeof addr === 'string'
			? 'pipe ' + addr
			: 'port ' + (addr as AddressInfo).port;
		debug(log_now(), 'Listening on ' + bind);
	}
	function https_on_error(error: any): void {
		if (error.syscall !== 'listen') {
			throw error;
		}
	
		var bind = typeof port_8443 === 'string'
			? 'Pipe ' + port_8443
			: 'Port ' + port_8443;
	
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

	https_server.listen(port_8443);
	https_server.on('error', https_on_error);
	https_server.on('listening', https_on_listening);
}
else {
	// Create HTTP server
	debug(log_now(), "Create http server");

	// Get port from environment and store in Express.
	let port_8080 = normalizePort(process.env.PORT || '8080');
	app.set('port', port_8080);

	// Event listener for servers "error" event.
	function http_on_error(error: any): void {
		if (error.syscall !== 'listen') {
			throw error;
		}

		var bind = typeof port_8080 === 'string'
			? 'Pipe ' + port_8080
			: 'Port ' + port_8080;

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

	// Event listener for servers "listening" event.
	function http_on_listening(): void {
		let addr = http_server.address();
		let bind = typeof addr === 'string'
			? 'pipe ' + addr
			: 'port ' + (addr as AddressInfo).port;
		debug(log_now(), 'Listening on ' + bind);
	}

	let http_server = http.createServer(app);
	http_server.listen(port_8080);
	http_server.on('error', http_on_error);
	http_server.on('listening', http_on_listening);
}