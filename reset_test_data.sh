#!/bin/bash

### Clean test database

rm -rf test/webpage/*
cp -r webpage-test/* test/webpage/

mv test/webpage/configuration_test.json test/webpage/configuration.json
