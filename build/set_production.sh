#!/bin/bash

old_str="private static readonly production: boolean = false;"
new_str="private static readonly production: boolean = true;"

sed -i "s/$old_str/$new_str/g" src-server/managers/configuration_manager.ts
