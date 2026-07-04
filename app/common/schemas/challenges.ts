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

export const ChallengeSendInputSchema = z.object({
	to: z.number().gte(0),
	time_control_id: z.string(),
	time_control_name: z.string(),
	title: z.string()
});

export type ChallengeSendInput = z.infer<typeof ChallengeSendInputSchema>;

export const ChallengeAcceptInputSchema = z.object({
	challenge_id: z.string()
});

export type ChallengeInputAccept = z.infer<typeof ChallengeAcceptInputSchema>;

export const ChallengeDeclineInputSchema = z.object({
	challenge_id: z.string()
});

export type ChallengeDeclineInput = z.infer<typeof ChallengeDeclineInputSchema>;

export const ChallengeSetResultInputSchema = z.object({
	challenge_id: z.string(),
	white: z.string(),
	black: z.string(),
	result: GameResultSchema
});

export type ChallengeSetResultInput = z.infer<typeof ChallengeSetResultInputSchema>;

export const ChallengeAgreeResultInputSchema = z.object({
	challenge_id: z.string()
});

export type ChallengeAgreeResultInput = z.infer<typeof ChallengeAgreeResultInputSchema>;

export const ChallengeDisagreeResultInputSchema = z.object({
	challenge_id: z.string()
});

export type ChallengeDisagreeResultInput = z.infer<typeof ChallengeDisagreeResultInputSchema>;
