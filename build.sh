#!/usr/bin/env bash

set -euo pipefail
wget https://files.stork-search.net/releases/v1.2.0/stork-ubuntu-16-04
chmod +x stork-ubuntu-latest
ELEVENTY_ENV=production npx @11ty/eleventy --config=eleventy.js
./stork-ubuntu-latest --build _site/stork-posts.toml
