#!/bin/bash

function escape_string {
	to_escape=$1
	IFS= read -d '' -r < <(sed -e ':a' -e '$!{N;ba' -e '}' -e 's/[&/\]/\\&/g; s/\n/\\&/g' <<<"$to_escape")
	replaceEscaped=${REPLY%$'\n'}
	echo $replaceEscaped
}

# app/server/utils/encrypt.ts

file='app/server/utils/encrypt.ts'
if [ ! -f $file ]; then
	echo "    File '$f' does not exist"
	exit 1
fi
raw_symbols_encrypt=$(bun build/random-symbols.ts)
symbols_encrypt=$(echo "$raw_symbols_encrypt" | jq -r '.symbols')
echo "Replacing with symbols: $symbols_encrypt"
sed -i "s/\$ALLOWED_SYMBOLS_ENCRYPT/$(escape_string "$symbols_encrypt")/g" $file

# app/server/managers/session.ts

file='app/server/managers/session.ts'
if [ ! -f $file ]; then
	echo "    File '$f' does not exist"
	exit 1
fi
raw_symbols_cookies=$(bun build/random-symbols.ts)
symbols_cookies=$(echo "$raw_symbols_cookies" | jq -r '.symbols')
echo "Replacing with symbols: $symbols_encrypt"
sed -i "s/\$ALLOWED_SYMBOLS_COOKIES/$(escape_string "$symbols_cookies")/g" $file

# app/client/users-new.ts

file='app/client/users-new.ts'
if [ ! -f $file ]; then
	echo "    File '$f' does not exist"
	exit 1
fi
raw_symbols_cookies=$(bun build/random-symbols.ts)
symbols_cookies=$(echo "$raw_symbols_cookies" | jq -r '.symbols')
echo "Replacing with symbols: $symbols_encrypt"
sed -i "s/\$ALLOWED_SYMBOLS_RANDOM_PASSWORD/$(escape_string "$symbols_cookies")/g" $file
