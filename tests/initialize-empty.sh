#!/bin/bash

rm -rf tests/webpage

mkdir -p tests/webpage/database/challenges
mkdir -p tests/webpage/database/users
mkdir -p tests/webpage/database/games
mkdir -p tests/webpage/database/graphs
mkdir -p tests/webpage/icons
mkdir -p tests/webpage/ssl

echo "
{
    \"username\": \"admin.default\",
    \"ratings\": [],
    \"firstName\": \"Admin\",
    \"lastName\": \"Default\",
    \"password\": {
        \"encrypted\": \"a\",
        \"iv\": \"b\"
    },
    \"roles\": [\"ADMIN\"],
    \"games\": []
}
" > tests/webpage/database/users/admin