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

export const QueryGraphInputOwnSchema = z.object({
	tc_i: z.string()
});

export type QueryGraphOwnInput = z.infer<typeof QueryGraphInputOwnSchema>;

// ----------------

export const QueryGraphInputFullSchema = z.object({
	tc_i: z.string()
});

export type QueryGraphFullInput = z.infer<typeof QueryGraphInputFullSchema>;

// ----------------
// ----------------

export const NodeWeightSchema = z.object({
	rating: z.number()
});

export type NodeWeight = z.infer<typeof NodeWeightSchema>;

export const NodeInfoSchema = z.object({
	id: z.number(),
	full_name: z.string(),
	weight: NodeWeightSchema
});

export type NodeInfo = z.infer<typeof NodeInfoSchema>;

export const EdgeWeightSchema = z.object({
	wins: z.number(),
	draws: z.number(),
	losses: z.number()
});

export type EdgeWeight = z.infer<typeof EdgeWeightSchema>;

export const EdgeInfoSchema = z.object({
	source: z.number(),
	target: z.number(),
	label: z.string(),
	weight: EdgeWeightSchema
});

export type EdgeInfo = z.infer<typeof EdgeInfoSchema>;

export const QueryGraphOutputSchema = z.object({
	nodes: z.array(NodeInfoSchema),
	edges: z.array(EdgeInfoSchema)
});

export type QueryGraphOutput = z.infer<typeof QueryGraphOutputSchema>;
