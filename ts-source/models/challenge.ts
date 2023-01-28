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

import { GameResult } from "./game";

/**
 * @brief Class enconding a challenge
 * 
 * A Challenge (from_Challenge) can challenge another Challenge (to_Challenge).
 */
export class Challenge {
	/// Identifier of this challenge
	public id: string;

	/// The Challenge sending the challenge
	private readonly sent_by: string;
	/// The Challenge receiving the challenge
	private readonly sent_to: string;
	/// Date when the challenge was sent
	private when_challenge_sent: string;

	/// Date when the challenge was accepted
	private when_challenge_accepted: string | null = null;

	/// Has the result been set at some point?
	private result_was_set: boolean = false;
	/// Date when the result of the game was last modified
	private when_result_set: string | null = null;
	/// Player who set the result
	private result_set_by: string | null = null;

	/// Date when the result of the game was accepted.
	private when_result_accepted: string | null = null;
	/// User that accepted the result
	private result_accepted_by: string | null = null;

	/// The resulting game of the challenge
	private white: string | null = null;
	private black: string | null = null;
	private result: GameResult | null = null;
	private time_control_id: string | null = null;
	private time_control_name: string | null = null;

	/**
	 * @brief Constructor
	 * @param id Challenge string id
	 * @param sent_by User issuing the challenge
	 * @param sent_to User receiving the challenge
	 * @param when_challenge_sent Date when the challenge was sent
	 * @param when_challenge_accepted Date when the challenge was accepted
	 * @param result_was_set Has the result been set at some point?
	 * @param when_result_set Date when the result of the game was set
	 * @param result_set_by User that set the result
	 * @param when_result_accepted Date when the result was accepted
	 * @param result_accepted_by User that accepted the result
	 * @param white White player
	 * @param black Black player
	 * @param result Result of the game
	 * @param time_control_id Time control id of the game
	 * @param time_control_name Time control name of the game
	 */
	constructor(
		id: string,

		sent_by: string,
		sent_to: string,
		when_challenge_sent: string,

		when_challenge_accepted: string | null = null,

		result_was_set: boolean = false,
		when_result_set: string | null = null,
		result_set_by: string | null = null,

		when_result_accepted: string | null = null,
		result_accepted_by: string | null = null,

		white: string | null = null,
		black: string | null = null,
		result: GameResult | null = null,
		time_control_id: string | null = null,
		time_control_name: string | null = null
	) {
		this.id = id;

		this.sent_by = sent_by;
		this.sent_to = sent_to;
		this.when_challenge_sent = when_challenge_sent;

		this.when_challenge_accepted = when_challenge_accepted;

		this.result_was_set = result_was_set;
		this.when_result_set = when_result_set;
		this.result_set_by = result_set_by;

		this.when_result_accepted = when_result_accepted;
		this.result_accepted_by = result_accepted_by;

		this.white = white;
		this.black = black;
		this.result = result;
		this.time_control_id = time_control_id;
		this.time_control_name = time_control_name;
	}

	/// Returns the id of the challenge
	get_id(): string { return this.id; }

	/// Returns the username this challenge was sent by
	get_sent_by(): string { return this.sent_by; }
	/// Returns the username this challenge was sent to
	get_sent_to(): string { return this.sent_to; }

	/// Return the time when the challenge was sent
	get_when_challenge_sent(): string { return this.when_challenge_sent; }
	/// Return the time when the challenge was accepted
	get_when_challenge_accepted(): string | null { return this.when_challenge_accepted; }

	/// Return the time when the challenge was sent
	get_when_result_set(): string | null { return this.when_result_set; }
	/// Returns the username of the player who set the result
	get_result_set_by(): string | null { return this.result_set_by; }

	/// Return the time when the challenge was accepted
	get_when_result_accepted(): string | null { return this.when_result_accepted; }
	/// Returns the username of the player who set the result
	get_result_accepted_by(): string | null { return this.result_accepted_by; }

	/// White player
	get_white(): string | null { return this.white; }
	/// Black player
	get_black(): string | null { return this.black; }
	/// Result of the game
	get_result(): GameResult | null { return this.result; }
	/// Time control id of the game
	get_time_control_id(): string | null { return this.time_control_id; }
	/// Time control name of the game
	get_time_control_name(): string | null { return this.time_control_name; }
	/// Sets the date when the challenge was accepted
	set_challenge_accepted(d: string): void { this.when_challenge_accepted = d; }

	/// Was the result set at some point?
	was_result_set(): boolean { return this.result_was_set; }

	/// Sets the result
	set_result(
		by: string,
		when: string,
		white: string,
		black: string,
		result: GameResult,
		time_control_id: string,
		time_control_name: string

	): void {
		this.result_was_set = true;
		this.result_set_by = by;
		this.when_result_set = when;
		this.white = white;
		this.black = black;
		this.result = result;
		this.time_control_id = time_control_id;
	}

	/// Unset the previous result
	unset_result(): void {
		this.result_set_by = null;

		// 'when_result_set' should be 'unset' since it marks the first day
		//this.when_result_set = null;

		this.white = null;
		this.black = null;
		this.result = null;
		this.time_control_id = null;
		this.time_control_name = null;
	}

	/// Accepts the result
	set_result_accepted(by: string, d: string) {
		this.result_accepted_by = by;
		this.when_result_accepted = d;
	}
}

/**
 * @brief Parses a JSON string or object and returns a Challenge.
 * @param json A JSON string or object with data of a Challenge.
 * @returns A new Challenge object.
 * @pre If @e json is a string then it cannot start with '['.
 */
export function challenge_from_json(json: any): Challenge {
	if (typeof json === "string") {
		let json_parse = JSON.parse(json);
		return challenge_from_json(json_parse);
	}

	return new Challenge(
		json["id"], json["sent_by"], json["sent_to"], json["when_challenge_sent"],

		json["when_challenge_accepted"],

		json["result_was_set"], json["when_result_set"], json["result_set_by"],

		json["when_result_accepted"], json["result_accepted_by"],

		json["white"], json["black"], json["result"],
		
		json["type"]
	);
}

/**
 * @brief Parses a JSON string or object and returns a set of Challenge.
 * @param json A JSON string or object with data of several Challenge.
 * @returns An array of Challenge objects.
 */
export function challenge_set_from_json(json: any): Challenge[] {
	if (typeof json === "string") {
		let json_parse = JSON.parse(json);
		return challenge_set_from_json(json_parse);
	}

	let player_set: Challenge[] = [];
	for (var player in json) {
		player_set.push(challenge_from_json(json[player]));
	}
	return player_set;
}
