#!/bin/bash

function escape_string {
	to_escape=$1
	IFS= read -d '' -r < <(sed -e ':a' -e '$!{N;ba' -e '}' -e 's/[&/\]/\\&/g; s/\n/\\&/g' <<<"$to_escape")
	replaceEscaped=${REPLY%$'\n'}
	echo $replaceEscaped
}

function configure_ssl_certificate {
	echo "Generating SSL certificate..."

	cd webpage/ssl
	
	# First create the certificate. This prompts the user!
	openssl req -nodes -new -x509 -keyout $server_key_filename -out $server_certificate_filename -days 365
	
	cd ..
	
	# now replace the appropriate fields in the configuration file
	sed -i "s/\$PUBLIC_PEM/$(escape_string "$server_certificate_filename")/g" configuration.json
	sed -i "s/\$PRIVATE_PEM/$(escape_string "$server_key_filename")/g" configuration.json
	sed -i "s/\$PASSPHRASE_TXT/$(escape_string "")/g" configuration.json
	sed -i "s/\$DOMAIN_NAME/$(escape_string "$domain_name")/g" configuration.json

	cd ..
}

function generate_admin_password {
	echo "Encrypting admin's password..."

	make_password_result=$(bun utils/make_password_for_user.ts --admin-username $admin_username --admin-password $admin_password)

	encrypted_admin_password=$(echo "$make_password_result" | jq -r '.admin_password')
	encrypted_admin_iv=$(echo "$make_password_result" | jq -r '.admin_iv')

	# now replace the appropriate fields in the file for the admin user
	cd webpage/database/users
	
	sed -i "s/\$USERNAME/$(escape_string "$admin_username")/g" admin
	sed -i "s/\$FIRSTNAME/$(escape_string "$admin_firstname")/g" admin
	sed -i "s/\$LASTNAME/$(escape_string "$admin_lastname")/g" admin
	sed -i "s/\$PASSWORD/$(escape_string "$encrypted_admin_password")/g" admin
	sed -i "s/\$IV/$(escape_string "$encrypted_admin_iv")/g" admin

	cd ../../..
}

domain_name="localhost:8443"

admin_username="admin.admin"
admin_firstname="Admin"
admin_lastname="Admin"
admin_password="123456789"

server_key_filename="server.key"
server_certificate_filename="server.cert"

for i in "$@"; do
	case $i in

		--domain-name=*)
		domain_name="${i#*=}"
		shift
		;;

		--admin-username=*)
		admin_username="${i#*=}"
		shift
		;;

		--admin-firstname=*)
		admin_firstname="${i#*=}"
		shift
		;;

		--admin-lastname=*)
		admin_lastname="${i#*=}"
		shift
		;;

		--admin-password=*)
		admin_password="${i#*=}"
		shift
		;;

		--server-key-filename=*)
		server_key_filename="${i#*=}"
		shift
		;;

		--server-certificate-filename=*)
		server_certificate_filename="${i#*=}"
		shift
		;;
	esac
done

## Initialize the webpage configuration files with some preconfigured users

rm -rf webpage/
cp -r webpage-sample/ webpage/
mkdir webpage/database/challenges
mkdir webpage/database/games
mkdir webpage/database/graphs
mkdir webpage/ssl
mkdir webpage/icons
mv webpage/configuration_sample.json webpage/configuration.json

configure_ssl_certificate
generate_admin_password