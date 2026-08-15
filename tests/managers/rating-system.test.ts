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

import { RatingSystemManager } from '@server/managers/rating-system-manager';
import { initializeRatingFunctions, initializeRatingTimeControls } from '@server/managers/rating-system';
import { EloPlayerVsPlayer } from '@server/rating-framework/Elo/formula';
import { newRatingElo } from '@server/models/rating-framework/Elo/rating';
import { ratingFromStringElo } from '@server/io/ratings/Elo/rating';
import { toTimeControlId, toTimeControlName } from '@common/models/time-control';

const Classical = toTimeControlId('Classical');
const Classical90p30 = toTimeControlName('Classical (90 + 30)');

const Rapid = toTimeControlId('Rapid');
const Rapid15p10 = toTimeControlName('Rapid (15 + 10)');
const Rapid12p5 = toTimeControlName('Rapid (12 + 5)');
const Rapid10p0 = toTimeControlName('Rapid (10 + 0)');

const Blitz = toTimeControlId('Blitz');
const Blitz5p3 = toTimeControlName('Blitz (5 + 3)');
const Blitz5p0 = toTimeControlName('Blitz (5 + 0)');
const Blitz3p2 = toTimeControlName('Blitz (3 + 2)');

describe('Rating System Manager', () => {
	test('Initialization of functions (Elo)', () => {
		let rating = RatingSystemManager.getInstance();
		rating.clear();

		initializeRatingFunctions('Elo');

		expect(rating.getRatingFunction()).toBe(EloPlayerVsPlayer);
		expect(rating.getRatingFromStringFunction()).toBe(ratingFromStringElo);
		expect(rating.getNewRatingFunction()).toBe(newRatingElo);
	});

	test('Initialization of time controls', () => {
		let rating = RatingSystemManager.getInstance();
		rating.clear();

		initializeRatingTimeControls([
			{ id: Classical, name: Classical90p30 },
			{ id: Rapid, name: Rapid15p10 },
			{ id: Rapid, name: Rapid12p5 },
			{ id: Rapid, name: Rapid10p0 },
			{ id: Blitz, name: Blitz5p3 },
			{ id: Blitz, name: Blitz5p0 },
			{ id: Blitz, name: Blitz3p2 }
		]);

		expect(rating.getTimeControls().length).toBe(7);
		expect(rating.getUniqueTimeControlsIds().length).toBe(3);
		expect(rating.isTimeControlIdValid(Classical)).toBe(true);
		expect(rating.isTimeControlIdValid(Rapid)).toBe(true);
		expect(rating.isTimeControlIdValid(Blitz)).toBe(true);

		const unique_ids = rating.getUniqueTimeControlsIds();
		expect(
			unique_ids.findIndex((val: string): boolean => {
				return val === Classical;
			})
		).not.toEqual(-1);
		expect(
			unique_ids.findIndex((val: string): boolean => {
				return val === Rapid;
			})
		).not.toEqual(-1);
		expect(
			unique_ids.findIndex((val: string): boolean => {
				return val === Blitz;
			})
		).not.toEqual(-1);
	});
});
