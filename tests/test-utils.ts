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

import { GameEditLog } from '@common/models/game-edit-history';
import { toGameId } from '@common/models/game-id';
import { GameResult } from '@common/models/game-result';
import { toPlayerPrivateId } from '@common/models/player-id';
import {
	TimeControlArray,
	toTimeControlId,
	toTimeControlName,
} from '@common/models/time-control';
import { toUserGivenName } from '@common/models/user-given-name';
import { UserRole } from '@common/models/user-role';
import { toDateFull } from '@common/utils/time';
import { Behavior } from '@server/models/configuration/behavior';
import { Configuration } from '@server/models/configuration/configuration';
import {
	HomePage,
	LoginPage,
	SSLCertificate,
} from '@server/models/configuration/environment';
import { UserPermissions } from '@server/models/configuration/permissions';
import { Ports } from '@server/models/configuration/server';
import { Game } from '@server/models/game';
import { Password } from '@server/models/password';
import { Rating } from '@server/models/rating-framework/rating';
import { TimeControlRating } from '@server/models/time-control-rating';
import { TimeControlGame, User } from '@server/models/user';

export class TestError extends Error {
	constructor(msg: string) {
		super(msg);
		Object.setPrototypeOf(this, TestError.prototype);
	}
}

interface NewUserProps {
	username: string;
	firstName: string;
	lastName: string;
	password: Password;
	roles?: UserRole[];
	games?: TimeControlGame[];
	ratings?: TimeControlRating[];
}

export function makeUser({
	username,
	firstName,
	lastName,
	password,
	roles = [],
	games = [],
	ratings = [],
}: NewUserProps): User {
	return new User(
		toPlayerPrivateId(username),
		toUserGivenName(firstName),
		toUserGivenName(lastName),
		password,
		roles,
		games,
		ratings,
	);
}

interface NewConfigurationProps {
	timeControls: TimeControlArray;
	permissions: UserPermissions;
	sslCertificate?: SSLCertificate;
	publicKeyFile?: string;
	privateKeyFile?: string;
	passphraseFile?: string;
	favicon?: string;
	loginPage?: LoginPage;
	homePage?: HomePage;
	behavior?: Behavior;
	domainName?: string;
	ports?: Ports;
}

export function makeConfiguration({
	timeControls,
	permissions,
	sslCertificate = {
		publicKeyFile: 'sadf',
		privateKeyFile: 'qwer',
		passphraseFile: 'kgj68',
	},
	favicon = 'favicon.png',
	loginPage = {
		title: 'Login title',
		icon: 'login.png',
	},
	homePage = {
		title: 'Home title',
		icon: 'home.png',
	},
	behavior = {
		challenges: {
			higherRatedPlayerCanDeclineChallengeFromLowerRatedPlayer: false,
		},
	},
	domainName = '',
	ports = {
		http: '8080',
		https: '8443',
	},
}: NewConfigurationProps): Configuration {
	return {
		environment: {
			sslCertificate,
			favicon,
			loginPage,
			homePage,
		},
		server: {
			domainName,
			ports,
		},
		ratingSystem: 'Elo',
		timeControls,
		behavior,
		permissions,
	};
}

interface NewGameProps {
	id: string;
	title: string;
	white: string;
	whiteRating: Rating;
	black: string;
	blackRating: Rating;
	createdBy: string;
	whenCreated: string;
	result: GameResult;
	timeControlId: string;
	timeControlName: string;
	whenPlayed: string;
	history?: GameEditLog[];
}

export function makeGame({
	id,
	title,
	white,
	whiteRating,
	black,
	blackRating,
	createdBy,
	whenCreated,
	result,
	timeControlId,
	timeControlName,
	whenPlayed,
	history = [],
}: NewGameProps): Game {
	return new Game(
		toGameId(id),
		title,
		toPlayerPrivateId(white),
		whiteRating,
		toPlayerPrivateId(black),
		blackRating,
		toPlayerPrivateId(createdBy),
		toDateFull(whenCreated),
		result,
		toTimeControlId(timeControlId),
		toTimeControlName(timeControlName),
		toDateFull(whenPlayed),
		history,
	);
}
