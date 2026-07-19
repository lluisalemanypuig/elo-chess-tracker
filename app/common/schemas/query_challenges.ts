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

export const QueryChallengesReceivedOutputSingleSchema = z.object({
	id: z.string(),
	title: z.string(),
	sent_by: z.string(),
	sent_when: z.string(), // DateStringLongMillis
	time_control_name: z.string(),
	can_be_declined: z.boolean()
});

export type QueryChallengesReceivedOutputSingle = z.infer<typeof QueryChallengesReceivedOutputSingleSchema>;

export const QueryChallengesReceivedOutputSchema = z.array(QueryChallengesReceivedOutputSingleSchema);

export type QueryChallengesReceivedOutput = z.infer<typeof QueryChallengesReceivedOutputSchema>;

// --------------------

export const QueryChallengesSentOutputSingleSchema = z.object({
	id: z.string(),
	title: z.string(),
	sent_to: z.string(),
	sent_when: z.string(), // DateStringLongMillis
	time_control_name: z.string(),
	can_be_declined: z.boolean()
});

export type QueryChallengesSentOutputSingle = z.infer<typeof QueryChallengesSentOutputSingleSchema>;

export const QueryChallengesSentOutputSchema = z.array(QueryChallengesSentOutputSingleSchema);

export type QueryChallengesSentOutput = z.infer<typeof QueryChallengesSentOutputSchema>;

// --------------------

export const QueryChallengesPendingResultOutputSingleSchema = z.object({
	id: z.string(),
	title: z.string(),
	sent_by_name: z.string(),
	sent_by_username: z.string(),
	sent_to_name: z.string(),
	sent_to_username: z.string(),
	opponent: z.string(),
	sent_when: z.string(), // DateStringLongMillis
	time_control_name: z.string()
});

export type QueryChallengesPendingResultOutputSingle = z.infer<typeof QueryChallengesPendingResultOutputSingleSchema>;

export const QueryChallengesPendingResultOutputSchema = z.array(QueryChallengesPendingResultOutputSingleSchema);

export type QueryChallengesPendingResultOutput = z.infer<typeof QueryChallengesPendingResultOutputSchema>;

// --------------------

export const QueryChallengesConfirmResultOtherOutputSingleSchema = z.object({
	id: z.string(),
	title: z.string(),
	opponent: z.string(),
	sent_when: z.string(), // DateStringLongMillis
	white: z.string(),
	black: z.string(),
	result: z.string(),
	time_control: z.string()
});

export type QueryChallengesConfirmResultOtherOutputSingle = z.infer<
	typeof QueryChallengesConfirmResultOtherOutputSingleSchema
>;

export const QueryChallengesConfirmResultOtherOutputSchema = z.array(
	QueryChallengesConfirmResultOtherOutputSingleSchema
);

export type QueryChallengesConfirmResultOtherOutput = z.infer<typeof QueryChallengesConfirmResultOtherOutputSchema>;

// --------------------

export const QueryChallengesConfirmResultSelfOutputSingleSchema = z.object({
	id: z.string(),
	title: z.string(),
	opponent: z.string(),
	sent_when: z.string(), // DateStringLongMillis
	white: z.string(),
	black: z.string(),
	result: z.string(),
	time_control: z.string()
});

export type QueryChallengesConfirmResultSelfOutputSingle = z.infer<
	typeof QueryChallengesConfirmResultSelfOutputSingleSchema
>;

export const QueryChallengesConfirmResultSelfOutputSchema = z.array(QueryChallengesConfirmResultSelfOutputSingleSchema);

export type QueryChallengesConfirmResultSelfOutput = z.infer<typeof QueryChallengesConfirmResultSelfOutputSchema>;
