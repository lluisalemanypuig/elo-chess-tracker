#!/bin/bash

params="--no-source-map --update"

function apply() {
    echo $1
    
    stat1=""
    if [ ! -f css/$1.css ]; then
        stat1=""
    else
        stat1=$(stat css/$1.css | grep "Modify")
    fi

    npx sass $params css/$1.scss css/$1.css

    stat2=$(stat css/$1.css | grep "Modify")
    if [ "$stat1" != "$stat2" ]; then
        echo "    Regenerated 'css/$1.css'. Postprocess..."
        python3 build/render_styles_prune_main.py css/$1.css
    fi
}

set -e

echo "main"
npx sass $params css/main.scss css/main.css

apply buttons
apply challenges
apply footers
apply graphs
apply home
apply inputs
apply labels
apply selects
apply tables
apply titles