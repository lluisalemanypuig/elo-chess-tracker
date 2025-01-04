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

Contact:
	Lluís Alemany Puig
	https://github.com/lluisalemanypuig
*/

import createError from 'http-errors';
import express from 'express';
import cookieParser from 'cookie-parser';
import logger from 'morgan';
import compression from 'compression';
import helmet from 'helmet';

import Debug from 'debug';
const debug = Debug('ELO_TRACKER:app_build');
import { log_now } from './utils/misc';

debug(log_now(), 'Create app object');

let app = express();

debug(log_now(), 'Building app...');

/* connect POST and GET queries with actual code */
//let indexRouter = require('../js-source/routes/index');
//app.use('/', indexRouter);

debug(log_now(), '    Set stuff...');

// view engine setup
app.set('views', './views');
app.set('view engine', 'ejs'); // this has to be ejs!

// use stuff
app.use(logger('dev'));
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(helmet());
app.use(compression()); // Compress all routes

debug(log_now(), '    GETs and POSTs...');

import { router } from './app_router';
app.use('/', router);

debug(log_now(), '    Error handlers...');

// catch 404 and forward to error handler
app.use(function (_req: any, _res: any, next: Function) {
	next(createError(404));
});
// error handler
app.use(function (err: any, req: any, res: any, _next: Function) {
	debug(log_now(), 'The request could not be served');
	let R = req as Request;
	debug(log_now(), `    method: ${R.method}`);
	debug(log_now(), `    text: ${R.text}`);
	debug(log_now(), `    referrer: ${R.referrer}`);
	debug(log_now(), `    url: ${R.url}`);

	// set locals, only providing error in development
	res.locals.message = err.message;
	res.locals.error = req.app.get('env') === 'development' ? err : {};

	// render the error page
	res.status(err.status || 500);
	res.render('error');
});

debug(log_now(), '    Done!');

export { app };
