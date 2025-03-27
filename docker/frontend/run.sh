#!/bin/bash

echo ""
echo "#################################################################################################################"
echo "Starting: $(date +"%d.%m.%Y %r")"
echo ""

cd /app

echo "Installing dependencies"

npm install

echo "Building frontend"

npm run build
