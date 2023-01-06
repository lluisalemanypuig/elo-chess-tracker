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

import { encrypt_message, decrypt_message, encrypt_password_for_user, decrypt_password_for_user, is_password_of_user_correct } from "../ts-source/utils/encrypt";
import { interleave_strings } from "../ts-source/utils/misc";
import { assert } from "console";

function Test1() {
	console.log("==========");
	console.log("  Test 1  ");
	console.log("==========");

	let msg = "Hello!";

	let encrypted = encrypt_message(msg, "my password");
	let decrypted = decrypt_message(encrypted, "my password");
	assert(decrypted == msg);

	console.log(encrypted);
}

function Test2() {
	console.log("==========");
	console.log("  Test 2  ");
	console.log("==========");

	let username = [
		"emanuel.lasker",
		"anatoly.karpov",
		"magnus.carlsen",
		"vasily.smyslov",
		"mikhail.botvinnik",
		"bobby.fischer"
	];
	let pwd = "1234";

	for (let i = 0; i < username.length; ++i) {
		let encrypted = encrypt_message(pwd, interleave_strings(username[i], pwd));
		let decrypted = decrypt_message(encrypted, interleave_strings(username[i], pwd));
		assert(decrypted == pwd);

		console.log("-------------------");
		console.log(`Username: ${username[i]}`);
		console.log(`Password: ${encrypted}`)
	}
}

function Test3() {
	console.log("==========");
	console.log("  Test 3  ");
	console.log("==========");

	let passwords = [
		"U2FsdGVkX1+AWZr89LYX0/Xu+71wKTfR7Dxxg8Dy5QM=",
		"U2FsdGVkX1/A1TF8j/tZJhcfpNU4jBEXIYMIQkeKjDI=",
		"U2FsdGVkX1+T4FZoTHBLlBuV/+6bT+nqhKZPrAa7+M4=",
		"U2FsdGVkX1/ljkp7000gnrvc1bqxeoFIkcwjlk9X/xU=",
		"U2FsdGVkX1/d4wY4EhCqVr9Z+FdZ5mZm4Q+CVxgxRA0=",
		"U2FsdGVkX1+4knQ3FqHyZnunUE7FcOKASRwcurIvY+o="
	];
	let username = [
		"emanuel.lasker",
		"anatoly.karpov",
		"magnus.carlsen",
		"vasily.smyslov",
		"mikhail.botvinnik",
		"bobby.fischer"
	];
	
	for (let i = 0; i < username.length; ++i) {
		let decrypted = decrypt_message(passwords[i], interleave_strings(username[i], "1234"));
		
		console.log("-------------------");
		console.log(`Username: ${username[i]}`);
		console.log(`Decrypted: ${decrypted}`)
	}
}

import CryptoJS from 'crypto-js';

function Test4() {
	console.log("==========");
	console.log("  Test 4  ");
	console.log("==========");

	let username = [
		"emanuel.lasker",
		"anatoly.karpov",
		"magnus.carlsen",
		"vasily.smyslov",
		"mikhail.botvinnik",
		"bobby.fischer"
	];
	let password = [
		"oh no, my queen",
		"always play king b1",
		"it's not playable... for black",
		"never play f6",
		"the science of logic",
		"I hate chess"
	];

	for (let i = 0; i < username.length; ++i) {
		console.log("-------------------");
		console.log(`Username: '${username[i]}'`);

		let encrypted = encrypt_password_for_user(username[i], password[i]);
		
		const encrypted_password = encrypted[0];
		const iv = encrypted[1];
		console.log(`Encrypted text: '${encrypted_password}'`);
		console.log(`IV: '${iv}'`);
		
		let decrypted = decrypt_password_for_user(encrypted_password, password[i], iv);
		console.log(`Decrypted: '${decrypted}'`);

		console.log("Is password correct?", is_password_of_user_correct(encrypted_password, username[i], password[i], iv));
	}
}

function Test5() {
	console.log("==========");
	console.log("  Test 5  ");
	console.log("==========");

	let check_password = [
		"",
		"1",
		"12",
		"123",
		"1234",
		"12345",
		"123456",
		"1234567",
		"12345678",
		"123456789",
		"pobr",
		"pobret",
		"pobra"
	];
	
	let encrypted = encrypt_password_for_user("emanuel.lasker", "pobre");
	const encrypted_password = encrypted[0];
	const iv = encrypted[1];
	console.log(`Encrypted text: '${encrypted_password}'`);
	console.log(`IV: '${iv}'`);

	for (let i = 0; i < check_password.length; ++i) {
		console.log("-------------------");
		console.log(`Check password: '${check_password[i]}'`);
		
		console.log("Is password correct?", is_password_of_user_correct(encrypted_password, "emanuel.lasker", check_password[i], iv));
	}
}

Test1();
Test2();
Test3();
Test4();
Test5();
