# Elo chess tracker

A small web page to keep track of Elo ratings of chess players of a club.

_Note_: versions newer than 24.12 are not compatible with older versions.

## Manual installation

Now follow instructions to explain how to install the webpage.

### Install all dependencies first

You only need to install [`bun`](https://bun.com/): for this, you can follow the [official instructions](https://bun.com/docs/installation) in their webpage. Those instructions are simple enough, simply issue the command

    $ curl -fsSL https://bun.com/install | bash

And that should be enough. Make sure the installation succeeded by running

    $ bun --version

### Install all packages required to run the website

First, clone this repository and navigate to its directory. For example

    $ cd
    $ git clone git@github.com:lluisalemanypuig/elo-chess-tracker
    $ cd elo-chess-tracker

Then install the required packages for `elo-chess-tracker` with

    $ bun install

#### Keeping all packages up to date

In order to update all outdated packages, run the command

    $ bun update

This command needs to be run inside the directory for `elo-chess-tracker`.

### Compile the source code

Run the following command to turn all typescript source files into javascript source files.

    $ build/compile.sh --production

## Prepare the website

### Initialize the database

First, in the root directory of the repository, initialize the sample database and system configuration file with the following command

    $ ./initialize.sh --domain-name=your-domain-name

This will prompt you to create a self-signed SSL certificate. Fill in the fields with the appropriate data. The script will set any necessary files in the [`configuration.json`](webpage-sample/configuration_sampe.json) file.

The database generated will have the following directory structure:

    webpage
    ├── configuration.json
    ├── database
    │   ├── challenges
    │   ├── games
    │   ├── graphs
    │   └── users
    │       └── admin
    ├── icons
    │   ├── favicon.png
    │   ├── home.png
    │   └── login.png
    └── ssl
        ├── server.cert
        └── server.key

The directory `webpage` can be renamed with any name. The default users in the database are the following:

    Username    | Password    | Role
    ---------------------------------
    admin.admin | "123456789" | Admin

The actual passwords do not include the quote characters `"`; they are only used here as delimiters. Yes, passwords may include spaces.

### Edit the configuration file

Edit the configuration file `webpage/configuration.json` appropriately. This file contains the following fields

    {
        "environment": {
            "ssl_certificate": {
                "public_key_file": "server.cert",
                "private_key_file": server.key",
                "passphrase_file": ""
            },
            "favicon": "favicon.png",
            "login_page": {
                "title": "Login into My Chess Club",
                "icon": "login.png"
            },
            "home_page": {
                "title": "My Chess Club",
                "icon": "home.png"
            }
        },

    	"server": {
            "domain_name": "coolclub.com",
    	    "ports": {
        		"http": "8080",
    		    "https": "8443"
    	    }
        },

    	"rating_system": "Elo",

    	"time_controls": [ ],

        "behavior": {
            "challenges": {
                "higher_rated_player_can_decline_challenge_from_lower_rated_player": false
            }
        },

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

- `favicon`: this is a small icon (typically, `48x48`) that shows up in the tab of a desktop's internet browser.
- `login_page`: this is the icon that shows up in the login page of your site. The `title` field is the title of login page as well.
- `home_page`: this is the icon that shows up in the home page of your site. The `title` field is the title of home page as well.

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

- _admin_
- _member_
- _teacher_
- _student_

Available actions are

- Creation of users:
    - _create_user_

- Assignment of roles to another user
    - _assign_role_admin_
    - _assign_role_teacher_
    - _assign_role_member_
    - _assign_role_student_

- Edition of users: to be able to edit user's information, except for passwords and ratings.
    - _edit_admin_
    - _edit_teacher_
    - _edit_member_
    - _edit_student_

- Creation of games: to be able to create games between pairs of players. This is restricted to players of specific roles.
    - _create_games_admin_
    - _create_games_teacher_
    - _create_games_member_
    - _create_games_student_

- Edition of a user's game: to change the result of a game.
    - _edit_games_admin_
    - _edit_games_teacher_
    - _edit_games_member_
    - _edit_games_student_

- See another user's games.
    - _see_games_admin_
    - _see_games_teacher_
    - _see_games_member_
    - _see_games_student_

- Challenge other users to a game.
    - _challenge_admin_
    - _challenge_member_
    - _challenge_teacher_
    - _challenge_student_

## Running the website

Once the configuration file has been properly edited, now we can run the website. To do so, use **one** of the following commands (we recommend using the second)

    $ bun start    configuration-file /path/to/configuration.json
    $ bun devstart configuration-file /path/to/configuration.json

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

To log into the site for the first time, use the default admin user `admin`. Its password is `admin`. Then, create a new "Admin" user with a different username and password. Give that user a proper first and last names. Then, log out of the website, stop the server process, and then remove the `admin` file from the database. This will leave the site with a single user, the one you have just created.
