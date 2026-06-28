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

import { z } from 'zod';
import { GameResultSchema } from '../models/game';

export const ChallengeSendSchema = z.object({
	to: z.number().gte(0),
	time_control_id: z.string(),
	time_control_name: z.string(),
	title: z.string()
});

export type ChallengeSend = z.infer<typeof ChallengeSendSchema>;

export const ChallengeAcceptSchema = z.object({
	challenge_id: z.string()
});

export type ChallengeAccept = z.infer<typeof ChallengeAcceptSchema>;

export const ChallengeDeclineSchema = z.object({
	challenge_id: z.string()
});

export type ChallengeDecline = z.infer<typeof ChallengeDeclineSchema>;

export const ChallengeSetResultSchema = z.object({
	challenge_id: z.string(),
	white: z.string(),
	black: z.string(),
	result: GameResultSchema
});

export type ChallengeSetResult = z.infer<typeof ChallengeSetResultSchema>;

export const ChallengeAgreeResultSchema = z.object({
	challenge_id: z.string()
});

export type ChallengeAgreeResult = z.infer<typeof ChallengeAgreeResultSchema>;

export const ChallengeDisagreeResultSchema = z.object({
	challenge_id: z.string()
});

export type ChallengeDisagreeResult = z.infer<typeof ChallengeDisagreeResultSchema>;
