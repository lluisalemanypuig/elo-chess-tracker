#!/bin/bash

function apply_esbuild() {
    esbuild $1 --bundle --outfile=bdl__$1
}

cd js

apply_esbuild client_login.js

apply_esbuild client_home.js

apply_esbuild client_users_new.js
apply_esbuild client_users_edit.js
apply_esbuild client_users_ranking.js
apply_esbuild client_users_password_change.js

apply_esbuild client_challenges.js

apply_esbuild client_games_list.js
apply_esbuild client_games_create.js

apply_esbuild client_graph_display.js

cd ..
