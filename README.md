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

First, in the root directory of the repository, initialize the sample database and system configuration file with the following command

	$ ./initialize.sh

This will prompt you to create a self-signed SSL certificate. Fill in the fields with the appropriate data. The script will set any necessary files in the `configuration.json` file.

The database generated will have the following directory structure:

	webpage
	├── configuration.json
	├── database
	│   ├── challenges
	│   ├── games
	│   └── users
	│       ├── anatoly.karpov
	│       ├── bobby.fischer
	│       ├── emanuel.lasker
	│       ├── magnus.carlsen
	│       ├── mikhail.botvinnik
	│       └── vasily.smyslov
	├── icons
	└── ssl
		├── server.cert
		└── server.key

The directory `webpage` can be renamed with any name. The default users in the database are the following:

	Username           | Password                          | Role
	---------------------------------------------------------------------------------
	anatoly.karpov     | "always play king b1"             | Member
	bobby.fischer      | "I hate chess"                    | Member, Student
	emanuel.lasker     | "oh no, my queen"                 | Member, Teacher
	magnus.carlsen     | "it's not playable... for black"  | Member
	mikhail.botvinnik  | "the science of logic"            | Member, Admin
	vasily.smyslov     | "never play f6"                   | Member, Admin, Teacher
	
The actual passwords do not include the quote characters `"`; they are only used here as delimiters. Yes, passwords include spaces. Usernames correspond to famous chess players. Some of the passwords are quotes attributed to their corresponding chess player, other passwords are quotes attributed to different famous chess players.

### Edit the configuration file

Edit the configuration file `webpage/configuration.json` appropriately. This file contains the following fields

	{
		"ssl_certificate": {
			"public_key_file": "server.cert",
			"private_key_file": "server.key",
			"passphrase_file": ""
		},
		"ports": {
			"http": "8080",
			"https": "8443",
		},
		
		"favicon": "path/to/icon.png",
		"login_page": {
			"title": "My webpage title (login page)",
			"icon": "path/to/icon.png"
		},
		"home_page": {
			"title": "My webpage title (home page)",
			"icon": "path/to/icon.png"
		},
		
		"rating_system": "Elo",
		
		"time_controls": [ ],

		"permissions": {
			"admin": [ ],
			"teacher": [ ],
			"member": [ ],
			"student": [ ]
		}
	}

The configuration file can be edited at any time, even after the website has been used for some time. For the modifications to take effect, the server has to be reset.

#### HTTP and HTTPS ports

These are st by default to `8080` for HTTP and to `8443` for HTTPS. Change them to whichever ports you like if these do not suit your needs. This step is _optional_.

#### Icons and titles

Write the names of the icons and titles of the sections of your webpage:

- `favicon`: this is a small icon (typically, `48x48`) that shows up in the tab of a desktop's internet browser.
- `login_page`: this is the icon that shows up in the login page of your site. The `title` field is the title of login page as well.
- `home_page`: this is the icon that shows up in the home page of your site. The `title` field is the title of home page as well.

#### Rating system

Currently, this project only implements Elo's rating system (see this section of [lichess](https://lichess.org/page/rating-systems) for further information on rating systems used by chess websites and chess federations).

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

#### User permissions

*Note*: the configuration file created by the `initialize.sh` script already provides permissions for each user type. These can be modified at any time.

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

Once the configuration file has been properly edited, now we can run the website. To do so, use **one** of the following commands (we recommend using the last one)

	$ node ./js-source/app_main.js configuration-file /path/to/configuration.json
	$ DEBUG=ELO_TRACKER:* nodemon ./js-source/app_main.js configuration-file /path/to/configuration.json
	$ DEBUG=ELO_TRACKER:* npm run devstart configuration-file /path/to/configuration.json

## Access the website from a local network

### From the localhost

To access the site from the *same* computer the webpage it is running on, open a web browser and type in the address one of the following two options:

	http://localhost:8080
	https://localhost:8443

### From any other machine

To access the webpage from a different machine, one has to first find out the IP address of the machine the webpage is running on. For this, run the command

	$ hostname -I
	
This will output the local IP address. For example,

	192.168.1.76

To access the webpage from a different machine, open a web browser and type in

	https://192.168.1.76:8443

This address is the same for *all* other machines.

## Adding new users

To log into the site for the first time, use a default admin user, such as `mikhail.botvinnik`. Then, create a new admin user. Log out of the website, stop the server process, and then remove the files of the default users. This will leave the site with a single user, the one you have just created.
