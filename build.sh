#!/usr/bin/env bash

set -euo pipefail
wget https://github.com/jameslittle230/stork/releases/download/v1.1.0/stork-ubuntu-latest
chmod +x stork-latest-x86_64-unknown-linux-gnu
ELEVENTY_ENV=production npx @11ty/eleventy --config=eleventy.js
./stork-latest-x86_64-unknown-linux-gnu --build _site/stork-posts.toml