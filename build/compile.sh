#!/bin/bash

skip_randomize_allowed_symbols=0
production=0
caching=0

for i in "$@"; do
	case $i in

		--production)
		production=1
		shift
		;;

		--caching)
		caching=1
		shift
		;;

		--skip-randomize-allowed-symbols)
		skip_randomize_allowed_symbols=1
		shift
		;;

	esac
done

echo "Setting configuration variables..."
./build/configuration_variables.sh $production $caching

if [ $skip_randomize_allowed_symbols -eq 0 ]; then
	echo "Setting string for allowed symbols..."
	./build/randomize_allowed_symbols.sh
fi

echo "Compiling..."
mkdir -p js
cd js
rm -rf *
cd ..
bunx tsc

if [ "$?" != "0" ]; then
    echo "Compilation failed"
    exit
fi

echo "Flatten js/ directory..."
./build/flatten_js_source.sh

#echo "Fix imports..."
#./build/fix_imports.sh

echo "esbuild..."
./build/esbuild.sh
