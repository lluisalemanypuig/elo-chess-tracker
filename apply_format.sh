#!/bin/bash

npx prettier --write "ts-server/*.ts"
npx prettier --write "ts-server/*/*.ts"
npx prettier --write "ts-server/*/*/*.ts"

npx prettier --write "ts-client/*.ts"