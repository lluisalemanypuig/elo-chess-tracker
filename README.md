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

## Run the website

In the root directory of the repository, run one of the following commands

	$ node ./js-source/app_main.js
	$ DEBUG=ELO_TRACKER:* nodemon ./js-source/app_main.js
	$ DEBUG=ELO_TRACKER:* npm run devstart
	
