#!/bin/bash

rm -rf database/*
mkdir -p database/
cp -r database-test/* database/

rm -rf test/database/*
mkdir -p test/database
cp -r database-test/* test/database/
