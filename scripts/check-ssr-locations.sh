#!/usr/bin/env bash
set -euo pipefail

BASE_URL="${1:-http://127.0.0.1:3000}"

curl -s "$BASE_URL/locations/wolverhampton" | grep -q 'animate-spin' && { echo "spinner found on /locations"; exit 1; } || echo "ok /locations"
curl -s "$BASE_URL/locations/wolverhampton/house-removals" | grep -q 'animate-spin' && { echo "spinner found on /locations/:service"; exit 1; } || echo "ok /locations/:service"
