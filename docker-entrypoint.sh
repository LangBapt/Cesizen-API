#!/bin/sh
set -e

echo "Running Prisma migrations..."
npx prisma migrate deploy   # migrate deploy = applique les migrations sans les créer

echo "Starting API..."
exec node src/index.js