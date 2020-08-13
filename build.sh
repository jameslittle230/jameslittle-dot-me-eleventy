#!/usr/bin/env bash

set -euo pipefail
curl --proto '=https' --tlsv1.2 -sSf https://sh.rustup.rs | sh
cargo install stork-search
ELEVENTY_ENV=production npx @11ty/eleventy --config=eleventy.js
stork --build _site/stork-posts.toml