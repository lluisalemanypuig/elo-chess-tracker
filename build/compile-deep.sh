#!/bin/bash

echo "Compiling..."
rm -rf js-full
mkdir -p js

bunx tsc -p tsconfig.json

