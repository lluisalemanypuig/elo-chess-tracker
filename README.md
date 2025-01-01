# Elo chess tracker

A small web page to keep track of Elo ratings of chess players of a club.

_Note_: versions newer than 24.12 are not compatible with older versions.

## Install

Now follow instructions to explain how to install the webpage.

### Install all dependencies first

-   `nodejs` and `npm`

    -   _Option 1_: via `apt`

            $ sudo apt install npm
            $ sudo apt install nodejs

    -   _Option 2_: via `nvm`

        As explained in [this Stack Overflow answer](https://stackoverflow.com/questions/76421238/tsc-command-showing-syntaxerror-unexpected-token/76842486#76842486) install first `nvm`

            $ curl -o- https://raw.githubusercontent.com/nvm-sh/nvm/v0.40.1/install.sh | bash

        and then install `nodejs` using `nvm`. The version to install has to be `14.17` or newer [as per the TypeScript documentation](https://www.typescriptlang.org/docs/handbook/release-notes/typescript-5-1.html#breaking-changes). The list of versions available can be checked with the command

            $ nvm ls-remote

        To install version `v22.12.0` (which is an LTS version), run the following command

            $ nvm install 22.12.0

        This command will install `nodejs` automatically.

    To check what version of `nvm` you have installed on your system run the command

        $ nvm list

    This shows that multiple versions of `nvm` can be installed in the system.

    To check what version of `npm` you have installed on your system, run the command

        $ npm --version

-   `typescript`. You may need superuser privileges (`sudo`) to install it.

        $ npm install -g typescript

-   `ts-node`. You may need superuser privileges (`sudo`) to install it.

        $ npm install -g ts-node

-   [`browserify`](https://browserify.org/). You may need superuser privileges (`sudo`) to install it.

        $ npm install -g browserify

### Install all packages required to run the website

First, clone this repository and navigate to its directory. For example

    $ cd
    $ git clone git@github.com:lluisalemanypuig/elo-chess-tracker
    $ cd elo-chess-tracker

Then install the required packages for `elo-chess-tracker` with

    $ npm install

#### Keeping all packages up to date

The packages installed in the commands above are surely going to be updated regularly. To check which need to be updated run

    $ npm outdated

In order to update all outdated packages, run the command

    $ npm update

This command needs not be run inside the directory for `elo-chess-tracker`.

### Compile the source code

Run the following command to turn all typescript source files into javascript source files.

    $ build/compile.sh

## Prepare the website

### Initialize the database

First, in the root directory of the repository, initialize the sample database and system configuration file with the following command

    $ ./initialize.sh

This will prompt you to create a self-signed SSL certificate. Fill in the fields with the appropriate data. The script will set any necessary files in the [`configuration.json`](webpage-sample/configuration_sampe.json) file.

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
    │   ├── favicon.png
    │   ├── home.png
    │   └── login.png
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
    		"https": "8443"
    	},

    	"favicon": "favicon.png",
    	"login_page": {
    		"title": "Login into My Chess Club",
    		"icon": "login.png"
    	},
    	"home_page": {
    		"title": "My Chess Club",
    		"icon": "home.png"
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

These are st by default to `8080` for HTTP and to `8443` for HTTPS. Change them to whichever ports you like if these do not suit your needs. This step is _optional_, and so you can leave the default port configuration as is.

#### Icons and titles

Write the names of the icons and titles of the sections of your webpage:

-   `favicon`: this is a small icon (typically, `48x48`) that shows up in the tab of a desktop's internet browser.
-   `login_page`: this is the icon that shows up in the login page of your site. The `title` field is the title of login page as well.
-   `home_page`: this is the icon that shows up in the home page of your site. The `title` field is the title of home page as well.

#### Rating system

Currently, this project only implements Elo's rating system (see this section of [lichess](https://lichess.org/page/rating-systems) for further information on rating systems used by chess websites and chess federations).

#### Time controls

This webpage admits an unlimited number of time controls, where each time control has a unique rating associated to it. A time control is identified with an `id` (an arbitrary string, never shown to users), but can have many different names. For example, administrators of the site can configure a _Classical_ time control by adding the following text inside `time_controls` field.

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

If two players play two games, first with time control `90 + 30` and immediately afterwards another game with time control `30 + 30` the result of both games will affect the same rating because both time controls are associated to the same `id`, in this case _Classical_.

#### User permissions

_Note_: the configuration file created by the `initialize.sh` script already provides permissions for each user type. These can be modified at any time.

The site implements four different roles a user can have. To each role we can associate a series of actions that a user with said role can perform. All roles implemented are

-   _admin_
-   _member_
-   _teacher_
-   _student_

Available actions are

-   Creation of users:

    -   _create_user_

-   Creation of games

    -   _create_game_: can create a game. This adds a game into the system even if the players involved are not aware of this.

-   Edition of users: to be able to edit user's information, except for passwords and ratings.

    -   _edit_user_: This first action is necessary for the others to work.
    -   _edit_admin_
    -   _edit_teacher_
    -   _edit_member_
    -   _edit_student_

-   Edition of a user's game: to change the result of a game.

    -   _edit_user_games_: This first action is necessary for the others to work.
    -   _edit_admin_games_
    -   _edit_teacher_games_
    -   _edit_member_games_
    -   _edit_student_games_

-   Assignment of roles to another user

    -   _assign_role_user_: This first action is necessary for the others to work.
    -   _assign_role_admin_
    -   _assign_role_teacher_
    -   _assign_role_member_
    -   _assign_role_student_

-   See another user's games

    -   _see_user_games_: This first action is necessary for the others to work.
    -   _see_admin_games_
    -   _see_teacher_games_
    -   _see_member_games_
    -   _see_student_games_

-   Challenge other users to a game

    -   _challenge_user_: This first action is necessary for the others to work.
    -   _challenge_admin_
    -   _challenge_member_
    -   _challenge_teacher_
    -   _challenge_student_

## Running the website

Once the configuration file has been properly edited, now we can run the website. To do so, use **one** of the following commands (we recommend using the last one)

    $ node ./js-source/app_main.js configuration-file /path/to/configuration.json
    $ DEBUG=ELO_TRACKER:* nodemon ./js-source/app_main.js configuration-file /path/to/configuration.json
    $ DEBUG=ELO_TRACKER:* npm run devstart configuration-file /path/to/configuration.json

## Access the website from a local network

### From the localhost

To access the site from the _same_ computer the webpage it is running on, open a web browser and type in the address one of the following two options:

    http://localhost:8080
    https://localhost:8443

The `8080` and `8443` are the default ports. Change them here if you changed them in the `configuration.json` file.

### From any other machine

To access the webpage from a different machine, one has to first find out the IP address of the machine the webpage is running on. For this, run the command

    $ hostname -I

This will output the local IP address. For example,

    192.168.1.76

To access the webpage from a different machine, open a web browser and type in

    https://192.168.1.76:8443

This address is the same for _all_ other machines. Remember to use the right https port you set in the `configuration.json` file.

## Adding new users

To log into the site for the first time, use a default admin user, such as `mikhail.botvinnik`. Then, create a new admin user. Log out of the website, stop the server process, and then remove the files of the default users. This will leave the site with a single user, the one you have just created.
