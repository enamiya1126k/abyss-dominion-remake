@echo off
title ABYSS DOMINION - FIRST SETUP
cd /d "%~dp0"
echo.
echo  ==============================================
echo   ABYSS DOMINION ONLINE - FIRST SETUP
echo  ==============================================
echo.
where node >nul 2>nul
if errorlevel 1 (
  echo [ERROR] Node.js was not found.
  echo Install the LTS version from https://nodejs.org/ and run this file again.
  echo.
  pause
  exit /b 1
)
echo Node.js:
node --version
echo.
echo Installing server dependencies...
call npm ci --omit=dev
if errorlevel 1 (
  echo.
  echo [FAILED] Check the internet connection and run this file again.
  pause
  exit /b 1
)
echo.
echo [DONE] From now on, double-click 04_START_ONLINE.bat to play online.
pause
