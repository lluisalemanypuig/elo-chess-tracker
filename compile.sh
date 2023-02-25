#!/bin/bash

echo "Make directory database/users"
echo "Make directory database/games"

mkdir -p database/users
mkdir -p database/games

echo "Compiling"

tsc

if [ "$?" == "0" ]; then
    echo "Browserify"
    ./browserify.sh
fi