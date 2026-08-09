#!/bin/bash

echo "Rendering CSS styles..."
./build/render_styles.sh

randomize_allowed_symbols=0
production=0
caching=0

for i in "$@"; do
	case $i in

		--production)
		production=1
		randomize_allowed_symbols=1
		caching=1
		shift
		;;

	esac
done

echo "Setting configuration variables..."
./build/configuration_variables.sh $production $caching

if [ $randomize_allowed_symbols -eq 1 ]; then
	echo "Setting string for allowed symbols..."
	./build/randomize_allowed_symbols.sh
fi

echo "Compiling front end code into javascript..."
./build/compile_shallow.sh
