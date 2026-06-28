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

import createError from 'http-errors';
import express from 'express';
import cookieParser from 'cookie-parser';
import logger from 'morgan';
import compression from 'compression';
import helmet from 'helmet';
import { Request, Response } from 'express';

import Debug from 'debug';
const debug = Debug('ELO_CHESS_TRACKER:app_build');
import { log_now } from '@server/utils/time';

debug(log_now(), 'Create app object');

let app = express();

debug(log_now(), 'Building app...');

/* connect POST and GET queries with actual code */
//let indexRouter = require('../js/routes/index');
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

import { router } from '@app/router';
app.use('/', router);

debug(log_now(), '    Error handlers...');

// catch 404 and forward to error handler
app.use(function (_req: any, _res: any, next: Function) {
	next(createError(404));
});
// error handler
app.use(function (err: any, req: Request, res: Response, _next: Function) {
	debug(log_now(), 'The request could not be served');
	debug(log_now(), `    method: ${req.method}`);
	debug(log_now(), `    body: ${JSON.stringify(req.body, null, '    ')}`);
	debug(log_now(), `    url: ${req.url}`);

	// render the error page
	res.status(err.status || 500);
	res.render('error');
});

debug(log_now(), '    Done!');

export { app };
