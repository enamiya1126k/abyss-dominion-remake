@echo off
title ABYSS DOMINION - PARTY SERVER
cd /d "%~dp0"
if not exist "node_modules\ws" (
  echo First setup has not been completed. Run 01_FIRST_SETUP.bat first.
  pause
  exit /b 1
)
echo Keep this window open while playing online.
echo.
call npm start
echo.
echo The party server has stopped.
pause
