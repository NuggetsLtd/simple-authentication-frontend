#!/bin/sh

echo "Running Nuggets Functionality Demp start command in environment: $NODE_ENV"
set -e

if [ "$NODE_ENV" = "development" ] || [ "$NODE_ENV" = "dev" ]; then
  exec /usr/local/bin/yarn run dev
else
  exec /usr/local/bin/yarn run start
fi
