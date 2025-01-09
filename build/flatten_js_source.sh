#!/bin/bash

cd js-source

mv src-client/* .
mv src-server/* .
rmdir src-server src-client

cd ..