#!/bin/bash

# Create necessary directories
mkdir -p logs
mkdir -p public/banners

# Install dependencies if needed
if [ ! -d "node_modules" ]; then
  echo "Installing dependencies..."
  npm install twitter-api-v2 telegraf canvas gradient-string uuid node-schedule pm2
fi

# Check if PM2 is installed
if ! command -v pm2 &> /dev/null; then
  echo "PM2 not found. Installing PM2 globally..."
  npm install -g pm2
fi

# Start the agents using PM2
echo "Starting marketing agents..."
pm2 start ecosystem.config.js

# Save PM2 process list for automatic startup on reboot
pm2 save
pm2 startup

# Display status
pm2 status

echo "\n✅ Marketing agents started successfully!"
echo "Check logs with: pm2 logs"
echo "Stop agents with: pm2 stop all"
echo "Restart agents with: pm2 restart all"

# Keep the script running
pm2 logs --lines 1000
