#!/bin/bash

function do_replace {
    title=$1
    direction=$2
    old_str=$3
    new_str=$4
    whereto=$5
    echo $whereto

    echo "    $title"
    if [ "$direction" == "1" ]; then
        echo "        $new_str"
        sed -i "s/$old_str/$new_str/g" $whereto
    else
        echo "        $old_str"
        sed -i "s/$new_str/$old_str/g" $whereto
    fi
}

configuration_manager="src-server/managers/configuration_manager.ts"

cache_data__old_str="private static readonly cache_data: boolean = false;"
cache_data__new_str="private static readonly cache_data: boolean = true;"

production__old_str="private static readonly production: boolean = false;"
production__new_str="private static readonly production: boolean = true;"

do_replace "Production server"  "$1"    "$production__old_str"  "$production__new_str"  $configuration_manager
do_replace "Data caching"       "$2"    "$cache_data__old_str"  "$cache_data__new_str"  $configuration_manager
