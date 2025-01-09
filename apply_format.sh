#!/bin/bash

npx prettier --write "src-server/*.ts"
npx prettier --write "src-server/*/*.ts"
npx prettier --write "src-server/*/*/*.ts"

npx prettier --write "src-client/*.ts"
