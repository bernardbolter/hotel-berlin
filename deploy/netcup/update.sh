#!/usr/bin/env bash
# Pull latest main, rebuild, restart PM2. Run from anywhere:
#   /var/www/hotel-berlin/deploy/netcup/update.sh
set -euo pipefail

ROOT="$(cd "$(dirname "$0")/../.." && pwd)"
cd "$ROOT"

git pull origin main
npm install
npm run build
pm2 restart hotel-berlin

echo "Updated $(git rev-parse --short HEAD)"
