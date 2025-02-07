#!/bin/bash

cd js-source

browserify client_load_version_number.js > bdl__client_load_version_number.js

browserify client_login.js > bdl__client_login.js

browserify client_home.js > bdl__client_home.js

browserify client_users_new.js > bdl__client_users_new.js
browserify client_users_edit.js > bdl__client_users_edit.js
browserify client_users_ranking.js > bdl__client_users_ranking.js
browserify client_users_password_change.js > bdl__client_users_password_change.js

browserify client_challenges.js > bdl__client_challenges.js

browserify client_games_list.js > bdl__client_games_list.js
browserify client_games_create.js > bdl__client_games_create.js

cd ..