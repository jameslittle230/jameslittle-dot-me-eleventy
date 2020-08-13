#!/usr/bin/env bash

set -euo pipefail
curl --proto '=https' --tlsv1.2 -sSf https://sh.rustup.rs | sh -s -- -y
$HOME/.cargo/bin/cargo install stork-search
ELEVENTY_ENV=production npx @11ty/eleventy --config=eleventy.js
$HOME/.cargo/bin/stork --build _site/stork-posts.toml