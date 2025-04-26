#!/bin/bash

old_str="private static readonly production: boolean = false;"
new_str="private static readonly production: boolean = true;"

if [ "$1" == "from_old_to_new" ]; then
    sed -i "s/$old_str/$new_str/g" src-server/managers/configuration_manager.ts
elif [ "$1" == "from_new_to_old" ]; then
    sed -i "s/$new_str/$old_str/g" src-server/managers/configuration_manager.ts
fi
