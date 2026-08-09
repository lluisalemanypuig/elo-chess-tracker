#!/bin/bash

cd js

for f in $(ls client_*); do
    echo "    Fix imports for: $f"
    sed -i 's/\.\.\/src-server/\./g' $f
done

cd ..