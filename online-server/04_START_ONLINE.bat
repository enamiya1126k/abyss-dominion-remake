@echo off
title ABYSS DOMINION - ONLINE STARTER
cd /d "%~dp0"
where node >nul 2>nul
if errorlevel 1 goto :missing_node
where cloudflared >nul 2>nul
if errorlevel 1 goto :missing_cloudflared
if not exist "node_modules\ws" goto :missing_setup
echo Starting the local party server in a new window...
start "ABYSS PARTY SERVER" cmd /k "npm start"
timeout /t 3 /nobreak >nul
echo.
echo Starting the Cloudflare tunnel.
echo Copy the https://xxxxx.trycloudflare.com URL into the Party screen.
echo Keep this window and the server window open while playing.
echo.
cloudflared tunnel --url http://127.0.0.1:8787
goto :end
:missing_node
echo [ERROR] Node.js was not found. Install the Node.js LTS version.
goto :error
:missing_cloudflared
echo [ERROR] cloudflared was not found. Install it from Cloudflare.
goto :error
:missing_setup
echo [ERROR] First setup has not been completed. Run 01_FIRST_SETUP.bat first.
:error
echo.
pause
exit /b 1
:end
echo.
echo Online sharing has stopped.
pause
