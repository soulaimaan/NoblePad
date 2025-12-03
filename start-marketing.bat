@echo off

:: Create necessary directories
if not exist "logs" mkdir logs
if not exist "public\banners" mkdir public\banners

:: Check if node_modules exists
if not exist "node_modules" (
  echo Installing dependencies...
  call npm install twitter-api-v2 telegraf canvas gradient-string uuid node-schedule pm2
)

:: Check if PM2 is installed
pm2 -v >nul 2>&1
if %ERRORLEVEL% NEQ 0 (
  echo PM2 not found. Installing PM2 globally...
  call npm install -g pm2
)

echo Starting marketing agents...
call pm2 start ecosystem.config.js

:: Save PM2 process list
call pm2 save
call pm2 startup

echo.
echo ✅ Marketing agents started successfully!
echo Check logs with: pm2 logs
echo Stop agents with: pm2 stop all
echo Restart agents with: pm2 restart all

:: Show logs
call pm2 logs --lines 1000
