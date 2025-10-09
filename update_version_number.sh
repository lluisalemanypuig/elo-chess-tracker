#!/bin/bash

sed -i "s/xx.yy/$1/g" src-server/app_router.ts
sed -i "s/20xx.yy.00/20$1.00/g" package.json