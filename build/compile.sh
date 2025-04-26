#!/bin/bash

production=0
for i in "$@"; do
	case $i in

		--production)
		production=1
		shift
		;;
	esac
done

echo "Setting configuration variables..."
./build/configuration_variables.sh $production

echo "Compiling..."
mkdir -p js
cd js
rm -rf *
cd ..
tsc

if [ "$?" != "0" ]; then
    echo "Compilation failed"
    exit
fi

echo "Flatten js/ directory..."
./build/flatten_js_source.sh

echo "Fix imports..."
./build/fix_imports.sh

echo "esbuild..."
./build/esbuild.sh
