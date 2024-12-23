#!/bin/bash

### Clean test database

rm -rf test/webpage/*
cp -r webpage-sample/* test/webpage/

# these directories may not be created in the 'cp -r' above
mkdir -p test/webpage/database/challenges
mkdir -p test/webpage/database/games

mv test/webpage/configuration_sample.json test/webpage/configuration.json
