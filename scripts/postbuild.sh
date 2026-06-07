#!/usr/bin/env bash
set -euo pipefail

# Ensure publish dir exists
mkdir -p dist/client

# Write a simple fingerprint file into the published output
SHA="$(git rev-parse --short HEAD 2>/dev/null || echo nogit)"
DATE_UTC="$(date -u +%Y-%m-%dT%H:%M:%SZ)"
echo "build=${DATE_UTC} sha=${SHA}" > dist/client/build.txt

# Copy static files needed at the root of the published site
[ -f public/_redirects ] && cp public/_redirects dist/client/_redirects
[ -f public/robots.txt ] && cp public/robots.txt dist/client/robots.txt
[ -f public/sitemap.xml ] && cp public/sitemap.xml dist/client/sitemap.xml

echo "postbuild done:"
ls -la dist/client/build.txt dist/client/robots.txt dist/client/sitemap.xml dist/client/_redirects 2>/dev/null || true
