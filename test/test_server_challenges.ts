/*
Elo rating for a Chess Club
Copyright (C) 2023  Lluís Alemany Puig

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

import path from 'path';

import { server_initialize } from '../ts-source/server/initialization';
import { challenge_accept, challenge_retrieve, challenge_send_new, challenge_set_result, challenge_agree_result } from '../ts-source/server/challenges';
import { ServerMemory } from '../ts-source/server/configuration';
import { Challenge } from '../ts-source/models/challenge';

server_initialize(path.join(__dirname, "database"));

let mem = ServerMemory.get_instance();

let id1 = challenge_send_new("magnus.carlsen", "emanuel.lasker");
let id2 = challenge_send_new("bobby.fischer", "mikhail.botvinnik");
let id3 = challenge_send_new("vasily.smyslov", "anatoly.karpov");

for (let i = 0; i < mem.challenges.length; ++i) {
	console.log(mem.challenges[i]);
}

challenge_accept(challenge_retrieve(id1) as Challenge);
challenge_accept(challenge_retrieve(id2) as Challenge);
challenge_accept(challenge_retrieve(id3) as Challenge);

for (let i = 0; i < mem.challenges.length; ++i) {
	console.log(mem.challenges[i]);
}

challenge_set_result(
	challenge_retrieve(id1) as Challenge,
	"magnus.carlsen",
	"2023-01-04..18:00:00",
	"magnus.carlsen",
	"emanuel.lasker",
	"white_wins",
	"classical"
);

challenge_set_result(
	challenge_retrieve(id2) as Challenge,
	"mikhail.botvinnik",
	"2023-01-04..18:30:00",
	"bobby.fischer",
	"mikhail.botvinnik",
	"draw",
	"classical"
);

challenge_set_result(
	challenge_retrieve(id3) as Challenge,
	"vasily.smyslov",
	"2023-01-04..19:00:00",
	"vasily.smyslov",
	"anatoly.karpov",
	"black_wins",
	"classical"
);

for (let i = 0; i < mem.challenges.length; ++i) {
	console.log(mem.challenges[i]);
}

challenge_agree_result(challenge_retrieve(id1) as Challenge);
challenge_agree_result(challenge_retrieve(id2) as Challenge);
challenge_agree_result(challenge_retrieve(id3) as Challenge);

