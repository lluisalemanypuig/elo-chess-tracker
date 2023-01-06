#!/bin/bash

browserify js-source/client_login.js > js-source/bdl__client_login.js

browserify js-source/client_main.js > js-source/bdl__client_main.js

browserify js-source/client_user_new.js > js-source/bdl__client_user_new.js
browserify js-source/client_user_edit.js > js-source/bdl__client_user_edit.js

browserify js-source/client_challenges.js > js-source/bdl__client_challenges.js

browserify js-source/client_games_own.js > js-source/bdl__client_games_own.js

browserify js-source/client_ranking.js > js-source/bdl__client_ranking.js