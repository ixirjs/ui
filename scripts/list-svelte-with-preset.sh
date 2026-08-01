#!/usr/bin/env bash
# List all .svelte files in src/lib/components that contain the word "preset"
grep -rlw --include='*.svelte' preset src/lib/components | sort
