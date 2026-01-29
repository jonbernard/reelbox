#!/bin/sh
set -e
export PATH="/app/tools/node_modules/.bin:$PATH"
echo "Running database migrations..."
prisma migrate deploy
echo "Migrations complete."
echo "Starting import in background..."
tsx scripts/import.ts &
export HOSTNAME=0.0.0.0
exec "$@"
