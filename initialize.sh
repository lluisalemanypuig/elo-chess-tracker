#!/bin/bash

function escape_string {
	to_escape=$1
	IFS= read -d '' -r < <(sed -e ':a' -e '$!{N;ba' -e '}' -e 's/[&/\]/\\&/g; s/\n/\\&/g' <<<"$to_escape")
	replaceEscaped=${REPLY%$'\n'}
	echo $replaceEscaped
}

### Clean actual database

rm -rf database/*
mkdir -p database/
mkdir -p database/users
mkdir -p database/games
mkdir -p database/challenges
cp -r database-test/* database/

### Clean test database

rm -rf test/database/*
mkdir -p test/database
mkdir -p test/database/users
mkdir -p test/database/games
mkdir -p test/database/challenges
cp -r database-test/* test/database/

### Set system configuration file

cp system_configuration_sample.json system_configuration.json

## database directory

database_directory=$PWD/database
echo "Use database directory: $database_directory"

sed -i "s/\$DATABASE_DIRECTORY/$(escape_string "$database_directory")/g" system_configuration.json

## SSL certificate

# directory

ssl_certificate_directory=$PWD/certificate
echo "Use SSL certificate directory: $ssl_certificate_directory"

sed -i "s/\$SSL_CERTIFICATE_DIRECTORY/$(escape_string "$ssl_certificate_directory")/g" system_configuration.json

# public key file

public_pem=public.pem
echo "Use SSL public PEM file: $public_pem"

sed -i "s/\$PUBLIC_PEM/$(escape_string "$public_pem")/g" system_configuration.json

# private key file

private_pem=private.pem
echo "Use SSL private PEM file: $private_pem"

sed -i "s/\$PRIVATE_PEM/$(escape_string "$private_pem")/g" system_configuration.json

# passphrase file

passphrase_pem=passphrase.txt
echo "Use SSL passphrase TXT file: $passphrase_pem"

sed -i "s/\$PASSPHRASE_TXT/$(escape_string "$passphrase_pem")/g" system_configuration.json
