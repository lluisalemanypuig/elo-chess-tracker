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

import { date_to_string, string_to_date } from "../ts-source/utils/misc";
import { search, where_should_be_inserted } from "../ts-source/utils/misc";

function Test1() {
    console.log("======");
    console.log("Test 1");
    console.log("======");

    let today: Date = new Date();
    console.log(today);

    console.log(`Year: ${today.getFullYear()}`);
    console.log(`Month: ${today.getMonth()+1}`);
    console.log(`Day: ${today.getDate()}`);
}

function Test2() {
    console.log("======");
    console.log("Test 2");
    console.log("======");

    let date: Date = new Date();
    console.log(date_to_string(date));

    let date2 = new Date(2022, 0, 1);
    console.log(date_to_string(date2));
}

function Test3() {
    console.log("======");
    console.log("Test 3");
    console.log("======");

    console.log("-------");
    let date = string_to_date("2022-12-17..23:23:23");
    console.log(`Year: ${date.getFullYear()}`);
    console.log(`Month: ${date.getMonth()+1}`);
    console.log(`Day: ${date.getDate()}`);
    console.log(date_to_string(date));

    console.log("-------");
    date = string_to_date("2022-12-01..05:45:32");
    console.log(`Year: ${date.getFullYear()}`);
    console.log(`Month: ${date.getMonth()+1}`);
    console.log(`Day: ${date.getDate()}`);
    console.log(date_to_string(date));

    console.log("-------");
    date = string_to_date("2022-01-01..18:30:24");
    console.log(`Year: ${date.getFullYear()}`);
    console.log(`Month: ${date.getMonth()+1}`);
    console.log(`Day: ${date.getDate()}`);
    console.log(date_to_string(date));
}

function Test4() {
    console.log("======");
    console.log("Test 4");
    console.log("======");
    
    console.log("------");
    let arr = [1,2,3,5,6,7];
    console.log(arr);
    for (let i: number = 0; i < 10; ++i) {
        console.log(i, search(arr, i) < arr.length);
    }

    console.log("------");
    arr = [10,30,50,70,90];
    console.log(arr);
    for (let i: number = 1; i < 100; ++i) {
        console.log(i, search(arr, i) < arr.length);
    }
}

function Test5() {
    console.log("======");
    console.log("Test 5");
    console.log("======");
    
    console.log("------");
    let arr = [1,2,3,5,6,7];
    console.log(arr);
    for (let i: number = 0; i <= 10; ++i) {
        console.log(i, where_should_be_inserted(arr, i));
    }

    console.log("------");
    arr = [2,4,6,8];
    console.log(arr);
    for (let i: number = 0; i <= 10; ++i) {
        console.log(i, where_should_be_inserted(arr, i));
    }

    console.log("------");
    arr = [10,30,50,70,90];
    console.log(arr);
    for (let i: number = 0; i <= 100; ++i) {
        console.log(i, where_should_be_inserted(arr, i));
    }
}

Test1();
Test2();
Test3();
Test4();
Test5();
