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

/**
 * Adapted from Mozilla's web development tutorial "Express Local Library"
 * Full project: https://github.com/mdn/express-locallibrary-tutorial
 * File: https://github.com/mdn/express-locallibrary-tutorial/blob/main/bin/ww
 */

import Debug from 'debug';
const debug = Debug('ELOCHESSTRACKER:appMain');

import fs from 'fs';
import { logNow } from '@common/utils/time';

import { serverInitFromParameters } from '@server/managers/memory/initialization';
import { ConfigurationManager } from '@app/server/managers/configuration-manager';

debug(logNow(), 'Initialize server memory...');

serverInitFromParameters(process.argv.slice(2));

debug(logNow(), 'Import app...');

import { app } from '@app/build';

debug(logNow(), '    Imported!');

import http from 'http';
import https from 'https';
import { AddressInfo } from 'net';
import { EnvironmentManager } from '@app/server/managers/environment-manager';

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

let serverEnvironment = EnvironmentManager.getInstance();
let serverConfiguration = ConfigurationManager.getInstance();

// create https server when possible
if (serverEnvironment.isSSLInfoValid()) {
	const portHttps = serverConfiguration.getPortHttps();

	debug(logNow(), `Create https server at port '${portHttps}'`);

	// Get port from environment and store in Express.
	let port = normalizePort(process.env['PORT'] || portHttps);
	app.set('port', port);

	let httpsServer = (function () {
		const privateKey = fs.readFileSync(serverEnvironment.getSslPrivateKeyFile(), 'utf8');
		const certificate = fs.readFileSync(serverEnvironment.getSslPublicKeyFile(), 'utf8');

		if (serverEnvironment.getSslPassphraseFile() != '') {
			debug(logNow(), 'Passphrase file found...');
			let passphrase = fs.readFileSync(serverEnvironment.getSslPassphraseFile(), 'utf8');
			return https.createServer(
				{
					key: privateKey,
					cert: certificate,
					passphrase: passphrase.substring(0, passphrase.length - 1)
				},
				app
			);
		}

		debug(logNow(), 'No passphrase file given...');
		return https.createServer({ key: privateKey, cert: certificate }, app);
	})();

	function httpsOnListening(): void {
		let addr = httpsServer.address();
		let bind = typeof addr === 'string' ? 'pipe ' + addr : 'port ' + (addr as AddressInfo).port;
		debug(logNow(), 'Listening on ' + bind);
	}
	function httpsOnError(error: any): void {
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

	httpsServer.listen(port);
	httpsServer.on('error', httpsOnError);
	httpsServer.on('listening', httpsOnListening);
}

// Create HTTP server
const portHttp = serverConfiguration.getPortHttp();

debug(logNow(), `Create http server at port '${portHttp}'`);

// Get port from environment and store in Express.
let port = normalizePort(process.env['PORT'] || portHttp);
app.set('port', port);

// Event listener for servers "error" event.
function httpOnError(error: any): void {
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
function httpOnListening(): void {
	let addr = httpServer.address();
	let bind = typeof addr === 'string' ? 'pipe ' + addr : 'port ' + (addr as AddressInfo).port;
	debug(logNow(), 'Listening on ' + bind);
}

let httpServer = http.createServer(app);
httpServer.listen(port);
httpServer.on('error', httpOnError);
httpServer.on('listening', httpOnListening);
