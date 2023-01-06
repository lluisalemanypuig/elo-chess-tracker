#!/bin/bash

mkdir -p database/users
mkdir -p database/games

tsc && ./browserify.sh
