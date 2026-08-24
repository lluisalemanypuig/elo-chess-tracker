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

import { toChallengeId } from '@common/models/challenge-id';
import { toPlayerPrivateId } from '@common/models/player-id';
import {
	toTimeControlId,
	toTimeControlName,
} from '@common/models/time-control';
import { toDateFull } from '@common/utils/time';
import {
	ChallengesManager,
	numberToChallengeId,
} from '@server/managers/challenges-manager';
import { newChallenge } from '@server/models/challenge';

const Classical = toTimeControlId('Classical');
const Classical90p30 = toTimeControlName('Classical (90 + 30)');

describe('Challenges Manager', () => {
	test('Empty manager', () => {
		let challenges = ChallengesManager.getInstance();
		challenges.clear();

		const id00001 = toChallengeId('00001');
		const id00002 = toChallengeId('00002');

		expect(challenges.getMaxChallengeId()).toBe(0);
		expect(challenges.numChallenges()).toBe(0);

		const c = newChallenge(
			id00001,
			'sample',
			toPlayerPrivateId('a'),
			toPlayerPrivateId('b'),
			Classical,
			Classical90p30,
			toDateFull('2025-01-07..17:49:20:000'),
		);
		expect(challenges.getChallengeIndex(c)).toBe(-1);
		expect(challenges.getChallengeIndexById(id00001)).toBe(-1);
		expect(challenges.getChallengeIndexById(id00002)).toBe(-1);
		expect(challenges.getChallengeById(id00001)).toBe(undefined);
		expect(challenges.getChallengeById(id00002)).toBe(undefined);
		expect(challenges.getChallengeAt(0)).toBe(undefined);
		expect(challenges.getChallengeAt(1)).toBe(undefined);
	});

	test('Set maximum challenge id', () => {
		let challenges = ChallengesManager.getInstance();
		challenges.clear();

		challenges.setMaxChallengeId(3);
		expect(challenges.getMaxChallengeId()).toBe(3);

		challenges.newChallengeId();
		expect(challenges.getMaxChallengeId()).toBe(4);
	});

	test('Add some challenges', () => {
		let challenges = ChallengesManager.getInstance();
		challenges.clear();

		const yesterday_id = challenges.newChallengeId();
		expect(yesterday_id).toBe(numberToChallengeId(1));
		const yesterday = newChallenge(
			yesterday_id,
			'sample',
			toPlayerPrivateId('a'),
			toPlayerPrivateId('b'),
			Classical,
			Classical90p30,
			toDateFull('yesterday'),
		);

		const today_id = challenges.newChallengeId();
		expect(today_id).toBe(numberToChallengeId(2));
		const today = newChallenge(
			today_id,
			'sample',
			toPlayerPrivateId('a'),
			toPlayerPrivateId('b'),
			Classical,
			Classical90p30,
			toDateFull('today'),
		);

		const tomorrow_id = challenges.newChallengeId();
		expect(tomorrow_id).toBe(numberToChallengeId(3));
		const tomorrow = newChallenge(
			tomorrow_id,
			'sample',
			toPlayerPrivateId('a'),
			toPlayerPrivateId('b'),
			Classical,
			Classical90p30,
			toDateFull('tomorrow'),
		);

		challenges.addChallenge(yesterday);
		expect(challenges.numChallenges()).toBe(1);
		challenges.addChallenge(today);
		expect(challenges.numChallenges()).toBe(2);
		challenges.addChallenge(tomorrow);
		expect(challenges.numChallenges()).toBe(3);

		expect(challenges.getChallengeIndex(yesterday)).toBe(0);
		expect(challenges.getChallengeIndexById(yesterday.id)).toBe(0);
		expect(challenges.getChallengeById(yesterday.id)).toEqual(yesterday);
		expect(challenges.getChallengeAt(0)).toEqual(yesterday);

		expect(challenges.getChallengeIndex(today)).toBe(1);
		expect(challenges.getChallengeIndexById(today.id)).toBe(1);
		expect(challenges.getChallengeById(today.id)).toEqual(today);
		expect(challenges.getChallengeAt(1)).toEqual(today);

		expect(challenges.getChallengeIndex(tomorrow)).toBe(2);
		expect(challenges.getChallengeIndexById(tomorrow.id)).toBe(2);
		expect(challenges.getChallengeById(tomorrow.id)).toEqual(tomorrow);
		expect(challenges.getChallengeAt(2)).toEqual(tomorrow);
	});

	test('Remove some challenges', () => {
		let challenges = ChallengesManager.getInstance();
		challenges.clear();

		const yesterday_id = challenges.newChallengeId();
		expect(yesterday_id).toBe(numberToChallengeId(1));
		const yesterday = newChallenge(
			yesterday_id,
			'sample',
			toPlayerPrivateId('a'),
			toPlayerPrivateId('b'),
			Classical,
			Classical90p30,
			toDateFull('yesterday'),
		);

		const today_id = challenges.newChallengeId();
		expect(today_id).toBe(numberToChallengeId(2));
		const today = newChallenge(
			today_id,
			'sample',
			toPlayerPrivateId('a'),
			toPlayerPrivateId('b'),
			Classical,
			Classical90p30,
			toDateFull('today'),
		);

		const tomorrow_id = challenges.newChallengeId();
		expect(tomorrow_id).toBe(numberToChallengeId(3));
		const tomorrow = newChallenge(
			tomorrow_id,
			'sample',
			toPlayerPrivateId('a'),
			toPlayerPrivateId('b'),
			Classical,
			Classical90p30,
			toDateFull('tomorrow'),
		);

		const day_after_tomorrow_id = challenges.newChallengeId();
		expect(day_after_tomorrow_id).toBe(numberToChallengeId(4));
		const day_after_tomorrow = newChallenge(
			day_after_tomorrow_id,
			'sample',
			toPlayerPrivateId('a'),
			toPlayerPrivateId('b'),
			Classical,
			Classical90p30,
			toDateFull('day_after_tomorrow'),
		);

		challenges.addChallenge(yesterday);
		challenges.addChallenge(today);
		challenges.addChallenge(tomorrow);

		// ------------------------------------------------------------------------
		challenges.removeChallenge(yesterday);
		expect(challenges.numChallenges()).toBe(2);
		expect(challenges.getMaxChallengeId()).toBe(4);

		expect(challenges.getChallengeIndex(yesterday)).toBe(-1);
		expect(challenges.getChallengeIndexById(yesterday.id)).toBe(-1);
		expect(challenges.getChallengeById(yesterday.id)).toEqual(undefined);

		expect(challenges.getChallengeIndex(today)).toBe(0);
		expect(challenges.getChallengeIndexById(today.id)).toBe(0);
		expect(challenges.getChallengeById(today.id)).toEqual(today);

		expect(challenges.getChallengeIndex(tomorrow)).toBe(1);
		expect(challenges.getChallengeIndexById(tomorrow.id)).toBe(1);
		expect(challenges.getChallengeById(tomorrow.id)).toEqual(tomorrow);

		expect(challenges.getChallengeAt(0)).toEqual(today);
		expect(challenges.getChallengeAt(1)).toEqual(tomorrow);
		expect(challenges.getChallengeAt(2)).toEqual(undefined);
		expect(challenges.getChallengeAt(3)).toEqual(undefined);

		// ------------------------------------------------------------------------
		challenges.addChallenge(day_after_tomorrow);
		expect(challenges.numChallenges()).toBe(3);
		expect(challenges.getMaxChallengeId()).toBe(4);

		expect(challenges.getChallengeIndex(yesterday)).toBe(-1);
		expect(challenges.getChallengeIndexById(yesterday.id)).toBe(-1);
		expect(challenges.getChallengeById(yesterday.id)).toEqual(undefined);

		expect(challenges.getChallengeIndex(today)).toBe(0);
		expect(challenges.getChallengeIndexById(today.id)).toBe(0);
		expect(challenges.getChallengeById(today.id)).toEqual(today);

		expect(challenges.getChallengeIndex(tomorrow)).toBe(1);
		expect(challenges.getChallengeIndexById(tomorrow.id)).toBe(1);
		expect(challenges.getChallengeById(tomorrow.id)).toEqual(tomorrow);

		expect(challenges.getChallengeIndex(day_after_tomorrow)).toBe(2);
		expect(challenges.getChallengeIndexById(day_after_tomorrow.id)).toBe(2);
		expect(challenges.getChallengeById(day_after_tomorrow.id)).toEqual(
			day_after_tomorrow,
		);

		expect(challenges.getChallengeAt(0)).toEqual(today);
		expect(challenges.getChallengeAt(1)).toEqual(tomorrow);
		expect(challenges.getChallengeAt(2)).toEqual(day_after_tomorrow);
		expect(challenges.getChallengeAt(3)).toEqual(undefined);

		// ------------------------------------------------------------------------
		challenges.removeChallenge(tomorrow);
		expect(challenges.numChallenges()).toBe(2);
		expect(challenges.getMaxChallengeId()).toBe(4);

		expect(challenges.getChallengeIndex(yesterday)).toBe(-1);
		expect(challenges.getChallengeIndexById(yesterday.id)).toBe(-1);
		expect(challenges.getChallengeById(yesterday.id)).toEqual(undefined);

		expect(challenges.getChallengeIndex(today)).toBe(0);
		expect(challenges.getChallengeIndexById(today.id)).toBe(0);
		expect(challenges.getChallengeById(today.id)).toEqual(today);

		expect(challenges.getChallengeIndex(tomorrow)).toBe(-1);
		expect(challenges.getChallengeIndexById(tomorrow.id)).toBe(-1);
		expect(challenges.getChallengeById(tomorrow.id)).toEqual(undefined);

		expect(challenges.getChallengeIndex(day_after_tomorrow)).toBe(1);
		expect(challenges.getChallengeIndexById(day_after_tomorrow.id)).toBe(1);
		expect(challenges.getChallengeById(day_after_tomorrow.id)).toEqual(
			day_after_tomorrow,
		);

		expect(challenges.getChallengeAt(0)).toEqual(today);
		expect(challenges.getChallengeAt(1)).toEqual(day_after_tomorrow);
		expect(challenges.getChallengeAt(2)).toEqual(undefined);
		expect(challenges.getChallengeAt(3)).toEqual(undefined);

		// ------------------------------------------------------------------------
		challenges.removeChallenge(today);
		expect(challenges.numChallenges()).toBe(1);
		expect(challenges.getMaxChallengeId()).toBe(4);

		expect(challenges.getChallengeIndex(yesterday)).toBe(-1);
		expect(challenges.getChallengeIndexById(yesterday.id)).toBe(-1);
		expect(challenges.getChallengeById(yesterday.id)).toEqual(undefined);

		expect(challenges.getChallengeIndex(today)).toBe(-1);
		expect(challenges.getChallengeIndexById(today.id)).toBe(-1);
		expect(challenges.getChallengeById(today.id)).toEqual(undefined);

		expect(challenges.getChallengeIndex(tomorrow)).toBe(-1);
		expect(challenges.getChallengeIndexById(tomorrow.id)).toBe(-1);
		expect(challenges.getChallengeById(tomorrow.id)).toEqual(undefined);

		expect(challenges.getChallengeIndex(day_after_tomorrow)).toBe(0);
		expect(challenges.getChallengeIndexById(day_after_tomorrow.id)).toBe(0);
		expect(challenges.getChallengeById(day_after_tomorrow.id)).toEqual(
			day_after_tomorrow,
		);

		expect(challenges.getChallengeAt(0)).toEqual(day_after_tomorrow);
		expect(challenges.getChallengeAt(1)).toEqual(undefined);
		expect(challenges.getChallengeAt(2)).toEqual(undefined);
		expect(challenges.getChallengeAt(3)).toEqual(undefined);

		// ------------------------------------------------------------------------
		challenges.removeChallenge(day_after_tomorrow);
		expect(challenges.numChallenges()).toBe(0);
		expect(challenges.getMaxChallengeId()).toBe(0);

		expect(challenges.getChallengeIndex(yesterday)).toBe(-1);
		expect(challenges.getChallengeIndexById(yesterday.id)).toBe(-1);
		expect(challenges.getChallengeById(yesterday.id)).toEqual(undefined);

		expect(challenges.getChallengeIndex(today)).toBe(-1);
		expect(challenges.getChallengeIndexById(today.id)).toBe(-1);
		expect(challenges.getChallengeById(today.id)).toEqual(undefined);

		expect(challenges.getChallengeIndex(tomorrow)).toBe(-1);
		expect(challenges.getChallengeIndexById(tomorrow.id)).toBe(-1);
		expect(challenges.getChallengeById(tomorrow.id)).toEqual(undefined);

		expect(challenges.getChallengeIndex(day_after_tomorrow)).toBe(-1);
		expect(challenges.getChallengeIndexById(day_after_tomorrow.id)).toBe(-1);
		expect(challenges.getChallengeById(day_after_tomorrow.id)).toEqual(
			undefined,
		);

		expect(challenges.getChallengeAt(0)).toEqual(undefined);
		expect(challenges.getChallengeAt(1)).toEqual(undefined);
		expect(challenges.getChallengeAt(2)).toEqual(undefined);
		expect(challenges.getChallengeAt(3)).toEqual(undefined);
	});
});
