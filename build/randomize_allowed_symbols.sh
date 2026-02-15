#!/bin/bash

function escape_string {
	to_escape=$1
	IFS= read -d '' -r < <(sed -e ':a' -e '$!{N;ba' -e '}' -e 's/[&/\]/\\&/g; s/\n/\\&/g' <<<"$to_escape")
	replaceEscaped=${REPLY%$'\n'}
	echo $replaceEscaped
}

allowed_symbols=$(bun build/randomize_allowed_symbols.ts)

randomized_allowed_symbols=$(echo "$allowed_symbols" | jq -r '.randomized_allowed_symbols')

sed -i "s/\$ALLOWED_SYMBOLS_STRING/$(escape_string "$randomized_allowed_symbols")/g" src-server/utils/encrypt.ts

