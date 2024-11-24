#!/bin/bash

npx prettier --write "ts-source/*.ts"
npx prettier --write "ts-source/*/*.ts"
npx prettier --write "ts-source/*/*/*.ts"