/*
Elo rating for a Chess Club
Copyright (C) 2023 - 2024  Lluís Alemany Puig

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

/**
 * @brief A password.
 *
 * It consists of a pair of strings: the actual encrypted password
 * and the initialization vector 'iv'.
 */
export class Password {
    /// Encrypted password
    public readonly encrypted: string;
    /// Initialization vector of AES
    public readonly iv: string;

    constructor(password: string, iv: string) {
        this.encrypted = password;
        this.iv = iv;
    }

    clone(): Password {
        return new Password(this.encrypted, this.iv);
    }
}

/**
 * @brief Parses a JSON string or object and returns a Password.
 * @param json A JSON string or object with data of a Password.
 * @returns A new Password object.
 * @pre If @e json is a string then it cannot start with '['.
 */
export function password_from_json(json: any): Password {
    if (typeof json === 'string') {
        let json_parse = JSON.parse(json);
        return password_from_json(json_parse);
    }
    return new Password(json['encrypted'], json['iv']);
}

/**
 * @brief Parses a JSON string or object and returns a set of Password.
 * @param json A JSON string or object with data of several Password.
 * @returns An array of Password objects.
 */
export function password_set_from_json(json: any): Password[] {
    if (typeof json === 'string') {
        let json_parse = JSON.parse(json);
        return password_set_from_json(json_parse);
    }

    let player_set: Password[] = [];
    for (var player in json) {
        player_set.push(password_from_json(json[player]));
    }
    return player_set;
}
