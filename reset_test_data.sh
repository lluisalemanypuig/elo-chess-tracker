#!/bin/bash

### Clean test database

rm -rf test/database/*
mkdir -p test/database
mkdir -p test/database/users
mkdir -p test/database/games
mkdir -p test/database/challenges
cp -r database-test/* test/database/

