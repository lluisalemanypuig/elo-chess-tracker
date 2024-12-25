#!/bin/bash

echo "Compiling..."
cd js-source
rm -rf *
cd ..
tsc

if [ "$?" != "0" ]; then
    echo "Compilation failed"
    exit
fi

echo "Flatten js-source directory..."
./build/flatten_js_source.sh

echo "Fix imports..."
./build/fix_imports.sh

if [ "$?" == "0" ]; then
    echo "Browserify..."
    ./build/browserify.sh
fi
