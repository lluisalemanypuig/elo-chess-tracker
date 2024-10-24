#!/bin/bash

### Clean test database

rm -rf test/webpage/database/*
mkdir -p test/webpage/database
mkdir -p test/webpage/database/users
mkdir -p test/webpage/database/games
mkdir -p test/webpage/database/challenges
cp -r webpage-test/database/* test/webpage/database/

