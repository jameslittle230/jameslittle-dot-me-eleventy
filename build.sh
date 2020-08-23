#!/usr/bin/env bash

set -euo pipefail
wget https://github.com/jameslittle230/stork-gh-actions-tests/releases/download/refs%2Fheads%2Fgithub-action/stork-latest-x86_64-unknown-linux-gnu
ELEVENTY_ENV=production npx @11ty/eleventy --config=eleventy.js
stork-latest-x86_64-unknown-linux-gnu --build _site/stork-posts.toml