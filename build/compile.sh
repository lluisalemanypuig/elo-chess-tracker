#!/bin/bash

echo "Compiling..."
rm -rf js-source
tsc

echo "Flatten js-source directory..."
./build/flatten_js_source.sh

echo "Fix imports..."
./build/fix_imports.sh

if [ "$?" == "0" ]; then
    echo "Browserify..."
    ./build/browserify.sh
fi
