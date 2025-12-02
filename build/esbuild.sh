#!/bin/bash

function apply_esbuild() {
    esbuild $1 --bundle --outfile=bdl__$1
}

bun run build/esbuild.ts
