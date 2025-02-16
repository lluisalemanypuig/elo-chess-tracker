#!/bin/bash

function apply_browserify() {
    in=$1

    echo "    $1"
    browserify $in > bdl__$1
}

cd js-source


apply_browserify client_utils_version_number.js

apply_browserify client_login.js

apply_browserify client_home.js

apply_browserify client_users_new.js
apply_browserify client_users_edit.js
apply_browserify client_users_ranking.js
apply_browserify client_users_password_change.js

apply_browserify client_challenges.js

apply_browserify client_games_list.js
apply_browserify client_games_create.js

apply_browserify client_graph_display.js

cd ..