#!/bin/bash

browserify js-source/client_login.js > js-source/bdl__client_login.js

browserify js-source/client_home.js > js-source/bdl__client_home.js

browserify js-source/client_users_new.js > js-source/bdl__client_users_new.js
browserify js-source/client_users_edit.js > js-source/bdl__client_users_edit.js
browserify js-source/client_users_ranking.js > js-source/bdl__client_users_ranking.js
browserify js-source/client_users_password_change.js > js-source/bdl__client_users_password_change.js

browserify js-source/client_challenges.js > js-source/bdl__client_challenges.js

browserify js-source/client_games_list.js > js-source/bdl__client_games_list.js