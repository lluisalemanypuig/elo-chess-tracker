# Elo chess tracker

A small web page to keep track of Elo ratings of chess players of a club.

## Install

Now follow instructions to explain how to install the webpage.

### Install all dependencies first

Install `nodejs` and `npm` package manager

	$ sudo apt install nodejs
	$ sudo apt install npm
  
Install `typescript` and `ts-node`

	$ sudo npm install -g typescript
	$ sudo npm install -g ts-node

Install [`browserify`](https://browserify.org/)

	$ sudo npm install -g browserify

### Install all packages required to run the website

First, clone this repository and navigate to its directory. For example

	$ cd
	$ git clone git@github.com:lluisalemanypuig/elo-chess-tracker
	$ cd elo-chess-tracker

Then install the required packages with

	$ npm install

### Compile the source code

Run the following command to turn all typescript source files into javascript source files.

	$ ./compile.sh

## Prepare the website

### Initialize the database

First, in the root directory of the repository, first initialize the sample database and system configuration file with the following command

	$ ./initialize.sh

This will generate an empty database with the following pairs of users and passwords:

	Username           | Password                          | Role
	---------------------------------------------------------------------------------
	anatoly.karpov     | "always play king b1"             | Member
	bobby.fischer      | "I hate chess"                    | Member, Student
	emanuel.lasker     | "oh no, my queen"                 | Member, Teacher
	magnus.carlsen     | "it's not playable... for black"  | Member
	mikhail.botvinnik  | "the science of logic"            | Member, Admin
	vasily.smyslov     | "never play f6"                   | Member, Admin, Teacher
	
	
The passwords do not include the quote characters `"`; they are only used here as delimiters. Yes, passwords include spaces. Usernames correspond to famous chess players. Some of the passwords are quotes attributed to their corresponding chess player, other passwords are quotes attributed to different famous chess players.

### Edit the configuration file

Edit the configuration file `system_configuration.json` appropriately. Said file contains the following fields

	{
		"database_base_directory": "$DATABASE_DIRECTORY",
		"rating_system": "Elo",
		"permissions": {
			"admin": [ ],
			"teacher": [ ],
			"member": [ ],
			"student": [ ]
		},
		"ssl_certificate": {
			"directory": "$SSL_CERTIFICATE_DIRECTORY",
			"public_key_file": "$PUBLIC_PEM",
			"private_key_file": "$PRIVATE_PEM",
			"passphrase_file": "$PASSPHRASE_TXT"
		},
		"time_controls": [ ]
	}

#### Directories

If the command abovein the previous section did not fail in any step, the strings headed with `$` should have been replaced with a default value.

- "\$DATABASE_DIRECTORY" is replaced with "\$PWD/database" (where $PWD is the working directory of the command line that executed the script `initialize.sh`). This directory indicates the path to the database root directory. This directory should contain three subfolders (whose name cannot be changed)
	- users
	- games
	- challenges

- "\$SSL_CERTIFICATE_DIRECTORY" is replaced with "\$PWD/certificate"
	
	Indicates the path to the directory that contains the SSL certificate of the webpage. When this field is filled with some value, then the webpage will try to setup the `https` server with the information provided below.
	
- "\$PUBLIC_PEM" is replaced with "public.pem"
	
	Public key file of the certificate
	
- "\$PRIVATE_PEM" is replaced with "private.pem"

    Private key file of the certificate
	
- "\$PASSPHRASE_TXT" is replaced with "passphrase.txt"
	
	Plain text file that contains the certificate's passphrase (if any was specified when creating the certificate)

#### Rating system

This project only implements Elo's rating system (see this section of [lichess](https://lichess.org/page/rating-systems) for further information on rating systems used by chess websites and chess federations).

#### Time controls

This webpage admits an unlimited number of time controls, where each time control has a unique rating associated to it. A time control is identified with an `id` (an arbitrary string, never shown to users), but can have many different names. For example, administrators of the site can configure a *Classical* time control by adding the following text inside `time_controls` field.

	{
		"id": "Classical",
		"name": "Classical (90 + 30)"
	}

Players will have to play their games with time control `90 + 30`. But, optionally, administrators of the site can also add a "faster" classical time control, like so

	{
		"id": "Classical",
		"name": "Classical (90 + 30)"
	},
	{
		"id": "Classical",
		"name": "Classical (30 + 30)"
	}

If two players play two games, first with time control `90 + 30` and immediately afterwards another game with time control `30 + 30` the result of both games will affect the same rating because both time controls are associated to the same `id`, in this case *Classical*.

#### Permissions

The site implements four different roles a user can have. To each role we can associate a series of actions that a user with said role can perform. All roles implemented are

- *admin*
- *member*
- *teacher*
- *student*

Available actions are

- Creation of users:
	- *create_user*
- Creation of games
	- *create_game*: can create a game. This adds a game into the system even if the players involved are not aware of this.

- Edition of users: to be able to edit user's information, except for passwords and ratings.
	- *edit_user*: This first action is necessary for the others to work.
	- *edit_admin*
	- *edit_teacher*
	- *edit_member*
	- *edit_student*

- Edition of a user's game: to change the result of a game.
	- *edit_user_games*: This first action is necessary for the others to work.
	- *edit_admin_games*
	- *edit_teacher_games*
	- *edit_member_games*
	- *edit_student_games*

- Assignment of roles to another user
	- *assign_role_admin*
	- *assign_role_teacher*
	- *assign_role_member*
	- *assign_role_student*

- See another user's games
	- *see_user_games*: This first action is necessary for the others to work.
	- *see_admin_games*
	- *see_teacher_games*
	- *see_member_games*
	- *see_student_games*

- Challenge other users to a game
	- *challenge_user*: This first action is necessary for the others to work.
	- *challenge_admin*
	- *challenge_member*
	- *challenge_teacher*
	- *challenge_student*

## Running the website

Once the configuration file has been properly edited, now we can run the website.

To run the website, use **one** of the following commands (we recommend using the last one)

	$ node ./js-source/app_main.js
	$ DEBUG=ELO_TRACKER:* nodemon ./js-source/app_main.js
	$ DEBUG=ELO_TRACKER:* npm run devstart
	
To access it, open a web browser and type in the following address

### Without SSL certificate

	http://localhost:8080

### With SSL certificate

	https://localhost:8443
