#!/bin/bash

echo "    Production server"
if [ "$1" == "1" ]; then
    echo "        From old to new"
    ./build/configuration_variables/set_production.sh from_old_to_new
else
    echo "        From new to old"
    ./build/configuration_variables/set_production.sh from_new_to_old
fi