#!/bin/bash

function escape_string {
	to_escape=$1
	IFS= read -d '' -r < <(sed -e ':a' -e '$!{N;ba' -e '}' -e 's/[&/\]/\\&/g; s/\n/\\&/g' <<<"$to_escape")
	replaceEscaped=${REPLY%$'\n'}
	echo $replaceEscaped
}

raw_symbols_encrypt=$(bun build/random_symbols.ts)
symbols_encrypt=$(echo "$raw_symbols_encrypt" | jq -r '.symbols')
sed -i "s/\$ALLOWED_SYMBOLS_ENCRYPT/$(escape_string "$symbols_encrypt")/g" app/server/utils/encrypt.ts

raw_symbols_cookies=$(bun build/random_symbols.ts)
symbols_cookies=$(echo "$raw_symbols_cookies" | jq -r '.symbols')
sed -i "s/\$ALLOWED_SYMBOLS_COOKIES/$(escape_string "$symbols_cookies")/g" app/server/managers/session.ts
