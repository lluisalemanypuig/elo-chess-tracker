#!/bin/bash

./build/render_styles.sh

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

./build/shallow_compile.sh
