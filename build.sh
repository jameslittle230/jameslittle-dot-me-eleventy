#!/usr/bin/env bash

set -euo pipefail
wget https://files.stork-search.net/releases/v1.2.1/stork-ubuntu-16-04
chmod +x stork-ubuntu-16-04
ELEVENTY_ENV=production npx @11ty/eleventy --config=eleventy.js
./stork-ubuntu-16-04 --build _site/stork-posts.toml
