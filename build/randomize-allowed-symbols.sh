#!/bin/bash

function escape_string {
	to_escape=$1
	IFS= read -d '' -r < <(sed -e ':a' -e '$!{N;ba' -e '}' -e 's/[&/\]/\\&/g; s/\n/\\&/g' <<<"$to_escape")
	replaceEscaped=${REPLY%$'\n'}
	echo $replaceEscaped
}

function apply_to_file {

	file=$1
	string_to_replace=$2

	if [ ! -f $file ]; then
		echo "    File '$f' does not exist"
		exit 1
	fi
	if [ -z $string_to_replace ]; then
		echo "No string to replace given for file '$file'"
		exit 1
	fi

	raw_symbols_encrypt=$(bun build/random-symbols.ts)
	symbols_encrypt=$(echo "$raw_symbols_encrypt" | jq -r '.symbols')
	echo "Replacing with symbols: $symbols_encrypt"
	sed -i "s/$string_to_replace/$(escape_string "$symbols_encrypt")/g" $file

}

apply_to_file 'app/client/users-new.ts' '\$ALLOWED_SYMBOLS_RANDOM_PASSWORD'
apply_to_file 'app/server/utils/encrypt.ts' '\$ALLOWED_SYMBOLS_ENCRYPT'
apply_to_file 'app/server/managers/session.ts' '\$ALLOWED_SYMBOLS_COOKIES'
apply_to_file 'app/server/managers/users-manager.ts' '\$ALLOWED_SYMBOLS_PLAYER_PUBLIC_ID'


