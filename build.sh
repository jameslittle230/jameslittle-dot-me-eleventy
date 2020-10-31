#!/usr/bin/env bash

set -euo pipefail
wget https://github.com/jameslittle230/stork/releases/download/v0.7.4/stork-latest-x86_64-unknown-linux-gnu
chmod +x stork-latest-x86_64-unknown-linux-gnu
ELEVENTY_ENV=production npx @11ty/eleventy --config=eleventy.js
./stork-latest-x86_64-unknown-linux-gnu --build _site/stork-posts.toml