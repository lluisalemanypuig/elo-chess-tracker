#!/bin/bash

function escape_string {
	to_escape=$1
	IFS= read -d '' -r < <(sed -e ':a' -e '$!{N;ba' -e '}' -e 's/[&/\]/\\&/g; s/\n/\\&/g' <<<"$to_escape")
	replaceEscaped=${REPLY%$'\n'}
	echo $replaceEscaped
}

function configure_ssl_certificate {
	cd webpage/ssl
	
	# First create the certificate. This prompts the user!
	openssl req -nodes -new -x509 -keyout server.key -out server.cert -days 365
	
	cd ..
	
	# now replace the appropriate fields in the configuration file
	sed -i "s/\$PUBLIC_PEM/$(escape_string "server.cert")/g" configuration.json
	sed -i "s/\$PRIVATE_PEM/$(escape_string "server.key")/g" configuration.json
	sed -i "s/\$PASSPHRASE_TXT/$(escape_string "")/g" configuration.json
	
	cd ..
}

## Initialize the webpage configuration files with some preconfigured users

rm -rf webpage/
cp -r webpage-sample/ webpage/
mkdir webpage/database/challenges
mkdir webpage/database/games
mkdir webpage/ssl
mkdir webpage/icons
mv webpage/configuration_sample.json configuration.json

configure_ssl_certificate
