#!/bin/bash

rm -rf database/*
mkdir -p database/
mkdir -p database/users
mkdir -p database/games
mkdir -p database/challenges
cp -r database-test/* database/

rm -rf test/database/*
mkdir -p test/database
mkdir -p test/database/users
mkdir -p test/database/games
mkdir -p test/database/challenges
cp -r database-test/* test/database/

cp system_configuration_sample.json system_configuration.json