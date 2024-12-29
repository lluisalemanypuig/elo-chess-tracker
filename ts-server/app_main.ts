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

/**
 * Adapted from Mozilla's web development tutorial "Express Local Library"
 * Full project: https://github.com/mdn/express-locallibrary-tutorial
 * File: https://github.com/mdn/express-locallibrary-tutorial/blob/main/bin/ww
 */

import Debug from 'debug';
const debug = Debug('ELO_TRACKER:app_main');

import fs from 'fs';
import { log_now } from './utils/misc';

import { server_initialize_from_parameters } from './server/initialization';
import { ServerConfiguration } from './server/environment';

debug(log_now(), 'Initialize server...');

server_initialize_from_parameters(process.argv.slice(2));

debug(log_now(), 'Import app...');

import { app } from './app_build';

debug(log_now(), '    Imported!');

import http from 'http';
import https from 'https';
import { AddressInfo } from 'net';
import { ServerEnvironment } from './server/environment';

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

let server_environment = ServerEnvironment.get_instance();
let server_configuration = ServerConfiguration.get_instance();

// create https server when possible
if (server_environment.is_SSL_info_valid()) {
	const port_https = server_configuration.get_port_https();

	debug(log_now(), `Create https server at port '${port_https}'`);

	// Get port from environment and store in Express.
	let port = normalizePort(process.env['PORT'] || port_https);
	app.set('port', port);

	let https_server = (function () {
		const private_key = fs.readFileSync(server_environment.get_ssl_private_key_file(), 'utf8');
		const certificate = fs.readFileSync(server_environment.get_ssl_public_key_file(), 'utf8');

		if (server_environment.get_ssl_passphrase_file() != '') {
			debug(log_now(), 'Passphrase file found...');
			let passphrase = fs.readFileSync(server_environment.get_ssl_passphrase_file(), 'utf8');
			return https.createServer(
				{
					key: private_key,
					cert: certificate,
					passphrase: passphrase.substring(0, passphrase.length - 1)
				},
				app
			);
		}

		debug(log_now(), 'No passphrase file given...');
		return https.createServer({ key: private_key, cert: certificate }, app);
	})();

	function https_on_listening(): void {
		let addr = https_server.address();
		let bind = typeof addr === 'string' ? 'pipe ' + addr : 'port ' + (addr as AddressInfo).port;
		debug(log_now(), 'Listening on ' + bind);
	}
	function https_on_error(error: any): void {
		if (error.syscall !== 'listen') {
			throw error;
		}

		var bind = (typeof port === 'string' ? 'Pipe ' : 'Port ') + port;

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

	https_server.listen(port);
	https_server.on('error', https_on_error);
	https_server.on('listening', https_on_listening);
}

// Create HTTP server
const port_http = server_configuration.get_port_http();

debug(log_now(), `Create http server at port '${port_http}'`);

// Get port from environment and store in Express.
let port = normalizePort(process.env['PORT'] || port_http);
app.set('port', port);

// Event listener for servers "error" event.
function http_on_error(error: any): void {
	if (error.syscall !== 'listen') {
		throw error;
	}

	var bind = (typeof port === 'string' ? 'Pipe ' : 'Port ') + port;

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
	let bind = typeof addr === 'string' ? 'pipe ' + addr : 'port ' + (addr as AddressInfo).port;
	debug(log_now(), 'Listening on ' + bind);
}

let http_server = http.createServer(app);
http_server.listen(port);
http_server.on('error', http_on_error);
http_server.on('listening', http_on_listening);
