#!/bin/bash

### Clean test database

rm -rf test/webpage/*
cp -r webpage-test/* test/webpage/

# these directories may not be created in the 'cp -r' above
mkdir -p test/webpage/databse/challenges
mkdir -p test/webpage/databse/games

mv test/webpage/configuration_test.json test/webpage/configuration.json
