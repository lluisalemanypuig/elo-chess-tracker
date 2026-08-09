#!/bin/bash

echo "Compiling..."
rm -rf js
mkdir -p js

bunx tsc -p tsconfig.build.json

if [ "$?" != "0" ]; then
    echo "Compilation failed"
    exit
fi

echo "Flatten js/ directory..."
./build/flatten-js-source.sh

echo "esbuild..."
./build/esbuild.sh
