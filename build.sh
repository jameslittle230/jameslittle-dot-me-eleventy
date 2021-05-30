#!/usr/bin/env bash

set -euo pipefail
wget https://files.stork-search.net/releases/latest/stork-ubuntu-16-04
chmod +x stork-ubuntu-16-04
ELEVENTY_ENV=production npx @11ty/eleventy --config=eleventy.js
./stork-ubuntu-16-04 build -i _site/stork-posts.toml -o _site/stork-posts.st
