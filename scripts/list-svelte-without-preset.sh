#!/usr/bin/env bash
# List .svelte files in src/lib/components that do NOT contain the word "preset"
dir="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
comm -23 \
  <(bash "$dir/list-svelte.sh") \
  <(bash "$dir/list-svelte-with-preset.sh")
