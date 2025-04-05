#!/bin/bash

echo ""
echo "#################################################################################################################"
echo "Starting: $(date +"%d.%m.%Y %r")"
echo ""

cd /app

echo "Installing dependencies"

pip install --no-cache-dir -r requirements.txt

echo "Running emulator"

python emulator.py