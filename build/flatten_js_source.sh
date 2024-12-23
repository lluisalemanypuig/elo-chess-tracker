#!/bin/bash

cd js-source

mv ts-client/* .
mv ts-server/* .
rmdir ts-server ts-client

cd ..