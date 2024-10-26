#!/bin/bash

echo "Compiling"

tsc

if [ "$?" == "0" ]; then
    echo "Browserify"
    ./browserify.sh
fi
