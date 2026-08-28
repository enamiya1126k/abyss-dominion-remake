@echo off
setlocal EnableExtensions DisableDelayedExpansion
title ABYSS DOMINION - ONLINE STARTER
cd /d "%~dp0"
where node >nul 2>nul
if errorlevel 1 goto :missing_node
if not exist "node_modules\ws" goto :missing_setup
if exist "fixed-tunnel-domain.txt" goto :check_fixed_tunnel
where cloudflared >nul 2>nul
if errorlevel 1 goto :missing_cloudflared
goto :start_server
:check_fixed_tunnel
where ngrok >nul 2>nul
if errorlevel 1 goto :missing_ngrok
set "FIXED_DOMAIN="
set /p "FIXED_DOMAIN="<"fixed-tunnel-domain.txt"
if not defined FIXED_DOMAIN goto :invalid_fixed_domain
set "ABYSS_FIXED_DOMAIN_INPUT=%FIXED_DOMAIN%"
powershell -NoProfile -Command "$d=$env:ABYSS_FIXED_DOMAIN_INPUT; if($d -match '^[a-z0-9](?:[a-z0-9.-]*[a-z0-9])?$'){exit 0}else{exit 1}" >nul 2>nul
if errorlevel 1 goto :invalid_fixed_domain
:start_server
echo Starting the local party server in a new window...
start "ABYSS PARTY SERVER" cmd /k "npm start"
timeout /t 3 /nobreak >nul
if exist "fixed-tunnel-domain.txt" goto :fixed_tunnel
echo.
echo Starting the Cloudflare Quick Tunnel.
echo Copy the https://xxxxx.trycloudflare.com URL into the Party screen.
echo To keep the same URL, run 05_SETUP_FIXED_URL.bat once.
echo Keep this window and the server window open while playing.
echo.
cloudflared tunnel --url http://127.0.0.1:8787
goto :end
:fixed_tunnel
echo.
echo Starting the fixed ngrok tunnel.
echo Fixed server URL: https://%FIXED_DOMAIN%
echo The Party screen remembers this URL after the first connection.
echo Keep this window and the server window open while playing.
echo.
ngrok http 8787 --url "https://%FIXED_DOMAIN%"
goto :end
:missing_node
echo [ERROR] Node.js was not found. Install the Node.js LTS version.
goto :error
:missing_cloudflared
echo [ERROR] cloudflared was not found. Install it from Cloudflare.
goto :error
:missing_ngrok
echo [ERROR] ngrok was not found. Run 05_SETUP_FIXED_URL.bat again.
goto :error
:invalid_fixed_domain
echo [ERROR] fixed-tunnel-domain.txt is empty or invalid.
echo Run 05_SETUP_FIXED_URL.bat again.
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
